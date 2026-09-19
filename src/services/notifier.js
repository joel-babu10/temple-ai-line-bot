const cron = require('node-cron');
const festivals = require('../data/festivals.json');
const { client } = require('./lineClient');
const { listSubscribers } = require('./subscribers');

const REMINDER_DAYS_BEFORE = 3;

function daysUntil(dateStr) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  return Math.round((target - today) / (1000 * 60 * 60 * 24));
}

async function broadcast(text) {
  const userIds = listSubscribers();
  if (!userIds.length) {
    console.log('[notifier] no subscribers yet, skipping push:', text);
    return;
  }
  // multicast caps at 500 recipients per call — fine for demo scale.
  await client.multicast({ to: userIds, messages: [{ type: 'text', text }] });
}

async function checkFestivalsAndNotify() {
  for (const f of festivals) {
    const delta = daysUntil(f.date2026);
    if (delta === 0) {
      await broadcast(`🎉 ${f.message}`);
    } else if (delta === REMINDER_DAYS_BEFORE) {
      await broadcast(`📅 再過${REMINDER_DAYS_BEFORE}天就是${f.name}了～ ${f.message}`);
    }
  }
}

function startFestivalNotifier() {
  // Runs once a day at 08:00 server time. Adjust the cron string for a different schedule.
  cron.schedule('0 8 * * *', () => {
    checkFestivalsAndNotify().catch((err) => console.error('[notifier] error:', err));
  });
  console.log('[notifier] festival reminder cron scheduled (daily 08:00)');
}

module.exports = { startFestivalNotifier, checkFestivalsAndNotify };
