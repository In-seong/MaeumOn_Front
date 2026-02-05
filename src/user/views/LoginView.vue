<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex flex-col">
      <!-- Logo Section -->
      <div class="flex-1 flex flex-col items-center justify-center pt-16 pb-8">
        <img src="/icons/LogoIcon.svg" alt="보험청구ON" class="w-[72px] h-[72px] mb-5" />
        <h1 class="text-[28px] font-bold text-[#FF7B22] mb-1">보험청구ON</h1>
        <p class="text-[14px] text-[#888]">내 보험을 한눈에</p>
      </div>

      <!-- Form Section -->
      <div class="px-6 pb-8 flex flex-col gap-3">
        <FormInput
          v-model="phone"
          placeholder="휴대폰 번호 입력"
          type="tel"
        />

        <div class="flex gap-2">
          <div class="flex-1">
            <input
              v-model="authCode"
              placeholder="인증번호 입력"
              class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
            />
          </div>
          <button class="px-4 py-3.5 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] text-[13px] font-semibold whitespace-nowrap">
            인증요청
          </button>
        </div>

        <div v-if="error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ error }}
        </div>

        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold mt-2 active:scale-[0.98] transition-transform"
          :disabled="authStore.loading"
          @click="handleLogin"
        >
          {{ authStore.loading ? '인증 중...' : '인증' }}
        </button>
      </div>

      <!-- Footer Links -->
      <div class="px-6 pb-10 flex items-center justify-center gap-4">
        <button class="text-[12px] text-[#999]">이용약관</button>
        <span class="text-[#D9D9D9]">|</span>
        <button class="text-[12px] text-[#999]">개인정보처리방침</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import FormInput from '@user/components/form/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const authCode = ref('')
const error = ref('')

function handleLogin(): void {
  // TODO: 전화번호 인증 API 연동
  error.value = ''
  router.push('/pin-login')
}
</script>
