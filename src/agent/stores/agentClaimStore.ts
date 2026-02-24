import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentClaim } from '../types'
import type {
  InsuranceCompany, ClaimForm, InsuranceClaim, ClaimDocument,
  FormPage, FormField,
} from '@shared/types'
import {
  fetchClaims, fetchClaim,
  fetchInsuranceCompanies as apiFetchInsuranceCompanies,
  fetchClaimForms as apiFetchClaimForms,
  fetchClaimFormDetail as apiFetchClaimFormDetail,
  createAgentClaim, updateAgentClaim,
  sendAgentClaimFax, uploadAgentClaimDocument, deleteAgentClaimDocument,
} from '../services/agentApi'

export const useAgentClaimStore = defineStore('agentClaim', () => {
  // ===== 목록 조회 상태 =====
  const filterStatus = ref<'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid'>('all')
  const searchQuery = ref('')
  const claims = ref<AgentClaim[]>([])
  const selectedClaim = ref<AgentClaim | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  // ===== 청구 작성 상태 =====
  const insuranceCompanies = ref<InsuranceCompany[]>([])
  const loadingCompanies = ref(false)
  const claimForms = ref<ClaimForm[]>([])
  const loadingClaimForms = ref(false)
  const selectedClaimForm = ref<ClaimForm | null>(null)
  const currentClaim = ref<InsuranceClaim | null>(null)
  const fieldValues = ref<Record<number, string>>({})
  const uploadingDocument = ref(false)

  // ===== Computed =====
  const filteredClaims = computed(() => claims.value)

  const statusCounts = computed(() => ({
    all: total.value,
    pending: claims.value.filter((c) => c.claim_status === 'pending').length,
    processing: claims.value.filter((c) => c.claim_status === 'processing').length,
    approved: claims.value.filter((c) => c.claim_status === 'approved').length,
    rejected: claims.value.filter((c) => c.claim_status === 'rejected').length,
    paid: claims.value.filter((c) => c.claim_status === 'paid').length,
  }))

  // ===== 목록 조회 액션 =====
  async function loadClaims(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      if (filterStatus.value !== 'all') {
        queryParams.claim_status = filterStatus.value
      }
      const res = await fetchClaims(queryParams)
      const paginated = res.data.data
      claims.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadClaim(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchClaim(id)
      selectedClaim.value = res.data.data
      return selectedClaim.value
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구 정보를 불러오는데 실패했습니다.'
      return undefined
    } finally {
      loading.value = false
    }
  }

  function setFilter(status: 'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid') {
    filterStatus.value = status
    currentPage.value = 1
    loadClaims()
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  // ===== 보험사/양식 조회 액션 =====
  async function fetchInsuranceCompanies(): Promise<void> {
    loadingCompanies.value = true
    error.value = null
    try {
      const response = await apiFetchInsuranceCompanies()
      if (response.data.success) {
        insuranceCompanies.value = response.data.data
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '보험사 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingCompanies.value = false
    }
  }

  async function fetchClaimForms(companyId?: number): Promise<void> {
    loadingClaimForms.value = true
    error.value = null
    try {
      const response = await apiFetchClaimForms(
        companyId != null ? { company_id: companyId } : undefined,
      )
      if (response.data.success) {
        claimForms.value = response.data.data
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '양식 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingClaimForms.value = false
    }
  }

  async function fetchClaimFormDetail(claimFormId: number): Promise<void> {
    loadingClaimForms.value = true
    error.value = null
    try {
      const response = await apiFetchClaimFormDetail(claimFormId)
      if (response.data.success) {
        selectedClaimForm.value = response.data.data

        // 필드 값 초기화
        fieldValues.value = {}

        // 다중 페이지인 경우 페이지별 필드에서 초기화
        if (selectedClaimForm.value.form_pages && selectedClaimForm.value.form_pages.length > 0) {
          selectedClaimForm.value.form_pages.forEach((page: FormPage) => {
            if (page.form_fields) {
              page.form_fields.forEach((field: FormField) => {
                if (field.field_type === 'checkbox') {
                  fieldValues.value[field.form_field_id] = field.default_value || '[]'
                } else {
                  fieldValues.value[field.form_field_id] = field.default_value || ''
                }
              })
            }
          })
        }
        // 단일 페이지(레거시)인 경우 직접 필드에서 초기화
        else if (selectedClaimForm.value.form_fields) {
          selectedClaimForm.value.form_fields.forEach((field: FormField) => {
            if (field.field_type === 'checkbox') {
              fieldValues.value[field.form_field_id] = field.default_value || '[]'
            } else {
              fieldValues.value[field.form_field_id] = field.default_value || ''
            }
          })
        }
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '양식 정보를 불러오는데 실패했습니다.'
    } finally {
      loadingClaimForms.value = false
    }
  }

  // ===== 대리 청구 작성/수정 액션 =====
  async function createClaim(customerId?: string): Promise<InsuranceClaim | null> {
    if (!selectedClaimForm.value) {
      error.value = '양식이 선택되지 않았습니다.'
      return null
    }

    loading.value = true
    error.value = null
    try {
      const fields = Object.entries(fieldValues.value).map(([formFieldId, value]) => ({
        form_field_id: parseInt(formFieldId),
        field_value: value,
      }))

      const response = await createAgentClaim({
        ...(customerId ? { customer_id: customerId } : {}),
        claim_form_id: selectedClaimForm.value.claim_form_id,
        fields,
      })

      if (response.data.success) {
        currentClaim.value = response.data.data
        return response.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구서 생성에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateClaim(claimId: number): Promise<InsuranceClaim | null> {
    loading.value = true
    error.value = null
    try {
      const fields = Object.entries(fieldValues.value).map(([formFieldId, value]) => ({
        form_field_id: parseInt(formFieldId),
        field_value: value,
      }))

      const response = await updateAgentClaim(claimId, { fields })

      if (response.data.success) {
        currentClaim.value = response.data.data
        return response.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구서 수정에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  // ===== 팩스 발송 액션 =====
  async function sendFax(claimId: number, faxNumber?: string): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const response = await sendAgentClaimFax(claimId, faxNumber)
      if (response.data.success) {
        // 청구 상세 다시 조회하여 팩스 상태 반영
        await loadClaim(claimId)
        return true
      }
      return false
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '팩스 발송에 실패했습니다.'
      return false
    } finally {
      loading.value = false
    }
  }

  // ===== 첨부파일 액션 =====
  async function uploadDocument(claimId: number, file: File): Promise<ClaimDocument | null> {
    uploadingDocument.value = true
    error.value = null
    try {
      const response = await uploadAgentClaimDocument(claimId, file)
      if (response.data.success) {
        const doc = response.data.data
        // currentClaim의 documents 배열에 추가
        if (currentClaim.value) {
          if (!currentClaim.value.documents) {
            currentClaim.value.documents = []
          }
          currentClaim.value.documents.push(doc)
        }
        return doc
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '파일 업로드에 실패했습니다.'
      return null
    } finally {
      uploadingDocument.value = false
    }
  }

  async function deleteDocument(claimId: number, docId: number): Promise<boolean> {
    error.value = null
    try {
      const response = await deleteAgentClaimDocument(claimId, docId)
      if (response.data.success) {
        // currentClaim의 documents 배열에서 제거
        if (currentClaim.value?.documents) {
          currentClaim.value.documents = currentClaim.value.documents.filter(
            (d) => d.claim_document_id !== docId,
          )
        }
        return true
      }
      return false
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '파일 삭제에 실패했습니다.'
      return false
    }
  }

  // ===== 유틸 함수 =====
  function setFieldValue(fieldId: number, value: string): void {
    fieldValues.value[fieldId] = value
  }

  function resetClaimForm(): void {
    selectedClaimForm.value = null
    fieldValues.value = {}
    currentClaim.value = null
    error.value = null
  }

  return {
    // 목록 조회 상태
    claims,
    selectedClaim,
    filterStatus,
    searchQuery,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    filteredClaims,
    statusCounts,

    // 청구 작성 상태
    insuranceCompanies,
    loadingCompanies,
    claimForms,
    loadingClaimForms,
    selectedClaimForm,
    currentClaim,
    fieldValues,
    uploadingDocument,

    // 목록 조회 액션
    loadClaims,
    loadClaim,
    setFilter,
    setSearchQuery,

    // 보험사/양식 액션
    fetchInsuranceCompanies,
    fetchClaimForms,
    fetchClaimFormDetail,

    // 대리 청구 액션
    createClaim,
    updateClaim,
    sendFax,

    // 첨부파일 액션
    uploadDocument,
    deleteDocument,

    // 유틸
    setFieldValue,
    resetClaimForm,
  }
})
