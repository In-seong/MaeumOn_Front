import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { DbDistribution } from '../types'
import { fetchDbDistributions, processDbDistribution } from '../services/agentApi'

export const useDbDistributionStore = defineStore('dbDistribution', () => {
  const distributions = ref<DbDistribution[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  async function loadDistributions(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      const res = await fetchDbDistributions(queryParams)
      const paginated = res.data.data
      distributions.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || 'DB배분 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function process(id: number, data: { notes?: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await processDbDistribution(id, data)
      const updated = res.data.data
      const index = distributions.value.findIndex(d => d.assignment_id === id)
      if (index !== -1) {
        distributions.value[index] = updated
      }
      return updated
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || 'DB배분 처리에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    distributions,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    loadDistributions,
    process,
  }
})
