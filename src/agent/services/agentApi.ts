import api from '@shared/api'
import type {
  Agent, Customer, Consultation, AgentClaim, CalendarEvent,
  Performance, DbDistribution, ClaimAssignment, DisclosureObligation, Message,
  SatisfactionSurvey, AgentNotification, DashboardSummary,
  DashboardTask,
  Memo, StatisticsTrend, MessageTemplate,
  BatchClaim,
  MedicalRecordFull, HealthCheckupRecord, HealthAgeRecord,
  ApiResponse, LaravelPagination,
} from '../types'
import type {
  InsuranceCompany, ClaimForm, InsuranceClaim, ClaimDocument,
  InsuranceContract,
} from '@shared/types'

const BASE = '/agent'

// ===== Auth =====
export const changePassword = (data: { current_password: string; new_password: string; new_password_confirmation: string }) =>
  api.put<ApiResponse<null>>('/auth/change-password', data)

// ===== Dashboard =====
export const fetchDashboard = () =>
  api.get<ApiResponse<DashboardSummary>>(`${BASE}/dashboard`)

// ===== Today Tasks (오늘의 할일) =====
export const fetchTodayTasks = () =>
  api.get<ApiResponse<DashboardTask[]>>(`${BASE}/dashboard/today-tasks`)

// ===== Profile =====
export const fetchAgentProfile = () =>
  api.get<ApiResponse<Agent>>(`${BASE}/profile`)

export const updateAgentProfile = (data: Partial<Pick<Agent, 'phone' | 'email' | 'office_location'>>) =>
  api.put<ApiResponse<Agent>>(`${BASE}/profile`, data)

// ===== Customers =====
export const fetchCustomers = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<Customer>>>(`${BASE}/customers`, { params })

export const fetchCustomer = (id: string) =>
  api.get<ApiResponse<Customer>>(`${BASE}/customers/${id}`)

export const createCustomer = (data: Partial<Customer>) =>
  api.post<ApiResponse<Customer>>(`${BASE}/customers`, data)

export const updateCustomer = (id: string, data: Partial<Customer>) =>
  api.put<ApiResponse<Customer>>(`${BASE}/customers/${id}`, data)

export const deleteCustomer = (id: string) =>
  api.delete<ApiResponse<Customer>>(`${BASE}/customers/${id}`)

export const unmaskResidentNumber = (id: string) =>
  api.get<ApiResponse<{ resident_number: string }>>(`${BASE}/customers/${id}/resident-number`)

// ===== Customer Contracts =====
export const fetchCustomerContracts = (customerId: string) =>
  api.get<ApiResponse<LaravelPagination<import('../types').Contract>>>(`${BASE}/customers/${customerId}/contracts`)

export const createContract = (customerId: string, data: Partial<import('../types').Contract>) =>
  api.post<ApiResponse<import('../types').Contract>>(`${BASE}/customers/${customerId}/contracts`, data)

export const updateContract = (customerId: string, contractId: number, data: Partial<import('../types').Contract>) =>
  api.put<ApiResponse<import('../types').Contract>>(`${BASE}/customers/${customerId}/contracts/${contractId}`, data)

