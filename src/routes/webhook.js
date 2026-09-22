const express = require('express');
const router = express.Router();

const { client, config, line } = require('../services/lineClient');
const { askLLM } = require('../services/llm');
const { addSubscriber, removeSubscriber, getLang, setLang } = require('../services/subscribers');
const { checkZodiacClash } = require('../services/zodiac');
const { buildAppContext } = require('../services/knowledge');
const { nearbyTemples } = require('../services/places');
const { getTransitDirections } = require('../services/transit');
const {
  buildWelcomeFlex,
  buildFestivalFlex,
  buildActivitiesFlex,
  buildFortuneFlex,
  buildTempleCarouselFlex,
  buildZodiacFlex,
  getStandardQuickReplies
} = require('../services/flexMessages');
const { subscribeToTemple, unsubscribeFromTemple } = require('../services/templeSubscriptions');
const { recordPledge } = require('../services/donations');
const { getDb, updateDb } = require('../services/db');
const { getHistory, addMessage } = require('../services/conversationMemory');

const festivals = require('../data/festivals.json');
const temples = require('../data/temples.json');
const fortunes = require('../data/fortunes.json');
const templePosts = require('../data/temple-posts.json');

const LIFF_ID = process.env.LIFF_ID || 'YOUR_LIFF_ID';
const LIFF_URL = `https://liff.line.me/${LIFF_ID}`;

const hasLineSecret = Boolean(config.channelSecret);
const webhookMiddleware = hasLineSecret ? line.middleware(config) : express.json();
if (!hasLineSecret) {
  console.warn('[webhook] LINE_CHANNEL_SECRET not set — signature verification is OFF (dev only).');
}

router.post('/', webhookMiddleware, async (req, res) => {
  res.sendStatus(200);
  try {
    await Promise.all((req.body.events || []).map(handleEvent));
  } catch (err) {
    console.error('[webhook] error handling event:', err);
  }
});

const STRINGS = {
  zh: {
    langSwitched: '好的，之後我會用中文回覆你 🙏',
    fortuneHint: '請跟我說您今天想請示神明什麼事情呢？（例如：求事業、求感情、求健康、求考運）',
    nearbyHint: '點選上方「+」按鈕分享位置，或直接點選按鈕查看附近宮廟 ⛩️',
    taisuiAskYear: '跟我說你的西元出生年份就可以幫你查囉，例如：「太歲 1998」',
    locationNoResults: '這附近暫時沒有找到宮廟資料耶，可以換個位置再試試看 🙏',
    locationHeader: '幫你找到附近的宮廟囉 ⛩️',
    locationError: '找附近宮廟時卡了一下，可以再試一次嗎 🙏',
    deityLabel: '主祀',
    subscribeAskName: '跟我說要訂閱哪間廟，例如：「訂閱 萬春宮」\n\n目前可訂閱：' + temples.map((t) => t.name).join('、'),
    subscribeNotFound: '找不到這間廟耶，目前可訂閱：' + temples.map((t) => t.name).join('、'),
    subscribeDone: (name) => `好的，已幫你訂閱「${name}」，之後有新活動或樂捐消息我會通知你 🔔`,
    unsubscribeDone: (name) => `已取消訂閱「${name}」`,
    donateUsage: '請跟我說要捐款的廟和金額，例如：「捐款 萬春宮 500」',
    donateTempleNotFound: '找不到這間廟耶，目前可捐款：' + temples.map((t) => t.name).join('、'),
    donateThanks: (temple, amount) => `感謝您對「${temple}」的樂捐 NT$${amount.toLocaleString()}，您的心意神明都知道 🙏（此為展示用途，未實際收款）`
  },
  en: {
    langSwitched: "Got it, I'll reply in English from now on 🙏",
    fortuneHint: 'What topic would you like to ask the deities today? (e.g. Career, Romance, Health, Studies)',
    nearbyHint: 'Share your location via LINE "+" menu or tap below to find nearby temples ⛩️',
    taisuiAskYear: 'Tell me your birth year (e.g. "zodiac 1998") and I\'ll check it for you',
    locationNoResults: "Couldn't find any temples near that location — maybe try a different spot 🙏",
    locationHeader: 'Found some nearby temples for you ⛩️',
    locationError: 'Had trouble looking up nearby temples, mind trying again? 🙏',
    deityLabel: 'Deity',
    subscribeAskName: 'Tell me which temple to subscribe to, e.g. "subscribe Wanchun"\n\nAvailable: ' + temples.map((t) => t.nameEn || t.name).join(', '),
    subscribeNotFound: "Couldn't find that temple. Available: " + temples.map((t) => t.nameEn || t.name).join(', '),
    subscribeDone: (name) => `Subscribed to "${name}" — I'll notify you about new activities or donation campaigns 🔔`,
    unsubscribeDone: (name) => `Unsubscribed from "${name}"`,
    donateUsage: 'Tell me the temple and amount, e.g. "donate Wanchun 500"',
    donateTempleNotFound: "Couldn't find that temple. Available: " + temples.map((t) => t.nameEn || t.name).join(', '),
    donateThanks: (temple, amount) => `Thank you for your donation of NT$${amount.toLocaleString()} to "${temple}" 🙏 (demo only, no real payment was made)`
  }
};

