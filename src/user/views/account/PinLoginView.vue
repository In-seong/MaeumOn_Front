<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex flex-col">
      <!-- Header -->
      <div class="pt-16 pb-6 text-center">
        <h1 class="text-[22px] font-bold text-[#333]">간편 비밀번호 입력</h1>
        <p class="text-[14px] text-[#888] mt-2">6자리 비밀번호를 입력하세요</p>
      </div>

      <!-- PIN Dots -->
      <div class="flex justify-center gap-4 mb-10">
        <div v-for="i in 6" :key="i"
          class="w-[14px] h-[14px] rounded-full transition-all duration-200"
          :class="pin.length >= i ? 'bg-[#FF7B22] scale-110' : 'bg-[#E0E0E0]'" />
      </div>

      <!-- Error Message -->
      <div v-if="error" class="text-center mb-4">
        <p class="text-[13px] text-red-500">{{ error }}</p>
      </div>

      <!-- Keypad -->
      <div class="px-10 mt-auto mb-16">
        <div class="grid grid-cols-3 gap-4">
          <button v-for="num in [1,2,3,4,5,6,7,8,9]" :key="num"
            class="h-[60px] rounded-2xl text-[22px] font-semibold text-[#333] active:bg-[#F0F0F0] transition-colors"
            @click="inputPin(num)">
            {{ num }}
          </button>
          <div />
          <button
            class="h-[60px] rounded-2xl text-[22px] font-semibold text-[#333] active:bg-[#F0F0F0] transition-colors"
            @click="inputPin(0)">
            0
          </button>
          <button
            class="h-[60px] rounded-2xl flex items-center justify-center active:bg-[#F0F0F0] transition-colors"
            @click="deletePin">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M22 3H7c-.69 0-1.23.35-1.59.88L0 12l5.41 8.12c.36.53.9.88 1.59.88h15c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-3 12.59L17.59 17 14 13.41 10.41 17 9 15.59 12.59 12 9 8.41 10.41 7 14 10.59 17.59 7 19 8.41 15.41 12 19 15.59z" fill="#999"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const pin = ref('')
const error = ref('')

function inputPin(num: number): void {
  if (pin.value.length < 6) {
    pin.value += num.toString()
    error.value = ''
  }
}

function deletePin(): void {
  pin.value = pin.value.slice(0, -1)
  error.value = ''
}

watch(pin, (newPin) => {
  if (newPin.length === 6) {
    verifyPin(newPin)
  }
})

function verifyPin(_code: string): void {
  // TODO: PIN 인증 API 연동
  localStorage.setItem('userIsLoggedIn', 'true')
  router.push('/')
}
</script>
