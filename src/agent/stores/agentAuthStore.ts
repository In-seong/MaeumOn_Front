import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import api from '@shared/api'
import type { Agent } from '../types'
import { updateAgentProfile } from '../services/agentApi'

export const useAgentAuthStore = defineStore('agentAuth', () => {
  const agent = ref<Agent | null>(null)
  const isLoggedIn = ref(!!localStorage.getItem('agentToken'))
  const loading = ref(false)
  const error = ref<string | null>(null)

  const agentName = computed(() => agent.value?.name ?? '')
  const agencyName = computed(() => agent.value?.office_location ?? '')

  // Restore agent data on page refresh when token exists but agent data is lost
  if (isLoggedIn.value && !agent.value) {
    fetchProfile()
  }

  async function login(username: string, password: string) {
    loading.value = true
    error.value = null
    try {
      const res = await api.post('/auth/login', { username, password, role: 'AGENT' })
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

  async function updateProfile(data: Partial<Pick<Agent, 'phone' | 'email' | 'office_location'>>) {
    loading.value = true
    error.value = null
    try {
      const res = await updateAgentProfile(data)
      agent.value = res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '프로필 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  function logout() {
    localStorage.removeItem('agentToken')
    isLoggedIn.value = false
    agent.value = null
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
    updateProfile,
    logout,
  }
})
