// ===== Agent Domain Types =====

// Agent (설계사)
export interface Agent {
  agent_id: string         // CHAR(8)
  account_id: number
  agent_name: string
  agent_phone: string
  agent_email: string
  agency_name: string      // 소속
  position: string         // 직급
  license_number: string
  profile_image_url?: string
  created_at: string
  updated_at: string
}

// Customer (고객)
export interface Customer {
  customer_id: number
  agent_id: string
  customer_name: string
  customer_phone: string
  telecom: string          // 통신사
  resident_number?: string // 주민등록번호
  address?: string
  occupation?: string      // 직업
  acquisition_source?: string // 고객정보취득경로 (병원 등)
  customer_tag?: 'VIP' | '신규' | '관심' | '일반'
  last_contact_date?: string
  registered_at: string
  created_at: string
  updated_at: string
}

// Contract (보험 계약)
export interface Contract {
  contract_id: number
  customer_id: number
  agent_id: string
  insurance_company: string
  product_name: string
  premium: number          // 보험료
  contract_date: string    // 체결일
  expiry_date?: string     // 만기일
  status: 'active' | 'expired' | 'cancelled'
  created_at: string
}

// Consultation (상담요청)
export interface Consultation {
  consultation_id: number
  customer_id: number
  agent_id: string
  customer_name: string
  customer_phone: string
  consultation_type: string
  content: string
  status: 'pending' | 'in_progress' | 'completed'
  response?: string
  requested_at: string
  responded_at?: string
}

// InsuranceClaim (보험금 청구) - Agent view
export interface AgentClaim {
  claim_id: number
  customer_id: number
  customer_name: string
  insurance_company: string
  claim_type: string
  claim_amount?: number
  status: 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'
  submitted_at: string
  processed_at?: string
}

// Schedule (일정)
export interface Schedule {
  schedule_id: number
  agent_id: string
  customer_id?: number
  customer_name?: string
  title: string
  schedule_date: string
  start_time: string
  end_time?: string
  schedule_type: 'meeting' | 'call' | 'visit' | 'other'
  memo?: string
  is_completed: boolean
  created_at: string
}

// Memo (고객 메모)
export interface Memo {
  memo_id: number
  customer_id: number
  agent_id: string
  content: string
  memo_date: string
  created_at: string
}

// Performance (월간 실적)
export interface Performance {
  performance_id: number
  agent_id: string
  year: number
  month: number
  db_distributed: number    // DB배분 건수
  db_processed: number      // 처리 건수
  contracts_count: number   // 계약 건수
  contracts_amount: number  // 계약 금액
  conversion_rate: number   // 전환율
}

// DB Distribution (DB 배분)
export interface DbDistribution {
  assignment_id: number
  agent_id: string
  customer_id: number
  customer_name: string
  customer_phone: string
  source: string             // 배분 출처
  assigned_at: string
  status: 'unprocessed' | 'processing' | 'completed'
  processed_at?: string
  memo?: string
}

// Disclosure Obligation (알릴의무)
export interface DisclosureObligation {
  obligation_id: number
  customer_id: number
  customer_name: string
  contract_id: number
  insurance_company: string
  obligation_type: string
  due_date: string
  days_remaining: number
  urgency: 'imminent' | 'upcoming' | 'normal'  // 당일/7일/30일
  status: 'pending' | 'completed'
}

// Message (메시지 발송)
export interface Message {
  message_id: number
  agent_id: string
  customer_id?: number
  customer_name?: string
  send_type: 'sms' | 'kakao' | 'push'
  content: string
  image_url?: string
  template_id?: string       // 카카오 알림톡 템플릿
  status: 'sent' | 'failed' | 'pending'
  sent_at: string
}

// Satisfaction Survey (만족도 조사)
export interface SatisfactionSurvey {
  survey_id: number
  agent_id: string
  customer_id: number
  customer_name: string
  rating?: number            // 별점 1-5
  answer?: string
  status: 'sent' | 'responded'
  sent_at: string
  responded_at?: string
}

// Notification (알림)
export interface AgentNotification {
  notification_id: number
  agent_id: string
  title: string
  content: string
  type: 'consultation' | 'claim' | 'schedule' | 'obligation' | 'system'
  is_read: boolean
  created_at: string
}

// Dashboard summary
export interface DashboardSummary {
  today_schedules: number
  pending_consultations: number
  expiring_contracts: number
  unprocessed_db: number
  obligation_alerts: number
  unread_notifications: number
}

// MessageTemplate (카카오 알림톡 템플릿)
export interface MessageTemplate {
  template_id: string
  template_name: string
  content: string
  category: string
}

// Statistics trend
export interface StatisticsTrend {
  month: string
  contracts_count: number
  contracts_amount: number
  conversion_rate: number
}

// API Pagination
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}
