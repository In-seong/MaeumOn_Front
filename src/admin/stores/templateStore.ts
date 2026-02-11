import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { claimFormApi, formFieldApi, formPageApi } from '@shared/services/insuranceApi'
import type { ClaimForm, FormPage, FormField, PaginatedResponse } from '@shared/types'

export const useTemplateStore = defineStore('template', () => {
  const templates = ref<ClaimForm[]>([])
  const pagination = ref<Omit<PaginatedResponse<ClaimForm>, 'data'> | null>(null)
  const currentTemplate = ref<ClaimForm | null>(null)
  const pages = ref<FormPage[]>([])
  const currentPage = ref<FormPage | null>(null)
  const fields = ref<FormField[]>([])
  const selectedField = ref<FormField | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const sortedFields = computed(() => [...fields.value].sort((a, b) => a.field_order - b.field_order))
  const sortedPages = computed(() => [...pages.value].sort((a, b) => a.page_number - b.page_number))
  const currentPageFields = computed(() => {
    if (!currentPage.value) return sortedFields.value
    return fields.value.filter(f => f.form_page_id === currentPage.value!.form_page_id).sort((a, b) => a.field_order - b.field_order)
  })

  async function fetchTemplates(params?: { company_id?: number; search?: string; is_active?: boolean; per_page?: number; page?: number }) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.getList(params)
      const { data, ...paginationData } = response.data.data
      templates.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function fetchTemplate(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.get(id)
      currentTemplate.value = response.data.data
      fields.value = response.data.data.form_fields || []
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createTemplate(data: Partial<ClaimForm>) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.create(data)
      templates.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createTemplateWithImages(formData: FormData) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.createWithImages(formData)
      const newTemplate = response.data.data
      templates.value.unshift(newTemplate)
      return newTemplate
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateTemplate(id: number, data: Partial<ClaimForm>) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.update(id, data)
      const index = templates.value.findIndex(t => t.claim_form_id === id)
      if (index !== -1) {
        templates.value[index] = response.data.data
      }
      if (currentTemplate.value?.claim_form_id === id) {
        currentTemplate.value = { ...currentTemplate.value, ...response.data.data }
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteTemplate(id: number) {
    loading.value = true
    error.value = null

    try {
      await claimFormApi.delete(id)
      templates.value = templates.value.filter(t => t.claim_form_id !== id)
      if (currentTemplate.value?.claim_form_id === id) {
        currentTemplate.value = null
        fields.value = []
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '양식 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function uploadImage(id: number, file: File) {
    loading.value = true
    error.value = null

    try {
      const response = await claimFormApi.uploadImage(id, file)
      if (currentTemplate.value?.claim_form_id === id) {
        currentTemplate.value = {
          ...currentTemplate.value,
          template_image_url: response.data.data.template_image_url,
        }
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '이미지 업로드에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  // 필드 관련 함수들
  async function createField(templateId: number, data: Partial<FormField>) {
    loading.value = true
    error.value = null

    try {
      const response = await formFieldApi.create(templateId, data)
      fields.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '필드 추가에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateField(id: number, data: Partial<FormField>) {
    loading.value = true
    error.value = null

    try {
      const response = await formFieldApi.update(id, data)
      const index = fields.value.findIndex(f => f.form_field_id === id)
      if (index !== -1) {
        fields.value[index] = response.data.data
      }
      if (selectedField.value?.form_field_id === id) {
        selectedField.value = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '필드 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteField(id: number) {
    loading.value = true
    error.value = null

    try {
      await formFieldApi.delete(id)
      fields.value = fields.value.filter(f => f.form_field_id !== id)
      if (selectedField.value?.form_field_id === id) {
        selectedField.value = null
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '필드 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function saveFieldPositions(templateId: number) {
    loading.value = true
    error.value = null

    try {
      const fieldData = fields.value.map((f, index) => ({
        form_field_id: f.form_field_id,
        x_position: f.x_position || 0,
        y_position: f.y_position || 0,
        width: f.width,
        height: f.height,
        field_order: index,
      }))
      const response = await formFieldApi.bulkUpdate(templateId, fieldData)
      fields.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '필드 위치 저장에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  function updateFieldPosition(id: number, x: number, y: number) {
    const field = fields.value.find(f => f.form_field_id === id)
    if (field) {
      field.x_position = Math.max(0, Math.round(x))
      field.y_position = Math.max(0, Math.round(y))
    }
  }

  function updateFieldSize(id: number, width: number, height: number) {
    const field = fields.value.find(f => f.form_field_id === id)
    if (field) {
      field.width = Math.max(10, Math.round(width))
      field.height = Math.max(10, Math.round(height))
    }
  }

  function selectField(field: FormField | null) {
    selectedField.value = field
  }

  // ============ 페이지 관련 함수 ============

  async function fetchPages(templateId: number) {
    loading.value = true
    error.value = null

    try {
      const response = await formPageApi.getList(templateId)
      pages.value = response.data.data
      // 첫 번째 페이지를 기본 선택
      if (pages.value.length > 0 && !currentPage.value) {
        currentPage.value = pages.value[0] ?? null
      }
      return pages.value
    } catch (e: any) {
      error.value = e.response?.data?.message || '페이지 목록을 불러오는데 실패했습니다.'
      return []
    } finally {
      loading.value = false
    }
  }

  async function createPage(templateId: number, data?: { page_number?: number }) {
    loading.value = true
    error.value = null

    try {
      const response = await formPageApi.create(templateId, data)
      pages.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '페이지 추가에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deletePage(templateId: number, pageId: number) {
    loading.value = true
    error.value = null

    try {
      await formPageApi.delete(templateId, pageId)
      pages.value = pages.value.filter(p => p.form_page_id !== pageId)
      if (currentPage.value?.form_page_id === pageId) {
        currentPage.value = pages.value[0] || null
      }
      // 해당 페이지의 필드들도 제거
      fields.value = fields.value.filter(f => f.form_page_id !== pageId)
    } catch (e: any) {
      error.value = e.response?.data?.message || '페이지 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function uploadPageImage(templateId: number, pageId: number, file: File) {
    loading.value = true
    error.value = null

    try {
      const response = await formPageApi.uploadImage(templateId, pageId, file)
      const pageIndex = pages.value.findIndex(p => p.form_page_id === pageId)
      if (pageIndex !== -1) {
        const existingPage = pages.value[pageIndex]
        if (existingPage) {
          pages.value[pageIndex] = {
            ...existingPage,
            page_image_path: response.data.data.page_image_path,
            page_image_url: response.data.data.page_image_url,
            image_width: response.data.data.image_width,
            image_height: response.data.data.image_height,
          }
        }
      }
      if (currentPage.value?.form_page_id === pageId) {
        currentPage.value = pages.value[pageIndex] ?? null
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '이미지 업로드에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  function selectPage(page: FormPage | null) {
    currentPage.value = page
    selectedField.value = null
  }

  return {
    templates,
    pagination,
    currentTemplate,
    pages,
    currentPage,
    fields,
    selectedField,
    loading,
    error,
    sortedFields,
    sortedPages,
    currentPageFields,
    fetchTemplates,
    fetchTemplate,
    createTemplate,
    createTemplateWithImages,
    updateTemplate,
    deleteTemplate,
    uploadImage,
    createField,
    updateField,
    deleteField,
    saveFieldPositions,
    updateFieldPosition,
    updateFieldSize,
    selectField,
    fetchPages,
    createPage,
    deletePage,
    uploadPageImage,
    selectPage,
  }
})
