import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { credit4uApi, insuranceApi } from '@user/services/credit4uApi'
import type {
  Credit4uAccount,
  InsuranceContract,
  InsuranceStatistic,
  TwoWayType,
  TwoWayConfirmRequest,
  FetchContractsRequest,
  RegisterRequest,
  FindIdRequest,
  ChangePasswordRequest,
  TwoWayResponse,
} from '@shared/types/credit4u'
import { getCodefErrorMessage } from '@shared/types/credit4u'

export const useCredit4uStore = defineStore('credit4u', () => {
  // ============ State ============
  const credit4uAccount = ref<Credit4uAccount | null>(null)
  const registrationStatus = ref<string | null>(null) // '1','2','3' or null
  const contracts = ref<InsuranceContract[]>([])
  const statistics = ref<InsuranceStatistic[]>([])
  const loading = ref(false)
  const twoWayPending = ref(false)
  const twoWayType = ref<TwoWayType | null>(null)
  const twoWayData = ref<TwoWayResponse | null>(null)
  const currentApi = ref<string | null>(null) // contract/register/find-id/change-pwd
  const error = ref<string | null>(null)

  // 아이디 찾기 결과
  const foundLoginId = ref<string | null>(null)

  // ============ Computed ============
  const hasContracts = computed(() => contracts.value.length > 0)
  const hasCredit4uAccount = computed(() => credit4uAccount.value !== null)
  const totalPremium = computed(() => {
    return contracts.value.reduce((sum, c) => sum + (c.premium_amount || 0), 0)
  })
  const lastSyncedAt = computed(() => credit4uAccount.value?.last_synced_at || null)

  // ============ 내부 헬퍼 ============

  /** API 응답에서 2-Way 인증 상태 처리 */
  function handle2WayResponse(response: any): boolean {
    const data = response?.data
    if (!data?.two_way) {
      twoWayPending.value = false
      twoWayType.value = null
      twoWayData.value = null
      return false
    }

    // 2-Way 대기 상태
    twoWayPending.value = true
    twoWayData.value = data

    // extraInfo에서 현재 단계 판별
    const extra = data.extraInfo || {}
    if (extra.reqSecureNo !== undefined || extra.secureNoImage) {
      twoWayType.value = 'captcha'
    } else if (extra.reqSMSAuthNo !== undefined) {
      twoWayType.value = 'sms'
    } else if (extra.commSimpleAuth !== undefined) {
      twoWayType.value = 'pass'
    } else if (extra.reqUserPass1 !== undefined) {
      twoWayType.value = 'temp_password'
    } else if (extra.reqUserId !== undefined) {
      twoWayType.value = 'register_info'
    } else if (extra.reqEmailAuthNo !== undefined) {
      twoWayType.value = 'email'
    } else if (extra.reqUserPass !== undefined) {
      twoWayType.value = 'new_password'
    } else {
      twoWayType.value = 'unknown'
    }

    return true // 2-Way 대기 상태
  }

  /** 에러 코드에서 사용자 메시지 추출 */
  function extractError(e: any): string {
    const codefCode = e.response?.data?.codef_code
    if (codefCode) {
      return getCodefErrorMessage(codefCode, e.response?.data?.message)
    }
    return e.response?.data?.message || '오류가 발생했습니다. 잠시 후 다시 시도해주세요.'
  }

  // ============ Actions ============

  /** DB에서 보험 목록 조회 */
  async function checkContracts(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await insuranceApi.getInsurances()
      if (response.data.success) {
        contracts.value = response.data.data
        return contracts.value.length > 0
      }
      return false
    } catch (e: any) {
      // 404 등 — 데이터 없음
      contracts.value = []
      return false
    } finally {
      loading.value = false
    }
  }

  /** 정보이용 동의 저장 */
  async function agreeConsent(consentTemplateId?: number): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await credit4uApi.consent(
        consentTemplateId ? { consent_template_id: consentTemplateId } : undefined,
      )
      if (response.data.success) {
        credit4uAccount.value = response.data.data
        return true
      }
      error.value = response.data.message || '동의 처리에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = extractError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 가입여부 확인 */
  async function checkRegistration(id: string, password: string, inquiryType: '0' | '4' = '0'): Promise<string | null> {
    loading.value = true
    error.value = null
    currentApi.value = 'check-registration'
    try {
      const response = await credit4uApi.checkRegistration({
        id,
        password,
        inquiryType,
      })

      // 2-Way 체크
      if (handle2WayResponse(response)) {
        return null // 2-Way 대기
      }

      if (response.data.success) {
        const status = response.data.data.registration_status
        registrationStatus.value = status
        credit4uAccount.value = response.data.data.credit4u_account
        return status
      }
      error.value = response.data.message || '가입여부 확인에 실패했습니다.'
      return null
    } catch (e: any) {
      error.value = extractError(e)
      return null
    } finally {
      loading.value = false
      currentApi.value = null
    }
  }

  /** 회원가입 */
  async function register(data: RegisterRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    currentApi.value = 'register'
    try {
      const response = await credit4uApi.register(data)

      // 2-Way 체크
      if (handle2WayResponse(response)) {
        return false // 2-Way 대기
      }

      if (response.data.success) {
        credit4uAccount.value = response.data.data.credit4u_account
        return true
      }
      error.value = response.data.message || '회원가입에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = extractError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 계약정보 조회 (CODEF → DB) */
  async function fetchContracts(data: FetchContractsRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    currentApi.value = 'fetch-contracts'
    try {
      const response = await credit4uApi.fetchContracts(data)

      // 2-Way 체크
      if (handle2WayResponse(response)) {
        return false // 2-Way 대기
      }

      if (response.data.success) {
        contracts.value = response.data.data.contracts
        if (credit4uAccount.value) {
          credit4uAccount.value.last_synced_at = response.data.data.synced_at
        }
        return true
      }
      error.value = response.data.message || '계약정보 조회에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = extractError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 아이디 찾기 */
  async function findId(data: FindIdRequest): Promise<string | null> {
    loading.value = true
    error.value = null
    currentApi.value = 'find-id'
    try {
      const response = await credit4uApi.findId(data)

      // 2-Way 체크
      if (handle2WayResponse(response)) {
        return null // 2-Way 대기
      }

      if (response.data.success) {
        foundLoginId.value = response.data.data.login_id
        return response.data.data.login_id
      }
      error.value = response.data.message || '아이디 찾기에 실패했습니다.'
      return null
    } catch (e: any) {
      error.value = extractError(e)
      return null
    } finally {
      loading.value = false
    }
  }

  /** 비밀번호 변경 */
  async function changePassword(data: ChangePasswordRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    currentApi.value = 'change-password'
    try {
      const response = await credit4uApi.changePassword(data)

      // 2-Way 체크
      if (handle2WayResponse(response)) {
        return false // 2-Way 대기
      }

      if (response.data.success) {
        return true
      }
      error.value = response.data.message || '비밀번호 변경에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = extractError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 2-Way 추가인증 확인 */
  async function confirm2Way(input: TwoWayConfirmRequest): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      // currentApi를 백엔드 apiType으로 매핑
      input.apiType = currentApi.value || undefined
      const response = await credit4uApi.twoWayConfirm(input)

      // 또 2-Way가 올 수 있음 (다단계)
      if (handle2WayResponse(response)) {
        return false // 다음 단계 대기
      }

      if (response.data.success) {
        // 최종 성공 — currentApi에 따라 후처리
        if (currentApi.value === 'fetch-contracts') {
          const contractData = response.data.data as any
          if (contractData?.contracts) {
            contracts.value = contractData.contracts
          }
        } else if (currentApi.value === 'find-id') {
          const findData = response.data.data as any
          if (findData?.login_id) {
            foundLoginId.value = findData.login_id
          }
        } else if (currentApi.value === 'register') {
          const regData = response.data.data as any
          if (regData?.credit4u_account) {
            credit4uAccount.value = regData.credit4u_account
          }
        }

        twoWayPending.value = false
        twoWayType.value = null
        twoWayData.value = null
        return true
      }
      error.value = response.data.message || '인증에 실패했습니다.'
      return false
    } catch (e: any) {
      error.value = extractError(e)
      return false
    } finally {
      loading.value = false
    }
  }

  /** 재동기화 (새로고침) — 저장된 로그인 정보로 재조회 */
  async function refreshContracts(loginData: FetchContractsRequest): Promise<boolean> {
    return fetchContracts(loginData)
  }

  /** 통계 조회 */
  async function fetchStatistics(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await insuranceApi.getStatistics()
      if (response.data.success) {
        statistics.value = response.data.data
        return true
      }
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || '통계 데이터를 불러오는데 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  /** 보험 상세 조회 */
  async function fetchContractDetail(id: number): Promise<InsuranceContract | null> {
    loading.value = true
    error.value = null
    try {
      const response = await insuranceApi.getInsuranceDetail(id)
      if (response.data.success) {
        return response.data.data as InsuranceContract
      }
      return null
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험 상세 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  /** 2-Way 상태 초기화 */
  function reset2Way(): void {
    twoWayPending.value = false
    twoWayType.value = null
    twoWayData.value = null
    currentApi.value = null
  }

  /** 에러 초기화 */
  function clearError(): void {
    error.value = null
  }

  /** 전체 상태 초기화 */
  function resetAll(): void {
    credit4uAccount.value = null
    registrationStatus.value = null
    contracts.value = []
    statistics.value = []
    loading.value = false
    twoWayPending.value = false
    twoWayType.value = null
    twoWayData.value = null
    currentApi.value = null
    error.value = null
    foundLoginId.value = null
  }

  return {
    // State
    credit4uAccount,
    registrationStatus,
    contracts,
    statistics,
    loading,
    twoWayPending,
    twoWayType,
    twoWayData,
    currentApi,
    error,
    foundLoginId,

    // Computed
    hasContracts,
    hasCredit4uAccount,
    totalPremium,
    lastSyncedAt,

    // Actions
    checkContracts,
    agreeConsent,
    checkRegistration,
    register,
    fetchContracts,
    findId,
    changePassword,
    confirm2Way,
    refreshContracts,
    fetchStatistics,
    fetchContractDetail,
    reset2Way,
    clearError,
    resetAll,
  }
})
