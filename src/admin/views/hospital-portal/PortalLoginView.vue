<template>
  <div class="min-h-screen bg-[#F8F8F8] flex items-center justify-center p-4">
    <div class="w-full max-w-[400px] bg-white rounded-[20px] shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-8">
      <div class="text-center mb-8">
        <div class="w-16 h-16 mx-auto rounded-full bg-[#FFF0E5] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M3 21H21" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
            <path d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21" stroke="#FF7B22" stroke-width="2"/>
            <path d="M12 7V13M9 10H15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <h1 class="text-[22px] font-bold text-[#222]">병원 포털</h1>
        <p class="text-[14px] text-[#888] mt-1">예약 관리 시스템</p>
      </div>

      <div class="space-y-4">
        <div>
          <label class="text-[13px] font-medium text-[#555] mb-1.5 block">아이디</label>
          <input v-model="username" type="text" placeholder="아이디를 입력하세요"
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF7B22]"
            @keyup.enter="login" />
        </div>
        <div>
          <label class="text-[13px] font-medium text-[#555] mb-1.5 block">비밀번호</label>
          <input v-model="password" type="password" placeholder="비밀번호를 입력하세요"
            class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF7B22]"
            @keyup.enter="login" />
        </div>
        <p v-if="errorMsg" class="text-[13px] text-red-500">{{ errorMsg }}</p>
        <button @click="login" :disabled="loading"
          class="w-full py-3.5 bg-[#FF7B22] text-white rounded-[12px] text-[16px] font-semibold hover:bg-[#E66A1A] disabled:opacity-50 transition-colors active:scale-[0.98]">
          {{ loading ? '로그인 중...' : '로그인' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { hospitalPortalLogin } from '../../services/adminApi'

const router = useRouter()
const username = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

async function login() {
  if (!username.value || !password.value) { errorMsg.value = '아이디와 비밀번호를 입력하세요.'; return }
  loading.value = true
  errorMsg.value = ''
  try {
    const res = await hospitalPortalLogin(username.value, password.value)
    const data = res.data.data
    localStorage.setItem('portalToken', data.token)
    localStorage.setItem('portalName', data.account_name || '')
    router.push({ name: 'portal-reservations' })
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    errorMsg.value = msg || '로그인에 실패했습니다.'
  } finally {
    loading.value = false
  }
}
</script>
