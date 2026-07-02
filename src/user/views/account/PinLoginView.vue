<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex flex-col">
      <!-- Header -->
      <div class="pt-16 pb-4 text-center">
        <h1 class="text-[22px] font-bold text-[#333]">{{ headerTitle }}</h1>
        <p class="text-[14px] text-[#888] mt-2">{{ headerSubtitle }}</p>
      </div>

      <!-- 신규 회원: 이름 입력 -->
      <div v-if="authStore.pinMode === 'register' && !nameConfirmed" class="px-8 mb-6">
        <input
          v-model="userName"
          placeholder="이름을 입력해주세요"
          class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] text-center"
          @keydown.enter="confirmName"
        />
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold mt-3 active:scale-[0.98] transition-transform disabled:opacity-50"
          :disabled="!userName.trim()"
          @click="confirmName"
        >
          다음
        </button>
      </div>

      <!-- PIN 입력 영역 (이름 입력 후 또는 기존 회원) -->
      <template v-if="authStore.pinMode !== 'register' || nameConfirmed">
        <!-- PIN 확인 단계 표시 -->
        <div v-if="isSettingPin" class="text-center mb-2">
          <p class="text-[13px] text-[#FF7B22] font-medium">
            {{ confirmStep ? 'PIN을 한 번 더 입력해주세요' : 'PIN 6자리를 설정해주세요' }}
          </p>
        </div>

        <!-- PIN Dots -->
        <div class="flex justify-center gap-4 mb-8">
          <div v-for="i in 6" :key="i"
            class="w-[14px] h-[14px] rounded-full transition-all duration-200"
            :class="pin.length >= i ? 'bg-[#FF7B22] scale-110' : 'bg-[#E0E0E0]'" />
        </div>

        <!-- Error Message -->
        <div v-if="error" class="text-center mb-4">
          <p class="text-[13px] text-red-500">{{ error }}</p>
        </div>

        <!-- Loading -->
        <div v-if="authStore.loading" class="text-center mb-4">
          <p class="text-[13px] text-[#888]">처리 중...</p>
        </div>

        <!-- Keypad -->
        <div class="px-10 mt-auto mb-16">
          <div class="grid grid-cols-3 gap-4">
            <button v-for="num in [1,2,3,4,5,6,7,8,9]" :key="num"
              class="h-[60px] rounded-2xl text-[22px] font-semibold text-[#333] active:bg-[#F0F0F0] transition-colors"
              :disabled="authStore.loading"
              @click="inputPin(num)">
              {{ num }}
            </button>
            <div />
            <button
              class="h-[60px] rounded-2xl text-[22px] font-semibold text-[#333] active:bg-[#F0F0F0] transition-colors"
              :disabled="authStore.loading"
              @click="inputPin(0)">
              0
            </button>
            <button
              class="h-[60px] rounded-2xl flex items-center justify-center active:bg-[#F0F0F0] transition-colors"
              :disabled="authStore.loading"
              @click="deletePin">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.53.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" fill="#999"/>
              </svg>
            </button>
          </div>
        </div>
      </template>

      <!-- 휴대폰 인증으로 돌아가기 -->
      <div class="px-6 pb-8 text-center">
        <button
          class="text-[13px] text-[#999] underline"
          @click="goBackToOtp"
        >
          휴대폰 인증으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const pin = ref('')
const firstPin = ref('')
const confirmStep = ref(false)
const error = ref('')
const userName = ref('')
const nameConfirmed = ref(false)

// PIN 설정 모드 (register 또는 setup)
const isSettingPin = computed(() =>
  authStore.pinMode === 'register' || authStore.pinMode === 'setup'
)

const headerTitle = computed(() => {
  if (authStore.pinMode === 'register') {
    return nameConfirmed.value ? '간편 비밀번호 설정' : '회원가입'
  }
  if (authStore.pinMode === 'setup') return '간편 비밀번호 설정'
  return '간편 비밀번호 입력'
})

const headerSubtitle = computed(() => {
  if (authStore.pinMode === 'register' && !nameConfirmed.value) {
    return '이름을 입력해주세요'
  }
  if (isSettingPin.value) {
    return confirmStep.value
      ? '확인을 위해 한 번 더 입력해주세요'
      : '6자리 비밀번호를 설정해주세요'
  }
  if (authStore.customerName) {
    return `${authStore.customerName}님, 비밀번호를 입력하세요`
  }
  return '6자리 비밀번호를 입력하세요'
})

function confirmName(): void {
  if (userName.value.trim()) {
    nameConfirmed.value = true
  }
}

function inputPin(num: number): void {
  if (pin.value.length < 6 && !authStore.loading) {
    pin.value += num.toString()
    error.value = ''
  }
}

function deletePin(): void {
  pin.value = pin.value.slice(0, -1)
  error.value = ''
}

watch(pin, async (newPin) => {
  if (newPin.length === 6) {
    await handlePinComplete(newPin)
  }
})

async function handlePinComplete(pinCode: string): Promise<void> {
  if (isSettingPin.value) {
    // PIN 설정 모드: 2번 입력 확인
    if (!confirmStep.value) {
      // 1차 입력
      firstPin.value = pinCode
      confirmStep.value = true
      pin.value = ''
      return
    }

    // 2차 확인 입력
    if (pinCode !== firstPin.value) {
      error.value = '비밀번호가 일치하지 않습니다. 다시 입력해주세요.'
      confirmStep.value = false
      firstPin.value = ''
      pin.value = ''
      return
    }

    // PIN 일치 → API 호출
    let success = false
    if (authStore.pinMode === 'register') {
      success = await authStore.register(userName.value, pinCode)
    } else {
      success = await authStore.setPin(pinCode)
    }

    if (success) {
      router.push('/')
    } else {
      // 실패 시 리셋
      confirmStep.value = false
      firstPin.value = ''
      pin.value = ''
      error.value = authStore.error || '처리에 실패했습니다.'
    }
  } else {
    // PIN 로그인 모드
    const success = await authStore.loginWithPin(pinCode)
    if (success) {
      router.push('/')
    } else {
      pin.value = ''
      error.value = authStore.error || 'PIN이 올바르지 않습니다.'

      // 기기 미등록 → OTP 화면으로
      if (authStore.authStep === 'idle') {
        router.push('/login')
      }
    }
  }
}

function goBackToOtp(): void {
  authStore.resetAuth()
  router.push('/login')
}
</script>
