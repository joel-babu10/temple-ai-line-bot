const fs = require('fs');
const path = require('path');
const { Client } = require('@line/bot-sdk');
require('dotenv').config();

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const client = new Client(config);

const richMenu = {
  size: { width: 2500, height: 1686 },
  selected: false, // KEYBOARD-FIRST: Keyboard opens by default instead of Rich Menu blocking screen!
  name: 'Flame AI Temple Companion Menu',
  chatBarText: '選單 / Menu',
  areas: [
    {
      bounds: { x: 0, y: 0, width: 833, height: 843 },
      action: { type: 'message', label: '求籤解籤', text: '1' }
    },
    {
      bounds: { x: 833, y: 0, width: 834, height: 843 },
      action: { type: 'message', label: '附近宮廟', text: '2' }
    },
    {
      bounds: { x: 1667, y: 0, width: 833, height: 843 },
      action: { type: 'message', label: '太歲查詢', text: '3' }
    },
    {
      bounds: { x: 0, y: 843, width: 833, height: 843 },
      action: { type: 'message', label: '節慶提醒', text: '4' }
    },
    {
      bounds: { x: 833, y: 843, width: 834, height: 843 },
      action: { type: 'uri', label: 'Web參拜', uri: `https://liff.line.me/${process.env.LIFF_ID || 'YOUR_LIFF_ID'}` }
    },
    {
      bounds: { x: 1667, y: 843, width: 833, height: 843 },
      action: { type: 'message', label: '問焰寶', text: '6' }
    }
  ]
};

async function main() {
  if (!config.channelAccessToken) {
    console.log('[setup-rich-menu] LINE_CHANNEL_ACCESS_TOKEN missing in .env');
    return;
  }
  try {
    const id = await client.createRichMenu(richMenu);
    console.log('[setup-rich-menu] Created Rich Menu with ID:', id);

    const imagePath = path.join(__dirname, '..', 'assets', 'richmenu.png');
    if (fs.existsSync(imagePath)) {
      const imageBuffer = fs.readFileSync(imagePath);
      await client.setRichMenuImage(id, imageBuffer, 'image/png');
      console.log('[setup-rich-menu] Uploaded richmenu.png to LINE servers!');
    } else {
      console.warn('[setup-rich-menu] assets/richmenu.png not found, skipping image upload.');
    }

    await client.setDefaultRichMenu(id);
    console.log('[setup-rich-menu] ✅ SUCCESS! Set default Rich Menu with selected: false (Keyboard-First)!');
  } catch (err) {
    console.error('[setup-rich-menu] Error during setup:', err.response?.data || err.message);
  }
}

main();