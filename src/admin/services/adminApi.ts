import api from '@shared/api'
import type {
  ApiResponse, LaravelPagination,
  AdminCustomer, AdminAgent, AdminNotice, Memo,
  Assignment, AdditionalContractResult,
  PerformanceSummary, AgentPerformance, MonthlyPerformance,
  DashboardSummary, AdminSentNotification,
  AdminConsultation, AdminBatchClaim,
  AdminHospital, AdminHealthCenter, AdminClaimRequest,
  AdminReservation, ScheduleConfig,
} from '../types'

const BASE = '/admin'

// ===== Dashboard =====
export const fetchDashboardSummary = () =>
  api.get<ApiResponse<DashboardSummary>>(`${BASE}/dashboard`)

// ===== Customers (SFR-032~038) =====
export const fetchCustomers = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminCustomer>>>(`${BASE}/customers`, { params })

export const fetchCustomer = (id: string) =>
  api.get<ApiResponse<AdminCustomer>>(`${BASE}/customers/${id}`)

export const createCustomer = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminCustomer>>(`${BASE}/customers`, data)

export const updateCustomer = (id: string, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminCustomer>>(`${BASE}/customers/${id}`, data)

export const deleteCustomer = (id: string) =>
  api.delete<ApiResponse<AdminCustomer>>(`${BASE}/customers/${id}`)

// ===== Customer Memos (SFR-038) =====
export const fetchMemos = (customerId: string, params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<Memo>>>(`${BASE}/customers/${customerId}/memos`, { params })

export const createMemo = (customerId: string, data: { title?: string; content: string; memo_date: string }) =>
  api.post<ApiResponse<Memo>>(`${BASE}/customers/${customerId}/memos`, data)

export const updateMemo = (memoId: number, data: { title?: string; content?: string; memo_date?: string }) =>
  api.put<ApiResponse<Memo>>(`${BASE}/memos/${memoId}`, data)

export const deleteMemo = (memoId: number) =>
  api.delete(`${BASE}/memos/${memoId}`)

// ===== Agents (SFR-042) =====
export const fetchAgents = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminAgent>>>(`${BASE}/agents`, { params })

export const fetchAgent = (id: string) =>
  api.get<ApiResponse<AdminAgent>>(`${BASE}/agents/${id}`)

export const createAgent = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminAgent>>(`${BASE}/agents`, data)

export const updateAgent = (id: string, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminAgent>>(`${BASE}/agents/${id}`, data)

export const deleteAgent = (id: string) =>
  api.delete<ApiResponse<AdminAgent>>(`${BASE}/agents/${id}`)

// ===== Assignments / DB Distribution (SFR-039) =====
export const fetchAssignments = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<Assignment>>>(`${BASE}/assignments`, { params })

export const createAssignment = (data: { customer_id: string; agent_id: string; notes?: string }) =>
  api.post<ApiResponse<Assignment>>(`${BASE}/assignments`, data)

export const bulkAssignment = (data: { assignments: Array<{ customer_id: string; agent_id: string }>; notes?: string }) =>
  api.post<ApiResponse<{ created_count: number }>>(`${BASE}/assignments/bulk`, data)

export const deleteAssignment = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/assignments/${id}`)

export const fetchClaimAssignments = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminClaimRequest>>>(`${BASE}/assignments/claim`, { params })

// ===== Additional Contracts (SFR-040, 041) =====
export const fetchAdditionalContracts = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdditionalContractResult>>>(`${BASE}/additional-contracts`, { params })

// ===== Performance (SFR-043) =====
export const fetchPerformanceSummary = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<PerformanceSummary>>(`${BASE}/performance/summary`, { params })

export const fetchAgentPerformances = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AgentPerformance>>>(`${BASE}/performance/agents`, { params })

export const fetchAgentPerformanceDetail = (agentId: string, params?: Record<string, unknown>) =>
  api.get<ApiResponse<MonthlyPerformance[]>>(`${BASE}/performance/agents/${agentId}`, { params })

// ===== Notices (SFR-044) =====
export const fetchNotices = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminNotice>>>(`${BASE}/notices`, { params })

export const fetchNotice = (id: number) =>
  api.get<ApiResponse<AdminNotice>>(`${BASE}/notices/${id}`)

export const createNotice = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminNotice>>(`${BASE}/notices`, data)

export const updateNotice = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminNotice>>(`${BASE}/notices/${id}`, data)

export const deleteNotice = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/notices/${id}`)

// ===== Notifications (관리자 → 설계사 알림 발송) =====
export const sendNotification = (data: {
  title: string
  content: string
  target: 'ALL' | 'SELECTED'
  agent_ids?: string[]
}) =>
  api.post<ApiResponse<{ sent_count: number }>>(`${BASE}/notifications`, data)

export const fetchSentNotifications = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminSentNotification>>>(`${BASE}/notifications`, { params })

// ===== Consultations (상담 관리) =====
export const fetchConsultations = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminConsultation>>>(`${BASE}/consultations`, { params })

export const fetchConsultation = (id: number) =>
  api.get<ApiResponse<{ consultation: AdminConsultation; agent: AdminAgent | null }>>(`${BASE}/consultations/${id}`)

export const answerConsultation = (id: number, answer: string) =>
  api.put<ApiResponse<AdminConsultation>>(`${BASE}/consultations/${id}/answer`, { answer })

export const assignConsultation = (id: number, agentId: string) =>
  api.put<ApiResponse<AdminConsultation>>(`${BASE}/consultations/${id}/assign`, { agent_id: agentId })

// ===== Batch Claims (배치 청구 관리) =====
export const fetchBatchClaims = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminBatchClaim>>>(`${BASE}/batch-claims`, { params })

// ===== Hospitals (병원 관리) =====
export const fetchAdminHospitals = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminHospital>>>(`${BASE}/hospitals`, { params })

export const fetchAdminHospital = (id: number) =>
  api.get<ApiResponse<AdminHospital>>(`${BASE}/hospitals/${id}`)

export const createAdminHospital = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminHospital>>(`${BASE}/hospitals`, data)

export const updateAdminHospital = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminHospital>>(`${BASE}/hospitals/${id}`, data)

export const uploadHospitalImage = (id: number, formData: FormData) =>
  api.post<ApiResponse<AdminHospital>>(`${BASE}/hospitals/${id}/image`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const uploadHospitalThumbnail = (id: number, formData: FormData) =>
  api.post<ApiResponse<AdminHospital>>(`${BASE}/hospitals/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteHospitalThumbnail = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/hospitals/${id}/thumbnail`)

export const addHospitalImage = (id: number, formData: FormData) =>
  api.post(`${BASE}/hospitals/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteHospitalImage = (hospitalId: number, imageId: number) =>
  api.delete(`${BASE}/hospitals/${hospitalId}/images/${imageId}`)

export const deleteAdminHospital = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/hospitals/${id}`)

export const forceDeleteAdminHospital = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/hospitals/${id}/force`)

export const activateAdminHospital = (id: number) =>
  api.put<ApiResponse<null>>(`${BASE}/hospitals/${id}/activate`)

// ===== Health Centers (건강검진 센터 관리) =====
export const fetchAdminHealthCenters = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminHealthCenter>>>(`${BASE}/health-centers`, { params })

export const fetchAdminHealthCenter = (id: number) =>
  api.get<ApiResponse<AdminHealthCenter>>(`${BASE}/health-centers/${id}`)

export const createAdminHealthCenter = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminHealthCenter>>(`${BASE}/health-centers`, data)

export const updateAdminHealthCenter = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminHealthCenter>>(`${BASE}/health-centers/${id}`, data)

export const addHealthCenterImage = (id: number, formData: FormData) =>
  api.post(`${BASE}/health-centers/${id}/images`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteHealthCenterImage = (centerId: number, imageId: number) =>
  api.delete(`${BASE}/health-centers/${centerId}/images/${imageId}`)

export const deleteAdminHealthCenter = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/health-centers/${id}`)

// ===== Claim Requests (간편 청구 신청 관리) =====
export const fetchAdminClaimRequests = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminClaimRequest>>>(`${BASE}/claim-requests`, { params })

export const fetchAdminClaimRequest = (id: number) =>
  api.get<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}`)

export const assignClaimRequest = (id: number, agentId: string) =>
  api.put<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}/assign`, { agent_id: agentId })

