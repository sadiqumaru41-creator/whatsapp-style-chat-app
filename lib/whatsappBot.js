const fs = require('fs');
const path = require('path');
const qrcode = require('qrcode-terminal');
const {
  default: makeWASocket,
  DisconnectReason,
  useMultiFileAuthState,
  Browsers,
} = require('@whiskeysystems/baileys');

const sessionState = {};
const premiumUsers = new Map();
const adminNumbers = new Set(['2348125149399']);

const botDetails = {
  name: 'Sadiq',
  botName: 'sadiq',
  phone: '2348125149399',
  premiumContact: '+2348125149399',
  owner: 'Sadiq',
  botTag: 'Sadiq Bot',
};

const commandList = [
  '.help', '.menu', '.status', '.info', '.version', '.v', '.vv',
  '.time', '.date', '.ping', '.echo <text>', '.quote', '.joke', '.insult',
  '.flip', '.dice', '.image', '.download', '.group', '.mybot', '.whoami',
  '.number', '.owner', '.contact', '.weather', '.fun', '.link', '.vip',
  '.premium', '.unlock', '.secret', '.special', '.offer', '.access', '.plan',
  '.activate', '.upgrade', '.support', '.rules', '.terms', '.hello', '.hi',
  '.goodbye', '.random', '.truth', '.dare', '.love', '.guess', '.math',
  '.calc', '.points', '.profile', '.gift', '.reward', '.promo', '.invite',
  '.share', '.helpvip', '.admin', '.grantvip', '.removevip', '.clear', '.start'
];

const quotes = [
  'The only way to do great work is to love what you do. - Steve Jobs',
  'Success is the sum of small efforts, repeated day in and day out. - Robert Collier',
  'Code is like humor. When you have to explain it, it is bad. - Cory House',
  'Innovation distinguishes between a leader and a follower. - Steve Jobs',
  'First, solve the problem. Then, write the code. - John Johnson',
  'Stay hungry, stay foolish. - Steve Jobs'
];

const jokes = [
  'Why do programmers prefer dark mode? Because light attracts bugs.',
  'I told my computer I needed a break, and now it won’t stop sending me “error: no rest”.',
  'A SQL query walks into a bar, and the bartender says, “We need to see some tables.”',
  'Why did the developer go broke? Because he used up all his cache.',
  'I would tell you a UDP joke, but you might not get it.',
  'Why was the JavaScript developer sad? Because he didn’t know how to “null” his feelings.'
];

const funInsults = [
  'You are like a bug in a production build: entertaining, but not useful.',
  'You are proof that even bad ideas can still have a strong Wi‑Fi signal.',
  'You have the energy of a stale commit message and the timing of a skipped test.',
  'You are an original masterpiece of confusion with extra nonsense.',
  'Your brain must be running on a very outdated kernel.',
  'You are a surprise feature no one asked for.'
];

const welcomeMessages = [
  'Hello! I am Sadiq Bot. Type .menu to see the command list.',
  'Hi there! I am Sadiq Bot. Type .help for all commands.',
  'Welcome! I am Sadiq. Use .menu to begin.'
];

function normalizeNumber(value) {
  return String(value || '').replace(/\D/g, '');
}

function normalizeJid(jid) {
  if (!jid) return '';
  return normalizeNumber(jid.split('@')[0]);
}

function isAdminJid(jid) {
  return adminNumbers.has(normalizeJid(jid));
}

function isPremiumUser(jid) {
  const key = normalizeJid(jid);
  return premiumUsers.has(key) || adminNumbers.has(key);
}

function getCurrentTime() {
  return new Date().toLocaleTimeString('en-NG', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });
}

