const axios = require('axios');

const OPENAI_API_KEY = 'your_openai_api_key'; // Replace with your actual OpenAI API key

async function chatComplition(message) {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/engines/davinci/completions',
      {
        prompt: message,
        max_tokens: 150,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    if (response.status === 200 && response.data && response.data.choices && response.data.choices.length > 0) {
      return {
        status: 1,
        response: response.data.choices[0].text,
      };
    } else {
      return {
        status: 0,
        response: 'Error: Unable to get a valid response from OpenAI API.',
      };
    }
  } catch (error) {
    console.error('Error:', error.message);
    return {
      status: 0,
      response: 'Error: Unable to connect to the OpenAI API.',
    };
  }
}

module.exports = {
  chatComplition,
};
