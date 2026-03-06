import apiClient from './axios'

export interface User {
  id: string
  name: string
  email: string
  birthdate?: string | null
  createdAt: string
  updatedAt: string
}

export interface UserQuery {
  search?: string
  page?: number
  limit?: number
}

export const userService = {
  async getUsers(query?: UserQuery) {
    const response = await apiClient.get('/users', { params: query })
    return response.data
  },

  async getCurrentUser() {
    const response = await apiClient.get('/users/me')
    return response.data
  },

  async getUser(id: string) {
    const response = await apiClient.get(`/users/${id}`)
    return response.data
  },

  async updateUser(data: Partial<User>) {
    const response = await apiClient.patch('/users', data)
    return response.data
  },

  async deleteUser() {
    const response = await apiClient.delete('/users')
    return response.data
  },

  async updatePassword(newPassword: string) {
    const response = await apiClient.patch('/users/password', { newPassword })
    return response.data
  },
}
