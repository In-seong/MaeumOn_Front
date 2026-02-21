import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Consultation } from '../types'
import { fetchConsultations, respondConsultation } from '../services/agentApi'

export const useConsultationStore = defineStore('agentConsultation', () => {
  const filterStatus = ref<'all' | 'pending' | 'in_progress' | 'completed'>('all')
  const consultations = ref<Consultation[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  const filteredConsultations = computed(() => consultations.value)

  const statusCounts = computed(() => ({
    all: total.value,
    pending: consultations.value.filter((c) => c.status === 'pending').length,
    in_progress: consultations.value.filter((c) => c.status === 'in_progress').length,
    completed: consultations.value.filter((c) => c.status === 'completed').length,
  }))

  async function loadConsultations(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      if (filterStatus.value !== 'all') {
        queryParams.status = filterStatus.value
      }
      const res = await fetchConsultations(queryParams)
      const paginated = res.data.data
      consultations.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '상담 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function answerConsultation(id: number, answer: string) {
    loading.value = true
    error.value = null
    try {
      const res = await respondConsultation(id, answer)
      const updated = res.data.data
      const index = consultations.value.findIndex((c) => c.consultation_id === id)
      if (index !== -1) {
        consultations.value[index] = updated
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '상담 답변에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  function setFilter(status: 'all' | 'pending' | 'in_progress' | 'completed') {
    filterStatus.value = status
    currentPage.value = 1
    loadConsultations()
  }

  return {
    consultations,
    filterStatus,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    filteredConsultations,
    statusCounts,
    loadConsultations,
    answerConsultation,
    setFilter,
  }
})
