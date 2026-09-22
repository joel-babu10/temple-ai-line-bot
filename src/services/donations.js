const { getDb, updateDb } = require('./db');

function recordPledge({ userId, templeId, campaignId, amount, name }) {
  let pledge = null;
  updateDb((db) => {
    if (!db.pledges) db.pledges = [];
    pledge = {
      id: `pledge-${db.pledges.length + 1}`,
      userId: userId || 'anonymous',
      templeId,
      campaignId: campaignId || null,
      amount: Number(amount) || 0,
      name: name || null,
      createdAt: new Date().toISOString()
    };
    db.pledges.push(pledge);
  });
  return pledge;
}

function listPledges({ userId, templeId, campaignId } = {}) {
  const db = getDb();
  const pledges = db.pledges || [];
  return pledges.filter(
    (p) =>
      (!userId || p.userId === userId) &&
      (!templeId || p.templeId === templeId) &&
      (!campaignId || p.campaignId === campaignId)
  );
}

function totalForCampaign(campaignId) {
  const db = getDb();
  const pledges = db.pledges || [];
  return pledges.filter((p) => p.campaignId === campaignId).reduce((sum, p) => sum + (p.amount || 0), 0);
}

module.exports = { recordPledge, listPledges, totalForCampaign };
