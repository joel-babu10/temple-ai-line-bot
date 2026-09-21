const LACQUER = '#7A1F1F';
const LACQUER_DEEP = '#4E1414';
const GOLD = '#C79A45';
const GOLD_SOFT = '#E4C77A';
const INK = '#1C1613';
const PAPER = '#EFE6D8';

const COPY = {
  zh: {
    title: '焰寶',
    subtitle: '萬春宮 · 智慧宮廟小幫手',
    intro: '哈囉，我是焰寶🙏 想從哪裡開始呢？',
    buttons: [
      { label: '🔮  求籤解籤', text: '求籤' },
      { label: '⛩️  附近宮廟', text: '附近宮廟' },
      { label: '🎐  太歲查詢', text: '太歲' },
      { label: '🏮  節慶提醒', text: '節慶' },
      { label: '🪔  線上點燈', uri: true },
      { label: '💬  問焰寶任何事', text: '你好' }
    ]
  },
  en: {
    title: 'Yanbao',
    subtitle: 'Wanchun Temple · Smart Temple Companion',
    intro: "Hi, I'm Yanbao 🙏 Where should we start?",
    buttons: [
      { label: '🔮  Draw a Fortune', text: 'fortune' },
      { label: '⛩️  Nearby Temples', text: 'nearby' },
      { label: '🎐  Zodiac Check', text: 'zodiac' },
      { label: '🏮  Festival Reminders', text: 'festivals' },
      { label: '🪔  Light a Blessing Lamp', uri: true },
      { label: '💬  Ask Me Anything', text: 'hello' }
    ]
  }
};

function buildWelcomeFlex(lang, liffUrl) {
  const copy = COPY[lang] || COPY.zh;

  const buttons = copy.buttons.map((b) => ({
    type: 'button',
    style: 'primary',
    color: LACQUER,
    height: 'sm',
    action: b.uri
      ? { type: 'uri', label: b.label, uri: liffUrl }
      : { type: 'message', label: b.label, text: b.text }
  }));

  return {
    type: 'flex',
    altText: lang === 'en' ? "Welcome — I'm Yanbao" : '歡迎光臨，我是焰寶',
    contents: {
      type: 'bubble',
      styles: {
        header: { backgroundColor: LACQUER_DEEP },
        body: { backgroundColor: INK },
        footer: { backgroundColor: INK }
      },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '20px',
        contents: [
          { type: 'text', text: copy.title, weight: 'bold', size: 'xl', color: GOLD_SOFT },
          { type: 'text', text: copy.subtitle, size: 'xs', color: PAPER, margin: 'sm' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [{ type: 'text', text: copy.intro, color: PAPER, wrap: true, size: 'sm' }]
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: buttons
      }
    }
  };
}

function buildFestivalFlex(lang, upcomingFestivals) {
  const copy = COPY[lang] || COPY.zh;
  const isEn = lang === 'en';

  const rows = upcomingFestivals.slice(0, 5).map((f) => ({
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    contents: [
      { type: 'text', text: f.name, weight: 'bold', color: GOLD_SOFT, size: 'sm' },
      {
        type: 'text',
        text: isEn ? `${f.lunarDate} · ~${f.date2026}` : `${f.lunarDate}（國曆約 ${f.date2026}）`,
        color: PAPER,
        size: 'xxs'
      },
      { type: 'text', text: f.message, color: PAPER, size: 'xxs', wrap: true, margin: 'xs' }
    ]
  }));

  return {
    type: 'flex',
    altText: isEn ? 'Upcoming temple festivals' : '近期宮廟節慶',
    contents: {
      type: 'bubble',
      styles: { header: { backgroundColor: LACQUER_DEEP }, body: { backgroundColor: INK } },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? 'Upcoming Festivals' : '近期節慶提醒', weight: 'bold', color: GOLD_SOFT, size: 'md' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: rows.length
          ? rows
          : [{ type: 'text', text: isEn ? 'Nothing coming up right now.' : '近期沒有節慶活動。', color: PAPER, size: 'sm' }]
      }
    }
  };
}

function buildActivitiesFlex(lang, posts, temples) {
  const isEn = lang === 'en';
  const templeName = (id) => temples.find((t) => t.id === id)?.name || id;

  const rows = posts.slice(0, 6).map((p) => {
    const title = isEn ? p.titleEn || p.title : p.title;
    const desc = isEn ? p.descriptionEn || p.description : p.description;
    const kindLabel = p.type === 'donation' ? (isEn ? 'Donation' : '樂捐') : isEn ? 'Activity' : '活動';
    const progress =
      p.type === 'donation' && p.targetAmount
        ? `\n${isEn ? 'Raised' : '已募集'}: ${(p.raisedAmount || 0).toLocaleString()} / ${p.targetAmount.toLocaleString()}`
        : '';
    return {
      type: 'box',
      layout: 'vertical',
      margin: 'md',
      contents: [
        { type: 'text', text: `[${kindLabel}] ${title}`, weight: 'bold', color: '#E4C77A', size: 'sm', wrap: true },
        { type: 'text', text: templeName(p.templeId), color: '#EFE6D8', size: 'xxs' },
        { type: 'text', text: desc + progress, color: '#EFE6D8', size: 'xxs', wrap: true, margin: 'xs' }
      ]
    };
  });

  return {
    type: 'flex',
    altText: isEn ? 'Temple activities & donations' : '宮廟最新消息',
    contents: {
      type: 'bubble',
      styles: { header: { backgroundColor: '#4E1414' }, body: { backgroundColor: '#1C1613' } },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? 'Latest Activities' : '宮廟最新消息', weight: 'bold', color: '#E4C77A', size: 'md' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: rows.length
          ? rows
          : [{ type: 'text', text: isEn ? 'Nothing posted right now.' : '目前沒有最新消息。', color: '#EFE6D8', size: 'sm' }]
      }
    }
  };
}

module.exports = { buildWelcomeFlex, buildFestivalFlex, buildActivitiesFlex };