import axios from 'axios';
import { message } from 'antd';
import { getAccessToken } from '../utils/auth';
import { signIn } from './userAPI';  // Change import to match available exports
import { GoogleGenerativeAI } from "@google/generative-ai";
import React, { useState, useEffect } from 'react';
import { Input, Button, Spin } from 'antd';

const API_URL = 'http://localhost:3000/api';
const SYSTEM_PROMPT = `Bạn là chatbot hỗ trợ khách hàng trong việc chọn lựa trang sức tại cửa hàng. Vui lòng tuân thủ các yêu cầu sau:
- Trả lời ngắn gọn, chính xác và lịch sự.
- Gọi người dùng là "quý khách".
- Không sử dụng ngôn ngữ không phù hợp.
- Trả lời bằng tiếng Việt.
- sắp xếp các sản phẩm khi đưa ra cho khách hàng, chỉ cần nói ra tên và giá của sản phẩm.
- liệt kê các sản phẩm sao cho dễ xem và hiểu,đánh dấu số thứ tự mỗi sản phẩm, mỗi lần liệt kê không quá 5 sản phẩm.
- Khi chào, hãy giới thiệu mình là chatbot hỗ trợ chọn trang sức và các dịch vụ của cửa hàng.
- Tập trung vào chủ đề mà khách hàng yêu cầu.
- Bạn chỉ được phép chào khách hàng khi khách hàng đã chủ động chào trước.
- Không giải đáp các câu hỏi không liên quan đến cửa hàng trang sức.
- Nếu không chắc chắn, hãy trả lời "Tôi không chắc chắn về điều này".`;

// Create axios instance
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  maxContentLength: 50 * 1024 * 1024, // 50MB
  maxBodyLength: 50 * 1024 * 1024 // 50MB
});

// Add request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Initialize Gemini with flash model
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export const chatbotApi = {
  sendMessage: async (message) => {
    try {
      // Get real-time product data
      const productsResponse = await axiosInstance.get('/product/get-all');
      const products = productsResponse.data;

      // Process user message with Gemini
      const context = `
        ${SYSTEM_PROMPT}
        Sản phẩm trong cửa hàng:
        ${products.map((p, index) => `
          ${index + 1}. [Mã: ${p.MaSanPham}] ${p.TenSanPham} - ${p.DonGia.toLocaleString('vi-VN')}VND
          Chi tiết: ${p.MoTa || 'Chưa có mô tả'}
          Loại: ${p.category?.TenLoaiSanPham || 'Chưa phân loại'}
          Tồn kho: ${p.SoLuong} chiếc
        `).join('\n')}
        
        Tin nhắn khách hàng: ${message}
      `;

      const result = await model.generateContent(context);
      const botResponse = result.response.text();

      // Save conversation
      const userId = localStorage.getItem('MaTaiKhoan') || 
                    JSON.parse(localStorage.getItem('userData'))?.userId;

      if (userId) {
        await axiosInstance.post('/chatbot/message', {
          MaTaiKhoan: parseInt(userId),
          TinNhan: message,
          RoleTinNhan: 'user'
        });

        await axiosInstance.post('/chatbot/message', {
          MaTaiKhoan: parseInt(userId),
          TinNhan: botResponse,
          RoleTinNhan: 'bot'
        });
      }

      return botResponse;

    } catch (error) {
      console.error("Error in sendMessage:", error);
      throw error;
    }
  },

  getChatHistory: async () => {
    try {
      // Check all possible storage locations
      const userId = localStorage.getItem('MaTaiKhoan') || 
                    (localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).userId : null) ||
                    localStorage.getItem('userId');

      console.log('Getting chat history for userId:', userId);
      
      if (!userId) {
        console.warn('No user ID found for chat history');
        return [];
      }

      const response = await axiosInstance.get(`/chatbot/messages/${userId}`);
      console.log('Chat history response:', response.data);
      return response.data;
    } catch (error) {
      console.error("Error fetching chat history:", error);
      return [];
    }
  },

  clearChatHistory: async () => {
    try {
      const userId = localStorage.getItem('MaTaiKhoan') || 
                    (localStorage.getItem('userData') ? JSON.parse(localStorage.getItem('userData')).userId : null) ||
                    localStorage.getItem('userId');
      
      if (!userId) {
        throw new Error('Không tìm thấy ID người dùng');
      }

      console.log('Attempting to clear chat history for user:', userId);
      
      const response = await axiosInstance.delete(`/chatbot/messages/${userId}`);
      
      console.log('Clear history response:', response);
      
      return response.data.success;
    } catch (error) {
      console.error("Error clearing chat history:", error.response?.data || error);
      throw new Error(error.response?.data?.message || 'Failed to clear chat history');
    }
  }
};

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
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
      console.error('Error loading chat history:', error);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

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
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <div className="message-content">{msg.text}</div>
          </div>
        ))}
      </div>
      
      <div className="chat-input">
        <Input.TextArea
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Nhập tin nhắn..."
          disabled={isLoading}
          onPressEnter={(e) => {
            if (!e.shiftKey) {
              e.preventDefault();
              handleSendMessage();
            }
          }}
        />
        <Button 
          type="primary" 
          onClick={handleSendMessage}
          loading={isLoading}
        >
          Gửi
        </Button>
      </div>
      
      {isLoading && (
        <div className="loading-indicator">
          <Spin />
        </div>
      )}
    </div>
  );
};

export default Chatbot;
