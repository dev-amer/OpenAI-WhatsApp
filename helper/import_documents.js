const fs = require('fs');
const { Chroma } = require('langchain/vectorstores/chroma');
const { OpenAIEmbeddings } = require('langchain/embeddings/openai');
const { CharacterTextSplitter } = require('langchain/text_splitter');
const { DirectoryLoader, TextLoader } = require('langchain/document_loaders');
const PDFParser = require('pdf-parse')
const config = require('../config');

async function createIndex(filePath) {
  try {
    const data = fs.readFileSync(filePath);

    // Use pdf-parse to extract text content from the PDF
    const pdfText = await PDFParser(data);
    const text = pdfText.text;

    fs.writeFileSync(`${config.OUTPUT_DIR}/output.txt`, text);

    const loader = new DirectoryLoader({
      directory: config.OUTPUT_DIR,
      glob: 'output.txt',
      loaderCls: TextLoader,
    });

    const documents = loader.load();

    const textSplitter = new CharacterTextSplitter({
      separator: '\n',
      chunkSize: 1024,
      chunkOverlap: 128,
    });

    const texts = textSplitter.splitDocuments(documents);

    const embeddings = new OpenAIEmbeddings({
      openai_api_key: config.OPENAI_API_KEY,
    });

    const persistDirectory = config.DB_DIR;

    const vectordb = Chroma.fromDocuments({
      documents: texts,
      embedding: embeddings,
      persistDirectory: persistDirectory,
    });

    await vectordb.persist();
  } catch (error) {
    console.error('Error creating index:', error);
    throw error;
  }
}

module.exports = createIndex;
