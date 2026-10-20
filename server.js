require('dotenv').config();
const express = require('express');
const path = require('path');
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
      pairingReady: !!session.pairingCode,
      message: 'Session started. Check Render logs for the pairing code to link WhatsApp.'
    });
  } catch (error) {
    console.error('[SERVER] Failed to start session:', error);
    res.status(500).json({ error: 'Could not start session' });
  }
});

app.get('/api/session/:name/pairing-code', async (req, res) => {
  const { name } = req.params;
  const status = getSessionStatus(name);

  if (!status) {
    return res.status(404).json({ error: 'Session not found' });
  }

  res.json({
    session: name,
    pairingCode: status.pairingCode || null,
    connected: !!status.connected,
    message: status.pairingCode
      ? 'Use the pairing code in WhatsApp to link the device.'
      : 'Pairing code not generated yet. Wait for the bot to connect and generate one.'
  });
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
    console.log(`\nServer running on port ${PORT}`);
    console.log('Use WhatsApp > Linked devices > Link with phone number');
    console.log('The pairing code will appear in the Render logs once the bot connects.');
  });
})();

process.on('SIGINT', () => {
  console.log('Stopping server...');
  process.exit(0);
});
