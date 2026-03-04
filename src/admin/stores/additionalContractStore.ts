import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdditionalContractResult, LaravelPagination } from '../types'
import { fetchAdditionalContracts } from '../services/adminApi'

export const useAdditionalContractStore = defineStore('additionalContract', () => {
  const results = ref<AdditionalContractResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<AdditionalContractResult>, 'data'> | null>(null)
  const activeType = ref<string>('unclaimed')

  async function loadResults(params?: {
    type?: string
    page?: number
    per_page?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await fetchAdditionalContracts(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      results.value = data
      pagination.value = paginationData
      if (params?.type) {
        activeType.value = params.type
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '추가계약 발굴 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  return {
    results,
    loading,
    error,
    pagination,
    activeType,
    loadResults,
  }
})
