<template>
  <div class="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
    <div class="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-10">
      <div class="flex flex-col items-center gap-3 mb-10">
        <img src="/icons/LogoIcon.svg" alt="보험청구ON" class="w-16 h-16" />
        <span class="text-[24px] font-jalnan font-bold text-black">보험청구ON</span>
        <span class="text-[14px] text-[#999]">설계사 전용</span>
      </div>

      <form class="flex flex-col gap-5" @submit.prevent="handleLogin">
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">아이디</label>
          <input
            v-model="username"
            type="text"
            placeholder="아이디를 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">비밀번호</label>
          <input
            v-model="password"
            type="password"
            placeholder="비밀번호를 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>

        <label class="flex items-center gap-2 cursor-pointer">
          <input
            v-model="saveId"
            type="checkbox"
            class="w-4 h-4 rounded border-[#E8E8E8] text-[#FF7B22] focus:ring-[#FF7B22]"
          />
          <span class="text-[13px] text-[#888]">아이디 저장</span>
        </label>

        <p v-if="agentAuthStore.error" class="text-[13px] text-[#FF3B30] text-center">
          {{ agentAuthStore.error }}
        </p>

        <button
          type="submit"
          class="w-full h-12 bg-[#FF7B22] text-white text-[15px] font-semibold rounded-lg hover:bg-[#E56D1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="agentAuthStore.loading"
        >
          {{ agentAuthStore.loading ? '로그인 중...' : '로그인' }}
        </button>
      </form>

      <p class="mt-8 text-[12px] text-[#B0B0B0] text-center">
        계정 관련 문의는 관리자에게 연락하세요
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../stores/agentAuthStore'

const router = useRouter()
const agentAuthStore = useAgentAuthStore()

const savedId = localStorage.getItem('agent_saved_id')
const username = ref(savedId ?? '')
const password = ref('')
const saveId = ref(!!savedId)

async function handleLogin() {
  if (!username.value || !password.value) {
    agentAuthStore.error = '아이디와 비밀번호를 입력하세요'
    return
  }

  if (saveId.value) {
    localStorage.setItem('agent_saved_id', username.value)
  } else {
    localStorage.removeItem('agent_saved_id')
  }

  try {
    localStorage.removeItem('agentToken')
    await agentAuthStore.login(username.value, password.value)
    router.push('/')
  } catch {
    // Error already set in store
  }
}
</script>
