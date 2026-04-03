<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="비밀번호 변경" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 완료 화면 -->
        <template v-if="isCompleted">
          <CardSection class="mb-5">
            <div class="text-center py-4">
              <div class="w-[56px] h-[56px] mx-auto mb-3 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-[16px] font-bold text-[#222] mb-2">비밀번호가 변경되었습니다</p>
              <p class="text-[13px] text-[#888]">변경된 비밀번호로 로그인해주세요.</p>
            </div>
          </CardSection>

          <button
            class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
            @click="router.push('/insurance/credit4u/login')"
          >
            로그인하러 가기
          </button>
        </template>

        <!-- 입력 화면 -->
        <template v-else>
          <CardSection class="mb-5">
            <p class="text-[14px] text-[#555] leading-relaxed">
              본인인증 후 내보험다보여 비밀번호를 변경할 수 있습니다.
              보안문자, SMS 인증 등 추가 인증이 필요할 수 있습니다.
            </p>
          </CardSection>

          <!-- 변경 방식 선택 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">변경 방식</p>
            <div class="flex gap-3">
              <button
                class="flex-1 rounded-[12px] py-3 text-[14px] font-medium border-2 transition-colors"
                :class="changeType === '0'
                  ? 'border-[#FF7B22] bg-[#FFF0E5] text-[#FF7B22]'
                  : 'border-[#E8E8E8] bg-white text-[#888]'"
                @click="changeType = '0'"
              >
                바로 변경
              </button>
              <button
                class="flex-1 rounded-[12px] py-3 text-[14px] font-medium border-2 transition-colors"
                :class="changeType === '1'
                  ? 'border-[#FF7B22] bg-[#FFF0E5] text-[#FF7B22]'
                  : 'border-[#E8E8E8] bg-white text-[#888]'"
                @click="changeType = '1'"
              >
                인증 후 변경
              </button>
            </div>
            <p class="text-[11px] text-[#999] mt-1.5 px-1">
              {{ changeType === '0' ? '새 비밀번호를 먼저 입력하고 본인인증을 진행합니다.' : '본인인증 완료 후 새 비밀번호를 입력합니다.' }}
            </p>
          </div>

          <div class="flex flex-col gap-3 mb-4">
            <FormInput
              v-model="form.id"
              label="아이디"
              placeholder="내보험다보여 아이디"
            />

            <!-- type=0: 새 비밀번호 먼저 입력 -->
            <FormInput
              v-if="changeType === '0'"
              v-model="form.newPassword"
              label="새 비밀번호"
              type="password"
              placeholder="9~20자 영문+숫자+특수문자"
            />

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

          <!-- 에러 메시지 -->
          <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
            <p class="text-[13px] text-red-600">{{ store.error }}</p>
          </div>

          <!-- 변경 버튼 -->
          <button
            class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            :disabled="!isFormValid || store.loading"
            @click="onChangePassword"
          >
            <span v-if="store.loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              처리 중...
            </span>
            <span v-else>비밀번호 변경</span>
          </button>

          <!-- 로딩 안내 -->
          <LoadingNotice v-if="store.loading" />

          <!-- 안내 -->
          <CardSection class="!bg-[#FFF9F0] mb-4">
            <div class="flex items-start gap-2">
              <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <p class="text-[12px] text-[#888] leading-relaxed">
                비밀번호 변경 시 보안문자, SMS, 이메일 임시비밀번호 인증 등 최대 4단계의 추가 인증이 필요할 수 있습니다.
              </p>
            </div>
          </CardSection>
        </template>
      </main>

      <!-- 2-Way 인증 모달 -->
      <Credit4u2WayModal
        :visible="store.twoWayPending"
        @close="store.reset2Way()"
        @confirmed="onChangePwdConfirmed"
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

const changeType = ref<'0' | '1'>('0')
const isCompleted = ref(false)

const form = reactive({
  id: '',
  newPassword: '',
  userName: '',
  identity: '',
  telecom: '',
  phoneNo: '',
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
    form.id.length > 0 &&
    form.userName.length > 0 &&
    form.identity.length === 13 &&
    form.telecom.length > 0 &&
    form.phoneNo.length >= 10

  if (changeType.value === '0') {
    return baseValid && form.newPassword.length >= 9
  }
  return baseValid
})

async function onChangePassword(): Promise<void> {
  store.clearError()

  const data: any = {
    id: form.id,
    userName: form.userName,
    identity: form.identity,
    telecom: form.telecom,
    phoneNo: form.phoneNo,
    type: changeType.value,
  }

  if (changeType.value === '0') {
    data.password = form.newPassword
  }

  const success = await store.changePassword(data)

  if (success) {
    isCompleted.value = true
  }
  // 2-Way 대기 시 모달 표시됨
}

function onChangePwdConfirmed(): void {
  isCompleted.value = true
}
</script>
