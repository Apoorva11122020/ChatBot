const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    role: {
        type: String,
        enum: ['user', 'assistant'],
        required: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

const chatSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true
    },
    title: {
        type: String,
        required: true,
        trim: true,
        maxlength: [100, 'Chat title cannot exceed 100 characters']
    },
    messages: [messageSchema],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
chatSchema.index({ userId: 1, createdAt: -1 });

// Virtual for message count
chatSchema.virtual('messageCount').get(function () {
    return this.messages.length;
});

// Method to add a message
chatSchema.methods.addMessage = function (role, content) {
    this.messages.push({
        role,
        content,
        timestamp: new Date()
    });
    return this.save();
};

// Method to get recent messages
chatSchema.methods.getRecentMessages = function (limit = 10) {
    return this.messages
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, limit);
};

module.exports = mongoose.model('Chat', chatSchema);
