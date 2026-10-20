# Sadiq Termux WhatsApp Bot

This repo is a personal Termux-ready WhatsApp bot built for a single account. It is designed for direct DM use on your own device and includes a large command list plus a premium contact flow.

Important:
- This bot is for a personal WhatsApp account on your own device.
- It does not create a public multi-user bot where random users receive pairing codes for your WhatsApp account.
- Users can message the bot and receive commands and premium access instructions, but the bot cannot pair another account to your WhatsApp number.

## What it supports
- personal pairing-code login on Termux
- large command list
- premium gating for selected commands
- admin VIP granting with .grantvip
- free and premium command separation
- owner contact flow for premium access
- direct DM bot behavior

## Commands
The bot includes a large command list such as:
- .help
- .menu
- .status
- .info
- .time
- .date
- .ping
- .echo
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
- .contact
- .weather
- .fun
- .link
- .vip
- .premium
- .unlock
- .secret
- .special
- .offer
- .access
- .plan
- .activate
- .upgrade
- .support
- .rules
- .terms
- .hello
- .hi
- .goodbye
- .random
- .truth
- .dare
- .love
- .guess
- .math
- .calc
- .points
- .profile
- .gift
- .reward
- .promo
- .invite
- .share
- .helpvip
- .admin
- .grantvip
- .removevip
- .clear
- .start

## Premium access
Premium-content commands are gated.
If a user tries a premium command without access, the bot tells them to contact the owner at:

+2348125149399

This is a manual premium flow, not a public payment system.

## Termux install
Run this in Termux:

```bash
pkg update
pkg install git nodejs

git clone <your-repo-url>
cd <repo-folder>

npm install
npm start
```

## Pairing step
When the bot starts, it prints a pairing code in the terminal.

On your phone:
1. Open WhatsApp
2. Go to Linked devices
3. Select Link with phone number
4. Enter the pairing code shown in Termux

## Admin VIP commands
After pairing the bot to your number, send these commands from the owner account:
- .grantvip 23481234567890
- .removevip 23481234567890

## Important note
This is a personal bot project. It is not a public SaaS where random users get pairing codes from your number. That requires WhatsApp Business API infrastructure and official business setup.
