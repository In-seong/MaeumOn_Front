<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <!-- Overlay -->
      <div class="absolute inset-0 bg-black/50" @click.self="onClose" />

      <!-- Modal -->
      <div class="relative w-full max-w-[402px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 pb-8 animate-slide-up">
        <!-- Header -->
        <div class="flex items-center justify-between mb-5">
          <h3 class="text-[17px] font-bold text-[#222]">{{ modalTitle }}</h3>
          <button class="p-1" @click="onClose">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="#999" stroke-width="2" stroke-linecap="round" />
            </svg>
          </button>
        </div>

        <!-- 안내 메시지 -->
        <p v-if="guideMessage" class="text-[13px] text-[#888] mb-4 leading-relaxed">{{ guideMessage }}</p>

        <!-- 에러 메시지 -->
        <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
          <p class="text-[13px] text-red-600">{{ store.error }}</p>
        </div>

        <!-- 보안문자 (captcha) -->
        <div v-if="store.twoWayType === 'captcha'" class="flex flex-col gap-3">
          <div v-if="captchaImage" class="flex justify-center">
            <img :src="captchaImage" alt="보안문자" class="h-[60px] rounded-[8px] border border-[#E8E8E8]" />
          </div>
          <div v-else class="bg-[#F0F4FF] rounded-[10px] p-3 text-center">
            <p class="text-[12px] text-[#4A7CFF]">자동 인식 처리 중입니다. 확인 버튼을 눌러주세요.</p>
          </div>
          <FormInput
            v-if="captchaImage"
            v-model="inputValues.secureNo"
            label="보안문자 입력"
            placeholder="위 이미지의 문자를 입력하세요"
          />
        </div>

        <!-- SMS 인증번호 -->
        <div v-else-if="store.twoWayType === 'sms'" class="flex flex-col gap-3">
          <FormInput
            v-model="inputValues.smsAuthNo"
            label="SMS 인증번호"
            placeholder="문자로 받은 인증번호를 입력하세요"
            type="text"
            inputmode="numeric"
          />
        </div>

        <!-- PASS 간편인증 -->
        <div v-else-if="store.twoWayType === 'pass'" class="flex flex-col gap-3">
          <div class="bg-[#F0F4FF] rounded-[12px] p-4 text-center">
            <div class="w-[48px] h-[48px] mx-auto mb-3 bg-[#4A7CFF] rounded-full flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-[14px] font-semibold text-[#333] mb-1">PASS 앱 인증 요청</p>
            <p class="text-[12px] text-[#888] leading-relaxed">
              PASS 앱에서 인증 요청을 확인해주세요.<br/>
              인증 완료 후 아래 확인 버튼을 눌러주세요.
            </p>
          </div>
        </div>

        <!-- 이메일 인증번호 -->
        <div v-else-if="store.twoWayType === 'email'" class="flex flex-col gap-3">
          <FormInput
            v-model="inputValues.emailAuthNo"
            label="이메일 인증번호"
            placeholder="이메일로 받은 인증번호를 입력하세요"
          />
        </div>

        <!-- 가입정보 입력 (회원가입 시) -->
        <div v-else-if="store.twoWayType === 'register_info'" class="flex flex-col gap-3">
          <FormInput
            v-model="inputValues.userId"
            label="아이디"
            placeholder="6~12자 영문+숫자"
          />
          <FormInput
            v-model="inputValues.userPassword"
            label="비밀번호"
            type="password"
            placeholder="9~20자 영문+숫자+특수문자"
          />
          <FormInput
            v-model="inputValues.userEmail"
            label="이메일"
            type="email"
            placeholder="example@email.com"
          />
        </div>

        <!-- 임시비밀번호 입력 -->
        <div v-else-if="store.twoWayType === 'temp_password'" class="flex flex-col gap-3">
          <div class="bg-[#FFF9F0] rounded-[12px] p-4 mb-1">
            <p class="text-[12px] text-[#F3940E] leading-relaxed">
              이메일로 발송된 임시 비밀번호를 입력해주세요. 제한 시간 내에 입력해야 합니다.
            </p>
          </div>
          <FormInput
            v-model="inputValues.password1"
            label="임시 비밀번호"
            type="password"
            placeholder="이메일로 받은 임시 비밀번호"
            :show-toggle="true"
          />
        </div>

        <!-- 변경할 비밀번호 입력 -->
        <div v-else-if="store.twoWayType === 'new_password'" class="flex flex-col gap-3">
          <FormInput
            v-model="inputValues.password"
            label="새 비밀번호"
            type="password"
            placeholder="9~20자 영문+숫자+특수문자"
            :show-toggle="true"
          />
          <FormInput
            v-model="inputValues.passwordConfirm"
            label="비밀번호 확인"
            type="password"
            placeholder="새 비밀번호를 다시 입력하세요"
            :show-toggle="true"
          />
        </div>

        <!-- 확인 버튼 -->
        <button
          class="w-full mt-5 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="store.loading || !isInputValid"
          @click="onConfirm"
        >
          <span v-if="store.loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            인증 처리 중...
          </span>
          <span v-else>확인</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { reactive, computed } from 'vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'
