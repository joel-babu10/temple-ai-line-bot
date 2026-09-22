const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const defaultData = {
  users: {}, // userId -> { lang: 'zh'|'en', updatedAt: timestamp }
  subscribers: [], // list of userIds subscribed to global festival alerts
  templeSubscriptions: {}, // userId -> [templeId1, templeId2]
  pledges: [], // [{ id, userId, templeId, campaignId, amount, name, createdAt }]
  drawHistory: [], // [{ userId, fortuneId, question, reply, createdAt }]
  lampBlessings: [], // [{ userId, name, blessingType, templeId, createdAt }]
  divinationSessions: {} // userId -> { step, question, tossCount }
};

let cache = null;

function loadDb() {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      cache = { ...defaultData, ...JSON.parse(content) };
    } else {
      cache = { ...defaultData };
      saveDb();
    }
  } catch (err) {
    console.error('[db] Error reading db.json, creating new default:', err.message);
    cache = { ...defaultData };
  }
  return cache;
}

function saveDb() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[db] Error writing db.json:', err.message);
  }
}

function getDb() {
  return loadDb();
}

function updateDb(fn) {
  const db = loadDb();
  fn(db);
  saveDb();
  return db;
}

module.exports = {
  getDb,
  updateDb
};
