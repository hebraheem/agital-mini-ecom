import apiClient from './axios'

export interface LoginData {
  email: string
  password: string
}

export interface SignupData {
  name: string
  email: string
  password: string
  birthdate?: string
}

export const authService = {
  async login(data: LoginData) {
    const response = await apiClient.post('/auth/login', data)
    return response.data
  },

  async signup(data: SignupData) {
    const response = await apiClient.post('/auth/signup', data)
    return response.data
  },

  async getAuthUser() {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  logout() {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
  },
}
