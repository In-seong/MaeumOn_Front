<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const isLoading = ref(false)
const error = ref('')

const handleLogin = async () => {
  isLoading.value = true
  error.value = ''

  try {
    // TODO: API 연동
    // const response = await api.post('/auth/login', { email: email.value, password: password.value })

    // 임시 로그인 처리
    authStore.setLoggedIn(true)
    router.push('/')
  } catch (e) {
    error.value = 'Login failed. Please try again.'
  } finally {
    isLoading.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        Login
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter your password"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="isLoading"
          class="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white py-2 px-4 rounded-md transition-colors"
        >
          {{ isLoading ? 'Loading...' : 'Login' }}
        </button>
      </form>
    </div>
  </div>
</template>
