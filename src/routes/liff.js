const express = require('express');
const router = express.Router();

const fortunes = require('../data/fortunes.json');
const festivals = require('../data/festivals.json');
const temples = require('../data/temples.json');
const { askLLM } = require('../services/llm');
const { nearbyTemples } = require('../services/places');
const { getTransitDirections } = require('../services/transit');
const { checkZodiacClash } = require('../services/zodiac');
const { buildAppContext } = require('../services/knowledge');

// Draw a random fortune stick (求籤) — call this after the incense + coin-toss animation finishes.
router.get('/fortune/draw', (req, res) => {
  const fortune = fortunes[Math.floor(Math.random() * fortunes.length)];
  res.json(fortune);
});

// AI interpretation of a drawn fortune, grounded in the actual poem text so the model can't invent it.
router.post('/fortune/interpret', async (req, res) => {
  try {
    const { fortuneId, question } = req.body;
    const fortune = fortunes.find((f) => f.id === Number(fortuneId));
    if (!fortune) return res.status(404).json({ error: 'unknown fortuneId' });

    const context = `籤詩編號 ${fortune.id}（${fortune.grade}）：「${fortune.poem}」\n主題：${fortune.theme}\n一般解釋：${fortune.notes}`;
    const reply = await askLLM({
      userMessage: question || '請幫我解釋這支籤大概的意思。',
      context
    });

    res.json({ fortune, reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'interpret_failed' });
  }
});

// Nearby temples from the user's LIFF-reported location.
router.get('/temples/nearby', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' });
    const results = await nearbyTemples(Number(lat), Number(lng));
    res.json(results);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'nearby_failed' });
  }
});

// Bus/train directions from the user's location to a known temple.
router.get('/temples/:id/transit', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: 'lat/lng required' });
    const result = await getTransitDirections(Number(lat), Number(lng), req.params.id);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'transit_failed' });
  }
});

// Curated temple info (deity, history, highlights) for the knowledge panel.
router.get('/temples', (req, res) => res.json(temples));

// Upcoming festivals/rituals for the reminders tab.
router.get('/festivals', (req, res) => {
  const withDelta = festivals
    .map((f) => ({
      ...f,
      daysAway: Math.round((new Date(f.date2026) - new Date()) / (1000 * 60 * 60 * 24))
    }))
    .filter((f) => f.daysAway >= 0)
    .sort((a, b) => a.daysAway - b.daysAway);
  res.json(withDelta);
});

// 生肖沖太歲 check — pass a birth year, get back whether it clashes with the current (or given) year.
router.get('/zodiac/check', async (req, res) => {
  try {
    const { birthYear, year, explain } = req.query;
    if (!birthYear || Number.isNaN(Number(birthYear))) {
      return res.status(400).json({ error: 'birthYear required (e.g. ?birthYear=1998)' });
    }
    const result = checkZodiacClash(Number(birthYear), year ? Number(year) : undefined);

    if (explain === 'true') {
      const context = `生肖太歲查詢結果：出生年 ${result.birthYear}（生肖：${result.userAnimal}），查詢年份 ${result.checkYear}（生肖：${result.yearAnimal}）。是否犯太歲：${result.isClashing ? '是，類型為「' + result.clashType + '」' : '否'}。今年所有犯太歲生肖：${result.allClashesThisYear.map((c) => `${c.animal}(${c.type})`).join('、')}。`;
      result.aiMessage = await askLLM({
        userMessage: result.isClashing
          ? `請用溫暖口氣跟我解釋今年犯太歲的意思，並給一些安太歲/點光明燈的建議。`
          : `請用溫暖口氣告訴我今年沒有犯太歲，但仍可以說些新年祝福的話。`,
        context
      });
    }

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'zodiac_check_failed' });
  }
});

// General "ask the temple guide anything" chat used by the knowledge tab.
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || !question.trim()) {
      return res.status(400).json({ error: 'question required' });
    }
    const reply = await askLLM({ userMessage: question, context: buildAppContext() });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ask_failed' });
  }
});

module.exports = router;
