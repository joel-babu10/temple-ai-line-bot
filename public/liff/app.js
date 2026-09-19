const API_BASE = '/api';

// ---------- Background Ember Sparks Particle Generator ----------
(function initEmberSparks() {
  const container = document.getElementById('sparkDustContainer');
  if (!container) return;

  const sparkCount = 18;
  for (let i = 0; i < sparkCount; i++) {
    const particle = document.createElement('div');
    particle.className = 'ember-particle';

    const leftPos = Math.random() * 100;
    const delay = Math.random() * 5;
    const duration = 4 + Math.random() * 4;
    const size = 2 + Math.random() * 3;

    particle.style.left = `${leftPos}vw`;
    particle.style.animationDelay = `${delay}s`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;

    container.appendChild(particle);
  }
})();

// ---------- Web Audio API Temple Bell Chime Synthesizer ----------
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
  } catch (e) {
    // Ignore audio errors
  }
}

// ---------- LIFF init ----------
async function initLiff() {
  try {
    await liff.init({ liffId: window.APP_CONFIG.LIFF_ID });
  } catch (err) {
    console.warn('LIFF init skipped (running outside LINE):', err.message);
  }
}
initLiff();

// ---------- Tabs ----------
document.querySelectorAll('.tab-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('is-active'));
    btn.classList.add('is-active');
    document.getElementById(`tab-${btn.dataset.tab}`).classList.add('is-active');
    playTempleChime(320, 0.2);
  });
});

// ---------- Divination flow with 3D Moon Blocks & Incense Visuals ----------
const incenseBtn = document.getElementById('incenseBtn');
const jiaoBtn = document.getElementById('jiaoBtn');
const jiaoResult = document.getElementById('jiaoResult');
const drawBtn = document.getElementById('drawBtn');
const fortuneCard = document.getElementById('fortuneCard');
const interpretBox = document.getElementById('interpretBox');
const incenseBurner = document.getElementById('incenseBurner');
const blockLeft = document.getElementById('blockLeft');
const blockRight = document.getElementById('blockRight');

let currentFortune = null;

incenseBtn.addEventListener('click', () => {
  incenseBtn.disabled = true;
  incenseBtn.querySelector('span:last-child').textContent = '已上香 🙏';
  jiaoBtn.disabled = false;

  if (incenseBurner) {
    incenseBurner.classList.add('is-lit');
  }

  playTempleChime(440, 0.6);
});

jiaoBtn.addEventListener('click', () => {
  const outcomes = ['聖筊 ✅ 神明應允', '笑筊，再擲一次', '陰筊，再擲一次'];
  const roll = Math.random();
  const outcome = roll < 0.5 ? outcomes[0] : roll < 0.75 ? outcomes[1] : outcomes[2];

  // Trigger 3D block flip animation
  if (blockLeft && blockRight) {
    blockLeft.classList.remove('toss-anim-left', 'convex');
    blockRight.classList.remove('toss-anim-right', 'convex');

    void blockLeft.offsetWidth; // trigger reflow
    blockLeft.classList.add('toss-anim-left');
    blockRight.classList.add('toss-anim-right');

    setTimeout(() => {
      if (outcome === outcomes[0]) {
        // 聖筊: One flat (up), one convex (down)
        blockRight.classList.add('convex');
      } else if (outcome === outcomes[1]) {
        // 笑筊: Both flat (up)
      } else {
        // 陰筊: Both convex (down)
        blockLeft.classList.add('convex');
        blockRight.classList.add('convex');
      }
    }, 250);
  }

  jiaoResult.textContent = outcome;

  if (outcome === outcomes[0]) {
    drawBtn.disabled = false;
    fireConfetti();
    playTempleChime(528, 0.8);
  } else {
    playTempleChime(280, 0.4);
  }
});

drawBtn.addEventListener('click', async () => {
  drawBtn.disabled = true;
  const res = await fetch(`${API_BASE}/fortune/draw`);
  currentFortune = await res.json();

  document.getElementById('fortuneGrade').textContent = currentFortune.grade;
  document.getElementById('fortunePoem').textContent = currentFortune.poem;
  document.getElementById('fortuneTheme').textContent = `主題：${currentFortune.theme}`;
  fortuneCard.classList.remove('is-hidden');
  interpretBox.classList.remove('is-hidden');
  fireConfetti();
  playTempleChime(660, 1.0);
});

