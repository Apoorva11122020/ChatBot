const express = require('express');
const chatController = require('../controllers/chatController');
const { authenticateToken } = require('../middleware/authMiddleware');

const router = express.Router();

// All chat routes require authentication
router.use(authenticateToken);

// Chat management routes
router.post('/', chatController.createChat);
router.get('/', chatController.getChatHistory);
router.get('/stats', chatController.getChatStats);
router.get('/:chatId', chatController.getChatById);
router.delete('/:chatId', chatController.deleteChat);

// Message routes
router.post('/:chatId/messages', chatController.sendMessage);

module.exports = router;
