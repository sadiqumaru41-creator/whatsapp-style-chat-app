require('dotenv').config();
const { startSession, botDetails } = require('./lib/whatsappBot');

const sessionName = process.env.DEFAULT_SESSION || 'sadiq';

(async () => {
  try {
    await startSession(sessionName);
    console.log(`\n[BOOT] Started Sadiq Bot session: ${sessionName}`);
    console.log(`Owner contact: ${botDetails.premiumContact}`);
    console.log('This is a personal WhatsApp bot for Termux.');
    console.log('Users can message the bot directly, but this bot cannot grant pairing access to another account.');
  } catch (error) {
    console.error('[BOOT] Failed to start session:', error);
    process.exit(1);
  }
})();

process.on('SIGINT', () => {
  console.log('\nStopping Sadiq Bot...');
  process.exit(0);
});

