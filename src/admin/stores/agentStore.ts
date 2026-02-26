import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminAgent, LaravelPagination } from '../types'
import {
  fetchAgents as apiFetchAgents,
  fetchAgent as apiFetchAgent,
  createAgent as apiCreateAgent,
  updateAgent as apiUpdateAgent,
  deleteAgent as apiDeleteAgent,
} from '../services/adminApi'

export const useAgentStore = defineStore('agent', () => {
  const agents = ref<AdminAgent[]>([])
  const selectedAgent = ref<AdminAgent | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<AdminAgent>, 'data'> | null>(null)

  async function loadAgents(params?: {
    search?: string
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_direction?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchAgents(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      agents.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadAgent(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchAgent(id)
      selectedAgent.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createAgent(data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateAgent(data)
      agents.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateAgent(id: string, data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiUpdateAgent(id, data)
      const index = agents.value.findIndex(a => a.agent_id === id)
      if (index !== -1) {
        agents.value[index] = response.data.data
      }
      if (selectedAgent.value?.agent_id === id) {
        selectedAgent.value = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteAgent(id: string) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteAgent(id)
      agents.value = agents.value.filter(a => a.agent_id !== id)
      if (selectedAgent.value?.agent_id === id) {
        selectedAgent.value = null
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '설계사 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    agents,
    selectedAgent,
    loading,
    error,
    pagination,
    loadAgents,
    loadAgent,
    createAgent,
    updateAgent,
    deleteAgent,
  }
})
