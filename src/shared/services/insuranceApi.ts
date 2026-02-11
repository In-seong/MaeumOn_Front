import api from '@shared/api'
import type {
  ApiResponse,
  PaginatedResponse,
  Account,
  InsuranceCompany,
  ClaimForm,
  FormPage,
  FormField,
  InsuranceClaim,
} from '@shared/types'

// ============ 인증 API (설계사/관리자 - ID/PW) ============
export const authApi = {
  login: (username: string, password: string) =>
    api.post<ApiResponse<{ account: Account; token: string }>>('/auth/login', { username, password }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  me: () =>
    api.get<ApiResponse<Account>>('/auth/me'),
}

// ============ 고객 인증 API (OTP + PIN) ============
export const customerAuthApi = {
  sendOtp: (phone: string) =>
    api.post<ApiResponse<{ debug_otp?: string }>>('/customer-auth/send-otp', { phone }),

  verifyOtp: (phone: string, otp: string) =>
    api.post<ApiResponse<{ is_new: boolean; has_pin: boolean; phone: string; customer_name?: string }>>('/customer-auth/verify-otp', { phone, otp }),

  register: (data: { phone: string; name: string; pin: string; device_uuid: string; device_name?: string }) =>
    api.post<ApiResponse<{ account: Account; token: string; device_token: string }>>('/customer-auth/register', data),

  setPin: (data: { phone: string; pin: string; device_uuid: string; device_name?: string }) =>
    api.post<ApiResponse<{ account: Account; token: string; device_token: string }>>('/customer-auth/set-pin', data),

  loginWithPin: (data: { phone: string; pin: string; device_uuid: string; device_token: string }) =>
    api.post<ApiResponse<{ account: Account; token: string }>>('/customer-auth/login-pin', data),

  loginPinNewDevice: (data: { phone: string; pin: string; device_uuid: string; device_name?: string }) =>
    api.post<ApiResponse<{ account: Account; token: string; device_token: string }>>('/customer-auth/login-pin-new-device', data),

  checkDevice: (data: { device_uuid: string; device_token: string }) =>
    api.post<ApiResponse<{ registered: boolean; has_pin?: boolean; phone?: string; customer_name?: string }>>('/customer-auth/check-device', data),
}

// ============ 보험사 API ============
export const insuranceCompanyApi = {
  // 공개: 활성화된 보험사 목록
  getPublicList: () =>
    api.get<ApiResponse<InsuranceCompany[]>>('/insurance-companies'),

  // 관리자: 보험사 목록 (페이지네이션)
  getList: (params?: { search?: string; is_active?: boolean; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<InsuranceCompany>>>('/admin/insurance-companies', { params }),

  // 관리자: 보험사 상세
  get: (id: number) =>
    api.get<ApiResponse<InsuranceCompany>>(`/admin/insurance-companies/${id}`),

  // 관리자: 보험사 등록
  create: (data: Partial<InsuranceCompany>) =>
    api.post<ApiResponse<InsuranceCompany>>('/admin/insurance-companies', data),

  // 관리자: 보험사 수정
  update: (id: number, data: Partial<InsuranceCompany>) =>
    api.put<ApiResponse<InsuranceCompany>>(`/admin/insurance-companies/${id}`, data),

  // 관리자: 보험사 삭제
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/insurance-companies/${id}`),
}

// ============ 양식 API ============
export const claimFormApi = {
  // 공개: 활성화된 양식 목록
  getPublicList: (params?: { company_id?: number }) =>
    api.get<ApiResponse<ClaimForm[]>>('/claim-forms', { params }),

  // 공개: 양식 상세
  getPublicDetail: (id: number) =>
    api.get<ApiResponse<ClaimForm>>(`/claim-forms/${id}`),

  // 관리자: 양식 목록 (페이지네이션)
  getList: (params?: { company_id?: number; search?: string; is_active?: boolean; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<ClaimForm>>>('/admin/claim-forms', { params }),

  // 관리자: 양식 상세
  get: (id: number) =>
    api.get<ApiResponse<ClaimForm>>(`/admin/claim-forms/${id}`),

  // 관리자: 양식 등록
  create: (data: Partial<ClaimForm>) =>
    api.post<ApiResponse<ClaimForm>>('/admin/claim-forms', data),

  // 관리자: 양식 등록 (이미지 포함)
  createWithImages: (formData: FormData) =>
    api.post<ApiResponse<ClaimForm>>('/admin/claim-forms', formData),

  // 관리자: 양식 수정
  update: (id: number, data: Partial<ClaimForm>) =>
    api.put<ApiResponse<ClaimForm>>(`/admin/claim-forms/${id}`, data),

  // 관리자: 양식 삭제
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/claim-forms/${id}`),

  // 관리자: 양식 이미지 업로드
  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<ApiResponse<{ template_image_path: string; template_image_url: string; image_width: number; image_height: number }>>(`/admin/claim-forms/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============ 양식 페이지 API ============
export const formPageApi = {
  // 관리자: 페이지 목록
  getList: (templateId: number) =>
    api.get<ApiResponse<FormPage[]>>(`/admin/claim-forms/${templateId}/pages`),

  // 관리자: 페이지 추가
  create: (templateId: number, data?: { page_number?: number }) =>
    api.post<ApiResponse<FormPage>>(`/admin/claim-forms/${templateId}/pages`, data),

  // 관리자: 페이지 상세
  get: (templateId: number, pageId: number) =>
    api.get<ApiResponse<FormPage>>(`/admin/claim-forms/${templateId}/pages/${pageId}`),

  // 관리자: 페이지 수정
  update: (templateId: number, pageId: number, data: Partial<FormPage>) =>
    api.put<ApiResponse<FormPage>>(`/admin/claim-forms/${templateId}/pages/${pageId}`, data),

  // 관리자: 페이지 삭제
  delete: (templateId: number, pageId: number) =>
    api.delete<ApiResponse<null>>(`/admin/claim-forms/${templateId}/pages/${pageId}`),

  // 관리자: 페이지 이미지 업로드
  uploadImage: (templateId: number, pageId: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<ApiResponse<{ page_image_path: string; page_image_url: string; image_width: number; image_height: number }>>(`/admin/claim-forms/${templateId}/pages/${pageId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 관리자: 페이지 순서 변경
  reorder: (templateId: number, pages: Array<{ form_page_id: number; page_number: number }>) =>
    api.put<ApiResponse<null>>(`/admin/claim-forms/${templateId}/pages/reorder`, { pages }),
}

// ============ 양식 필드 API ============
export const formFieldApi = {
  // 관리자: 필드 목록
  getList: (templateId: number) =>
    api.get<ApiResponse<FormField[]>>(`/admin/claim-forms/${templateId}/fields`),

  // 관리자: 페이지별 필드 목록
  getListByPage: (pageId: number) =>
    api.get<ApiResponse<FormField[]>>(`/admin/pages/${pageId}/fields`),

  // 관리자: 필드 추가
  create: (templateId: number, data: Partial<FormField>) =>
    api.post<ApiResponse<FormField>>(`/admin/claim-forms/${templateId}/fields`, data),

  // 관리자: 페이지에 필드 추가
  createToPage: (pageId: number, data: Partial<FormField>) =>
    api.post<ApiResponse<FormField>>(`/admin/pages/${pageId}/fields`, data),

  // 관리자: 필드 수정
  update: (id: number, data: Partial<FormField>) =>
    api.put<ApiResponse<FormField>>(`/admin/fields/${id}`, data),

  // 관리자: 필드 삭제
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/fields/${id}`),

  // 관리자: 필드 일괄 업데이트 (좌표 저장)
  bulkUpdate: (templateId: number, fields: Array<{ form_field_id: number; x_position: number; y_position: number; width?: number; height?: number; field_order?: number }>) =>
    api.put<ApiResponse<FormField[]>>(`/admin/claim-forms/${templateId}/fields/bulk-update`, { fields }),
}

// ============ 청구 API ============
export const claimApi = {
  // 고객: 내 청구 목록
  getMyList: (params?: { claim_status?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<InsuranceClaim>>>('/claims', { params }),

  // 고객: 청구 생성 (PDF 생성 포함으로 타임아웃 확장)
  create: (data: { claim_form_id: number; fields: Array<{ form_field_id: number; field_value: string }> }) =>
    api.post<ApiResponse<InsuranceClaim>>('/claims', data, { timeout: 120000 }),

  // 고객: 청구 수정 (PDF 재생성 포함으로 타임아웃 확장)
  update: (id: number, data: { fields: Array<{ form_field_id: number; field_value: string }> }) =>
    api.put<ApiResponse<InsuranceClaim>>(`/claims/${id}`, data, { timeout: 120000 }),

  // 고객: 청구 상세
  get: (id: number) =>
    api.get<ApiResponse<InsuranceClaim>>(`/claims/${id}`),

  // 고객: PDF 다운로드 URL
  getPdfDownloadUrl: (id: number) => `/api/claims/${id}/download/pdf`,

  // 고객: 팩스 발송
  sendFax: (id: number, faxNumber?: string) =>
    api.post<ApiResponse<{ message: string; reference_id?: string }>>(`/claims/${id}/send-fax`, { fax_number: faxNumber }),

  // 관리자: 전체 청구 목록
  getAdminList: (params?: { search?: string; claim_status?: string; company_id?: number; date_from?: string; date_to?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<InsuranceClaim>>>('/admin/claims', { params }),

  // 관리자: 청구 상태 변경
  updateStatus: (id: number, data: { claim_status: string; notes?: string }) =>
    api.put<ApiResponse<InsuranceClaim>>(`/admin/claims/${id}/status`, data),
}
