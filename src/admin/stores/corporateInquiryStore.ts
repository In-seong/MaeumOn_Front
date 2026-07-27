import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { LaravelPagination } from '../types'
import {
  fetchCorporateInquiries as apiFetch,
  fetchCorporateInquiry as apiShow,
  updateCorporateInquiry as apiUpdate,
  assignCorporateInquiries as apiAssign,
  fetchUnassignedCorporateInquiries as apiUnassigned,
  fetchAgents as apiFetchAgents,
  type CorporateInquiry,
} from '../services/adminApi'
import type { AdminAgent } from '../types'

export type { CorporateInquiry }

export const useCorporateInquiryStore = defineStore('corporateInquiry', () => {
  const inquiries = ref<CorporateInquiry[]>([])
  const currentInquiry = ref<CorporateInquiry | null>(null)
  const unassignedInquiries = ref<CorporateInquiry[]>([])
  const agentOptions = ref<AdminAgent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<CorporateInquiry>, 'data'> | null>(null)

  async function loadInquiries(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch(params)
      const { data, ...pg } = res.data.data
      inquiries.value = data
      pagination.value = pg
    } catch (e: any) {
      error.value = e.response?.data?.message || '목록 조회 실패'
    } finally {
      loading.value = false
    }
  }

  async function loadInquiry(id: number) {
    loading.value = true
    error.value = null
    try {
      const res = await apiShow(id)
      currentInquiry.value = res.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '상세 조회 실패'
    } finally {
      loading.value = false
    }
  }

  async function updateInquiry(id: number, data: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiUpdate(id, data)
      currentInquiry.value = res.data.data
      return res.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '업데이트 실패'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function assignInquiries(data: { inquiry_ids: number[]; agent_id: string; notes?: string }) {
    loading.value = true
    error.value = null
    try {
      await apiAssign(data)
    } catch (e: any) {
      error.value = e.response?.data?.message || '배분 실패'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadUnassigned(params?: { search?: string }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiUnassigned(params as Record<string, unknown>)
      unassignedInquiries.value = res.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '미배분 목록 조회 실패'
    } finally {
      loading.value = false
    }
  }

  async function loadAgentOptions() {
    try {
      const res = await apiFetchAgents({ is_active: true, per_page: 100 } as Record<string, unknown>)
      const { data } = res.data.data
      agentOptions.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 목록 조회 실패'
    }
  }

  return {
    inquiries,
    currentInquiry,
    unassignedInquiries,
    agentOptions,
    loading,
    error,
    pagination,
    loadInquiries,
    loadInquiry,
    updateInquiry,
    assignInquiries,
    loadUnassigned,
    loadAgentOptions,
  }
})
