const API_BASE = '/api';

// ---------- LIFF init (safe to no-op outside the LINE app, e.g. while testing in a browser) ----------
async function initLiff() {
  try {
    await liff.init({ liffId: window.APP_CONFIG.LIFF_ID });
  } catch (err) {
    console.warn('LIFF init skipped (probably running outside LINE):', err.message);
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
  });
});

// ---------- Divination flow ----------
const incenseBtn = document.getElementById('incenseBtn');
const jiaoBtn = document.getElementById('jiaoBtn');
const jiaoResult = document.getElementById('jiaoResult');
const drawBtn = document.getElementById('drawBtn');
const fortuneCard = document.getElementById('fortuneCard');
const interpretBox = document.getElementById('interpretBox');

let currentFortune = null;

incenseBtn.addEventListener('click', () => {
  incenseBtn.disabled = true;
  incenseBtn.querySelector('span:last-child').textContent = '已上香 🙏';
  jiaoBtn.disabled = false;
});

jiaoBtn.addEventListener('click', () => {
  // Simple weighted coin toss: needs a "聖筊" (one up, one down) to proceed, matching real ritual flow.
  const outcomes = ['聖筊 ✅ 神明應允', '笑筊，再擲一次', '陰筊，再擲一次'];
  const roll = Math.random();
  const outcome = roll < 0.5 ? outcomes[0] : roll < 0.75 ? outcomes[1] : outcomes[2];
  jiaoResult.textContent = outcome;

  if (outcome === outcomes[0]) {
    drawBtn.disabled = false;
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
});

document.getElementById('askInterpretBtn').addEventListener('click', async () => {
  const input = document.getElementById('questionInput');
  const question = input.value.trim();
  if (!question || !currentFortune) return;

  appendChat('interpretChat', question, 'user');
  input.value = '';

  const res = await fetch(`${API_BASE}/fortune/interpret`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fortuneId: currentFortune.id, question })
  });
  const data = await res.json();
  appendChat('interpretChat', data.reply, 'ai');
});

function appendChat(containerId, text, role) {
  const el = document.createElement('div');
  el.className = `chat-bubble ${role}`;
  el.textContent = text;
  document.getElementById(containerId).appendChild(el);
  el.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

// ---------- Nearby temples ----------
document.getElementById('locateBtn').addEventListener('click', async () => {
  try {
    const { lat, lng } = await getLocation();
    const res = await fetch(`${API_BASE}/temples/nearby?lat=${lat}&lng=${lng}`);
    const temples = await res.json();
    renderNearby(temples, lat, lng);
  } catch (err) {
    document.getElementById('nearbyList').innerHTML = `<p class="hint">無法取得位置：${err.message}</p>`;
  }
});

async function getLocation() {
  // Prefer LIFF's location API inside the LINE app; fall back to browser geolocation for local testing.
  if (window.liff && liff.isInClient && liff.isInClient()) {
    try {
      const pos = await liff.getLocation();
      return { lat: pos.latitude, lng: pos.longitude };
    } catch (e) {
      // fall through to browser geolocation
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

function renderNearby(temples, userLat, userLng) {
  const list = document.getElementById('nearbyList');
  list.innerHTML = '';

  temples.forEach((t) => {
    const card = document.createElement('div');
    card.className = 'temple-card';
    card.innerHTML = `
      <h3>${t.name}</h3>
      <p class="distance">距離約 ${t.distanceKm ?? '?'} 公里</p>
      <p>${t.deity ? `主祀：${t.deity}　` : ''}${t.address || ''}</p>
      ${t.highlights ? `<p>${t.highlights}</p>` : ''}
      <button data-id="${t.id || ''}">查看公車／火車怎麼去</button>
      <div class="transit-info is-hidden"></div>
    `;

    const transitBtn = card.querySelector('button');
    const transitInfo = card.querySelector('.transit-info');

    transitBtn.addEventListener('click', async () => {
      if (!t.id) {
        transitInfo.textContent = '這間廟不在本地知識庫中，暫時無法提供交通建議。';
        transitInfo.classList.remove('is-hidden');
        return;
      }
      transitInfo.textContent = '查詢中…';
      transitInfo.classList.remove('is-hidden');

      const res = await fetch(`${API_BASE}/temples/${t.id}/transit?lat=${userLat}&lng=${userLng}`);
      const data = await res.json();
      transitInfo.textContent = data.summary;
    });

    list.appendChild(card);
  });
}

// ---------- Festivals ----------
(async function loadFestivals() {
  const res = await fetch(`${API_BASE}/festivals`);
  const festivals = await res.json();
  const list = document.getElementById('festivalList');

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
document.getElementById('askBtn').addEventListener('click', async () => {
  const input = document.getElementById('askInput');
  const question = input.value.trim();
  if (!question) return;

  appendChat('askChat', question, 'user');
  input.value = '';

  const res = await fetch(`${API_BASE}/ask`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ question })
  });
  const data = await res.json();
  appendChat('askChat', data.reply, 'ai');
});
