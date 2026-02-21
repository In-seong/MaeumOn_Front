<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative flex flex-col items-center justify-center px-8">
      <!-- Logo -->
      <div class="flex flex-col items-center gap-3 mb-12">
        <img src="/icons/LogoIcon.svg" alt="보험청구ON" class="w-20 h-20" />
        <span class="text-[28px] font-jalnan font-bold text-black">보험청구ON</span>
        <span class="text-[14px] text-[#999]">설계사 전용</span>
      </div>

      <!-- Login Form -->
      <form class="w-full flex flex-col gap-4" @submit.prevent="handleLogin">
        <FormInput
          v-model="username"
          label="아이디"
          placeholder="아이디를 입력하세요"
        />
        <FormInput
          v-model="password"
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
        />

        <!-- Error Message -->
        <p v-if="agentAuthStore.error" class="text-[13px] text-[#FF3B30] text-center">
          {{ agentAuthStore.error }}
        </p>

        <!-- Login Button -->
        <ActionButton
          full
          large
          class="mt-2"
          :class="{ 'opacity-50 pointer-events-none': agentAuthStore.loading }"
          @click="handleLogin"
        >
          {{ agentAuthStore.loading ? '로그인 중...' : '로그인' }}
        </ActionButton>
      </form>

      <!-- Footer -->
      <p class="mt-8 text-[12px] text-[#B0B0B0]">
        계정 관련 문의는 관리자에게 연락하세요
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../stores/agentAuthStore'
import FormInput from '@user/components/form/FormInput.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'

const router = useRouter()
const agentAuthStore = useAgentAuthStore()

const username = ref('')
const password = ref('')

async function handleLogin() {
  if (!username.value || !password.value) {
    agentAuthStore.error = '아이디와 비밀번호를 입력하세요'
    return
  }
  try {
    await agentAuthStore.login(username.value, password.value)
    router.push('/')
  } catch {
    // Error already set in store
  }
}
</script>
