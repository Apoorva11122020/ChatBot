const axios = require('axios');

class AIService {
    constructor() {
        this.openRouterApiKey = process.env.OPENROUTER_API_KEY;
        this.openRouterBaseUrl = 'https://openrouter.ai/api/v1';
        this.model = process.env.AI_MODEL || 'meta-llama/llama-3.1-8b-instruct:free';
    }

    async generateResponse(messages, userId) {
        try {
            if (!this.openRouterApiKey) {
                throw new Error('OpenRouter API key not configured');
            }

            // Prepare messages for the AI model
            const formattedMessages = messages.map(msg => ({
                role: msg.role,
                content: msg.content
            }));

            // Add system message for customer support context
            const systemMessage = {
                role: 'system',
                content: `You are a helpful AI customer support assistant. You should:
        - Be friendly, professional, and helpful
        - Provide accurate and concise responses
        - Ask clarifying questions when needed
        - Escalate complex issues to human support when appropriate
        - Keep responses under 200 words unless detailed explanation is needed
        
        Current user ID: ${userId}`
            };

            const requestMessages = [systemMessage, ...formattedMessages];

            const response = await axios.post(
                `${this.openRouterBaseUrl}/chat/completions`,
                {
                    model: this.model,
                    messages: requestMessages,
                    max_tokens: 500,
                    temperature: 0.7,
                    stream: false
                },
                {
                    headers: {
                        'Authorization': `Bearer ${this.openRouterApiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': process.env.CLIENT_URL || 'http://localhost:3000',
                        'X-Title': 'AI Customer Support'
                    },
                    timeout: 30000 // 30 seconds timeout
                }
            );

            if (response.data && response.data.choices && response.data.choices[0]) {
                return {
                    success: true,
                    content: response.data.choices[0].message.content.trim(),
                    usage: response.data.usage
                };
            } else {
                throw new Error('Invalid response format from AI service');
            }
        } catch (error) {
            console.error('AI Service Error:', error.message);

            // Fallback response if AI service fails
            const fallbackResponses = [
                "I apologize, but I'm experiencing technical difficulties. Please try again in a moment.",
                "I'm having trouble processing your request right now. Could you please rephrase your question?",
                "I'm temporarily unavailable. Please try again later or contact our support team directly."
            ];

            const randomFallback = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

            return {
                success: false,
                content: randomFallback,
                error: error.message
            };
        }
    }

    // Alternative method using Hugging Face API
    async generateResponseHuggingFace(messages, userId) {
        try {
            const huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY;
            const huggingFaceModel = process.env.HUGGINGFACE_MODEL || 'microsoft/DialoGPT-medium';

            if (!huggingFaceApiKey) {
                throw new Error('Hugging Face API key not configured');
            }

            // Get the last user message
            const lastUserMessage = messages.filter(msg => msg.role === 'user').pop();
            if (!lastUserMessage) {
                throw new Error('No user message found');
            }

            const response = await axios.post(
                `https://api-inference.huggingface.co/models/${huggingFaceModel}`,
                {
                    inputs: lastUserMessage.content,
                    parameters: {
                        max_length: 200,
                        temperature: 0.7,
                        do_sample: true
                    }
                },
                {
                    headers: {
                        'Authorization': `Bearer ${huggingFaceApiKey}`,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            if (response.data && response.data[0] && response.data[0].generated_text) {
                return {
                    success: true,
                    content: response.data[0].generated_text.trim(),
                    usage: { model: huggingFaceModel }
                };
            } else {
                throw new Error('Invalid response format from Hugging Face');
            }
        } catch (error) {
            console.error('Hugging Face AI Service Error:', error.message);
            return {
                success: false,
                content: "I'm having trouble processing your request. Please try again.",
                error: error.message
            };
        }
    }
}

module.exports = new AIService();
