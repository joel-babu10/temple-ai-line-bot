const { getDb, updateDb } = require('./db');

function subscribeToTemple(userId, templeId) {
  if (!userId || !templeId) return;
  updateDb((db) => {
    if (!db.templeSubscriptions) db.templeSubscriptions = {};
    if (!db.templeSubscriptions[userId]) db.templeSubscriptions[userId] = [];
    if (!db.templeSubscriptions[userId].includes(templeId)) {
      db.templeSubscriptions[userId].push(templeId);
    }
  });
}

function unsubscribeFromTemple(userId, templeId) {
  if (!userId || !templeId) return;
  updateDb((db) => {
    if (db.templeSubscriptions?.[userId]) {
      db.templeSubscriptions[userId] = db.templeSubscriptions[userId].filter((id) => id !== templeId);
    }
  });
}

function getUserTempleSubs(userId) {
  if (!userId) return [];
  const db = getDb();
  return db.templeSubscriptions?.[userId] || [];
}

function getSubscribersForTemple(templeId) {
  if (!templeId) return [];
  const db = getDb();
  const result = [];
  const all = db.templeSubscriptions || {};
  for (const [userId, temples] of Object.entries(all)) {
    if (Array.isArray(temples) && temples.includes(templeId)) {
      result.push(userId);
    }
  }
  return result;
}

module.exports = { subscribeToTemple, unsubscribeFromTemple, getUserTempleSubs, getSubscribersForTemple };
