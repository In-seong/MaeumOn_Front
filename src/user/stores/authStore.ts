import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { customerAuthApi, authApi } from '@shared/services/insuranceApi'
import type { Account } from '@shared/types'

// 디바이스 UUID 생성/조회 (localStorage에 영구 저장)
function getDeviceUuid(): string {
  const key = 'device_uuid'
  let uuid = localStorage.getItem(key)
  if (!uuid) {
    uuid = crypto.randomUUID()
    localStorage.setItem(key, uuid)
  }
  return uuid
}

export type AuthStep = 'idle' | 'otp_sent' | 'otp_verified' | 'authenticated'
export type PinMode = 'login' | 'setup' | 'register'

export const useAuthStore = defineStore('userAuth', () => {
  // 상태
  const user = ref<Account | null>(null)
  const token = ref<string | null>(localStorage.getItem('userToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)
  const isLoggedIn = ref(localStorage.getItem('userIsLoggedIn') === 'true')

  // OTP 인증 흐름 상태
  const authStep = ref<AuthStep>('idle')
  const phone = ref('')
  const isNewUser = ref(false)
  const hasPin = ref(false)
  const customerName = ref<string | null>(null)
  const debugOtp = ref<string | null>(null)

  // 디바이스
  const deviceUuid = getDeviceUuid()
  const deviceToken = ref<string | null>(localStorage.getItem('deviceToken'))

  // PIN 모드 계산
  const pinMode = computed<PinMode>(() => {
    if (isNewUser.value) return 'register'
    if (!hasPin.value) return 'setup'
    return 'login'
  })

  /**
   * 앱 시작 시 디바이스 등록 여부 확인
   * 등록된 기기 → PIN 로그인으로, 미등록 → OTP부터
   */
  async function checkDevice(): Promise<{ registered: boolean; hasPin: boolean; phone?: string }> {
    if (!deviceToken.value) {
      return { registered: false, hasPin: false }
    }

    try {
      const response = await customerAuthApi.checkDevice({
        device_uuid: deviceUuid,
        device_token: deviceToken.value,
      })

      if (response.data.success && response.data.data.registered) {
        phone.value = response.data.data.phone || ''
        hasPin.value = response.data.data.has_pin || false
        customerName.value = response.data.data.customer_name || null
        isNewUser.value = false
        authStep.value = 'otp_verified' // 디바이스 인증됨 → PIN 입력으로
        return {
          registered: true,
          hasPin: hasPin.value,
          phone: phone.value,
        }
      }
    } catch {
      // 디바이스 토큰 무효 → 초기화
      deviceToken.value = null
      localStorage.removeItem('deviceToken')
    }

    return { registered: false, hasPin: false }
  }

  /**
   * Step 1: OTP 발송
   */
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

  /**
   * Step 2: OTP 검증
   */
  async function verifyOtp(otp: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.verifyOtp(phone.value, otp)
      if (response.data.success) {
        const data = response.data.data
        isNewUser.value = data.is_new
        hasPin.value = data.has_pin
        customerName.value = data.customer_name || null
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

  /**
   * Step 3-A: 신규 회원 등록 + PIN 설정
   */
  async function register(name: string, pin: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.register({
        phone: phone.value,
        name,
        pin,
        device_uuid: deviceUuid,
      })

      if (response.data.success) {
        setAuthData(response.data.data.account, response.data.data.token, response.data.data.device_token)
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

  /**
   * Step 3-B: 기존 회원 PIN 설정 (최초)
   */
  async function setPin(pin: string): Promise<boolean> {
    loading.value = true
    error.value = null

    try {
      const response = await customerAuthApi.setPin({
        phone: phone.value,
        pin,
        device_uuid: deviceUuid,
      })

      if (response.data.success) {
        setAuthData(response.data.data.account, response.data.data.token, response.data.data.device_token)
        return true
      }
      error.value = response.data.message || 'PIN 설정에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || 'PIN 설정에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * Step 4: PIN 로그인 (등록된 기기)
   */
  async function loginWithPin(pin: string): Promise<boolean> {
    loading.value = true
    error.value = null

    if (!deviceToken.value) {
      error.value = '기기 인증 정보가 없습니다. 휴대폰 인증을 다시 진행해주세요.'
      loading.value = false
      return false
    }

    try {
      const response = await customerAuthApi.loginWithPin({
        phone: phone.value,
        pin,
        device_uuid: deviceUuid,
        device_token: deviceToken.value,
      })

      if (response.data.success) {
        user.value = response.data.data.account
        token.value = response.data.data.token
        isLoggedIn.value = true
        authStep.value = 'authenticated'
        localStorage.setItem('userToken', response.data.data.token)
        localStorage.setItem('userIsLoggedIn', 'true')
        return true
      }
      error.value = response.data.message || 'PIN이 올바르지 않습니다.'
      return false
    } catch (e: any) {
      // 기기 미등록 → OTP 재인증 필요
      if (e.response?.data?.require_otp) {
        deviceToken.value = null
        localStorage.removeItem('deviceToken')
        authStep.value = 'idle'
      }
      error.value = e.response?.data?.message || 'PIN이 올바르지 않습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  /**
   * 로그아웃
   */
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
      // deviceToken은 유지 (기기에 남김)
    }
  }

  /**
   * 현재 사용자 정보 조회
   */
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

  /**
   * 인증 상태 초기화 (OTP부터 다시)
   */
  function resetAuth(): void {
    authStep.value = 'idle'
    phone.value = ''
    isNewUser.value = false
    hasPin.value = false
    customerName.value = null
    debugOtp.value = null
    error.value = null
  }

  // 내부 헬퍼
  function setAuthData(account: Account, authToken: string, newDeviceToken?: string): void {
    user.value = account
    token.value = authToken
    isLoggedIn.value = true
    authStep.value = 'authenticated'
    localStorage.setItem('userToken', authToken)
    localStorage.setItem('userIsLoggedIn', 'true')

    if (newDeviceToken) {
      deviceToken.value = newDeviceToken
      localStorage.setItem('deviceToken', newDeviceToken)
    }
  }

  return {
    // State
    user,
    token,
    loading,
    error,
    isLoggedIn,
    authStep,
    phone,
    isNewUser,
    hasPin,
    customerName,
    pinMode,
    debugOtp,
    // Actions
    checkDevice,
    sendOtp,
    verifyOtp,
    register,
    setPin,
    loginWithPin,
    logout,
    fetchUser,
    resetAuth,
  }
})