export const deleteContract = (customerId: string, contractId: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/customers/${customerId}/contracts/${contractId}`)

// ===== Customer Memos =====
export const fetchMemos = (customerId: string) =>
  api.get<ApiResponse<LaravelPagination<Memo>>>(`${BASE}/customers/${customerId}/memos`)

export const createMemo = (customerId: string, data: { title?: string; content: string; memo_date: string }) =>
  api.post<ApiResponse<Memo>>(`${BASE}/customers/${customerId}/memos`, data)

export const updateMemo = (memoId: number, data: { title?: string; content?: string; memo_date?: string }) =>
  api.put<ApiResponse<Memo>>(`${BASE}/memos/${memoId}`, data)

export const deleteMemo = (memoId: number) =>
  api.delete(`${BASE}/memos/${memoId}`)

// ===== Consultations =====
export const fetchConsultations = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<Consultation>>>(`${BASE}/consultations`, { params })

export const fetchConsultation = (id: number) =>
  api.get<ApiResponse<Consultation>>(`${BASE}/consultations/${id}`)

export const respondConsultation = (id: number, answer: string) =>
  api.put<ApiResponse<Consultation>>(`${BASE}/consultations/${id}/answer`, { answer })

// ===== Claims (목록/상세 조회) =====
export const fetchClaims = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AgentClaim>>>(`${BASE}/claims`, { params })

export const fetchClaim = (id: number) =>
  api.get<ApiResponse<AgentClaim>>(`${BASE}/claims/${id}`)

// ===== Claims (대리 청구 작성/발송) =====

// 보험사 목록 (공개 API 재사용)
export const fetchInsuranceCompanies = () =>
  api.get<ApiResponse<InsuranceCompany[]>>('/insurance-companies')

// 양식 목록 (공개 API 재사용)
export const fetchClaimForms = (params?: { company_id?: number }) =>
  api.get<ApiResponse<ClaimForm[]>>('/claim-forms', { params })

// 양식 상세 (공개 API 재사용)
export const fetchClaimFormDetail = (id: number) =>
  api.get<ApiResponse<ClaimForm>>(`/claim-forms/${id}`)

// 대리 청구 생성 (PDF 생성 포함으로 타임아웃 120초)
export const createAgentClaim = (data: {
  customer_id?: string
  claim_form_id: number
  fields: Array<{ form_field_id: number; field_value: string }>
}) =>
  api.post<ApiResponse<InsuranceClaim>>(`${BASE}/claims`, data, { timeout: 120000 })

// 대리 청구 수정 (PDF 재생성 포함으로 타임아웃 120초)
export const updateAgentClaim = (id: number, data: {
  fields: Array<{ form_field_id: number; field_value: string }>
}) =>
  api.put<ApiResponse<InsuranceClaim>>(`${BASE}/claims/${id}`, data, { timeout: 120000 })

// 수익자 정보 변경 (pending/processing 상태에서 가능)
export const updateBeneficiary = (id: number, data: {
  fields: Array<{ form_field_id: number; field_value: string }>
}) =>
  api.put<ApiResponse<InsuranceClaim>>(`${BASE}/claims/${id}/beneficiary`, data, { timeout: 120000 })

// ===== Draft (임시저장) =====
export const saveDraft = (data: {
  customer_id?: string
  claim_form_id: number
  fields: Array<{ form_field_id: number; field_value: string }>
}) =>
  api.post<ApiResponse<InsuranceClaim>>(`${BASE}/claims/draft`, data)

export const updateDraft = (id: number, data: {
  fields: Array<{ form_field_id: number; field_value: string }>
}) =>
  api.put<ApiResponse<InsuranceClaim>>(`${BASE}/claims/${id}/draft`, data)

export const submitDraft = (id: number, data?: {
  customer_id?: string
}) =>
  api.post<ApiResponse<InsuranceClaim>>(`${BASE}/claims/${id}/submit`, data ?? {}, { timeout: 120000 })

export const deleteDraft = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/claims/${id}/draft`)

// 팩스 발송
export const sendAgentClaimFax = (id: number, faxNumber?: string) =>
  api.post<ApiResponse<{ message: string; reference_id?: string }>>(`${BASE}/claims/${id}/send-fax`, { fax_number: faxNumber })

// 팩스 상태 새로고침
export const refreshFaxStatus = (id: number) =>
  api.get<ApiResponse<{ fax_status: string; result_message: string; updated: boolean }>>(`${BASE}/claims/${id}/fax-status`)

// 첨부파일 업로드 (파일 업로드이므로 타임아웃 60초)
export const uploadAgentClaimDocument = (claimId: number, file: File) => {
  const formData = new FormData()
  formData.append('document', file)
  return api.post<ApiResponse<ClaimDocument>>(`${BASE}/claims/${claimId}/documents`, formData, {
    timeout: 60000,
  })
}

