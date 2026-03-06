import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService, type User, type UserQuery } from '@/api/users'

export const useUserStore = defineStore('user', () => {
  const users = ref<User[]>([])
  const currentUser = ref<User | null>(null)
  const loading = ref(false)
  const error = ref('')
  const totalUsers = ref(0)
  const currentPage = ref(1)
  const totalPages = ref(1)

  // Get all users with pagination
  async function getUsers(query?: UserQuery) {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.getUsers(query)
      if (response.success) {
        users.value = response.data
        if (response.meta) {
          totalUsers.value = response.meta.totalItems || 0
          currentPage.value = response.meta.currentPage || 1
          totalPages.value = response.meta.totalPages || 1
        }
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load users'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get current user
  async function getCurrentUser() {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.getCurrentUser()
      if (response.success) {
        currentUser.value = response.data
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load current user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Get single user
  async function getUser(id: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.getUser(id)
      if (response.success) {
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to load user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update user
  async function updateUser(data: Partial<User>) {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.updateUser(data)
      if (response.success) {
        currentUser.value = response.data
        return response.data
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Delete user
  async function deleteUser() {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.deleteUser()
      if (response.success) {
        currentUser.value = null
      }
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to delete user'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Update password
  async function updatePassword(newPassword: string) {
    loading.value = true
    error.value = ''

    try {
      const response = await userService.updatePassword(newPassword)
      return response.success
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Failed to update password'
      throw err
    } finally {
      loading.value = false
    }
  }

  // Clear error
  function clearError() {
    error.value = ''
  }

  return {
    users,
    currentUser,
    loading,
    error,
    totalUsers,
    currentPage,
    totalPages,
    getUsers,
    getCurrentUser,
    getUser,
    updateUser,
    deleteUser,
    updatePassword,
    clearError,
  }
})
