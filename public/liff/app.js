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

// ---------- Floating Cute Divine Spirit Pet Mascot (神獸 焰寶) ----------
const divinePetWidget = document.getElementById('divinePetWidget');
const petSpeechBubble = document.getElementById('petSpeechBubble');

if (divinePetWidget) {
  divinePetWidget.addEventListener('click', () => {
    playTempleChime(784, 0.4);

    // Cute double bounce jump animation
    divinePetWidget.classList.remove('is-jumping');
    void divinePetWidget.offsetWidth; // force DOM reflow
    divinePetWidget.classList.add('is-jumping');

    if (petSpeechBubble) {
      petSpeechBubble.querySelector('span').textContent = '請問！✨';
      setTimeout(() => {
        petSpeechBubble.querySelector('span').textContent = '問我！🐾';
      }, 3000);
    }

    // Switch tab to "問廟公"
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('is-active'));

    const askTabBtn = document.querySelector('.tab-btn[data-tab="ask"]');
    const askPanel = document.getElementById('tab-ask');

    if (askTabBtn) askTabBtn.classList.add('is-active');
    if (askPanel) askPanel.classList.add('is-active');

    // Focus input field
    const askInput = document.getElementById('askInput');
    if (askInput) {
      setTimeout(() => askInput.focus(), 250);
    }
  });
}

