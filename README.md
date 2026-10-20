# Sadiq WhatsApp Bot

This project is a full WhatsApp bot built with Node.js and Baileys. It is designed to run on Render and uses a pairing code linking method instead of QR linking.

Features:
- Multiple WhatsApp sessions
- Pairing code linking flow
- Full command menu
- Custom bot identity: Sadiq / sadiq / +2348125149399
- Custom bot image
- Friendly fun commands and demo commands
- Render deployment ready

## Pairing code flow

On your phone:
1. Open WhatsApp
2. Tap the 3 dots menu
3. Select Linked devices
4. Choose Link a device
5. Select Link with phone number
6. Enter the pairing code shown in Render logs

The app logs a pairing code like:
```text
[main] PAIRING CODE: ABCD1234
```

Use that exact code to connect the bot.

## Commands

Available commands:
- .menu
- .help
- .info
- .status
- .ping
- .time
- .date
- .echo <text>
- .quote
- .joke
- .insult
- .flip
- .dice
- .image
- .download
- .group
- .mybot
- .whoami
- .number
- .owner
- .weather
- .clear
- .fun
- .v
- .vv
- .link
- .start

## Setup

```bash
npm install
cp .env.example .env
npm start
```

## Render deployment

1. Push to GitHub
2. Create a new Web Service on Render
3. Connect this repository
4. Use:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
   - Plan: `Free`
5. Deploy
6. Watch the Render logs for the pairing code

## Multi-session support

You can create additional sessions with:
```text
https://YOUR_RENDER_URL.onrender.com/api/session/new?name=office
```

The session data is stored under the `sessions/` folder.

## Bot identity

- Name: Sadiq
- Bot name: sadiq
- Number: +2348125149399

## Important note

This project is built with Baileys for WhatsApp automation. For a production WhatsApp bot, you should use official WhatsApp Business APIs where applicable and follow Meta's platform rules.
