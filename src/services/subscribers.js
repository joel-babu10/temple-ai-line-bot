// MVP-only in-memory store of userIds who've added the OA as a friend,
// so we can broadcast festival reminders. Swap for Firestore/SQLite/etc.
// before this needs to survive a server restart or scale past a demo.

const subscribers = new Set();

function addSubscriber(userId) {
  subscribers.add(userId);
}

function removeSubscriber(userId) {
  subscribers.delete(userId);
}

function listSubscribers() {
  return Array.from(subscribers);
}

module.exports = { addSubscriber, removeSubscriber, listSubscribers };
