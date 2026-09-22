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

function getStandardQuickReplies(lang = 'zh', liffUrl = '') {
  const isEn = lang === 'en';
  return {
    items: [
      { type: 'action', action: { type: 'message', label: isEn ? '🔮 Fortune' : '🔮 線上求籤', text: isEn ? 'fortune' : '求籤' } },
      { type: 'action', action: { type: 'message', label: isEn ? '⛩️ Nearby' : '⛩️ 附近宮廟', text: isEn ? 'nearby' : '附近宮廟' } },
      { type: 'action', action: { type: 'message', label: isEn ? '🎐 Zodiac' : '🎐 生肖太歲', text: isEn ? 'zodiac' : '太歲' } },
      { type: 'action', action: { type: 'message', label: isEn ? '🏮 Festivals' : '🏮 近期節慶', text: isEn ? 'festivals' : '節慶' } },
      { type: 'action', action: { type: 'message', label: isEn ? '中文' : 'English', text: isEn ? '中文' : 'English' } }
    ]
  };
}

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
        { type: 'text', text: `[${kindLabel}] ${title}`, weight: 'bold', color: GOLD_SOFT, size: 'sm', wrap: true },
        { type: 'text', text: templeName(p.templeId), color: PAPER, size: 'xxs' },
        { type: 'text', text: desc + progress, color: PAPER, size: 'xxs', wrap: true, margin: 'xs' }
      ]
    };
  });

  return {
    type: 'flex',
    altText: isEn ? 'Temple activities & donations' : '宮廟最新消息',
    contents: {
      type: 'bubble',
      styles: { header: { backgroundColor: LACQUER_DEEP }, body: { backgroundColor: INK } },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? 'Latest Activities' : '宮廟最新消息', weight: 'bold', color: GOLD_SOFT, size: 'md' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: rows.length
          ? rows
          : [{ type: 'text', text: isEn ? 'Nothing posted right now.' : '目前沒有最新消息。', color: PAPER, size: 'sm' }]
      }
    }
  };
}

function buildFortuneFlex(lang, fortune, interpretation, liffUrl = '') {
  const isEn = lang === 'en';
  return {
    type: 'flex',
    altText: isEn ? `Fortune Stick #${fortune.id} (${fortune.grade})` : `靈籤抽籤結果：第 ${fortune.id} 籤（${fortune.grade}）`,
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
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? `Divine Poem #${fortune.id}` : `萬春宮靈籤 · 第 ${fortune.id} 籤`, weight: 'bold', color: GOLD_SOFT, size: 'md' },
          { type: 'text', text: isEn ? `Grade: ${fortune.grade} · ${fortune.theme}` : `籤詩吉凶：${fortune.grade}  |  主題：${fortune.theme}`, color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: `「${fortune.poem}」`, weight: 'bold', color: GOLD, size: 'md', wrap: true, align: 'center' },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: isEn ? 'Flame\'s AI Interpretation:' : '🐾 焰寶 AI 智慧解籤：', weight: 'bold', color: GOLD_SOFT, size: 'sm', margin: 'md' },
          { type: 'text', text: interpretation, color: PAPER, size: 'sm', wrap: true, margin: 'xs' }
        ]
      },
      footer: {
        type: 'box',
        layout: 'horizontal',
        spacing: 'sm',
        paddingAll: '12px',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: { type: 'message', label: isEn ? 'Draw Again' : '再次求籤', text: isEn ? 'fortune' : '求籤' }
          },
          ...(liffUrl
            ? [
                {
                  type: 'button',
                  style: 'primary',
                  color: LACQUER,
                  height: 'sm',
                  action: { type: 'uri', label: isEn ? 'Open LIFF' : '線上參拜', uri: liffUrl }
                }
              ]
            : [])
        ]
      }
    }
  };
}

function buildTempleCarouselFlex(lang, temples, liffUrl = '') {
  const isEn = lang === 'en';
  const bubbles = temples.map((t) => ({
    type: 'bubble',
    styles: {
      header: { backgroundColor: LACQUER_DEEP },
      body: { backgroundColor: INK },
      footer: { backgroundColor: INK }
    },
    header: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      contents: [
        { type: 'text', text: t.name, weight: 'bold', color: GOLD_SOFT, size: 'md', wrap: true },
        { type: 'text', text: `📍 ~${t.distanceKm} km`, color: PAPER, size: 'xs', margin: 'xs' }
      ]
    },
    body: {
      type: 'box',
      layout: 'vertical',
      paddingAll: '16px',
      contents: [
        { type: 'text', text: `${isEn ? 'Deity' : '主祀神明'}: ${t.deity || (isEn ? 'Temple' : '傳統宮廟')}`, color: PAPER, size: 'xs', wrap: true },
        { type: 'text', text: `${isEn ? 'Address' : '地址'}: ${t.address || (isEn ? 'Taichung' : '台中市')}`, color: PAPER, size: 'xs', wrap: true, margin: 'xs' },
        ...(t.history ? [{ type: 'text', text: t.history, color: PAPER, size: 'xxs', wrap: true, margin: 'sm' }] : [])
      ]
    },
    footer: {
      type: 'box',
      layout: 'vertical',
      spacing: 'xs',
      paddingAll: '12px',
      contents: [
        {
          type: 'button',
          style: 'primary',
          color: LACQUER,
          height: 'sm',
          action: { type: 'message', label: isEn ? 'Subscribe' : '訂閱宮廟消息', text: `${isEn ? 'subscribe' : '訂閱'} ${t.name}` }
        }
      ]
    }
  }));

  return {
    type: 'flex',
    altText: isEn ? 'Nearby Temples' : '附近宮廟列表',
    contents: {
      type: 'carousel',
      contents: bubbles
    }
  };
}

function buildZodiacFlex(lang, result, aiExplanation) {
  const isEn = lang === 'en';
  return {
    type: 'flex',
    altText: isEn ? `Zodiac Check for ${result.birthYear}` : `生肖太歲查詢結果（${result.birthYear}年 / 生肖 ${result.userAnimal}）`,
    contents: {
      type: 'bubble',
      styles: {
        header: { backgroundColor: LACQUER_DEEP },
        body: { backgroundColor: INK }
      },
      header: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? 'Zodiac & Taisui Check' : '🎐 生肖太歲分析結果', weight: 'bold', color: GOLD_SOFT, size: 'md' },
          { type: 'text', text: isEn ? `Birth Year: ${result.birthYear} (${result.userAnimal})` : `出生年：${result.birthYear}（生肖：${result.userAnimal}）`, color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          {
            type: 'text',
            text: result.isClashing
              ? (isEn ? `⚠️ Clashing with Taisui (${result.clashType})` : `⚠️ 今年犯太歲（類型：${result.clashType}）`)
              : (isEn ? '✨ No Taisui clash this year!' : '✨ 今年平安，無犯太歲！'),
            weight: 'bold',
            color: result.isClashing ? '#FF7B7B' : '#6EE7B7',
            size: 'sm'
          },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: aiExplanation, color: PAPER, size: 'sm', wrap: true, margin: 'md' }
        ]
      }
    }
  };
}

module.exports = {
  buildWelcomeFlex,
  buildFestivalFlex,
  buildActivitiesFlex,
  buildFortuneFlex,
  buildTempleCarouselFlex,
  buildZodiacFlex,
  getStandardQuickReplies
};