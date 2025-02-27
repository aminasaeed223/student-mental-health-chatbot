import axios from 'axios';

export const getChatbotResponse = async (userMessage, chatHistory, userId) => {
  try {
    const response = await axios.post('/.netlify/functions/chatbot', {
      message: userMessage,
      chatHistory,
      userId
    });

    return response.data.response;
  } catch (error) {
    console.error('Error fetching chatbot response:', error);
    return "Sorry, I couldn't process that. Please try again later.";
  }
};
