/**
 * Run this once (or whenever assets/richmenu.png or the button layout changes) to create
 * and publish the LINE rich menu — the persistent 6-button bar at the bottom of the chat.
 *
 * Usage:
 *   node scripts/setup-rich-menu.js
 *
 * Requires LINE_CHANNEL_ACCESS_TOKEN in your .env (real one, not the demo placeholder).
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');

const TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN;
const IMAGE_PATH = path.join(__dirname, '..', 'assets', 'richmenu.png');

if (!TOKEN) {
    console.error('LINE_CHANNEL_ACCESS_TOKEN is not set in .env — aborting.');
    process.exit(1);
}
if (!fs.existsSync(IMAGE_PATH)) {
    console.error(`Rich menu image not found at ${IMAGE_PATH} — run generate_richmenu2.py first.`);
    process.exit(1);
}

const CELL_W = Math.floor(2500 / 3);
const CELL_H = Math.floor(1686 / 2);

// 3x2 grid, matching assets/richmenu.png's layout left-to-right, top-to-bottom.
const areas = [
    { bounds: { x: 0 * CELL_W, y: 0, width: CELL_W, height: CELL_H }, action: { type: 'message', text: '求籤' } },
    { bounds: { x: 1 * CELL_W, y: 0, width: CELL_W, height: CELL_H }, action: { type: 'message', text: '附近宮廟' } },
    { bounds: { x: 2 * CELL_W, y: 0, width: CELL_W, height: CELL_H }, action: { type: 'message', text: '太歲' } },
    { bounds: { x: 0 * CELL_W, y: CELL_H, width: CELL_W, height: CELL_H }, action: { type: 'uri', uri: `https://liff.line.me/${process.env.LIFF_ID}` } },
    { bounds: { x: 1 * CELL_W, y: CELL_H, width: CELL_W, height: CELL_H }, action: { type: 'message', text: '節慶' } },
    { bounds: { x: 2 * CELL_W, y: CELL_H, width: CELL_W, height: CELL_H }, action: { type: 'message', text: '你好' } }
];

async function main() {
    console.log('Creating rich menu...');
    const { data: created } = await axios.post(
        'https://api.line.me/v2/bot/richmenu',
        {
            size: { width: 2500, height: 1686 },
            selected: true,
            name: 'temple-bot-main-menu',
            chatBarText: '選單 / Menu',
            areas
        },
        { headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'application/json' } }
    );
    const richMenuId = created.richMenuId;
    console.log('Created rich menu:', richMenuId);

    console.log('Uploading image...');
    const imageBuffer = fs.readFileSync(IMAGE_PATH);
    await axios.post(`https://api-data.line.me/v2/bot/richmenu/${richMenuId}/content`, imageBuffer, {
        headers: { Authorization: `Bearer ${TOKEN}`, 'Content-Type': 'image/png' }
    });
    console.log('Image uploaded.');

    console.log('Setting as default for all users...');
    await axios.post(
        `https://api.line.me/v2/bot/user/all/richmenu/${richMenuId}`,
        {},
        { headers: { Authorization: `Bearer ${TOKEN}` } }
    );
    console.log('Done! Rich menu is now live for all users:', richMenuId);
    console.log('(Save this ID if you want to delete/replace it later via the LINE API.)');
}

main().catch((err) => {
    console.error('Rich menu setup failed:', err.response?.data || err.message);
    process.exit(1);
});