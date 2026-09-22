const API_BASE = '/api';

// ---------- Global State ----------
let currentLang = 'zh-TW';
let currentRole = 'believer'; // 'believer' | 'temple_admin'
let userProfile = {
  userId: 'line-user-demo-123',
  displayName: '善信大德',
  pictureUrl: '',
  role: 'believer',
  templeId: 'wanchun-gong'
};

// ---------- Audio Chime Synthesizer ----------
let chimeEnabled = true;
const chimeBtn = document.getElementById('chimeToggleBtn');
if (chimeBtn) {
  chimeBtn.addEventListener('click', () => {
    chimeEnabled = !chimeEnabled;
    chimeBtn.querySelector('span').textContent = `磬音: ${chimeEnabled ? '開' : '關'}`;
    chimeBtn.style.opacity = chimeEnabled ? '1' : '0.5';
    if (chimeEnabled) playTempleChime(528, 0.4);
  });
}

function playTempleChime(freq = 432, duration = 0.8) {
  if (!chimeEnabled) return;
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.5, ctx.currentTime + duration);

    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

// ---------- Helper UI Functions ----------
function showTyping(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('is-hidden');
}

function hideTyping(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('is-hidden');
}

hideTyping('askTyping');

function escapeHtml(str) {
  return String(str || '').replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function appendChat(containerId, text, role, avatarLabel = role === 'user' ? '信' : '廟') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const msgRow = document.createElement('div');
  msgRow.className = `chat-row ${role}`;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const avatarHtml = role === 'user'
    ? `<div class="chat-avatar user-avatar">${avatarLabel}</div>`
    : `<div class="chat-avatar ai-avatar">${avatarLabel}</div>`;
  const formattedText = escapeHtml(text).replace(/\n/g, '<br>');

  msgRow.innerHTML = `
    ${avatarHtml}
    <div class="bubble-wrapper">
      <div class="chat-bubble ${role}">
        <div class="bubble-content">${formattedText}</div>
      </div>
      <span class="chat-timestamp">${timeStr}</span>
    </div>
  `;

  container.appendChild(msgRow);
  msgRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ---------- Tab Switcher ----------
const tabBtns = document.querySelectorAll('.tabbar .tab-btn');
const tabPanels = document.querySelectorAll('.tab-panel');

tabBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    const targetTab = btn.dataset.tab;
    tabBtns.forEach((b) => b.classList.remove('is-active'));
    tabPanels.forEach((p) => p.classList.remove('is-active'));

    btn.classList.add('is-active');
    const targetPanel = document.getElementById(`tab-${targetTab}`);
    if (targetPanel) targetPanel.classList.add('is-active');

    playTempleChime(480, 0.2);

    if (targetTab === 'community') loadCommunityPosts();
    if (targetTab === 'donations') loadDonationCampaigns();
    if (targetTab === 'profile') loadUserProfileUI();
  });
});

// ---------- Top Corner Menu Modal ----------
const topCornerMenuBtn = document.getElementById('topCornerMenuBtn');
const cornerMenuModal = document.getElementById('cornerMenuModal');
const closeCornerMenuBtn = document.getElementById('closeCornerMenuBtn');

if (topCornerMenuBtn && cornerMenuModal) {
  topCornerMenuBtn.addEventListener('click', () => {
    cornerMenuModal.classList.remove('is-hidden');
    playTempleChime(600, 0.3);
  });
}

if (closeCornerMenuBtn && cornerMenuModal) {
  closeCornerMenuBtn.addEventListener('click', () => {
    cornerMenuModal.classList.add('is-hidden');
  });
}

document.querySelectorAll('.menu-tile-btn').forEach((tile) => {
  tile.addEventListener('click', () => {
    const action = tile.dataset.action;
    cornerMenuModal.classList.add('is-hidden');

    if (action === 'draw_fortune') {
      handleAskQuery('請幫我求一張籤詩並解籤');
    } else if (action === 'nearby_temples') {
      handleAskQuery('幫我找附近的宮廟與交通資訊');
    } else if (action === 'zodiac_check') {
      handleAskQuery('請幫我查詢生肖太歲沖煞（1998年）');
    } else if (action === 'open_community') {
      document.querySelector('.tab-btn[data-tab="community"]').click();
    } else if (action === 'open_donations') {
      document.querySelector('.tab-btn[data-tab="donations"]').click();
    }
  });
});

// ---------- Conversational Chat AI Handler ----------
const askBtn = document.getElementById('askBtn');
const askInput = document.getElementById('askInput');

