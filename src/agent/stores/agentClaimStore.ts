import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { AgentClaim } from '../types'
import { fetchClaims, fetchClaim } from '../services/agentApi'

export const useAgentClaimStore = defineStore('agentClaim', () => {
  const filterStatus = ref<'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid'>('all')
  const searchQuery = ref('')
  const claims = ref<AgentClaim[]>([])
  const selectedClaim = ref<AgentClaim | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  const filteredClaims = computed(() => claims.value)

  const statusCounts = computed(() => ({
    all: total.value,
    pending: claims.value.filter((c) => c.claim_status === 'pending').length,
    processing: claims.value.filter((c) => c.claim_status === 'processing').length,
    approved: claims.value.filter((c) => c.claim_status === 'approved').length,
    rejected: claims.value.filter((c) => c.claim_status === 'rejected').length,
    paid: claims.value.filter((c) => c.claim_status === 'paid').length,
  }))

  async function loadClaims(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      if (filterStatus.value !== 'all') {
        queryParams.claim_status = filterStatus.value
      }
      const res = await fetchClaims(queryParams)
      const paginated = res.data.data
      claims.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadClaim(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await fetchClaim(id)
      selectedClaim.value = res.data.data
      return selectedClaim.value
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '청구 정보를 불러오는데 실패했습니다.'
      return undefined
    } finally {
      loading.value = false
    }
  }

  function setFilter(status: 'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid') {
    filterStatus.value = status
    currentPage.value = 1
    loadClaims()
  }

  function setSearchQuery(query: string) {
    searchQuery.value = query
  }

  return {
    claims,
    selectedClaim,
    filterStatus,
    searchQuery,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    filteredClaims,
    statusCounts,
    loadClaims,
    loadClaim,
    setFilter,
    setSearchQuery,
  }
})