// Function to sync Divine Pet Horn and Aura colors with selected deity
function setPetHornAndAuraColor(color) {
  const hornPath = document.getElementById('petHornPath');
  const hornBase = document.getElementById('petHornBase');
  const petAura = document.querySelector('.pet-aura-glow');

  if (hornPath) {
    hornPath.setAttribute('fill', color || '#ffd700');
  }
  if (hornBase) {
    hornBase.setAttribute('fill', color || '#c79a45');
  }
  if (petAura) {
    petAura.style.setProperty('--pet-aura-color', color || 'rgba(245, 158, 11, 0.6)');
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

// ---------- Researched Custom Deity Vector Symbols Map ----------
const DEITY_CUSTOM_ICONS = {
  mazu: `<svg class="deity-svg-icon" viewBox="0 0 36 36" fill="none"><path stroke="#ffd700" stroke-width="2" d="M6 24 C10 18, 26 18, 30 24"/><path fill="url(#mazuCrownGrad)" stroke="#ffd700" stroke-width="1.5" d="M10 20 L18 6 L26 20 Z"/><circle cx="18" cy="8" r="2.5" fill="#f59e0b"/><circle cx="11" cy="24" r="1.5" fill="#ffd700"/><circle cx="18" cy="24" r="1.5" fill="#ffd700"/><circle cx="25" cy="24" r="1.5" fill="#ffd700"/><line x1="11" y1="24" x2="11" y2="30" stroke="#ffd700" stroke-width="1.2" stroke-dasharray="1 1"/><line x1="18" y1="24" x2="18" y2="31" stroke="#ffd700" stroke-width="1.2" stroke-dasharray="1 1"/><line x1="25" y1="24" x2="25" y2="30" stroke="#ffd700" stroke-width="1.2" stroke-dasharray="1 1"/><path stroke="#38bdf8" stroke-width="1.5" fill="none" d="M4 31 Q 9 27, 18 31 T 32 31"/></svg>`,
  guanyin: `<svg class="deity-svg-icon" viewBox="0 0 36 36" fill="none"><path fill="#2dd4bf" opacity="0.6" d="M8 26 C 12 32, 24 32, 28 26 C 24 24, 12 24, 8 26 Z"/><path stroke="#5eead4" stroke-width="1.5" d="M11 25 C 18 30, 18 30, 25 25"/><path fill="url(#guanyinVaseGrad)" stroke="#5eead4" stroke-width="1.2" d="M16 12 C 14 16, 13 20, 15 24 L 21 24 C 23 20, 22 16, 20 12 Z"/><path stroke="#34d399" stroke-width="1.5" stroke-linecap="round" fill="none" d="M18 10 Q 24 4, 27 7"/><circle cx="18" cy="5" r="1.5" fill="#a7f3d0"/></svg>`,
  guangong: `<svg class="deity-svg-icon" viewBox="0 0 36 36" fill="none"><path fill="url(#guangongShieldGrad)" stroke="#f87171" stroke-width="1.2" d="M18 3 L 30 9 V 20 C 30 27, 18 33, 18 33 C 18 33, 6 27, 6 20 V 9 Z"/><path stroke="#ffd700" stroke-width="2" stroke-linecap="round" d="M12 28 L 24 8"/><path fill="#4ade80" stroke="#ffd700" stroke-width="1.2" d="M20 6 C 27 5, 30 11, 24 14 C 22 11, 20 8, 20 6 Z"/><circle cx="15" cy="23" r="2" fill="#ef4444"/></svg>`,
  tudigong: `<svg class="deity-svg-icon" viewBox="0 0 36 36" fill="none"><path fill="url(#tudiIngotGrad)" stroke="#ffd700" stroke-width="1.5" d="M6 16 C 6 12, 10 10, 18 10 C 26 10, 30 12, 30 16 C 30 24, 24 28, 18 28 C 12 28, 6 24, 6 16 Z"/><ellipse cx="18" cy="15" rx="8" ry="4" fill="#fef08a" stroke="#eab308" stroke-width="1"/><ellipse cx="18" cy="14" rx="4" ry="2.5" fill="#f59e0b"/><path stroke="#fbbf24" stroke-width="1.5" stroke-linecap="round" fill="none" d="M9 25 Q 18 32, 27 25"/></svg>`,
  yuelao: `<svg class="deity-svg-icon" viewBox="0 0 36 36" fill="none"><path fill="url(#yuelaoHeartGrad)" stroke="#f43f5e" stroke-width="1.5" d="M12 18 C 7 12, 6 22, 18 29 C 30 22, 29 12, 24 18 C 20 22, 16 22, 12 18 Z"/><path stroke="#ff4d4d" stroke-width="2" stroke-linecap="round" fill="none" d="M4 14 Q 12 8, 18 14 T 32 14"/><circle cx="18" cy="14" r="3" fill="#ffd700" stroke="#f43f5e" stroke-width="1"/></svg>`
};

// ---------- Deity Selector Pills & Cute Background Switch Animations ----------
function triggerCuteBgSwitchParticles(deityId, deityColor) {
  const bgPulse = document.getElementById('altarBgGlowPulse');
  const particleContainer = document.getElementById('deitySwitchParticles');

  if (bgPulse) {
    bgPulse.style.setProperty('--deity-accent', deityColor || 'rgba(245, 158, 11, 0.35)');
    bgPulse.classList.remove('is-pulsing');
    void bgPulse.offsetWidth; // force reflow
    bgPulse.classList.add('is-pulsing');
  }

  if (particleContainer) {
    const cuteSymbolsMap = {
      mazu: ['👑', '✨', '🌊', '⭐️', '💫', '🪷'],
      guanyin: ['🪷', '💧', '✨', '☸️', '💫', '⭐️'],
      guangong: ['⚔️', '🔥', '✨', '🛡️', '🌟', '💥'],
      tudigong: ['🪙', '🌾', '✨', '🍃', '💛', '🌟'],
      yuelao: ['💖', '🎀', '✨', '🌸', '💕', '💫']
    };

    const symbols = cuteSymbolsMap[deityId] || ['✨', '🌸', '💫', '⭐️', '🪷'];
    const count = 7;

    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'cute-bg-particle';
      p.textContent = symbols[i % symbols.length];
      
      const leftPos = 12 + Math.random() * 76;
      const bottomPos = 10 + Math.random() * 40;
      const delay = Math.random() * 0.18;
      const dur = 1.0 + Math.random() * 0.35;
      const scale = 0.7 + Math.random() * 0.6;

      p.style.left = `${leftPos}%`;
      p.style.bottom = `${bottomPos}px`;
      p.style.animationDelay = `${delay}s`;
      p.style.animationDuration = `${dur}s`;
      p.style.fontSize = `${scale}rem`;

      particleContainer.appendChild(p);
      setTimeout(() => p.remove(), (delay + dur + 0.2) * 1000);
    }
  }
}

const DEITY_FLAME_PALETTES = {
  mazu: {
    outer: 'linear-gradient(to top, #7a1f1f 0%, #b91c1c 30%, #f59e0b 75%, #ffd700 100%)',
    middle: 'linear-gradient(to top, #9b2c2c 0%, #f59e0b 50%, #ffe39d 100%)',
    glow: 'rgba(245, 158, 11, 0.65)'
  },
  guanyin: {
    outer: 'linear-gradient(to top, #0f766e 0%, #0d9488 30%, #2dd4bf 75%, #a7f3d0 100%)',
    middle: 'linear-gradient(to top, #115e59 0%, #2dd4bf 50%, #ccfbf1 100%)',
    glow: 'rgba(45, 212, 191, 0.65)'
  },
  guangong: {
    outer: 'linear-gradient(to top, #450a0a 0%, #991b1b 30%, #ef4444 75%, #fca5a5 100%)',
    middle: 'linear-gradient(to top, #7f1d1d 0%, #f87171 50%, #fecaca 100%)',
    glow: 'rgba(239, 68, 68, 0.65)'
  },
  tudigong: {
    outer: 'linear-gradient(to top, #78350f 0%, #b45309 30%, #e4c77a 75%, #fef08a 100%)',
    middle: 'linear-gradient(to top, #92400e 0%, #f59e0b 50%, #fef9c3 100%)',
    glow: 'rgba(228, 199, 122, 0.65)'
  },
  yuelao: {
    outer: 'linear-gradient(to top, #881337 0%, #be123c 30%, #ff7b7b 75%, #fda4af 100%)',
    middle: 'linear-gradient(to top, #9f1239 0%, #fb7185 50%, #ffe4e6 100%)',
    glow: 'rgba(255, 123, 123, 0.65)'
  }
};

function setDeityFlameColor(deityId) {
  const palette = DEITY_FLAME_PALETTES[deityId] || DEITY_FLAME_PALETTES.mazu;
  const root = document.documentElement;
  root.style.setProperty('--flame-outer', palette.outer);
  root.style.setProperty('--flame-middle', palette.middle);
  root.style.setProperty('--flame-glow', palette.glow);
}

document.querySelectorAll('.deity-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('.deity-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');

    const deityId = pill.dataset.deityId || 'mazu';
    const badge = pill.dataset.deityBadge || '主神 · 媽祖娘娘';
    const power = pill.dataset.deityPower || '';
    const freq = Number(pill.dataset.deityFreq) || 528;
    const color = pill.dataset.deityColor || '#f59e0b';

    const mainIconEl = document.getElementById('deityIconMain');
    const badgeTextEl = document.getElementById('deityBadgeText');
    const powerTagEl = document.getElementById('deityPowerTag');
    const burstEl = document.getElementById('divineBurst');
    const emblemEl = document.getElementById('deityAvatarEmblem');

    if (mainIconEl && DEITY_CUSTOM_ICONS[deityId]) {
      mainIconEl.innerHTML = DEITY_CUSTOM_ICONS[deityId];
    }
    if (badgeTextEl) badgeTextEl.textContent = badge;
    if (powerTagEl) powerTagEl.textContent = power;

    if (burstEl) {
      burstEl.classList.remove('is-animating');
      void burstEl.offsetWidth; // force DOM reflow to restart animation
      burstEl.classList.add('is-animating');
    }

    if (emblemEl) {
      emblemEl.classList.remove('is-switched');
      void emblemEl.offsetWidth; // force DOM reflow to restart animation
      emblemEl.classList.add('is-switched');
    }

    // Dynamic Header Sacred Flame Color Shift
    setDeityFlameColor(deityId);

    // Sync Divine Pet Mascot Horn & Aura Color with Selected Deity
    setPetHornAndAuraColor(color);

    // Trigger cute minimal background ambient glow & floating particle burst
    triggerCuteBgSwitchParticles(deityId, color);

    playTempleChime(freq, 0.4);
  });
});

