const fs = require('fs');
const path = require('path');
const { createCanvas } = require('@napi-rs/canvas');

async function buildMinimalRichMenuImage() {
  const width = 2500;
  const height = 1686;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Background - Deep Luxury Charcoal Ink
  ctx.fillStyle = '#14100E';
  ctx.fillRect(0, 0, width, height);

  // Subtle Golden Radial Ambient Glow
  const grad = ctx.createRadialGradient(1250, 843, 100, 1250, 843, 1200);
  grad.addColorStop(0, 'rgba(199, 154, 69, 0.15)');
  grad.addColorStop(0.6, 'rgba(122, 31, 31, 0.08)');
  grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Decorative Border Line around Rich Menu
  ctx.strokeStyle = 'rgba(199, 154, 69, 0.3)';
  ctx.lineWidth = 6;
  ctx.strokeRect(20, 20, width - 40, height - 40);

  const items = [
    { num: '1', titleZh: '線上求籤', titleEn: 'FORTUNE STICK', icon: '🔮', color: '#c084fc' },
    { num: '2', titleZh: '附近宮廟', titleEn: 'NEARBY SHRINES', icon: '⛩️', color: '#fbbf24' },
    { num: '3', titleZh: '生肖太歲', titleEn: 'TAI SUI CHECK', icon: '🎐', color: '#38bdf8' },
    { num: '4', titleZh: '宮廟節慶', titleEn: 'FESTIVAL ALERTS', icon: '🏮', color: '#f87171' },
    { num: '5', titleZh: 'WEB 參拜', titleEn: 'OPEN WEB APP', icon: '📱', color: '#ffd700', isHighlight: true },
    { num: '6', titleZh: '問焰寶 AI', titleEn: 'SHRINE MASTER', icon: '🐾', color: '#f59e0b' }
  ];

  const cols = 3;
  const cardW = 754;
  const cardH = 750;
  const startX = 60;
  const startY = 60;
  const gapX = 45;
  const gapY = 66;

  items.forEach((item, idx) => {
    const col = idx % cols;
    const row = Math.floor(idx / cols);
    const x = startX + col * (cardW + gapX);
    const y = startY + row * (cardH + gapY);

    // Card Background
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(x, y, cardW, cardH, 36);
    ctx.clip();

    ctx.fillStyle = item.isHighlight ? 'rgba(122, 31, 31, 0.85)' : 'rgba(32, 25, 21, 0.9)';
    ctx.fillRect(x, y, cardW, cardH);

    // Subtle Card Inner Gradient
    const cardGrad = ctx.createLinearGradient(x, y, x, y + cardH);
    cardGrad.addColorStop(0, 'rgba(255, 245, 222, 0.05)');
    cardGrad.addColorStop(1, 'rgba(0, 0, 0, 0.3)');
    ctx.fillStyle = cardGrad;
    ctx.fillRect(x, y, cardW, cardH);

    // Card Border
    ctx.strokeStyle = item.isHighlight ? '#ffd700' : 'rgba(199, 154, 69, 0.45)';
    ctx.lineWidth = item.isHighlight ? 8 : 5;
    ctx.strokeRect(x, y, cardW, cardH);
    ctx.restore();

    // Icon Emoji / Symbol
    ctx.font = 'bold 120px "Segoe UI Emoji", "Apple Color Emoji", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(item.icon, x + cardW / 2, y + cardH * 0.36);

    // Main Chinese Title
    ctx.font = 'bold 64px "Microsoft JhengHei", "PingFang TC", sans-serif';
    ctx.fillStyle = item.isHighlight ? '#ffffff' : '#ffd700';
    ctx.fillText(item.titleZh, x + cardW / 2, y + cardH * 0.65);

    // Sub English Title
    ctx.font = 'bold 36px "Segoe UI", Roboto, sans-serif';
    ctx.fillStyle = 'rgba(239, 230, 216, 0.75)';
    ctx.fillText(item.titleEn, x + cardW / 2, y + cardH * 0.80);

    // Corner Number Badge
    ctx.beginPath();
    ctx.arc(x + 60, y + 60, 32, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(199, 154, 69, 0.25)';
    ctx.fill();
    ctx.font = 'bold 36px sans-serif';
    ctx.fillStyle = '#efe6d8';
    ctx.fillText(item.num, x + 60, y + 61);
  });

  const buffer = canvas.toBuffer('image/png');
  const outPath = path.join(__dirname, '..', 'assets', 'richmenu.png');
  fs.writeFileSync(outPath, buffer);
  console.log('✅ Generated minimalist high-res Rich Menu image asset at:', outPath);
}

buildMinimalRichMenuImage().catch(console.error);
