import { defineStore } from 'pinia'
import { ref } from 'vue'
import { customerAuthApi, authApi } from '@shared/services/insuranceApi'
import type { Account } from '@shared/types'

export type AuthStep = 'idle' | 'otp_sent' | 'otp_verified' | 'authenticated'

export const useAuthStore = defineStore('userAuth', () => {
  const user = ref<Account | null>(null)
  const token = ref<string | null>(localStorage.getItem('userToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isLoggedIn = ref(localStorage.getItem('userIsLoggedIn') === 'true')

  const authStep = ref<AuthStep>('idle')
  const phone = ref('')
  const isNewUser = ref(false)
  const debugOtp = ref<string | null>(null)

  async function sendOtp(phoneNumber: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.sendOtp(phoneNumber)
      if (response.data.success) {
        phone.value = phoneNumber
        authStep.value = 'otp_sent'
        debugOtp.value = response.data.data?.debug_otp || null
        return true
      }
      error.value = response.data.message || 'OTP 발송에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || 'OTP 발송에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function verifyOtp(otp: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.verifyOtp(phone.value, otp)
      if (response.data.success) {
        const data = response.data.data

        if (!data.is_new && data.token && data.account) {
          setAuthData(data.account, data.token)
          return true
        }

        isNewUser.value = true
        authStep.value = 'otp_verified'
        return true
      }
      error.value = response.data.message || '인증번호가 올바르지 않습니다.'
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || '인증번호가 올바르지 않습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  async function register(data: {
    name: string
    resident_number: string
    telecom: string
    address: string
  }): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.register({
        phone: phone.value,
        ...data,
      })

      if (response.data.success) {
        setAuthData(response.data.data.account, response.data.data.token)
        return true
      }
      error.value = response.data.message || '회원가입에 실패했습니다.'
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
      authStep.value = 'idle'
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
      await logout()
    } finally {
      loading.value = false
    }
  }

  function resetAuth(): void {
    authStep.value = 'idle'
    phone.value = ''
    isNewUser.value = false
    debugOtp.value = null
    error.value = null
  }

  function setAuthData(account: Account, authToken: string): void {
    user.value = account
    token.value = authToken
    isLoggedIn.value = true
    authStep.value = 'authenticated'
    localStorage.setItem('userToken', authToken)
    localStorage.setItem('userIsLoggedIn', 'true')
  }

  return {
    user,
    token,
    loading,
    error,
    isLoggedIn,
    authStep,
    phone,
    isNewUser,
    debugOtp,
    sendOtp,
    verifyOtp,
    register,
    logout,
    fetchUser,
    resetAuth,
  }
})
