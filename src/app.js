const express = require('express');
const api = express();
const bodyParser = require('body-parser');
const axios = require('axios')
// const fs = require('fs')
const { sendMessage } = require('../helper/twilio_api');
const { chatComplition } = require('../helper/openai_api');
const {uploadDocument} = require('../helper/import_documents');
const {askQuestion} = require('../helper/import_documents');
const upload  = require('../helper/upload')
const { createConversation } = require('../helper/query_vectorstore');

api.use(bodyParser.json())
api.use(bodyParser.json({ extended: true }));
api.use(bodyParser.urlencoded({ extended: true }))
api.use(bodyParser.json({ limit: '50mb' }))
api.use(bodyParser.urlencoded({
limit: '50mb',
  extended: true,
  parameterLimit: 50000
}))



// Basic entrypoint. Useful to test the connection to the API;
api.get('/', (req, res) => {
  res.json({
    status: 'OKKK',
    wehook_url_example: 'BASEURL/twilio/',
    message: 'Zenko AI webhooks are ready for work',
  });
});

api.post('/twilio', async (req, res) => {
  try {
    console.log('Request Body', req.body)
    const message = req.body.Body
    const sender_id = req.body.From

    // const langChainRes = await qa.then({ query: message });

    const result = await chatComplition(message);

    if (result.status === 1) {
      sendMessage(sender_id, result.response);
    } else {
      sendMessage(sender_id, 'Sorry, I couldn\'t generate a valid response at the moment.');
    }
  } catch (error) {
    console.error('Error processing request:', error);
  }

  // res.sendStatus(200);
});

// Create an endpoint for uploading files.
// api.post('/upload', fileUpload.single('file'), async (req, res) => {
//   try {
//     console.log('Request Body', req.body)

//     const file = req.file.path;

//     // Create a Langchain client using axios.
//     const url = 'https://api.langchain.com/v1/files';
//     const formData = new FormData();
//     formData.append('file', fs.createReadStream(file.path));

//     // Send the file to Langchain.
//     const response = await axios.post(url, formData, {
//       headers: { 'Content-Type': 'multipart/form-data' },
//     });

//     await createIndex(file.path);

//     // The file was uploaded successfully.
//     res.status(200).send(response.data);
//   } catch (error) {
//     console.error('Error uploading file:', error);
//     res.status(500).json({ error: 'An error occurred during file upload.' });
//   }
// });

api.post('/chatbot-docs', upload.single('file'), uploadDocument)

api.post('/ask-question-doc', askQuestion)


module.exports = api;