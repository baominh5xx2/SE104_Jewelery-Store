const express = require('express');
const router = express.Router();
const chatbotController = require('../controllers/chatbotapi');

// Make sure routes match with frontend calls
router.post('/message', chatbotController.saveMessage);
router.get('/messages/:MaTaiKhoan', chatbotController.getMessagesByUser);
router.delete('/messages/:MaTaiKhoan', chatbotController.clearHistory); // Confirm this route exists

module.exports = router;
