const { getDb, updateDb } = require('./db');

const MAX_TURNS = 10; // max 10 messages per user (5 turns)

function getHistory(userId) {
  if (!userId) return [];
  const db = getDb();
  return db.conversationHistory?.[userId] || [];
}

function addMessage(userId, role, text) {
  if (!userId || !text) return;
  updateDb((db) => {
    if (!db.conversationHistory) db.conversationHistory = {};
    if (!db.conversationHistory[userId]) db.conversationHistory[userId] = [];
    db.conversationHistory[userId].push({
      role, // 'user' or 'model'
      text,
      timestamp: Date.now()
    });
    // keep only last MAX_TURNS
    if (db.conversationHistory[userId].length > MAX_TURNS) {
      db.conversationHistory[userId] = db.conversationHistory[userId].slice(-MAX_TURNS);
    }
  });
}

function clearHistory(userId) {
  if (!userId) return;
  updateDb((db) => {
    if (db.conversationHistory?.[userId]) {
      delete db.conversationHistory[userId];
    }
  });
}

module.exports = {
  getHistory,
  addMessage,
  clearHistory
};
