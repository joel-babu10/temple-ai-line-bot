const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const { client } = require('./lineClient');
const { getSubscribersForTemple } = require('./templeSubscriptions');
const { getLang } = require('./subscribers');
const temples = require('../data/temples.json');

const POSTS_PATH = path.join(__dirname, '..', 'data', 'temple-posts.json');
const CHECK_SCHEDULE = '*/2 * * * *'; // every 2 minutes — frequent enough to demo live

// IDs we've already notified about. Seeded with whatever's in the file at boot so the
// existing sample activities/donations don't all fire at once on every deploy — only
// entries added to the file *after* the server started count as "new".
let seenIds = new Set();

function readPosts() {
  try {
    return JSON.parse(fs.readFileSync(POSTS_PATH, 'utf8'));
  } catch (err) {
    console.error('[postsNotifier] failed to read temple-posts.json:', err.message);
    return [];
  }
}

function templeName(templeId) {
  return temples.find((t) => t.id === templeId)?.name || templeId;
}

function formatMessage(post, lang) {
  const isEn = lang === 'en';
  const kind = post.type === 'donation' ? (isEn ? 'New donation campaign' : '新的樂捐活動') : isEn ? 'New activity' : '新活動';
  const title = isEn ? post.titleEn || post.title : post.title;
  const desc = isEn ? post.descriptionEn || post.description : post.description;
  const temple = templeName(post.templeId);
  return `🔔 ${kind} · ${temple}\n\n${title}\n${desc}`;
}

async function checkForNewPosts() {
  const posts = readPosts();

  if (seenIds.size === 0) {
    // First run after boot — seed instead of notifying, see comment above.
    seenIds = new Set(posts.map((p) => p.id));
    return;
  }

  const newPosts = posts.filter((p) => !seenIds.has(p.id));
  for (const post of newPosts) {
    seenIds.add(post.id);
    const subscriberIds = getSubscribersForTemple(post.templeId);
    if (!subscriberIds.length) continue;

    // Group by language so each subscriber gets the message in their preferred language.
    for (const userId of subscriberIds) {
      const lang = getLang(userId);
      try {
        await client.pushMessage({ to: userId, messages: [{ type: 'text', text: formatMessage(post, lang) }] });
      } catch (err) {
        console.error(`[postsNotifier] push failed for ${userId}:`, err.message);
      }
    }
  }
}

function startPostsNotifier() {
  // Seed immediately on boot so startup doesn't wait for the first cron tick.
  checkForNewPosts().catch((err) => console.error('[postsNotifier] initial seed failed:', err));
  cron.schedule(CHECK_SCHEDULE, () => {
    checkForNewPosts().catch((err) => console.error('[postsNotifier] error:', err));
  });
  console.log(`[postsNotifier] watching temple-posts.json (every 2 min) for new activities/donations`);
}

module.exports = { startPostsNotifier, checkForNewPosts };
