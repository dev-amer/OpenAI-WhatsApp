const api = require('./src/app');
// const createIndex = require('./helper/import_documents');
const server = require('http').createServer(api);
const fs = require('fs')

const io = require('socket.io')(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('a user connected', socket.id);
  socket.on('disconnect', () => {
    console.log('user disconnected');
  });
});


const port = 5000;

// Start the server
api.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  var documentsFolder = 'documents';
  if (!fs.existsSync(documentsFolder)) {
    fs.mkdirSync(documentsFolder);
  }
});

// // Call createIndex function with the desired file path
// const filePath = 'data/input/sample.pdf'; // Update the file path as needed
// createIndex(filePath).catch((error) => {
//   console.error('Error creating index:', error);
// });
