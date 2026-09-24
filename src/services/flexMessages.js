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
      { type: 'action', action: { type: 'message', label: isEn ? '7. Amulet' : '7. 📜 平安符', text: '7' } },
      { type: 'action', action: { type: 'message', label: isEn ? '8. Welfare' : '8. 💖 公益', text: '8' } },
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
          { type: 'text', text: isEn ? 'Tap or type numbers 1-8 for quick access:' : '請直接回覆數字 1~8 或點選按鈕以使用服務：', color: PAPER, size: 'xs', margin: 'xs' }
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
          { type: 'text', text: isEn ? '7. 📜 Daily Shrine Amulet & Blessing' : '7. 📜 每日靈驗平安符與神諭賜福', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'text', text: isEn ? '8. 💖 Temple Welfare & Donations' : '8. 💖 宮廟公益樂捐與善行專案', color: PAPER, size: 'sm', weight: 'bold' },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: isEn ? '💡 Or ask any question directly in natural chat!' : '💡 您也可以直接輸入任何問題，焰寶會親切為您解答！', color: GOLD_SOFT, size: 'xs', wrap: true, margin: 'sm' },
          { type: 'text', text: isEn ? '🌸 Note: Divination & blessings are for cultural appreciation & peace of mind.' : '🌸 提醒：本系統籤詩與民俗內容僅供文化體驗與心靈寄託，請保持積極獨立判斷 🙏', color: PAPER, size: 'xxs', wrap: true, margin: 'md', align: 'center' }
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
      { type: 'text', text: isEn ? f.nameEn || f.name : f.name, weight: 'bold', color: GOLD_SOFT, size: 'sm' },
      {
        type: 'text',
        text: isEn ? `${f.lunarDateEn || f.lunarDate} · ~${f.date2026}` : `${f.lunarDate}（國曆約 ${f.date2026}）`,
        color: PAPER,
        size: 'xxs'
      },
      { type: 'text', text: isEn ? f.messageEn || f.message : f.message, color: PAPER, size: 'xxs', wrap: true, margin: 'xs' }
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
  const templeName = (id) => {
    const t = temples.find((item) => item.id === id);
    if (!t) return id;
    return isEn ? t.nameEn || t.name : t.name;
  };

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
  const grade = isEn ? fortune.gradeEn || fortune.grade : fortune.grade;
  const theme = isEn ? fortune.themeEn || fortune.theme : fortune.theme;
  const poem = isEn ? fortune.poemEn || fortune.poem : fortune.poem;

  return {
    type: 'flex',
    altText: isEn ? `Fortune Stick #${fortune.id} (${grade})` : `靈籤抽籤結果：第 ${fortune.id} 籤（${grade}）`,
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
          { type: 'text', text: isEn ? `Grade: ${grade} · ${theme}` : `籤詩吉凶：${grade}  |  主題：${theme}`, color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: `「${poem}」`, weight: 'bold', color: GOLD, size: 'md', wrap: true, align: 'center' },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: isEn ? "Flame's AI Interpretation:" : '🐾 焰寶 AI 智慧解籤：', weight: 'bold', color: GOLD_SOFT, size: 'sm', margin: 'md' },
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
                  action: { type: 'uri', label: isEn ? 'Open Web App' : '開啟 Web 參拜', uri: liffUrl }
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
  const bubbles = temples.map((t) => {
    const templeName = isEn ? t.nameEn || t.name : t.name;
    const deityName = isEn ? t.deityEn || t.deity : t.deity;
    const addressStr = isEn ? t.addressEn || t.address : t.address;
    const historyStr = isEn ? t.highlightsEn || t.highlights || t.history : t.history || t.highlights;

    return {
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
          { type: 'text', text: templeName, weight: 'bold', color: GOLD_SOFT, size: 'md', wrap: true },
          { type: 'text', text: `📍 ~${t.distanceKm} km`, color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: `${isEn ? 'Deity' : '主祀神明'}: ${deityName || (isEn ? 'Temple' : '傳統宮廟')}`, color: PAPER, size: 'xs', wrap: true },
          { type: 'text', text: `${isEn ? 'Address' : '地址'}: ${addressStr || (isEn ? 'Taichung' : '台中市')}`, color: PAPER, size: 'xs', wrap: true, margin: 'xs' },
          ...(historyStr ? [{ type: 'text', text: historyStr, color: PAPER, size: 'xxs', wrap: true, margin: 'sm' }] : [])
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
            action: { type: 'message', label: isEn ? 'Subscribe' : '訂閱宮廟消息', text: `${isEn ? 'subscribe' : '訂閱'} ${templeName}` }
          }
        ]
      }
    };
  });

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

