<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const username = ref('admin')
const password = ref('password')
const error = ref('')

const handleLogin = async () => {
  error.value = ''

  const success = await authStore.login(username.value, password.value)

  if (success) {
    router.push('/')
  } else {
    error.value = authStore.error || '로그인에 실패했습니다.'
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
    <div class="bg-white p-8 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] w-full max-w-md">
      <h1 class="text-2xl font-bold text-[#FF7B22] mb-6 text-center">
        마음ON 관리자
      </h1>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1">
            사용자명
          </label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[15px] text-[#333] placeholder-[#999]"
            placeholder="관리자 사용자명"
          />
        </div>

        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1">
            비밀번호
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[15px] text-[#333] placeholder-[#999]"
            placeholder="비밀번호"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm">
          {{ error }}
        </div>

        <button
          type="submit"
          :disabled="authStore.loading"
          class="w-full bg-[#FF7B22] hover:bg-[#E56D1E] disabled:opacity-50 text-white py-3.5 px-4 rounded-[12px] transition-colors font-medium text-[15px]"
        >
          {{ authStore.loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <p class="mt-4 text-center text-[12px] text-[#999]">
        테스트 계정: admin / password
      </p>
    </div>
  </div>
</template>
