import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { BatchClaim, Customer } from '../types'
import type {
  InsuranceCompany, ClaimForm, FormPage, FormField,
} from '@shared/types'
import {
  fetchBatchClaims, fetchBatchClaim,
  createBatchClaim, saveBatchDraft, updateBatchDraft,
  submitBatchDraft, deleteBatchDraft, sendBatchFax,
  fetchInsuranceCompanies as apiFetchInsuranceCompanies,
  fetchClaimForms as apiFetchClaimForms,
  fetchClaimFormDetail as apiFetchClaimFormDetail,
  fetchCustomers as apiFetchCustomers,
} from '../services/agentApi'

// ===== 자동 매핑 상수 =====

/** standard_field_code → Customer 컬럼명 매핑 (config/standard_fields.php 기반) */
const CUSTOMER_FIELD_MAP: Record<string, string> = {
  // 계약자
  CONTRACTOR_NAME: 'name',
  CONTRACTOR_RRN: 'resident_number',
  CONTRACTOR_RRN_FRONT: 'resident_number_front',
  CONTRACTOR_RRN_BACK: 'resident_number_back',
  CONTRACTOR_PHONE: 'phone',
  CONTRACTOR_ADDRESS: 'address',
  CONTRACTOR_EMAIL: 'email',
  // 피보험자
  INSURED_NAME: 'name',
  INSURED_RRN: 'resident_number',
  INSURED_RRN_FRONT: 'resident_number_front',
  INSURED_RRN_BACK: 'resident_number_back',
  INSURED_PHONE: 'phone',
  INSURED_ADDRESS: 'address',
  INSURED_EMAIL: 'email',
  // 수익자(수령인)
  BENEFICIARY_NAME: 'name',
  BENEFICIARY_RRN: 'resident_number',
  BENEFICIARY_RRN_FRONT: 'resident_number_front',
  BENEFICIARY_RRN_BACK: 'resident_number_back',
  BENEFICIARY_PHONE: 'phone',
  BENEFICIARY_ADDRESS: 'address',
  BENEFICIARY_EMAIL: 'email',
}

/** 자동 복사 제외 필드 타입 (법적 요건상 양식마다 개별 필요) */
const COPY_EXCLUDED_TYPES = new Set(['signature', 'consent'])

/** 자동 복사 제외 표준 필드 코드 (청구서마다 선택지가 달라 개별 입력 필요) */
const COPY_EXCLUDED_CODES = new Set(['ACCIDENT_TYPE', 'ACCIDENT_DETAIL_TYPE'])

/** 첨부파일 로컬 참조 */
export interface LocalAttachment {
  id: string
  file: File
  name: string
  size: number
}

/** 보험사별 양식 입력 정보 */
export interface CompanyFormEntry {
  company: InsuranceCompany
  claimForm: ClaimForm | null
  availableForms: ClaimForm[]
  fieldValues: Record<number, string>           // form_field_id → value
  autoFilledFieldIds: Record<number, boolean>   // form_field_id → true if auto-filled
  loadingForm: boolean
}

