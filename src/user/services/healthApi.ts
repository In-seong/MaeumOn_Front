import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'
import type {
  HealthApiResponse,
  HealthConsentStatus,
  HealthCheckup,
  MedicalRecord,
  MedicalInfoSummary,
  CheckupRequestParams,
  MedicalInfoRequestParams,
  ExaminationRequestParams,
  HealthAgeRequestParams,
  PredictionApiRequestParams,
  HealthExamination,
  HealthPredictionRow,
  HealthSummary,
  BatchPredictionResult,
  NhisAuthParams,
} from '@shared/types/health'

export type PredictionType = 'cardio' | 'stroke' | 'diabetes' | 'kidney' | 'mi'

// CODEF 호출은 시간이 오래 걸리므로 전용 axios 인스턴스 (300s)
const healthHttp: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 300000, // 5분
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

healthHttp.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('userToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error),
)

healthHttp.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('userToken')
      localStorage.removeItem('userIsLoggedIn')
    }
    return Promise.reject(error)
  },
)

export const healthApi = {
  // ===== 동의 관리 =====
  getConsentStatus: () =>
    healthHttp.get<HealthApiResponse<HealthConsentStatus>>('/health/consent/status'),

  agreeConsent: (type: 'health_checkup' | 'medical_info') =>
    healthHttp.post<HealthApiResponse<unknown>>('/health/consent/agree', { type }),

  revokeConsent: (type: 'health_checkup' | 'medical_info') =>
    healthHttp.post<HealthApiResponse<unknown>>('/health/consent/revoke', { type }),

  // ===== NHIS 건강검진결과 =====
  requestCheckup: (params: CheckupRequestParams) =>
    healthHttp.post<HealthApiResponse<{ count: number; checkups: HealthCheckup[] }>>(
      '/health/checkup/request',
      params,
    ),

  confirmCheckup: (twoWayInput: Record<string, unknown>) =>
    healthHttp.post<HealthApiResponse<{ count: number; checkups: HealthCheckup[] }>>(
      '/health/checkup/confirm',
      twoWayInput,
    ),

  getCheckupList: () =>
    healthHttp.get<HealthApiResponse<HealthCheckup[]>>('/health/checkup'),

  getLatestCheckup: () =>
    healthHttp.get<HealthApiResponse<HealthCheckup | null>>('/health/checkup/latest'),

  // ===== HIRA 내진료정보열람 =====
  requestMedicalInfo: (params: MedicalInfoRequestParams) =>
    healthHttp.post<HealthApiResponse<{ count: number }>>(
      '/health/medical-info/request',
      params,
    ),

  confirmMedicalInfo: (twoWayInput: Record<string, unknown>) =>
    healthHttp.post<HealthApiResponse<{ count: number }>>(
      '/health/medical-info/confirm',
      twoWayInput,
    ),

  getMedicalRecords: (source: 'all' | 'codef_hira' | 'manual' = 'all') =>
    healthHttp.get<HealthApiResponse<MedicalRecord[]>>('/health/medical-info', {
      params: { source },
    }),

  getMedicalSummary: () =>
    healthHttp.get<HealthApiResponse<MedicalInfoSummary>>('/health/medical-info/summary'),

  // ===== 검진대상 (Phase 2) =====
  requestExamination: (params: ExaminationRequestParams) =>
    healthHttp.post<HealthApiResponse<HealthExamination>>('/health/examination/request', params),

  confirmExamination: (twoWayInput: Record<string, unknown>) =>
    healthHttp.post<HealthApiResponse<HealthExamination>>('/health/examination/confirm', twoWayInput),

  getExamination: () =>
    healthHttp.get<HealthApiResponse<HealthExamination | null>>('/health/examination'),

  // ===== 건강나이 (Phase 2) =====
  requestHealthAge: (params: HealthAgeRequestParams) =>
    healthHttp.post<HealthApiResponse<HealthPredictionRow>>('/health/health-age/request', params),

  confirmHealthAge: (twoWayInput: Record<string, unknown>) =>
    healthHttp.post<HealthApiResponse<HealthPredictionRow>>('/health/health-age/confirm', twoWayInput),

  getHealthAge: () =>
    healthHttp.get<HealthApiResponse<HealthPredictionRow | null>>('/health/health-age'),

  // ===== 예측 5종 (Phase 2) =====
  requestPrediction: (type: PredictionType, params: PredictionApiRequestParams) =>
    healthHttp.post<HealthApiResponse<HealthPredictionRow>>(`/health/prediction/${type}/request`, params),

  confirmPrediction: (type: PredictionType, twoWayInput: Record<string, unknown>) =>
    healthHttp.post<HealthApiResponse<HealthPredictionRow>>(`/health/prediction/${type}/confirm`, twoWayInput),

  getPrediction: (type: PredictionType) =>
    healthHttp.get<HealthApiResponse<HealthPredictionRow | null>>(`/health/prediction/${type}`),

  getAllPredictions: () =>
    healthHttp.get<HealthApiResponse<Record<string, HealthPredictionRow>>>('/health/prediction'),

  // ===== 배치: 건강나이 + 예측 5종 (1회 인증) =====
  requestBatchPredictions: (params: NhisAuthParams) =>
    healthHttp.post<HealthApiResponse<BatchPredictionResult>>(
      '/health/predictions/batch/request',
      params,
    ),

  confirmBatchPredictions: (params: NhisAuthParams & { simpleAuth?: string }) =>
    healthHttp.post<HealthApiResponse<BatchPredictionResult>>(
      '/health/predictions/batch/confirm',
      { simpleAuth: '1', ...params },
    ),

  // ===== 종합 요약 =====
  getSummary: () =>
    healthHttp.get<HealthApiResponse<HealthSummary>>('/health/summary'),
}

/** 간편인증 종류 (loginTypeLevel) */
export const SIMPLE_AUTH_PROVIDERS = [
  { value: '1', label: '카카오톡' },
  { value: '2', label: '페이코' },
  { value: '3', label: '삼성패스' },
  { value: '4', label: 'KB모바일' },
  { value: '5', label: 'PASS' },
  { value: '6', label: '네이버' },
  { value: '7', label: '신한' },
  { value: '8', label: '토스' },
  { value: '10', label: 'NH모바일' },
] as const