import FormInput from '@user/components/form/FormInput.vue'
import type { TwoWayConfirmRequest } from '@shared/types/credit4u'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  close: []
  confirmed: []
}>()

const store = useCredit4uStore()

const inputValues = reactive({
  secureNo: '',
  smsAuthNo: '',
  emailAuthNo: '',
  userId: '',
  userPassword: '',
  userEmail: '',
  password1: '',
  password: '',
  passwordConfirm: '',
})

const modalTitle = computed(() => {
  switch (store.twoWayType) {
    case 'captcha': return '보안문자 입력'
    case 'sms': return 'SMS 인증'
    case 'pass': return 'PASS 인증'
    case 'email': return '이메일 인증'
    case 'register_info': return '가입정보 입력'
    case 'temp_password': return '임시 비밀번호 확인'
    case 'new_password': return '새 비밀번호 설정'
    default: return '추가 인증'
  }
})

const guideMessage = computed(() => {
  switch (store.twoWayType) {
    case 'captcha': return '보안문자를 정확히 입력해주세요.'
    case 'sms': return '휴대폰으로 전송된 인증번호를 입력해주세요.'
    case 'pass': return 'PASS 앱에서 인증을 완료한 후 확인 버튼을 눌러주세요.'
    case 'email': return '이메일로 전송된 인증번호를 입력해주세요.'
    case 'register_info': return '내보험다보여에서 사용할 아이디, 비밀번호, 이메일을 입력해주세요.'
    case 'temp_password': return null
    case 'new_password': return '새로 사용할 비밀번호를 입력해주세요.'
    default: return null
  }
})

// 보안문자 이미지 (CODEF 수동 입력 모드 시)
const captchaImage = computed(() => {
  const extra = (store.twoWayData as any)?.extraInfo || {}
  const img = extra.secureNoImage || extra.reqSecureNo
  // 이미지는 보통 base64로 긴 문자열, 빈 문자열이면 자동 인식 모드
  return typeof img === 'string' && img.length > 50 ? img : null
})

const isInputValid = computed(() => {
  switch (store.twoWayType) {
    case 'captcha': return !captchaImage.value || inputValues.secureNo.length > 0
    case 'sms': return inputValues.smsAuthNo.length > 0
    case 'pass': return true // PASS는 앱에서 인증 후 확인만
    case 'email': return inputValues.emailAuthNo.length > 0
    case 'register_info':
      return inputValues.userId.length >= 6 && inputValues.userPassword.length >= 9 && inputValues.userEmail.includes('@')
    case 'temp_password': return inputValues.password1.length > 0
    case 'new_password':
      return inputValues.password.length >= 9 && inputValues.password === inputValues.passwordConfirm
    default: return false
  }
})

function resetInputs(): void {
  inputValues.secureNo = ''
  inputValues.smsAuthNo = ''
  inputValues.emailAuthNo = ''
  inputValues.userId = ''
  inputValues.userPassword = ''
  inputValues.userEmail = ''
  inputValues.password1 = ''
  inputValues.password = ''
  inputValues.passwordConfirm = ''
}

async function onConfirm(): Promise<void> {
  store.clearError()

  // 비밀번호 확인 검증
  if (store.twoWayType === 'new_password' && inputValues.password !== inputValues.passwordConfirm) {
    store.error = '비밀번호가 일치하지 않습니다.'
    return
  }

  const request: TwoWayConfirmRequest = {}

  switch (store.twoWayType) {
    case 'captcha':
      request.secureNo = inputValues.secureNo
      break
    case 'sms':
      request.smsAuthNo = inputValues.smsAuthNo
      break
    case 'pass':
      request.simpleAuth = '1'
      break
    case 'email':
      request.emailAuthNo = inputValues.emailAuthNo
      break
    case 'register_info':
      request.id = inputValues.userId
      request.password = inputValues.userPassword
      request.email = inputValues.userEmail
      break
    case 'temp_password':
      request.password1 = inputValues.password1
      break
    case 'new_password':
      request.password = inputValues.password
      break
  }

  const success = await store.confirm2Way(request)

  if (success) {
    // 인증 완료 — 모달 닫기 + 부모에 알림
    resetInputs()
    emit('confirmed')
    emit('close')
  } else if (!store.twoWayPending) {
    // 인증 실패 & 더 이상 2-Way 아님 → 모달 닫기
    resetInputs()
    emit('close')
  }
  // twoWayPending이 아직 true면 다음 단계 → 모달 유지, 입력 초기화
  if (store.twoWayPending) {
    resetInputs()
  }
}

function onClose(): void {
  resetInputs()
  store.reset2Way()
  emit('close')
}
</script>

<style scoped>
.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
</style>
