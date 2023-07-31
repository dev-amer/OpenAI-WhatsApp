const {OpenAIEmbeddings} = require('langchain/embeddings/openai')
const {ChatOpenAI} = require('langchain/chat_models/openai')
const {ConversationalRetrievalQAChain} = require('langchain/chains')
const {ChatMessageHistory} = require('langchain/memory')


const dotenv = require('dotenv')
dotenv.config();
const config = require('../config')

async function createConversation() {
  // const persistDirectory = config.DB_DIR;

  const embeddings = new OpenAIEmbeddings({
    openai_api_key: process.env.OPENAI_API_KEY,
  });

  const memory = new ChatMessageHistory({
    memory_key: 'chat_history',
    return_messages: false,
  });

  const qa = new ConversationalRetrievalQAChain({
    llm: new ChatOpenAI(),
    chain_type: 'stuff',
    memory: memory,
    get_chat_history: (h) => h,
    verbose: true,
    embedding : embeddings,
  });

  return qa;
}

module.exports = {
  createConversation,
};
