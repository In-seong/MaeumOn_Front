// TODO: Backend 미구현 (Phase 6). 현재 Mock 데이터 사용. API 구현 후 실제 API 연동 필요.
import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Performance, StatisticsTrend } from '../types'

export const useStatisticsStore = defineStore('agentStatistics', () => {
  const period = ref<'monthly' | 'quarterly'>('monthly')

  const currentPerformance = ref<Performance>({
    performance_id: 1,
    agent_id: 'AGT00001',
    year: 2026,
    month: 2,
    db_distributed: 18,
    db_processed: 14,
    contracts_count: 8,
    contracts_amount: 24500000,
    conversion_rate: 57.1,
  })

  const trendData = ref<StatisticsTrend[]>([
    {
      month: '2025-09',
      contracts_count: 5,
      contracts_amount: 15200000,
      conversion_rate: 41.7,
    },
    {
      month: '2025-10',
      contracts_count: 7,
      contracts_amount: 19800000,
      conversion_rate: 50.0,
    },
    {
      month: '2025-11',
      contracts_count: 6,
      contracts_amount: 17500000,
      conversion_rate: 46.2,
    },
    {
      month: '2025-12',
      contracts_count: 9,
      contracts_amount: 28100000,
      conversion_rate: 60.0,
    },
    {
      month: '2026-01',
      contracts_count: 10,
      contracts_amount: 31200000,
      conversion_rate: 62.5,
    },
    {
      month: '2026-02',
      contracts_count: 8,
      contracts_amount: 24500000,
      conversion_rate: 57.1,
    },
  ])

  return {
    period,
    currentPerformance,
    trendData,
  }
})
