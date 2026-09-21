// MVP in-memory store: which temples each user has subscribed to, so activity/donation
// notifications can be targeted instead of blasted to everyone. Swap for a real DB
// before this needs to survive a restart.

const subs = new Map(); // userId -> Set<templeId>

function subscribeToTemple(userId, templeId) {
  if (!subs.has(userId)) subs.set(userId, new Set());
  subs.get(userId).add(templeId);
}

function unsubscribeFromTemple(userId, templeId) {
  subs.get(userId)?.delete(templeId);
}

function getUserTempleSubs(userId) {
  return Array.from(subs.get(userId) || []);
}

function getSubscribersForTemple(templeId) {
  const result = [];
  for (const [userId, temples] of subs.entries()) {
    if (temples.has(templeId)) result.push(userId);
  }
  return result;
}

module.exports = { subscribeToTemple, unsubscribeFromTemple, getUserTempleSubs, getSubscribersForTemple };