function fireConfetti() {
  if (typeof confetti !== 'function') return;
  confetti({
    particleCount: 65,
    spread: 70,
    startVelocity: 35,
    origin: { y: 0.6 },
    colors: ['#c79a45', '#e4c77a', '#7a1f1f', '#ffe39d', '#f59e0b']
  });
}

const askInterpretBtn = document.getElementById('askInterpretBtn');
const questionInput = document.getElementById('questionInput');

async function handleInterpretQuery() {
  const question = questionInput.value.trim();
  if (!question || !currentFortune) return;

  appendChat('interpretChat', question, 'user');
  questionInput.value = '';

  const res = await fetch(`${API_BASE}/fortune/interpret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fortuneId: currentFortune.id, question })
  });
  const data = await res.json();
  appendChat('interpretChat', data.reply, 'ai');
}

if (askInterpretBtn) askInterpretBtn.addEventListener('click', handleInterpretQuery);
if (questionInput) {
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInterpretQuery();
    }
  });
}

function appendChat(containerId, text, role) {
  const el = document.createElement('div');
  el.className = `chat-bubble ${role}`;
  el.textContent = text;
  document.getElementById(containerId).appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ---------- Tab 3: Interactive Online Blessing Lamp Wall ----------
let totalLamps = 1286;
let activeBlessingType = '平安順遂';

const initialLamps = [
  { name: '張信士', wish: '🌸 平安順遂' },
  { name: '李信士', wish: '💼 事業亨通' },
  { name: '陳信士', wish: '💖 良緣圓滿' },
  { name: '王信士', wish: '🎓 文昌金榜' },
  { name: '黃信士', wish: '💰 財運亨通' },
  { name: '林信士', wish: '🌸 平安順遂' }
];

function renderLampWall() {
  const grid = document.getElementById('lampWallGrid');
  if (!grid) return;
  grid.innerHTML = initialLamps
    .map(
      (l) => `
    <div class="blessing-lamp-card">
      <div class="lamp-name">${l.name}</div>
      <div class="lamp-wish">${l.wish}</div>
    </div>`
    )
    .join('');
}
renderLampWall();

// Blessing type selector
document.querySelectorAll('.blessing-type-btn').forEach((btn) => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.blessing-type-btn').forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    activeBlessingType = btn.dataset.type;
  });
});

const lightLampBtn = document.getElementById('lightLampBtn');
if (lightLampBtn) {
  lightLampBtn.addEventListener('click', () => {
    const nameInput = document.getElementById('blessingName');
    const name = nameInput.value.trim() || '虔誠信士';
    const wish = activeBlessingType;

    initialLamps.unshift({ name, wish });
    totalLamps += 1;

    document.getElementById('lampCounter').textContent = totalLamps.toLocaleString();
    renderLampWall();
    fireConfetti();
    playTempleChime(580, 0.9);

    if (nameInput) nameInput.value = '';
  });
}

// ---------- Nearby temples & Location ----------
let userLocation = null;
let cachedTemples = [];
let activeFilter = 'all';

document.getElementById('locateBtn').addEventListener('click', async () => {
  const locateBtn = document.getElementById('locateBtn');
  locateBtn.disabled = true;
  locateBtn.querySelector('span').textContent = '定位查詢中…';

  try {
    userLocation = await getLocation();
    const { lat, lng } = userLocation;
    const res = await fetch(`${API_BASE}/temples/nearby?lat=${lat}&lng=${lng}`);
    cachedTemples = await res.json();

    if (cachedTemples.length > 0) {
      const nearest = cachedTemples[0];
      const subTitleText = document.getElementById('subTitleText');
      const deityBadgeText = document.getElementById('deityBadgeText');
      const locationBadge = document.getElementById('locationBadge');
      const locationBadgeText = document.getElementById('locationBadgeText');

      if (subTitleText) {
        subTitleText.textContent = `📍 您附近的宮廟：${nearest.name} (約 ${nearest.distanceKm ?? 0} km)`;
      }
      if (deityBadgeText) {
        deityBadgeText.textContent = `大殿主神 · ${nearest.name}${nearest.deity ? ` (${nearest.deity})` : ''}`;
      }
      if (locationBadge && locationBadgeText) {
        locationBadgeText.textContent = `已定位：距「${nearest.name}」約 ${nearest.distanceKm ?? 0} km`;
        locationBadge.classList.remove('is-hidden');
      }
    }

    renderNearbyList();
    playTempleChime(480, 0.5);
  } catch (err) {
    document.getElementById('nearbyList').innerHTML = `<p class="hint">無法取得位置：${err.message}</p>`;
  } finally {
    locateBtn.disabled = false;
    locateBtn.querySelector('span').textContent = '重新更新位置';
  }
});

// Deity filter chips
document.querySelectorAll('.chip-btn').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('.chip-btn').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');
    activeFilter = chip.dataset.filter;
    renderNearbyList();
  });
});

async function getLocation() {
  if (window.liff && liff.isInClient && liff.isInClient()) {
    try {
      const pos = await liff.getLocation();
      return { lat: pos.latitude, lng: pos.longitude };
    } catch (e) {
      // fall through
    }
  }
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error('此裝置不支援定位'));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(new Error(err.message))
    );
  });
}

function renderNearbyList() {
  const list = document.getElementById('nearbyList');
  if (!list) return;
  list.innerHTML = '';

  const filtered = cachedTemples.filter((t) => {
    if (activeFilter === 'all') return true;
    return (t.deity || '').includes(activeFilter) || (t.name || '').includes(activeFilter);
  });

  if (!filtered.length) {
    list.innerHTML = '<p class="hint">附近沒有符合此過濾條件的宮廟。</p>';
    return;
  }

  filtered.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'temple-card';
    const dist = t.distanceKm ?? 0;

    card.innerHTML = `
      <h3>${t.name}</h3>
      <p class="distance">距離約 ${dist} 公里</p>
      <p>${t.deity ? `主祀：${t.deity}　` : ''}${t.address || ''}</p>
      ${t.highlights ? `<p>${t.highlights}</p>` : ''}
      <button class="nav-trigger-btn" data-id="${t.id || ''}">
        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>
        <span>路線指引 (單車/步行/公車/開車)</span>
      </button>
      <div class="route-drawer is-hidden" id="drawer-${t.id || Math.random()}"></div>
    `;

    const navBtn = card.querySelector('.nav-trigger-btn');
    const drawer = card.querySelector('.route-drawer');

    navBtn.addEventListener('click', () => {
      const isHidden = drawer.classList.contains('is-hidden');
      document.querySelectorAll('.route-drawer').forEach((d) => d.classList.add('is-hidden'));

      if (isHidden) {
        renderRouteDrawer(drawer, t, userLocation);
        drawer.classList.remove('is-hidden');
      }
    });

    list.appendChild(card);
  });
}

// ---------- Animated Multi-Mode Route Drawer Renderer ----------
function renderRouteDrawer(container, temple, userLoc) {
  const dist = temple.distanceKm || 1.2;

  const walkMins = Math.round((dist / 4.5) * 60);
  const walkSteps = Math.round(dist * 1400);
  const walkCals = Math.round(dist * 50);

  const bikeMins = Math.max(2, Math.round((dist / 15) * 60));
  const bikeCals = Math.round(dist * 35);

  const transitMins = Math.max(5, Math.round((dist / 12) * 60) + 4);
  const driveMins = Math.max(3, Math.round((dist / 25) * 60) + 2);

  const gmapsUrl = temple.lat && temple.lng
    ? `https://www.google.com/maps/dir/?api=1&destination=${temple.lat},${temple.lng}`
    : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(temple.name)}`;

  container.innerHTML = `
    <div class="mode-tabs">
      <button class="mode-btn is-active" data-mode="transit">🚌 公車/火車</button>
      <button class="mode-btn" data-mode="bike">🚲 騎單車</button>
      <button class="mode-btn" data-mode="walk">🚶 徒步散步</button>
      <button class="mode-btn" data-mode="drive">🚗 開車/騎車</button>
    </div>

    <div class="mode-content" id="mode-content-box"></div>

    <a href="${gmapsUrl}" target="_blank" rel="noopener" class="gmaps-nav-btn">
      <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
      <span>開啟 Google Maps 導航</span>
    </a>
  `;

  const modeContentBox = container.querySelector('#mode-content-box');
  const modeBtns = container.querySelectorAll('.mode-btn');

  function updateMode(mode) {
    modeBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.mode === mode));

    let summaryText = '';
    let stepsHtml = '';

    if (mode === 'transit') {
      summaryText = `預估全程約 ${transitMins} 分鐘 (約 ${dist} km)`;
      const busLines = temple.nearestBus ? temple.nearestBus.join('、') : '市區公車';
      const rail = temple.nearestRail || '附近火車站';
      stepsHtml = `
        <div class="route-step">
          <div class="route-step-icon">🚶</div>
          <div>步行約 3 分鐘前往附近公車站牌</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">🚌</div>
          <div>搭乘公車於「${busLines}」下車 (或台鐵至${rail})</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">⛩️</div>
          <div>步行約 2 分鐘抵達 <strong>${temple.name}</strong> 正殿參拜</div>
        </div>
      `;
    } else if (mode === 'bike') {
      summaryText = `預估騎乘 ${bikeMins} 分鐘 | 消耗卡路里 約 ${bikeCals} kcal`;
      stepsHtml = `
        <div class="route-step">
          <div class="route-step-icon">🚲</div>
          <div>解鎖 YouBike / 騎乘單車出發</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">🚴</div>
          <div>沿市區自行車道 / 慢車道行駛約 ${dist} km</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">⛩️</div>
          <div>停放單車於廟前廣場，進入 <strong>${temple.name}</strong></div>
        </div>
      `;
    } else if (mode === 'walk') {
      summaryText = `預估徒步 ${walkMins} 分鐘 | 約 ${walkSteps.toLocaleString()} 步 | 消耗 ${walkCals} kcal`;
      stepsHtml = `
        <div class="route-step">
          <div class="route-step-icon">🚶</div>
          <div>享受沿途散步靜心，朝 ${temple.name} 方向前行</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">📍</div>
          <div>沿人行道步行約 ${dist} km (${walkSteps} 步)</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">⛩️</div>
          <div>抵達 <strong>${temple.name}</strong>，誠心敬香</div>
        </div>
      `;
    } else if (mode === 'drive') {
      summaryText = `預估車程 ${driveMins} 分鐘 (約 ${dist} km)`;
      stepsHtml = `
        <div class="route-step">
          <div class="route-step-icon">🚗</div>
          <div>沿主要幹道駕車/騎機車前行</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">🅿️</div>
          <div>停放至廟宇附屬停車場或周邊收費停車格</div>
        </div>
        <div class="route-step">
          <div class="route-step-icon">⛩️</div>
          <div>步行進入 <strong>${temple.name}</strong> 大殿參拜</div>
        </div>
      `;
    }

    modeContentBox.innerHTML = `
      <div class="route-summary-bar">
        <span>⏱️ <span class="eta">${summaryText}</span></span>
      </div>

      <div class="route-animation-box">
        <div class="pulse-line-container">
          <div class="moving-dot"></div>
        </div>
        <div class="route-timeline">
          ${stepsHtml}
        </div>
      </div>
    `;
  }

  // Default mode
  updateMode('transit');

  modeBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      updateMode(btn.dataset.mode);
      playTempleChime(360, 0.2);
    });
  });
}

// ---------- Festivals ----------
(async function loadFestivals() {
  const res = await fetch(`${API_BASE}/festivals`);
  const festivals = await res.json();
  const list = document.getElementById('festivalList');
  if (!list) return;

  if (!festivals.length) {
    list.innerHTML = '<p class="hint">近期沒有節慶活動。</p>';
    return;
  }

  list.innerHTML = festivals
    .map(
      (f) => `
      <div class="festival-card">
        <h3>${f.name}</h3>
        <p>${f.lunarDate}（國曆 ${f.date2026}）</p>
        <p class="days-away">${f.daysAway === 0 ? '就是今天！' : `還有 ${f.daysAway} 天`}</p>
        <p>${f.message}</p>
      </div>`
    )
    .join('');
})();

// ---------- Ask anything ----------
const askBtn = document.getElementById('askBtn');
const askInput = document.getElementById('askInput');

async function handleAskQuery() {
  const question = askInput.value.trim();
  if (!question) return;

  appendChat('askChat', question, 'user');
  askInput.value = '';

  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  const data = await res.json();
  appendChat('askChat', data.reply, 'ai');
}

if (askBtn) askBtn.addEventListener('click', handleAskQuery);
if (askInput) {
  askInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAskQuery();
    }
  });
}
