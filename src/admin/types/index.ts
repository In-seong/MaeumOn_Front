import type { ApiResponse, PaginatedResponse, Customer } from '@shared/types'

// Re-export shared types for convenience
export type { ApiResponse, PaginatedResponse }

// Laravel pagination wrapper (matches agent types pattern)
export type LaravelPagination<T> = PaginatedResponse<T>

// Admin 타입
export interface Admin {
  admin_id: string
  account_id: number
  name: string
  phone?: string
  email?: string
  department?: string
  position?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

// Admin 고객 목록 (확장된 Customer)
export interface AdminCustomer extends Customer {
  agent?: {
    agent_id: string
    name: string
    phone?: string
  }
  contracts_count?: number
  claims_count?: number
  memos_count?: number
}

// 설계사 관리용 타입
export interface AdminAgent {
  agent_id: string
  account_id: number
  name: string
  employee_number?: string
  phone?: string
  email?: string
  office_location?: string
  specialization?: string
  hire_date?: string
  resignation_date?: string
  is_active: boolean
  customers_count?: number
  contracts_count?: number
  created_at?: string
  updated_at?: string
  account?: {
    account_id: number
    username: string
    role: string
    is_active: boolean
  }
}

// 공지사항 타입
export interface AdminNotice {
  notice_id: number
  author_id: string
  title: string
  content: string
  notice_type?: string
  is_pinned: boolean
  display_start_date?: string
  display_end_date?: string
  view_count: number
  author?: Admin
  created_at?: string
  updated_at?: string
}

// 메모 타입
export interface Memo {
  memo_id: number
  customer_id: string
  author_id: string
  author_type: 'AGENT' | 'ADMIN'
  title?: string
  content: string
  memo_date: string
  created_at?: string
  updated_at?: string
}

// DB 배분 타입
export interface Assignment {
  assignment_id: number
  customer_id: string
  agent_id: string
  admin_id?: string
  assignment_type?: string
  assignment_date?: string
  notes?: string
  customer?: Customer
  agent?: {
    agent_id: string
    name: string
    phone?: string
  }
  created_at?: string
  updated_at?: string
}

// 추가 계약 발굴 타입
export interface AdditionalContractResult {
  customer_id: string
  name: string
  phone?: string
  agent_name?: string
  agent_id?: string
  reason: string
  detail?: string
}

// 실적 요약 타입
export interface PerformanceSummary {
  total_assignments: number
  total_contracts: number
  total_contract_amount: number
  db_processing_rate: number
  conversion_rate: number
}

// 설계사별 실적
export interface AgentPerformance {
  agent_id: string
  agent_name: string
  db_assigned_count: number
  contract_count: number
  contract_amount: number
  consultation_count: number
  processing_rate?: number
}

// 설계사 월별 실적
export interface MonthlyPerformance {
  year: number
  month: number
  db_assigned_count: number
  contract_count: number
  contract_amount: number
  consultation_count: number
}

// 대시보드 요약
export interface DashboardSummary {
  total_customers: number
  total_agents: number
  total_claims: number
  pending_claims: number
  total_assignments: number
  recent_notices: AdminNotice[]
}
