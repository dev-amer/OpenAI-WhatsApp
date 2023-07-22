const express = require('express');
const bodyParser = require('body-parser');
const { chatComplition } = require('./helper/openai_api');
const { sendMessage } = require('./helper/twilio_api');

const app = express();
const port = 3000; // Change this to the desired port number

app.use(bodyParser.urlencoded({ extended: false }));

// Basic entrypoint. Useful to test the connection to the API
app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    wehook_url_example: 'BASEURL/twilio/',
    message: 'Zenko AI webhooks are ready for work',
  });
});

// Main Twilio endpoint. Used by WhatsApp to create a communication line with GPT
app.post('/twilio', (req, res) => {
  try {
    // Extract incoming parameters from Twilio
    const { Body, From } = req.body;
    const message = Body;
    const senderId = From;

    // Get response from OpenAI
    const result = chatComplition(message);
    if (result.status === 1) {
      sendMessage(senderId, result.response);
    }
  } catch (err) {
    console.error(err);
  }
  res.send('OK');
});

// Additional API methods can be loaded here. As an example...

// app.post('/image', (req, res) => {
//   try {
//     // Extract incoming parameters from GPT Image generator
//     const { Body, From } = req.body;
//     const query = Body;
//     const senderId = From;

//     // Get response from OpenAI
//     const result = image(query);
//     if (result.status === 1) {
//       sendMessage(senderId, result.response);
//     }
//   } catch (err) {
//     console.error(err);
//   }
//   res.send('OK');
// });

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
