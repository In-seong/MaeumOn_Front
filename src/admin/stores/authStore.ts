import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authApi } from '@shared/services/insuranceApi'
import type { User } from '@shared/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const token = ref<string | null>(localStorage.getItem('adminToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isLoggedIn = computed(() => !!token.value)
  const isAdmin = computed(() => user.value?.role === 'admin')

  async function login(email: string, password: string) {
    loading.value = true
    error.value = null

    try {
      const response = await authApi.login(email, password)
      const { user: userData, token: authToken } = response.data.data

      user.value = userData
      token.value = authToken
      localStorage.setItem('adminToken', authToken)
      localStorage.setItem('adminIsLoggedIn', 'true')

      return true
    } catch (e: any) {
      error.value = e.response?.data?.message || '로그인에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await authApi.logout()
    } catch (e) {
      // 에러 무시
    } finally {
      user.value = null
      token.value = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminIsLoggedIn')
    }
  }

  async function fetchUser() {
    if (!token.value) return

    loading.value = true
    try {
      const response = await authApi.me()
      user.value = response.data.data
    } catch (e) {
      user.value = null
      token.value = null
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminIsLoggedIn')
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
    isAdmin,
    login,
    logout,
    fetchUser,
  }
})
