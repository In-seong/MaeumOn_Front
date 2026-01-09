import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  // State
  const isLoggedIn = ref(localStorage.getItem('isLoggedIn') === 'true')
  const user = ref<Record<string, unknown> | null>(null)

  // Getters
  const isAuthenticated = computed(() => isLoggedIn.value)

  // Actions
  function setLoggedIn(value: boolean) {
    isLoggedIn.value = value
    localStorage.setItem('isLoggedIn', String(value))
  }

  function setUser(userData: Record<string, unknown> | null) {
    user.value = userData
  }

  function logout() {
    isLoggedIn.value = false
    user.value = null
    localStorage.removeItem('isLoggedIn')
  }

  return {
    isLoggedIn,
    user,
    isAuthenticated,
    setLoggedIn,
    setUser,
    logout,
  }
})
