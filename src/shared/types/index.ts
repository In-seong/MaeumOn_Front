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

// 사용자 타입
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

// 보험사 타입
export interface InsuranceCompany {
  id: number
  name: string
  code: string
  fax_number?: string
  logo_path?: string
  is_active: boolean
  claim_form_templates_count?: number
  created_at: string
  updated_at: string
}

// 청구서 양식 템플릿 타입
export interface ClaimFormTemplate {
  id: number
  insurance_company_id: number
  name: string
  description?: string
  template_image_path?: string
  template_image_url?: string
  image_width?: number
  image_height?: number
  is_active: boolean
  total_pages?: number
  insurance_company?: InsuranceCompany
  template_pages?: TemplatePage[]
  template_fields?: TemplateField[]
  template_fields_count?: number
  created_at: string
  updated_at: string
}

// 템플릿 페이지 타입
export interface TemplatePage {
  id: number
  claim_form_template_id: number
  page_number: number
  page_image_path?: string
  page_image_url?: string
  image_width?: number
  image_height?: number
  template_fields?: TemplateField[]
  created_at: string
  updated_at: string
}

// 템플릿 필드 타입
export interface TemplateField {
  id: number
  claim_form_template_id: number
  template_page_id?: number
  field_name: string
  field_label: string
  field_type: 'text' | 'date' | 'number' | 'resident_number' | 'phone' | 'textarea'
  x_position: number
  y_position: number
  width: number
  height: number
  font_size: number
  font_color: string
  is_required: boolean
  sort_order: number
  placeholder?: string
  default_value?: string
  created_at: string
  updated_at: string
}

// 보험 청구 타입
export interface InsuranceClaim {
  id: number
  user_id: number
  claim_form_template_id: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  status_label?: string
  generated_image_path?: string
  generated_image_url?: string
  generated_pdf_path?: string
  generated_pdf_url?: string
  fax_sent_at?: string
  fax_status?: 'pending' | 'sent' | 'failed'
  fax_status_label?: string
  notes?: string
  user?: User
  claim_form_template?: ClaimFormTemplate
  field_values?: ClaimFieldValue[]
  created_at: string
  updated_at: string
}

// 청구 필드 값 타입
export interface ClaimFieldValue {
  id: number
  insurance_claim_id: number
  template_field_id: number
  field_value: string
  template_field?: TemplateField
  created_at: string
  updated_at: string
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

// 청구 상태 옵션
export const CLAIM_STATUS_OPTIONS = [
  { value: 'pending', label: '대기중', color: 'yellow' },
  { value: 'processing', label: '처리중', color: 'blue' },
  { value: 'completed', label: '완료', color: 'green' },
  { value: 'rejected', label: '거절', color: 'red' },
] as const
