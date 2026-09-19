require('dotenv').config();
const express = require('express');
const path = require('path');

const webhookRouter = require('./src/routes/webhook');
const liffApiRouter = require('./src/routes/liff');
const { startFestivalNotifier } = require('./src/services/notifier');

const app = express();

// LINE webhook needs the raw body for signature verification, so it's mounted
// BEFORE express.json() and uses its own middleware (see src/routes/webhook.js).
app.use('/webhook', webhookRouter);

app.use(express.json());
app.use('/api', liffApiRouter);
app.use('/liff', express.static(path.join(__dirname, 'public/liff')));

app.get('/', (req, res) => res.send('line-temple-bot is running. LIFF app: /liff'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`line-temple-bot listening on port ${PORT}`);
  startFestivalNotifier();
});
