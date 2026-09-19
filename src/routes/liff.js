const express = require('express');
const router = express.Router();

const fortunes = require('../data/fortunes.json');
const festivals = require('../data/festivals.json');
const temples = require('../data/temples.json');
const { askLLM } = require('../services/llm');
const { nearbyTemples } = require('../services/places');
const { getTransitDirections } = require('../services/transit');

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

// General "ask the temple guide anything" chat used by the knowledge tab.
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    const context = `本地宮廟知識庫：\n${JSON.stringify(temples, null, 2)}`;
    const reply = await askLLM({ userMessage: question, context });
    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'ask_failed' });
  }
});

module.exports = router;