async function handleAskQuery(customText) {
  const question = typeof customText === 'string' ? customText : askInput.value.trim();
  if (!question) return;

  // Switch to chat tab if not active
  const chatTab = document.querySelector('.tab-btn[data-tab="chat"]');
  if (chatTab && !chatTab.classList.contains('is-active')) {
    chatTab.click();
  }

  appendChat('askChat', question, 'user', userProfile.displayName ? userProfile.displayName.charAt(0) : '信');
  askInput.value = '';

  showTyping('askTyping');

  try {
    const res = await fetch(`${API_BASE}/ask`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, language: currentLang })
    });
    const data = await res.json();
    hideTyping('askTyping');
    appendChat('askChat', data.reply, 'ai', '廟');
  } catch (e) {
    hideTyping('askTyping');
    appendChat('askChat', currentLang === 'en' ? 'Connection error, please try again.' : '連線失敗，請稍後再試。', 'ai', '廟');
  }
}

if (askBtn) askBtn.addEventListener('click', () => handleAskQuery());
if (askInput) {
  askInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAskQuery();
    }
  });
}

document.querySelectorAll('#askChips .chip-suggestion-btn').forEach((btn) => {
  btn.addEventListener('click', () => handleAskQuery(btn.dataset.query));
});

const clearAskChatBtn = document.getElementById('clearAskChatBtn');
if (clearAskChatBtn) {
  clearAskChatBtn.addEventListener('click', () => {
    const chatLog = document.getElementById('askChat');
    if (chatLog) chatLog.innerHTML = '';
  });
}

// ---------- Community Posts & Comments System ----------
let activeCategory = 'all';

document.querySelectorAll('#communityCategoryFilters .chip-btn').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#communityCategoryFilters .chip-btn').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeCategory = chip.dataset.cat;
    loadCommunityPosts();
    playTempleChime(520, 0.2);
  });
});

async function loadCommunityPosts() {
  const container = document.getElementById('communityFeedList');
  if (!container) return;

  container.innerHTML = '<div class="loading-spinner">載入最新動態中...</div>';

  try {
    const res = await fetch(`${API_BASE}/posts?category=${activeCategory}`);
    const posts = await res.json();

    if (!posts || posts.length === 0) {
      container.innerHTML = '<div class="empty-feed-card">目前沒有此分類的動態。</div>';
      return;
    }

    container.innerHTML = posts.map(renderPostCard).join('');
    // Attach comment submit listeners
    posts.forEach((p) => attachCommentListeners(p.id));
  } catch (err) {
    container.innerHTML = '<div class="empty-feed-card">無法載入動態，請稍後再試。</div>';
  }
}

function renderPostCard(post) {
  const isTemple = post.authorType === 'temple' || post.userRole === 'temple_admin';
  const roleBadge = isTemple
    ? '<span class="post-badge temple">⛩️ 廟方官方</span>'
    : '<span class="post-badge believer">👤 信眾交流</span>';
  const avatarBg = isTemple ? 'temple-avatar-bg' : 'user-avatar-bg';
  const avatarChar = isTemple ? '廟' : (post.authorName ? post.authorName.charAt(0) : '信');

  const progressHtml = post.category === 'donation' || post.type === 'donation'
    ? `<div class="post-donation-progress">
        <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${Math.min(100, Math.round(((post.raisedAmount || 0) / (post.targetAmount || 500000)) * 100))}%"></div></div>
        <div class="progress-labels">
          <span>已募集: NT$ ${(post.raisedAmount || 0).toLocaleString()}</span>
          <span>目標: NT$ ${(post.targetAmount || 500000).toLocaleString()}</span>
        </div>
        <button class="btn-donate-post" onclick="openDonationModal('${post.id}', '${escapeHtml(post.title)}')">❤️ 立即隨喜樂捐</button>
       </div>`
    : '';

  return `
    <article class="post-card" id="post-card-${post.id}">
      <div class="post-header">
        <div class="post-author-avatar ${avatarBg}">${avatarChar}</div>
        <div class="post-author-info">
          <div class="author-name-row">
            <h4>${escapeHtml(post.authorName)}</h4>
            ${roleBadge}
          </div>
          <span class="post-time">${new Date(post.createdAt).toLocaleString([], { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>
      <div class="post-body">
        <h3 class="post-title">${escapeHtml(post.title)}</h3>
        <p class="post-desc">${escapeHtml(post.description)}</p>
        ${progressHtml}
      </div>
      <div class="post-footer">
        <button class="btn-toggle-comments" onclick="toggleComments('${post.id}')">
          <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
          <span>留言 (${post.commentCount || 0})</span>
        </button>
      </div>

      <div class="comments-section is-hidden" id="comments-section-${post.id}">
        <div class="comments-list" id="comments-list-${post.id}">
          <div class="loading-comments">載入留言中...</div>
        </div>
        <div class="add-comment-row">
          <input type="text" id="comment-input-${post.id}" class="comment-input" placeholder="留個言支持或交流..." />
          <button class="btn-send-comment" id="btn-send-cmt-${post.id}">發布</button>
        </div>
      </div>
    </article>
  `;
}

