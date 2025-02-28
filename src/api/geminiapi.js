import axios from 'axios';

// Load environment variables
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
  console.error("❌ ERROR: GEMINI_API_KEY is not set! Make sure it's added to your environment variables.");
}

// Function to fetch Gemini API response
export const getChatbotResponse = async (userMessage, chatHistory) => {
  try {
    const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
    console.log("🔍 Sending request to Gemini API...");

    const response = await axios.post(
        `${API_URL}?key=${API_KEY}`,
        {
          contents: [{ parts: [{ text: chatHistory ? chatHistory + '\n' + userMessage : userMessage }] }],
        }
    );

    console.log("✅ Full API Response:", JSON.stringify(response.data, null, 2));

    // Check if candidates exist
    const candidates = response.data?.candidates ?? [];
    if (candidates.length === 0) {
      console.warn("⚠️ No candidates found in API response.");
      return "I'm not sure how to respond to that. Can you try rephrasing?";
    }

    // Extract the AI-generated response
    return candidates[0]?.content?.parts?.[0]?.text || "No valid response found.";

  } catch (error) {
    console.error("❌ Error fetching Gemini response:", error.message);
    return "I'm having trouble understanding you. Try again later!";
  }
};
