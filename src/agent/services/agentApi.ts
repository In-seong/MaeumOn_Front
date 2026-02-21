import api from '@shared/api'
import type {
  Agent, Customer, Consultation, AgentClaim, Schedule,
  Performance, DbDistribution, DisclosureObligation, Message,
  SatisfactionSurvey, AgentNotification, DashboardSummary,
  Memo, StatisticsTrend, MessageTemplate,
  ApiResponse, LaravelPagination
} from '../types'

const BASE = '/agent'

// ===== Dashboard =====
export const fetchDashboard = () =>
  api.get<ApiResponse<DashboardSummary>>(`${BASE}/dashboard`)

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

// ===== Customer Contracts =====
export const fetchCustomerContracts = (customerId: string) =>
  api.get<ApiResponse<LaravelPagination<import('../types').Contract>>>(`${BASE}/customers/${customerId}/contracts`)

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

// ===== Claims =====
export const fetchClaims = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<LaravelPagination<AgentClaim>>>(`${BASE}/claims`, { params })

export const fetchClaim = (id: number) =>
  api.get<ApiResponse<AgentClaim>>(`${BASE}/claims/${id}`)

// ===== Schedules (Backend 미구현 - Mock용) =====
export const fetchSchedules = (params?: Record<string, unknown>) =>
  api.get<{ data: Schedule[] }>(`${BASE}/schedules`, { params })

export const fetchMonthSchedules = (year: number, month: number) =>
  api.get<{ data: Record<string, Schedule[]> }>(`${BASE}/schedules/month/${year}/${month}`)

export const createSchedule = (data: Partial<Schedule>) =>
  api.post<{ data: Schedule }>(`${BASE}/schedules`, data)

export const updateSchedule = (id: number, data: Partial<Schedule>) =>
  api.put<{ data: Schedule }>(`${BASE}/schedules/${id}`, data)

export const deleteSchedule = (id: number) =>
  api.delete(`${BASE}/schedules/${id}`)

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

// ===== Messages =====
export const sendMessage = (data: {
  receiver_id: string
  message_type: string
  phone_number: string
  message_content: string
  image_url?: string
  scheduled_at?: string
}) =>
  api.post<ApiResponse<Message>>(`${BASE}/messages`, data)

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
