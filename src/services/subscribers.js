// MVP-only in-memory store of userIds who've added the OA as a friend (for festival
// broadcast pushes), plus each user's language preference. Swap for Firestore/SQLite/etc.
// before this needs to survive a server restart or scale past a demo.

const subscribers = new Map(); // userId -> { lang: 'zh' | 'en' }

function addSubscriber(userId) {
  if (!subscribers.has(userId)) {
    subscribers.set(userId, { lang: 'zh' });
  }
}

function removeSubscriber(userId) {
  subscribers.delete(userId);
}

function listSubscribers() {
  return Array.from(subscribers.keys());
}

function getLang(userId) {
  return subscribers.get(userId)?.lang || 'zh';
}

function setLang(userId, lang) {
  const entry = subscribers.get(userId) || { lang: 'zh' };
  entry.lang = lang;
  subscribers.set(userId, entry);
}

module.exports = { addSubscriber, removeSubscriber, listSubscribers, getLang, setLang };