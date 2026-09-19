const express = require('express');
const router = express.Router();

const { client, config, line } = require('../services/lineClient');
const { askLLM } = require('../services/llm');
const { addSubscriber, removeSubscriber } = require('../services/subscribers');
const temples = require('../data/temples.json');

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
  try {
    await Promise.all((req.body.events || []).map(handleEvent));
    res.sendStatus(200);
  } catch (err) {
    console.error('[webhook] error:', err);
    res.sendStatus(500);
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
          '・廟宇小知識（直接問我就好）\n' +
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

  // Fall through to general Q&A grounded in the local temple knowledge base.
  const context = `本地宮廟知識庫：\n${JSON.stringify(temples, null, 2)}`;
  const answer = await askLLM({ userMessage: text, context });
  return reply(event.replyToken, [{ type: 'text', text: answer }]);
}

async function reply(replyToken, messages) {
  return client.replyMessage({ replyToken, messages });
}

module.exports = router;
