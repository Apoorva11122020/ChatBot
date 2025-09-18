import React, { useState, useEffect } from 'react'
import { Bot, User, Copy, Check } from 'lucide-react'

const ChatMessages = ({ messages, isTyping, messagesEndRef }) => {
    const [copiedMessageId, setCopiedMessageId] = useState(null)

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const copyToClipboard = async (text, messageId) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedMessageId(messageId)
            setTimeout(() => setCopiedMessageId(null), 2000)
        } catch (err) {
            console.error('Failed to copy text: ', err)
        }
    }

    const TypingIndicator = () => (
        <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="flex gap-1">
                <div className="typing-indicator"></div>
                <div className="typing-indicator"></div>
                <div className="typing-indicator"></div>
            </div>
            <span>AI is typing...</span>
        </div>
    )

    return (
        <div className="h-full overflow-y-auto p-6 space-y-4">
            {messages.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                        <Bot className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                            Welcome to AI Customer Support
                        </h3>
                        <p className="text-gray-500">
                            How can I help you today?
                        </p>
                    </div>
                </div>
            ) : (
                messages.map((message, index) => {
                    const messageId = `${message.role}-${index}`
                    const isCopied = copiedMessageId === messageId

                    return (
                        <div
                            key={index}
                            className={`flex gap-3 group ${message.role === 'user' ? 'justify-end' : 'justify-start'
                                }`}
                        >
                            {message.role === 'assistant' && (
                                <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4 text-primary-600" />
                                </div>
                            )}

                            <div
                                className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg relative group-hover:shadow-md transition-shadow ${message.role === 'user'
                                    ? 'bg-primary-600 text-white'
                                    : 'bg-white border border-gray-200 text-gray-900'
                                    }`}
                            >
                                <p className="text-sm whitespace-pre-wrap leading-relaxed">
                                    {message.content}
                                </p>
                                <div className="flex items-center justify-between mt-2">
                                    <p
                                        className={`text-xs ${message.role === 'user' ? 'text-primary-100' : 'text-gray-500'
                                            }`}
                                    >
                                        {formatTime(message.timestamp)}
                                    </p>
                                    <button
                                        onClick={() => copyToClipboard(message.content, messageId)}
                                        className={`opacity-0 group-hover:opacity-100 transition-opacity p-1 rounded ${message.role === 'user'
                                            ? 'hover:bg-primary-500'
                                            : 'hover:bg-gray-100'
                                            }`}
                                        title="Copy message"
                                    >
                                        {isCopied ? (
                                            <Check className="w-3 h-3 text-green-500" />
                                        ) : (
                                            <Copy className="w-3 h-3" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            {message.role === 'user' && (
                                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <User className="w-4 h-4 text-gray-600" />
                                </div>
                            )}
                        </div>
                    )
                })
            )}

            {isTyping && (
                <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="w-4 h-4 text-primary-600" />
                    </div>
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                        <TypingIndicator />
                    </div>
                </div>
            )}

            <div ref={messagesEndRef} />
        </div>
    )
}

export default ChatMessages
