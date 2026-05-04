const express = require('express');
const twilio = require('twilio');

const ACCOUNT_SID = process.env.TWILIO_ACCOUNT_SID;
const AUTH_TOKEN  = process.env.TWILIO_AUTH_TOKEN;
const FROM_NUMBER = process.env.TWILIO_FROM_NUMBER;
const TO_NUMBER   = process.env.TWILIO_TO_NUMBER;

const client = twilio(ACCOUNT_SID, AUTH_TOKEN);
const app = express();
app.use(express.json());

app.post('/webhook', async (req, res) => {
  const { ticker, signal, price } = req.body;

  if (!ticker || !signal || !price) {
    return res.status(400).json({ error: 'Missing required fields: ticker, signal, price' });
  }

  const message = `Alert. ${ticker} ${signal} signal detected. Price ${price}. Check your chart immediately.`;

  const twiml = `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">${message}</Say>
</Response>`;

  try {
    const call = await client.calls.create({
      twiml,
      from: FROM_NUMBER,
      to: TO_NUMBER,
    });

    console.log(`Call initiated: ${call.sid}`);
    res.json({ success: true, callSid: call.sid });
  } catch (err) {
    console.error('Twilio error:', err.message);
    res.status(500).json({ error: 'Failed to initiate call', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
