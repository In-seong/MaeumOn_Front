<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내보험다보여 로그인" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 안내 -->
        <CardSection class="mb-5">
          <div class="text-center py-2">
            <div class="w-[56px] h-[56px] mx-auto mb-3 bg-[#FFF0E5] rounded-full flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="12" cy="7" r="4" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-[15px] font-semibold text-[#222] mb-1">내보험다보여 계정으로 로그인</p>
            <p class="text-[12px] text-[#999]">신용정보원 내보험다보여에 가입된 계정으로 로그인하세요.</p>
          </div>
        </CardSection>

        <!-- 로그인 폼 -->
        <div class="flex flex-col gap-3 mb-4">
          <FormInput
            v-model="loginId"
            label="아이디"
            placeholder="내보험다보여 아이디 입력"
          />
          <FormInput
            v-model="password"
            label="비밀번호"
            type="password"
            placeholder="비밀번호 입력"
          />
        </div>

        <!-- 에러 메시지 -->
        <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
          <p class="text-[13px] text-red-600">{{ store.error }}</p>
        </div>

        <!-- 로그인 버튼 -->
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-4"
          :disabled="!isFormValid || store.loading"
          @click="onLogin"
        >
          <span v-if="store.loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            보험 정보 조회 중...
          </span>
          <span v-else>로그인</span>
        </button>

        <!-- 로딩 안내 (장시간 대기) -->
        <LoadingNotice v-if="store.loading" />

        <!-- 링크 -->
        <div class="flex items-center justify-center gap-4 mb-6">
          <button class="text-[13px] text-[#888] underline" @click="router.push('/insurance/credit4u/register')">
            회원가입
          </button>
          <span class="text-[#D0D0D0]">|</span>
          <button class="text-[13px] text-[#888] underline" @click="router.push('/insurance/credit4u/find-id')">
            아이디 찾기
          </button>
          <span class="text-[#D0D0D0]">|</span>
          <button class="text-[13px] text-[#888] underline" @click="router.push('/insurance/credit4u/change-pwd')">
            비밀번호 변경
          </button>
        </div>

        <!-- 안내사항 -->
        <CardSection class="!bg-[#F8F8F8]">
          <div class="flex flex-col gap-1.5">
            <p class="text-[12px] text-[#999] leading-relaxed">
              * 내보험다보여 계정이 없으시면 회원가입을 진행해주세요.
            </p>
            <p class="text-[12px] text-[#999] leading-relaxed">
              * 보험정보 조회에 최대 5분까지 소요될 수 있습니다.
            </p>
            <p class="text-[12px] text-[#999] leading-relaxed">
              * 추가 인증(보안문자, SMS 등)이 필요할 수 있습니다.
            </p>
          </div>
        </CardSection>
      </main>

      <!-- 2-Way 인증 모달 -->
      <Credit4u2WayModal
        :visible="store.twoWayPending"
        @close="store.reset2Way()"
        @confirmed="onTwoWayConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import FormInput from '@user/components/form/FormInput.vue'
import Credit4u2WayModal from '@user/components/Credit4u2WayModal.vue'
import LoadingNotice from '@user/components/ui/LoadingNotice.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'

const router = useRouter()
const store = useCredit4uStore()

const loginId = ref('')
const password = ref('')

const isFormValid = computed(() => loginId.value.length > 0 && password.value.length > 0)

async function onLogin(): Promise<void> {
  store.clearError()

  // 1단계: 가입여부 확인
  const status = await store.checkRegistration(loginId.value, password.value)

  if (status === null && store.twoWayPending) {
    return // 2-Way 모달이 표시됨
  }

  if (status === null) {
    return // 에러 발생
  }

  // status 분기 처리
  if (status === '3') {
    // 임시비밀번호 상태 → 비밀번호 변경 필요
    store.error = '임시 비밀번호 상태입니다. 비밀번호를 변경해주세요.'
    router.push('/insurance/credit4u/change-pwd')
    return
  }

  // 2단계: 계약정보 조회
  const fetchData: any = {
    id: loginId.value,
    password: password.value,
  }

  // status=2이면 추가정보 필요 (본인인증 미완료)
  // 이 경우 사용자에게 추가정보 입력을 받아야 하지만,
  // 기본적으로는 고객의 기존 정보를 활용
  if (status === '2') {
    // 추가 파라미터는 서버에서 customer 정보 참조하여 자동 포함할 수도 있음
    // 프론트에서는 일단 전달
  }

  const success = await store.fetchContracts(fetchData)

  if (success) {
    router.push('/insurance')
  }
  // 실패 시 에러 메시지가 store.error에 설정됨
}

function onTwoWayConfirmed(): void {
  // 2-Way 완료 후 → 계약 데이터가 있으면 목록으로 이동
  if (store.hasContracts) {
    router.push('/insurance')
  }
}
</script>