async function toggleComments(postId) {
  const sec = document.getElementById(`comments-section-${postId}`);
  if (!sec) return;
  sec.classList.toggle('is-hidden');
  if (!sec.classList.contains('is-hidden')) {
    loadPostComments(postId);
  }
}

async function loadPostComments(postId) {
  const container = document.getElementById(`comments-list-${postId}`);
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/posts/${postId}/comments`);
    const comments = await res.json();

    if (!comments || comments.length === 0) {
      container.innerHTML = '<div class="no-comments">尚無留言，快來搶頭香！</div>';
      return;
    }

    container.innerHTML = comments
      .map(
        (c) => `
      <div class="comment-item">
        <div class="comment-avatar ${c.userRole === 'temple_admin' ? 'temple-avatar-bg' : 'user-avatar-bg'}">
          ${c.userRole === 'temple_admin' ? '廟' : (c.userName ? c.userName.charAt(0) : '信')}
        </div>
        <div class="comment-content-block">
          <div class="comment-author-row">
            <span class="cmt-author">${escapeHtml(c.userName)}</span>
            ${c.userRole === 'temple_admin' ? '<span class="post-badge temple">廟方</span>' : ''}
            <span class="cmt-time">${new Date(c.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
          <p class="cmt-text">${escapeHtml(c.content)}</p>
        </div>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<div class="no-comments">無法載入留言。</div>';
  }
}

function attachCommentListeners(postId) {
  const btn = document.getElementById(`btn-send-cmt-${postId}`);
  const input = document.getElementById(`comment-input-${postId}`);

  if (btn && input) {
    btn.onclick = async () => {
      const content = input.value.trim();
      if (!content) return;
      input.value = '';

      try {
        await fetch(`${API_BASE}/posts/${postId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: userProfile.userId,
            userName: userProfile.displayName,
            userRole: currentRole,
            userAvatar: currentRole === 'temple_admin' ? '廟' : '信',
            content
          })
        });
        loadPostComments(postId);
        playTempleChime(620, 0.3);
      } catch (err) {
        alert('留言發布失敗，請稍後再試。');
      }
    };
  }
}

// Create Post Modal Logic
const openCreatePostBtn = document.getElementById('openCreatePostBtn');
const createPostModal = document.getElementById('createPostModal');
const closeCreatePostModalBtn = document.getElementById('closeCreatePostModalBtn');
const createPostForm = document.getElementById('createPostForm');

if (openCreatePostBtn && createPostModal) {
  openCreatePostBtn.addEventListener('click', () => {
    createPostModal.classList.remove('is-hidden');
    const indicator = document.getElementById('postRoleIndicator');
    if (indicator) {
      indicator.textContent = currentRole === 'temple_admin' ? '⛩️ 【台中萬春宮 廟方官方發布】' : '👤 【信眾交流隨筆】';
      indicator.style.color = currentRole === 'temple_admin' ? '#ffd700' : '#e4c77a';
    }
  });
}

if (closeCreatePostModalBtn && createPostModal) {
  closeCreatePostModalBtn.addEventListener('click', () => {
    createPostModal.classList.add('is-hidden');
  });
}

if (createPostForm) {
  createPostForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('postTitle').value.trim();
    const category = document.getElementById('postCategory').value;
    const description = document.getElementById('postDesc').value.trim();

    if (!title || !description) return;

    try {
      await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templeId: userProfile.templeId,
          authorType: currentRole === 'temple_admin' ? 'temple' : 'user',
          authorName: currentRole === 'temple_admin' ? '台中萬春宮 廟方委員會' : userProfile.displayName,
          authorAvatar: currentRole === 'temple_admin' ? '廟' : '信',
          title,
          category,
          description,
          targetAmount: category === 'donation' ? 300000 : undefined
        })
      });

      createPostModal.classList.add('is-hidden');
      createPostForm.reset();
      loadCommunityPosts();
      playTempleChime(700, 0.5);
    } catch (err) {
      alert('發布失敗，請稍後再試。');
    }
  });
}

// ---------- Donations Tab Handler ----------
async function loadDonationCampaigns() {
  const container = document.getElementById('donationCampaignsList');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/posts?category=donation`);
    const campaigns = await res.json();

    container.innerHTML = campaigns
      .map((c) => {
        const target = c.targetAmount || 500000;
        const raised = c.raisedAmount || 0;
        const percent = Math.min(100, Math.round((raised / target) * 100));

        return `
        <div class="donation-card">
          <div class="donation-header-row">
            <h3>${escapeHtml(c.title)}</h3>
            <span class="temple-name-tag">台中萬春宮</span>
          </div>
          <p class="donation-desc">${escapeHtml(c.description)}</p>
          <div class="donation-progress-block">
            <div class="progress-bar-bg"><div class="progress-bar-fill" style="width: ${percent}%"></div></div>
            <div class="progress-labels">
              <span>已募集: <strong>NT$ ${raised.toLocaleString()}</strong> (${percent}%)</span>
              <span>目標: NT$ ${target.toLocaleString()}</span>
            </div>
          </div>
          <div class="donation-card-actions">
            <button class="btn-donate-primary" onclick="openDonationModal('${c.id}', '${escapeHtml(c.title)}')">❤️ 隨喜樂捐</button>
          </div>
        </div>
      `;
      })
      .join('');
  } catch (err) {
    container.innerHTML = '<div class="empty-feed-card">無法載入樂捐專案。</div>';
  }
}

// Donation Modal Open / Submit
const donationModal = document.getElementById('donationModal');
const closeDonationModalBtn = document.getElementById('closeDonationModalBtn');
const donationForm = document.getElementById('donationForm');
let activeCampaignId = null;

function openDonationModal(campaignId, title) {
  activeCampaignId = campaignId;
  const inputTitle = document.getElementById('donationCampaignTitle');
  if (inputTitle) inputTitle.value = title || '萬春宮 隨喜公益樂捐';
  if (donationModal) donationModal.classList.remove('is-hidden');
  playTempleChime(600, 0.3);
}

if (closeDonationModalBtn && donationModal) {
  closeDonationModalBtn.addEventListener('click', () => donationModal.classList.add('is-hidden'));
}

if (donationForm) {
  donationForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const amount = Number(document.getElementById('donateAmount').value);
    const name = document.getElementById('donorName').value.trim() || userProfile.displayName;

    try {
      const res = await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: userProfile.userId,
          templeId: userProfile.templeId,
          campaignId: activeCampaignId,
          amount,
          name
        })
      });
      const data = await res.json();
      donationModal.classList.add('is-hidden');
      alert(data.message || '感謝您的樂捐！');
      playTempleChime(750, 0.6);
      loadDonationCampaigns();
    } catch (err) {
      alert('樂捐記錄失敗，請稍後再試。');
    }
  });
}

