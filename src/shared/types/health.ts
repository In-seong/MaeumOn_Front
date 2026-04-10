// ============ Health (NHIS 건강검진 + HIRA 내진료정보) 타입 ============

/** 동의 상태 */
export interface HealthConsentStatus {
  health_checkup_consented: boolean
  health_checkup_consented_at: string | null
  medical_info_consented: boolean
  medical_info_consented_at: string | null
  last_checkup_sync_at: string | null
  last_medical_info_sync_at: string | null
}

/** 위험지표 평가 결과 (KDCA 기준) */
export interface RiskSummary {
  items: Record<string, 'normal' | 'caution' | 'danger'>
  counts: { normal: number; caution: number; danger: number }
  overall: 'normal' | 'caution' | 'danger'
}

/** 건강검진 결과 (1회차) */
export interface HealthCheckup {
  checkup_id: number
  customer_id: string
  checkup_date: string
  checkup_year: string | null
  checkup_type: string | null
  hospital_name: string | null
  organization_name: string | null
  opinion: string | null
  judgement: string | null

  // 신체계측
  height: string | null
  weight: string | null
  waist: string | null
  bmi: string | null
  sight: string | null
  hearing: string | null

  // 혈압/요/혈색소
  blood_pressure: string | null
  urinary_protein: string | null
  hemoglobin: string | null

  // 혈당/지질
  fasting_blood_sugar: string | null
  total_cholesterol: string | null
  hdl_cholesterol: string | null
  ldl_cholesterol: string | null
  triglyceride: string | null

  // 신장/간
  serum_creatinine: string | null
  gfr: string | null
  ast: string | null
  alt: string | null
  y_gtp: string | null

  tb_chest_disease: string | null
  osteoporosis: string | null

  question_info_json: string | null
  codef_synced: boolean
  synced_at: string | null

  risk_summary?: RiskSummary

  created_at: string
  updated_at: string | null
}

/** 진료내역 (HIRA + manual) */
export interface MedicalRecord {
  record_id: number
  customer_id: string
  treatment_date: string
  hospital_name: string | null
  department: string | null
  diagnosis_code: string | null
  diagnosis_name: string | null
  treatment_type: string | null
  medical_cost: string | null
  visit_days: number | null
  total_amount: string | null
  public_charge: string | null
  deductible_amt: string | null
  hospital_code: string | null
  detail_treat_list_json: string | null
  prescribe_drug_list_json: string | null
  codef_synced: boolean
  synced_at: string | null
  source: 'manual' | 'codef_hira'
  created_at: string
  updated_at: string | null
}

/** 진료내역 요약 */
export interface MedicalInfoSummary {
  total_records: number
  by_disease: Record<string, number>
  by_department: Record<string, number>
}

/** 검진대상 응답 (NHIS) */
export interface HealthExamination {
  resUserNm?: string
  commBirthDate?: string
  resCheckupYear?: string
  resGeneralExam?: string
  resDentalExam?: string
  reshepatitisBTest?: string
  resConfirmTest?: string
  resPublicHealth?: string
  resCancerScreeningList?: Array<{
    resType?: string
    resCancerScreening?: string
    resMedicalExpenses?: string
  }>
}

/** 건강나이/예측 5종 통합 레코드 */
export interface HealthPredictionRow {
  prediction_id: number
  customer_id: string
  prediction_type: 'cardio' | 'stroke' | 'diabetes' | 'kidney' | 'mi' | 'health_age'
  checkup_date: string | null
  risk_grade: string | null
  risk_ratio: string | null
  average_age: string | null
  average_ratio: string | null
  health_age: string | null
  chronological_age: string | null
  change_after_text: string | null
  detail_list_json: string | null
  sub_detail_list_json: string | null
  compare_list_json: string | null
  predicted_at: string | null
  risk_grade_label?: string
  detail_list?: Array<Record<string, unknown>>
  sub_detail_list?: Array<Record<string, unknown>>
  compare_list?: Array<Record<string, unknown>>
  created_at: string
  updated_at: string | null
}

/** 건강 종합 요약 (대시보드) */
export interface HealthSummary {
  consent: {
    health_checkup: boolean
    medical_info: boolean
    health_in_linked: boolean
  }
  sync: {
    last_checkup_sync_at: string | null
    last_medical_info_sync_at: string | null
    last_examination_sync_at: string | null
    last_health_age_sync_at: string | null
    last_prediction_sync_at: string | null
  }
  checkup: {
    latest: HealthCheckup | null
    risk_summary: RiskSummary | null
  }
  predictions: Record<string, HealthPredictionRow>
  medical: {
    count: number
    latest: MedicalRecord[]
  }
}

/** API 공통 응답 */
export interface HealthApiResponse<T = unknown> {
  success: boolean
  code?: string | null
  message?: string
  data?: T
  two_way?: boolean
  extraInfo?: Record<string, unknown>
}

/**
 * NHIS 간편인증 공통 파라미터
 * - identity 필드 대신 birthDate(YYYYMMDD)를 사용 (CODEF 스펙 §loginType="5")
 */
export interface NhisAuthParams {
  loginTypeLevel: string
  userName: string
  birthDate: string   // YYYYMMDD 8자리
  phoneNo: string
  telecom: string     // 0=SKT, 1=KT, 2=LGU+
}

/**
 * HIRA 간편인증 공통 파라미터
 * - identity 필드에 주민등록번호 13자리 (HIRA는 본인확인용 필수)
 */
export interface HiraAuthParams {
  loginTypeLevel: string
  userName: string
  identity: string    // 주민등록번호 13자리
  phoneNo: string
  telecom: string
}

/** 검진결과 요청 파라미터 (NHIS) */
export interface CheckupRequestParams extends NhisAuthParams {
  searchStartYear?: string
  searchEndYear?: string
  type?: '0' | '1' | '2'
}

/** 내진료정보 요청 파라미터 (HIRA) */
export interface MedicalInfoRequestParams extends HiraAuthParams {
  startDate?: string
  endDate?: string
  includeSensitive?: boolean
}

/** 검진대상 요청 파라미터 (NHIS) */
export type ExaminationRequestParams = NhisAuthParams

/** 건강나이 요청 파라미터 (NHIS) */
export interface HealthAgeRequestParams extends NhisAuthParams {
  type?: '0' | '1'
  date?: string
  userId?: string
  userPassword?: string
}

/** 질환예측 요청 파라미터 (NHIS) */
export type PredictionApiRequestParams = HealthAgeRequestParams

/** 배치 예측 조회 결과 항목 */
export interface BatchPredictionItem {
  type: 'health_age' | 'cardio' | 'stroke' | 'diabetes' | 'kidney' | 'mi'
  data?: HealthPredictionRow
  reason?: string
  message?: string
}

/** 배치 예측 조회 결과 */
export interface BatchPredictionResult {
  succeeded: BatchPredictionItem[]
  failed: BatchPredictionItem[]
  succeeded_count: number
  failed_count: number
}
