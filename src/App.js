import React, { useState } from 'react';
import { getChatbotResponse } from './api/geminiapi';
import './App.css';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'You', text: input };
    setMessages([...messages, userMessage]);

    const botResponse = await getChatbotResponse(input);
    const botMessage = { sender: 'MentorBot', text: botResponse };
    setMessages((prev) => [...prev, botMessage]);

    setInput('');
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
