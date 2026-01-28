<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
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
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-purple-700">
    <div class="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md mx-4">
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-purple-600 mb-2">보험ON</h1>
        <p class="text-gray-500 dark:text-gray-400">간편한 보험 청구 서비스</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            이메일
          </label>
          <input
            v-model="email"
            type="email"
            required
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="이메일을 입력하세요"
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="비밀번호를 입력하세요"
          />
        </div>

        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white py-3 px-4 rounded-lg font-medium transition-colors"
        >
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <div class="mt-6 text-center">
        <p class="text-gray-600 dark:text-gray-400">
          계정이 없으신가요?
          <router-link to="/register" class="text-purple-600 hover:text-purple-700 font-medium">
            회원가입
          </router-link>
        </p>
      </div>

      <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
        <p class="text-center text-sm text-gray-500 dark:text-gray-400">
          테스트 계정: user@mauemon.com / password
        </p>
      </div>
    </div>
  </div>
</template>
