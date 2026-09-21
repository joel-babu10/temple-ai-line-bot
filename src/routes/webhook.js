const express = require('express');
const router = express.Router();

const { client, config, line } = require('../services/lineClient');
const { askLLM } = require('../services/llm');
const { addSubscriber, removeSubscriber, getLang, setLang } = require('../services/subscribers');
const { checkZodiacClash } = require('../services/zodiac');
const { buildAppContext } = require('../services/knowledge');
const { nearbyTemples } = require('../services/places');
const { getTransitDirections } = require('../services/transit');
const { buildWelcomeFlex, buildFestivalFlex, buildActivitiesFlex } = require('../services/flexMessages');
const { subscribeToTemple, unsubscribeFromTemple, getUserTempleSubs } = require('../services/templeSubscriptions');
const { recordPledge } = require('../services/donations');
const festivals = require('../data/festivals.json');
const temples = require('../data/temples.json');
const templePosts = require('../data/temple-posts.json');

const LIFF_ID = process.env.LIFF_ID || 'YOUR_LIFF_ID';
const LIFF_URL = `https://liff.line.me/${LIFF_ID}`;

// line.middleware() verifies the LINE signature and needs a real channel secret,
// so it can't be constructed until one is configured. Falls back to a raw JSON
// body parser locally so `npm run dev` works before you've filled in .env —
// signature verification only actually runs once LINE_CHANNEL_SECRET is set.
const hasLineSecret = Boolean(config.channelSecret);
const webhookMiddleware = hasLineSecret ? line.middleware(config) : express.json();
if (!hasLineSecret) {
  console.warn('[webhook] LINE_CHANNEL_SECRET not set — signature verification is OFF (dev only).');
}

router.post('/', webhookMiddleware, async (req, res) => {
  // Reply to LINE's webhook POST immediately — LINE just needs a fast 200, and making it
  // wait for our own reply/AI call to finish is what risks the replyToken expiring.
  res.sendStatus(200);
  try {
    await Promise.all((req.body.events || []).map(handleEvent));
  } catch (err) {
    console.error('[webhook] error handling event:', err);
  }
});

const LANG_QUICK_REPLY = {
  items: [
    { type: 'action', action: { type: 'message', label: '中文', text: '中文' } },
    { type: 'action', action: { type: 'message', label: 'English', text: 'English' } }
  ]
};

