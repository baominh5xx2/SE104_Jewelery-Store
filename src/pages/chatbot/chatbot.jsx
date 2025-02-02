import React, { useState, useEffect } from 'react';
import { Input, Button, Spin, message } from 'antd';
import { DeleteOutlined } from '@ant-design/icons';
import './chatbot.css';
import { chatbotApi } from '../../services/geminiService';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Chỉ load chat history, không kiểm tra đăng nhập
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await chatbotApi.getChatHistory();
      if (history && Array.isArray(history)) {
        const formattedMessages = history.map(msg => ({
          text: msg.TinNhan,
          sender: msg.RoleTinNhan
        }));
        setMessages(formattedMessages);
      }
    } catch (error) {
      // Bỏ qua lỗi khi load history thất bại
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (inputMessage.trim()) {
      const userMessage = {
        text: inputMessage,
        sender: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setIsLoading(true);

      try {
        const response = await chatbotApi.sendMessage(inputMessage);
        const botMessage = {
          text: response,
          sender: 'bot'
        };
        setMessages(prev => [...prev, botMessage]);
      } catch (error) {
        message.error('Không thể nhận được phản hồi. Vui lòng thử lại.');
        const errorMessage = {
          text: 'Đã xảy ra lỗi. Vui lòng thử lại sau.',
          sender: 'bot'
        };
        setMessages(prev => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Bạn có chắc chắn muốn xóa toàn bộ lịch sử chat?')) {
      try {
        setIsLoading(true);
        await chatbotApi.clearChatHistory();
        setMessages([]);
        message.success('Lịch sử chat đã được xóa thành công');
      } catch (error) {
        console.error('Error clearing chat history:', error);
        message.error(error.message || 'Không thể xóa lịch sử chat. Vui lòng thử lại sau.');
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h2>Store Assistant</h2>
        <Button
          type="primary"
          danger
          icon={<DeleteOutlined />}
          onClick={handleClearHistory}
          disabled={isLoading || messages.length === 0}
        >
          Xóa lịch sử
        </Button>
      </div>
      
      <div className="messages-container">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <div className="message-bubble">
              {message.text}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="message bot">
            <div className="message-bubble loading">
              <Spin size="small" />
            </div>
          </div>
        )}
      </div>

      <div className="input-container">
        <Input
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onPressEnter={handleSendMessage}
          placeholder="Type a message..."
          disabled={isLoading}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage}
          loading={isLoading}
        >
          Send
        </Button>
      </div>
    </div>
  );
};

export default Chatbot;