function t(lang, key, ...args) {
  const val = (STRINGS[lang] || STRINGS.zh)[key];
  return typeof val === 'function' ? val(...args) : val;
}

function detectLang(text) {
  const stripped = text.replace(/[\s0-9\p{Emoji_Presentation}\p{P}]/gu, '');
  if (!stripped) return null;
  const cjkCount = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cjkCount / stripped.length > 0.3) return 'zh';
  if (/^[a-zA-Z]+$/.test(stripped)) return 'en';
  return null;
}

function langInstruction(lang) {
  return lang === 'en'
    ? '\n\n[The user prefers replies in English by default — reply in English unless their message is clearly in another language.]'
    : '\n\n[使用者偏好中文回覆，除非使用者這則訊息明顯是用其他語言寫的，否則請用中文回覆。]';
}

function findTempleByName(query) {
  const q = query.trim().toLowerCase();
  return temples.find(
    (t) => t.name.includes(query.trim()) || (t.nameEn && t.nameEn.toLowerCase().includes(q))
  );
}

// In-LINE Chat Divination Execution Helper
async function performInLineDivination(userId, question, lang, event) {
  // Draw random fortune
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  const context = `籤詩編號 ${fortune.id}（${fortune.grade}）：「${fortune.poem}」\n主題：${fortune.theme}\n一般解釋：${fortune.notes}`;
  
  const history = getHistory(userId);
  const userMsg = question || (lang === 'en' ? 'What does this divine poem indicate for me?' : '請幫我解釋這支籤對於我問的事情有什麼指引？');
  
  const interpretation = await askLLM({
    userMessage: userMsg,
    context,
    language: lang === 'en' ? 'en' : 'zh-TW',
    history
  });

  // Persist to draw history
  updateDb((db) => {
    if (!db.drawHistory) db.drawHistory = [];
    db.drawHistory.push({
      userId,
      fortuneId: fortune.id,
      question: question || '一般開示',
      reply: interpretation,
      createdAt: new Date().toISOString()
    });
  });

  const flex = buildFortuneFlex(lang, fortune, interpretation, LIFF_URL);
  const isEn = lang === 'en';
  const headerText = isEn
    ? `🙏 Sacred Coin Toss: [Divine Approval]! Drawn Stick #${fortune.id}:`
    : `🙏 擲筊結果：【聖筊】！為您求得第 ${fortune.id} 籤：`;

  return reply(
    event.replyToken,
    [
      { type: 'text', text: headerText },
      flex
    ],
    userId,
    lang
  );
}

