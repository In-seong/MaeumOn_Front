import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { PerformanceSummary, AgentPerformance, MonthlyPerformance, LaravelPagination } from '../types'
import {
  fetchPerformanceSummary,
  fetchAgentPerformances,
  fetchAgentPerformanceDetail,
} from '../services/adminApi'

export const usePerformanceStore = defineStore('performance', () => {
  const summary = ref<PerformanceSummary | null>(null)
  const agentPerformances = ref<AgentPerformance[]>([])
  const selectedAgentPerformance = ref<MonthlyPerformance[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<AgentPerformance>, 'data'> | null>(null)
  const period = ref<'day' | 'week' | 'month'>('month')

  async function loadSummary(periodParam?: 'day' | 'week' | 'month') {
    loading.value = true
    error.value = null

    try {
      if (periodParam) {
        period.value = periodParam
      }
      const response = await fetchPerformanceSummary({ period: period.value })
      summary.value = response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '실적 요약을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadAgentPerformances(params?: {
    page?: number
    per_page?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await fetchAgentPerformances(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      agentPerformances.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 실적을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadAgentDetail(agentId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await fetchAgentPerformanceDetail(agentId)
      selectedAgentPerformance.value = response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 상세 실적을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  return {
    summary,
    agentPerformances,
    selectedAgentPerformance,
    loading,
    error,
    pagination,
    period,
    loadSummary,
    loadAgentPerformances,
    loadAgentDetail,
  }
})
