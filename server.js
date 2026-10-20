require('dotenv').config();
const express = require('express');
const path = require('path');
const fs = require('fs');
const { startSession, getSessionStatus, listSessions } = require('./lib/whatsappBot');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.get('/health', (req, res) => {
  res.json({
    ok: true,
    message: 'WhatsApp bot server is running',
    sessions: listSessions(),
    timestamp: new Date().toISOString()
  });
});

app.get('/api/status', (req, res) => {
  res.json(getSessionStatus());
});

app.get('/api/session/new', async (req, res) => {
  const name = (req.query.name || 'session').toString().trim().toLowerCase();
  if (!name || !/^[a-z0-9_-]+$/i.test(name)) {
    return res.status(400).json({ error: 'Use a simple session name like mybot or sadiq1' });
  }

  try {
    const session = await startSession(name);
    res.json({
      ok: true,
      session: name,
      qrReady: !!session.qrCode,
      message: 'Session started. Check Render logs for the QR code to link WhatsApp.'
    });
  } catch (error) {
    console.error('[SERVER] Failed to start session:', error);
    res.status(500).json({ error: 'Could not start session' });
  }
});

app.get('/api/session/:name/qr', async (req, res) => {
  const { name } = req.params;
  const status = getSessionStatus(name);
  if (!status || !status.qrCode) {
    return res.status(404).json({ error: 'No QR available for this session yet.' });
  }
  res.json({ qrCode: status.qrCode, session: name });
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

(async () => {
  const defaultSession = process.env.DEFAULT_SESSION || 'sadiq';
  try {
    await startSession(defaultSession);
    console.log(`[SERVER] Default session started: ${defaultSession}`);
  } catch (error) {
    console.error('[SERVER] Could not start default session:', error);
  }

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Open the app in the browser to check status.');
    console.log('For linking WhatsApp, scan the QR printed in the Render logs.');
  });
})();

process.on('SIGINT', () => {
  console.log('Stopping server...');
  process.exit(0);
});