export const useAgentBatchClaimStore = defineStore('agentBatchClaim', () => {
  // ===== 목록 조회 상태 =====
  const batchClaims = ref<BatchClaim[]>([])
  const selectedBatch = ref<BatchClaim | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)
  const filterStatus = ref<'all' | 'draft' | 'pending' | 'processing' | 'completed' | 'partial_failed'>('all')

  // ===== 임시저장 목록 =====
  const batchDrafts = ref<BatchClaim[]>([])
  const loadingDrafts = ref(false)

  // ===== 다중 청구 작성 상태 =====
  // Step 1: 고객 선택
  const selectedCustomer = ref<Customer | null>(null)
  const customerSearchResults = ref<Customer[]>([])
  const loadingCustomers = ref(false)

  // Step 2: 보험사 & 양식 선택
  const insuranceCompanies = ref<InsuranceCompany[]>([])
  const loadingCompanies = ref(false)
  const selectedEntries = ref<CompanyFormEntry[]>([])

  // Step 3: 양식별 필드 입력
  const activeTabIndex = ref(0)

  // Step 4: 첨부파일
  const commonDocuments = ref<LocalAttachment[]>([])
  const perClaimDocuments = ref<Record<number, LocalAttachment[]>>({}) // entryIndex → attachments

  // 현재 작성 중 배치 (draft 편집 시)
  const currentBatch = ref<BatchClaim | null>(null)

  // ===== Computed =====
  const activeEntry = computed<CompanyFormEntry | undefined>(() =>
    selectedEntries.value[activeTabIndex.value],
  )

  const allFormsLoaded = computed(() =>
    selectedEntries.value.length > 0 &&
    selectedEntries.value.every((e) => e.claimForm !== null && !e.loadingForm),
  )

  // ===== 목록 조회 액션 =====
  async function loadBatchClaims(params?: Record<string, unknown>): Promise<void> {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      if (filterStatus.value !== 'all') {
        queryParams.batch_status = filterStatus.value
      }
      const res = await fetchBatchClaims(queryParams)
      const paginated = res.data.data
      batchClaims.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '배치 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadBatchClaim(id: number): Promise<BatchClaim | undefined> {
    loading.value = true
    error.value = null
    try {
      const res = await fetchBatchClaim(id)
      selectedBatch.value = res.data.data
      return selectedBatch.value
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '배치 정보를 불러오는데 실패했습니다.'
      return undefined
    } finally {
      loading.value = false
    }
  }

  async function loadBatchDrafts(): Promise<void> {
    loadingDrafts.value = true
    try {
      const res = await fetchBatchClaims({ batch_status: 'draft', per_page: 50 })
      batchDrafts.value = res.data.data.data
    } catch {
      batchDrafts.value = []
    } finally {
      loadingDrafts.value = false
    }
  }

  function setFilter(status: typeof filterStatus.value): void {
    filterStatus.value = status
    currentPage.value = 1
    loadBatchClaims()
  }

  // ===== 고객 검색 =====
  async function searchCustomers(query: string): Promise<void> {
    loadingCustomers.value = true
    try {
      const params: Record<string, unknown> = { per_page: 20 }
      if (query.trim()) params.search = query
      const res = await apiFetchCustomers(params)
      customerSearchResults.value = res.data.data.data
    } catch {
      customerSearchResults.value = []
    } finally {
      loadingCustomers.value = false
    }
  }

  function selectCustomer(customer: Customer): void {
    selectedCustomer.value = customer
    // 1차 자동 채움: customer_field 매핑
    autoFillFromCustomer()
  }

  // ===== 자동 매핑 =====

  /** 양식의 모든 필드를 평탄화하여 반환 */
  function getFormFields(form: ClaimForm): FormField[] {
    const fields: FormField[] = []
    if (form.form_pages && form.form_pages.length > 0) {
      for (const page of form.form_pages) {
        if (page.form_fields) {
          fields.push(...page.form_fields)
        }
      }
    } else if (form.form_fields) {
      fields.push(...form.form_fields)
    }
    return fields
  }

  /** 1차 채움: 고객 선택 시 customer_field 기반 자동 채움 */
  function autoFillFromCustomer(): void {
    const customer = selectedCustomer.value
    if (!customer) return

    for (const entry of selectedEntries.value) {
      if (!entry.claimForm) continue
      const fields = getFormFields(entry.claimForm)
      for (const field of fields) {
        if (!field.standard_field_code) continue
        const customerKey = CUSTOMER_FIELD_MAP[field.standard_field_code]
        if (!customerKey) continue
        let val: string | undefined
        // 주민번호 앞/뒤 분리 가상 키 처리
        if (customerKey === 'resident_number_front') {
          const rrn = customer.resident_number || ''
          val = rrn.replace(/-/g, '').slice(0, 6) || undefined
        } else if (customerKey === 'resident_number_back') {
          const rrn = customer.resident_number || ''
          const raw = rrn.replace(/-/g, '')
          val = raw.length > 6 ? raw.slice(6, 13) : undefined
        } else {
          const raw = (customer as Record<string, unknown>)[customerKey]
          val = raw && typeof raw === 'string' ? raw : undefined
        }
        if (val) {
          entry.fieldValues[field.form_field_id] = val
          entry.autoFilledFieldIds[field.form_field_id] = true
        }
      }
    }
  }

  /**
   * 주민번호 코드 간 크로스 매핑을 생성합니다.
   * 예: CONTRACTOR_RRN(통합) ↔ CONTRACTOR_RRN_FRONT + CONTRACTOR_RRN_BACK(분리)
   * 전화번호도 같은 접두어 기반으로 매핑합니다.
   */
  function buildCrossCodeValues(codeValues: Record<string, string>): Record<string, string> {
    const result = { ...codeValues }
    const prefixes = ['CONTRACTOR', 'INSURED', 'BENEFICIARY']

    for (const prefix of prefixes) {
      const rrnCode = `${prefix}_RRN`
      const frontCode = `${prefix}_RRN_FRONT`
      const backCode = `${prefix}_RRN_BACK`

      // 통합(RRN) → 분리(FRONT + BACK) 변환
      if (result[rrnCode] && (!result[frontCode] || !result[backCode])) {
        const digits = result[rrnCode].replace(/\D/g, '')
        if (digits.length >= 6) {
          result[frontCode] = result[frontCode] || digits.slice(0, 6)
          result[backCode] = result[backCode] || (digits.length > 6 ? digits.slice(6, 13) : '')
        }
      }

      // 분리(FRONT + BACK) → 통합(RRN) 변환
      if (!result[rrnCode] && result[frontCode]) {
        const front = result[frontCode].replace(/\D/g, '')
        const back = (result[backCode] || '').replace(/\D/g, '')
        if (back) {
          result[rrnCode] = `${front}-${back}`
        }
      }
    }

    return result
  }

  /** 2차 채움: 탭 전환 시 standard_field_code 기반 자동 복사 (첫 번째 양식 → 대상 양식) */
  function autoCopyStandardFields(targetEntryIndex: number): void {
    if (selectedEntries.value.length < 2) return
    if (targetEntryIndex === 0) return // 첫 번째 탭에서는 복사 안 함

    const first = selectedEntries.value[0]
    if (!first || !first.claimForm) return

    const target = selectedEntries.value[targetEntryIndex]
    if (!target || !target.claimForm) return

    // 첫 번째 엔트리의 standard_field_code → value 맵 구축
    const firstFields = getFormFields(first.claimForm)
    const rawCodeValues: Record<string, string> = {}
    for (const field of firstFields) {
      if (!field.standard_field_code) continue
      if (COPY_EXCLUDED_TYPES.has(field.field_type)) continue
      if (COPY_EXCLUDED_CODES.has(field.standard_field_code)) continue
      const val = first.fieldValues[field.form_field_id]
      if (val) rawCodeValues[field.standard_field_code] = val
    }

    // 크로스 매핑 (통합 ↔ 분리 주민번호 변환)
    const codeValues = buildCrossCodeValues(rawCodeValues)

    // 타겟 엔트리에 복사
    const targetFields = getFormFields(target.claimForm)
    for (const field of targetFields) {
      if (!field.standard_field_code) continue
      if (COPY_EXCLUDED_TYPES.has(field.field_type)) continue
      if (COPY_EXCLUDED_CODES.has(field.standard_field_code)) continue
      const srcVal = codeValues[field.standard_field_code]
      if (!srcVal) continue
      // 사용자가 직접 수정한 값이 있으면 덮어쓰지 않음
      const currentVal = target.fieldValues[field.form_field_id]
      if (currentVal && !target.autoFilledFieldIds[field.form_field_id]) continue
      target.fieldValues[field.form_field_id] = srcVal
      target.autoFilledFieldIds[field.form_field_id] = true
    }
  }

  /** 특정 스텝의 필드를 고객 정보로 자동 채움 */
  function autoFillStepFromCustomer(entryIndex: number, stepFields: FormField[], fill: boolean): void {
    const customer = selectedCustomer.value
    const entry = selectedEntries.value[entryIndex]
    if (!entry) return

    for (const field of stepFields) {
      if (!field.standard_field_code) continue
      const customerKey = CUSTOMER_FIELD_MAP[field.standard_field_code]
      if (!customerKey) continue

      if (fill && customer) {
        let val: string | undefined
        if (customerKey === 'resident_number_front') {
          const rrn = customer.resident_number || ''
          val = rrn.replace(/-/g, '').slice(0, 6) || undefined
        } else if (customerKey === 'resident_number_back') {
          const rrn = customer.resident_number || ''
          const raw = rrn.replace(/-/g, '')
          val = raw.length > 6 ? raw.slice(6, 13) : undefined
        } else if (customerKey === 'resident_number') {
          const rrn = customer.resident_number || ''
          const digits = rrn.replace(/\D/g, '')
          val = digits.length === 13 ? `${digits.slice(0, 6)}-${digits.slice(6)}` : rrn || undefined
        } else if (customerKey === 'phone') {
          const p = customer.phone || ''
          if (/^\d{10,11}$/.test(p)) {
            val = p.length === 11
              ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`
              : `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`
          } else {
            val = p || undefined
          }
        } else {
          const raw = (customer as Record<string, unknown>)[customerKey]
          val = raw && typeof raw === 'string' ? raw : undefined
        }
        if (val) {
          entry.fieldValues[field.form_field_id] = val
          entry.autoFilledFieldIds[field.form_field_id] = true
        }
      } else {
        // 체크 해제: 자동 채움된 값만 비움
        if (entry.autoFilledFieldIds[field.form_field_id]) {
          entry.fieldValues[field.form_field_id] = ''
          delete entry.autoFilledFieldIds[field.form_field_id]
        }
      }
    }
  }

  /** 필드가 자동 채움된 상태인지 확인 */
  function isFieldAutoFilled(entryIndex: number, fieldId: number): boolean {
    const entry = selectedEntries.value[entryIndex]
    return entry ? !!entry.autoFilledFieldIds[fieldId] : false
  }

  // ===== 보험사 & 양식 =====
  async function loadInsuranceCompanies(): Promise<void> {
    loadingCompanies.value = true
    error.value = null
    try {
      const res = await apiFetchInsuranceCompanies()
      if (res.data.success) {
        insuranceCompanies.value = res.data.data
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '보험사 목록을 불러오는데 실패했습니다.'
    } finally {
      loadingCompanies.value = false
    }
  }

  /** 보험사 토글 (체크/해제) */
  function toggleCompany(company: InsuranceCompany): void {
    const idx = selectedEntries.value.findIndex((e) => e.company.company_id === company.company_id)
    if (idx >= 0) {
      selectedEntries.value.splice(idx, 1)
      // 탭 인덱스 보정
      if (activeTabIndex.value >= selectedEntries.value.length) {
        activeTabIndex.value = Math.max(0, selectedEntries.value.length - 1)
      }
    } else {
      if (selectedEntries.value.length >= 5) {
        error.value = '최대 5개 보험사까지 선택 가능합니다.'
        return
      }
      selectedEntries.value.push({
        company,
        claimForm: null,
        availableForms: [],
        fieldValues: {},
        autoFilledFieldIds: {},
        loadingForm: false,
      })
      // 해당 보험사의 양식 목록 로드
      loadFormsForCompany(company.company_id)
    }
  }

  function isCompanySelected(companyId: number): boolean {
    return selectedEntries.value.some((e) => e.company.company_id === companyId)
  }

  /** 특정 보험사의 양식 목록 로드 */
  async function loadFormsForCompany(companyId: number): Promise<void> {
    const entry = selectedEntries.value.find((e) => e.company.company_id === companyId)
    if (!entry) return

    entry.loadingForm = true
    try {
      const res = await apiFetchClaimForms({ company_id: companyId })
      if (res.data.success) {
        entry.availableForms = res.data.data
        // 양식이 1개면 자동 선택
        if (entry.availableForms.length === 1) {
          const form = entry.availableForms[0]
          if (form) {
            await selectFormForEntry(entry, form.claim_form_id)
          }
        }
      }
    } catch {
      entry.availableForms = []
    } finally {
      entry.loadingForm = false
    }
  }

  /** 특정 엔트리에 양식 선택 → 상세 로드 + 필드 초기화 */
  async function selectFormForEntry(entry: CompanyFormEntry, claimFormId: number): Promise<void> {
    entry.loadingForm = true
    try {
      const res = await apiFetchClaimFormDetail(claimFormId)
      if (res.data.success) {
        entry.claimForm = res.data.data
        // 필드 초기값 설정
        entry.fieldValues = {}
        entry.autoFilledFieldIds = {}
        const form = entry.claimForm
        if (form.form_pages && form.form_pages.length > 0) {
          form.form_pages.forEach((page: FormPage) => {
            if (page.form_fields) {
              page.form_fields.forEach((field: FormField) => {
                entry.fieldValues[field.form_field_id] =
                  field.field_type === 'checkbox'
                    ? (field.default_value || '[]')
                    : (field.default_value || '')
              })
            }
          })
        } else if (form.form_fields) {
          form.form_fields.forEach((field: FormField) => {
            entry.fieldValues[field.form_field_id] =
              field.field_type === 'checkbox'
                ? (field.default_value || '[]')
                : (field.default_value || '')
          })
        }
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '양식 정보를 불러오는데 실패했습니다.'
    } finally {
      entry.loadingForm = false
    }
  }

  // ===== 필드 값 관리 =====
  function setFieldValue(entryIndex: number, fieldId: number, value: string): void {
    const entry = selectedEntries.value[entryIndex]
    if (entry) {
      entry.fieldValues[fieldId] = value
      // 사용자가 직접 수정 시 자동 채움 플래그 해제
      delete entry.autoFilledFieldIds[fieldId]
    }
  }

  function setActiveFieldValue(fieldId: number, value: string): void {
    setFieldValue(activeTabIndex.value, fieldId, value)
  }

  // ===== 배치 생성/제출 =====
  function buildClaimsPayload(): Array<{
    claim_form_id: number
    fields: Array<{ form_field_id: number; field_value: string }>
  }> {
    return selectedEntries.value
      .filter((e) => e.claimForm !== null)
      .map((e) => {
        const fields = Object.entries(e.fieldValues).map(([id, val]) => ({
          form_field_id: parseInt(id),
          field_value: val,
        }))

        // consent 필드 자동 동의 처리 (설계사 대리 청구 - 화면에서 별도 입력 없이 일괄 동의)
        const form = e.claimForm!
        const allFormFields: Array<{ form_field_id: number; field_type: string }> = []
        if (form.form_pages && form.form_pages.length > 0) {
          for (const page of form.form_pages) {
            if (page.form_fields) allFormFields.push(...page.form_fields)
          }
        } else if (form.form_fields) {
          allFormFields.push(...form.form_fields)
        }

        for (const f of allFormFields) {
          if (f.field_type === 'consent') {
            const existing = fields.find(fv => fv.form_field_id === f.form_field_id)
            if (!existing) {
              fields.push({ form_field_id: f.form_field_id, field_value: 'agree' })
            } else if (!existing.field_value) {
              existing.field_value = 'agree'
            }
          }
        }

        return { claim_form_id: form.claim_form_id, fields }
      })
  }

  async function createBatch(): Promise<BatchClaim | null> {
    if (!selectedCustomer.value) {
      error.value = '고객을 선택해주세요.'
      return null
    }
    if (selectedEntries.value.length === 0) {
      error.value = '보험사를 선택해주세요.'
      return null
    }

    loading.value = true
    error.value = null
    try {
      const res = await createBatchClaim({
        customer_id: selectedCustomer.value.customer_id,
        claims: buildClaimsPayload(),
      })
      if (res.data.success) {
        currentBatch.value = res.data.data
        return res.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '다중 청구 생성에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  // ===== 임시저장 =====
  async function saveDraft(): Promise<BatchClaim | null> {
    if (selectedEntries.value.length === 0) {
      error.value = '보험사를 선택해주세요.'
      return null
    }

    loading.value = true
    error.value = null
    try {
      const res = await saveBatchDraft({
        customer_id: selectedCustomer.value?.customer_id,
        claims: buildClaimsPayload(),
      })
      if (res.data.success) {
        currentBatch.value = res.data.data
        return res.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '임시저장에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function updateDraft(batchId: number): Promise<BatchClaim | null> {
    loading.value = true
    error.value = null
    try {
      const res = await updateBatchDraft(batchId, {
        customer_id: selectedCustomer.value?.customer_id,
        claims: buildClaimsPayload(),
      })
      if (res.data.success) {
        currentBatch.value = res.data.data
        return res.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '임시저장 갱신에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function submitDraft(batchId: number): Promise<BatchClaim | null> {
    loading.value = true
    error.value = null
    try {
      const res = await submitBatchDraft(batchId, selectedCustomer.value ? { customer_id: selectedCustomer.value.customer_id } : undefined)
      if (res.data.success) {
        currentBatch.value = res.data.data
        return res.data.data
      }
      return null
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '배치 제출에 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function deleteDraft(batchId: number): Promise<boolean> {
    error.value = null
    try {
      const res = await deleteBatchDraft(batchId)
      if (res.data.success) {
        batchDrafts.value = batchDrafts.value.filter((d) => d.batch_claim_id !== batchId)
        return true
      }
      return false
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '임시저장 삭제에 실패했습니다.'
      return false
    }
  }

  // ===== 팩스 발송 =====
  async function sendFax(batchId: number, claimIds?: number[]): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      const res = await sendBatchFax(batchId, claimIds)
      if (res.data.success) {
        await loadBatchClaim(batchId)
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

  // ===== 첨부파일 관리 =====
  function addCommonDocument(file: File): void {
    commonDocuments.value.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      size: file.size,
    })
  }

  function removeCommonDocument(id: string): void {
    commonDocuments.value = commonDocuments.value.filter((d) => d.id !== id)
  }

  function addPerClaimDocument(entryIndex: number, file: File): void {
    if (!perClaimDocuments.value[entryIndex]) {
      perClaimDocuments.value[entryIndex] = []
    }
    perClaimDocuments.value[entryIndex]!.push({
      id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
      file,
      name: file.name,
      size: file.size,
    })
  }

  function removePerClaimDocument(entryIndex: number, id: string): void {
    const docs = perClaimDocuments.value[entryIndex]
    if (docs) {
      perClaimDocuments.value[entryIndex] = docs.filter((d) => d.id !== id)
    }
  }

  // ===== 초기화 =====
  function resetBatchForm(): void {
    selectedCustomer.value = null
    customerSearchResults.value = []
    selectedEntries.value = []
    activeTabIndex.value = 0
    commonDocuments.value = []
    perClaimDocuments.value = {}
    currentBatch.value = null
    error.value = null
  }

  return {
    // 목록 조회
    batchClaims,
    selectedBatch,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    filterStatus,

    // 임시저장
    batchDrafts,
    loadingDrafts,

    // 작성 - 고객
    selectedCustomer,
    customerSearchResults,
    loadingCustomers,

    // 작성 - 보험사/양식
    insuranceCompanies,
    loadingCompanies,
    selectedEntries,
    activeTabIndex,
    activeEntry,
    allFormsLoaded,

    // 작성 - 첨부파일
    commonDocuments,
    perClaimDocuments,

    // 작성 - 현재 배치
    currentBatch,

    // 액션 - 목록
    loadBatchClaims,
    loadBatchClaim,
    loadBatchDrafts,
    setFilter,

    // 액션 - 고객
    searchCustomers,
    selectCustomer,

    // 액션 - 보험사/양식
    loadInsuranceCompanies,
    toggleCompany,
    isCompanySelected,
    selectFormForEntry,

    // 액션 - 자동 매핑
    autoFillFromCustomer,
    autoFillStepFromCustomer,
    autoCopyStandardFields,
    isFieldAutoFilled,
    getFormFields,

    // 액션 - 필드
    setFieldValue,
    setActiveFieldValue,

    // 액션 - 첨부파일
    addCommonDocument,
    removeCommonDocument,
    addPerClaimDocument,
    removePerClaimDocument,

    // 액션 - 생성/제출
    createBatch,
    saveDraft,
    updateDraft,
    submitDraft,
    deleteDraft,
    sendFax,

    // 유틸
    resetBatchForm,
    buildClaimsPayload,
  }
})
