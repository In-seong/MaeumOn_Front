<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('admin@mauemon.com')
const password = ref('password')
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  const success = await authStore.login(email.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = authStore.error || '로그인에 실패했습니다.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
        보험ON 관리자
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이메일
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="관리자 이메일"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            비밀번호
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="비밀번호"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-2 px-4 rounded-md transition-colors"
        >
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <p class="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
        테스트 계정: admin@mauemon.com / password
      </p>
    </div>
  </div>
</template>
