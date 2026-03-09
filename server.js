require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { OpenAI } = require('openai');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const services = JSON.parse(fs.readFileSync(path.join(__dirname, 'config', 'services.json'), 'utf8'));
const businessName = process.env.BUSINESS_NAME || 'Our Business';

// In-memory bookings store
const bookings = [];

// Generate available slots for next 7 days (9am-5pm, hourly)
function getAvailableSlots(serviceId) {
  const service = services.find(s => s.id === serviceId);
  if (!service) return [];

  const slots = [];
  const now = new Date();

  for (let day = 1; day <= 7; day++) {
    const date = new Date(now);
    date.setDate(date.getDate() + day);

    // Skip weekends
    if (date.getDay() === 0 || date.getDay() === 6) continue;

    for (let hour = 9; hour <= 16; hour++) {
      const slotStart = new Date(date);
      slotStart.setHours(hour, 0, 0, 0);

      // Check if slot is already booked
      const taken = bookings.some(b =>
        b.serviceId === serviceId &&
        new Date(b.dateTime).getTime() === slotStart.getTime()
      );

      if (!taken) {
        slots.push({
          dateTime: slotStart.toISOString(),
          display: slotStart.toLocaleString('en-GB', {
            weekday: 'long', day: 'numeric', month: 'long',
            hour: '2-digit', minute: '2-digit'
          })
        });
      }
    }
  }
  return slots;
}

// Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    const serviceList = services.map(s =>
      `- ${s.name} (${s.duration} min, £${s.price}) — ${s.description}`
    ).join('\n');

    const systemPrompt = `You are a friendly booking assistant for ${businessName}. Help customers book appointments.

Available services:
${serviceList}

Current bookings: ${bookings.length} appointments scheduled.

When a user wants to book:
1. Find out which service they want
2. Suggest available times (next 5 working days, 9am-5pm)
3. Get their name and email
4. Confirm the booking

Keep it casual and helpful. Don't be robotic. If someone just says hi, welcome them and ask what they'd like to book.

When you have all the details (service, date/time, name, email), respond with a JSON block like this at the end of your message:
BOOKING_CONFIRM: {"service":"service-id","dateTime":"ISO date","customerName":"Name","customerEmail":"email"}`;

    const messages = [
      { role: 'system', content: systemPrompt },
      ...history.map(h => ({ role: h.role, content: h.content })),
      { role: 'user', content: message }
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages,
      temperature: 0.7,
      max_tokens: 500
    });

    let reply = completion.choices[0].message.content;

    // Check if there's a booking confirmation in the response
    const bookingMatch = reply.match(/BOOKING_CONFIRM:\s*({.*})/);
    if (bookingMatch) {
      try {
        const booking = JSON.parse(bookingMatch[1]);
        bookings.push({
          id: Date.now().toString(),
          serviceId: booking.service,
          dateTime: booking.dateTime,
          customerName: booking.customerName,
          customerEmail: booking.customerEmail,
          createdAt: new Date().toISOString()
        });
        // Clean up the response
        reply = reply.replace(/BOOKING_CONFIRM:\s*{.*}/, '').trim();
      } catch (e) {
        // Parsing failed, just continue
      }
    }

    res.json({ reply });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: 'Something went wrong. Try again.' });
  }
});

// Get services
app.get('/api/services', (req, res) => {
  res.json(services);
});

// Get available slots
app.get('/api/slots/:serviceId', (req, res) => {
  const slots = getAvailableSlots(req.params.serviceId);
  res.json(slots);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Booking bot running on http://localhost:${PORT}`);
});
