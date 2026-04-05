// utils/ai.js
import axios from 'axios';

const OPENAI_API_KEY = 'your_openai_api_key_here';

export const getAIResponse = async (userInput) => {
  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4', // or 'gpt-3.5-turbo' if preferred
        messages: [{ role: 'user', content: userInput }],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API error:', error);
    return 'Sorry, I encountered an issue. Please try again.';
  }
};
