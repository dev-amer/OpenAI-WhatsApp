const fs = require('fs');
const { Chroma } = require('langchain-vectorstores');
const { OpenAIEmbeddings } = require('langchain-embeddings');
const { CharacterTextSplitter } = require('langchain-text-splitter');
const { PDFExtract } = require('pdf2json');

const config = require('./config');

async function createIndex(filePath) {
  // Read PDF and extract text
  const pdfExtract = new PDFExtract();
  const data = await pdfExtract.extract(filePath, { splitPages: false });
  const text = data.pages.map((page) => page.map((item) => item.text).join('\n')).join('\n');

  // Write text to output.txt file
  fs.writeFileSync(`${config.OUTPUT_DIR}/output.txt`, text);

  // Load documents from the output directory
  const documents = fs
    .readdirSync(config.OUTPUT_DIR)
    .filter((file) => file.endsWith('.txt'))
    .map((file) => fs.readFileSync(`${config.OUTPUT_DIR}/${file}`, 'utf8'));

  // Split documents into smaller chunks
  const textSplitter = new CharacterTextSplitter({
    separator: '\n',
    chunkSize: 1024,
    chunkOverlap: 128,
  });

  const texts = textSplitter.splitDocuments(documents);

  // Initialize OpenAI embeddings
  const embeddings = new OpenAIEmbeddings({
    openai_api_key: config.OPENAI_API_KEY,
  });

  const persistDirectory = config.DB_DIR;

  // Create Chroma vectordb from documents
  const vectordb = Chroma.fromDocuments({
    documents: texts,
    embedding: embeddings,
    persistDirectory: persistDirectory,
  });

  await vectordb.persist();
}

const filePath = '/path/to/your/pdf/file.pdf'; // Replace this with the actual path to the PDF file

createIndex(filePath)
  .then(() => {
    console.log('Indexing completed.');
  })
  .catch((err) => {
    console.error('Error:', err);
  });
