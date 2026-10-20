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
  pairingCodeNumber: '2348125149399'
};

const commands = [
  '.menu', '.help', '.info', '.status', '.ping', '.time', '.date',
  '.echo <text>', '.quote', '.joke', '.insult', '.flip', '.dice',
  '.image', '.download', '.group', '.mybot', '.whoami', '.number',
  '.weather', '.clear', '.fun', '.v', '.vv', '.owner', '.link'
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
    '.help - show all commands',
    '.status - bot status',
    '.time - current time',
    '.date - current date',
    '.echo <text> - repeat text',
    '.quote - random quote',
    '.joke - random joke',
    '.insult - funny insult',
    '.flip - coin toss',
    '.dice - random dice',
    '.image - bot image link',
    '.download - demo download link',
    '.group - group info',
    '.mybot - bot details',
    '.number - phone number',
    '.weather - weather status',
    '.fun - fun mode',
    '.v - app version',
    '.vv - full command list',
    '.owner - owner info',
    '.link - pairing info',
    '',
    'Type .help for all commands.'
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

      if (!textMessage || !/^[./]/.test(textMessage.trim())) continue;

      const cleanText = textMessage.trim();
      const [rawCommand, ...args] = cleanText.split(/\s+/);
      const command = rawCommand.replace(/^[./]/, '').toLowerCase();
      const from = message.key.remoteJid;
      let response = 'I do not understand that command. Type .help for options.';

      switch (command) {
        case 'menu':
        case 'help':
          response = command === 'menu' ? buildMenuText() : buildHelpText();
          break;
        case 'v':
        case 'version':
          response = 'Sadiq Bot v1.1.0\nBuilt for WhatsApp automation and Render deployment.';
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
          response = 'Download command active. Example: .download https://example.com/file.zip\nThis is a demo feature for app testing and fun commands.';
          break;
        case 'group':
          response = 'Group command ready. In a WhatsApp group, add Sadiq as a participant and use .menu or .help to manage commands.';
          break;
        case 'mybot':
        case 'whoami':
          response = `Bot name: ${botDetails.botName}\nOwner: ${botDetails.name}\nPhone: ${botDetails.phone}\nSession: ${sessionName}`;
          break;
        case 'number':
          response = `The bot number is ${botDetails.phone}`;
          break;
        case 'owner':
          response = `Owner: ${botDetails.name}\nBot: ${botDetails.botName}`;
          break;
        case 'weather':
          response = 'Weather command: demo mode is on. Connect an API key to enable live weather data.';
          break;
        case 'clear':
          response = 'Chat cleared in demo mode. Use your app logic to reset message memory if needed.';
          break;
        case 'link':
          response = 'Linking method: Use WhatsApp > Linked devices > Link with phone number. Enter the pairing code shown in the Render terminal logs.';
          break;
        case 'fun':
          response = [
            'Fun mode activated ✅',
            `🎉 Bot name: ${botDetails.botName}`,
            `👤 Owner: ${botDetails.name}`,
            `📞 Number: ${botDetails.phone}`,
            `⚡ Command count: ${commands.length}`
          ].join('\n');
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
    startedAt: new Date().toISOString()
  };

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      console.log(`\n[${sessionName}] QR mode still active. The bot is configured for pairing code mode by default.`);
    }

    if (connection === 'open') {
      sessionState[sessionName].connected = true;
      try {
        const code = await sock.requestPairingCode(botDetails.pairingCodeNumber);
        const cleanCode = String(code || '').replace(/\s+/g, '').trim();
        sessionState[sessionName].pairingCode = cleanCode;

        console.log(`\n[${sessionName}] PAIRING CODE: ${cleanCode}`);
        console.log(`[${sessionName}] Open WhatsApp > Linked devices > Link with phone number > Enter the code above.`);
      } catch (err) {
        console.warn(`[${sessionName}] Pairing code request failed:`, err.message || err);
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
    pairingCode: !!sessionState[name]?.pairingCode
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
      startedAt: status.startedAt
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




















































































































































































