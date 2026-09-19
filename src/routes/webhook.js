const express = require('express');
const router = express.Router();

const { client, config, line } = require('../services/lineClient');
const { askLLM } = require('../services/llm');
const { addSubscriber, removeSubscriber } = require('../services/subscribers');
const { checkZodiacClash } = require('../services/zodiac');
const { buildAppContext } = require('../services/knowledge');

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

async function handleEvent(event) {
  if (event.type === 'follow') {
    addSubscriber(event.source.userId);
    return reply(event.replyToken, [
      {
        type: 'text',
        text:
          '歡迎光臨🙏 我是廟公 AI，可以幫你：\n' +
          '・求籤解籤（輸入「求籤」）\n' +
          '・找附近宮廟＆公車/火車怎麼去（輸入「附近宮廟」）\n' +
          '・查今年犯太歲嗎（輸入「太歲 1998」，用你的出生年份）\n' +
          '・廟宇小知識、拜拜禁忌（直接問我就好）\n' +
          '節慶提醒我也會主動通知你，先加好友就對了！'
      }
    ]);
  }

  if (event.type === 'unfollow') {
    removeSubscriber(event.source.userId);
    return;
  }

  if (event.type !== 'message' || event.message.type !== 'text') return;

  const text = event.message.text.trim();

  if (/求籤|抽籤|解籤/.test(text)) {
    return reply(event.replyToken, [
      {
        type: 'text',
        text: '點下面連結，點一炷香、擲筊、抽籤，我會幫你解籤 🙏'
      },
      {
        type: 'text',
        text: LIFF_URL
      }
    ]);
  }

  if (/附近|怎麼去|交通|公車|火車|捷運/.test(text)) {
    return reply(event.replyToken, [
      {
        type: 'text',
        text: '打開這個頁面分享你的位置，我幫你找附近的廟，還有公車/火車怎麼去 🚌'
      },
      {
        type: 'text',
        text: LIFF_URL
      }
    ]);
  }

  if (/太歲|沖煞|生肖/.test(text)) {
    const yearMatch = text.match(/(19|20)\d{2}/);
    if (!yearMatch) {
      return reply(event.replyToken, [
        { type: 'text', text: '跟我說你的西元出生年份就可以幫你查囉，例如：「太歲 1998」' }
      ]);
    }
    const birthYear = Number(yearMatch[0]);
    const result = checkZodiacClash(birthYear);
    const context = `生肖太歲查詢結果：出生年 ${result.birthYear}（生肖：${result.userAnimal}），今年 ${result.checkYear}（生肖：${result.yearAnimal}）。是否犯太歲：${result.isClashing ? '是，類型為「' + result.clashType + '」' : '否'}。今年所有犯太歲生肖：${result.allClashesThisYear.map((c) => `${c.animal}(${c.type})`).join('、')}。`;
    const aiMessage = await askLLM({
      userMessage: result.isClashing
        ? '請用溫暖口氣跟我解釋今年犯太歲的意思，並給一些安太歲/點光明燈的建議，簡短一點。'
        : '請用溫暖口氣告訴我今年沒有犯太歲，但仍可以說些新年祝福的話，簡短一點。',
      context
    });
    return reply(event.replyToken, [{ type: 'text', text: aiMessage }], event.source.userId);
  }

  // Fall through to general Q&A grounded in the full app knowledge base (temples, customs, features).
  const answer = await askLLM({ userMessage: text, context: buildAppContext() });
  return reply(event.replyToken, [{ type: 'text', text: answer }], event.source.userId);
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
