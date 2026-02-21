// ===== Agent Domain Types =====
// Aligned with backend models (2026-02-21)

// ===== API Response Wrappers =====
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

export interface LaravelPagination<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
  from: number | null
  to: number | null
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// ===== Agent (설계사) =====
export interface Agent {
  agent_id: string           // CHAR(8)
  account_id: number
  name: string
  phone: string
  email: string
  affiliation: string        // 소속
  position: string           // 직급
  specialization?: string
  license_number: string
  profile_image_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

// ===== Customer (고객) =====
export interface Customer {
  customer_id: string        // CHAR(8) - string PK
  agent_id: string
  account_id?: number
  name: string
  phone: string
  email?: string
  resident_number?: string
  gender?: 'M' | 'F' | 'OTHER'
  birth_date?: string
  address?: string
  detailed_address?: string
  job?: string               // 직업
  acquisition_channel?: string // 고객정보취득경로
  is_active: boolean
  created_at: string
  updated_at: string
  // Eager loaded relations (from show endpoint)
  contracts?: Contract[]
  insurance_claims?: InsuranceClaim[]
  memos?: Memo[]
}

// ===== Contract (보험 계약) =====
export interface Contract {
  contract_id: number
  customer_id: string
  agent_id: string
  company_id?: number        // FK to insurance_company
  contract_number?: string
  insurance_product?: string // 보험상품명
  contract_amount?: string   // decimal
  contract_date?: string
  contract_status?: string
  customer_name?: string
  customer_phone?: string
  payment_method?: string
  notes?: string
  created_at: string
  updated_at: string
  // Eager loaded
  insurance_company?: { company_id: number; company_name: string }
}

// ===== Consultation (상담요청) =====
export interface Consultation {
  consultation_id: number
  customer_id: string
  assignee_id: string
  assignee_type: string
  consultation_type: string
  title?: string
  content: string
  customer_name?: string
  customer_phone?: string
  birth_date?: string
  region?: string
  status: 'pending' | 'in_progress' | 'completed'
  answer?: string
  answered_at?: string
  satisfaction_rating?: number
  created_at: string
  updated_at: string
  // Eager loaded
  customer?: { customer_id: string; name: string; phone: string }
}

// ===== InsuranceClaim (보험금 청구) - used in Agent view =====
export interface InsuranceClaim {
  claim_id: number
  customer_id: string
  insurance_id?: number
  company_id?: number
  agent_id?: string
  claim_form_id?: number
  claim_number?: string
  claim_type: string
  accident_date?: string
  claim_amount?: string
  approved_amount?: string
  claim_status: string
  claim_date?: string
  approval_date?: string
  rejection_reason?: string
  generated_pdf_path?: string
  generated_pdf_url?: string
  fax_sent_at?: string
  fax_status?: string
  notes?: string
  created_at: string
  updated_at: string
  // Eager loaded
  customer?: { customer_id: string; name: string; phone: string }
  claim_form?: {
    claim_form_id: number
    form_name: string
    company_id: number
    insurance_company?: { company_id: number; company_name: string }
  }
}

// Agent view alias
export type AgentClaim = InsuranceClaim

// ===== Memo (고객 메모) =====
export interface Memo {
  memo_id: number
  customer_id: string
  author_id: string
  author_type: string
  title?: string
  content: string
  memo_date: string
  created_at: string
  updated_at: string
}

// ===== Message (메시지 발송) =====
export interface Message {
  message_id: number
  receiver_id: string
  receiver_type: string
  sender_id: string
  sender_type: string
  message_type: string
  title?: string
  content: string
  image_url?: string
  send_method: 'SMS' | 'KAKAO' | 'PUSH'
  send_status: string
  scheduled_at?: string
  sent_at?: string
  created_at?: string
}

// ===== Notification (알림) =====
export interface AgentNotification {
  notification_id: number
  receiver_id: string
  receiver_type: string
  sender_id?: string
  sender_type?: string
  notification_type: string
  title: string
  content: string
  is_read: boolean
  read_at?: string
  sent_at?: string
  created_at?: string
}

// ===== DisclosureObligation (알릴의무) =====
export interface DisclosureObligation {
  obligation_id: number
  customer_id: string
  medical_record_id?: number
  obligation_start_date?: string
  obligation_end_date?: string
  obligation_status: string
  is_notified: boolean
  notification_date?: string
  notes?: string
  created_at: string
  updated_at: string
  // Eager loaded
  customer?: Customer
  medical_record?: MedicalRecord
}

export interface MedicalRecord {
  record_id: number
  customer_id: string
  hospital_name?: string
  diagnosis?: string
  treatment_date?: string
  [key: string]: unknown
}

// ===== SatisfactionSurvey (만족도 조사) =====
export interface SatisfactionSurvey {
  survey_id: number
  agent_id: string
  customer_id: string
  survey_title?: string
  survey_content?: string
  rating?: number
  feedback?: string
  survey_status: 'sent' | 'responded'
  sent_at?: string
  responded_at?: string
  created_at: string
  updated_at: string
  // Eager loaded
  customer?: { customer_id: string; name: string; phone: string }
}

// ===== CustomerAssignment (DB 배분) =====
export interface DbDistribution {
  assignment_id: number
  customer_id: string
  agent_id: string
  admin_id?: number
  assignment_type?: string
  assignment_reason?: string
  customer_info?: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
  processed_at?: string
  is_converted?: boolean
  contract_date?: string
  contract_amount?: string
  created_at: string
  updated_at: string
  // Eager loaded
  customer?: { customer_id: string; name: string; phone: string }
}

// ===== Dashboard Summary =====
export interface DashboardSummary {
  total_customers: number
  pending_consultations: number
  unread_notifications: number
  recent_assignments: number
  upcoming_obligations: number
}

// ===== Schedule (일정) - Backend 미구현, Mock 유지 =====
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

// ===== Performance (월간 실적) - Backend 미구현, Mock 유지 =====
export interface Performance {
  performance_id: number
  agent_id: string
  year: number
  month: number
  db_distributed: number
  db_processed: number
  contracts_count: number
  contracts_amount: number
  conversion_rate: number
}

// ===== Statistics trend - Backend 미구현, Mock 유지 =====
export interface StatisticsTrend {
  month: string
  contracts_count: number
  contracts_amount: number
  conversion_rate: number
}

// ===== MessageTemplate (카카오 알림톡 템플릿) - Backend 미구현, 로컬 유지 =====
export interface MessageTemplate {
  template_id: string
  template_name: string
  content: string
  category: string
}
