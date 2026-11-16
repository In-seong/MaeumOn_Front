import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { UnclaimedSession, UnclaimedResult } from '../types'
import * as api from '../services/agentApi'

export const useUnclaimedStore = defineStore('unclaimed', () => {
  const sessions = ref<UnclaimedSession[]>([])
  const currentSession = ref<UnclaimedSession | null>(null)
  const results = ref<UnclaimedResult[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchSessions(page?: number) {
    loading.value = true
    error.value = null
    try {
      const res = await api.fetchUnclaimedSessions(page ? { page } : undefined)
      sessions.value = res.data.data.data
    } catch {
      sessions.value = []
      error.value = '목록을 불러오지 못했습니다'
    } finally {
      loading.value = false
    }
  }

  async function fetchSession(sessionId: number) {
    loading.value = true
    error.value = null
    try {
      const res = await api.fetchUnclaimedSession(sessionId)
      currentSession.value = res.data.data
    } catch {
      currentSession.value = null
      error.value = '세션 정보를 불러오지 못했습니다'
    } finally {
      loading.value = false
    }
  }

  async function fetchResults(sessionId: number) {
    try {
      const res = await api.fetchUnclaimedResults(sessionId)
      results.value = res.data.data
    } catch {
      results.value = []
    }
  }

  function reset() {
    currentSession.value = null
    results.value = []
    error.value = null
  }

  return {
    sessions, currentSession, results, loading, error,
    fetchSessions, fetchSession, fetchResults, reset,
  }
})
