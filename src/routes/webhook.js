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
  buildCleanMenuFlex,
  buildFestivalFlex,
  buildActivitiesFlex,
  buildFortuneFlex,
  buildTempleCarouselFlex,
  buildZodiacFlex,
  buildDailyWisdomFlex,
  buildDonationsFlex,
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
    taisuiAskYear: '跟我說你的西元出生年份就可以幫你查囉，例如：「太歲 1998」',
    locationNoResults: '這附近暫時沒有找到宮廟資料耶，可以換個位置再試試看 🙏',
    locationHeader: '幫你找到附近的宮廟囉 ⛩️',
    locationError: '找附近宮廟時卡了一下，可以再試一次嗎 🙏',
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
    taisuiAskYear: 'Tell me your birth year (e.g. "zodiac 1998") and I\'ll check it for you',
    locationNoResults: "Couldn't find any temples near that location — maybe try a different spot 🙏",
    locationHeader: 'Found some nearby temples for you ⛩️',
    locationError: 'Had trouble looking up nearby temples, mind trying again? 🙏',
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

// In-LINE Divination Exec
async function performInLineDivination(userId, question, lang, event) {
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  const isEn = lang === 'en';
  const fortuneGrade = isEn ? (fortune.gradeEn || fortune.grade) : fortune.grade;
  const fortunePoem = isEn ? (fortune.poemEn || fortune.poem) : fortune.poem;
  const fortuneTheme = isEn ? (fortune.themeEn || fortune.theme) : fortune.theme;
  const fortuneNotes = isEn ? (fortune.notesEn || fortune.notes) : fortune.notes;

  const context = isEn
    ? `Fortune Stick #${fortune.id} (${fortuneGrade}): "${fortunePoem}"\nTheme: ${fortuneTheme}\nGuidance Notes: ${fortuneNotes}`
    : `籤詩編號 ${fortune.id}（${fortune.grade}）：「${fortune.poem}」\n主題：${fortune.theme}\n一般解釋：${fortune.notes}`;
  
  const history = getHistory(userId);
  const userMsg = question || (isEn ? 'What does this divine poem indicate for my topic?' : '請幫我解釋這支籤對於我問的事情有什麼指引？');
  
  const interpretation = await askLLM({
    userMessage: userMsg,
    context,
    language: lang === 'en' ? 'en' : 'zh-TW',
    history
  });

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
    const welcomeText = lang === 'en'
      ? "Hi there! I'm Flame (焰寶) 🐾 Warm welcome!\n\nYou can chat with me naturally about anything, or type numbers 1-6 for quick services:\n\n1. Draw Fortune\n2. Nearby Temples\n3. Zodiac Check\n4. Festivals\n5. Open Web App\n6. Menu"
      : "你好呀！我是焰寶 🐾 很高興認識你！\n\n你可以隨時像朋友一樣跟我聊天，也可以輸入數字 1~6 或點選下方快捷選單喔：\n\n1. 🔮 線上求籤\n2. ⛩️ 附近宮廟與交通\n3. 🎐 生肖太歲查詢\n4. 🏮 宮廟節慶提醒\n5. 📱 開啟 Web 參拜 App\n6. ☰ 服務選單卡";

    return reply(
      event.replyToken,
      [{ type: 'text', text: welcomeText }],
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

  // Voice Note Audio Message Handler
  if (event.message.type === 'audio') {
    const lang = getLang(userId);
    const voiceMsg = lang === 'en'
      ? "🎙️ Received your voice prayer! Flame (焰寶) has conveyed your heartfelt wish to the deities. May peace and joy follow you always 🙏"
      : "🎙️ 收到您的語音祈福囉！焰寶已幫您將心願轉達神明，願神明保佑您平安順遂、萬事如意 🙏";
    return reply(event.replyToken, [{ type: 'text', text: voiceMsg }], userId, lang);
  }

  if (event.message.type !== 'text') return;

  const text = event.message.text.trim();

  // Greetings: "hai", "hi", "hello", "hey", "start" -> Auto-set English and show Rich Menu Flex Card!
  if (/^(hai|hi|hello|hey|start)$/i.test(text)) {
    setLang(userId, 'en');
    const welcomeMsg = "Hi there! Welcome to Flame AI Shrine Master 🐾\n\nI am your smart temple companion. Feel free to chat naturally, or select a service option from the card below:";
    return reply(
      event.replyToken,
      [
        { type: 'text', text: welcomeMsg },
        buildCleanMenuFlex('en', LIFF_URL)
      ],
      userId,
      'en'
    );
  }

  // Language Switcher
  if (/^中文$/i.test(text) || /^(chinese|zh)$/i.test(text)) {
    setLang(userId, 'zh');
    return reply(event.replyToken, [{ type: 'text', text: t('zh', 'langSwitched') }], userId, 'zh');
  }
  if (/^english$/i.test(text) || /^en$/i.test(text)) {
    setLang(userId, 'en');
    return reply(event.replyToken, [{ type: 'text', text: t('en', 'langSwitched') }], userId, 'en');
  }

  // Sticky language resolution:
  // If user is stored as 'en', maintain 'en' unless they explicitly type '中文'/'zh' or send long CJK sentences (> 6 CJK chars).
  // If user is stored as 'zh', switch to 'en' if detectLang finds pure English.
  const currentLang = getLang(userId);
  let lang = currentLang;

  const detected = detectLang(text);
  if (detected === 'en' && currentLang !== 'en') {
    setLang(userId, 'en');
    lang = 'en';
  } else if (detected === 'zh' && currentLang === 'en') {
    // Only switch EN users to ZH if the message has 6+ CJK characters (not just a short button label)
    const cjkCount = (text.match(/[\u4e00-\u9fff]/g) || []).length;
    if (cjkCount >= 6) {
      setLang(userId, 'zh');
      lang = 'zh';
    }
  }

  // Check active Divination Session
  const db = getDb();
  const session = db.divinationSessions?.[userId];
  if (session && session.step === 'awaiting_question') {
    updateDb((db) => {
      delete db.divinationSessions[userId];
    });
    return performInLineDivination(userId, text, lang, event);
  }

  // Banking-Bot Style Numeric & Keyword Command Shortcuts
  // 1 or 求籤 -> Divination
  if (text === '1' || /^(求籤|抽籤|解籤|fortune)\b/i.test(text) || /^(career|romance|health|exam) fortune/i.test(text)) {
    const queryPart = text.replace(/^(求籤|抽籤|解籤|fortune)\b/i, '').replace(/ fortune$/i, '').trim();
    if (queryPart.length > 0 && text !== '1') {
      return performInLineDivination(userId, queryPart, lang, event);
    }
    updateDb((db) => {
      if (!db.divinationSessions) db.divinationSessions = {};
      db.divinationSessions[userId] = { step: 'awaiting_question', createdAt: Date.now() };
    });

    const isEn = lang === 'en';
    const promptMsg = isEn
      ? '🔮 Please type the topic or question you wish to ask the deities (e.g. "Career" or "Romance"):'
      : '🔮 請問您今天想向神明請示什麼事情呢？請直接回覆問題（例如：「求事業運勢」、「求感情發展」）：';

    return reply(
      event.replyToken,
      [
        {
          type: 'text',
          text: promptMsg,
          quickReply: {
            items: [
              { type: 'action', action: { type: 'message', label: isEn ? '💼 Career' : '💼 求事業運勢', text: isEn ? 'Career fortune' : '求事業運勢' } },
              { type: 'action', action: { type: 'message', label: isEn ? '💕 Romance' : '💕 求感情發展', text: isEn ? 'Romance fortune' : '求感情發展' } },
              { type: 'action', action: { type: 'message', label: isEn ? '🌿 Health' : '🌿 求身體健康', text: isEn ? 'Health fortune' : '求身體健康' } },
              { type: 'action', action: { type: 'message', label: isEn ? '📖 Exam' : '📖 求考試學業', text: isEn ? 'Exam fortune' : '求考試學業' } }
            ]
          }
        }
      ],
      userId,
      lang
    );
  }

  // 2 or 附近 -> Nearby Temples
  if (text === '2' || /附近|怎麼去|交通|公車|火車|捷運|nearby|transit|bus|train/i.test(text)) {
    const sampleTemples = temples.slice(0, 5).map((t) => ({ ...t, distanceKm: (Math.random() * 1.5 + 0.3).toFixed(1) }));
    return reply(
      event.replyToken,
      [
        { type: 'text', text: lang === 'en' ? 'Here are nearby temples and directions:' : '幫您找到附近的宮廟列表：' },
        buildTempleCarouselFlex(lang, sampleTemples, LIFF_URL)
      ],
      userId,
      lang
    );
  }

  // 3 or 太歲 -> Zodiac Check
  if (text === '3' || /太歲|沖煞|生肖|zodiac/i.test(text)) {
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

  // 4 or 節慶 -> Festival Reminders
  if (text === '4' || /節慶|festival/i.test(text)) {
    const upcoming = festivals
      .map((f) => ({ ...f, daysAway: Math.round((new Date(f.date2026) - new Date()) / 86400000) }))
      .filter((f) => f.daysAway >= 0)
      .sort((a, b) => a.daysAway - b.daysAway);
    return reply(event.replyToken, [buildFestivalFlex(lang, upcoming)], userId, lang);
  }

  // 5 or liff or web -> Open Web App Link
  if (text === '5' || /^liff$/i.test(text) || /^web$/i.test(text) || /開啟 web/i.test(text)) {
    const linkMsg = lang === 'en'
      ? `📱 Tap here to open the full Web App experience (Incense Lighting, Altar, Community & Donations):\n\n${LIFF_URL}`
      : `📱 點擊下方連結開啟完整的線上參拜 Web App（包含點香敬拜、擲筊、社群與樂捐）：\n\n${LIFF_URL}`;
    return reply(event.replyToken, [{ type: 'text', text: linkMsg }], userId, lang);
  }

  // 6 or 選單 or menu -> Show Menu Flex Card
  if (text === '6' || /^選單$/i.test(text) || /^menu$/i.test(text) || /^help$/i.test(text) || /建議|suggestion/i.test(text)) {
    return reply(event.replyToken, [buildCleanMenuFlex(lang, LIFF_URL)], userId, lang);
  }

  // 7 or 神諭 or oracle or blessing -> Daily Wisdom Blessing Card
  if (text === '7' || /神諭|賜福|每日靈籤|oracle|blessing/i.test(text)) {
    return reply(event.replyToken, [buildDailyWisdomFlex(lang, LIFF_URL)], userId, lang);
  }

  // 8 or 公益 or 專案 or welfare -> Temple Donations & Community Welfare Card
  if (text === '8' || /公益|專案|樂捐列表|welfare/i.test(text)) {
    return reply(event.replyToken, [buildDonationsFlex(lang, LIFF_URL)], userId, lang);
  }

  // 訂閱 / 取消訂閱 / 捐款 Commands
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

  // Freeform Chat using Multi-Turn Gemini AI
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