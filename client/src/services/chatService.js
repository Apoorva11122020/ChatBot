import api from './api'

export const chatService = {
  async createChat(title = 'New Chat') {
    const response = await api.post('/chat', { title })
    return response.data
  },

  async getChatHistory(page = 1, limit = 10) {
    const response = await api.get(`/chat?page=${page}&limit=${limit}`)
    return response.data
  },

  async getChatById(chatId) {
    const response = await api.get(`/chat/${chatId}`)
    return response.data
  },

  async sendMessage(chatId, message) {
    const response = await api.post(`/chat/${chatId}/messages`, { message })
    return response.data
  },

  async deleteChat(chatId) {
    const response = await api.delete(`/chat/${chatId}`)
    return response.data
  },

  async getChatStats() {
    const response = await api.get('/chat/stats')
    return response.data
  }
}
