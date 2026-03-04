import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { Assignment, AdminCustomer, AdminAgent, LaravelPagination } from '../types'
import {
  fetchAssignments as apiFetchAssignments,
  createAssignment as apiCreateAssignment,
  bulkAssignment as apiBulkAssignment,
  deleteAssignment as apiDeleteAssignment,
  fetchCustomers as apiFetchCustomers,
  fetchAgents as apiFetchAgents,
} from '../services/adminApi'

export const useAssignmentStore = defineStore('assignment', () => {
  const assignments = ref<Assignment[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<Assignment>, 'data'> | null>(null)
  const unassignedCustomers = ref<AdminCustomer[]>([])
  const agentOptions = ref<AdminAgent[]>([])

  async function loadAssignments(params?: {
    search?: string
    page?: number
    per_page?: number
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
      } as Record<string, unknown>)
      const { data } = response.data.data
      unassignedCustomers.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '미배정 고객 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadAgentOptions() {
    try {
      const response = await apiFetchAgents({
        is_active: true,
        per_page: 100,
      } as Record<string, unknown>)
      const { data } = response.data.data
      agentOptions.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 목록을 불러오는데 실패했습니다.'
    }
  }

  return {
    assignments,
    loading,
    error,
    pagination,
    unassignedCustomers,
    agentOptions,
    loadAssignments,
    createAssignment,
    bulkAssignment,
    deleteAssignment,
    loadUnassignedCustomers,
    loadAgentOptions,
  }
})
