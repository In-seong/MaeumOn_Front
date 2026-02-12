import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@shared/api'
import type { Agent } from '../types'

export const useAgentAuthStore = defineStore('agentAuth', () => {
  const agent = ref<Agent | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('agentToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const agentName = computed(() => agent.value?.agent_name ?? '')
  const agencyName = computed(() => agent.value?.agency_name ?? '')

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/login', { username, password, role: 'AGENT' })
      const token = res.data.token || res.data.data?.token
      if (token) {
        localStorage.setItem('agentToken', token)
        isLoggedIn.value = true
        await fetchProfile()
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '로그인에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile() {
    try {
      const res = await api.get('/agent/profile')
      agent.value = res.data.data || res.data
    } catch {
      // Profile fetch failure - non-critical on initial load
    }
  }

  function logout() {
    localStorage.removeItem('agentToken')
    isLoggedIn.value = false
    agent.value = null
  }

  // Mock login for development (no backend yet)
  function mockLogin() {
    localStorage.setItem('agentToken', 'mock-agent-token-dev')
    isLoggedIn.value = true
    agent.value = {
      agent_id: 'AGT00001',
      account_id: 1,
      agent_name: '김설계',
      agent_phone: '010-1234-5678',
      agent_email: 'agent@maeumOn.com',
      agency_name: '마음온 보험대리점',
      position: '팀장',
      license_number: 'LA-2024-001',
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    }
  }

  return {
    agent,
    isLoggedIn,
    loading,
    error,
    agentName,
    agencyName,
    login,
    fetchProfile,
    logout,
    mockLogin,
  }
})
