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

// ---------- Floating Cute Divine Spirit Pet Mascot (神獸 焰寶 - 可自由拖曳移動) ----------
const divinePetWidget = document.getElementById('divinePetWidget');
const petSpeechBubble = document.getElementById('petSpeechBubble');

if (divinePetWidget) {
  let isDragging = false;
  let startX = 0, startY = 0;
  let initialLeft = 0, initialTop = 0;
  let totalDragDistance = 0;

  function onDragStart(e) {
    totalDragDistance = 0;
    isDragging = false;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    startX = clientX;
    startY = clientY;

    const rect = divinePetWidget.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    divinePetWidget.style.right = 'auto';
    divinePetWidget.style.bottom = 'auto';
    divinePetWidget.style.left = `${initialLeft}px`;
    divinePetWidget.style.top = `${initialTop}px`;
    divinePetWidget.classList.add('is-dragging');

    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    document.addEventListener('touchmove', onDragMove, { passive: false });
    document.addEventListener('touchend', onDragEnd);
  }

  function onDragMove(e) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    const dx = clientX - startX;
    const dy = clientY - startY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    totalDragDistance = dist;

    if (dist > 6) {
      isDragging = true;
      if (e.cancelable) e.preventDefault();
      const newLeft = Math.max(8, Math.min(window.innerWidth - divinePetWidget.offsetWidth - 8, initialLeft + dx));
      const newTop = Math.max(8, Math.min(window.innerHeight - divinePetWidget.offsetHeight - 8, initialTop + dy));

      divinePetWidget.style.left = `${newLeft}px`;
      divinePetWidget.style.top = `${newTop}px`;
    }
  }

  function onDragEnd() {
    divinePetWidget.classList.remove('is-dragging');
    document.removeEventListener('mousemove', onDragMove);
    document.removeEventListener('mouseup', onDragEnd);
    document.removeEventListener('touchmove', onDragMove);
    document.removeEventListener('touchend', onDragEnd);
  }

  divinePetWidget.addEventListener('mousedown', onDragStart);
  divinePetWidget.addEventListener('touchstart', onDragStart, { passive: true });

  divinePetWidget.addEventListener('click', (e) => {
    if (totalDragDistance > 8) {
      e.stopImmediatePropagation();
      return;
    }

    playTempleChime(784, 0.4);

    // Cute double bounce jump animation
    divinePetWidget.classList.remove('is-jumping');
    void divinePetWidget.offsetWidth; // force DOM reflow
    divinePetWidget.classList.add('is-jumping');

    if (petSpeechBubble) {
      petSpeechBubble.querySelector('span').textContent = '請問！';
      setTimeout(() => {
        petSpeechBubble.querySelector('span').textContent = '問我';
      }, 3000);
    }

    // Switch tab to "個人與 AI" (profile tab)
    document.querySelectorAll('.tab-btn').forEach((b) => b.classList.remove('is-active'));
    document.querySelectorAll('.tab-panel').forEach((p) => p.classList.remove('is-active'));

    const profileTabBtn = document.querySelector('.tab-btn[data-tab="profile"]');
    const profilePanel = document.getElementById('tab-profile');

    if (profileTabBtn) profileTabBtn.classList.add('is-active');
    if (profilePanel) profilePanel.classList.add('is-active');

    // Scroll to Ask AI input and focus
    const askInput = document.getElementById('askInput');
    if (askInput) {
      askInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => askInput.focus(), 300);
    }

    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
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
let currentUserId = null;

async function getCurrentUserId() {
  if (currentUserId) return currentUserId;

  if (window.liff && liff.isLoggedIn && liff.isLoggedIn()) {
    try {
      const profile = await liff.getProfile();
      currentUserId = profile.userId;
      return currentUserId;
    } catch (err) {
      console.warn('liff.getProfile failed, falling back to local id:', err.message);
    }
  }

  // Outside LINE (local testing) — a stable per-browser id so donations/subscriptions
  // still work for demoing in a normal browser.
  let localId = localStorage.getItem('yanbao_local_user_id');
  if (!localId) {
    localId = 'local-' + Math.random().toString(36).slice(2, 12);
    localStorage.setItem('yanbao_local_user_id', localId);
  }
  currentUserId = localId;
  return currentUserId;
}

async function initLiff() {
  try {
    if (window.liff) {
      await liff.init({ liffId: window.APP_CONFIG.LIFF_ID });
      console.log('[LIFF] Initialized successfully. Logged in:', liff.isLoggedIn());
      if (liff.isLoggedIn()) {
        try {
          const profile = await liff.getProfile();
          console.log('[LIFF] Real LINE Profile Loaded:', profile.displayName);
          loggedInUser = {
            name: profile.displayName,
            nameShort: profile.displayName.length > 8 ? profile.displayName.substring(0, 8) + '...' : profile.displayName,
            handle: `@line_${profile.userId.substring(0, 6)}`,
            avatar: profile.pictureUrl
              ? `<img src="${profile.pictureUrl}" alt="LINE Avatar" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />`
              : '信',
            role: 'user',
            isOfficial: false,
            isLineVerified: true
          };
          localStorage.setItem('flame_logged_user', JSON.stringify(loggedInUser));
          updateHeaderLoginState();
          updateComposerUserAvatar();
        } catch (profileErr) {
          console.warn('[LIFF] getProfile failed:', profileErr.message);
        }
      }
    }
  } catch (err) {
    console.warn('LIFF init skipped (running outside LINE):', err.message);
  }
}
initLiff();

function updateComposerUserAvatar() {
  const avatarEl = document.querySelector('#postComposerWrap .composer-avatar');
  if (avatarEl && loggedInUser) {
    avatarEl.innerHTML = loggedInUser.avatar;
  }
}

// Maps the display names used in the UI (story bar, post cards) to backend temple ids,
// so following/donating actually targets the right record. Cached after first fetch.
let templeListCache = null;
async function resolveTempleIdByName(name) {
  if (!name) return null;
  if (!templeListCache) {
    try {
      const res = await fetch(`${API_BASE}/temples`);
      templeListCache = await res.json();
    } catch (err) {
      console.warn('failed to load temple list:', err.message);
      return null;
    }
  }
  const match = templeListCache.find((t) => name.includes(t.name) || t.name.includes(name));
  return match ? match.id : null;
}

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
  try {
    const res = await fetch(`${API_BASE}/fortune/draw`);
    currentFortune = await res.json();

    document.getElementById('fortuneGrade').textContent = currentFortune.grade;
    document.getElementById('fortunePoem').textContent = currentFortune.poem;
    document.getElementById('fortuneTheme').textContent = `主題：${currentFortune.theme}`;
    fortuneCard.classList.remove('is-hidden');
    interpretBox.classList.remove('is-hidden');
    fireConfetti();
    playTempleChime(660, 1.0);
  } catch (err) {
    console.error('[LIFF] Failed to draw fortune stick:', err);
    drawBtn.disabled = false;
    alert('抽籤時發生連線問題，請再試一次 🙏');
  }
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

async function handleInterpretQuery(customText) {
  const question = typeof customText === 'string' ? customText : questionInput.value.trim();
  if (!question || !currentFortune) return;

  appendChat('interpretChat', question, 'user');
  questionInput.value = '';

  showTyping('interpretTyping');

  try {
    const res = await fetch(`${API_BASE}/fortune/interpret`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fortuneId: currentFortune.id, question, language: currentLang })
    });
    const data = await res.json();
    hideTyping('interpretTyping');
    appendChat('interpretChat', data.reply, 'ai', '焰');
  } catch (e) {
    hideTyping('interpretTyping');
    const errText = currentLang === 'en' ? 'Connection error, please try again.' : '連線失敗，請稍後再試。';
    appendChat('interpretChat', errText, 'ai', '焰');
  }
}

if (askInterpretBtn) askInterpretBtn.addEventListener('click', () => handleInterpretQuery());
if (questionInput) {
  questionInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleInterpretQuery();
    }
  });
}

function appendChat(containerId, text, role, avatarLabel = role === 'user' ? '信' : '焰') {
  const container = document.getElementById(containerId);
  if (!container) return;

  const msgRow = document.createElement('div');
  msgRow.className = `chat-row ${role}`;

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const avatarHtml = role === 'user'
    ? `<div class="chat-avatar user-avatar">${avatarLabel}</div>`
    : `<div class="chat-avatar ai-avatar">${avatarLabel}</div>`;

  const formattedText = escapeHtml(text).replace(/\n/g, '<br>');

  const copyBtnHtml = role === 'ai'
    ? `<button class="btn-copy-bubble" title="複製內容" onclick="copyBubbleText(this)">
         <svg class="icon-sm" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
       </button>`
    : '';

  msgRow.innerHTML = `
    ${avatarHtml}
    <div class="bubble-wrapper">
      <div class="chat-bubble ${role}">
        <div class="bubble-content">${formattedText}</div>
        ${copyBtnHtml}
      </div>
      <span class="chat-timestamp">${timeStr}</span>
    </div>
  `;

  container.appendChild(msgRow);
  msgRow.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[m]);
}

