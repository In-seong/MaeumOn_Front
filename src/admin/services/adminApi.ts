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
export const fetchDashboardSummary = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<DashboardSummary>>(`${BASE}/dashboard`, { params })

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

export const unmaskResidentNumber = (id: string) =>
  api.get<ApiResponse<{ resident_number: string }>>(`${BASE}/customers/${id}/resident-number`)

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

export const forceDeleteAdminHealthCenter = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/health-centers/${id}/force`)

export const uploadHealthCenterThumbnail = (id: number, formData: FormData) =>
  api.post(`${BASE}/health-centers/${id}/thumbnail`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

export const deleteHealthCenterThumbnail = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/health-centers/${id}/thumbnail`)

// ===== Claim Requests (간편 청구 신청 관리) =====
export const fetchAdminClaimRequests = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AdminClaimRequest>>>(`${BASE}/claim-requests`, { params })

export const fetchAdminClaimRequest = (id: number) =>
  api.get<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}`)

export const assignClaimRequest = (id: number, agentId: string) =>
  api.put<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}/assign`, { agent_id: agentId })

export const updateClaimRequestStatus = (id: number, status: string) =>
  api.put<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests/${id}/status`, { status })

export const bulkAssignClaimRequests = (data: { request_ids: number[]; agent_id: string }) =>
  api.post<ApiResponse<{ assigned_count: number }>>(`${BASE}/claim-requests/bulk-assign`, data)

export const createAdminClaimRequest = (data: FormData) =>
  api.post<ApiResponse<AdminClaimRequest>>(`${BASE}/claim-requests`, data, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })

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

// ===== Branches (지사 관리) =====
export const fetchBranches = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<BranchData[]>>(`${BASE}/branches`, { params })

export const fetchBranch = (id: number) =>
  api.get<ApiResponse<BranchData>>(`${BASE}/branches/${id}`)

export const createBranch = (data: Record<string, unknown>) =>
  api.post<ApiResponse<BranchData>>(`${BASE}/branches`, data)

export const updateBranch = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<BranchData>>(`${BASE}/branches/${id}`, data)

export const deleteBranch = (id: number) =>
  api.delete<ApiResponse<null>>(`${BASE}/branches/${id}`)

export const transferBranchAgents = (id: number, data: Record<string, unknown>) =>
  api.post<ApiResponse<null>>(`${BASE}/branches/${id}/transfer-agents`, data)

export interface BranchData {
  branch_id: number
  branch_name: string
  branch_code: string
  region?: string
  address?: string
  contact_phone?: string
  manager_admin_id?: string
  is_active: boolean
  agents_count?: number
  manager?: { admin_id: string; name: string; phone?: string }
}

// ===== Admin Accounts (관리자 계정 관리) =====
export const fetchAdminAccounts = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<AdminAccountData[]>>(`${BASE}/admin-accounts`, { params })

export const createAdminAccount = (data: Record<string, unknown>) =>
  api.post<ApiResponse<AdminAccountData>>(`${BASE}/admin-accounts`, data)

export const updateAdminAccount = (id: string, data: Record<string, unknown>) =>
  api.put<ApiResponse<AdminAccountData>>(`${BASE}/admin-accounts/${id}`, data)

export const deleteAdminAccount = (id: string) =>
  api.delete<ApiResponse<null>>(`${BASE}/admin-accounts/${id}`)

export interface AdminAccountData {
  admin_id: string
  account_id: number
  name: string
  phone?: string
  email?: string
  department?: string
  position?: string
  admin_role: 'SUPER' | 'BRANCH'
  branch_id?: number
  is_active: boolean
  account?: { account_id: number; username: string; is_active: boolean }
  branch?: { branch_id: number; branch_name: string }
}

// ===== 기업용 보험 문의 =====
export const fetchCorporateInquiries = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<CorporateInquiry>>>(`${BASE}/corporate-inquiries`, { params })

export const fetchCorporateInquiry = (id: number) =>
  api.get<ApiResponse<CorporateInquiry>>(`${BASE}/corporate-inquiries/${id}`)

export const updateCorporateInquiry = (id: number, data: Record<string, unknown>) =>
  api.put<ApiResponse<CorporateInquiry>>(`${BASE}/corporate-inquiries/${id}`, data)

export const assignCorporateInquiries = (data: { inquiry_ids: number[]; agent_id: string; notes?: string }) =>
  api.post<ApiResponse<null>>(`${BASE}/corporate-inquiries/assign`, data)

export const createCorporateInquiry = (data: Record<string, unknown>) =>
  api.post<ApiResponse<CorporateInquiry>>(`${BASE}/corporate-inquiries`, data)

export const fetchUnassignedCorporateInquiries = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<CorporateInquiry[]>>(`${BASE}/corporate-inquiries/unassigned`, { params })

export interface CorporateInquiry {
  id: number
  company_name: string
  address: string | null
  ceo_name: string
  phone: string
  annual_revenue: string | null
  industry: string | null
  consultation_field: string | null
  privacy_agreed: boolean
  status: 'NEW' | 'IN_PROGRESS' | 'COMPLETED'
  agent_id: string | null
  assigned_at: string | null
  notes: string | null
  created_at: string
  updated_at: string
  agent?: {
    agent_id: string
    name: string
    phone: string
    email?: string
  } | null
}
