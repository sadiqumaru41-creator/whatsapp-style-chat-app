const fs = require('fs');
const path = require('path');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require('@whiskeysystems/baileys');

const sessionState = {};

const botDetails = {
  name: 'Sadiq',
  botName: 'sadiq',
  phone: '2348125149399',
  profileImage: '/images/sadiq-bot.svg',
  pairingCodeNumber: '2348125149399',
};

const commands = [
  '.menu', '.help', '.info', '.status', '.ping', '.time', '.date',
  '.echo <text>', '.quote', '.joke', '.insult', '.flip', '.dice',
  '.image', '.download', '.group', '.mybot', '.whoami', '.number',
  '.owner', '.weather', '.clear', '.fun', '.v', '.vv', '.link', '.start'
];

const menuItems = [
  '1. .menu / .help - show menu',
  '2. .status - bot status',
  '3. .time / .date - clock and date',
  '4. .echo <text> - repeat a message',
  '5. .quote / .joke / .insult - fun content',
  '6. .flip / .dice - random games',
  '7. .image - bot image link',
  '8. .download - sample download feature',
  '9. .group - group instructions',
  '10. .mybot / .whoami - bot details',
  '11. .owner / .number - contact info',
  '12. .fun - fun mode',
  '13. .link - pairing help',
  '14. .v / .vv - bot version & command list'
];

const quotes = [
  'The only way to do great work is to love what you do. - Steve Jobs',
  'Success is the sum of small efforts, repeated day in and day out. - Robert Collier',
  'Code is like humor. When you have to explain it, it is bad. - Cory House',
  'Innovation distinguishes between a leader and a follower. - Steve Jobs',
  'First, solve the problem. Then, write the code. - John Johnson'
];

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'I told my computer I needed a break, and now it won’t stop sending me “error: no rest”.',
  'A SQL query walks into a bar, and the bartender says, “We need to see some tables.”',
  'Why did the developer go broke? Because he used up all his cache.',
  'I would tell you a UDP joke, but you might not get it.'
];

const funInsults = [
  'You are like a bug in a production build: entertaining, but not useful.',
  'You are proof that even bad ideas can still have a strong Wi‑Fi signal.',
  'You have the energy of a stale commit message and the timing of a skipped test.',
  'You are an original masterpiece of confusion with extra nonsense.',
  'Your brain must be running on a very outdated kernel.'
];

const welcomePhrases = [
  'Hello! I am Sadiq Bot. Type .menu to see all commands.',
  'Welcome! Sadiq Bot is online. Type .help for all features.',
  'Hi there! I am Sadiq. Use .menu for the command list.'
];

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function getCurrentDate() {
  return new Date().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' });
}

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildMenuText() {
  return [
    'Sadiq Bot Main Menu',
    '===================',
    ...menuItems,
    '',
    'Examples:',
    '.menu',
    '.help',
    '.echo hello',
    '.quote',
    '.insult',
    '.fun',
    '.image'
  ].join('\n');
}

function buildHelpText() {
  return [
    'Sadiq Bot Commands:',
    ...commands.map((cmd) => `• ${cmd}`),
    '',
    'Examples:',
    '• .menu',
    '• .v',
    '• .vv',
    '• .echo hello',
    '• .insult',
    '• .download',
    '• .image',
    '• .group',
    '• .fun'
  ].join('\n');
}

async function sendTextMessage(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text });
  } catch (err) {
    console.error('Failed to send message:', err);
  }
}

function getBotSummary(sessionName) {
  return [
    'Sadiq Bot is online ✅',
    `Name: ${botDetails.name}`,
    `Bot: ${botDetails.botName}`,
    `Number: ${botDetails.phone}`,
    `Session: ${sessionName}`
  ].join('\n');
}

