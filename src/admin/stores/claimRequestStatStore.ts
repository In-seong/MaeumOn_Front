import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { ClaimRequestStatAgentRow, ClaimRequestStatSummary, ClaimRequestStatHospital } from '../types'
import { fetchClaimRequestStatistics } from '../services/adminApi'

export const useClaimRequestStatStore = defineStore('claimRequestStat', () => {
  const agents = ref<ClaimRequestStatAgentRow[]>([])
  const summary = ref<ClaimRequestStatSummary>({ total_resident: 0, total_distribution: 0, total: 0 })
  const hospitals = ref<ClaimRequestStatHospital[]>([])
  const period = ref<'day' | 'week' | 'month'>('month')
  const startDate = ref('')
  const selectedHospitalId = ref<number | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function loadStatistics() {
    loading.value = true
    error.value = null

    try {
      const params: Record<string, unknown> = { period: period.value }
      if (selectedHospitalId.value) {
        params.hospital_id = selectedHospitalId.value
      }
      const response = await fetchClaimRequestStatistics(params)
      const data = response.data.data
      agents.value = data.agents
      summary.value = data.summary
      hospitals.value = data.hospitals
      startDate.value = data.start_date
    } catch (e: unknown) {
      const err = e as { response?: { data?: { message?: string } } }
      error.value = err.response?.data?.message || '통계를 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  function setPeriod(p: 'day' | 'week' | 'month') {
    period.value = p
    loadStatistics()
  }

  function setHospital(id: number | null) {
    selectedHospitalId.value = id
    loadStatistics()
  }

  return {
    agents,
    summary,
    hospitals,
    period,
    startDate,
    selectedHospitalId,
    loading,
    error,
    loadStatistics,
    setPeriod,
    setHospital,
  }
})
