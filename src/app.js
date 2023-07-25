const express = require('express');
const bodyParser = require('body-parser');
const { chatComplition } = require('../helper/openai_api');
const { sendMessage } = require('../helper/twilio_api');

const api = express();
api.use(bodyParser.json({ extended: true }));

// Basic entrypoint. Useful to test the connection to the API;
api.get('/', (req, res) => {
  res.json({
    status: 'OK',
    wehook_url_example: 'BASEURL/twilio/',
    message: 'Zenko AI webhooks are ready for work',
  });
});

// Main Twilio endpoint. Used by WhatsApp to create a communication line with GPT
api.post('/twilio', async (req, res) => {
  try {
    console.log('Request Body', req.body)
    // Extract incoming parameters from Twilio
    const message = req.body.Body
    const sender_id = req.body.From

    // Get response from OpenAI API
    const result = await chatComplition(message);

    if (result.status === 1) {
      // Send the response back to the user
      sendMessage(sender_id, result.response);
    } else {
      // If there is an error or no valid response, send a default message
      sendMessage(sender_id, 'Sorry, I couldn\'t generate a valid response at the moment.');
    }
  } catch (error) {
    // Handle errors
    console.error('Error processing request:', error);
  }

  res.sendStatus(200);
});

module.exports = api;
