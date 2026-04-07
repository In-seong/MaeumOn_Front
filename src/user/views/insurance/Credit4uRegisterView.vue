<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내보험다보여 회원가입" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 안내 -->
        <CardSection class="mb-5">
          <p class="text-[14px] text-[#555] leading-relaxed">
            내보험다보여 서비스 이용을 위해 본인인증 후 회원가입을 진행합니다.
          </p>
        </CardSection>

        <!-- 가입 유형 선택 -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">가입 방식 선택</p>
          <div class="flex gap-3">
            <button
              class="flex-1 rounded-[12px] py-3 text-[14px] font-medium border-2 transition-colors"
              :class="registerType === '0'
                ? 'border-[#FF7B22] bg-[#FFF0E5] text-[#FF7B22]'
                : 'border-[#E8E8E8] bg-white text-[#888]'"
              @click="registerType = '0'"
            >
              한번에 가입
            </button>
            <button
              class="flex-1 rounded-[12px] py-3 text-[14px] font-medium border-2 transition-colors"
              :class="registerType === '1'
                ? 'border-[#FF7B22] bg-[#FFF0E5] text-[#FF7B22]'
                : 'border-[#E8E8E8] bg-white text-[#888]'"
              @click="registerType = '1'"
            >
              본인인증 후 가입
            </button>
          </div>
          <p class="text-[11px] text-[#999] mt-1.5 px-1">
            {{ registerType === '0' ? '본인인증과 동시에 아이디/비밀번호를 설정합니다.' : '본인인증 완료 후 아이디/비밀번호를 별도 입력합니다.' }}
          </p>
        </div>

        <!-- 본인인증 정보 -->
        <div class="flex flex-col gap-3 mb-4">
          <FormInput
            v-model="form.userName"
            label="이름"
            placeholder="실명을 입력하세요"
          />
          <FormInput
            v-model="form.identity"
            label="주민등록번호"
            placeholder="- 없이 13자리 입력"
            type="password"
          />
          <div class="flex flex-col gap-1.5">
            <label class="text-[13px] font-medium text-[#555]">통신사</label>
            <div class="grid grid-cols-3 gap-2">
              <button
                v-for="t in telecomOptions"
                :key="t.value"
                class="rounded-[10px] py-2.5 text-[13px] font-medium border transition-colors"
                :class="form.telecom === t.value
                  ? 'border-[#FF7B22] bg-[#FFF0E5] text-[#FF7B22]'
                  : 'border-[#E8E8E8] bg-[#F8F8F8] text-[#888]'"
                @click="form.telecom = t.value"
              >
                {{ t.label }}
              </button>
            </div>
          </div>
          <FormInput
            v-model="form.phoneNo"
            label="휴대폰번호"
            placeholder="- 없이 입력 (예: 01012345678)"
            type="tel"
          />
        </div>

        <!-- type=0일 때 가입정보도 함께 입력 -->
        <div v-if="registerType === '0'" class="flex flex-col gap-3 mb-4">
          <div class="border-t border-[#F0F0F0] pt-4">
            <p class="text-[15px] font-semibold text-[#222] mb-3">가입 정보</p>
          </div>
          <FormInput
            v-model="form.id"
            label="아이디"
            placeholder="6~12자 영문+숫자"
          />
          <FormInput
            v-model="form.password"
            label="비밀번호"
            type="password"
            placeholder="9~20자 영문+숫자+특수문자"
          />
          <FormInput
            v-model="form.email"
            label="이메일"
            type="email"
            placeholder="example@email.com"
          />
        </div>

        <!-- 에러 메시지 -->
        <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
          <p class="text-[13px] text-red-600">{{ store.error }}</p>
        </div>

        <!-- 가입 버튼 -->
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          :disabled="!isFormValid || store.loading"
          @click="onRegister"
        >
          <span v-if="store.loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            회원가입 처리 중...
          </span>
          <span v-else>회원가입</span>
        </button>

        <!-- 로딩 안내 -->
        <LoadingNotice v-if="store.loading" />

        <!-- 안내 -->
        <CardSection class="!bg-[#F8F8F8]">
          <p class="text-[12px] text-[#999] leading-relaxed">
            * 본인인증을 위해 보안문자, SMS 인증 등의 추가 인증이 필요할 수 있습니다.
          </p>
        </CardSection>
      </main>

      <!-- 2-Way 인증 모달 -->
      <Credit4u2WayModal
        :visible="store.twoWayPending"
        @close="store.reset2Way()"
        @confirmed="onRegisterConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import FormInput from '@user/components/form/FormInput.vue'
import Credit4u2WayModal from '@user/components/Credit4u2WayModal.vue'
import LoadingNotice from '@user/components/ui/LoadingNotice.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'

const router = useRouter()
const store = useCredit4uStore()

const registerType = ref<'0' | '1'>('0')

const form = reactive({
  userName: '',
  identity: '',
  telecom: '',
  phoneNo: '',
  id: '',
  password: '',
  email: '',
})

const telecomOptions = [
  { value: '0', label: 'SKT' },
  { value: '1', label: 'KT' },
  { value: '2', label: 'LG U+' },
  { value: '3', label: 'SKT 알뜰폰' },
  { value: '4', label: 'KT 알뜰폰' },
  { value: '5', label: 'LG U+ 알뜰폰' },
]

const isFormValid = computed(() => {
  const baseValid =
    form.userName.length > 0 &&
    form.identity.length === 13 &&
    form.telecom.length > 0 &&
    form.phoneNo.length >= 10

  if (registerType.value === '0') {
    return baseValid &&
      form.id.length >= 6 &&
      form.password.length >= 9 &&
      form.email.includes('@')
  }
  return baseValid
})

async function onRegister(): Promise<void> {
  store.clearError()

  const data: any = {
    userName: form.userName,
    identity: form.identity,
    telecom: form.telecom,
    phoneNo: form.phoneNo,
    type: registerType.value,
  }

  if (registerType.value === '0') {
    data.id = form.id
    data.password = form.password
    data.email = form.email
  }

  const success = await store.register(data)

  if (success) {
    // 가입 성공 → 로그인 화면으로
    router.push('/insurance/credit4u/login')
  }
  // 2-Way 대기 시 모달이 표시됨
}

function onRegisterConfirmed(): void {
  // 가입 완료 → 로그인 화면으로
  router.push('/insurance/credit4u/login')
}
</script>