async function handleEvent(event) {
  if (event.type === 'follow') {
    addSubscriber(event.source.userId);
    const lang = getLang(event.source.userId);
    return reply(
      event.replyToken,
      [
        buildWelcomeFlex(lang, LIFF_URL),
        {
          type: 'text',
          text: lang === 'en' ? 'Want to switch language anytime? Just type "English" or "中文".' : '想切換語言的話，隨時點選選單或輸入「中文」/「English」喔'
        }
      ],
      event.source.userId,
      lang
    );
  }

  if (event.type === 'unfollow') {
    removeSubscriber(event.source.userId);
    return;
  }

  if (event.type !== 'message') return;
  const userId = event.source.userId;

  // Native LINE Location Share
  if (event.message.type === 'location') {
    const lang = getLang(userId);
    const { latitude, longitude } = event.message;
    try {
      const results = await nearbyTemples(latitude, longitude, 5);
      if (!results.length) {
        return reply(event.replyToken, [{ type: 'text', text: t(lang, 'locationNoResults') }], userId, lang);
      }
      return reply(
        event.replyToken,
        [
          { type: 'text', text: `${t(lang, 'locationHeader')} (${results.length} 間)` },
          buildTempleCarouselFlex(lang, results, LIFF_URL)
        ],
        userId,
        lang
      );
    } catch (err) {
      console.error('[webhook] location lookup failed:', err.message);
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'locationError') }], userId, lang);
    }
  }

  if (event.message.type !== 'text') return;

  const text = event.message.text.trim();

  // Explicit Language Switch
  if (/^中文$/i.test(text) || /^(chinese|zh)$/i.test(text)) {
    setLang(userId, 'zh');
    return reply(event.replyToken, [{ type: 'text', text: t('zh', 'langSwitched') }], userId, 'zh');
  }
  if (/^english$/i.test(text) || /^en$/i.test(text)) {
    setLang(userId, 'en');
    return reply(event.replyToken, [{ type: 'text', text: t('en', 'langSwitched') }], userId, 'en');
  }

  const detected = detectLang(text);
  const lang = detected || getLang(userId);
  if (detected && detected !== getLang(userId)) setLang(userId, detected);

  // Check active Divination Session
  const db = getDb();
  const session = db.divinationSessions?.[userId];
  if (session && session.step === 'awaiting_question') {
    // Clear session
    updateDb((db) => {
      delete db.divinationSessions[userId];
    });
    return performInLineDivination(userId, text, lang, event);
  }

  // Divination Command Handling
  if (/^(求籤|抽籤|解籤|fortune)\b/i.test(text)) {
    const queryPart = text.replace(/^(求籤|抽籤|解籤|fortune)\b/i, '').trim();
    if (queryPart.length > 0) {
      // Immediate divination with query
      return performInLineDivination(userId, queryPart, lang, event);
    }
    // Set interactive prompt state
    updateDb((db) => {
      if (!db.divinationSessions) db.divinationSessions = {};
      db.divinationSessions[userId] = { step: 'awaiting_question', createdAt: Date.now() };
    });

    const isEn = lang === 'en';
    const promptMsg = isEn
      ? '🔮 Please type the question or topic you wish to ask the deities (e.g., "Career prospects this year" or "Relationships"):'
      : '🔮 請問您今天想向神明請示什麼事情呢？請直接輸入您的問題（例如：「今年的工作發展」、「感情運勢」）：';

    const customQuickReplies = {
      items: [
        { type: 'action', action: { type: 'message', label: isEn ? '💼 Career' : '💼 求事業發展', text: isEn ? 'Career prospects' : '求事業發展' } },
        { type: 'action', action: { type: 'message', label: isEn ? '💕 Romance' : '💕 求感情運勢', text: isEn ? 'Romance' : '求感情運勢' } },
        { type: 'action', action: { type: 'message', label: isEn ? '🌿 Health' : '🌿 求身體健康', text: isEn ? 'Health' : '求身體健康' } },
        { type: 'action', action: { type: 'message', label: isEn ? '📖 Exam' : '📖 求考試學業', text: isEn ? 'Exams' : '求考試學業' } }
      ]
    };

    return reply(event.replyToken, [{ type: 'text', text: promptMsg, quickReply: customQuickReplies }], userId, lang);
  }

  // Nearby Temples Command
  if (/附近|怎麼去|交通|公車|火車|捷運|nearby|transit|bus|train/i.test(text)) {
    const sampleTemples = temples.slice(0, 5).map((t) => ({ ...t, distanceKm: (Math.random() * 1.5 + 0.3).toFixed(1) }));
    return reply(
      event.replyToken,
      [
        { type: 'text', text: t(lang, 'nearbyHint') },
        buildTempleCarouselFlex(lang, sampleTemples, LIFF_URL)
      ],
      userId,
      lang
    );
  }

  // Festivals Command
  if (/節慶|festival/i.test(text)) {
    const upcoming = festivals
      .map((f) => ({ ...f, daysAway: Math.round((new Date(f.date2026) - new Date()) / 86400000) }))
      .filter((f) => f.daysAway >= 0)
      .sort((a, b) => a.daysAway - b.daysAway);
    return reply(event.replyToken, [buildFestivalFlex(lang, upcoming)], userId, lang);
  }

  // Activities Command
  if (/最新消息|公告|活動|廟會|activit(y|ies)/i.test(text)) {
    return reply(event.replyToken, [buildActivitiesFlex(lang, templePosts, temples)], userId, lang);
  }

  // Zodiac Taisui Check
  if (/太歲|沖煞|生肖|zodiac/i.test(text)) {
    const yearMatch = text.match(/(19|20)\d{2}/);
    if (!yearMatch) {
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'taisuiAskYear') }], userId, lang);
    }
    const birthYear = Number(yearMatch[0]);
    const result = checkZodiacClash(birthYear);
    const context = `生肖太歲查詢結果：出生年 ${result.birthYear}（生肖：${result.userAnimal}），今年 ${result.checkYear}（生肖：${result.yearAnimal}）。是否犯太歲：${result.isClashing ? '是，類型為「' + result.clashType + '」' : '否'}。今年所有犯太歲生肖：${result.allClashesThisYear.map((c) => `${c.animal}(${c.type})`).join('、')}。`;
    const aiMessage = await askLLM({
      userMessage:
        (result.isClashing
          ? '請用溫暖口氣跟我解釋今年犯太歲的意思，並給一些安太歲/點光明燈的建議，簡短一點。'
          : '請用溫暖口氣告訴我今年沒有犯太歲，但仍可以說些新年祝福的話，簡短一點。') + langInstruction(lang),
      context
    });
    return reply(event.replyToken, [buildZodiacFlex(lang, result, aiMessage)], userId, lang);
  }

  // Subscribe Command
  if (/^(訂閱|subscribe)\b/i.test(text)) {
    const nameQuery = text.replace(/^(訂閱|subscribe)\b/i, '').trim();
    if (!nameQuery) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeAskName') }], userId, lang);
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeNotFound') }], userId, lang);
    subscribeToTemple(userId, temple.id);
    return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeDone', lang === 'en' ? temple.nameEn || temple.name : temple.name) }], userId, lang);
  }

  if (/^(取消訂閱|unsubscribe)\b/i.test(text)) {
    const nameQuery = text.replace(/^(取消訂閱|unsubscribe)\b/i, '').trim();
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeNotFound') }], userId, lang);
    unsubscribeFromTemple(userId, temple.id);
    return reply(event.replyToken, [{ type: 'text', text: t(lang, 'unsubscribeDone', lang === 'en' ? temple.nameEn || temple.name : temple.name) }], userId, lang);
  }

  // Donate Command
  if (/^(捐款|樂捐|donate|donation)\b/i.test(text)) {
    const rest = text.replace(/^(捐款|樂捐|donate|donation)\b/i, '').trim();
    const amountMatch = rest.match(/(\d+)/);
    const nameQuery = rest.replace(/(\d+)/, '').trim();
    if (!amountMatch || !nameQuery) {
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'donateUsage') }], userId, lang);
    }
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'donateTempleNotFound') }], userId, lang);
    const amount = Number(amountMatch[1]);
    recordPledge({ userId, templeId: temple.id, amount });
    return reply(
      event.replyToken,
      [{ type: 'text', text: t(lang, 'donateThanks', lang === 'en' ? temple.nameEn || temple.name : temple.name, amount) }],
      userId,
      lang
    );
  }

  // Multi-Turn AI General Q&A
  addMessage(userId, 'user', text);
  const history = getHistory(userId);
  const answer = await askLLM({
    userMessage: text + langInstruction(lang),
    context: buildAppContext(),
    language: lang === 'en' ? 'en' : 'zh-TW',
    history
  });
  addMessage(userId, 'model', answer);

  return reply(event.replyToken, [{ type: 'text', text: answer }], userId, lang);
}

async function reply(replyToken, messages, fallbackUserId, lang = 'zh') {
  // Attach default Quick Replies to the last message if not explicitly defined
  if (Array.isArray(messages) && messages.length > 0) {
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && !lastMsg.quickReply) {
      lastMsg.quickReply = getStandardQuickReplies(lang, LIFF_URL);
    }
  }

  try {
    return await client.replyMessage({ replyToken, messages });
  } catch (err) {
    console.error('[webhook] replyMessage failed, falling back to push:', err.message);
    if (fallbackUserId) {
      try {
        await client.pushMessage({ to: fallbackUserId, messages });
      } catch (pushErr) {
        console.error('[webhook] pushMessage fallback also failed:', pushErr.message);
      }
    }
  }
}

module.exports = router;