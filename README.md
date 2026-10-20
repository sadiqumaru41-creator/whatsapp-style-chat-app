# Sadiq WhatsApp Bot

This project is a Render-ready WhatsApp-style chatbot built with Node.js and the Baileys library.

Features:
- Multiple WhatsApp sessions (each session is a separate folder in `sessions/`)
- QR linking flow for WhatsApp
- Commands such as `.help`, `.menu`, `.v`, `.vv`, `.insult`, `.download`, `.image`, `.fun`, `.status`, etc.
- A custom Sadiq bot image profile at `/images/sadiq-bot.svg`
- Ready for Render deployment

## Requirements
- Node.js 18+
- Render account
- WhatsApp mobile app

## Local setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Copy the environment example:
   ```bash
   cp .env.example .env
   ```

3. Start the app:
   ```bash
   npm start
   ```

4. Watch the terminal logs for the QR code.

5. Open WhatsApp on your phone and scan the code in:
   - WhatsApp app
   - Linked Devices
   - Link a device

## Render deployment

1. Push this repo to GitHub.
2. Create a new Web Service in Render.
3. Select the repo.
4. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Environment: `Node`
   - Plan: `Free`
5. Deploy.
6. In the Render logs, look for the QR code printed by the app.
7. Scan it with your WhatsApp mobile app.

## Multiple sessions

Each session is stored in a folder inside `sessions/`.

Example:
```bash
/sessions/sadiq
/sessions/office
/sessions/extra
```

To open an additional session from the app, use the route:
```text
https://YOUR_RENDER_URL.onrender.com/api/session/new?name=office
```

You can also start another session by editing the server or calling the route manually.

## Commands

Available examples:
- `.help`
- `.menu`
- `.v`
- `.vv`
- `.ping`
- `.status`
- `.time`
- `.date`
- `.echo hello`
- `.quote`
- `.joke`
- `.insult`
- `.flip`
- `.dice`
- `.image`
- `.download`
- `.group`
- `.mybot`
- `.number`
- `.whoami`
- `.weather`
- `.fun`

## Bot identity

- Name: Sadiq
- Bot name: sadiq
- Number: 2348125149399

## Important notes

- Render free tier can be unstable or sleep, so the bot may stop when the service is inactive.
- The QR linking code appears in the logs, not necessarily in the browser.
- If you log out, remove the matching folder in `sessions/` and re-link the device.

## Example image path

```text
https://YOUR_RENDER_URL.onrender.com/images/sadiq-bot.svg
```
