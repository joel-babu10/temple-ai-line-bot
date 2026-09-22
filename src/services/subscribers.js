const { getDb, updateDb } = require('./db');

function addSubscriber(userId) {
  if (!userId) return;
  updateDb((db) => {
    if (!db.users[userId]) {
      db.users[userId] = { lang: 'zh', updatedAt: Date.now() };
    }
    if (!db.subscribers.includes(userId)) {
      db.subscribers.push(userId);
    }
  });
}

function removeSubscriber(userId) {
  if (!userId) return;
  updateDb((db) => {
    db.subscribers = db.subscribers.filter((id) => id !== userId);
  });
}

function listSubscribers() {
  const db = getDb();
  return db.subscribers || [];
}

function getLang(userId) {
  if (!userId) return 'zh';
  const db = getDb();
  return db.users[userId]?.lang || 'zh';
}

function setLang(userId, lang) {
  if (!userId) return;
  updateDb((db) => {
    if (!db.users[userId]) {
      db.users[userId] = { lang, updatedAt: Date.now() };
    } else {
      db.users[userId].lang = lang;
      db.users[userId].updatedAt = Date.now();
    }
  });
}

module.exports = { addSubscriber, removeSubscriber, listSubscribers, getLang, setLang };