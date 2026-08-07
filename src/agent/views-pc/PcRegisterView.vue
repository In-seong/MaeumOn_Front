<template>
  <div class="min-h-screen bg-[#F8F8F8] flex items-center justify-center">
    <div class="w-full max-w-[440px] bg-white rounded-2xl shadow-lg p-10">
      <div class="flex flex-col items-center gap-2 mb-8">
        <img src="/icons/LogoIcon.svg" alt="ON:CARE" class="w-14 h-14" />
        <span class="text-[22px] font-jalnan font-bold text-black">ON:CARE</span>
        <span class="text-[14px] text-[#999]">설계사 회원가입</span>
      </div>

      <form class="flex flex-col gap-4" @submit.prevent="handleRegister">
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">이름</label>
          <input
            v-model="form.name"
            type="text"
            placeholder="이름을 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">아이디</label>
          <input
            v-model="form.username"
            type="text"
            placeholder="아이디를 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">비밀번호</label>
          <input
            v-model="form.password"
            type="password"
            placeholder="6자 이상 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">비밀번호 확인</label>
          <input
            v-model="form.password_confirmation"
            type="password"
            placeholder="비밀번호를 다시 입력하세요"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">전화번호 (선택)</label>
          <input
            v-model="form.phone"
            type="text"
            placeholder="010-0000-0000"
            class="w-full h-11 px-4 border border-[#E0E0E0] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22] focus:ring-1 focus:ring-[#FF7B22] transition-colors"
          />
        </div>

        <p v-if="errorMsg" class="text-[13px] text-[#FF3B30] text-center">
          {{ errorMsg }}
        </p>

        <button
          type="submit"
          class="w-full h-12 bg-[#FF7B22] text-white text-[15px] font-semibold rounded-lg hover:bg-[#E56D1E] transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
          :disabled="loading"
        >
          {{ loading ? '가입 중...' : '회원가입' }}
        </button>
      </form>

      <p class="mt-6 text-[13px] text-[#888] text-center">
        이미 계정이 있으신가요?
        <router-link to="/login" class="text-[#FF7B22] font-semibold">로그인</router-link>
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import api from '@shared/api'

const router = useRouter()
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const form = reactive({
  name: '',
  username: '',
  password: '',
  password_confirmation: '',
  phone: '',
})

async function handleRegister() {
  errorMsg.value = null

  if (!form.name || !form.username || !form.password) {
    errorMsg.value = '이름, 아이디, 비밀번호를 입력하세요'
    return
  }
  if (form.password.length < 6) {
    errorMsg.value = '비밀번호는 6자 이상이어야 합니다'
    return
  }
  if (form.password !== form.password_confirmation) {
    errorMsg.value = '비밀번호가 일치하지 않습니다'
    return
  }

  loading.value = true
  try {
    const res = await api.post('/auth/agent-register', form)
    const token = res.data.token || res.data.data?.token
    if (token) {
      localStorage.setItem('agentToken', token)
      router.push('/')
    }
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string; errors?: Record<string, string[]> } } }
    const errors = err?.response?.data?.errors
    if (errors) {
      const firstKey = Object.keys(errors)[0]
      if (firstKey) {
        const msgs = errors[firstKey]
        errorMsg.value = msgs?.[0] ?? '회원가입에 실패했습니다.'
      }
    } else {
      errorMsg.value = err?.response?.data?.message || '회원가입에 실패했습니다.'
    }
  } finally {
    loading.value = false
  }
}
</script>
