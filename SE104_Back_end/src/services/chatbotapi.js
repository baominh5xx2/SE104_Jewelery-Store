const ChatBot = require('../models/chatbotapi');

const chatbotService = {
    saveMessage: async (userId, message, role) => {
        try {
            if (!userId || !message || !role) {
                throw new Error('Missing required parameters');
            }

            const savedMessage = await ChatBot.create({
                MaTaiKhoan: userId,
                RoleTinNhan: role,
                TinNhan: message
            });

            if (!savedMessage) {
                throw new Error('Failed to save message');
            }

            return savedMessage;
        } catch (error) {
            console.error('Error in chat service:', error);
            throw new Error(`Failed to save message: ${error.message}`);
        }
    },

    getChatHistory: async (userId) => {
        try {
            if (!userId) {
                throw new Error('User ID is required');
            }

            return await ChatBot.findAll({
                where: { MaTaiKhoan: userId },
                order: [['MaTinNhan', 'ASC']],
                attributes: ['MaTinNhan', 'RoleTinNhan', 'TinNhan']
            });
        } catch (error) {
            console.error('Error getting chat history:', error);
            throw new Error(`Failed to get chat history: ${error.message}`);
        }
    },

    deleteAll: async (userId) => {  // Changed from clearChatHistory to deleteAll
        try {
            if (!userId || isNaN(userId)) {
                throw new Error('Invalid User ID');
            }

            console.log('Attempting to delete chat history for user:', userId);
            
            const result = await ChatBot.destroy({
                where: { MaTaiKhoan: parseInt(userId) }
            });

            console.log('Delete result:', result);
            return result;
        } catch (error) {
            console.error('Error in deleteAll service:', error);
            throw error;
        }
    }
};

module.exports = chatbotService;
