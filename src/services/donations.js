// MVP in-memory store of donation pledges. Nothing here processes real money — it's a
// recorded intent + thank-you, matching the light-lamp booking's scope for the demo.

const pledges = [];

function recordPledge({ userId, templeId, campaignId, amount, name }) {
  const pledge = {
    id: `pledge-${pledges.length + 1}`,
    userId,
    templeId,
    campaignId: campaignId || null,
    amount,
    name: name || null,
    createdAt: new Date().toISOString()
  };
  pledges.push(pledge);
  return pledge;
}

function listPledges({ userId, templeId, campaignId } = {}) {
  return pledges.filter(
    (p) =>
      (!userId || p.userId === userId) &&
      (!templeId || p.templeId === templeId) &&
      (!campaignId || p.campaignId === campaignId)
  );
}

function totalForCampaign(campaignId) {
  return pledges.filter((p) => p.campaignId === campaignId).reduce((sum, p) => sum + p.amount, 0);
}

module.exports = { recordPledge, listPledges, totalForCampaign };
