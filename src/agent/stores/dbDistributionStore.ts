import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { DbDistribution } from '../types'

export const useDbDistributionStore = defineStore('dbDistribution', () => {
  const distributions = ref<DbDistribution[]>([
    {
      assignment_id: 1,
      agent_id: 'AGT00001',
      customer_id: 101,
      customer_name: '이수진',
      customer_phone: '010-9876-5432',
      source: '병원 제휴',
      assigned_at: '2026-02-10',
      status: 'unprocessed',
    },
    {
      assignment_id: 2,
      agent_id: 'AGT00001',
      customer_id: 102,
      customer_name: '박진우',
      customer_phone: '010-5555-1234',
      source: '온라인 상담',
      assigned_at: '2026-02-09',
      status: 'unprocessed',
    },
    {
      assignment_id: 3,
      agent_id: 'AGT00001',
      customer_id: 103,
      customer_name: '최미영',
      customer_phone: '010-3333-7890',
      source: '지인 소개',
      assigned_at: '2026-02-08',
      status: 'processing',
      memo: '초기 상담 진행중',
    },
    {
      assignment_id: 4,
      agent_id: 'AGT00001',
      customer_id: 104,
      customer_name: '김태호',
      customer_phone: '010-2222-4567',
      source: '병원 제휴',
      assigned_at: '2026-02-07',
      status: 'processing',
      memo: '보장분석 요청',
    },
    {
      assignment_id: 5,
      agent_id: 'AGT00001',
      customer_id: 105,
      customer_name: '정유나',
      customer_phone: '010-8888-3456',
      source: '온라인 상담',
      assigned_at: '2026-02-05',
      status: 'completed',
      processed_at: '2026-02-06',
      memo: '계약 완료',
    },
    {
      assignment_id: 6,
      agent_id: 'AGT00001',
      customer_id: 106,
      customer_name: '한상민',
      customer_phone: '010-7777-6543',
      source: '텔레마케팅',
      assigned_at: '2026-02-03',
      status: 'completed',
      processed_at: '2026-02-04',
      memo: '가입 거절',
    },
    {
      assignment_id: 7,
      agent_id: 'AGT00001',
      customer_id: 107,
      customer_name: '오지현',
      customer_phone: '010-1111-9876',
      source: '병원 제휴',
      assigned_at: '2026-02-11',
      status: 'unprocessed',
    },
  ])

  const filterStatus = ref<DbDistribution['status'] | 'all'>('all')

  const filteredDistributions = computed<DbDistribution[]>(() => {
    if (filterStatus.value === 'all') {
      return distributions.value
    }
    return distributions.value.filter(d => d.status === filterStatus.value)
  })

  const countByStatus = computed(() => ({
    all: distributions.value.length,
    unprocessed: distributions.value.filter(d => d.status === 'unprocessed').length,
    processing: distributions.value.filter(d => d.status === 'processing').length,
    completed: distributions.value.filter(d => d.status === 'completed').length,
  }))

  function processDistribution(id: number, status: DbDistribution['status'], memo?: string): void {
    const item = distributions.value.find(d => d.assignment_id === id)
    if (!item) return

    item.status = status
    if (memo !== undefined) {
      item.memo = memo
    }
    if (status === 'completed' || status === 'processing') {
      item.processed_at = new Date().toISOString().slice(0, 10)
    }
  }

  return {
    distributions,
    filterStatus,
    filteredDistributions,
    countByStatus,
    processDistribution,
  }
})
