import api from '@shared/api'
import type {
  Agent, Customer, Consultation, AgentClaim, Schedule,
  Performance, DbDistribution, DisclosureObligation, Message,
  SatisfactionSurvey, AgentNotification, DashboardSummary,
  Memo, StatisticsTrend, MessageTemplate, PaginatedResponse
} from '../types'

const BASE = '/agent'

// ===== Dashboard =====
export const fetchDashboard = () =>
  api.get<{ data: DashboardSummary }>(`${BASE}/dashboard`)

// ===== Profile =====
export const fetchAgentProfile = () =>
  api.get<{ data: Agent }>(`${BASE}/profile`)

// ===== Customers =====
export const fetchCustomers = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Customer>>(`${BASE}/customers`, { params })

export const fetchCustomer = (id: number) =>
  api.get<{ data: Customer }>(`${BASE}/customers/${id}`)

export const createCustomer = (data: Partial<Customer>) =>
  api.post<{ data: Customer }>(`${BASE}/customers`, data)

export const updateCustomer = (id: number, data: Partial<Customer>) =>
  api.put<{ data: Customer }>(`${BASE}/customers/${id}`, data)

export const deleteCustomer = (id: number) =>
  api.delete(`${BASE}/customers/${id}`)

// ===== Customer Memos =====
export const fetchMemos = (customerId: number) =>
  api.get<{ data: Memo[] }>(`${BASE}/customers/${customerId}/memos`)

export const createMemo = (customerId: number, data: { content: string; memo_date: string }) =>
  api.post<{ data: Memo }>(`${BASE}/customers/${customerId}/memos`, data)

export const deleteMemo = (customerId: number, memoId: number) =>
  api.delete(`${BASE}/customers/${customerId}/memos/${memoId}`)

// ===== Customer Contracts =====
export const fetchCustomerContracts = (customerId: number) =>
  api.get<{ data: import('../types').Contract[] }>(`${BASE}/customers/${customerId}/contracts`)

// ===== Consultations =====
export const fetchConsultations = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Consultation>>(`${BASE}/consultations`, { params })

export const respondConsultation = (id: number, response: string) =>
  api.put<{ data: Consultation }>(`${BASE}/consultations/${id}/respond`, { response })

// ===== Claims =====
export const fetchClaims = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AgentClaim>>(`${BASE}/claims`, { params })

export const fetchClaim = (id: number) =>
  api.get<{ data: AgentClaim }>(`${BASE}/claims/${id}`)

// ===== Schedules =====
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

// ===== Statistics =====
export const fetchCurrentStats = () =>
  api.get<{ data: Performance }>(`${BASE}/statistics/current`)

export const fetchStatsTrend = (params?: Record<string, unknown>) =>
  api.get<{ data: StatisticsTrend[] }>(`${BASE}/statistics/trend`, { params })

// ===== DB Distribution =====
export const fetchDbDistributions = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<DbDistribution>>(`${BASE}/db-distributions`, { params })

export const processDbDistribution = (id: number, data: { status: string; memo?: string }) =>
  api.put<{ data: DbDistribution }>(`${BASE}/db-distributions/${id}/process`, data)

// ===== Messages =====
export const sendMessage = (data: Partial<Message>) =>
  api.post<{ data: Message }>(`${BASE}/messages/send`, data)

export const fetchMessageHistory = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<Message>>(`${BASE}/messages`, { params })

export const fetchMessageTemplates = () =>
  api.get<{ data: MessageTemplate[] }>(`${BASE}/messages/templates`)

// ===== Notifications =====
export const fetchNotifications = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<AgentNotification>>(`${BASE}/notifications`, { params })

export const markNotificationRead = (id: number) =>
  api.put(`${BASE}/notifications/${id}/read`)

// ===== Satisfaction Surveys =====
export const fetchSurveys = (params?: Record<string, unknown>) =>
  api.get<PaginatedResponse<SatisfactionSurvey>>(`${BASE}/satisfaction-surveys`, { params })

export const createSurvey = (data: { customer_id: number }) =>
  api.post<{ data: SatisfactionSurvey }>(`${BASE}/satisfaction-surveys`, data)

// ===== Disclosure Obligations =====
export const fetchObligations = (params?: Record<string, unknown>) =>
  api.get<{ data: DisclosureObligation[] }>(`${BASE}/disclosure-obligations`, { params })
