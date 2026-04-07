<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="아이디 찾기" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 결과 화면 -->
        <template v-if="store.foundLoginId">
          <CardSection class="mb-5">
            <div class="text-center py-4">
              <div class="w-[56px] h-[56px] mx-auto mb-3 bg-[#E8F5E9] rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#4CAF50" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-[15px] font-semibold text-[#222] mb-2">아이디를 찾았습니다</p>
              <div class="bg-[#F8F8F8] rounded-[12px] px-5 py-4 mt-3">
                <p class="text-[12px] text-[#999] mb-1">내보험다보여 아이디</p>
                <p class="text-[20px] font-bold text-[#FF7B22]">{{ store.foundLoginId }}</p>
              </div>
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
              본인인증을 통해 내보험다보여에 가입된 아이디를 찾을 수 있습니다.
            </p>
          </CardSection>

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

          <!-- 에러 메시지 -->
          <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
            <p class="text-[13px] text-red-600">{{ store.error }}</p>
          </div>

          <!-- 찾기 버튼 -->
          <button
            class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed mb-4"
            :disabled="!isFormValid || store.loading"
            @click="onFindId"
          >
            <span v-if="store.loading" class="flex items-center justify-center gap-2">
              <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              조회 중...
            </span>
            <span v-else>아이디 찾기</span>
          </button>

          <!-- 로딩 안내 -->
          <LoadingNotice v-if="store.loading" />
        </template>
      </main>

      <!-- 2-Way 인증 모달 -->
      <Credit4u2WayModal
        :visible="store.twoWayPending"
        @close="store.reset2Way()"
        @confirmed="onFindIdConfirmed"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import FormInput from '@user/components/form/FormInput.vue'
import Credit4u2WayModal from '@user/components/Credit4u2WayModal.vue'
import LoadingNotice from '@user/components/ui/LoadingNotice.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'

const router = useRouter()
const store = useCredit4uStore()

const form = reactive({
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

const isFormValid = computed(() =>
  form.userName.length > 0 &&
  form.identity.length === 13 &&
  form.telecom.length > 0 &&
  form.phoneNo.length >= 10
)

async function onFindId(): Promise<void> {
  store.clearError()
  store.foundLoginId = null

  await store.findId({
    userName: form.userName,
    identity: form.identity,
    telecom: form.telecom,
    phoneNo: form.phoneNo,
  })
  // 결과는 store.foundLoginId에 설정됨 (성공 시)
  // 2-Way 대기 시 모달 표시됨
}

function onFindIdConfirmed(): void {
  // 2-Way 완료 후 foundLoginId가 있으면 결과 화면 자동 표시
}

onUnmounted(() => {
  store.foundLoginId = null
  store.clearError()
})
</script>
