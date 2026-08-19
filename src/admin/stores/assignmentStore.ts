import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Assignment, AdminCustomer, AdminAgent, AdminClaimRequest, LaravelPagination } from '../types'
import {
  fetchAssignments as apiFetchAssignments,
  createAssignment as apiCreateAssignment,
  bulkAssignment as apiBulkAssignment,
  deleteAssignment as apiDeleteAssignment,
  fetchClaimAssignments as apiFetchClaimAssignments,
  fetchCustomers as apiFetchCustomers,
  fetchAgents as apiFetchAgents,
  fetchAdminClaimRequests as apiFetchClaimRequests,
  bulkAssignClaimRequests as apiBulkAssignClaimRequests,
  createAdminClaimRequest as apiCreateAdminClaimRequest,
} from '../services/adminApi'

export const useAssignmentStore = defineStore('assignment', () => {
  const assignments = ref<Assignment[]>([])
  const claimAssignments = ref<AdminClaimRequest[]>([])
  const loading = ref(false)
  const claimLoading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<Assignment>, 'data'> | null>(null)
  const claimPagination = ref<Omit<LaravelPagination<AdminClaimRequest>, 'data'> | null>(null)
  const unassignedCustomers = ref<AdminCustomer[]>([])
  const unassignedClaimRequests = ref<AdminClaimRequest[]>([])
  const claimRequestsLoading = ref(false)
  const agentOptions = ref<AdminAgent[]>([])

  async function loadAssignments(params?: {
    search?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_direction?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchAssignments(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      assignments.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '배분 이력을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadClaimAssignments(params?: {
    search?: string
    page?: number
    per_page?: number
    sort_by?: string
    sort_direction?: string
  }) {
    claimLoading.value = true
    error.value = null

    try {
      const response = await apiFetchClaimAssignments(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      claimAssignments.value = data
      claimPagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구 배정 이력을 불러오는데 실패했습니다.'
    } finally {
      claimLoading.value = false
    }
  }

  async function createAssignment(data: { customer_id: string; agent_id: string; notes?: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateAssignment(data)
      assignments.value.unshift(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || 'DB 배분 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function bulkAssignment(data: {
    assignments: Array<{ customer_id: string; agent_id: string }>
    notes?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiBulkAssignment(data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '대량 배분 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAssignment(id: number) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteAssignment(id)
      assignments.value = assignments.value.filter(a => a.assignment_id !== id)
    } catch (e: any) {
      error.value = e.response?.data?.message || '배분 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadUnassignedCustomers(params?: { search?: string; per_page?: number }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchCustomers({
        agent_id: 'null',
        is_active: true,
        per_page: params?.per_page ?? 100,
        search: params?.search,
        created_after: '2026-07-03 12:00:00',
      } as Record<string, unknown>)
      const { data } = response.data.data
      unassignedCustomers.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '미배정 고객 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadUnassignedClaimRequests(params?: { search?: string; per_page?: number }) {
    claimRequestsLoading.value = true
    error.value = null

    try {
      const response = await apiFetchClaimRequests({
        status: 'pending',
        per_page: params?.per_page ?? 100,
        search: params?.search,
      } as Record<string, unknown>)
      const { data } = response.data.data
      unassignedClaimRequests.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '미배정 청구신청 목록을 불러오는데 실패했습니다.'
    } finally {
      claimRequestsLoading.value = false
    }
  }

  async function bulkAssignClaimRequests(data: { request_ids: number[]; agent_id: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiBulkAssignClaimRequests(data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구신청 대량 배정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function createClaimRequest(formData: FormData) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateAdminClaimRequest(formData)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '청구 신청 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadAgentOptions(extraParams?: Record<string, unknown>) {
    try {
      const response = await apiFetchAgents({
        is_active: true,
        per_page: 100,
        ...extraParams,
      } as Record<string, unknown>)
      const { data } = response.data.data
      agentOptions.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 목록을 불러오는데 실패했습니다.'
    }
  }

  return {
    assignments,
    claimAssignments,
    loading,
    claimLoading,
    error,
    pagination,
    claimPagination,
    unassignedCustomers,
    unassignedClaimRequests,
    claimRequestsLoading,
    agentOptions,
    loadAssignments,
    loadClaimAssignments,
    createAssignment,
    bulkAssignment,
    deleteAssignment,
    loadUnassignedCustomers,
    loadUnassignedClaimRequests,
    bulkAssignClaimRequests,
    createClaimRequest,
    loadAgentOptions,
  }
})
