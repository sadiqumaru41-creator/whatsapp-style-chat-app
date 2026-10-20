const fs = require('fs');
const path = require('path');
const { randomUUID } = require('crypto');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require('@whiskeysystems/baileys');

const sessionState = {};
const qrStore = {};

const botDetails = {
  name: 'Sadiq',
  botName: 'sadiq',
  phone: '2348125149399',
  profileImage: '/images/sadiq-bot.svg'
};

const commands = [
  '.help', '.menu', '.info', '.v', '.vv', '.ping', '.status', '.time', '.date',
  '.echo <text>', '.quote', '.joke', '.flip', '.dice', '.image', '.download', '.insult',
  '.group', '.mybot', '.number', '.whoami', '.weather', '.clear', '.fun'
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

function buildHelpText() {
  return [
    'Sadiq Bot Commands:',
    ...commands.map(cmd => `• ${cmd}`),
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
        case 'help':
        case 'menu':
          response = buildHelpText();
          break;
        case 'v':
        case 'version':
          response = 'Sadiq Bot v1.0.0\nBuilt for WhatsApp automation and Render deployment.';
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
          response = 'Download command active. Example: .download https://example.com/file.zip\nThis is a fun demo bot; you can connect a real download link or file sender here.';
          break;
        case 'group':
          response = 'Group command ready: create your group, add Sadiq, then use .help or .menu inside the group.';
          break;
        case 'mybot':
        case 'whoami':
          response = `Bot name: ${botDetails.botName}\nOwner: ${botDetails.name}\nPhone: ${botDetails.phone}`;
          break;
        case 'number':
          response = `The bot number is ${botDetails.phone}`;
          break;
        case 'weather':
          response = 'Weather command: current demo mode. Add your weather API key to enable live weather data.';
          break;
        case 'clear':
          response = 'Chat cleared in demo mode. Use your app logic to reset memory or history.';
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
        default:
          response = `Unknown command: ${rawCommand}. Type .help for all commands.`;
      }

      try {
        await sock.sendMessage(from, { text: response });
      } catch (err) {
        console.error(`[${sessionName}] Could not send response:`, err);
      }
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
  });

  sessionState[sessionName] = {
    socket: sock,
    connected: false,
    qrCode: null,
    sessionName,
    startedAt: new Date().toISOString()
  };

  sock.ev.on('creds.update', saveCreds);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect, qr } = update;

    if (qr) {
      qrStore[sessionName] = qr;
      sessionState[sessionName].qrCode = qr;
      console.log(`\n[${sessionName}] WhatsApp QR code generated. Scan it from WhatsApp > Linked Devices > Link a device.`);
      qrcode.generate(qr, { small: true });
    }

    if (connection === 'open') {
      sessionState[sessionName].connected = true;
      sessionState[sessionName].qrCode = null;
      qrStore[sessionName] = null;
      console.log(`[${sessionName}] WhatsApp connected successfully.`);
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
    qrCode: !!sessionState[name]?.qrCode
  }));
}

function getSessionStatus(name) {
  const status = name ? sessionState[name] : sessionState;
  if (!status) return null;

  if (name) {
    return {
      session: name,
      connected: !!status.connected,
      qrCode: status.qrCode || null,
      startedAt: status.startedAt
    };
  }

  return Object.fromEntries(
    Object.entries(status).map(([key, value]) => [
      key,
      {
        connected: !!value.connected,
        qrCode: value.qrCode || null,
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
