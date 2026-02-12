import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentClaim } from '../types'

export const useAgentClaimStore = defineStore('agentClaim', () => {
  const filterStatus = ref<'all' | 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'>('all')
  const searchQuery = ref('')

  const claims = ref<AgentClaim[]>([
    {
      claim_id: 1001,
      customer_id: 101,
      customer_name: '김영수',
      insurance_company: '삼성생명',
      claim_type: '입원비',
      claim_amount: 1500000,
      status: 'submitted',
      submitted_at: '2026-02-11',
    },
    {
      claim_id: 1002,
      customer_id: 102,
      customer_name: '박미정',
      insurance_company: '한화생명',
      claim_type: '수술비',
      claim_amount: 3200000,
      status: 'processing',
      submitted_at: '2026-02-08',
    },
    {
      claim_id: 1003,
      customer_id: 103,
      customer_name: '이정훈',
      insurance_company: 'DB손해보험',
      claim_type: '통원비',
      claim_amount: 280000,
      status: 'approved',
      submitted_at: '2026-01-30',
      processed_at: '2026-02-05',
    },
    {
      claim_id: 1004,
      customer_id: 104,
      customer_name: '최수진',
      insurance_company: '현대해상',
      claim_type: '후유장해',
      claim_amount: 5000000,
      status: 'rejected',
      submitted_at: '2026-01-25',
      processed_at: '2026-02-03',
    },
    {
      claim_id: 1005,
      customer_id: 105,
      customer_name: '정대한',
      insurance_company: '교보생명',
      claim_type: '입원비',
      claim_amount: 750000,
      status: 'draft',
      submitted_at: '2026-02-12',
    },
    {
      claim_id: 1006,
      customer_id: 106,
      customer_name: '한소영',
      insurance_company: '메리츠화재',
      claim_type: '실손의료비',
      claim_amount: 420000,
      status: 'submitted',
      submitted_at: '2026-02-10',
    },
    {
      claim_id: 1007,
      customer_id: 107,
      customer_name: '윤재호',
      insurance_company: '삼성화재',
      claim_type: '통원비',
      claim_amount: 150000,
      status: 'approved',
      submitted_at: '2026-02-01',
      processed_at: '2026-02-07',
    },
  ])

  const filteredClaims = computed(() => {
    let result = claims.value

    if (filterStatus.value !== 'all') {
      result = result.filter((c) => c.status === filterStatus.value)
    }

    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(query) ||
          c.insurance_company.toLowerCase().includes(query) ||
          c.claim_type.toLowerCase().includes(query)
      )
    }

    return result
  })

  const statusCounts = computed(() => ({
    all: claims.value.length,
    draft: claims.value.filter((c) => c.status === 'draft').length,
    submitted: claims.value.filter((c) => c.status === 'submitted').length,
    processing: claims.value.filter((c) => c.status === 'processing').length,
    approved: claims.value.filter((c) => c.status === 'approved').length,
    rejected: claims.value.filter((c) => c.status === 'rejected').length,
  }))

  function setFilter(status: 'all' | 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'): void {
    filterStatus.value = status
  }

  function setSearchQuery(query: string): void {
    searchQuery.value = query
  }

  return {
    claims,
    filterStatus,
    searchQuery,
    filteredClaims,
    statusCounts,
    setFilter,
    setSearchQuery,
  }
})
