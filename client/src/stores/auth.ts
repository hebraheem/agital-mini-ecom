import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService, type LoginData, type SignupData } from '@/api/auth'

export const useAuthStore = defineStore('auth', () => {
  const token = ref<string | null>(localStorage.getItem('token'))
  const user = ref<{ name: string; email: string; id: string } | null>(
    JSON.parse(localStorage.getItem('user') || 'null'),
  )

  const isAuthenticated = computed(() => {
    // In real applications, you should verify the token's validity and expiration
    // I just check if it exists for simplicity
    return !!token.value && !!user.value
  })

  async function login(data: LoginData) {
    try {
      const response = await authService.login(data)
      if (response.success && response.data) {
        token.value = response.data.accessToken
        localStorage.setItem('token', response.data.accessToken)
        await fetchAuthUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Login error:', error)
      return false
    }
  }

  const fetchAuthUser = async () => {
    try {
      const authUser = await authService.getAuthUser()
      user.value = authUser.data
      localStorage.setItem('user', JSON.stringify(authUser.data))
    } catch (error) {
      console.error('Failed to fetch authenticated user:', error)
      user.value = null
    }
  }

  async function signup(data: SignupData) {
    try {
      const response = await authService.signup(data)
      if (response.success && response.data) {
        token.value = response.data.token.accessToken
        localStorage.setItem('token', response.data.token.accessToken)
        await fetchAuthUser()
        return true
      }
      return false
    } catch (error) {
      console.error('Signup error:', error)
      return false
    }
  }

  function logout() {
    token.value = null
    user.value = null
    authService.logout()
  }

  return {
    token,
    user: user.value,
    isAuthenticated,
    login,
    signup,
    logout,
  }
})
