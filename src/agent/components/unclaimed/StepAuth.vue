<template>
  <div class="space-y-4">
    <h3 class="text-[16px] font-bold text-[#222]">본인인증</h3>
    <p class="text-[13px] text-[#888]">고객 본인인증을 진행해주세요. 간편인증 앱에서 인증을 완료해야 합니다.</p>

    <!-- 인증 방식 선택 -->
    <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 space-y-3">
      <div>
        <label class="block text-[12px] text-[#888] mb-1">통신사</label>
        <select
          v-model="telecom"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] bg-white"
        >
          <option value="">선택</option>
          <option v-for="t in telecomCodes" :key="t.value" :value="t.value">{{ t.label }}</option>
        </select>
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">인증 방식</label>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="m in authMethods"
            :key="m.value"
            :class="[
              'py-3 rounded-[10px] text-[13px] font-medium border transition-colors text-center',
              loginTypeLevel === m.value ? 'border-[#FF7B22] bg-[#FFF8F3] text-[#FF7B22]' : 'border-[#E0E0E0] text-[#888]'
            ]"
            @click="loginTypeLevel = m.value"
          >
            {{ m.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- 인증 진행 상태 -->
    <div v-if="authStatus === 'requesting'" class="bg-white rounded-[14px] border border-[#E8E8E8] p-6 text-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto mb-4" />
      <p class="text-[14px] text-[#333] font-medium">인증 요청 중...</p>
      <p class="text-[12px] text-[#999] mt-1">잠시만 기다려주세요.</p>
    </div>

    <div v-else-if="authStatus === 'waiting'" class="bg-white rounded-[14px] border border-[#FF7B22] p-6 text-center">
      <svg class="w-12 h-12 text-[#FF7B22] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>
      <p class="text-[14px] text-[#333] font-bold">간편인증 앱을 확인해주세요</p>
      <p class="text-[12px] text-[#999] mt-2">고객 휴대폰의 인증 앱에서 인증을 완료해주세요.</p>
      <p class="text-[12px] text-[#FF7B22] mt-2 font-medium">제한시간 3분</p>

      <button
        class="mt-4 w-full py-3 bg-[#FF7B22] text-white text-[14px] font-bold rounded-[12px] active:scale-[0.98] transition-transform"
        :disabled="confirming"
        @click="confirmAuth"
      >
        {{ confirming ? '확인 중...' : '인증 완료 확인' }}
      </button>
    </div>

    <div v-else-if="authStatus === 'completed'" class="bg-white rounded-[14px] border border-green-300 p-6 text-center">
      <svg class="w-12 h-12 text-green-500 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-[14px] text-[#333] font-bold">인증 완료</p>
      <p class="text-[12px] text-[#999] mt-1">본인인증이 정상적으로 완료되었습니다.</p>
    </div>

    <div v-else-if="authStatus === 'failed'" class="bg-white rounded-[14px] border border-red-300 p-6 text-center">
      <svg class="w-12 h-12 text-red-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-[14px] text-[#333] font-bold">인증 실패</p>
      <p class="text-[12px] text-red-500 mt-1">{{ errorMsg }}</p>
      <button
        class="mt-4 w-full py-2.5 border border-[#FF7B22] text-[#FF7B22] text-[13px] font-medium rounded-[12px]"
        @click="resetAuth"
      >
        다시 시도
      </button>
    </div>

    <!-- 인증 요청 버튼 -->
    <button
      v-if="authStatus === 'idle'"
      class="w-full py-3.5 bg-[#FF7B22] text-white text-[14px] font-bold rounded-[12px] active:scale-[0.98] transition-transform disabled:opacity-40"
      :disabled="!canRequest"
      @click="requestAuth"
    >
      인증 요청
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { startUnclaimedFetch, confirmUnclaimedFetch } from '../../services/agentApi'

const props = defineProps<{
  sessionId: number
  defaultTelecom?: string
}>()

const emit = defineEmits<{
  'auth-completed': []
}>()

const telecom = ref(props.defaultTelecom ?? '')
const loginTypeLevel = ref('1')
const authStatus = ref<'idle' | 'requesting' | 'waiting' | 'completed' | 'failed'>('idle')
const confirming = ref(false)
const errorMsg = ref('')

const telecomCodes = [
  { value: '0', label: 'SKT' },
  { value: '1', label: 'KT' },
  { value: '2', label: 'LGU+' },
  { value: '3', label: 'SKT 알뜰폰' },
  { value: '4', label: 'KT 알뜰폰' },
  { value: '5', label: 'LGU+ 알뜰폰' },
]

const authMethods = [
  { value: '1', label: '카카오톡' },
  { value: '2', label: 'PASS' },
  { value: '6', label: '네이버' },
  { value: '4', label: 'PAYCO' },
]

const canRequest = computed(() => telecom.value !== '' && loginTypeLevel.value !== '')

async function requestAuth() {
  authStatus.value = 'requesting'
  errorMsg.value = ''
  try {
    await startUnclaimedFetch(props.sessionId, {
      loginTypeLevel: loginTypeLevel.value,
      telecom: telecom.value,
    })
    authStatus.value = 'waiting'
  } catch (e: unknown) {
    authStatus.value = 'failed'
    const err = e as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message ?? '인증 요청에 실패했습니다.'
  }
}

async function confirmAuth() {
  confirming.value = true
  try {
    await confirmUnclaimedFetch(props.sessionId, {})
    authStatus.value = 'completed'
    emit('auth-completed')
  } catch (e: unknown) {
    authStatus.value = 'failed'
    const err = e as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message ?? '인증 확인에 실패했습니다.'
  } finally {
    confirming.value = false
  }
}

function resetAuth() {
  authStatus.value = 'idle'
  errorMsg.value = ''
}
</script>
