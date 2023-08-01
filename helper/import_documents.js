const fs = require("fs");
const path = require('path');
const axios = require('axios');
const { DirectoryLoader } = require("langchain/document_loaders/fs/directory");
const { TextLoader } = require("langchain/document_loaders/fs/text");
const { PDFLoader } = require("langchain/document_loaders/fs/pdf");
const { OpenAI } = require("langchain/llms/openai");
const { RetrievalQAChain } = require("langchain/chains");
const { SelfQueryRetriever } = require("langchain/retrievers/self_query");
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai");
const { RecursiveCharacterTextSplitter } = require("langchain/text_splitter");
const { normalizeDocuments, fileTypes } = require('../helper/normalize_uploaded_docs');
const {sendMessage} = require('./twilio_api')

const DOWNLOAD_DIR = "./documents";
const VECTOR_STORE_PATH = './documents.index/args.json'; // Update the path for the vector store

const downloadFile = async (url, filename) => {
  try {
    const response = await axios.get(url, { responseType: 'arraybuffer' });
    const filePath = path.join(DOWNLOAD_DIR, filename);
    fs.writeFileSync(filePath, response.data);
    console.log('File downloaded and saved successfully.');
    return filePath;
  } catch (error) {
    console.error('Error downloading file:', error);
    return null;
  }
};

// API endpoint for document upload
const uploadDocument =  async (req, res) => {
  try {
    console.log('Request Body', req.body);

    // Get the MediaUrl0 from the request body
    const { MediaUrl0, Body } = req.body;

    // Extract the original filename from the file URL
    const originalFilename = path.basename(Body);

    // Generate the timestamp in milliseconds
    const timestamp = Date.now();

    // Combine the timestamp and the original filename to create the desired filename
    const filename = `${timestamp}-${originalFilename}`;

    // Download the file using the provided URL and save it with the desired filename
    const filePath = await downloadFile(MediaUrl0, filename);

    if (!filePath) {
      return res.send({ success: false, message: 'Error downloading file.' });
    }
  } catch (e) {
    console.log('Error handling combined endpoint:', e);
    return res.send({ success: false, message: 'Something went wrong', e });
  }
};

// API endpoint for asking questions related to the uploaded documents
const askQuestion = async (req, res) => {
  try {
    console.log('Request Body', req.body);

    // Get the question from the 'Body' field
    const question = req.body.Body;

    if (!question) {
      return res.send({ success: false, message: 'Please Provide Question Against These File.' })
    }

    // Load the documents from the "documents" directory
    const loader = new DirectoryLoader(DOWNLOAD_DIR, {
      ".pdf": (path) => new PDFLoader(path),
      ".txt": (path) => new TextLoader(path),
    });

    console.log("Loading docs...");
    const docs = await loader.load();
    console.log("Docs loaded.");

     // Initialize the OpenAI model
     const model = new OpenAI({
      modelName: "gpt-3.5-turbo",
      max_tokens: 150000,
      top_p: 1,
      temperature: 0.5,
      frequency_penalty: 0.2,
      presence_penalty: 0,
      n: 1,
      stream: false,
      openAIApiKey: process.env.OPENAI_API_KEY
    });


    let vectorStore;

    if (fs.existsSync(VECTOR_STORE_PATH)) {
      // Load the vector store if it already exists
      // const vectorStoreData = fs.readFileSync(VECTOR_STORE_PATH, 'utf-8');
      vectorStore = await HNSWLib.load(
        VECTOR_STORE_PATH, 
        new OpenAIEmbeddings()
        );
    } else {
      // If the vector store does not exist, create a new vector store and save it to disk
      fs.mkdirSync(path.dirname(VECTOR_STORE_PATH), { recursive: true });

      const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 100000,
      });
      const normalizedDocs = normalizeDocuments(docs);
      const splitDocs = await textSplitter.createDocuments(normalizedDocs);

      vectorStore = await HNSWLib.fromDocuments(
        splitDocs,
        new OpenAIEmbeddings(),
      );

      await vectorStore.save(VECTOR_STORE_PATH);
    }

   
    // Create the chain for question-answering
    const chain = RetrievalQAChain.fromLLM(model, vectorStore.asRetriever());

    // Ask the question and retrieve the answer
    const langChainRes = await chain.call({ query: question });

    // Prepare the response with the question and answer
    let quesAndAns = { answer: langChainRes?.text };

    console.log('quesAndAns,', quesAndAns.answer);
    return { status: 1 , response: quesAndAns.answer };
    

  } catch (e) {
    console.log('Error asking question:', e);
    return res.send({ success: false, message: 'Something went wrong', e });
  }
};



module.exports = {
  uploadDocument,
  askQuestion
};  
