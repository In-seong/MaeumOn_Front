// ============ Credit4U (내보험다보여) 타입 정의 ============

/** 내보험다보여 계정 연동 정보 */
export interface Credit4uAccount {
  credit4u_account_id: number
  customer_id: string
  credit4u_login_id: string | null
  registration_status: 'consented' | 'registered' | 'needs_verify' | 'temp_password'
  consent_template_id: number | null
  last_synced_at: string | null
  consent_agreed_at: string | null
  is_active: boolean
  created_at: string
  updated_at: string | null
}

/** 보험 계약 (DB insurance 테이블 확장) */
export interface InsuranceContract {
  insurance_id: number
  customer_id: string
  company_id: number
  policy_number: string
  insurance_type: string | null
  product_name: string | null
  coverage_amount: number | null
  premium_amount: number | null
  payment_period: string | null
  subscription_date: string | null
  expiration_date: string | null
  is_active: boolean
  // CODEF 확장 컬럼
  contract_type: string | null
  contractor_name: string | null
  contract_status: string | null
  company_phone: string | null
  company_homepage: string | null
  payment_cycle: string | null
  start_date: string | null
  end_date: string | null
  insured_person: string | null
  res_number: string | null
  car_name: string | null
  car_number: string | null
  codef_synced: boolean
  synced_at: string | null
  // 관계
  insurance_company?: {
    company_id: number
    company_name: string
    logo_path: string | null
  }
  coverages?: InsuranceCoverage[]
  created_at: string
  updated_at: string | null
}

/** 보장내역 */
export interface InsuranceCoverage {
  coverage_id: number
  insurance_id: number
  insured_person: string | null
  coverage_name: string
  coverage_amount: number | null
  coverage_status: string | null
  agreement_type: string | null
  coverage_type: string | null
  object_info: string | null
  zip_code: string | null
}

/** 실손 지급내역 */
export interface InsurancePaymentHistory {
  payment_id: number
  customer_id: string
  insurance_id: number | null
  company_name: string | null
  policy_number: string | null
  insurance_name: string | null
  res_number: string | null
  occur_date_time: string | null
  total_amount: number | null
  payment_type: string | null
  reason: string | null
  paid_amount: number | null
  payment_date: string | null
  judge_result: string | null
}

/** 분석통계 */
export interface InsuranceStatistic {
  stat_id: number
  customer_id: string
  stat_type: 'flat_rate' | 'actual_loss'
  coverage_name: string
  self_coverage_amt: number | null
  avg_group_coverage_amt: number | null
  self_reg_yn: string | null
  avg_group_reg_rate: string | null
  synced_at: string
}

/** 2-Way 인증 응답 (프론트에 전달되는 부분) */
export interface TwoWayResponse {
  two_way_pending: boolean
  two_way_type: TwoWayType | null
  /** 보안문자 이미지 (base64 또는 URL) */
  secure_no_image?: string
  /** 안내 메시지 */
  message?: string
  /** 추가 데이터 (가입정보 입력 시 등) */
  extra?: Record<string, string>
}

/** 2-Way 인증 단계 식별자 */
export type TwoWayType =
  | 'captcha'          // 보안문자 입력
  | 'sms'              // SMS 인증번호 입력
  | 'pass'             // PASS 간편인증
  | 'email'            // 이메일 인증번호 입력
  | 'register_info'    // 가입정보(ID/PW/이메일) 입력
  | 'temp_password'    // 임시비밀번호 입력
  | 'new_password'     // 변경할 비밀번호 입력

/** 2-Way 확인 요청 */
export interface TwoWayConfirmRequest {
  apiType?: string
  /** 보안문자 입력값 */
  secureNo?: string
  /** SMS 인증번호 */
  smsAuthNo?: string
  /** PASS 인증 완료 신호 */
  simpleAuth?: string
  /** 이메일 인증번호 */
  emailAuthNo?: string
  /** 가입 아이디 */
  id?: string
  /** 가입/변경 비밀번호 */
  password?: string
  /** 가입 이메일 */
  email?: string
  /** 임시비밀번호 */
  password1?: string
}

