import api from '@shared/api'
import type {
  ApiResponse,
  PaginatedResponse,
  InsuranceCompany,
  ClaimFormTemplate,
  TemplatePage,
  TemplateField,
  InsuranceClaim,
} from '@shared/types'

// ============ 인증 API ============
export const authApi = {
  login: (email: string, password: string) =>
    api.post<ApiResponse<{ user: any; token: string }>>('/auth/login', { email, password }),

  logout: () =>
    api.post<ApiResponse<null>>('/auth/logout'),

  me: () =>
    api.get<ApiResponse<any>>('/auth/me'),

  register: (data: { name: string; email: string; password: string; password_confirmation: string; phone?: string }) =>
    api.post<ApiResponse<{ user: any; token: string }>>('/auth/register', data),
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

// ============ 양식 템플릿 API ============
export const templateApi = {
  // 공개: 활성화된 양식 목록
  getPublicList: (params?: { insurance_company_id?: number }) =>
    api.get<ApiResponse<ClaimFormTemplate[]>>('/templates', { params }),

  // 공개: 양식 상세
  getPublicDetail: (id: number) =>
    api.get<ApiResponse<ClaimFormTemplate>>(`/templates/${id}`),

  // 관리자: 양식 목록 (페이지네이션)
  getList: (params?: { insurance_company_id?: number; search?: string; is_active?: boolean; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<ClaimFormTemplate>>>('/admin/templates', { params }),

  // 관리자: 양식 상세
  get: (id: number) =>
    api.get<ApiResponse<ClaimFormTemplate>>(`/admin/templates/${id}`),

  // 관리자: 양식 등록
  create: (data: Partial<ClaimFormTemplate>) =>
    api.post<ApiResponse<ClaimFormTemplate>>('/admin/templates', data),

  // 관리자: 양식 등록 (이미지 포함)
  // FormData 전송 시 Content-Type을 설정하지 않아야 axios가 자동으로 boundary를 설정함
  createWithImages: (formData: FormData) =>
    api.post<ApiResponse<ClaimFormTemplate>>('/admin/templates', formData),

  // 관리자: 양식 수정
  update: (id: number, data: Partial<ClaimFormTemplate>) =>
    api.put<ApiResponse<ClaimFormTemplate>>(`/admin/templates/${id}`, data),

  // 관리자: 양식 삭제
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/templates/${id}`),

  // 관리자: 양식 이미지 업로드
  uploadImage: (id: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<ApiResponse<{ template_image_path: string; template_image_url: string; image_width: number; image_height: number }>>(`/admin/templates/${id}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },
}

// ============ 템플릿 페이지 API ============
export const templatePageApi = {
  // 관리자: 페이지 목록
  getList: (templateId: number) =>
    api.get<ApiResponse<TemplatePage[]>>(`/admin/templates/${templateId}/pages`),

  // 관리자: 페이지 추가
  create: (templateId: number, data?: { page_number?: number }) =>
    api.post<ApiResponse<TemplatePage>>(`/admin/templates/${templateId}/pages`, data),

  // 관리자: 페이지 상세
  get: (templateId: number, pageId: number) =>
    api.get<ApiResponse<TemplatePage>>(`/admin/templates/${templateId}/pages/${pageId}`),

  // 관리자: 페이지 수정
  update: (templateId: number, pageId: number, data: Partial<TemplatePage>) =>
    api.put<ApiResponse<TemplatePage>>(`/admin/templates/${templateId}/pages/${pageId}`, data),

  // 관리자: 페이지 삭제
  delete: (templateId: number, pageId: number) =>
    api.delete<ApiResponse<null>>(`/admin/templates/${templateId}/pages/${pageId}`),

  // 관리자: 페이지 이미지 업로드
  uploadImage: (templateId: number, pageId: number, file: File) => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post<ApiResponse<{ page_image_path: string; page_image_url: string; image_width: number; image_height: number }>>(`/admin/templates/${templateId}/pages/${pageId}/upload-image`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    })
  },

  // 관리자: 페이지 순서 변경
  reorder: (templateId: number, pages: Array<{ id: number; page_number: number }>) =>
    api.put<ApiResponse<null>>(`/admin/templates/${templateId}/pages/reorder`, { pages }),
}

// ============ 템플릿 필드 API ============
export const templateFieldApi = {
  // 관리자: 필드 목록
  getList: (templateId: number) =>
    api.get<ApiResponse<TemplateField[]>>(`/admin/templates/${templateId}/fields`),

  // 관리자: 페이지별 필드 목록
  getListByPage: (pageId: number) =>
    api.get<ApiResponse<TemplateField[]>>(`/admin/pages/${pageId}/fields`),

  // 관리자: 필드 추가
  create: (templateId: number, data: Partial<TemplateField>) =>
    api.post<ApiResponse<TemplateField>>(`/admin/templates/${templateId}/fields`, data),

  // 관리자: 페이지에 필드 추가
  createToPage: (pageId: number, data: Partial<TemplateField>) =>
    api.post<ApiResponse<TemplateField>>(`/admin/pages/${pageId}/fields`, data),

  // 관리자: 필드 수정
  update: (id: number, data: Partial<TemplateField>) =>
    api.put<ApiResponse<TemplateField>>(`/admin/fields/${id}`, data),

  // 관리자: 필드 삭제
  delete: (id: number) =>
    api.delete<ApiResponse<null>>(`/admin/fields/${id}`),

  // 관리자: 필드 일괄 업데이트 (좌표 저장)
  bulkUpdate: (templateId: number, fields: Array<{ id: number; x_position: number; y_position: number; width?: number; height?: number; sort_order?: number }>) =>
    api.put<ApiResponse<TemplateField[]>>(`/admin/templates/${templateId}/fields/bulk-update`, { fields }),
}

// ============ 청구 API ============
export const claimApi = {
  // 고객: 내 청구 목록
  getMyList: (params?: { status?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<InsuranceClaim>>>('/claims', { params }),

  // 고객: 청구 생성
  create: (data: { claim_form_template_id: number; fields: Array<{ template_field_id: number; field_value: string }> }) =>
    api.post<ApiResponse<InsuranceClaim>>('/claims', data),

  // 고객: 청구 상세
  get: (id: number) =>
    api.get<ApiResponse<InsuranceClaim>>(`/claims/${id}`),

  // 고객: 이미지 다운로드 URL
  getImageDownloadUrl: (id: number) => `/api/claims/${id}/download/image`,

  // 고객: PDF 다운로드 URL
  getPdfDownloadUrl: (id: number) => `/api/claims/${id}/download/pdf`,

  // 고객: 팩스 발송
  sendFax: (id: number, faxNumber?: string) =>
    api.post<ApiResponse<{ message: string; reference_id?: string }>>(`/claims/${id}/send-fax`, { fax_number: faxNumber }),

  // 관리자: 전체 청구 목록
  getAdminList: (params?: { search?: string; status?: string; insurance_company_id?: number; date_from?: string; date_to?: string; per_page?: number; page?: number }) =>
    api.get<ApiResponse<PaginatedResponse<InsuranceClaim>>>('/admin/claims', { params }),

  // 관리자: 청구 상태 변경
  updateStatus: (id: number, data: { status: string; notes?: string }) =>
    api.put<ApiResponse<InsuranceClaim>>(`/admin/claims/${id}/status`, data),
}
