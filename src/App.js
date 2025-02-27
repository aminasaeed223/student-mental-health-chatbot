import React, { useState, useEffect } from 'react';
import { getChatbotResponse } from './api/geminiapi';
import './App.css';

function App() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);

    const RATE_LIMIT_MS = 3000; // 3-second cooldown

    // Generate or get existing user ID for rate limiting
    const userId = localStorage.getItem('userId') || Math.random().toString(36).substring(7);
    localStorage.setItem('userId', userId);

    const handleSend = async () => {
        if (input.trim() === '') return;

        const currentTime = Date.now();
        const lastTime = localStorage.getItem('lastMessageTime') || 0;

        if (currentTime - lastTime < RATE_LIMIT_MS) {
            alert('Please wait a few seconds before sending another message.');
            return;
        }

        localStorage.setItem('lastMessageTime', currentTime); // Store last message timestamp

        const userMessage = { sender: 'You', text: input };
        setMessages([...messages, userMessage]);
        setInput('');
        setIsTyping(true);

        // Ensure chat history includes the latest message before sending
        const chatHistory = [...messages, userMessage]
            .slice(-10) // Only keep last 10 messages for context
            .map(msg => `${msg.sender}: ${msg.text}`)
            .join('\n');

        try {
            const botResponse = await getChatbotResponse(input, chatHistory, userId);
            const botMessage = { sender: 'MentorBot', text: botResponse };
            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            setMessages((prev) => [...prev, { sender: 'MentorBot', text: "I'm having trouble understanding you. Try again later!" }]);
        }

        setIsTyping(false);
    };

    return (
        <div className="chat-container">
            <h1>Student Mental Health Mentor - MentorBot</h1>
            <div className="chat-box">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.sender === 'You' ? 'user' : 'bot'}`}>
                        <strong>{msg.sender}:</strong> {msg.text}
                    </div>
                ))}
                {isTyping && <div className="typing-indicator">MentorBot is typing...</div>}
            </div>

            <div className="input-area">
                <input
                    type="text"
                    placeholder="Feeling stressed? I'm here to help!..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                />
                <button onClick={handleSend}>Ask MentorBot</button>
            </div>
        </div>
    );
}

export default App;
