// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// 계정 타입
export interface Account {
  account_id: number
  username: string
  role: 'CUSTOMER' | 'AGENT' | 'ADMIN'
  is_active: boolean
  last_login_at?: string
  customer?: Customer
}

// 고객 타입
export interface Customer {
  customer_id: string  // char(8)
  account_id: number
  agent_id?: number
  name: string
  resident_number?: string
  gender?: string
  birth_date?: string
  phone?: string
  email?: string
  address?: string
  detailed_address?: string
  job?: string
  is_active: boolean
}

// 인증 관련 타입
export interface LoginRequest {
  username: string
  password: string
}

export interface LoginResponse {
  account: Account
  token: string
}

// 보험사 타입
export interface InsuranceCompany {
  company_id: number
  company_name: string
  company_code: string
  business_number?: string
  representative_name?: string
  address?: string
  contact_phone?: string
  fax_number?: string
  logo_path?: string
  website_url?: string
  is_active: boolean
  claim_forms_count?: number
  claim_forms?: ClaimForm[]
  created_at?: string
  updated_at?: string
}

// 청구서 양식 타입
export interface ClaimForm {
  claim_form_id: number
  company_id: number
  form_name: string
  form_description?: string
  form_version?: string
  is_active: boolean
  template_image_url?: string
  total_pages?: number
  image_width?: number
  image_height?: number
  insurance_company?: InsuranceCompany
  form_pages?: FormPage[]
  form_fields?: FormField[]
  form_fields_count?: number
  created_at?: string
  updated_at?: string
}

// 양식 페이지 타입
export interface FormPage {
  form_page_id: number
  claim_form_id: number
  page_number: number
  page_title?: string
  page_description?: string
  page_image_path?: string
  page_image_url?: string
  image_width?: number
  image_height?: number
  form_fields?: FormField[]
  created_at?: string
  updated_at?: string
}

// 양식 필드 타입
export interface FormField {
  form_field_id: number
  claim_form_id: number
  form_page_id?: number
  field_name: string
  field_label: string
  field_type: 'text' | 'date' | 'number' | 'resident_number' | 'phone' | 'textarea'
  field_order: number
  is_required: boolean
  field_options?: any
  validation_rules?: any
  x_position: number
  y_position: number
  width: number
  height: number
  font_size: number
  font_color: string
  placeholder?: string
  default_value?: string
  created_at?: string
  updated_at?: string
}

// 보험 청구 타입
export interface InsuranceClaim {
  claim_id: number
  customer_id: string
  insurance_id?: number
  company_id?: number
  agent_id?: number
  claim_form_id?: number
  claim_number?: string
  claim_type?: string
  accident_date?: string
  claim_amount?: number
  approved_amount?: number
  claim_status: string
  claim_date?: string
  approval_date?: string
  rejection_reason?: string
  generated_pdf_path?: string
  generated_pdf_url?: string
  generated_image_url?: string
  fax_batch_id?: string
  fax_number_sent?: string
  fax_result_code?: string
  fax_sent_at?: string
  fax_status?: string
  notes?: string
  status_label?: string
  customer?: Customer
  claim_form?: ClaimForm
  insurance_company?: InsuranceCompany
  field_values?: ClaimFieldValue[]
  created_at?: string
  updated_at?: string
}

// 청구 필드 값 타입
export interface ClaimFieldValue {
  claim_field_value_id: number
  claim_id: number
  form_field_id: number
  field_value: string
  form_field?: FormField
  created_at?: string
  updated_at?: string
}

// 보험 계약 타입
export interface InsurancePolicy {
  id: number
  company: string
  name: string
  premium: string
  period: string
  badge?: {
    label: string
    variant: string
  } | null
}

// 병원 타입
export interface Hospital {
  id: number
  name: string
  departments: string
  address: string
  distance: string
  status: string
  statusVariant: string
  tags: string[]
}

// 보장 항목 타입
export interface CoverageItem {
  name: string
  status: string
  variant: string
  percent: number
  detail: string
}

// 앱 알림 타입
export interface AppNotification {
  id: number
  title: string
  message: string
  type: 'insurance' | 'health' | 'consultation' | 'marketing'
  is_read: boolean
  created_at: string
}

// 건강검진 타입
export interface HealthCheckup {
  id: number
  date: string
  provider: string
  overall_result: string
  items: {
    name: string
    detail: string
    status: string
    variant: string
  }[]
}

// 필드 타입 옵션
export const FIELD_TYPE_OPTIONS = [
  { value: 'text', label: '텍스트' },
  { value: 'date', label: '날짜' },
  { value: 'number', label: '숫자' },
  { value: 'resident_number', label: '주민등록번호' },
  { value: 'phone', label: '전화번호' },
  { value: 'textarea', label: '여러 줄 텍스트' },
] as const

// 청구 상태 옵션 (물리설계 기준)
export const CLAIM_STATUS_OPTIONS = [
  { value: 'pending', label: '접수 대기', color: 'yellow' },
  { value: 'processing', label: '처리중', color: 'blue' },
  { value: 'approved', label: '승인', color: 'green' },
  { value: 'rejected', label: '거절', color: 'red' },
  { value: 'paid', label: '지급 완료', color: 'emerald' },
] as const
