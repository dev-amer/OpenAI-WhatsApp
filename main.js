const api = require('./src/app');
// const createIndex = require('./helper/import_documents');
const port = 5000;

// Start the server
api.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

// Call createIndex function with the desired file path
// const filePath = 'data/input/sample.pdf'; // Update the file path as needed
// createIndex(filePath).catch((error) => {
//   console.error('Error creating index:', error);
// });