export const updateClaimRequestStatus = (id: number, status: string) =>
  api.put<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}/status`, { status })

// ===== Reservations (예약 관리) =====
export const fetchAdminReservations = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminReservation>>>(`${BASE}/reservations`, { params })

export const updateAdminReservationStatus = (id: number, status: string) =>
  api.put<ApiResponse<AdminReservation>>(`${BASE}/reservations/${id}/status`, { status })

// ===== Hospital Portal (병원 포털 API) =====
export const hospitalPortalLogin = (username: string, password: string) =>
  api.post<ApiResponse<{ token: string; account_name: string; hospital_id?: number; center_id?: number }>>('/hospital-portal/login', { username, password })

export const fetchPortalReservations = (token: string, date?: string) =>
  api.get<ApiResponse<AdminClaimRequest[]>>('/hospital-portal/reservations', {
    params: { date },
    headers: { Authorization: `Bearer ${token}` },
  })

export const updatePortalReservationStatus = (token: string, id: number, status: string) =>
  api.put<ApiResponse<unknown>>(`/hospital-portal/reservations/${id}/status`, { status }, {
    headers: { Authorization: `Bearer ${token}` },
  })

// ===== Hospital Portal Schedule (포털 스케줄 설정) =====
export const fetchPortalSchedule = (token: string) =>
  api.get<ApiResponse<ScheduleConfig | null>>('/hospital-portal/schedule', {
    headers: { Authorization: `Bearer ${token}` },
  })

export const updatePortalSchedule = (token: string, config: ScheduleConfig | null) =>
  api.put<ApiResponse<ScheduleConfig | null>>('/hospital-portal/schedule', { schedule_config: config }, {
    headers: { Authorization: `Bearer ${token}` },
  })

// ===== Banners =====
export interface BannerItem {
  banner_id: number
  title: string
  image_path: string
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

export const fetchBanners = () =>
  api.get<ApiResponse<BannerItem[]>>(`${BASE}/banners`)

export const createBanner = (formData: FormData) =>
  api.post<ApiResponse<BannerItem>>(`${BASE}/banners`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const updateBanner = (id: number, formData: FormData) =>
  api.post<ApiResponse<BannerItem>>(`${BASE}/banners/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteBanner = (id: number) =>
  api.delete(`${BASE}/banners/${id}`)