function copyBubbleText(btn) {
  const content = btn.closest('.chat-bubble').querySelector('.bubble-content').innerText;
  navigator.clipboard.writeText(content).then(() => {
    btn.classList.add('is-copied');
    setTimeout(() => btn.classList.remove('is-copied'), 2000);
  });
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

// ---------- Global Multi-Language State & UI Switcher (zh-TW, en) ----------
let currentLang = 'zh-TW';

function showTyping(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('is-hidden');
}

function hideTyping(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('is-hidden');
}

// Ensure initial hidden state
hideTyping('askTyping');
hideTyping('interpretTyping');

function setLanguage(lang) {
  currentLang = lang;

  document.querySelectorAll('.lang-pill').forEach((btn) => {
    if (btn.dataset.lang === lang) {
      btn.classList.add('is-active');
    } else {
      btn.classList.remove('is-active');
    }
  });

  const isEn = lang === 'en';

  // Subtitle
  const subTitleText = document.getElementById('subTitleText');
  if (subTitleText) subTitleText.textContent = isEn ? 'Smart Worship · Sacred Steps · Warm Community' : '智慧參拜 · 聖道相伴 · 溫暖共善';

  // Tabbar Buttons
  const tabs = document.querySelectorAll('.tabbar .tab-btn');
  if (tabs.length >= 4) {
    tabs[0].querySelector('span').textContent = isEn ? 'Worship' : '參拜主頁';
    tabs[1].querySelector('span').textContent = isEn ? 'Map' : '宮廟地圖';
    tabs[2].querySelector('span').textContent = isEn ? 'Community' : '社群與廟宇';
    tabs[3].querySelector('span').textContent = isEn ? 'Profile' : '個人與 AI';
  }

  // Ask AI Card
  const askCardTitle = document.getElementById('askCardTitle');
  if (askCardTitle) askCardTitle.textContent = isEn ? 'Ask Flame AI Shrine Master' : '問焰智 AI 廟公';

  const askCardSub = document.getElementById('askCardSub');
  if (askCardSub) askCardSub.textContent = isEn ? 'Consult on temple history, rituals, and spiritual wisdom' : '線上請示宮廟歷史、參拜儀軌或人生智慧諮詢';

  const askInput = document.getElementById('askInput');
  if (askInput) askInput.placeholder = isEn ? 'Type your question for the Shrine Master...' : '請輸入您想向廟公請示的問題...';

  // Interpret Box
  const interpretBoxTitle = document.getElementById('interpretBoxTitle');
  if (interpretBoxTitle) interpretBoxTitle.textContent = isEn ? 'Flame AI Fortune Master' : '焰智 AI 解籤大師';

  const interpretBoxSub = document.getElementById('interpretBoxSub');
  if (interpretBoxSub) interpretBoxSub.textContent = isEn ? 'Deep guidance & poem interpretation' : '神明籤詩深度白話解析與指引';

  const interpretInputLabel = document.getElementById('interpretInputLabel');
  if (interpretInputLabel) interpretInputLabel.textContent = isEn ? 'Enter what you would like to inquire about (e.g., career/love/health):' : '請輸入您想請示的具體事項 (如事業/感情/健康)：';

  const questionInput = document.getElementById('questionInput');
  if (questionInput) questionInput.placeholder = isEn ? 'e.g., Is it a good time to change jobs?' : '例如：最近換工作好嗎？';

  // Login Modal
  const loginModalTitle = document.getElementById('loginModalTitle');
  if (loginModalTitle) loginModalTitle.textContent = isEn ? 'LINE Account Login (Demo)' : 'LINE 帳號身分登入 (Demo)';

  const loginModalSub = document.getElementById('loginModalSub');
  if (loginModalSub) loginModalSub.textContent = isEn ? 'Select your account login role:' : '請選擇您要登入的帳號身份類別：';

  // Quick Menu Card (Rich Menu Style in Web LIFF)
  const quickMenuHeaderTitle = document.querySelector('.quick-menu-header h3');
  if (quickMenuHeaderTitle) quickMenuHeaderTitle.textContent = isEn ? '⛩️ Temple Quick Services' : '⛩️ 廟宇快捷服務選單';

  const quickMenuHeaderSub = document.querySelector('.quick-menu-sub');
  if (quickMenuHeaderSub) quickMenuHeaderSub.textContent = isEn ? 'Tap any icon for quick online temple services' : '點擊即可快速使用線上宮廟服務';

  const menuLabels = document.querySelectorAll('.quick-menu-item .menu-item-label');
  if (menuLabels.length >= 6) {
    menuLabels[0].textContent = isEn ? 'Fortune Stick' : '求籤解籤';
    menuLabels[1].textContent = isEn ? 'Nearby Temples' : '附近宮廟';
    menuLabels[2].textContent = isEn ? 'Zodiac Check' : '太歲查詢';
    menuLabels[3].textContent = isEn ? 'Festivals' : '節慶提醒';
    menuLabels[4].textContent = isEn ? 'Light Lamp' : '線上點燈';
    menuLabels[5].textContent = isEn ? 'Ask Flame AI' : '問焰寶 AI';
  }

  // Post Composer Bar
  const togglePostComposerBtnSpan = document.querySelector('#togglePostComposerBtn span');
  if (togglePostComposerBtnSpan) togglePostComposerBtnSpan.textContent = isEn ? '＋ Publish Post / Announcement' : '＋ 發布隨手紀錄 / 宮廟公告';

  const publishXPostBtn = document.getElementById('publishXPostBtn');
  if (publishXPostBtn) publishXPostBtn.textContent = isEn ? 'Publish Post' : '發布貼文';

  const photoFileName = document.getElementById('photoFileName');
  if (photoFileName && photoFileName.textContent === '附圖') photoFileName.textContent = isEn ? 'Photo' : '附圖';

  const xPostInput = document.getElementById('xPostInput');
  if (xPostInput) xPostInput.placeholder = isEn ? 'Share your good deeds, temple visit notes, or blessings...' : '分享您的善行、隨手紀錄或參拜心得...';

  // Category Filter Chips
  const filterChips = document.querySelectorAll('#activityCategoryFilters .chip-btn');
  if (filterChips.length >= 5) {
    filterChips[0].textContent = isEn ? 'All Posts' : '全部動態';
    filterChips[1].textContent = isEn ? 'Announcements' : '宮廟公告';
    filterChips[2].textContent = isEn ? 'Hiking' : '健行踏青';
    filterChips[3].textContent = isEn ? 'Good Deeds' : '隨手善行';
    filterChips[4].textContent = isEn ? 'Culture' : '民俗文化';
  }

  // Dedicated Full Login Page
  const fullLoginNoticeText = document.getElementById('fullLoginNoticeText');
  if (fullLoginNoticeText) fullLoginNoticeText.textContent = isEn ? 'Log in with LINE or Temple Org Account to post and interact' : '登入 LINE 帳號或廟方機構帳號即可發布社群動態與交流';

  const closeFullLoginPageBtnSpan = document.querySelector('#closeFullLoginPageBtn span');
  if (closeFullLoginPageBtnSpan) closeFullLoginPageBtnSpan.textContent = isEn ? 'Back to App' : '返回 Web 參拜';

  updateChips(isEn);
}

// State Management: Persistent User Login Profile (LINE Believer / Temple Org)
let loggedInUser = null;

try {
  const saved = localStorage.getItem('flame_logged_user');
  if (saved) loggedInUser = JSON.parse(saved);
} catch (e) {
  console.warn('[app] Failed to load saved user profile:', e);
}

function showToast(msg) {
  let container = document.getElementById('flameToastNotice');
  if (!container) {
    container = document.createElement('div');
    container.id = 'flameToastNotice';
    container.style.cssText = 'position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(28,22,19,0.92);border:1px solid #c79a45;color:#efe6d8;padding:10px 18px;border-radius:999px;font-size:0.85rem;font-weight:600;z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,0.6);backdrop-filter:blur(8px);transition:all 0.3s ease;opacity:0;pointer-events:none;text-align:center;';
    document.body.appendChild(container);
  }
  container.textContent = msg;
  container.style.opacity = '1';
  container.style.transform = 'translateX(-50%) translateY(-6px)';
  clearTimeout(container._timer);
  container._timer = setTimeout(() => {
    container.style.opacity = '0';
    container.style.transform = 'translateX(-50%) translateY(0px)';
  }, 3000);
}

function updateHeaderLoginState() {
  const openLoginModalBtn = document.getElementById('openLoginModalBtn');
  const loginBtnText = document.getElementById('loginBtnText');
  if (!openLoginModalBtn || !loginBtnText) return;

  if (loggedInUser) {
    loginBtnText.textContent = currentLang === 'en'
      ? `✓ ${loggedInUser.nameShort || loggedInUser.name}`
      : `✓ ${loggedInUser.nameShort || loggedInUser.name} (已登入)`;
    openLoginModalBtn.classList.add('is-logged-in');
    openLoginModalBtn.title = currentLang === 'en' ? 'Logged In (Click to switch / logout)' : '已登入 (點擊可切換帳號或登出)';
  } else {
    loginBtnText.textContent = currentLang === 'en' ? 'LINE Login' : 'LINE 登入';
    openLoginModalBtn.classList.remove('is-logged-in');
    openLoginModalBtn.title = currentLang === 'en' ? 'LINE Login / Select Role' : 'LINE 登入 / 選擇身分';
  }
}

function requireLogin(callbackAction) {
  if (loggedInUser) {
    if (typeof callbackAction === 'function') callbackAction();
    return true;
  }
  if (window.liff && liff.isLoggedIn && !liff.isLoggedIn()) {
    console.log('[LIFF] User not logged in inside LINE. Redirecting to liff.login()...');
    liff.login();
    return false;
  }
  const fullLoginPage = document.getElementById('fullLoginPage');
  const demoLoginModal = document.getElementById('demoLoginModal');
  if (fullLoginPage) {
    fullLoginPage.classList.remove('is-hidden');
    playTempleChime(600, 0.3);
    window._pendingLoginCallback = callbackAction;
  } else if (demoLoginModal) {
    demoLoginModal.classList.remove('is-hidden');
    playTempleChime(600, 0.3);
    window._pendingLoginCallback = callbackAction;
  }
  return false;
}

// Initialize Header Login Button State
updateHeaderLoginState();

// Full-Screen Dedicated Login Page & Modal Handlers
const openLoginModalBtn = document.getElementById('openLoginModalBtn');
const demoLoginModal = document.getElementById('demoLoginModal');
const fullLoginPage = document.getElementById('fullLoginPage');
const closeLoginModalBtn = document.getElementById('closeLoginModalBtn');
const closeFullLoginPageBtn = document.getElementById('closeFullLoginPageBtn');
const loginAsBelieverBtn = document.getElementById('loginAsBelieverBtn');
const loginAsTempleBtn = document.getElementById('loginAsTempleBtn');
const fullLoginBelieverBtn = document.getElementById('fullLoginBelieverBtn');
const fullLoginTempleBtn = document.getElementById('fullLoginTempleBtn');

function handlePerformLogin(roleType) {
  if (roleType === 'believer') {
    loggedInUser = {
      name: 'LINE 善信大德',
      nameShort: '善信大德',
      handle: '@line_believer',
      avatar: '信',
      role: 'user',
      isOfficial: false
    };
  } else {
    loggedInUser = {
      name: '萬春宮 (台中媽祖)',
      nameShort: '萬春宮',
      handle: '@wanchun_official',
      avatar: '廟',
      role: 'temple',
      isOfficial: true
    };
  }
  localStorage.setItem('flame_logged_user', JSON.stringify(loggedInUser));

  if (fullLoginPage) fullLoginPage.classList.add('is-hidden');
  if (demoLoginModal) demoLoginModal.classList.add('is-hidden');

  updateHeaderLoginState();
  playTempleChime(roleType === 'believer' ? 680 : 720, 0.4);
  const successText = roleType === 'believer'
    ? (currentLang === 'en' ? '✅ Logged in as LINE Believer!' : '✅ 已成功以「LINE 信眾身分」登入！')
    : (currentLang === 'en' ? '✅ Logged in as Temple Org Manager!' : '✅ 已成功以「廟方機構管理者」登入！');
  showToast(successText);

  if (typeof window._pendingLoginCallback === 'function') {
    window._pendingLoginCallback();
    window._pendingLoginCallback = null;
  }
}

if (openLoginModalBtn) {
  openLoginModalBtn.addEventListener('click', () => {
    if (loggedInUser) {
      const confirmLogout = confirm(
        currentLang === 'en'
          ? `Currently logged in as "${loggedInUser.name}". Would you like to log out?`
          : `目前已登入身分：「${loggedInUser.name}」。是否要切換或登出帳號？`
      );
      if (confirmLogout) {
        loggedInUser = null;
        localStorage.removeItem('flame_logged_user');
        updateHeaderLoginState();
        showToast(currentLang === 'en' ? 'Logged out successfully.' : '已成功登出身分。');
      }
      return;
    }
    if (fullLoginPage) fullLoginPage.classList.remove('is-hidden');
    else if (demoLoginModal) demoLoginModal.classList.remove('is-hidden');
    playTempleChime(600, 0.3);
  });
}

if (closeLoginModalBtn && demoLoginModal) {
  closeLoginModalBtn.addEventListener('click', () => {
    demoLoginModal.classList.add('is-hidden');
  });
}

if (closeFullLoginPageBtn && fullLoginPage) {
  closeFullLoginPageBtn.addEventListener('click', () => {
    fullLoginPage.classList.add('is-hidden');
  });
}

if (loginAsBelieverBtn) loginAsBelieverBtn.addEventListener('click', () => handlePerformLogin('believer'));
if (loginAsTempleBtn) loginAsTempleBtn.addEventListener('click', () => handlePerformLogin('temple'));
if (fullLoginBelieverBtn) fullLoginBelieverBtn.addEventListener('click', () => handlePerformLogin('believer'));
if (fullLoginTempleBtn) fullLoginTempleBtn.addEventListener('click', () => handlePerformLogin('temple'));

function updateChips(isEn) {
  const askChips = document.getElementById('askChips');
  if (askChips) {
    askChips.innerHTML = isEn
      ? `<button class="chip-suggestion-btn" data-query="What is the proper ritual order for first-time temple worship?">🙏 Worship Rituals</button>
         <button class="chip-suggestion-btn" data-query="Which deity should I pray to for business and wealth?">💰 Wealth Blessing</button>
         <button class="chip-suggestion-btn" data-query="What is the difference between Tai Sui clash and pacification?">☯️ Tai Sui Guidance</button>
         <button class="chip-suggestion-btn" data-query="How does lighting a Blessing Lamp work?">🏮 Blessing Lamp</button>`
      : `<button class="chip-suggestion-btn" data-query="請問頭一次拜媽祖的儀軌順序？">🙏 參拜禮儀</button>
         <button class="chip-suggestion-btn" data-query="請問求財運該準備哪些供品？">💰 祈福求財</button>
         <button class="chip-suggestion-btn" data-query="請問犯太歲與安太歲的差異？">☯️ 安太歲</button>
         <button class="chip-suggestion-btn" data-query="請問如何點光明燈祈福？">🏮 點燈祈福</button>`;
  }

  const interpretChips = document.getElementById('interpretChips');
  if (interpretChips) {
    interpretChips.innerHTML = isEn
      ? `<button class="chip-suggestion-btn" data-query="Is it a good time to change my career or job?">💼 Career & Work</button>
         <button class="chip-suggestion-btn" data-query="How will my love life and relationships develop?">❤️ Love & Marriage</button>
         <button class="chip-suggestion-btn" data-query="What should I be mindful of regarding health?">🌿 Health & Peace</button>
         <button class="chip-suggestion-btn" data-query="What is my overall fortune and luck summary?">✨ Overall Fortune</button>`
      : `<button class="chip-suggestion-btn" data-query="請問最近換工作好嗎？">💼 工作事業</button>
         <button class="chip-suggestion-btn" data-query="請問感情姻緣如何發展？">❤️ 感情感情</button>
         <button class="chip-suggestion-btn" data-query="請問身體健康有何需要注意？">🌿 健康平安</button>
         <button class="chip-suggestion-btn" data-query="請問整體運勢吉凶如何？">✨ 綜合運勢</button>`;
  }
}

// Click listener for language pills
document.addEventListener('click', (e) => {
  const langPill = e.target.closest('.lang-pill');
  if (langPill) {
    setLanguage(langPill.dataset.lang);
  }
});

// Click listener for quick suggestion chips
document.addEventListener('click', (e) => {
  const chipBtn = e.target.closest('.chip-suggestion-btn');
  if (chipBtn) {
    const query = chipBtn.dataset.query;
    if (chipBtn.closest('#askChips')) {
      handleAskQuery(query);
    } else if (chipBtn.closest('#interpretChips')) {
      handleInterpretQuery(query);
    }
  }
});

// Clear Chat Action Buttons
const clearAskChatBtn = document.getElementById('clearAskChatBtn');
if (clearAskChatBtn) {
  clearAskChatBtn.addEventListener('click', () => {
    const chatLog = document.getElementById('askChat');
    if (chatLog) chatLog.innerHTML = '';
  });
}

const clearInterpretChatBtn = document.getElementById('clearInterpretChatBtn');
if (clearInterpretChatBtn) {
  clearInterpretChatBtn.addEventListener('click', () => {
    const chatLog = document.getElementById('interpretChat');
    if (chatLog) chatLog.innerHTML = '';
  });
}

// ---------- Ask anything Handler ----------
const askBtn = document.getElementById('askBtn');
const askInput = document.getElementById('askInput');

async function handleAskQuery(customText) {
  const question = typeof customText === 'string' ? customText : askInput.value.trim();
  if (!question) return;

  appendChat('askChat', question, 'user');
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
    const errText = currentLang === 'en' ? 'Connection error, please try again.' : '連線失敗，請稍後再試。';
    appendChat('askChat', errText, 'ai', '廟');
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
  donationForm.addEventListener('submit', async (e) => {
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

    // Persist the pledge — this donation campaign post is specifically 萬春宮's, so that's
    // the fixed target; a multi-temple donation feed would need the campaign id passed in.
    try {
      const userId = await getCurrentUserId();
      await fetch(`${API_BASE}/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, templeId: 'wanchun-gong', campaignId: 'don-1', amount: currentDonationAmount, name: donorName })
      });
    } catch (err) {
      console.warn('donation sync failed:', err.message);
    }
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

// 8. Online 光明燈 Modal & Target Selection
const lightLampModal = document.getElementById('lightLampModal');
const closeLampModalBtn = document.getElementById('closeLampModalBtn');
const lampSubmitForm = document.getElementById('lampSubmitForm');
let selectedLampType = 'guangming';

if (closeLampModalBtn && lightLampModal) {
  closeLampModalBtn.addEventListener('click', () => {
    lightLampModal.classList.add('is-hidden');
  });
}

// Global delegated listener for opening Light Lamp Modal
document.addEventListener('click', (e) => {
  const btn = e.target.closest('.open-lamp-modal, #openLampModalBtn, .act-lamp');
  if (btn) {
    if (lightLampModal) {
      lightLampModal.classList.remove('is-hidden');
      playTempleChime(660, 0.3);
    }
  }

  // Delegated listener for post-embedded donation button
  const donateBtn = e.target.closest('.act-donate');
  if (donateBtn) {
    if (donationModal) {
      donationModal.classList.remove('is-hidden');
      playTempleChime(660, 0.3);
    }
  }

  // Delegated listener for post-embedded rice offering button
  const riceBtn = e.target.closest('.act-rice');
  if (riceBtn && !riceBtn.dataset.done) {
    riceBtn.dataset.done = 'true';
    riceBtn.textContent = '✓ 已成功供養平安米';
    riceBtn.style.background = 'rgba(245, 158, 11, 0.3)';
    riceBtn.style.color = '#fde68a';

    const myDonations = document.getElementById('myDonations');
    if (myDonations) {
      const item = document.createElement('div');
      item.className = 'my-item-card';
      item.innerHTML = `<span>🍚 萬春宮平安米護持 1 包 ($100)</span><span class="badge-status-gold">福慧雙修</span>`;
      myDonations.prepend(item);
    }

    fireConfetti();
    playTempleChime(700, 0.4);
    if (navigator.vibrate) navigator.vibrate(40);
  }
});

// Modal Target Pills Selection
document.querySelectorAll('#modalTargetPills .target-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    document.querySelectorAll('#modalTargetPills .target-pill').forEach((p) => p.classList.remove('is-active'));
    pill.classList.add('is-active');
    playTempleChime(500, 0.2);
  });
});

// Modal Lamp Type Cards Selection
document.querySelectorAll('#modalLampGrid .lamp-type-card').forEach((card) => {
  card.addEventListener('click', () => {
    document.querySelectorAll('#modalLampGrid .lamp-type-card').forEach((c) => c.classList.remove('is-selected'));
    card.classList.add('is-selected');
    selectedLampType = card.dataset.lamp;
    playTempleChime(540, 0.2);
  });
});

if (lampSubmitForm) {
  lampSubmitForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('lampDevoteeName').value.trim();
    const bday = document.getElementById('lampDevoteeBday').value;
    const wish = document.getElementById('lampDevoteeWish').value.trim();

    if (!name) return;

    const typeNames = {
      guangming: '光明燈 (元辰光彩)',
      taisui: '太歲燈 (趨吉避凶)',
      wenchang: '文昌燈 (金榜題名)',
      caishen: '財神燈 (財源廣進)'
    };
    const lampTitle = typeNames[selectedLampType] || '光明燈';

    // Add to My Lamp Records in Profile
    const myLampsContainer = document.getElementById('myLampsContainer');
    if (myLampsContainer) {
      const item = document.createElement('div');
      item.className = 'my-item-card';
      item.innerHTML = `<span>🕯️ ${name} 的 ${lampTitle}</span><span class="badge-status-gold">點亮中 (至年底)</span>`;
      myLampsContainer.prepend(item);
    }

    lampSubmitForm.reset();
    if (lightLampModal) lightLampModal.classList.add('is-hidden');
    fireConfetti();
    playTempleChime(880, 0.6);
    if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
  });
}

// 9. X-Model Post Composer & Photo Upload Handler
const publishXPostBtn = document.getElementById('publishXPostBtn');
const xPostInput = document.getElementById('xPostInput');
const xPostFileInput = document.getElementById('xPostFileInput');
const xPostCategorySelect = document.getElementById('xPostCategorySelect');
const photoFileName = document.getElementById('photoFileName');
const photoPreviewThumb = document.getElementById('photoPreviewThumb');
let attachedPhotoData = null;

if (xPostFileInput) {
  xPostFileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      photoFileName.textContent = file.name.length > 8 ? file.name.substring(0, 8) + '...' : file.name;
      const reader = new FileReader();
      reader.onload = (evt) => {
        attachedPhotoData = evt.target.result;
        if (photoPreviewThumb) {
          photoPreviewThumb.classList.remove('is-hidden');
          photoPreviewThumb.innerHTML = `<span>📷 已附圖: ${file.name}</span>`;
        }
      };
      reader.readAsDataURL(file);
    }
  });
}

if (publishXPostBtn) {
  publishXPostBtn.addEventListener('click', () => {
    if (!requireLogin(() => publishXPostBtn.click())) return;

    const text = xPostInput.value.trim();
    const category = xPostCategorySelect ? xPostCategorySelect.value : '隨手善行';

    if (!text && !attachedPhotoData) return;

    const feed = document.getElementById('activityFeedList');
    if (feed) {
      const card = document.createElement('article');
      card.className = 'x-post-card' + (loggedInUser.isOfficial ? ' temple-official-card' : '');
      card.dataset.category = category;

      let photoHtml = '';
      if (attachedPhotoData) {
        photoHtml = `
          <div class="x-post-photo-card">
            <img src="${attachedPhotoData}" alt="隨手紀錄照片" style="width:100%;max-height:220px;object-fit:cover;display:block;" />
          </div>
        `;
      }

      const verifiedBadge = loggedInUser.isOfficial ? '<span class="x-verified-badge" title="官方驗證">✓ 官方</span>' : '';

      card.innerHTML = `
        <div class="x-post-header">
          <div class="x-post-avatar ${loggedInUser.isOfficial ? 'temple-avatar' : ''}">${loggedInUser.avatar}</div>
          <div class="x-post-user-info">
            <div class="x-user-title-row">
              <span class="x-user-name">${loggedInUser.name} (${currentLang === 'en' ? 'You' : '您'})</span>
              ${verifiedBadge}
              <span class="x-post-handle">${loggedInUser.handle}</span>
            </div>
            <span class="x-post-time">${currentLang === 'en' ? 'Just now' : '剛剛'} · ${category}</span>
          </div>
        </div>

        <div class="x-post-body">
          <p class="x-post-text">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>
          ${photoHtml}
        </div>

        <div class="x-social-bar">
          <button class="x-social-btn x-btn-reply" title="回覆">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            <span class="x-count">0</span>
          </button>
          <button class="x-social-btn x-btn-repost" title="轉發">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17 1l4 4-4 4"/><path d="M3 11V9a4 4 0 0 1 4-4h14"/><path d="M7 23l-4-4 4-4"/><path d="M21 13v2a4 4 0 0 1-4 4H3"/></svg>
            <span class="x-count">0</span>
          </button>
          <button class="x-social-btn x-btn-like" title="讚賞">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <span class="x-count">0</span>
          </button>
          <button class="x-social-btn x-btn-bookmark" title="收藏">
            <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/></svg>
          </button>
        </div>
      `;

      feed.prepend(card);
    }

    // Reset composer
    xPostInput.value = '';
    attachedPhotoData = null;
    if (photoFileName) photoFileName.textContent = '附圖';
    if (photoPreviewThumb) {
      photoPreviewThumb.classList.add('is-hidden');
      photoPreviewThumb.innerHTML = '';
    }
    const postComposerWrap = document.getElementById('postComposerWrap');
    const toggleBtn = document.getElementById('togglePostComposerBtn');
    if (postComposerWrap) {
      postComposerWrap.classList.remove('is-expanded');
      postComposerWrap.classList.add('is-collapsed');
    }
    if (toggleBtn) toggleBtn.classList.remove('is-active');

    fireConfetti();
    playTempleChime(750, 0.4);
    if (navigator.vibrate) navigator.vibrate([30, 40, 30]);
  });
}

// 10. X-Social Interaction Actions (Like, Repost, Bookmark)
document.addEventListener('click', (e) => {
  // Like Button Handler
  const likeBtn = e.target.closest('.x-btn-like');
  if (likeBtn) {
    likeBtn.classList.toggle('is-liked');
    const isLiked = likeBtn.classList.contains('is-liked');
    const countSpan = likeBtn.querySelector('.x-count');
    if (countSpan) {
      let count = parseInt(countSpan.textContent) || 0;
      countSpan.textContent = isLiked ? count + 1 : Math.max(0, count - 1);
    }
    playTempleChime(isLiked ? 660 : 440, 0.2);
    if (navigator.vibrate) navigator.vibrate(25);
  }

  // Repost Button Handler
  const repostBtn = e.target.closest('.x-btn-repost');
  if (repostBtn) {
    repostBtn.classList.toggle('is-reposted');
    const isReposted = repostBtn.classList.contains('is-reposted');
    const countSpan = repostBtn.querySelector('.x-count');
    if (countSpan) {
      let count = parseInt(countSpan.textContent) || 0;
      countSpan.textContent = isReposted ? count + 1 : Math.max(0, count - 1);
    }
    playTempleChime(580, 0.2);
    if (navigator.vibrate) navigator.vibrate(30);
  }

  // Bookmark Button Handler
  const bookmarkBtn = e.target.closest('.x-btn-bookmark');
  if (bookmarkBtn) {
    bookmarkBtn.classList.toggle('is-bookmarked');
    playTempleChime(500, 0.2);
  }
});

// 11. Followed Temples Instagram-Style Story Modal Handlers
const templeStoryModal = document.getElementById('templeStoryModal');
const closeStoryModalBtn = document.getElementById('closeStoryModalBtn');
const storyFollowBtn = document.getElementById('storyFollowBtn');

if (closeStoryModalBtn && templeStoryModal) {
  closeStoryModalBtn.addEventListener('click', () => {
    templeStoryModal.classList.add('is-hidden');
  });
}

document.querySelectorAll('#templeStoriesBar .story-item').forEach((item) => {
  item.addEventListener('click', () => {
    const templeName = item.dataset.temple || '宮廟';
    const subtitle = item.dataset.subtitle || '最新宮廟動態實況';
    const avatarTxt = item.dataset.img || '廟';

    const titleEl = document.getElementById('storyModalTitle');
    const avatarEl = document.getElementById('storyModalAvatar');
    const heroTitleEl = document.getElementById('storyHeroTitle');
    const heroDescEl = document.getElementById('storyHeroDesc');

    if (titleEl) titleEl.textContent = `${templeName} ｜ 限時動態`;
    if (avatarEl) avatarEl.textContent = avatarTxt;
    if (heroTitleEl) heroTitleEl.textContent = `${templeName} ${subtitle}`;
    if (heroDescEl) heroDescEl.textContent = `莊嚴祈福 · 線上觀禮祈祝平安 ｜ ${templeName} 官方頻道`;

    if (templeStoryModal) {
      templeStoryModal.classList.remove('is-hidden');
      playTempleChime(640, 0.3);
      if (navigator.vibrate) navigator.vibrate(30);
    }
  });
});

if (storyFollowBtn) {
  storyFollowBtn.addEventListener('click', async () => {
    storyFollowBtn.classList.toggle('is-following');
    const isFollowing = storyFollowBtn.classList.contains('is-following');
    storyFollowBtn.innerHTML = isFollowing
      ? '<span>✓ 已成功追蹤此宮廟 (LINE 通知開啟)</span>'
      : '<span>✓ 追蹤宮廟 (接收即時 LINE 動態通知)</span>';
    fireConfetti();
    playTempleChime(800, 0.5);
    if (navigator.vibrate) navigator.vibrate([40, 60, 40]);

    // Persist the follow so LINE can actually push activity/donation updates for this temple.
    const templeName = document.getElementById('storyModalTitle')?.textContent?.replace('｜ 限時動態', '').trim();
    const templeId = await resolveTempleIdByName(templeName);
    if (!templeId) return;
    try {
      const userId = await getCurrentUserId();
      await fetch(`${API_BASE}/subscriptions`, {
        method: isFollowing ? 'POST' : 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, templeId })
      });
    } catch (err) {
      console.warn('subscription sync failed:', err.message);
    }
  });
}

// 13. Collapsible Post Composer Toggle Bar Handler
const togglePostComposerBtn = document.getElementById('togglePostComposerBtn');
const postComposerWrap = document.getElementById('postComposerWrap');

if (togglePostComposerBtn && postComposerWrap) {
  togglePostComposerBtn.addEventListener('click', () => {
    const isCollapsed = postComposerWrap.classList.contains('is-collapsed');
    if (isCollapsed) {
      if (!requireLogin(() => {
        postComposerWrap.classList.remove('is-collapsed');
        postComposerWrap.classList.add('is-expanded');
        togglePostComposerBtn.classList.add('is-active');
        const postInput = document.getElementById('xPostInput');
        if (postInput) setTimeout(() => postInput.focus(), 250);
      })) return;

      postComposerWrap.classList.remove('is-collapsed');
      postComposerWrap.classList.add('is-expanded');
      togglePostComposerBtn.classList.add('is-active');
      const postInput = document.getElementById('xPostInput');
      if (postInput) setTimeout(() => postInput.focus(), 250);
    } else {
      postComposerWrap.classList.remove('is-expanded');
      postComposerWrap.classList.add('is-collapsed');
      togglePostComposerBtn.classList.remove('is-active');
    }
    playTempleChime(600, 0.2);
    if (navigator.vibrate) navigator.vibrate(25);
  });
}

// 14. Floating Animated "+" Creation FAB Menu Handlers
const fabCreateWrapper = document.getElementById('fabCreateWrapper');
const fabCreateBtn = document.getElementById('fabCreateBtn');
const fabOptionPost = document.getElementById('fabOptionPost');
const fabOptionEvent = document.getElementById('fabOptionEvent');

if (fabCreateBtn && fabCreateWrapper) {
  fabCreateBtn.addEventListener('click', () => {
    fabCreateWrapper.classList.toggle('is-expanded');
    const isExpanded = fabCreateWrapper.classList.contains('is-expanded');
    playTempleChime(isExpanded ? 720 : 480, 0.2);
    if (navigator.vibrate) navigator.vibrate(30);
  });
}

if (fabOptionPost) {
  fabOptionPost.addEventListener('click', () => {
    if (fabCreateWrapper) fabCreateWrapper.classList.remove('is-expanded');
    if (postComposerWrap) {
      postComposerWrap.classList.remove('is-collapsed');
      postComposerWrap.classList.add('is-expanded');
    }
    if (togglePostComposerBtn) togglePostComposerBtn.classList.add('is-active');
    const postInput = document.getElementById('xPostInput');
    if (postInput) {
      postInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => postInput.focus(), 300);
    }
    playTempleChime(660, 0.2);
  });
}

if (fabOptionEvent) {
  fabOptionEvent.addEventListener('click', () => {
    if (fabCreateWrapper) fabCreateWrapper.classList.remove('is-expanded');
    const createModal = document.getElementById('createActivityModal');
    if (createModal) {
      createModal.classList.remove('is-hidden');
    }
    playTempleChime(660, 0.2);
  });
}

// 15. Complete Multi-Language (i18n) Engine (zh-TW & en)
const I18N_DICT = {
  'zh-TW': {
    loginBtnText: 'LINE 登入',
    chimeOn: '磬音: 開',
    chimeOff: '磬音: 關',
    subTitleText: 'Smart Worship · Sacred Steps · Warm Community',
    tabDivination: '參拜主頁',
    tabNearby: '宮廟地圖',
    tabCommunity: '社群與廟宇',
    tabProfile: '個人與 AI',
    
    // Altar Deity Selector
    mazuBadge: '主神 · 媽祖娘娘',
    mazuPower: '神威：航海護國 · 災厄消除',
    mazuLabel: '媽祖',
    guanyinBadge: '主神 · 觀音佛祖',
    guanyinPower: '神威：慈悲救苦 · 隨感隨應',
    guanyinLabel: '觀音',
    guangongBadge: '主神 · 關聖帝君',
    guangongPower: '神威：忠義鎮宅 · 招財伏魔',
    guangongLabel: '關帝',
    tudigongBadge: '主神 · 福德正神',
    tudigongPower: '神威：保佑地脈 · 賜福聚財',
    tudigongLabel: '土地公',
    yuelaoBadge: '主神 · 月老星君',
    yuelaoPower: '神威：紅線牽緣 · 婚姻圓滿',
    yuelaoLabel: '月老',

    altarGuide: '虔心許願 · 焰寶神尊為您指點迷津',
    burnerPot: '鼎',
    incenseBtn: '點香敬拜',
    jiaoBtn: '聖筊請示',
    drawBtn: '誠心抽籤',
    cinnabarStamp: '聖母靈印',
    cardTag: '天上聖母靈籤',
    
    // AI Interpretation Box
    interpretBoxTitle: '焰智 AI 解籤大師',
    interpretBoxSub: '神明籤詩深度白話解析與指引',
    interpretChip1: '💼 工作事業',
    interpretChip2: '❤️ 感情感情',
    interpretChip3: '🌿 健康平安',
    interpretChip4: '✨ 綜合運勢',
    interpretInputLabel: '請輸入您想請示的具體事項 (如事業/感情/健康)：',
    questionPlaceholder: '例如：最近換工作好嗎？',

    // Daily Quote & Talisman
    dailyQuoteTitle: '每日平安箴言',
    dailyQuoteVerse: '「諸惡莫作，眾善奉行；自淨其意，是諸佛教。」',
    dailyQuoteSource: '— 萬春宮 天上聖母 賜福箴言',
    blessingCardTitle: '每日靈驗平安符',
    refreshBlessingBtn: '換平安符',
    dailyBlessingText: '媽祖賜福：吉星高照 · 行路平安 · 萬事順心',
    petAskText: '問我！🐾',

    // Tab 2: Map
    nearbyTitle: '周邊參拜宮廟導覽地圖',
    nearbyDesc: '定位尋找周邊道場與最佳參拜路線 (步行/單車/公車/開車)',
    locateBtnText: '定位找附近宮廟',
    locatedBadge: '已定位附近宮廟',
    filterAll: '全選',

    // Tab 3: Community
    toggleComposerText: '＋ 發布隨手紀錄 / 宮廟公告',
    postPlaceholder: '分享您的善行、隨手紀錄或參拜心得...',
    attachPhotoText: '附圖',
    catSelectAnnounce: '宮廟公告',
    catSelectHike: '健行活動',
    catSelectGoodDeed: '隨手善行',
    catSelectCulture: '民俗文化',
    publishBtnText: '發布貼文',
    filterAllPosts: '全部動態',
    
    // Official Post 1
    post1Title: '萬春宮 ｜ 天上聖母中秋祈安 & 冬季偏鄉送暖計畫',
    post1Text: '萬春宮誠邀廣大信眾共修福田！除了臨廟參拜外，線上同步開放安點光明燈與冬令平安米供養，隨喜護持偏鄉獨居長者與弱勢家庭。',
    post1DonateBtn: '支持送暖捐款',
    post1LampBtn: '為家人線上點燈',
    post1RiceBtn: '供養平安米 ($100)',
    
    // Impact Dashboard
    impactTitle: '本月共善影響力數據',
    impactSub: '信仰結合真實生活',
    impactStat1: '平安米捐贈',
    impactStat2: '愛心平安餐',
    impactStat3: '環境保護活動',
    impactStat4: '共善參與者',

    // Devotee Posts
    post2Text: '今天與志工團一行人前往大肚溪步道隨手撿垃圾與淨川，沿途祈福平安。願山川無災，大眾福慧雙修！',
    post3Title: '週末八卦山步道清晨祈福走山活動號召',
    post3Text: '本週六早晨 08:00 AM 預計於八卦山大佛廣場集合走步道，歡迎喜愛健行運動的同修信眾一同參與！',
    post3JoinBtn: '加入健行活動',

    fabPostText: '發布隨手紀錄',
    fabEventText: '發起共善活動',

    // Tab 4: Profile
    profileHeaderTitle: '善信大德',
    profileSubText: '功德值：520 分 ｜ 榮譽修持信士',
    askCardTitle: '問焰智 AI 廟公',
    askCardSub: '線上請示宮廟歷史、參拜儀軌或人生智慧諮詢',
    askChip1: '🙏 參拜禮儀',
    askChip2: '💰 祈福求財',
    askChip3: '☯️ 安太歲',
    askChip4: '🏮 點燈祈福',
    askInputPlaceholder: '請輸入您想向廟公請示的問題...',
    secFollowedTemples: '我追蹤的宮廟',
    secJoinedActivities: '我參與的共善活動',
    secDonations: '我的點燈、供養與捐款紀錄',

    // Modals
    lampModalTitle: '線上點燈與供養祈福儀軌',
    targetSelf: '自己',
    targetFamily: '家人',
    targetFriends: '親友',
    lampNameLabel: '祈福者/信士姓名：',
    lampNamePlaceholder: '例如：張大明',
    lampTypeLabel: '選擇安燈/供養種類：',
    lampOption1: '光明燈 (元辰光彩)',
    lampOption2: '太歲燈 (化解太歲)',
    lampOption3: '文昌燈 (金榜題名)',
    lampOption4: '姻緣燈 (良緣圓滿)',
    lampOption5: '平安米供養 ($100)',
    lampOption6: '平安福食供齋 ($80)',
    lampWishLabel: '祈願心願/祝禱文 (選填)：',
    lampWishPlaceholder: '例如：祈求合家平安、事業順遂',
    lampNoticeText: '點亮之燭光將於萬春宮神前同步安奉，發送 LINE 祈福開光通知。',
    lampSubmitBtnText: '點亮燭光 (發送 LINE 祈福紀錄)',

    donationModalTitle: '萬春宮 ｜ 冬季偏鄉送暖計畫',
    donorNameLabel: '護持信士姓名：',
    donorWishLabel: '祈福迴向祝禱文 (選填)：',
    donorSubmitBtnText: '隨喜護持 (發送 LINE 祈福紀錄)',

    fullLoginReturnBtn: '返回 Web 參拜',
    fullLoginHeroSub: '開啟完整的智慧參拜、隨手善行發布與宮廟動態互動',
    fullLoginNoticeText: '登入 LINE 帳號或廟方機構帳號即可發布社群動態與交流',
    fullLoginBelieverTitle: 'LINE 信眾身分登入',
    fullLoginBelieverSub: '使用 LINE 帳號直接登入，解鎖發布動態、留言互動與線上點燈祈福全功能。',
    fullLoginTempleTitle: '廟方機構管理者登入',
    fullLoginTempleSub: '台中萬春宮機構代表專用，可發布官方繞境公告、冬季偏鄉送暖與募資專案。'
  },

  'en': {
    loginBtnText: 'LINE Login',
    chimeOn: 'Chime: On',
    chimeOff: 'Chime: Off',
    subTitleText: 'Smart Worship · Sacred Steps · Warm Community',
    tabDivination: 'Worship',
    tabNearby: 'Map',
    tabCommunity: 'Community',
    tabProfile: 'Profile',
    
    // Altar Deity Selector
    mazuBadge: 'Deity · Goddess Mazu',
    mazuPower: 'Divine Power: Protection & Safe Journey',
    mazuLabel: 'Mazu',
    guanyinBadge: 'Deity · Guanyin Bodhisattva',
    guanyinPower: 'Divine Power: Compassion & Mercy',
    guanyinLabel: 'Guanyin',
    guangongBadge: 'Deity · Lord Guan (Guan Yu)',
    guangongPower: 'Divine Power: Justice, Loyalty & Wealth',
    guangongLabel: 'Lord Guan',
    tudigongBadge: 'Deity · Earth God (Tudigong)',
    tudigongPower: 'Divine Power: Land Peace & Prosperity',
    tudigongLabel: 'Earth God',
    yuelaoBadge: 'Deity · Matchmaker (Yuelao)',
    yuelaoPower: 'Divine Power: Red Thread & True Love',
    yuelaoLabel: 'Yuelao',

    altarGuide: 'Sincere Prayers · Flame AI Guides Your Path',
    burnerPot: 'Censer',
    incenseBtn: 'Offer Incense',
    jiaoBtn: 'Toss Blocks',
    drawBtn: 'Draw Stick',
    cinnabarStamp: 'Sacred Seal',
    cardTag: 'Goddess Mazu Divine Poem',
    
    // AI Interpretation Box
    interpretBoxTitle: 'Flame AI Fortune Master',
    interpretBoxSub: 'In-depth divine poem analysis & life guidance',
    interpretChip1: '💼 Career & Business',
    interpretChip2: '❤️ Romance & Love',
    interpretChip3: '🌿 Health & Peace',
    interpretChip4: '✨ Overall Fortune',
    interpretInputLabel: 'Enter your specific question (e.g. Career, Romance, Health):',
    questionPlaceholder: 'e.g., Is it a good time to change jobs?',

    // Daily Quote & Talisman
    dailyQuoteTitle: 'Daily Wisdom Verse',
    dailyQuoteVerse: '“Refrain from all evil, practice all good; purify your own mind, this is the divine teaching.”',
    dailyQuoteSource: '— Wanchun Temple Goddess Mazu Oracle',
    blessingCardTitle: 'Daily Shrine Peace Amulet',
    refreshBlessingBtn: 'New Amulet',
    dailyBlessingText: 'Mazu\'s Blessing: Bright stars shine high · Safe travels · All wishes fulfilled',
    petAskText: 'Ask Me! 🐾',

    // Tab 2: Map
    nearbyTitle: 'Nearby Temples Navigation & Discovery',
    nearbyDesc: 'Locate nearby shrines & optimal routes (Walk / Bike / Bus / Drive)',
    locateBtnText: 'Locate Nearby Temples',
    locatedBadge: 'Located Nearby Temples',
    filterAll: 'All',

    // Tab 3: Community
    toggleComposerText: '＋ Share Prayer / Post Announcement',
    postPlaceholder: 'Share your temple visits, good deeds, or prayers...',
    attachPhotoText: 'Photo',
    catSelectAnnounce: 'Announcement',
    catSelectHike: 'Hiking Event',
    catSelectGoodDeed: 'Good Deed',
    catSelectCulture: 'Culture',
    publishBtnText: 'Post Update',
    filterAllPosts: 'All Updates',
    
    // Official Post 1
    post1Title: 'Wanchun Temple | Goddess Mazu Blessing & Winter Relief Plan',
    post1Text: 'Wanchun Temple cordially invites all devotees! Join online lamp lighting & winter peace rice offerings to support solitary elders and families in need.',
    post1DonateBtn: 'Support Relief Donation',
    post1LampBtn: 'Light Family Blessing Lamp',
    post1RiceBtn: 'Donate Peace Rice ($100)',
    
    // Impact Dashboard
    impactTitle: 'This Month\'s Community Impact',
    impactSub: 'Faith in Action & Living Kindness',
    impactStat1: 'Peace Rice Bags',
    impactStat2: 'Blessing Meals',
    impactStat3: 'Eco Cleanup Events',
    impactStat4: 'Devotees Joined',

    // Devotee Posts
    post2Text: 'Joined the volunteer team today to clean up trash along Dadu River trail while praying for peace. May all beings be blessed!',
    post3Title: 'Weekend Bagua Mountain Trail Morning Blessing Hike',
    post3Text: 'Meeting at Bagua Mountain Buddha Plaza this Saturday 8:00 AM! Everyone is welcome to join our trail hike.',
    post3JoinBtn: 'Join Hike Event',

    fabPostText: 'Post Experience',
    fabEventText: 'Create Community Event',

    // Tab 4: Profile
    profileHeaderTitle: 'Devotee',
    profileSubText: 'Merit Points: 520 pts | Honored Cultivator',
    askCardTitle: 'Ask Flame AI Shrine Master',
    askCardSub: 'Ask about temple history, worship etiquette, or life guidance',
    askChip1: '🙏 Temple Etiquette',
    askChip2: '💰 Prosperity Prayer',
    askChip3: '☯️ Taisui Remedy',
    askChip4: '🏮 Light Blessing Lamp',
    askInputPlaceholder: 'Ask Flame AI any question...',
    secFollowedTemples: 'My Followed Temples',
    secJoinedActivities: 'My Joined Community Events',
    secDonations: 'My Lit Lamps & Donation Records',

    // Modals
    lampModalTitle: 'Online Lamp & Blessing Ritual',
    targetSelf: 'Self',
    targetFamily: 'Family',
    targetFriends: 'Friends',
    lampNameLabel: 'Devotee Name:',
    lampNamePlaceholder: 'e.g. John Doe',
    lampTypeLabel: 'Select Blessing Lamp Type:',
    lampOption1: 'Light Lamp (Peace & Fortune)',
    lampOption2: 'Taisui Lamp (Dispel Misfortune)',
    lampOption3: 'Wenchang Lamp (Academic Success)',
    lampOption4: 'Yuelao Lamp (Romance & Love)',
    lampOption5: 'Peace Rice Offering ($100)',
    lampOption6: 'Blessing Meal Offering ($80)',
    lampWishLabel: 'Prayer Wish (Optional):',
    lampWishPlaceholder: 'e.g., Wishing peace, health & business success for my family',
    lampNoticeText: 'The candle light will be synchronously lit at Wanchun Temple altar with a LINE blessing notification sent to you.',
    lampSubmitBtnText: 'Light Candle (Send LINE Record)',

    donationModalTitle: 'Wanchun Temple | Winter Relief Plan',
    donorNameLabel: 'Devotee Name:',
    donorWishLabel: 'Prayer Wish (Optional):',
    donorSubmitBtnText: 'Donate (Send LINE Record)',

    fullLoginReturnBtn: 'Return to Web App',
    fullLoginHeroSub: 'Unlock complete smart worship, social updates & community interaction',
    fullLoginNoticeText: 'Log in with LINE or Temple Admin account to post community updates',
    fullLoginBelieverTitle: 'LINE Devotee Login',
    fullLoginBelieverSub: 'Log in directly with LINE account to unlock dynamic posts, comments, and online lamp lighting.',
    fullLoginTempleTitle: 'Temple Admin Login',
    fullLoginTempleSub: 'Exclusive for Wanchun Temple administrators to publish official announcements and charity campaigns.'
  }
};

currentLang = localStorage.getItem('yanbao_web_lang') || currentLang;

function setLanguage(lang) {
  currentLang = lang === 'en' ? 'en' : 'zh-TW';
  localStorage.setItem('yanbao_web_lang', currentLang);

  const t = I18N_DICT[currentLang] || I18N_DICT['zh-TW'];

  // Toggle pills
  document.querySelectorAll('.lang-pill').forEach((pill) => {
    pill.classList.toggle('is-active', pill.dataset.lang === currentLang);
  });

  // Header controls
  const loginBtnText = document.getElementById('loginBtnText');
  if (loginBtnText && (!loggedInUser || loggedInUser.nameShort === '信徒' || loggedInUser.nameShort === 'Devotee')) {
    loginBtnText.textContent = t.loginBtnText;
  }
  const chimeBtnSpan = document.querySelector('#chimeToggleBtn span');
  if (chimeBtnSpan) {
    chimeBtnSpan.textContent = chimeEnabled ? t.chimeOn : t.chimeOff;
  }

  // Tabs
  const tabDivSpan = document.querySelector('.tab-btn[data-tab="divination"] span');
  if (tabDivSpan) tabDivSpan.textContent = t.tabDivination;

  const tabNearbySpan = document.querySelector('.tab-btn[data-tab="nearby"] span');
  if (tabNearbySpan) tabNearbySpan.textContent = t.tabNearby;

  const tabCommunitySpan = document.querySelector('.tab-btn[data-tab="community"] span');
  if (tabCommunitySpan) tabCommunitySpan.textContent = t.tabCommunity;

  const tabProfileSpan = document.querySelector('.tab-btn[data-tab="profile"] span');
  if (tabProfileSpan) tabProfileSpan.textContent = t.tabProfile;

  // Altar Deity Selector Pills
  document.querySelectorAll('.deity-pill').forEach((pill) => {
    const id = pill.dataset.deityId;
    const span = pill.querySelector('span');
    if (id === 'mazu') {
      pill.dataset.deityBadge = t.mazuBadge;
      pill.dataset.deityPower = t.mazuPower;
      if (span) span.textContent = t.mazuLabel;
    } else if (id === 'guanyin') {
      pill.dataset.deityBadge = t.guanyinBadge;
      pill.dataset.deityPower = t.guanyinPower;
      if (span) span.textContent = t.guanyinLabel;
    } else if (id === 'guangong') {
      pill.dataset.deityBadge = t.guangongBadge;
      pill.dataset.deityPower = t.guangongPower;
      if (span) span.textContent = t.guangongLabel;
    } else if (id === 'tudigong') {
      pill.dataset.deityBadge = t.tudigongBadge;
      pill.dataset.deityPower = t.tudigongPower;
      if (span) span.textContent = t.tudigongLabel;
    } else if (id === 'yuelao') {
      pill.dataset.deityBadge = t.yuelaoBadge;
      pill.dataset.deityPower = t.yuelaoPower;
      if (span) span.textContent = t.yuelaoLabel;
    }
  });

  // Update active deity badge & power tag text
  const activePill = document.querySelector('.deity-pill.is-active');
  if (activePill) {
    const badgeTextEl = document.getElementById('deityBadgeText');
    const powerTagEl = document.getElementById('deityPowerTag');
    if (badgeTextEl) badgeTextEl.textContent = activePill.dataset.deityBadge;
    if (powerTagEl) powerTagEl.textContent = activePill.dataset.deityPower;
  }

  // Altar text
  const altarGuide = document.querySelector('.altar-guide');
  if (altarGuide) altarGuide.textContent = t.altarGuide;

  const burnerPot = document.querySelector('.burner-pot');
  if (burnerPot) burnerPot.textContent = t.burnerPot;

  const incenseBtnSpan = document.querySelector('#incenseBtn span');
  if (incenseBtnSpan) incenseBtnSpan.textContent = t.incenseBtn;

  const jiaoBtnSpan = document.querySelector('#jiaoBtn span');
  if (jiaoBtnSpan) jiaoBtnSpan.textContent = t.jiaoBtn;

  const drawBtnSpan = document.querySelector('#drawBtn span');
  if (drawBtnSpan) drawBtnSpan.textContent = t.drawBtn;

  const cinnabarStamp = document.querySelector('.cinnabar-stamp');
  if (cinnabarStamp) cinnabarStamp.textContent = t.cinnabarStamp;

  const cardTag = document.querySelector('.card-tag');
  if (cardTag) cardTag.textContent = t.cardTag;

  // AI Interpretation Box
  const interpretBoxTitle = document.getElementById('interpretBoxTitle');
  if (interpretBoxTitle) interpretBoxTitle.textContent = t.interpretBoxTitle;

  const interpretBoxSub = document.getElementById('interpretBoxSub');
  if (interpretBoxSub) interpretBoxSub.textContent = t.interpretBoxSub;

  const interpretInputLabel = document.getElementById('interpretInputLabel');
  if (interpretInputLabel) interpretInputLabel.textContent = t.interpretInputLabel;

  const questionInput = document.getElementById('questionInput');
  if (questionInput) questionInput.placeholder = t.questionPlaceholder;

  // Suggestion Chips
  const chips = document.querySelectorAll('#interpretChips .chip-suggestion-btn');
  if (chips.length >= 4) {
    chips[0].textContent = t.interpretChip1;
    chips[1].textContent = t.interpretChip2;
    chips[2].textContent = t.interpretChip3;
    chips[3].textContent = t.interpretChip4;
  }

  // Daily Quote & Talisman
  const quoteHeaderSpan = document.querySelector('#dailyQuoteSection .quote-header span');
  if (quoteHeaderSpan) quoteHeaderSpan.textContent = t.dailyQuoteTitle;

  const quoteVerse = document.querySelector('.quote-verse');
  if (quoteVerse) quoteVerse.textContent = t.dailyQuoteVerse;

  const quoteSource = document.querySelector('.quote-source');
  if (quoteSource) quoteSource.textContent = t.dailyQuoteSource;

  const blessingCardTitle = document.querySelector('.blessing-card-title');
  if (blessingCardTitle) blessingCardTitle.textContent = t.blessingCardTitle;

  const refreshBlessingBtnSpan = document.querySelector('#refreshBlessingBtn span');
  if (refreshBlessingBtnSpan) refreshBlessingBtnSpan.textContent = t.refreshBlessingBtn;

  const dailyBlessingText = document.getElementById('dailyBlessingText');
  if (dailyBlessingText) dailyBlessingText.textContent = t.dailyBlessingText;

  const petBubbleSpan = document.querySelector('#petSpeechBubble span');
  if (petBubbleSpan) petBubbleSpan.textContent = t.petAskText;

  // Tab 2: Map
  const nearbyH2 = document.querySelector('#tab-nearby h2');
  if (nearbyH2) nearbyH2.textContent = t.nearbyTitle;

  const nearbyDesc = document.querySelector('#tab-nearby .section-desc');
  if (nearbyDesc) nearbyDesc.textContent = t.nearbyDesc;

  const locateBtnSpan = document.querySelector('#locateBtn span');
  if (locateBtnSpan) locateBtnSpan.textContent = t.locateBtnText;

  const locationBadgeText = document.getElementById('locationBadgeText');
  if (locationBadgeText) locationBadgeText.textContent = t.locatedBadge;

  const filterAllBtn = document.querySelector('#deityFilters .chip-btn[data-filter="all"]');
  if (filterAllBtn) filterAllBtn.textContent = t.filterAll;

  // Tab 3: Community
  const composerToggleSpan = document.querySelector('#togglePostComposerBtn span');
  if (composerToggleSpan) composerToggleSpan.textContent = t.toggleComposerText;

  const xPostInput = document.getElementById('xPostInput');
  if (xPostInput) xPostInput.placeholder = t.postPlaceholder;

  const photoFileName = document.getElementById('photoFileName');
  if (photoFileName) photoFileName.textContent = t.attachPhotoText;

  const publishBtn = document.getElementById('publishXPostBtn');
  if (publishBtn) publishBtn.textContent = t.publishBtnText;

  const catAllBtn = document.querySelector('#activityCategoryFilters .chip-btn[data-cat="all"]');
  if (catAllBtn) catAllBtn.textContent = t.filterAllPosts;

  // Impact Dashboard
  const impactH3 = document.querySelector('.impact-dashboard-card h3');
  if (impactH3) impactH3.textContent = t.impactTitle;

  const impactTag = document.querySelector('.impact-dashboard-card .impact-tag');
  if (impactTag) impactTag.textContent = t.impactSub;

  const impactLabels = document.querySelectorAll('.impact-item label');
  if (impactLabels.length >= 4) {
    impactLabels[0].textContent = t.impactStat1;
    impactLabels[1].textContent = t.impactStat2;
    impactLabels[2].textContent = t.impactStat3;
    impactLabels[3].textContent = t.impactStat4;
  }

  const fabPostSpan = document.querySelector('#fabOptionPost span');
  if (fabPostSpan) fabPostSpan.textContent = t.fabPostText;

  const fabEventSpan = document.querySelector('#fabOptionEvent span');
  if (fabEventSpan) fabEventSpan.textContent = t.fabEventText;

  // Tab 4: Profile
  const profileH3 = document.querySelector('.user-profile-header h3');
  if (profileH3) profileH3.textContent = t.profileHeaderTitle;

  const userSub = document.querySelector('.user-sub');
  if (userSub) userSub.textContent = t.profileSubText;

  const askCardTitle = document.getElementById('askCardTitle');
  if (askCardTitle) askCardTitle.textContent = t.askCardTitle;

  const askCardSub = document.getElementById('askCardSub');
  if (askCardSub) askCardSub.textContent = t.askCardSub;

  const askInput = document.getElementById('askInput');
  if (askInput) askInput.placeholder = t.askInputPlaceholder;

  const askChips = document.querySelectorAll('#askChips .chip-suggestion-btn');
  if (askChips.length >= 4) {
    askChips[0].textContent = t.askChip1;
    askChips[1].textContent = t.askChip2;
    askChips[2].textContent = t.askChip3;
    askChips[3].textContent = t.askChip4;
  }

  const profileSecBlocks = document.querySelectorAll('.profile-section-block h3');
  if (profileSecBlocks.length >= 3) {
    profileSecBlocks[0].textContent = t.secFollowedTemples;
    profileSecBlocks[1].textContent = t.secJoinedActivities;
    profileSecBlocks[2].textContent = t.secDonations;
  }

  // Modals
  const lampModalH3 = document.querySelector('#lightLampModal .modal-header h3');
  if (lampModalH3) lampModalH3.textContent = t.lampModalTitle;

  const modalTargets = document.querySelectorAll('#modalTargetPills .target-pill');
  if (modalTargets.length >= 3) {
    modalTargets[0].textContent = t.targetSelf;
    modalTargets[1].textContent = t.targetFamily;
    modalTargets[2].textContent = t.targetFriends;
  }

  const modalLampNameInput = document.getElementById('modalLampNameInput');
  if (modalLampNameInput) modalLampNameInput.placeholder = t.lampNamePlaceholder;

  const modalLampWishInput = document.getElementById('modalLampWishInput');
  if (modalLampWishInput) modalLampWishInput.placeholder = t.lampWishPlaceholder;

  const lampNoticeP = document.querySelector('#lightLampModal .impact-preview-box p');
  if (lampNoticeP) lampNoticeP.textContent = t.lampNoticeText;

  const lampSubmitBtnSpan = document.querySelector('#lampSubmitForm button[type="submit"] span');
  if (lampSubmitBtnSpan) lampSubmitBtnSpan.textContent = t.lampSubmitBtnText;

  const donorNameInput = document.getElementById('donorNameInput');
  if (donorNameInput) donorNameInput.placeholder = t.lampNamePlaceholder;

  const donorWishInput = document.getElementById('donorDedicationInput');
  if (donorWishInput) donorWishInput.placeholder = t.lampWishPlaceholder;

  const donorSubmitBtnSpan = document.querySelector('#donationForm button[type="submit"] span');
  if (donorSubmitBtnSpan) donorSubmitBtnSpan.textContent = t.donorSubmitBtnText;

  const fullLoginReturnSpan = document.querySelector('#closeFullLoginPageBtn span');
  if (fullLoginReturnSpan) fullLoginReturnSpan.textContent = t.fullLoginReturnBtn;

  const fullLoginHeroSub = document.querySelector('.login-hero-sub');
  if (fullLoginHeroSub) fullLoginHeroSub.textContent = t.fullLoginHeroSub;

  const fullLoginNoticeText = document.getElementById('fullLoginNoticeText');
  if (fullLoginNoticeText) fullLoginNoticeText.textContent = t.fullLoginNoticeText;
}

// Wire up language selector pills
document.querySelectorAll('.lang-pill').forEach((pill) => {
  pill.addEventListener('click', () => {
    const lang = pill.dataset.lang;
    setLanguage(lang);
    playTempleChime(480, 0.15);
  });
});

// Initialize active language on DOM ready
setLanguage(currentLang);