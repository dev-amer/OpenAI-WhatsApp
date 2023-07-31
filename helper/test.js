
const { HNSWLib } = require("langchain/vectorstores/hnswlib");
const { OpenAIEmbeddings } = require("langchain/embeddings/openai") ;

const vectorStore = HNSWLib.fromTexts(
  ["Hello world", "Bye bye", "hello nice world"],
  [{ id: 2 }, { id: 1 }, { id: 3 }],
  process.env.OPENAI_API_KEY,
  new OpenAIEmbeddings(),
  true
);

const resultOne =  vectorStore.similaritySearch("hello world", 1);
console.log(resultOne);