// ---------- Daily Divine Blessing Card Swapper ----------
const DAILY_BLESSINGS = [
  '🌸 媽祖賜福：吉星高照 · 行路平安 · 萬事順心',
  '☸️ 觀音護佑：心境平和 · 慈悲喜捨 · 災厄遠離',
  '⚔️ 關帝加持：浩然正氣 · 小人退散 · 財源廣進',
  '🌾 土地公賜財：福德加被 · 聚寶納福 · 家和萬事興',
  '💖 月老牽線：佳偶天成 · 姻緣圓滿 · 喜氣洋洋',
  '🌟 文昌星君：智慧開朗 · 考運亨通 · 金榜題名'
];

const refreshBlessingBtn = document.getElementById('refreshBlessingBtn');
const dailyBlessingText = document.getElementById('dailyBlessingText');

if (refreshBlessingBtn && dailyBlessingText) {
  refreshBlessingBtn.addEventListener('click', () => {
    const randomBlessing = DAILY_BLESSINGS[Math.floor(Math.random() * DAILY_BLESSINGS.length)];
    dailyBlessingText.classList.remove('is-swapping');
    void dailyBlessingText.offsetWidth; // force DOM reflow
    dailyBlessingText.textContent = randomBlessing;
    dailyBlessingText.classList.add('is-swapping');
    playTempleChime(720, 0.3);
    if (navigator.vibrate) navigator.vibrate(30);
  });
}

