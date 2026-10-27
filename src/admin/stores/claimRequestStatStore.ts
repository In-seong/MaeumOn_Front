import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClaimRequestStatAgentRow, ClaimRequestStatSummary, ClaimRequestStatHospital } from '../types'
import { fetchClaimRequestStatistics } from '../services/adminApi'

export const useClaimRequestStatStore = defineStore('claimRequestStat', () => {
  const agents = ref<ClaimRequestStatAgentRow[]>([])
  const summary = ref<ClaimRequestStatSummary>({ total_resident: 0, total_distribution: 0, total_corporate: 0, total: 0 })
  const hospitals = ref<ClaimRequestStatHospital[]>([])
  const hospitalStats = ref<Array<{ hospital_id: number; hospital_name: string; resident: number; distribution: number; total: number }>>([])
  const dateFrom = ref('')
  const dateTo = ref('')
  const selectedHospitalId = ref<number | null>(null)
  const selectedDbType = ref<string | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadStatistics() {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, unknown> = {}
      if (dateFrom.value && dateTo.value) {
        params.date_from = dateFrom.value
        params.date_to = dateTo.value
      }
      if (selectedHospitalId.value) {
        params.hospital_id = selectedHospitalId.value
      }
      if (selectedDbType.value) {
        params.db_type = selectedDbType.value
      }
      const response = await fetchClaimRequestStatistics(params)
      const data = response.data.data
      agents.value = data.agents
      summary.value = data.summary
      hospitals.value = data.hospitals
      hospitalStats.value = data.hospital_stats ?? []
      if (data.start_date && !dateFrom.value) {
        dateFrom.value = data.start_date
      }
      if (data.end_date && !dateTo.value) {
        dateTo.value = data.end_date
      }
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || '통계를 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  function setDateRange(from: string, to: string) {
    dateFrom.value = from
    dateTo.value = to
    loadStatistics()
  }

  function setHospital(id: number | null) {
    selectedHospitalId.value = id
    loadStatistics()
  }

  function setDbType(type: string | null) {
    selectedDbType.value = type
    loadStatistics()
  }

  return {
    agents,
    summary,
    hospitals,
    hospitalStats,
    dateFrom,
    dateTo,
    selectedHospitalId,
    selectedDbType,
    loading,
    error,
    loadStatistics,
    setDateRange,
    setHospital,
    setDbType,
  }
})
