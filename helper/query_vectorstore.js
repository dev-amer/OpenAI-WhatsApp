const {OpenAIEmbeddings} = require('langchain/embeddings/openai')
const {ChatOpenAI} = require('langchain/chat_models/openai')
const {ConversationalRetrievalQAChain} = require('langchain/chains')
const {ChatMessageHistory} = require('langchain/memory')
const { Chroma } = require('langchain/vectorstores');


const config = require('../config')

function createConversation() {
  const persistDirectory = config.DB_DIR;

  const embeddings = new OpenAIEmbeddings({
    openai_api_key: config.OPENAI_API_KEY,
  });

  const db = new Chroma ({
    persist_directory: persistDirectory,
    embedding_function: embeddings,
  });

  const memory = new ChatMessageHistory({
    memory_key: 'chat_history',
    return_messages: false,
  });

  const qa = ConversationalRetrievalQAChain.from_llm({
    llm: new ChatOpenAI(),
    chain_type: 'stuff',
    retriever: db.as_retriever(),
    memory: memory,
    get_chat_history: (h) => h,
    verbose: true,
  });

  return qa;
}

module.exports = {
  createConversation,
};
