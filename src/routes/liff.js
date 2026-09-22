const express = require('express');
const router = express.Router();

const fortunes = require('../data/fortunes.json');
const festivals = require('../data/festivals.json');
const temples = require('../data/temples.json');
const { askLLM } = require('../services/llm');
const { nearbyTemples } = require('../services/places');
const { getTransitDirections } = require('../services/transit');
const { checkZodiacClash } = require('../services/zodiac');
const { buildAppContext } = require('../services/knowledge');
const { subscribeToTemple, unsubscribeFromTemple, getUserTempleSubs } = require('../services/templeSubscriptions');
const { recordPledge, listPledges, totalForCampaign } = require('../services/donations');
const { updateDb, getDb } = require('../services/db');
const templePosts = require('../data/temple-posts.json');

// Draw a random fortune stick (求籤)
router.get('/fortune/draw', (req, res) => {
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  res.json(fortune);
});

// AI interpretation of a drawn fortune
router.post('/fortune/interpret', async (req, res) => {
  try {
    const { fortuneId, question, language, userId } = req.body;
    const fortune = fortunes.find((f) => f.id === Number(fortuneId));
    if (!fortune) return res.status(404).json({ error: 'unknown fortuneId' });

    const context = `籤詩編號 ${fortune.id}（${fortune.grade}）：「${fortune.poem}」\n主題：${fortune.theme}\n一般解釋：${fortune.notes}`;
    const defaultUserMsg = language === 'en' ? 'Please explain the general meaning of this divine poem for me.' : '請幫我解釋這支籤大概的意思。';
    const reply = await askLLM({
      userMessage: question || defaultUserMsg,
      context,
      language: language || 'zh-TW'
    });

    if (userId) {
      updateDb((db) => {
        if (!db.drawHistory) db.drawHistory = [];
        db.drawHistory.push({
          userId,
          fortuneId: fortune.id,
          question: question || defaultUserMsg,
          reply,
          createdAt: new Date().toISOString()
        });
      });
    }

    res.json({ fortune, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'interpret_failed' });
  }
});

// Nearby temples
router.get('/temples/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' });
    const results = await nearbyTemples(Number(lat), Number(lng));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'nearby_failed' });
  }
});

// Bus/train directions
router.get('/temples/:id/transit', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' });
    const result = await getTransitDirections(Number(lat), Number(lng), req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'transit_failed' });
  }
});

// Curated temple info
router.get('/temples', (req, res) => res.json(temples));

