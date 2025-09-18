const Chat = require('../models/Chat');
const aiService = require('./aiService');

class ChatService {
    async createChat(userId, title = 'New Chat') {
        try {
            const chat = new Chat({
                userId,
                title,
                messages: []
            });

            await chat.save();
            return {
                success: true,
                chat: chat.toObject()
            };
        } catch (error) {
            throw new Error(`Failed to create chat: ${error.message}`);
        }
    }

    async getChatHistory(userId, page = 1, limit = 10) {
        try {
            const skip = (page - 1) * limit;

            const chats = await Chat.find({
                userId,
                isActive: true
            })
                .sort({ updatedAt: -1 })
                .skip(skip)
                .limit(limit)
                .select('title messages createdAt updatedAt messageCount');

            const totalChats = await Chat.countDocuments({
                userId,
                isActive: true
            });

            return {
                success: true,
                chats,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalChats / limit),
                    totalChats,
                    hasNext: page < Math.ceil(totalChats / limit),
                    hasPrev: page > 1
                }
            };
        } catch (error) {
            throw new Error(`Failed to get chat history: ${error.message}`);
        }
    }

    async getChatById(chatId, userId) {
        try {
            const chat = await Chat.findOne({
                _id: chatId,
                userId,
                isActive: true
            });

            if (!chat) {
                throw new Error('Chat not found');
            }

            return {
                success: true,
                chat: chat.toObject()
            };
        } catch (error) {
            throw new Error(`Failed to get chat: ${error.message}`);
        }
    }

    async sendMessage(chatId, userId, userMessage) {
        try {
            // Find the chat
            const chat = await Chat.findOne({
                _id: chatId,
                userId,
                isActive: true
            });

            if (!chat) {
                throw new Error('Chat not found');
            }

            // Add user message to chat
            await chat.addMessage('user', userMessage);

            // Get recent messages for context (last 10 messages)
            const recentMessages = chat.getRecentMessages(10);

            // Generate AI response
            const aiResponse = await aiService.generateResponse(recentMessages, userId);

            // Add AI response to chat
            await chat.addMessage('assistant', aiResponse.content);

            // Update chat title if it's the first message
            if (chat.messages.length === 2) { // user + assistant
                const firstMessage = userMessage.substring(0, 50);
                chat.title = firstMessage.length < userMessage.length
                    ? firstMessage + '...'
                    : firstMessage;
                await chat.save();
            }

            return {
                success: true,
                userMessage: {
                    role: 'user',
                    content: userMessage,
                    timestamp: new Date()
                },
                aiResponse: {
                    role: 'assistant',
                    content: aiResponse.content,
                    timestamp: new Date()
                },
                chat: chat.toObject()
            };
        } catch (error) {
            throw new Error(`Failed to send message: ${error.message}`);
        }
    }

    async deleteChat(chatId, userId) {
        try {
            const chat = await Chat.findOneAndUpdate(
                { _id: chatId, userId, isActive: true },
                { isActive: false },
                { new: true }
            );

            if (!chat) {
                throw new Error('Chat not found');
            }

            return {
                success: true,
                message: 'Chat deleted successfully'
            };
        } catch (error) {
            throw new Error(`Failed to delete chat: ${error.message}`);
        }
    }

    async getChatStats(userId) {
        try {
            const totalChats = await Chat.countDocuments({
                userId,
                isActive: true
            });

            const totalMessages = await Chat.aggregate([
                { $match: { userId: userId, isActive: true } },
                { $project: { messageCount: { $size: '$messages' } } },
                { $group: { _id: null, total: { $sum: '$messageCount' } } }
            ]);

            const recentActivity = await Chat.find({
                userId,
                isActive: true
            })
                .sort({ updatedAt: -1 })
                .limit(5)
                .select('title updatedAt messageCount');

            return {
                success: true,
                stats: {
                    totalChats,
                    totalMessages: totalMessages[0]?.total || 0,
                    recentActivity
                }
            };
        } catch (error) {
            throw new Error(`Failed to get chat stats: ${error.message}`);
        }
    }
}

module.exports = new ChatService();