// ---------- Profile & Dual Role Switcher ----------
function loadUserProfileUI() {
  const nameTitle = document.getElementById('userNameTitle');
  const lineIdEl = document.getElementById('userLineId');
  const badgeEl = document.getElementById('currentRoleBadge');
  const avatarEl = document.getElementById('profileAvatarLarge');

  if (nameTitle) nameTitle.textContent = currentRole === 'temple_admin' ? '台中萬春宮 廟方管理者' : userProfile.displayName;
  if (lineIdEl) lineIdEl.textContent = `LINE ID: ${userProfile.userId}`;
  if (badgeEl) badgeEl.textContent = currentRole === 'temple_admin' ? '⛩️ 【宮廟管理者權限】' : '👤 【一般信眾權限】';
  if (avatarEl) avatarEl.textContent = currentRole === 'temple_admin' ? '廟' : (userProfile.displayName ? userProfile.displayName.charAt(0) : '信');

  document.querySelectorAll('.role-switch-btn').forEach((btn) => {
    if (btn.dataset.role === currentRole) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  loadMyPledges();
}

document.querySelectorAll('.role-switch-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    currentRole = btn.dataset.role;
    loadUserProfileUI();
    playTempleChime(640, 0.4);
  });
});

async function loadMyPledges() {
  const container = document.getElementById('myPledgeHistory');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/donations?userId=${userProfile.userId}`);
    const pledges = await res.json();

    if (!pledges || pledges.length === 0) {
      container.innerHTML = '<div class="my-item-card"><span>尚未參與樂捐專案</span></div>';
      return;
    }

    container.innerHTML = pledges
      .map(
        (p) => `
      <div class="my-item-card">
        <span>樂捐金額: NT$ ${p.amount.toLocaleString()}</span>
        <span class="badge-status-gold">${new Date(p.createdAt).toLocaleDateString()}</span>
      </div>
    `
      )
      .join('');
  } catch (err) {
    container.innerHTML = '<div class="my-item-card"><span>無法載入樂捐歷史</span></div>';
  }
}

// ---------- LIFF Initialization & Login Integration ----------
async function initLiff() {
  if (window.liff) {
    try {
      const liffId = window.LIFF_ID || 'YOUR_LIFF_ID';
      await liff.init({ liffId });
      if (liff.isLoggedIn()) {
        const profile = await liff.getProfile();
        userProfile.userId = profile.userId;
        userProfile.displayName = profile.displayName || '善信大德';
        userProfile.pictureUrl = profile.pictureUrl || '';
      }
    } catch (err) {
      console.warn('LIFF init SDK skipped (running in browser local mode)');
    }
  }
  loadUserProfileUI();
}

initLiff();