# 廟公 AI — LINE Smart Temple Companion

Built for the 2026 LINE AI 創新創業競賽, 智慧宮廟 bonus theme.

A LINE OA + LIFF app that:
- Lets people go through a virtual incense → coin-toss (擲筊) → fortune-stick (求籤) ritual, then chat with an AI
  that interprets the drawn fortune poem in the context of whatever they actually asked about — instead of a
  static pre-written interpretation.
- Finds nearby temples from the user's live location and tells them how to get there by bus/train.
- Answers free-form questions about local temples (deity, history, highlights) grounded in a small curated
  knowledge base, not invented by the model.
- Pushes festival/ritual reminders (媽祖聖誕, 安太歲, 中元普渡…) automatically via a daily cron job.

## Stack

- Node.js + Express backend
- `@line/bot-sdk` for the Messaging API webhook
- A single-page LIFF front-end (`public/liff/`) — plain HTML/CSS/JS, no build step
- Google Maps Platform (Places + Directions) for nearby temples and transit, with an offline fallback using
  the curated data in `src/data/` so the whole app still runs with zero API keys during development
- Anthropic API for the AI interpretation/chat, with the same offline-fallback pattern

## Quick start (local)

```bash
npm install
cp .env.example .env
npm start
```

Visit `http://localhost:3000/liff/index.html` in a normal browser to test the UI (LIFF-specific bits like
`liff.getLocation()` will fall back to browser geolocation outside the LINE app). All API routes work with
no keys set — you'll get clearly-labeled demo/fallback responses instead of real LLM/Places/Directions calls,
which is enough to develop and demo the flow.

## Filling in real credentials

1. **LINE Messaging API channel** (LINE Developers Console → Create a Provider → Messaging API channel)
   - Copy the **Channel access token** and **Channel secret** into `.env`
   - Set the webhook URL to `https://<your-public-url>/webhook` and enable "Use webhook"
2. **LIFF app** (same provider → LINE Login channel → LIFF tab → Add)
   - Endpoint URL: `https://<your-public-url>/liff/index.html`
   - Size: `Tall` or `Full`
   - Scopes: `profile` (add `chat_message.write` if you want the app to send messages on the user's behalf later)
   - Copy the LIFF ID into `.env` as `LIFF_ID` **and** into `public/liff/config.js`
3. **Google Maps Platform**: enable "Places API" and "Directions API" on a Google Cloud project, copy the key
   into `GOOGLE_MAPS_API_KEY`
4. **Anthropic API key**: `ANTHROPIC_API_KEY` (get one at console.anthropic.com)

You need a public HTTPS URL for the webhook and LIFF endpoint — for the contest deadline, the fastest options
are Render, Railway, Zeabur, or `ngrok http 3000` for a quick tunnel during judging/demo recording.

## Project structure

```
server.js                    Express entry point
src/routes/webhook.js        LINE Messaging API webhook — intent routing (求籤 / 附近宮廟 / general Q&A)
src/routes/liff.js           REST API the LIFF page calls
src/services/llm.js          LLM call, grounded with a temple-guide system prompt
src/services/places.js       Nearby-temple lookup (Google Places, or local haversine fallback)
src/services/transit.js      Bus/train directions (Google Directions transit mode, or local fallback text)
src/services/notifier.js     Daily cron job pushing festival reminders to subscribers
src/services/subscribers.js  In-memory list of userIds who've friended the OA (swap for a real DB later)
src/data/temples.json        Curated knowledge base — 萬春宮 + 5 nearby real Taichung temples
src/data/fortunes.json       12 sample fortune-stick poems (extend toward a full 60 for production)
src/data/festivals.json      Sample festival/ritual calendar for 2026
public/liff/                 The LIFF front-end (index.html / style.css / app.js / config.js)
```

## What's demo-scoped vs. what a real deployment needs

- `src/data/fortunes.json` has 12 sample poems, not the traditional full 60 (六十甲子籤) — worth expanding if
  you have time before judging.
- `subscribers.js` is in-memory — festival-reminder subscriptions are lost on restart. Fine for a live demo,
  not for production; swap in SQLite/Firestore when you have time.
- Light-lamp (光明燈) booking and payment aren't wired up — the pitch deck should present it as the next
  milestone (ties into the 營運模式/商業模式 scoring criterion) rather than something already built.
- `src/data/temples.json` currently only has 6 temples around Taichung's old city center (near 萬春宮). Add
  more entries (and real lat/lng) to widen "nearby temple" coverage, or just rely on the Google Places
  fallback once `GOOGLE_MAPS_API_KEY` is set — it'll surface anything Google has tagged as a place of worship.
