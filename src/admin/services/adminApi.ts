import api from '@shared/api'
import type {
  ApiResponse, LaravelPagination,
  AdminCustomer, AdminAgent, AdminNotice, Memo,
  Assignment, AdditionalContractResult,
  PerformanceSummary, AgentPerformance, MonthlyPerformance,
  DashboardSummary,
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
