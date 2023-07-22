require('dotenv').config();
const twilio = require('twilio');

const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
const client = twilio(accountSid, authToken);

async function sendMessage(to, message) {
  try {
    await client.messages.create({
      from: 'whatsapp:+14155238886',
      body: message,
      to: to,
    });
    console.log('Message sent successfully.');
  } catch (error) {
    console.error('Error:', error.message);
  }
}

// Example usage:
const toNumber = 'whatsapp:+919558515995'; // Replace with the recipient's WhatsApp number
const textMessage = 'Hello from Node.js!'; // Replace with the message you want to send
sendMessage(toNumber, textMessage);