// Function to trigger rising ember sparks on incense burner
function triggerIncenseSparks() {
  const burner = document.getElementById('incenseBurner');
  if (!burner) return;

  for (let i = 0; i < 10; i++) {
    const spark = document.createElement('span');
    spark.className = 'incense-ember-spark';
    const leftOffset = 25 + Math.random() * 50;
    const delay = Math.random() * 0.3;
    spark.style.left = `${leftOffset}%`;
    spark.style.bottom = '30px';
    spark.style.animationDelay = `${delay}s`;
    burner.appendChild(spark);
    setTimeout(() => spark.remove(), 1600);
  }
}

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

  // Trigger realistic ember sparks rising from incense sticks
  triggerIncenseSparks();

  if (navigator.vibrate) navigator.vibrate(40);
  playTempleChime(440, 0.6);
});

jiaoBtn.addEventListener('click', () => {
  const outcomes = ['聖筊 ✅ 神明應允', '笑筊，再擲一次', '陰筊，再擲一次'];
  const roll = Math.random();
  const outcome = roll < 0.5 ? outcomes[0] : roll < 0.75 ? outcomes[1] : outcomes[2];

  // Trigger 3D block flip animation & haptic wooden clack feedback
  if (blockLeft && blockRight) {
    blockLeft.classList.remove('toss-anim-left', 'convex');
    blockRight.classList.remove('toss-anim-right', 'convex');

    void blockLeft.offsetWidth; // trigger reflow
    blockLeft.classList.add('toss-anim-left');
    blockRight.classList.add('toss-anim-right');

    setTimeout(() => {
      if (outcome === outcomes[0]) {
        blockRight.classList.add('convex');
      } else if (outcome === outcomes[1]) {
      } else {
        blockLeft.classList.add('convex');
        blockRight.classList.add('convex');
      }
    }, 250);
  }

  // Double clack wooden chime & tactile double vibration
  playTempleChime(820, 0.2);
  setTimeout(() => playTempleChime(640, 0.25), 180);
  if (navigator.vibrate) navigator.vibrate([35, 45, 35]);

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
        subTitleText.textContent = `📍 最近宮廟：${nearest.name} (${nearest.distanceKm ?? 0} km)`;
      }
      if (deityBadgeText) {
        deityBadgeText.textContent = `🌸 主神 · ${nearest.name}${nearest.deity ? ` (${nearest.deity})` : ''}`;
      }
      if (locationBadge && locationBadgeText) {
        locationBadgeText.textContent = `📍 定位：${nearest.name} (${nearest.distanceKm ?? 0} km)`;
        locationBadge.classList.remove('is-hidden');
      }
    }

    renderNearbyList();
    playTempleChime(480, 0.5);
  } catch (err) {
    document.getElementById('nearbyList').innerHTML = `<p class="hint">無法取得位置：${err.message}</p>`;
  } finally {
    locateBtn.disabled = false;
    locateBtn.querySelector('span').textContent = '📍 重新定位';
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

// ---------- Smart Temple & Community Hub Extensions ----------

// 1. Follow Temple Toggle Button
const followTempleBtn = document.getElementById('followTempleBtn');
if (followTempleBtn) {
  followTempleBtn.addEventListener('click', () => {
    followTempleBtn.classList.toggle('is-following');
    const isFollowing = followTempleBtn.classList.contains('is-following');
    followTempleBtn.querySelector('span').textContent = isFollowing
      ? '✓ 已追蹤 (LINE 通知中)'
      : '＋ 追蹤宮廟';
    
    playTempleChime(720, 0.4);
    if (navigator.vibrate) navigator.vibrate(40);
  });
}

// 2. Activity Category Filters
document.querySelectorAll('#activityCategoryFilters .chip-btn').forEach((chip) => {
  chip.addEventListener('click', () => {
    document.querySelectorAll('#activityCategoryFilters .chip-btn').forEach((c) => c.classList.remove('is-active'));
    chip.classList.add('is-active');

    const cat = chip.dataset.cat;
    document.querySelectorAll('#activityFeedList .activity-card').forEach((card) => {
      if (cat === 'all' || card.dataset.category === cat) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });

    playTempleChime(520, 0.2);
  });
});

// 3. Join Activity Handler
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('btn-join-act')) {
    const btn = e.target;
    btn.classList.toggle('is-joined');
    const isJoined = btn.classList.contains('is-joined');
    btn.textContent = isJoined ? '✓ 已成功報名 (排入行事曆)' : '加入活動';

    const card = btn.closest('.activity-card');
    const title = card ? card.querySelector('.act-title').textContent : '共善活動';

    if (isJoined) {
      fireConfetti();
      playTempleChime(660, 0.5);
      if (navigator.vibrate) navigator.vibrate([40, 50, 40]);

      // Add to profile tab
      const myJoinedContainer = document.getElementById('myJoinedActivities');
      if (myJoinedContainer) {
        const item = document.createElement('div');
        item.className = 'my-item-card';
        item.innerHTML = `<span>${title}</span><span class="badge-status-green">已報名成功</span>`;
        myJoinedContainer.prepend(item);
      }
    }
  }
});

