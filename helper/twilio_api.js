const twilio = require('twilio')
const {MessagingResponse} = require('twilio').twiml
const dotenv = require('dotenv')
dotenv.config();


const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;


const client = twilio(accountSid, authToken);

async function sendMessage(to, message) {
  try {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('Error: Message is empty or invalid.');
      return;
    }

    await client.messages.create({
      from: 'whatsapp:+14155238886', //use your twilio number
      body: message,
      to: `whatsapp:+923052820411`,
    }).then(message => console.log(message));
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// Example usage:
const to = '+923052820411'; //Use your whatsapp number 
const message = 'Hello from Neptunes!'; 
sendMessage(to, message);

module.exports = {
  sendMessage,
};