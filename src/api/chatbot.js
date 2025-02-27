const axios = require('axios');
require('dotenv').config();

const API_KEY = process.env.GEMINI_API_KEY; // Store API key

if (!API_KEY) {
    console.error("❌ ERROR: GEMINI_API_KEY is not set! Make sure it's added to your environment variables.");
}

let lastMessageTime = 0;
const RATE_LIMIT_MS = 3000; // 3-second cooldown
let userRateLimits = {}; // Store per-user cooldowns

exports.handler = async (event) => {
    try {
        const { message, chatHistory, userId } = JSON.parse(event.body);

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        // Ensure API key exists
        if (!API_KEY) {
            return {
                statusCode: 500,
                body: JSON.stringify({ response: "Server error: Missing API key." })
            };
        }

        const currentTime = Date.now();
        if (userRateLimits[userId] && currentTime - userRateLimits[userId] < RATE_LIMIT_MS) {
            return {
                statusCode: 429,
                body: JSON.stringify({ response: 'Please wait before sending another message.' })
            };
        }
        userRateLimits[userId] = currentTime;

        // Make the API request
        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const response = await axios.post(
            `${API_URL}?key=${API_KEY}`, // Use the securely loaded API key
            {
                contents: [{ parts: [{ text: chatHistory ? chatHistory + '\n' + message : message }] }],
            }
        );

        if (!response.data || !response.data.candidates || response.data.candidates.length === 0) {
            return {
                statusCode: 200,
                body: JSON.stringify({ response: "I'm not sure how to respond to that. Can you try rephrasing?" })
            };
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ response: response.data.candidates[0].content.parts[0].text })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ response: "I'm having trouble understanding you. Try again later!", details: error.message })
        };
    }
};