// 4. Target Pills Selector on Online Blessing
document.querySelectorAll('#targetPills .target-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#targetPills .target-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    playTempleChime(480, 0.2);
  });
});

// 5. Create Activity Modal Handler
const createModal = document.getElementById('createActivityModal');
const openCreateBtn = document.getElementById('openCreateActivityBtn');
const closeCreateBtn = document.getElementById('closeCreateModalBtn');
const createForm = document.getElementById('createActivityForm');

if (openCreateBtn && createModal) {
  openCreateBtn.addEventListener('click', () => {
    createModal.classList.remove('is-hidden');
    playTempleChime(600, 0.3);
  });
}

if (closeCreateBtn && createModal) {
  closeCreateBtn.addEventListener('click', () => {
    createModal.classList.add('is-hidden');
  });
}

if (createForm) {
  createForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const title = document.getElementById('actTitleInput').value.trim();
    const category = document.getElementById('actCategorySelect').value;
    const date = document.getElementById('actDateInput').value;
    const time = document.getElementById('actTimeInput').value;
    const location = document.getElementById('actLocationInput').value.trim();
    const capacity = document.getElementById('actCapacityInput').value;

    if (!title || !date || !time || !location) return;

    // Create new Activity Card
    const feed = document.getElementById('activityFeedList');
    if (feed) {
      const card = document.createElement('article');
      card.className = 'activity-card';
      card.dataset.category = category;
      card.innerHTML = `
        <div class="act-card-header">
          <span class="act-cat-badge">${category}</span>
          <span class="act-organizer">您 (信徒) 發起</span>
        </div>
        <h3 class="act-title">${title}</h3>
        <div class="act-meta-row">
          <span>📅 ${date} ${time}</span>
          <span>📍 ${location}</span>
        </div>
        <div class="act-participants-row">
          <div class="avatar-stack">
            <span class="avatar-dot a1"></span>
          </div>
          <span class="part-count">已報名 <strong>1 / ${capacity}</strong> 人</span>
        </div>
        <button class="btn-join-act is-joined">✓ 您已發起並參加</button>
      `;
      feed.prepend(card);
    }

    createForm.reset();
    createModal.classList.add('is-hidden');
    fireConfetti();
    playTempleChime(784, 0.5);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
  });
}

