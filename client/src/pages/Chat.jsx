import React, { useState, useEffect, useRef, useCallback } from 'react'
import { useAuth } from '../context/AuthContext'
import { chatService } from '../services/chatService'
import ChatSidebar from '../components/ChatSidebar'
import ChatMessages from '../components/ChatMessages'
import ChatInput from '../components/ChatInput'
import LoadingSpinner from '../components/LoadingSpinner'
import { MessageSquare, Bot, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const Chat = () => {
    const { user, logout } = useAuth()
    const [chats, setChats] = useState([])
    const [currentChat, setCurrentChat] = useState(null)
    const [messages, setMessages] = useState([])
    const [isLoading, setIsLoading] = useState(false)
    const [isSending, setIsSending] = useState(false)
    const [isTyping, setIsTyping] = useState(false)
    const [error, setError] = useState(null)
    const [retryCount, setRetryCount] = useState(0)
    const messagesEndRef = useRef(null)
    const typingTimeoutRef = useRef(null)

    // Load chat history on component mount
    useEffect(() => {
        loadChatHistory()
    }, [])

    // Scroll to bottom when messages change
    useEffect(() => {
        scrollToBottom()
    }, [messages])

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    const loadChatHistory = useCallback(async () => {
        try {
            setIsLoading(true)
            setError(null)
            const response = await chatService.getChatHistory()
            setChats(response.data.chats)
            setRetryCount(0)

            // If there are chats, load the first one
            if (response.data.chats.length > 0) {
                loadChat(response.data.chats[0]._id)
            }
        } catch (error) {
            console.error('Error loading chat history:', error)
            setError('Failed to load chat history')
            toast.error('Failed to load chat history')
        } finally {
            setIsLoading(false)
        }
    }, [])

    const retryLoadChatHistory = () => {
        setRetryCount(prev => prev + 1)
        loadChatHistory()
    }

    const loadChat = async (chatId) => {
        try {
            const response = await chatService.getChatById(chatId)
            setCurrentChat(response.data.chat)
            setMessages(response.data.chat.messages || [])
        } catch (error) {
            toast.error('Failed to load chat')
            console.error('Error loading chat:', error)
        }
    }

    const createNewChat = async () => {
        try {
            const response = await chatService.createChat()
            const newChat = response.data.chat
            setChats(prev => [newChat, ...prev])
            setCurrentChat(newChat)
            setMessages([])
        } catch (error) {
            toast.error('Failed to create new chat')
            console.error('Error creating chat:', error)
        }
    }

    const sendMessage = async (message) => {
        if (!currentChat) {
            // Create a new chat if none exists
            await createNewChat()
            return
        }

        try {
            setIsSending(true)
            setError(null)

            // Add user message immediately
            const userMessage = {
                role: 'user',
                content: message,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, userMessage])

            // Show typing indicator after a short delay
            typingTimeoutRef.current = setTimeout(() => {
                setIsTyping(true)
            }, 500)

            // Send message to API
            const response = await chatService.sendMessage(currentChat._id, message)

            // Clear typing indicator
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
            setIsTyping(false)

            // Add AI response
            const aiMessage = {
                role: 'assistant',
                content: response.data.aiResponse.content,
                timestamp: new Date()
            }
            setMessages(prev => [...prev, aiMessage])

            // Update chat title if it's the first message
            if (messages.length === 0) {
                const updatedChat = { ...currentChat, title: response.data.chat.title }
                setCurrentChat(updatedChat)
                setChats(prev => prev.map(chat =>
                    chat._id === currentChat._id ? updatedChat : chat
                ))
            }

            // Refresh chat list to show updated chat
            loadChatHistory()

        } catch (error) {
            console.error('Error sending message:', error)
            setError('Failed to send message. Please try again.')
            toast.error('Failed to send message')

            // Remove the user message if sending failed
            setMessages(prev => prev.slice(0, -1))
        } finally {
            setIsSending(false)
            setIsTyping(false)
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current)
            }
        }
    }

    const deleteChat = async (chatId) => {
        try {
            await chatService.deleteChat(chatId)
            setChats(prev => prev.filter(chat => chat._id !== chatId))

            if (currentChat && currentChat._id === chatId) {
                setCurrentChat(null)
                setMessages([])
            }

            toast.success('Chat deleted successfully')
        } catch (error) {
            toast.error('Failed to delete chat')
            console.error('Error deleting chat:', error)
        }
    }

    if (isLoading && chats.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <LoadingSpinner size="xl" className="mb-4" />
                    <p className="text-gray-600">Loading your conversations...</p>
                </div>
            </div>
        )
    }

    if (error && chats.length === 0) {
        return (
            <div className="h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center max-w-md">
                    <div className="mx-auto h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                        <RefreshCw className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        Failed to load conversations
                    </h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <button
                        onClick={retryLoadChatHistory}
                        className="btn btn-primary flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="h-screen flex bg-gray-100">
            {/* Sidebar */}
            <ChatSidebar
                chats={chats}
                currentChat={currentChat}
                onChatSelect={loadChat}
                onNewChat={createNewChat}
                onDeleteChat={deleteChat}
                user={user}
                onLogout={logout}
            />

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col min-h-0">
                {currentChat ? (
                    <>
                        {/* Chat Header */}
                        <div className="bg-white border-b border-gray-200 px-6 py-4">
                            <h1 className="text-lg font-semibold text-gray-900">
                                {currentChat.title}
                            </h1>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <ChatMessages
                                messages={messages}
                                isTyping={isTyping}
                                messagesEndRef={messagesEndRef}
                            />
                        </div>

                        {/* Input */}
                        <ChatInput
                            onSendMessage={sendMessage}
                            disabled={isSending}
                        />
                    </>
                ) : (
                    <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
                        <div className="text-center max-w-md">
                            <div className="mx-auto h-16 w-16 bg-primary-100 rounded-full flex items-center justify-center mb-6">
                                <Bot className="h-8 w-8 text-primary-600" />
                            </div>
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">
                                Welcome to AI Customer Support
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Start a new conversation to get help with your questions. Our AI assistant is here to help!
                            </p>
                            <button
                                onClick={createNewChat}
                                className="btn btn-primary px-8 py-4 rounded-lg text-lg font-medium"
                            >
                                <MessageSquare className="w-5 h-5 mr-2" />
                                Start New Chat
                            </button>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="absolute top-4 right-4 bg-red-50 border border-red-200 rounded-lg p-4 max-w-sm">
                        <div className="flex items-start">
                            <div className="flex-shrink-0">
                                <RefreshCw className="h-5 w-5 text-red-400" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-sm font-medium text-red-800">
                                    Error
                                </h3>
                                <p className="text-sm text-red-700 mt-1">
                                    {error}
                                </p>
                                <button
                                    onClick={() => setError(null)}
                                    className="text-sm text-red-600 hover:text-red-500 mt-2"
                                >
                                    Dismiss
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Chat