// Bilingual copy for the handful of rule-based (non-AI) replies, keyed by lang.
const STRINGS = {
  zh: {
    langSwitched: '好的，之後我會用中文回覆你 🙏',
    fortuneHint: '點下面連結，點一炷香、擲筊、抽籤，我會幫你解籤 🙏',
    nearbyHint: '直接用 LINE 的「+」分享你的位置給我，或打開這個頁面分享位置，我幫你找附近的廟，還有公車/火車怎麼去 🚌',
    taisuiAskYear: '跟我說你的西元出生年份就可以幫你查囉，例如：「太歲 1998」',
    locationNoResults: '這附近暫時沒有找到宮廟資料耶，可以換個位置再試試看 🙏',
    locationHeader: '幫你找到附近的宮廟囉 ⛩️',
    locationTransitPrefix: '最近的',
    locationTransitSuffix: '交通建議：',
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
    fortuneHint: 'Tap the link below to light incense, toss the divination blocks, and draw a fortune stick 🙏',
    nearbyHint: 'Share your location with me directly via LINE\'s "+" menu, or open this page — I\'ll find nearby temples and how to get there by bus/train 🚌',
    taisuiAskYear: 'Tell me your birth year (e.g. "zodiac 1998") and I\'ll check it for you',
    locationNoResults: "Couldn't find any temples near that location — maybe try a different spot 🙏",
    locationHeader: 'Found some nearby temples for you ⛩️',
    locationTransitPrefix: 'Getting to',
    locationTransitSuffix: 'by transit:',
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

// Rough language auto-detection from the message itself — CJK characters means Chinese,
// otherwise treat as English. Short/ambiguous messages (emoji, numbers only) return null
// so we fall back to the user's last known preference instead of guessing wrong.
function detectLang(text) {
  const stripped = text.replace(/[\s0-9\p{Emoji_Presentation}\p{P}]/gu, '');
  if (!stripped) return null;
  const cjkCount = (stripped.match(/[\u4e00-\u9fff]/g) || []).length;
  if (cjkCount / stripped.length > 0.3) return 'zh';
  if (/^[a-zA-Z]+$/.test(stripped)) return 'en';
  return null;
}

// Appended to LLM calls so free-form replies follow the user's chosen language by default,
// while still letting the model switch naturally if the user's own message is in another language.
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

async function handleEvent(event) {
  if (event.type === 'follow') {
    addSubscriber(event.source.userId);
    const lang = getLang(event.source.userId);
    return reply(event.replyToken, [
      buildWelcomeFlex(lang, LIFF_URL),
      {
        type: 'text',
        text: lang === 'en' ? 'Want to switch language anytime? Just type "English" or "中文".' : '想切換語言的話，隨時輸入「中文」或「English」都可以喔',
        quickReply: LANG_QUICK_REPLY
      }
    ]);
  }

  if (event.type === 'unfollow') {
    removeSubscriber(event.source.userId);
    return;
  }

  if (event.type !== 'message') return;
  const userId = event.source.userId;

  // Native LINE location share (the map-card "Location" message type, distinct from the
  // LIFF page's own geolocation flow) — previously silently ignored entirely.
  if (event.message.type === 'location') {
    const lang = getLang(userId);
    const { latitude, longitude } = event.message;
    try {
      const results = await nearbyTemples(latitude, longitude, 3);
      if (!results.length) {
        return reply(event.replyToken, [{ type: 'text', text: t(lang, 'locationNoResults') }], userId);
      }

      const lines = results.map(
        (r, i) => `${i + 1}. ${r.name} (~${r.distanceKm} km)${r.deity ? `\n   ${t(lang, 'deityLabel')}: ${r.deity}` : ''}`
      );
      const nearest = results[0];
      let transitLine = '';
      if (nearest.id) {
        try {
          const transit = await getTransitDirections(latitude, longitude, nearest.id);
          transitLine = `\n\n${t(lang, 'locationTransitPrefix')} "${nearest.name}" ${t(lang, 'locationTransitSuffix')}\n${transit.summary}`;
        } catch (e) {
          // transit lookup is a bonus, not worth failing the whole reply over
        }
      }

      return reply(
        event.replyToken,
        [{ type: 'text', text: `${t(lang, 'locationHeader')}\n\n${lines.join('\n')}${transitLine}` }],
        userId
      );
    } catch (err) {
      console.error('[webhook] location lookup failed:', err.message);
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'locationError') }], userId);
    }
  }

  if (event.message.type !== 'text') return;

  const text = event.message.text.trim();

  // Explicit language switch, works anytime, not just at first follow.
  if (/^中文$/i.test(text) || /^(chinese|zh)$/i.test(text)) {
    setLang(userId, 'zh');
    return reply(event.replyToken, [{ type: 'text', text: t('zh', 'langSwitched') }], userId);
  }
  if (/^english$/i.test(text) || /^en$/i.test(text)) {
    setLang(userId, 'en');
    return reply(event.replyToken, [{ type: 'text', text: t('en', 'langSwitched') }], userId);
  }

  // Auto-detect language from the message itself; only overrides the stored preference
  // when detection is confident, and keeps it in sync for future messages/notifications.
  const detected = detectLang(text);
  const lang = detected || getLang(userId);
  if (detected && detected !== getLang(userId)) setLang(userId, detected);

  if (/求籤|抽籤|解籤|fortune/i.test(text)) {
    return reply(event.replyToken, [
      { type: 'text', text: t(lang, 'fortuneHint') },
      { type: 'text', text: LIFF_URL }
    ]);
  }

  if (/附近|怎麼去|交通|公車|火車|捷運|nearby|transit|bus|train/i.test(text)) {
    return reply(event.replyToken, [
      { type: 'text', text: t(lang, 'nearbyHint') },
      { type: 'text', text: LIFF_URL }
    ]);
  }

  if (/節慶|festival/i.test(text)) {
    const upcoming = festivals
      .map((f) => ({ ...f, daysAway: Math.round((new Date(f.date2026) - new Date()) / 86400000) }))
      .filter((f) => f.daysAway >= 0)
      .sort((a, b) => a.daysAway - b.daysAway);
    return reply(event.replyToken, [buildFestivalFlex(lang, upcoming)], userId);
  }

  if (/最新消息|公告|活動|廟會|activit(y|ies)/i.test(text)) {
    return reply(event.replyToken, [buildActivitiesFlex(lang, templePosts, temples)], userId);
  }

  if (/太歲|沖煞|生肖|zodiac/i.test(text)) {
    const yearMatch = text.match(/(19|20)\d{2}/);
    if (!yearMatch) {
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'taisuiAskYear') }]);
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
    return reply(event.replyToken, [{ type: 'text', text: aiMessage }], userId);
  }

  // 訂閱 <temple> / subscribe <temple> — follow a specific temple for its activity/donation pushes.
  if (/^(訂閱|subscribe)\b/i.test(text)) {
    const nameQuery = text.replace(/^(訂閱|subscribe)\b/i, '').trim();
    if (!nameQuery) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeAskName') }], userId);
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeNotFound') }], userId);
    subscribeToTemple(userId, temple.id);
    return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeDone', lang === 'en' ? temple.nameEn || temple.name : temple.name) }], userId);
  }

  if (/^(取消訂閱|unsubscribe)\b/i.test(text)) {
    const nameQuery = text.replace(/^(取消訂閱|unsubscribe)\b/i, '').trim();
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'subscribeNotFound') }], userId);
    unsubscribeFromTemple(userId, temple.id);
    return reply(event.replyToken, [{ type: 'text', text: t(lang, 'unsubscribeDone', lang === 'en' ? temple.nameEn || temple.name : temple.name) }], userId);
  }

  // 捐款 <temple> <amount> / donate <temple> <amount> — mocked pledge, no real payment.
  if (/^(捐款|樂捐|donate|donation)\b/i.test(text)) {
    const rest = text.replace(/^(捐款|樂捐|donate|donation)\b/i, '').trim();
    const amountMatch = rest.match(/(\d+)/);
    const nameQuery = rest.replace(/(\d+)/, '').trim();
    if (!amountMatch || !nameQuery) {
      return reply(event.replyToken, [{ type: 'text', text: t(lang, 'donateUsage') }], userId);
    }
    const temple = findTempleByName(nameQuery);
    if (!temple) return reply(event.replyToken, [{ type: 'text', text: t(lang, 'donateTempleNotFound') }], userId);
    const amount = Number(amountMatch[1]);
    recordPledge({ userId, templeId: temple.id, amount });
    return reply(
      event.replyToken,
      [{ type: 'text', text: t(lang, 'donateThanks', lang === 'en' ? temple.nameEn || temple.name : temple.name, amount) }],
      userId
    );
  }

  // Fall through to general Q&A grounded in the full app knowledge base (temples, customs, features).
  const answer = await askLLM({ userMessage: text + langInstruction(lang), context: buildAppContext() });
  return reply(event.replyToken, [{ type: 'text', text: answer }], userId);
}

async function reply(replyToken, messages, fallbackUserId) {
  try {
    return await client.replyMessage({ replyToken, messages });
  } catch (err) {
    // replyToken expires ~1 minute after the event and can only be used once — a slow AI call
    // (or a cold Render instance waking up) can easily burn through that window. Falling back to
    // pushMessage means the user still gets an answer instead of silence.
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