// 6. Donation Campaign Modal Handler
const donationModal = document.getElementById('donationModal');
const openDonationBtn = document.getElementById('openDonationBtn');
const closeDonationBtn = document.getElementById('closeDonationModalBtn');
const donationForm = document.getElementById('donationForm');
let currentDonationAmount = 100;

if (openDonationBtn && donationModal) {
  openDonationBtn.addEventListener('click', () => {
    donationModal.classList.remove('is-hidden');
    playTempleChime(660, 0.3);
  });
}

if (closeDonationBtn && donationModal) {
  closeDonationBtn.addEventListener('click', () => {
    donationModal.classList.add('is-hidden');
  });
}

document.querySelectorAll('#amountPills .amount-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#amountPills .amount-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    currentDonationAmount = Number(pill.dataset.val);

    const impactBox = document.getElementById('impactPreviewBox');
    if (impactBox) {
      const meals = Math.floor(currentDonationAmount / 100);
      impactBox.innerHTML = `<p>🎁 <strong>您的 $${currentDonationAmount} 護持代表：</strong> 為 ${meals || 1} 位偏鄉獨居長者提供熱騰騰的冬令平安餐點包。</p>`;
    }
    playTempleChime(480, 0.2);
  });
});

if (donationForm) {
  donationForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const donorName = document.getElementById('donorNameInput').value.trim();
    if (!donorName) return;

    // Add to My Profile Tab
    const myDonations = document.getElementById('myDonations');
    if (myDonations) {
      const item = document.createElement('div');
      item.className = 'my-item-card';
      item.innerHTML = `<span>❤️ 萬春宮冬季送暖 ($${currentDonationAmount})</span><span class="badge-status-gold">已護持成功</span>`;
      myDonations.prepend(item);
    }

    donationForm.reset();
    donationModal.classList.add('is-hidden');
    fireConfetti();
    playTempleChime(880, 0.6);
    if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
  });
}

// 7. Offerings Support Buttons (.offering-btn-act)
document.addEventListener('click', (e) => {
  if (e.target && e.target.classList.contains('offering-btn-act')) {
    const btn = e.target;
    const type = btn.dataset.offering;
    const label = type === 'rice' ? '🍚 平安米供養 1 包 ($100)' : '🍱 平安福食供齋 1 份 ($80)';

    btn.textContent = '✓ 已發心支持';
    btn.style.background = 'rgba(15, 118, 110, 0.3)';
    btn.style.color = '#6ee7b7';

    const myDonations = document.getElementById('myDonations');
    if (myDonations) {
      const item = document.createElement('div');
      item.className = 'my-item-card';
      item.innerHTML = `<span>${label}</span><span class="badge-status-gold">功德迴向中</span>`;
      myDonations.prepend(item);
    }

    fireConfetti();
    playTempleChime(660, 0.4);
    if (navigator.vibrate) navigator.vibrate(40);
  }
});