/** 동의 요청 */
export interface ConsentRequest {
  consent_template_id?: number
}

/** 가입여부 확인 요청 */
export interface CheckRegistrationRequest {
  id: string
  password: string
  inquiryType?: '0' | '4'
}

/** 회원가입 요청 */
export interface RegisterRequest {
  userName: string
  identity: string
  birthDate?: string
  telecom: string
  phoneNo: string
  type?: '0' | '1'
  id?: string
  password?: string
  email?: string
}

/** 계약조회 요청 */
export interface FetchContractsRequest {
  id: string
  password: string
  /** status=2 일 때 추가 파라미터 */
  userName?: string
  identity?: string
  birthDate?: string
  phoneNo?: string
  telecom?: string
}

/** 아이디 찾기 요청 */
export interface FindIdRequest {
  userName: string
  identity: string
  birthDate?: string
  telecom: string
  phoneNo: string
}

/** 비밀번호 변경 요청 */
export interface ChangePasswordRequest {
  id: string
  password?: string
  userName: string
  identity: string
  telecom: string
  phoneNo: string
  type?: '0' | '1'
}

/** Credit4U API 공통 응답 */
export interface Credit4uApiResponse<T = unknown> {
  success: boolean
  data: T
  message?: string
  /** 2-Way 인증 정보 (CF-03002 시) */
  two_way?: TwoWayResponse
  /** CODEF 에러 코드 */
  codef_code?: string
}

/** CODEF 에러 코드 → 사용자 메시지 매핑 */
export const CODEF_ERROR_MESSAGES: Record<string, string> = {
  'CF-00025': '내보험다보여 미가입 회원입니다. 회원가입을 진행해주세요.',
  'CF-03002': '추가 인증이 필요합니다.',
  'CF-12801': '보안문자 입력 횟수를 초과했습니다.',
  'CF-13300': '아이디가 일치하지 않습니다. 확인 후 다시 입력해주세요.',
  'CF-13301': '비밀번호가 일치하지 않습니다. 확인 후 다시 입력해주세요.',
  'CF-13302': '로그인 5회 실패로 비밀번호 변경이 필요합니다.',
  'CF-13303': '임시 비밀번호 상태입니다. 비밀번호를 변경해주세요.',
  'CF-13304': '휴면 계정입니다. 내보험다보여 사이트에서 휴면 해제 후 이용해주세요.',
  'CF-13305': '탈퇴된 계정입니다.',
  'CF-12824': '아이디를 확인해주세요. (6~12자, 영문+숫자)',
  'CF-12825': '아이디 형식이 올바르지 않습니다. 영문+숫자만 입력 가능합니다.',
  'CF-12826': '비밀번호를 확인해주세요. (9~20자)',
  'CF-12827': '비밀번호 형식이 올바르지 않습니다. 영문+숫자+특수문자를 포함해주세요.',
  'CF-13349': '이미 등록된 아이디입니다.',
  'CF-13341': '이미 등록된 이메일입니다.',
  'CF-13342': '이메일 형식을 확인해주세요.',
  'CF-13343': '허용되지 않는 이메일 도메인입니다.',
  'CF-12803': '임시 비밀번호가 일치하지 않습니다.',
  'CF-12001': '인증 시간이 초과되었습니다. 다시 시도해주세요.',
}

/** CODEF 에러 코드에 대한 사용자 친화적 메시지 반환 */
export function getCodefErrorMessage(code: string | undefined, fallback?: string): string {
  if (!code) return fallback || '알 수 없는 오류가 발생했습니다.'
  return CODEF_ERROR_MESSAGES[code] || fallback || `오류가 발생했습니다. (${code})`
}
