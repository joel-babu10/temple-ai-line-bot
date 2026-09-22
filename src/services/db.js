const fs = require('fs');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'db.json');

const initialSamplePosts = [
  {
    id: 'post-1',
    templeId: 'wanchun-gong',
    authorType: 'temple', // 'temple' | 'user'
    authorName: '台中萬春宮 廟方委員會',
    authorAvatar: '廟',
    title: '媽祖聖誕祝壽法會公告',
    description: '萬春宮媽祖聖誕祝壽祭典將於國曆5月9日隆重舉行，歡迎各位信眾一同參與祝壽、參拜祈福，功德無量。',
    category: 'activity', // 'activity' | 'donation' | 'discussion'
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'post-2',
    templeId: 'wanchun-gong',
    authorType: 'temple',
    authorName: '台中萬春宮 廟方委員會',
    authorAvatar: '廟',
    title: '冬季偏鄉送暖平安米愛心募款',
    description: '萬春宮冬令平安米供養活動開始囉！籌集物資隨喜護持偏鄉獨居長者與弱勢家庭，感謝十方大德隨喜樂捐。',
    category: 'donation',
    targetAmount: 500000,
    raisedAmount: 320000,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'post-3',
    templeId: 'lecheng-gong',
    authorType: 'user',
    authorName: '陳大德',
    authorAvatar: '信',
    title: '今天帶著家人去樂成宮參拜，香火鼎盛！',
    description: '感謝旱溪媽祖保佑家人身體健康，現場志工熱心解說參拜儀軌，讓人心裡特別踏實。',
    category: 'discussion',
    createdAt: new Date(Date.now() - 3600000 * 4).toISOString()
  }
];

const initialSampleComments = [
  {
    id: 'cmt-1',
    postId: 'post-1',
    userId: 'user-001',
    userName: '林信士',
    userRole: 'believer',
    userAvatar: '信',
    content: '每年媽祖聖誕都一定會帶家人回萬春宮參拜，感恩聖母慈悲！',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'cmt-2',
    postId: 'post-2',
    userId: 'temple-admin-wanchun',
    userName: '萬春宮執事',
    userRole: 'temple_admin',
    userAvatar: '廟',
    content: '感謝十方善信大德共襄盛舉，目前物資正在分裝中！',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const defaultData = {
  users: {}, // userId -> { lang: 'zh'|'en', role: 'believer'|'temple_admin', templeId: 'wanchun-gong', displayName, pictureUrl }
  subscribers: [],
  templeSubscriptions: {},
  pledges: [],
  drawHistory: [],
  divinationSessions: {},
  posts: initialSamplePosts,
  comments: initialSampleComments
};

let cache = null;

function loadDb() {
  if (cache) return cache;
  try {
    if (fs.existsSync(DB_PATH)) {
      const content = fs.readFileSync(DB_PATH, 'utf8');
      cache = { ...defaultData, ...JSON.parse(content) };
      if (!cache.posts || cache.posts.length === 0) cache.posts = initialSamplePosts;
      if (!cache.comments) cache.comments = initialSampleComments;
    } else {
      cache = { ...defaultData };
      saveDb();
    }
  } catch (err) {
    console.error('[db] Error reading db.json, creating new default:', err.message);
    cache = { ...defaultData };
  }
  return cache;
}

function saveDb() {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(cache, null, 2), 'utf8');
  } catch (err) {
    console.error('[db] Error writing db.json:', err.message);
  }
}

function getDb() {
  return loadDb();
}

function updateDb(fn) {
  const db = loadDb();
  fn(db);
  saveDb();
  return db;
}

module.exports = {
  getDb,
  updateDb
};
