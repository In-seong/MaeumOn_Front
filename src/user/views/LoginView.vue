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
          placeholder="휴대폰 번호 입력 (- 없이)"
          type="tel"
          :disabled="otpSent"
        />

        <div class="flex gap-2">
          <div class="flex-1">
            <input
              v-model="authCode"
              placeholder="인증번호 6자리 입력"
              maxlength="6"
              inputmode="numeric"
              :disabled="!otpSent"
              class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] disabled:opacity-50"
            />
          </div>
          <button
            class="px-4 py-3.5 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] text-[13px] font-semibold whitespace-nowrap disabled:opacity-50"
            :disabled="!isPhoneValid || authStore.loading || (otpSent && countdown > 0)"
            @click="handleSendOtp"
          >
            <template v-if="countdown > 0">{{ countdownText }}</template>
            <template v-else-if="otpSent">재전송</template>
            <template v-else>인증요청</template>
          </button>
        </div>

        <!-- 개발환경 OTP 표시 -->
        <div v-if="authStore.debugOtp" class="p-2 bg-yellow-50 border border-yellow-300 text-yellow-800 rounded text-xs">
          [개발] 인증번호: {{ authStore.debugOtp }}
        </div>

        <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ authStore.error }}
        </div>

        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold mt-2 active:scale-[0.98] transition-transform disabled:opacity-50"
          :disabled="!otpSent || authCode.length !== 6 || authStore.loading"
          @click="handleVerifyOtp"
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
import { ref, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import FormInput from '@user/components/form/FormInput.vue'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const authCode = ref('')
const otpSent = ref(false)
const countdown = ref(0)
let countdownTimer: ReturnType<typeof setInterval> | null = null

const isPhoneValid = computed(() => /^01[0-9]{8,9}$/.test(phone.value))
const countdownText = computed(() => {
  const min = Math.floor(countdown.value / 60)
  const sec = countdown.value % 60
  return `${min}:${sec.toString().padStart(2, '0')}`
})

function startCountdown(): void {
  countdown.value = 180 // 3분
  if (countdownTimer) clearInterval(countdownTimer)
  countdownTimer = setInterval(() => {
    countdown.value--
    if (countdown.value <= 0) {
      if (countdownTimer) clearInterval(countdownTimer)
    }
  }, 1000)
}

async function handleSendOtp(): Promise<void> {
  authStore.error = null
  const success = await authStore.sendOtp(phone.value)
  if (success) {
    otpSent.value = true
    authCode.value = ''
    startCountdown()
  }
}

async function handleVerifyOtp(): Promise<void> {
  const success = await authStore.verifyOtp(authCode.value)
  if (success) {
    router.push('/pin-login')
  }
}

onUnmounted(() => {
  if (countdownTimer) clearInterval(countdownTimer)
})
</script>
