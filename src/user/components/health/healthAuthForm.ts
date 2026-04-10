export interface HealthAuthFormValue {
  userName: string
  birthDate: string  // YYYYMMDD (하이픈 허용 입력)
  phoneNo: string
  telecom: string
  rrn: string  // 주민등록번호 13자리 (HIRA에서만 필요)
}

export const EMPTY_AUTH_FORM: HealthAuthFormValue = {
  userName: '',
  birthDate: '',
  phoneNo: '',
  telecom: '',
  rrn: '',
}

// CODEF telecom 코드 (PDF 가이드 기준)
// 0=SKT(알뜰폰 포함), 1=KT(알뜰폰 포함), 2=LG U+(알뜰폰 포함)
export const TELECOM_OPTIONS = [
  { value: '0', label: 'SKT (SKT 알뜰폰 포함)' },
  { value: '1', label: 'KT (KT 알뜰폰 포함)' },
  { value: '2', label: 'LG U+ (LG U+ 알뜰폰 포함)' },
] as const

/** NHIS API용 폼 유효성 (주민번호 불필요) */
export function isNhisFormValid(form: HealthAuthFormValue): boolean {
  if (!form.userName.trim()) return false
  if (!form.telecom) return false

  const birth = form.birthDate.replace(/\D/g, '')
  if (birth.length !== 8) return false

  const phone = form.phoneNo.replace(/\D/g, '')
  if (phone.length < 10) return false

  return true
}

/** HIRA API용 폼 유효성 (주민번호 13자리 필수) */
export function isHiraFormValid(form: HealthAuthFormValue): boolean {
  if (!isNhisFormValid(form)) return false

  const rrn = form.rrn.replace(/\D/g, '')
  if (rrn.length !== 13) return false

  // 주민번호 체크섬 검증
  const weights = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5]
  let sum = 0
  for (let i = 0; i < 12; i++) {
    sum += parseInt(rrn[i]!, 10) * weights[i]!
  }
  const checkDigit = (11 - (sum % 11)) % 10
  return checkDigit === parseInt(rrn[12]!, 10)
}

/** NHIS API 전송 payload (identity에 생년월일 매핑) */
export function toNhisPayload(form: HealthAuthFormValue) {
  return {
    userName: form.userName.trim(),
    birthDate: form.birthDate.replace(/\D/g, ''),  // YYYYMMDD
    phoneNo: form.phoneNo.replace(/\D/g, ''),
    telecom: form.telecom,
  }
}

/** HIRA API 전송 payload (identity에 주민번호 13자리) */
export function toHiraPayload(form: HealthAuthFormValue) {
  return {
    userName: form.userName.trim(),
    identity: form.rrn.replace(/\D/g, ''),  // 주민번호 13자리
    phoneNo: form.phoneNo.replace(/\D/g, ''),
    telecom: form.telecom,
  }
}
