const LACQUER = '#7A1F1F';
const LACQUER_DEEP = '#4E1414';
const GOLD = '#C79A45';
const GOLD_SOFT = '#E4C77A';
const INK = '#1C1613';
const PAPER = '#EFE6D8';

function getStandardQuickReplies(lang = 'zh', liffUrl = '') {
  const isEn = lang === 'en';
  return {
    items: [
      { type: 'action', action: { type: 'message', label: isEn ? '1. Fortune' : '1. 🔮 求籤', text: '1' } },
      { type: 'action', action: { type: 'message', label: isEn ? '2. Nearby' : '2. ⛩️ 附近', text: '2' } },
      { type: 'action', action: { type: 'message', label: isEn ? '3. Zodiac' : '3. 🎐 太歲', text: '3' } },
      { type: 'action', action: { type: 'message', label: isEn ? '4. Festivals' : '4. 🏮 節慶', text: '4' } },
      ...(liffUrl
        ? [{ type: 'action', action: { type: 'uri', label: isEn ? '5. Web App' : '5. 📱 Web參拜', uri: liffUrl } }]
        : []),
      { type: 'action', action: { type: 'message', label: isEn ? '6. Menu' : '6. ☰ 選單', text: '6' } }
    ]
  };
}

function buildCleanMenuFlex(lang = 'zh', liffUrl = '') {
  const isEn = lang === 'en';
  return {
    type: 'flex',
    altText: isEn ? 'Service Menu — Flame AI' : '智慧宮廟功能選單 · 焰寶',
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
          { type: 'text', text: isEn ? 'Flame AI Shrine Master' : '🐾 焰寶 智慧宮廟服務選單', weight: 'bold', color: GOLD_SOFT, size: 'md' },
          { type: 'text', text: isEn ? 'Tap or type numbers 1-6 for quick access:' : '請直接回覆數字或點選按鈕以使用服務：', color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? '1. 🔮 Draw & Interpret Fortune Stick' : '1. 🔮 線上求籤 (擲筊·籤詩·AI解籤)', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'text', text: isEn ? '2. ⛩️ Search Nearby Temples & Transit' : '2. ⛩️ 搜尋附近宮廟與交通建議', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'text', text: isEn ? '3. 🎐 Zodiac & Taisui Clash Check' : '3. 🎐 生肖太歲與沖煞查詢', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'text', text: isEn ? '4. 🏮 Upcoming Temple Festivals' : '4. 🏮 近期宮廟節慶與祭典提醒', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'text', text: isEn ? '5. 📱 Open Full Web App Experience' : '5. 📱 開啟線上參拜與社群 Web App', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: isEn ? '💡 Or ask any question directly in natural chat!' : '💡 您也可以直接輸入任何問題，焰寶會親切為您解答！', color: GOLD_SOFT, size: 'xs', wrap: true, margin: 'sm' }
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
            action: { type: 'message', label: isEn ? '1. Draw Fortune' : '1. 線上求籤', text: '1' }
          },
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: { type: 'message', label: isEn ? '2. Nearby Temples' : '2. 附近宮廟', text: '2' }
          },
          ...(liffUrl
            ? [
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: { type: 'uri', label: isEn ? '5. Open Web App' : '5. 開啟 Web App', uri: liffUrl }
                }
              ]
            : [])
        ]
      }
    }
  };
}

function buildWelcomeFlex(lang, liffUrl) {
  return buildCleanMenuFlex(lang, liffUrl);
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
            action: { type: 'message', label: isEn ? 'Draw Again' : '再次求籤', text: '1' }
          },
          ...(liffUrl
            ? [
                {
                  type: 'button',
                  style: 'primary',
                  color: LACQUER,
                  height: 'sm',
                  action: { type: 'uri', label: isEn ? 'Open LIFF' : 'Web 參拜', uri: liffUrl }
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
  buildCleanMenuFlex,
  buildWelcomeFlex,
  buildFestivalFlex,
  buildActivitiesFlex,
  buildFortuneFlex,
  buildTempleCarouselFlex,
  buildZodiacFlex,
  getStandardQuickReplies
};