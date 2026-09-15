import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { CorporateInquiry } from '../types'
import { fetchCorporateInquiries, updateCorporateInquiryNotes } from '../services/agentApi'

export const useCorporateInquiryStore = defineStore('corporateInquiry', () => {
  const inquiries = ref<CorporateInquiry[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  async function loadInquiries(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchCorporateInquiries({
        page: currentPage.value,
        ...params,
      })
      const paginated = res.data.data
      inquiries.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '기업 배분 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function updateNotes(id: number, notes: string) {
    try {
      const res = await updateCorporateInquiryNotes(id, { notes })
      const updated = res.data.data
      const index = inquiries.value.findIndex(i => i.id === id)
      if (index !== -1) {
        inquiries.value[index] = updated
      }
      return updated
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메모 저장에 실패했습니다.'
      throw e
    }
  }

  return {
    inquiries,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    loadInquiries,
    updateNotes,
  }
})