// 첨부파일 삭제
export const deleteAgentClaimDocument = (claimId: number, docId: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/claims/${claimId}/documents/${docId}`)

// ===== Schedules (캘린더 일정) =====
export const fetchSchedules = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<CalendarEvent>>>(`${BASE}/schedules`, { params })

export const fetchMonthSchedules = (year: number, month: number) =>
  api.get<ApiResponse<Record<string, CalendarEvent[]>>>(`${BASE}/schedules/month/${year}/${month}`)

export const fetchUpcomingSchedules = (days?: number) =>
  api.get<ApiResponse<CalendarEvent[]>>(`${BASE}/schedules/upcoming`, { params: days ? { days } : undefined })

export const createSchedule = (data: Record<string, unknown>) =>
  api.post<ApiResponse<CalendarEvent>>(`${BASE}/schedules`, data)

export const fetchSchedule = (id: number) =>
  api.get<ApiResponse<CalendarEvent>>(`${BASE}/schedules/${id}`)

export const updateSchedule = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<CalendarEvent>>(`${BASE}/schedules/${id}`, data)

export const deleteSchedule = (id: number) =>
  api.delete(`${BASE}/schedules/${id}`)

export const toggleScheduleComplete = (id: number) =>
  api.put<ApiResponse<CalendarEvent>>(`${BASE}/schedules/${id}/toggle-complete`)

// ===== Statistics (Backend 미구현 - Mock용) =====
export const fetchCurrentStats = () =>
  api.get<{ data: Performance }>(`${BASE}/statistics/current`)

export const fetchStatsTrend = (params?: Record<string, unknown>) =>
  api.get<{ data: StatisticsTrend[] }>(`${BASE}/statistics/trend`, { params })

// ===== DB Distribution (Assignments) =====
export const fetchDbDistributions = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<DbDistribution>>>(`${BASE}/assignments`, { params })

export const fetchDbDistribution = (id: number) =>
  api.get<ApiResponse<DbDistribution>>(`${BASE}/assignments/${id}`)

export const processDbDistribution = (id: number, data: { notes?: string }) =>
  api.put<ApiResponse<DbDistribution>>(`${BASE}/assignments/${id}/process`, data)

export const fetchClaimAssignments = () =>
  api.get<ApiResponse<ClaimAssignment[]>>(`${BASE}/claim-assignments`)

// ===== Messages =====
export const sendMessage = (data: {
  receiver_id: string
  message_type: string
  message_content: string
  image?: File | null
  scheduled_at?: string
}) => {
  const formData = new FormData()
  formData.append('receiver_id', data.receiver_id)
  formData.append('message_type', data.message_type)
  formData.append('message_content', data.message_content)
  if (data.image) {
    formData.append('image', data.image)
  }
  if (data.scheduled_at) {
    formData.append('scheduled_at', data.scheduled_at)
  }
  return api.post<ApiResponse<Message>>(`${BASE}/messages`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
}

export const fetchMessageHistory = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<Message>>>(`${BASE}/messages`, { params })

export const fetchMessage = (id: number) =>
  api.get<ApiResponse<Message>>(`${BASE}/messages/${id}`)

// 카카오 템플릿은 백엔드 미구현 - 로컬 데이터 사용
export const fetchMessageTemplates = () =>
  api.get<{ data: MessageTemplate[] }>(`${BASE}/messages/templates`)

// ===== Notifications =====
export const fetchNotifications = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<{ notifications: LaravelPagination<AgentNotification>; unread_count: number }>>(`${BASE}/notifications`, { params })

export const markNotificationRead = (id: number) =>
  api.put<ApiResponse<AgentNotification>>(`${BASE}/notifications/${id}/read`)

export const markAllNotificationsRead = () =>
  api.put<ApiResponse<{ updated_count: number }>>(`${BASE}/notifications/read-all`)

// ===== Satisfaction Surveys =====
export const fetchSurveys = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<SatisfactionSurvey>>>(`${BASE}/satisfaction-surveys`, { params })

export const fetchSurvey = (id: number) =>
  api.get<ApiResponse<SatisfactionSurvey>>(`${BASE}/satisfaction-surveys/${id}`)

export const createSurvey = (data: { customer_id: string; survey_title: string; survey_content: string }) =>
  api.post<ApiResponse<SatisfactionSurvey>>(`${BASE}/satisfaction-surveys`, data)

// ===== Disclosure Obligations =====
export const fetchObligations = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<DisclosureObligation>>>(`${BASE}/obligations`, { params })

export const fetchObligation = (id: number) =>
  api.get<ApiResponse<DisclosureObligation>>(`${BASE}/obligations/${id}`)

// ===== Batch Claims (다중 보험 청구) =====
export const fetchBatchClaims = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<BatchClaim>>>(`${BASE}/batch-claims`, { params })

export const fetchBatchClaim = (id: number) =>
  api.get<ApiResponse<BatchClaim>>(`${BASE}/batch-claims/${id}`)

export const createBatchClaim = (data: {
  customer_id: string
  claims: Array<{
    claim_form_id: number
    fields: Array<{ form_field_id: number; field_value: string }>
    document_ids?: number[]
  }>
  common_documents?: number[]
  notes?: string
}) =>
  api.post<ApiResponse<BatchClaim>>(`${BASE}/batch-claims`, data, { timeout: 180000 })

export const saveBatchDraft = (data: {
  customer_id?: string
  claims: Array<{
    claim_form_id: number
    fields: Array<{ form_field_id: number; field_value: string }>
  }>
  notes?: string
}) =>
  api.post<ApiResponse<BatchClaim>>(`${BASE}/batch-claims/draft`, data)

export const updateBatchDraft = (id: number, data: {
  customer_id?: string
  claims: Array<{
    claim_form_id: number
    fields: Array<{ form_field_id: number; field_value: string }>
  }>
  notes?: string
}) =>
  api.put<ApiResponse<BatchClaim>>(`${BASE}/batch-claims/${id}/draft`, data)

export const submitBatchDraft = (id: number, data?: {
  customer_id?: string
}) =>
  api.post<ApiResponse<BatchClaim>>(`${BASE}/batch-claims/${id}/submit`, data ?? {}, { timeout: 180000 })

export const deleteBatchDraft = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/batch-claims/${id}/draft`)

