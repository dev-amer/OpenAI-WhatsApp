const axios = require('axios')
const dotenv = require('dotenv')
dotenv.config();


const openai_api_key = process.env.OPENAI_API_KEY

async function chatComplition( prompt ) {
  try {
    const response = await axios.post(
      'https://free.churchless.tech/v1/chat/completions',
      {
        messages: [{ role: 'user', content: prompt }], 
        max_tokens: 150000,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${openai_api_key}`,
        },
      }
    );

    if (response.status === 200 && response.data && response.data.choices && response.data.choices.length > 0) {

      return {
        status: 1,
        response: response.data.choices[0].message.content,
        
      };
    } 
    else {
      return {
        status: 0,
        response: 'Error: Unable to get a valid response from OpenAI API.',
      };
    }
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Error Response from OpenAI API:', error.response?.data || error.message);
    return {
      status: 0,
      response: 'Error: Unable to connect to the OpenAI API.',
    };
  }
}



// async function main() {
//   const message = 'Hellow Amer'; // Replace this with the message you want to send to the chatComplition function.

//   // Call the chatComplition function to get the response from OpenAI API
//   const response = await chatComplition(message);

//   // Print the response using the print() method
//   print(response.response);
// }

// main();

module.exports = {
  chatComplition,
};
