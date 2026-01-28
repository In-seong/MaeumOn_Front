import { defineStore } from 'pinia'
import { ref } from 'vue'
import { authApi } from '@shared/services/insuranceApi'
import type { User } from '@shared/types'

export const useAuthStore = defineStore('userAuth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('userToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = ref(localStorage.getItem('userIsLoggedIn') === 'true')

  async function login(email: string, password: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(email, password)
      if (response.data.success) {
        user.value = response.data.data.user
        token.value = response.data.data.token
        isLoggedIn.value = true
        localStorage.setItem('userToken', response.data.data.token)
        localStorage.setItem('userIsLoggedIn', 'true')
        return true
      }
      error.value = '로그인에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || '로그인에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.register(data)
      if (response.data.success) {
        user.value = response.data.data.user
        token.value = response.data.data.token
        isLoggedIn.value = true
        localStorage.setItem('userToken', response.data.data.token)
        localStorage.setItem('userIsLoggedIn', 'true')
        return true
      }
      error.value = '회원가입에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || '회원가입에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout(): Promise<void> {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    } finally {
      user.value = null
      token.value = null
      isLoggedIn.value = false
      localStorage.removeItem('userToken')
      localStorage.removeItem('userIsLoggedIn')
    }
  }

  async function fetchUser(): Promise<void> {
    if (!isLoggedIn.value) return

    loading.value = true
    try {
      const response = await authApi.me()
      if (response.data.success) {
        user.value = response.data.data
      }
    } catch {
      // Token might be invalid
      await logout()
    } finally {
      loading.value = false
    }
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    login,
    register,
    logout,
    fetchUser,
  }
})
