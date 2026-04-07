import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type { ApiResponse } from '@shared/types'
import type {
  Credit4uAccount,
  InsuranceContract,
  InsuranceCoverage,
  InsuranceStatistic,
  Credit4uApiResponse,
  ConsentRequest,
  CheckRegistrationRequest,
  RegisterRequest,
  FetchContractsRequest,
  FindIdRequest,
  ChangePasswordRequest,
  TwoWayConfirmRequest,
} from '@shared/types/credit4u'

// ============ Credit4U 전용 Axios 인스턴스 (300s 타임아웃) ============
const credit4uHttp: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000, // 300s (5분) — CODEF API 응답 대기
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor — 인증 토큰 자동 첨부
credit4uHttp.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('userToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

// Response Interceptor — 401 처리
credit4uHttp.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userIsLoggedIn')
    }
    return Promise.reject(error)
  },
)

// ============ Credit4U API ============
export const credit4uApi = {
  /** 정보이용 동의 저장 */
  consent: (data?: ConsentRequest) =>
    credit4uHttp.post<Credit4uApiResponse<Credit4uAccount>>('/credit4u/consent', data),

  /** 가입여부 확인 (inquiry_type=0) 또는 회원정보확인 (inquiry_type=4) */
  checkRegistration: (data: CheckRegistrationRequest) =>
    credit4uHttp.post<Credit4uApiResponse<{ registration_status: string; credit4u_account: Credit4uAccount }>>('/credit4u/check-registration', data),

  /** 회원가입 신청 */
  register: (data: RegisterRequest) =>
    credit4uHttp.post<Credit4uApiResponse<{ credit4u_account: Credit4uAccount }>>('/credit4u/register', data),

  /** 계약정보 조회 (CODEF → DB 저장) */
  fetchContracts: (data: FetchContractsRequest) =>
    credit4uHttp.post<Credit4uApiResponse<{ contracts: InsuranceContract[]; synced_at: string }>>('/credit4u/fetch-contracts', data),

  /** 아이디 찾기 */
  findId: (data: FindIdRequest) =>
    credit4uHttp.post<Credit4uApiResponse<{ login_id: string }>>('/credit4u/find-id', data),

  /** 비밀번호 변경 */
  changePassword: (data: ChangePasswordRequest) =>
    credit4uHttp.post<Credit4uApiResponse<{ success: boolean }>>('/credit4u/change-password', data),

  /** 2-Way 추가인증 확인 (범용) */
  twoWayConfirm: (data: TwoWayConfirmRequest) =>
    credit4uHttp.post<Credit4uApiResponse<unknown>>('/credit4u/2way-confirm', data),
}

// ============ 보험 정보 API (DB 조회) ============
// 일반 shared api 인스턴스를 사용해도 되지만, 일관성을 위해 동일 인스턴스 사용
import api from '@shared/api'

export const insuranceApi = {
  /** 내 보험 목록 조회 (DB) */
  getInsurances: () =>
    api.get<ApiResponse<InsuranceContract[]>>('/insurances'),

  /** 보험 상세 + 보장내역 */
  getInsuranceDetail: (id: number) =>
    api.get<ApiResponse<InsuranceContract & { coverages: InsuranceCoverage[] }>>(`/insurances/${id}`),

  /** 분석통계 조회 */
  getStatistics: () =>
    api.get<ApiResponse<InsuranceStatistic[]>>('/insurances/statistics'),
}