export const sendBatchFax = (id: number, claimIds?: number[]) =>
  api.post<ApiResponse<{ sent_count: number; results: Array<{ claim_id: number; fax_status: string; fax_number: string }> }>>(
    `${BASE}/batch-claims/${id}/send-fax`,
    claimIds ? { claim_ids: claimIds } : {},
    { timeout: 120000 },
  )

// ===== CODEF 보험·건강 조회 =====
export const fetchCodefCustomers = (params?: { search?: string }) =>
  api.get<ApiResponse<Array<Customer & { insurance_synced_at?: string | null; medical_synced_at?: string | null; checkup_synced_at?: string | null; health_age_synced_at?: string | null }>>>(`${BASE}/codef/customers`, { params })

export const getInsuranceContracts = (customerId: string) =>
  api.get<ApiResponse<InsuranceContract[]>>(`${BASE}/codef/${customerId}/insurance`)

export const getInsuranceDetail = (customerId: string, insuranceId: number) =>
  api.get<ApiResponse<InsuranceContract>>(`${BASE}/codef/${customerId}/insurance/${insuranceId}`)

export const fetchInsurance = (customerId: string, data: { id: string; password: string }) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/insurance/fetch`, data)

export const confirmInsurance = (customerId: string, data: Record<string, string>) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/insurance/confirm`, data)

export const getMedicalRecords = (customerId: string) =>
  api.get<ApiResponse<MedicalRecordFull[]>>(`${BASE}/codef/${customerId}/medical`)

export const fetchMedical = (customerId: string, data: { loginTypeLevel: string; telecom: string }) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/medical/fetch`, data)

export const confirmMedical = (customerId: string, data: Record<string, string>) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/medical/confirm`, data)

export const getCheckups = (customerId: string) =>
  api.get<ApiResponse<HealthCheckupRecord[]>>(`${BASE}/codef/${customerId}/checkup`)

export const fetchCheckup = (customerId: string, data: { loginTypeLevel: string; telecom: string }) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/checkup/fetch`, data)

export const confirmCheckup = (customerId: string, data: Record<string, string>) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/checkup/confirm`, data)

export const getHealthAge = (customerId: string) =>
  api.get<ApiResponse<HealthAgeRecord | null>>(`${BASE}/codef/${customerId}/health-age`)

export const fetchHealthAgeApi = (customerId: string, data: { loginTypeLevel: string; telecom: string }) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/health-age/fetch`, data)

export const confirmHealthAge = (customerId: string, data: Record<string, string>) =>
  api.post<ApiResponse<unknown>>(`${BASE}/codef/${customerId}/health-age/confirm`, data)

// ===== FCM Token =====
export const registerFcmToken = (data: { fcm_token: string; device_info?: string }) =>
  api.post<ApiResponse<null>>(`${BASE}/fcm-token`, data)

export const deleteFcmToken = (fcm_token: string) =>
  api.delete<ApiResponse<null>>(`${BASE}/fcm-token`, { data: { fcm_token } })
