const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY;

// Validate API key at the start (only once)
if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set! Make sure it's added to your environment variables.");
}

const RATE_LIMIT_MS = 3000;
let userRateLimits = {};

exports.handler = async (event) => {
    try {
        const { message, chatHistory, userId } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        const currentTime = Date.now();
        // Proper rate limit check
        if (userRateLimits[userId] && currentTime - userRateLimits[userId] < RATE_LIMIT_MS) {
            return {
                statusCode: 429,
                body: JSON.stringify({ response: 'Please wait before sending another message.' })
            };
        }
        userRateLimits[userId] = currentTime; // Update last request time

        // API Request
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        console.log("🔍 Making request to Gemini API...");

        const response = await axios.post(
            `${API_URL}?key=${API_KEY}`,
            {
                contents: [{ parts: [{ text: chatHistory ? chatHistory + '\n' + message : message }] }],
            }
        );

        console.log("✅ Full API Response:", JSON.stringify(response.data, null, 2));

        // Check for API errors
        if (response.data?.error) {
            console.error("❌ API Error:", response.data.error);
            return {
                statusCode: 500,
                body: JSON.stringify({ response: "Error from API: " + response.data.error.message })
            };
        }

        // **Handle Missing Candidates Properly**
        const candidates = response.data?.candidates ?? [];
        if (candidates.length === 0) {
            console.warn("⚠️ No candidates found in API response.");
            return {
                statusCode: 200,
                body: JSON.stringify({ response: "I'm not sure how to respond to that. Can you try rephrasing?" })
            };
        }

        // **Handle Missing Content or Parts**
        const aiResponse = candidates[0]?.content?.parts?.[0]?.text || "No valid response found.";

        return {
            statusCode: 200,
            body: JSON.stringify({ response: aiResponse })
        };

    } catch (error) {
        console.error("❌ Server Error:", error.message);
        return {
            statusCode: 500,
            body: JSON.stringify({
                response: "I'm having trouble understanding you. Try again later!",
                details: error.message
            })
        };
    }
};
