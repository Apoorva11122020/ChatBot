const chatService = require('../services/chatService');

class ChatController {
    async createChat(req, res, next) {
        try {
            const userId = req.user._id;
            const { title } = req.body;

            const result = await chatService.createChat(userId, title);

            res.status(201).json({
                success: true,
                message: 'Chat created successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getChatHistory(req, res, next) {
        try {
            const userId = req.user._id;
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;

            // Validate pagination parameters
            if (page < 1 || limit < 1 || limit > 50) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid pagination parameters'
                });
            }

            const result = await chatService.getChatHistory(userId, page, limit);

            res.status(200).json({
                success: true,
                message: 'Chat history retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getChatById(req, res, next) {
        try {
            const { chatId } = req.params;
            const userId = req.user._id;

            // Validate chatId
            if (!chatId || chatId.length !== 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid chat ID'
                });
            }

            const result = await chatService.getChatById(chatId, userId);

            res.status(200).json({
                success: true,
                message: 'Chat retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async sendMessage(req, res, next) {
        try {
            const { chatId } = req.params;
            const { message } = req.body;
            const userId = req.user._id;

            // Validate required fields
            if (!message || message.trim().length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Message content is required'
                });
            }

            if (message.length > 1000) {
                return res.status(400).json({
                    success: false,
                    message: 'Message too long (max 1000 characters)'
                });
            }

            // Validate chatId
            if (!chatId || chatId.length !== 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid chat ID'
                });
            }

            const result = await chatService.sendMessage(chatId, userId, message.trim());

            res.status(200).json({
                success: true,
                message: 'Message sent successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async deleteChat(req, res, next) {
        try {
            const { chatId } = req.params;
            const userId = req.user._id;

            // Validate chatId
            if (!chatId || chatId.length !== 24) {
                return res.status(400).json({
                    success: false,
                    message: 'Invalid chat ID'
                });
            }

            const result = await chatService.deleteChat(chatId, userId);

            res.status(200).json({
                success: true,
                message: 'Chat deleted successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }

    async getChatStats(req, res, next) {
        try {
            const userId = req.user._id;

            const result = await chatService.getChatStats(userId);

            res.status(200).json({
                success: true,
                message: 'Chat statistics retrieved successfully',
                data: result
            });
        } catch (error) {
            next(error);
        }
    }
}

module.exports = new ChatController();
