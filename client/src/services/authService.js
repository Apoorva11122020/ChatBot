import api from './api'

export const authService = {
  async login(credentials) {
    const response = await api.post('/auth/login', credentials)
    // Backend shape: { success, message, data: { user, token } }
    return response.data?.data || response.data
  },

  async signup(userData) {
    const response = await api.post('/auth/signup', userData)
    return response.data?.data || response.data
  },

  async getProfile() {
    const response = await api.get('/auth/profile')
    return response.data?.data || response.data
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData)
    return response.data?.data || response.data
  }
}
