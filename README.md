# Appointment Booking Bot

A chatbot that lets your customers book appointments through natural conversation. Works on your website or WhatsApp. Users just type what they want — "I need a haircut on Thursday afternoon" — and the bot handles the rest.

Built with Node.js, Express, and OpenAI for understanding what people actually mean when they ask to book something.

## What It Does

- Understands natural language booking requests
- Shows available time slots
- Confirms bookings with all the details
- Manages a calendar of appointments so there's no double-booking
- Knows your services, prices, and durations from a config file

## Setup

```bash
git clone https://github.com/Hand-On-Web-Ltd/appointment-booking-bot.git
cd appointment-booking-bot
npm install
cp .env.example .env
# Add your OpenAI API key to .env
npm start
```

Then open `http://localhost:3000` in your browser.

## Configuration

Edit `config/services.json` to set up your services:

```json
[
  {
    "name": "Consultation",
    "duration": 30,
    "price": 50,
    "description": "Initial consultation"
  }
]
```

## Environment Variables

| Variable | What it is |
|----------|-----------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `BUSINESS_NAME` | Your business name (shown in chat) |
| `BUSINESS_EMAIL` | Where booking confirmations get sent |
| `PORT` | Server port (default: 3000) |

## How It Works

1. User says something like "I want to book a massage next Tuesday"
2. OpenAI parses the intent and extracts the service + preferred time
3. Bot checks available slots for that service
4. Shows options and confirms the booking
5. Stores the appointment and sends a confirmation

## Tech Stack

- Node.js + Express
- OpenAI API for natural language understanding
- Vanilla JS frontend (no framework needed)

## About Hand On Web
We build AI chatbots, voice agents, and automation tools for businesses.
- 🌐 [handonweb.com](https://www.handonweb.com)
- 📧 outreach@handonweb.com
- 📍 Chester, UK

## Licence
MIT