async function addMessageHandler(sock, sessionName) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages) {
      if (!message.message || message.key?.fromMe) continue;

      const textMessage =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        '';

      if (!textMessage) continue;

      const trimmed = textMessage.trim();
      const lower = trimmed.toLowerCase();
      const from = message.key.remoteJid;

      if (lower === 'hi' || lower === 'hello' || lower === 'hey' || lower === 'sadiq') {
        await sendTextMessage(sock, from, randomItem(welcomePhrases));
        continue;
      }

      if (!/^[./]/.test(trimmed)) continue;

      const [rawCommand, ...args] = trimmed.split(/\s+/);
      const command = rawCommand.replace(/^[./]/, '').toLowerCase();
      let response = 'I do not understand that command. Type .help for options.';

      switch (command) {
        case 'menu':
          response = buildMenuText();
          break;
        case 'help':
          response = buildHelpText();
          break;
        case 'info':
          response = getBotSummary(sessionName);
          break;
        case 'v':
        case 'version':
          response = 'Sadiq Bot v1.2.0\nBuilt for WhatsApp automation and Render deployment.';
          break;
        case 'vv':
          response = `Sadiq Bot command list:\n${commands.join('\n')}`;
          break;
        case 'ping':
          response = 'Pong! Sadiq Bot is online.';
          break;
        case 'status':
          response = `Status: online\nBot: ${botDetails.botName}\nOwner: ${botDetails.name}\nNumber: ${botDetails.phone}\nSession: ${sessionName}`;
          break;
        case 'time':
          response = `Current time: ${getCurrentTime()}`;
          break;
        case 'date':
          response = `Today: ${getCurrentDate()}`;
          break;
        case 'echo':
          response = args.length ? args.join(' ') : 'Echo: Please provide text after .echo';
          break;
        case 'quote':
          response = randomItem(quotes);
          break;
        case 'joke':
          response = randomItem(jokes);
          break;
        case 'insult':
          response = randomItem(funInsults);
          break;
        case 'flip':
          response = Math.random() > 0.5 ? 'Heads' : 'Tails';
          break;
        case 'dice':
          response = `🎲 Dice roll: ${Math.floor(Math.random() * 6) + 1}`;
          break;
        case 'image':
          response = `Sadiq Bot image: ${process.env.PUBLIC_BASE_URL || 'https://your-render-url.onrender.com'}${botDetails.profileImage}\nName: ${botDetails.name}\nBot: ${botDetails.botName}\nNumber: ${botDetails.phone}`;
          break;
        case 'download':
          response = 'Download demo: https://example.com/download\nYou can replace this with your actual file or hosted media link.';
          break;
        case 'group':
          response = 'Group mode is active. Add Sadiq to the group and send .menu, .help, or .status to interact with the bot.';
          break;
        case 'mybot':
        case 'whoami':
          response = `Bot name: ${botDetails.botName}\nOwner: ${botDetails.name}\nPhone: ${botDetails.phone}\nSession: ${sessionName}`;
          break;
        case 'number':
          response = `Bot number: ${botDetails.phone}`;
          break;
        case 'owner':
          response = `Owner: ${botDetails.name}\nBot: ${botDetails.botName}`;
          break;
        case 'weather':
          response = 'Weather command: demo mode enabled. Connect your weather API for live data.';
          break;
        case 'clear':
          response = 'Chat cleared in demo mode. If you add persistent history later, this command can reset it.';
          break;
        case 'fun':
          response = [
            'Fun mode activated ✅',
            `🎉 Bot name: ${botDetails.botName}`,
            `👤 Owner: ${botDetails.name}`,
            `📞 Number: ${botDetails.phone}`,
            `⚡ Command list: ${commands.join(', ')}`
          ].join('\n');
          break;
        case 'start':
          response = `Sadiq Bot started successfully.\nSession: ${sessionName}\nUse .menu to begin.`;
          break;
        case 'link':
          response = 'Linking info: Open WhatsApp > Linked devices > Link with phone number > Enter the pairing code shown in the Render terminal logs.';
          break;
        default:
          response = `Unknown command: ${rawCommand}. Type .help for all commands.`;
      }

      await sendTextMessage(sock, from, response);
    }
  });
}

async function startSession(sessionName = 'sadiq') {
  if (sessionState[sessionName]) {
    return sessionState[sessionName];
  }

  const sessionDir = path.join(process.cwd(), 'sessions', sessionName);
  fs.mkdirSync(sessionDir, { recursive: true });

  const { state, saveCreds } = await useMultiFileAuthState(sessionDir);
  const sock = makeWASocket({
    auth: state,
    printQRInTerminal: false,
    browser: Browsers.macOS('Desktop'),
    pairingCode: true,
  });

  sessionState[sessionName] = {
    socket: sock,
    connected: false,
    pairingCode: null,
    sessionName,
    startedAt: new Date().toISOString(),
  };

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      sessionState[sessionName].connected = true;

      try {
        const code = await sock.requestPairingCode(botDetails.pairingCodeNumber);
        const cleanCode = String(code || '').replace(/\s+/g, '').trim();
        sessionState[sessionName].pairingCode = cleanCode;

        console.log(`\n[${sessionName}] PAIRING CODE: ${cleanCode}`);
        console.log(`[${sessionName}] Open WhatsApp > Linked devices > Link with phone number > Enter the code above.`);
      } catch (err) {
        console.warn(`[${sessionName}] Pairing code request failed:`, err?.message || err);
      }
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      sessionState[sessionName].connected = false;

      if (shouldReconnect) {
        console.log(`[${sessionName}] Connection closed. Reconnecting...`);
        setTimeout(() => startSession(sessionName), 3000);
      } else {
        console.log(`[${sessionName}] Connection closed: logged out. Delete sessions/${sessionName} and reconnect.`);
      }
    }
  });

  await addMessageHandler(sock, sessionName);
  return sessionState[sessionName];
}

function listSessions() {
  return Object.keys(sessionState).map((name) => ({
    name,
    connected: !!sessionState[name]?.connected,
    pairingCode: !!sessionState[name]?.pairingCode,
  }));
}

function getSessionStatus(name) {
  const status = name ? sessionState[name] : sessionState;
  if (!status) return null;

  if (name) {
    return {
      session: name,
      connected: !!status.connected,
      pairingCode: status.pairingCode || null,
      startedAt: status.startedAt,
    };
  }

  return Object.fromEntries(
    Object.entries(status).map(([key, value]) => [
      key,
      {
        connected: !!value.connected,
        pairingCode: value.pairingCode || null,
        startedAt: value.startedAt,
        sessionName: value.sessionName,
      }
    ])
  );
}

module.exports = {
  startSession,
  getSessionStatus,
  listSessions,
  botDetails,
  commands,
};





















