function getCurrentDate() {
  return new Date().toLocaleDateString('en-NG', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
}

function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

function buildMenu() {
  return [
    'Sadiq Bot Menu',
    '====================',
    'Free commands:',
    '.help  .menu  .status  .info',
    '.time  .date  .ping  .echo <text>',
    '.quote  .joke  .insult  .flip',
    '.dice  .image  .download  .group',
    '.mybot  .whoami  .number  .owner',
    '.contact  .weather  .fun  .link',
    '.vip  .premium  .unlock  .secret',
    '.special  .offer  .access  .plan',
    '.upgrade  .support  .rules  .terms',
    '.hello  .hi  .goodbye  .random',
    '.truth  .dare  .love  .guess',
    '.math  .calc  .points  .profile',
    '.gift  .reward  .promo  .invite',
    '.share  .helpvip  .admin  .start',
    '',
    'Premium commands are gated. Contact +2348125149399 to request premium access.'
  ].join('\n');
}

function buildHelp() {
  return [
    'Sadiq Bot Commands:',
    ...commandList.map((cmd) => `• ${cmd}`),
    '',
    'Examples:',
    '• .menu',
    '• .status',
    '• .echo hello',
    '• .joke',
    '• .vip',
    '• .contact',
    '• .link'
  ].join('\n');
}

async function sendText(sock, jid, text) {
  try {
    await sock.sendMessage(jid, { text });
  } catch (err) {
    console.error('Failed to send message: ', err);
  }
}

function isPremiumCommand(command) {
  const premiumSet = new Set([
    'vip', 'premium', 'unlock', 'secret', 'special', 'offer', 'access',
    'plan', 'activate', 'upgrade', 'support', 'helpvip', 'admin', 'grantvip',
    'removevip', 'statusvip', 'private', 'members', 'reward', 'promo'
  ]);
  return premiumSet.has(command);
}

function quoteMessage(sessionName) {
  return [
    'Sadiq Bot is online ✅',
    `Name: ${botDetails.name}`,
    `Bot: ${botDetails.botName}`,
    `Phone: ${botDetails.phone}`,
    `Session: ${sessionName}`
  ].join('\n');
}

async function addMessageHandler(sock, sessionName) {
  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const message of messages) {
      if (!message.message || message.key?.fromMe) continue;

      const rawText =
        message.message.conversation ||
        message.message.extendedTextMessage?.text ||
        message.message.imageMessage?.caption ||
        message.message.videoMessage?.caption ||
        '';

      if (!rawText) continue;

      const trimmed = rawText.trim();
      const sender = message.key.remoteJid || '';
      const lower = trimmed.toLowerCase();

      if (['hi', 'hello', 'hey', 'sadiq', 'good morning', 'good evening'].includes(lower)) {
        await sendText(sock, sender, randomItem(welcomeMessages));
        continue;
      }

      if (!/^[./]/.test(trimmed)) continue;

      const [rawCommand, ...args] = trimmed.split(/\s+/);
      const command = rawCommand.replace(/^[./]/, '').toLowerCase();
      let response = 'Unknown command. Type .help for available commands.';

      if (command === 'menu' || command === 'help') {
        response = command === 'menu' ? buildMenu() : buildHelp();
      } else if (command === 'status' || command === 'info') {
        response = quoteMessage(sessionName);
      } else if (['v', 'version'].includes(command)) {
        response = `Sadiq Bot v2.0.0\nTermux-ready personal WhatsApp bot\nPremium contact: ${botDetails.premiumContact}`;
      } else if (command === 'vv') {
        response = `${commandList.join('\n')}`;
      } else if (command === 'ping') {
        response = 'Pong! Sadiq Bot is online.';
      } else if (command === 'time') {
        response = `Current time: ${getCurrentTime()}`;
      } else if (command === 'date') {
        response = `Today: ${getCurrentDate()}`;
      } else if (command === 'echo') {
        response = args.length ? args.join(' ') : 'Echo: Please provide text after .echo';
      } else if (command === 'quote') {
        response = randomItem(quotes);
      } else if (command === 'joke') {
        response = randomItem(jokes);
      } else if (command === 'insult') {
        response = randomItem(funInsults);
      } else if (command === 'flip') {
        response = Math.random() > 0.5 ? 'Heads' : 'Tails';
      } else if (command === 'dice') {
        response = `🎲 Dice roll: ${Math.floor(Math.random() * 6) + 1}`;
      } else if (command === 'image') {
        response = 'Image available in the bot directory or via your hosted image URL. For this personal bot, use your uploaded image link or set a file URL here.';
      } else if (command === 'download') {
        response = 'Download command active. Add your host link or file endpoint here for real downloads.';
      } else if (command === 'group') {
        response = 'Group command is active. Add the bot to a group and use .menu or .status for basic commands.';
      } else if (['mybot', 'whoami'].includes(command)) {
        response = `Bot name: ${botDetails.botName}\nOwner: ${botDetails.owner}\nNumber: ${botDetails.phone}`;
      } else if (command === 'number') {
        response = `Owner contact: ${botDetails.premiumContact}`;
      } else if (command === 'owner') {
        response = `Owner: ${botDetails.owner}\nContact: ${botDetails.premiumContact}`;
      } else if (command === 'contact') {
        response = `To request premium access, contact Sadiq on ${botDetails.premiumContact}.`;
      } else if (command === 'weather') {
        response = 'Weather command is ready. Connect your weather API to enable live data.';
      } else if (command === 'fun') {
        response = [
          'Fun mode activated ✅',
          `Bot: ${botDetails.botName}`,
          `Owner: ${botDetails.owner}`,
          `Premium contact: ${botDetails.premiumContact}`,
          `Commands: ${commandList.length}`
        ].join('\n');
      } else if (command === 'link') {
        response = 'This bot is a personal Termux setup. To link your own WhatsApp account, install the bot on your own device and run it there. This bot cannot pair random users to my WhatsApp account.';
      } else if (command === 'vip' || command === 'premium' || command === 'unlock' || command === 'secret' || command === 'special' || command === 'offer' || command === 'access' || command === 'plan' || command === 'activate' || command === 'upgrade' || command === 'support' || command === 'helpvip' || command === 'statusvip' || command === 'private') {
        if (isPremiumUser(sender)) {
          response = command === 'vip'
            ? 'VIP access is active. Premium commands are unlocked.'
            : command === 'premium'
              ? 'Premium access is active. You have full VIP access.'
              : command === 'unlock'
                ? 'Premium access unlocked successfully.'
                : command === 'secret'
                  ? 'Secret VIP access is active for your account.'
                  : command === 'special'
                    ? 'Special VIP features are enabled.'
                    : command === 'offer'
                      ? 'Premium plan is active. Contact the owner for upgrades or support.'
                      : command === 'access'
                        ? 'VIP access is active and working.'
                        : command === 'plan'
                          ? 'Plan: Premium active. Contact the owner for support.'
                          : command === 'activate'
                            ? 'Premium activation successful.'
                            : command === 'upgrade'
                              ? 'Upgrade request accepted. Contact the owner for final approval.'
                              : command === 'support'
                                ? 'VIP support is available. Contact the owner on +2348125149399.'
                                : command === 'helpvip'
                                  ? 'VIP commands: .vip .premium .unlock .secret .special .offer .access .plan'
                                  : command === 'statusvip'
                                    ? 'VIP status: active'
                                    : 'VIP features are active.';
        } else {
          response = 'This is a premium command. Contact Sadiq on +2348125149399 to request access.';
        }
      } else if (command === 'grantvip') {
        if (!isAdminJid(sender)) {
          response = 'Only the admin can grant VIP access.';
        } else {
          const target = args[0] ? normalizeNumber(args[0]) : '';
          if (!target) {
            response = 'Usage: .grantvip 23481234567890';
          } else {
            premiumUsers.set(target, true);
            response = `VIP access granted to ${target}.`;
          }
        }
      } else if (command === 'removevip') {
        if (!isAdminJid(sender)) {
          response = 'Only the admin can remove VIP access.';
        } else {
          const target = args[0] ? normalizeNumber(args[0]) : '';
          if (!target) {
            response = 'Usage: .removevip 23481234567890';
          } else {
            premiumUsers.delete(target);
            response = `VIP access removed from ${target}.`;
          }
        }
      } else if (command === 'admin') {
        response = isAdminJid(sender)
          ? 'Admin access is active. You can use .grantvip and .removevip.'
          : 'Admin tools are restricted to the bot owner.';
      } else if (command === 'start') {
        response = 'Sadiq Bot started successfully.';
      } else if (command === 'clear') {
        response = 'Demo memory cleared. This is a simple personal bot setup.';
      } else if (command === 'hello' || command === 'hi') {
        response = randomItem(welcomeMessages);
      } else if (command === 'goodbye') {
        response = 'Goodbye! See you next time.';
      } else if (command === 'random') {
        response = `Random result: ${Math.random() > 0.5 ? 'Yes' : 'No'}`;
      } else if (command === 'truth') {
        response = 'Truth: I am still learning, but I am ready to help.';
      } else if (command === 'dare') {
        response = 'Dare: Try a cool new idea and keep building.';
      } else if (command === 'love') {
        response = 'Love is a great idea, but respect, patience, and kindness matter most.';
      } else if (command === 'guess') {
        response = `My guess: ${Math.floor(Math.random() * 100) + 1}`;
      } else if (command === 'math' || command === 'calc') {
        response = 'Math helper ready. For full calculator features, connect your own math utility or API.';
      } else if (command === 'points') {
        response = 'Points system is available in your own custom logic. Add your database if needed.';
      } else if (command === 'profile') {
        response = `Name: ${botDetails.name}\nBot: ${botDetails.botName}\nOwner: ${botDetails.owner}\nContact: ${botDetails.premiumContact}`;
      } else if (command === 'gift') {
        response = 'Gift mode is active. Contact the owner to set up access rewards.';
      } else if (command === 'reward') {
        response = 'Reward system ready. Add your own logic for points, badges, or prizes.';
      } else if (command === 'promo') {
        response = 'Promotion message: Premium access is available. Contact +2348125149399.';
      } else if (command === 'invite') {
        response = 'Invite your friends to contact Sadiq on +2348125149399 for premium access.';
      } else if (command === 'share') {
        response = 'Share the contact +2348125149399 to invite others to the premium service.';
      } else if (command === 'rules') {
        response = 'Rules: Be respectful, do not spam, and use the bot for valid requests.';
      } else if (command === 'terms') {
        response = 'Terms: Use the bot responsibly. Premium access is by approval from the owner.';
      } else if (command === 'support') {
        response = 'Support contact: +2348125149399';
      } else if (command === 'offer') {
        response = 'Current offer: Premium access available for trusted users. Contact the owner.';
      } else if (command === 'pay') {
        response = 'This bot does not process payment. To get premium access, contact the owner directly.';
      }

      await sendText(sock, sender, response);
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
        const code = await sock.requestPairingCode(botDetails.phone);
        const cleanCode = String(code || '').replace(/\s+/g, '').trim();
        sessionState[sessionName].pairingCode = cleanCode;

        console.log(`\n[${sessionName}] PAIRING CODE: ${cleanCode}`);
        console.log(`[${sessionName}] Open WhatsApp > Linked devices > Link with phone number > Enter the code above.`);
      } catch (error) {
        console.warn(`[${sessionName}] Could not generate pairing code:`, error?.message || error);
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
        console.log(`[${sessionName}] Connection closed. Delete sessions/${sessionName} to reconnect.`);
      }
    }
  });

  await addMessageHandler(sock, sessionName);
  return sessionState[sessionName];
}

module.exports = {
  startSession,
  botDetails,
  premiumUsers,
  commandList,
};