// Upcoming festivals
router.get('/festivals', (req, res) => {
  const withDelta = festivals
    .map((f) => ({
      ...f,
      daysAway: Math.round((new Date(f.date2026) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .filter((f) => f.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);
  res.json(withDelta);
});

// Zodiac clash check
router.get('/zodiac/check', async (req, res) => {
  try {
    const { birthYear, year, explain } = req.query;
    if (!birthYear || Number.isNaN(Number(birthYear))) {
      return res.status(400).json({ error: 'birthYear required (e.g. ?birthYear=1998)' });
    }
    const result = checkZodiacClash(Number(birthYear), year ? Number(year) : undefined);

    if (explain === 'true') {
      const context = `生肖太歲查詢結果：出生年 ${result.birthYear}（生肖：${result.userAnimal}），查詢年份 ${result.checkYear}（生肖：${result.yearAnimal}）。是否犯太歲：${result.isClashing ? '是，類型為「' + result.clashType + '」' : '否'}。今年所有犯太歲生肖：${result.allClashesThisYear.map((c) => `${c.animal}(${c.type})`).join('、')}。`;
      result.aiMessage = await askLLM({
        userMessage: result.isClashing
          ? `請用溫暖口氣跟我解釋今年犯太歲的意思，並給一些安太歲/點光明燈的建議。`
          : `請用溫暖口氣告訴我今年沒有犯太歲，但仍可以說些新年祝福的話。`,
        context
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'zodiac_check_failed' });
  }
});

// General AI Q&A
router.post('/ask', async (req, res) => {
  try {
    const { question, language } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question required' });
    }
    const reply = await askLLM({
      userMessage: question,
      context: buildAppContext(),
      language: language || 'zh-TW'
    });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ask_failed' });
  }
});

// --- Community Posts & Comments API ---

// GET /api/posts - Get community feed posts
router.get('/posts', (req, res) => {
  const { category, templeId } = req.query;
  const db = getDb();
  let posts = db.posts || [];

  if (category && category !== 'all') {
    posts = posts.filter((p) => p.category === category || p.type === category);
  }
  if (templeId) {
    posts = posts.filter((p) => p.templeId === templeId);
  }

  // Calculate raised amount for donation posts and comment counts
  const enriched = posts.map((p) => {
    const commentCount = (db.comments || []).filter((c) => c.postId === p.id).length;
    const raised = p.category === 'donation' || p.type === 'donation' ? totalForCampaign(p.id) : 0;
    return {
      ...p,
      commentCount,
      raisedAmount: (p.raisedAmount || 0) + raised
    };
  });

  res.json(enriched);
});

// POST /api/posts - Create a new community post or official announcement
router.post('/posts', (req, res) => {
  try {
    const { templeId, authorType, authorName, authorAvatar, title, description, category, targetAmount } = req.body;
    if (!title || !description) {
      return res.status(400).json({ error: 'title and description required' });
    }

    let newPost = null;
    updateDb((db) => {
      if (!db.posts) db.posts = [];
      newPost = {
        id: `post-${Date.now()}`,
        templeId: templeId || 'wanchun-gong',
        authorType: authorType || 'user', // 'temple' | 'user'
        authorName: authorName || (authorType === 'temple' ? '萬春宮 廟方委員會' : '虔誠信士'),
        authorAvatar: authorAvatar || (authorType === 'temple' ? '廟' : '信'),
        title,
        description,
        category: category || 'discussion', // 'activity' | 'donation' | 'discussion'
        targetAmount: targetAmount ? Number(targetAmount) : undefined,
        raisedAmount: category === 'donation' ? 0 : undefined,
        createdAt: new Date().toISOString()
      };
      db.posts.unshift(newPost);
    });

    res.json({ post: newPost, message: '發布成功！' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'create_post_failed' });
  }
});

// GET /api/posts/:id/comments - Get comments for a post
router.get('/posts/:id/comments', (req, res) => {
  const db = getDb();
  const comments = (db.comments || []).filter((c) => c.postId === req.params.id);
  res.json(comments);
});

// POST /api/posts/:id/comments - Post a new comment
router.post('/posts/:id/comments', (req, res) => {
  try {
    const postId = req.params.id;
    const { userId, userName, userRole, userAvatar, content } = req.body;
    if (!content || !content.trim()) {
      return res.status(400).json({ error: 'content required' });
    }

    let newComment = null;
    updateDb((db) => {
      if (!db.comments) db.comments = [];
      newComment = {
        id: `cmt-${Date.now()}`,
        postId,
        userId: userId || 'anonymous',
        userName: userName || (userRole === 'temple_admin' ? '廟方執事' : '善信大德'),
        userRole: userRole || 'believer', // 'temple_admin' | 'believer'
        userAvatar: userAvatar || (userRole === 'temple_admin' ? '廟' : '信'),
        content: content.trim(),
        createdAt: new Date().toISOString()
      };
      db.comments.push(newComment);
    });

    res.json({ comment: newComment });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'add_comment_failed' });
  }
});

// GET /api/user/profile & POST /api/user/profile - Account role & profile settings
router.get('/user/profile', (req, res) => {
  const { userId } = req.query;
  const db = getDb();
  const profile = db.users?.[userId || 'default'] || {
    role: 'believer',
    templeId: 'wanchun-gong',
    displayName: '善信大德',
    pictureUrl: ''
  };
  res.json(profile);
});

router.post('/user/profile', (req, res) => {
  const { userId, role, templeId, displayName, pictureUrl } = req.body;
  let updated = null;
  updateDb((db) => {
    if (!db.users) db.users = {};
    const key = userId || 'default';
    db.users[key] = {
      ...db.users[key],
      role: role || db.users[key]?.role || 'believer',
      templeId: templeId || db.users[key]?.templeId || 'wanchun-gong',
      displayName: displayName || db.users[key]?.displayName || '善信大德',
      pictureUrl: pictureUrl !== undefined ? pictureUrl : db.users[key]?.pictureUrl || '',
      updatedAt: Date.now()
    };
    updated = db.users[key];
  });
  res.json(updated);
});

// Legacy activities route compatibility
router.get('/activities', (req, res) => {
  const db = getDb();
  const posts = db.posts || [];
  const withTotals = posts.map((p) =>
    p.category === 'donation' || p.type === 'donation'
      ? { ...p, raisedAmount: (p.raisedAmount || 0) + totalForCampaign(p.id) }
      : p
  );
  res.json(withTotals);
});

// Donation Pledges
router.post('/donations', (req, res) => {
  try {
    const { userId, templeId, campaignId, amount, name } = req.body;
    if (!amount || Number(amount) <= 0) {
      return res.status(400).json({ error: 'valid amount required' });
    }
    const pledge = recordPledge({ userId, templeId: templeId || 'wanchun-gong', campaignId, amount: Number(amount), name });
    res.json({ pledge, message: '感謝您的樂捐，您的心意神明都知道 🙏' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'donation_failed' });
  }
});

router.get('/donations', (req, res) => {
  const { userId, templeId, campaignId } = req.query;
  res.json(listPledges({ userId, templeId, campaignId }));
});

// Temple Subscriptions
router.post('/subscriptions', (req, res) => {
  const { userId, templeId } = req.body;
  if (!userId || !templeId) return res.status(400).json({ error: 'userId and templeId required' });
  subscribeToTemple(userId, templeId);
  res.json({ subscribed: getUserTempleSubs(userId) });
});

router.delete('/subscriptions', (req, res) => {
  const { userId, templeId } = req.body;
  if (!userId || !templeId) return res.status(400).json({ error: 'userId and templeId required' });
  unsubscribeFromTemple(userId, templeId);
  res.json({ subscribed: getUserTempleSubs(userId) });
});

router.get('/subscriptions', (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId required' });
  res.json({ subscribed: getUserTempleSubs(userId) });
});

module.exports = router;