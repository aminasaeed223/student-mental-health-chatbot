import axios from 'axios';

export const getChatbotResponse = async (userMessage, chatHistory, userId) => {
  try {
    const response = await axios.post('/.netlify/functions/chatbot', {
      message: userMessage,
      chatHistory,
      userId
    });

    console.log("✅ Chatbot API Response:", response.data);

    if (!response.data || !response.data.response) {
      return "Sorry, I couldn't process that. Can you try again later?";
    }

    return response.data.response;
  } catch (error) {
    console.error('❌ Error fetching chatbot response:', error.message);
    return "Sorry, I couldn't process that. Please try again later.";
  }
};
