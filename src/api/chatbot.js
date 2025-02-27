const axios = require('axios');
require('dotenv').config();

let lastMessageTime = 0;
const RATE_LIMIT_MS = 3000; // 3-second cooldown to avoid hitting rates
let userRateLimits = {}; // Store per-user cooldowns

exports.handler = async (event) => {
    try {
        const { message, chatHistory, userId } = JSON.parse(event.body); // User ID needed

        if (!message) {
            return {
                statusCode: 400,
                body: JSON.stringify({ error: 'Message is required' })
            };
        }

        const currentTime = Date.now();
        if (userRateLimits[userId] && currentTime - userRateLimits[userId] < RATE_LIMIT_MS) {
            return {
                statusCode: 429,
                body: JSON.stringify({ response: 'Please wait before sending another message.' })
            };
        }
        userRateLimits[userId] = currentTime; // Store last message time per user

        const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
        const response = await axios.post(
            `${API_URL}?key=${process.env.GEMINI_API_KEY}`,
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