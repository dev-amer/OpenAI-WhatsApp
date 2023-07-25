const twilio = require('twilio')
const dotenv = require('dotenv')
dotenv.config();


const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_TOKEN;
// const twilioPhoneNumber = process.env.TWILIO_TOKEN;

const client = twilio(accountSid, authToken);

async function sendMessage(to, message) {
  try {
    if (!message || typeof message !== 'string' || message.trim() === '') {
      console.error('Error: Message is empty or invalid.');
      return;
    }

    await client.messages.create({
      from: '', //use your twilio number
      body: message,
      to: `whatsapp:${to}`,
    }).then(message => console.log(message));
  } catch (error) {
    console.error('Error:', error.message);
  }
}


// Example usage:
const to = ''; //Use your whatsapp number 
const message = 'Hello from Node.js!'; 
sendMessage(to, message);

module.exports = {
  sendMessage,
};