function buildDailyWisdomFlex(lang = 'zh', liffUrl = '') {
  const isEn = lang === 'en';
  const wisdoms = [
    { text: '行善積德，福應自然；心存慈悲，處處皆安。', textEn: 'Do good and accumulate virtue, blessings will follow naturally; keep compassion in your heart and peace will reside everywhere.', deity: '天上聖母 (媽祖)', deityEn: 'Mazu (Goddess of Sea)', topic: '福慧兼修', topicEn: 'Virtue & Wisdom' },
    { text: '心若正大，光明自現；吉星常照，患難不侵。', textEn: 'If your heart is upright, light will shine forth; lucky stars will guide you, protected from adversity.', deity: '關聖帝君', deityEn: 'Guan Sheng Di Jun', topic: '正道光明', topicEn: 'Righteous Light' },
    { text: '千處祈求千處應，苦海常作渡人舟。', textEn: 'Answering prayers across a thousand realms, a compassionate vessel guiding souls through life.', deity: '觀音大士', deityEn: 'Guanyin (Goddess of Mercy)', topic: '慈悲安心', topicEn: 'Compassion & Peace' },
    { text: '土地常懷保佑心，善人處處得金玉。', textEn: 'The Earth Deity watches over with blessings; kind souls find prosperity wherever they tread.', deity: '福德正神', deityEn: 'Tudigong (Earth God)', topic: '平安聚財', topicEn: 'Peace & Wealth' },
    { text: '千里姻緣一線牽，真情所至金石開。', textEn: 'A thousand miles tied by a red string of destiny; true devotion unlocks every heart.', deity: '月老星君', deityEn: 'Yuelao (Matchmaker God)', topic: '良緣圓滿', topicEn: 'Love & Union' }
  ];
  const item = wisdoms[Math.floor(Math.random() * wisdoms.length)];

  return {
    type: 'flex',
    altText: isEn ? 'Daily Oracle Blessing — Flame AI' : '📜 今日每日神諭賜福 · 焰寶',
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
          { type: 'text', text: isEn ? '📜 Daily Shrine Oracle' : '📜 每日隨機神諭賜福', weight: 'bold', color: GOLD_SOFT, size: 'md' },
          { type: 'text', text: isEn ? `Deity: ${item.deityEn} · ${item.topicEn}` : `賜福仙尊：${item.deity}  |  ${item.topic}`, color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: `「${isEn ? item.textEn : item.text}」`, weight: 'bold', color: GOLD, size: 'sm', wrap: true, align: 'center' },
          { type: 'separator', color: LACQUER, margin: 'md' },
          { type: 'text', text: isEn ? "Flame's Daily Warm Thought:" : '🐾 焰寶每日溫馨提點：', weight: 'bold', color: GOLD_SOFT, size: 'xs', margin: 'md' },
          { type: 'text', text: isEn ? 'Keep a gentle heart today, speak kind words, and blessing will follow you step by step!' : '保持善念，多說好話，神明定會在暗中保佑您平安順遂！', color: PAPER, size: 'xs', wrap: true, margin: 'xs' }
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
            action: { type: 'message', label: isEn ? '1. Draw Fortune' : '1. 靈籤求籤', text: '1' }
          },
          ...(liffUrl
            ? [
                {
                  type: 'button',
                  style: 'primary',
                  color: LACQUER,
                  height: 'sm',
                  action: { type: 'uri', label: isEn ? '5. Open Web App' : '5. 開啟 Web 參拜', uri: liffUrl }
                }
              ]
            : [])
        ]
      }
    }
  };
}

function buildDonationsFlex(lang = 'zh', liffUrl = '') {
  const isEn = lang === 'en';
  return {
    type: 'flex',
    altText: isEn ? 'Temple Donations & Community Welfare' : '💖 宮廟隨喜樂捐與公益專案',
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
          { type: 'text', text: isEn ? '💖 Temple Welfare & Donations' : '💖 宮廟公益樂捐與善行專案', weight: 'bold', color: GOLD_SOFT, size: 'md' },
          { type: 'text', text: isEn ? 'Support temple relief & rural charity' : '凝聚善念 · 隨喜護持偏鄉與宮廟建設', color: PAPER, size: 'xs', margin: 'xs' }
        ]
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        paddingAll: '16px',
        contents: [
          { type: 'text', text: isEn ? '1. 🌾 Wanchun Temple Relief Rice for Elderly' : '1. 🌾 萬春宮 偏鄉獨居長者送暖平安米', color: GOLD, size: 'xs', weight: 'bold' },
          { type: 'text', text: isEn ? 'Goal: NT$ 100,000 (Raised 84%)' : '目標：NT$ 100,000（已募集 84%）', color: PAPER, size: 'xxs' },
          { type: 'separator', color: LACQUER, margin: 'xs' },
          { type: 'text', text: isEn ? '2. 🕯️ Blessing Lamp Fund for Rural Students' : '2. 🕯️ 偏鄉學童智慧燈供養專案', color: GOLD, size: 'xs', weight: 'bold' },
          { type: 'text', text: isEn ? 'Goal: NT$ 50,000 (Raised 62%)' : '目標：NT$ 50,000（已募集 62%）', color: PAPER, size: 'xxs' }
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
            action: { type: 'message', label: isEn ? 'Donate 500 to Wanchun' : '捐款 萬春宮 500', text: isEn ? 'donate Wanchun 500' : '捐款 萬春宮 500' }
          },
          ...(liffUrl
            ? [
                {
                  type: 'button',
                  style: 'link',
                  height: 'sm',
                  action: { type: 'uri', label: isEn ? 'Open Web App' : '開啟 Web 參拜', uri: liffUrl }
                }
              ]
            : [])
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
  buildDailyWisdomFlex,
  buildDonationsFlex,
  getStandardQuickReplies
};