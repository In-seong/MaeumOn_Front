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

// 관리자 알림 발송
export interface AdminSentNotification {
  notification_id: number
  receiver_id: string
  receiver_type: string
  sender_id: string
  sender_type: string
  notification_type: string
  title: string
  content: string
  is_read: boolean
  sent_at?: string
  created_at?: string
}

// 상담 타입
export interface AdminConsultation {
  consultation_id: number
  customer_id: string
  assignee_id: string
  assignee_type: string
  consultation_type?: string
  consultation_date?: string
  consultation_content?: string
  consultation_answer?: string
  consultation_status?: string
  customer_name?: string
  customer_phone?: string
  created_at?: string
  updated_at?: string
  customer?: Customer
}

// 배치 청구 타입
export interface AdminBatchClaim {
  batch_claim_id: number
  customer_id: string
  agent_id: string
  batch_status: string
  batch_status_label?: string
  total_count: number
  completed_count: number
  notes?: string
  claims_count?: number
  customer?: Customer
  agent?: {
    agent_id: string
    name: string
    phone?: string
  }
  created_at?: string
  updated_at?: string
}

// ===== 예약 스케줄 커스터마이징 =====

export interface ScheduleTimeRange {
  start: string
  end: string
  interval?: number
}

export interface ScheduleDayConfig {
  slots: ScheduleTimeRange[]
  interval?: number
}

export interface ScheduleConfig {
  default_interval: number
  weekly: Record<string, ScheduleDayConfig | null>
  blocked_dates: string[]
  custom_dates: Record<string, ScheduleDayConfig>
}

// ===== 사용자 앱 리뉴얼 타입 =====

// 병원 관리
export interface AdminHospital {
  hospital_id: number
  hospital_name: string
  business_number?: string
  address: string
  detailed_address?: string
  contact_phone?: string
  latitude?: number
  longitude?: number
  business_hours?: string
  introduction?: string
  specialties?: string
  schedule_config?: ScheduleConfig | null
  is_active: boolean
  accounts?: AdminHospitalAccount[]
  created_at?: string
  updated_at?: string
}

// 건강검진 센터 관리
export interface AdminHealthCenter {
  center_id: number
  center_name: string
  address: string
  detailed_address?: string
  latitude?: number
  longitude?: number
  contact_phone?: string
  business_hours?: string
  introduction?: string
  schedule_config?: ScheduleConfig | null
  is_active: boolean
  accounts?: AdminHospitalAccount[]
  created_at?: string
  updated_at?: string
}

// 병원/센터 계정
export interface AdminHospitalAccount {
  account_id: number
  hospital_id?: number
  center_id?: number
  username: string
  account_name?: string
  is_active: boolean
  created_at?: string
}

// 간편 청구 신청
export interface AdminClaimRequest {
  request_id: number
  name: string
  phone: string
  memo?: string
  status: 'pending' | 'assigned' | 'completed' | 'cancelled'
  assigned_agent_id?: string
  linked_claim_id?: number
  files?: AdminClaimRequestFile[]
  assigned_agent?: {
    agent_id: string
    name: string
    phone?: string
  }
  created_at?: string
  updated_at?: string
}

export interface AdminClaimRequestFile {
  file_id: number
  request_id: number
  file_url: string
  file_name?: string
  file_size?: number
  file_download_url?: string
}

// 예약 관리
export interface AdminReservation {
  reservation_id: number
  hospital_id?: number
  center_id?: number
  reservation_type: 'hospital' | 'health_center'
  patient_name: string
  patient_phone: string
  reservation_date: string
  reservation_time: string
  memo?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  hospital?: AdminHospital
  health_center?: AdminHealthCenter
  created_at?: string
  updated_at?: string
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
