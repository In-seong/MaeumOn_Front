import { defineStore } from 'pinia'
import { ref } from 'vue'
import { insuranceCompanyApi, templateApi, claimApi } from '@shared/services/insuranceApi'
import type {
  InsuranceCompany,
  ClaimFormTemplate,
  InsuranceClaim,
  PaginatedResponse,
  TemplatePage,
  TemplateField,
} from '@shared/types'

export const useClaimStore = defineStore('userClaim', () => {
  // 보험사 목록
  const insuranceCompanies = ref<InsuranceCompany[]>([])
  const loadingCompanies = ref(false)

  // 양식 목록
  const templates = ref<ClaimFormTemplate[]>([])
  const loadingTemplates = ref(false)

  // 선택된 양식
  const selectedTemplate = ref<ClaimFormTemplate | null>(null)

  // 내 청구 목록
  const myClaims = ref<InsuranceClaim[]>([])
  const claimsPagination = ref<Omit<PaginatedResponse<InsuranceClaim>, 'data'> | null>(null)
  const loadingClaims = ref(false)

  // 현재 청구 상세
  const currentClaim = ref<InsuranceClaim | null>(null)

  // 청구 작성 중인 필드 값
  const fieldValues = ref<Record<number, string>>({})

  // 에러 상태
  const error = ref<string | null>(null)

  // 보험사 목록 조회
  async function fetchInsuranceCompanies(): Promise<void> {
    loadingCompanies.value = true
    error.value = null
    try {
      const response = await insuranceCompanyApi.getPublicList()
      if (response.data.success) {
        insuranceCompanies.value = response.data.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingCompanies.value = false
    }
  }

  // 양식 목록 조회 (보험사별)
  async function fetchTemplates(insuranceCompanyId?: number): Promise<void> {
    loadingTemplates.value = true
    error.value = null
    try {
      const response = await templateApi.getPublicList({
        insurance_company_id: insuranceCompanyId,
      })
      if (response.data.success) {
        templates.value = response.data.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingTemplates.value = false
    }
  }

  // 양식 상세 조회
  async function fetchTemplateDetail(templateId: number): Promise<void> {
    loadingTemplates.value = true
    error.value = null
    try {
      const response = await templateApi.getPublicDetail(templateId)
      if (response.data.success) {
        selectedTemplate.value = response.data.data
        // 필드 값 초기화
        fieldValues.value = {}

        // 다중 페이지인 경우 페이지별 필드에서 초기화
        if (selectedTemplate.value.template_pages && selectedTemplate.value.template_pages.length > 0) {
          selectedTemplate.value.template_pages.forEach((page: TemplatePage) => {
            if (page.template_fields) {
              page.template_fields.forEach((field: TemplateField) => {
                fieldValues.value[field.id] = field.default_value || ''
              })
            }
          })
        }
        // 단일 페이지(레거시)인 경우 직접 필드에서 초기화
        else if (selectedTemplate.value.template_fields) {
          selectedTemplate.value.template_fields.forEach((field: TemplateField) => {
            fieldValues.value[field.id] = field.default_value || ''
          })
        }
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 정보를 불러오는데 실패했습니다.'
    } finally {
      loadingTemplates.value = false
    }
  }

  // 청구 생성
  async function createClaim(): Promise<InsuranceClaim | null> {
    if (!selectedTemplate.value) {
      error.value = '양식이 선택되지 않았습니다.'
      return null
    }

    loadingClaims.value = true
    error.value = null
    try {
      const fields = Object.entries(fieldValues.value).map(([templateFieldId, value]) => ({
        template_field_id: parseInt(templateFieldId),
        field_value: value,
      }))

      const response = await claimApi.create({
        claim_form_template_id: selectedTemplate.value.id,
        fields,
      })

      if (response.data.success) {
        currentClaim.value = response.data.data
        return response.data.data
      }
      return null
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구서 생성에 실패했습니다.'
      return null
    } finally {
      loadingClaims.value = false
    }
  }

  // 내 청구 목록 조회
  async function fetchMyClaims(params?: { status?: string; page?: number; per_page?: number }): Promise<void> {
    loadingClaims.value = true
    error.value = null
    try {
      const response = await claimApi.getMyList(params)
      if (response.data.success) {
        const { data, ...pagination } = response.data.data
        myClaims.value = data
        claimsPagination.value = pagination
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingClaims.value = false
    }
  }

  // 청구 상세 조회
  async function fetchClaimDetail(claimId: number): Promise<void> {
    loadingClaims.value = true
    error.value = null
    try {
      const response = await claimApi.get(claimId)
      if (response.data.success) {
        currentClaim.value = response.data.data
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구 정보를 불러오는데 실패했습니다.'
    } finally {
      loadingClaims.value = false
    }
  }

  // 팩스 발송
  async function sendFax(claimId: number, faxNumber?: string): Promise<boolean> {
    loadingClaims.value = true
    error.value = null
    try {
      const response = await claimApi.sendFax(claimId, faxNumber)
      if (response.data.success) {
        // 청구 상세 다시 조회
        await fetchClaimDetail(claimId)
        return true
      }
      return false
    } catch (e: any) {
      error.value = e.response?.data?.message || '팩스 발송에 실패했습니다.'
      return false
    } finally {
      loadingClaims.value = false
    }
  }

  // 필드 값 설정
  function setFieldValue(fieldId: number, value: string): void {
    fieldValues.value[fieldId] = value
  }

  // 상태 초기화
  function resetClaimForm(): void {
    selectedTemplate.value = null
    fieldValues.value = {}
    currentClaim.value = null
    error.value = null
  }

  return {
    // State
    insuranceCompanies,
    loadingCompanies,
    templates,
    loadingTemplates,
    selectedTemplate,
    myClaims,
    claimsPagination,
    loadingClaims,
    currentClaim,
    fieldValues,
    error,

    // Actions
    fetchInsuranceCompanies,
    fetchTemplates,
    fetchTemplateDetail,
    createClaim,
    fetchMyClaims,
    fetchClaimDetail,
    sendFax,
    setFieldValue,
    resetClaimForm,
  }
})
