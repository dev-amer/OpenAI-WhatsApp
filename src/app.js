const express = require('express');
const api = express()
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


// api.post('/chatbot-docs', upload.single('file'), uploadDocument)

// api.post('/ask-question-doc', askQuestion)

// Combined endpoint for document upload and chat
api.post('/uploadDocument&Chat',upload.single('file'), async (req, res) => {
  try {
    // Call the "uploadDocument" function to handle document upload
    const sender_id = req.body.From
    const {MediaUrl0, Body} = req.body;
    if (MediaUrl0) {
      const uploadResponse = await uploadDocument(req, res);
      return true
    }

    // Call the "askQuestion" function to handle the question-answering
    const question = Body;

    let questionResponse
    console.log("Out Quest", question)
    if (question) {
      console.log(question)
     questionResponse = await askQuestion({ body: { Body: question } }, res); 
    }

    if (questionResponse.status === 1) {
      sendMessage(sender_id, questionResponse.response);
    } else {
      sendMessage(sender_id, 'Sorry, I couldn\'t generate a valid response at the moment.');
    }

    // If both document upload and question-answering were successful, combine the responses
    // const combinedResponse = {
    //   success: true,
    //   message: 'Document uploaded and question answered successfully.',
    //   filePath: uploadResponse.filePath,
    //   data: questionResponse.data,
    // };

    // return res.send(combinedResponse);
  } catch (e) {
    console.log('Error handling combined endpoint:', e);
    return res.send({ success: false, message: 'Something went wrong', e });
  }
});


module.exports = api;