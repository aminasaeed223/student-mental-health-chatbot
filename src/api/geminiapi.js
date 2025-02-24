import axios from 'axios';

const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

export const getChatbotResponse = async (userMessage) => {
  try {
    const response = await axios.post(
      `${API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [{ parts: [{ text: userMessage }] }],
      }
    );
    return response.data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    return "Sorry, I couldn't process that. Please try again later.";
  }
};
