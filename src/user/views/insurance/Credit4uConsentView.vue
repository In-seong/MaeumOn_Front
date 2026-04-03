<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="정보이용 동의" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 안내 카드 -->
        <CardSection class="mb-4">
          <div class="flex items-start gap-3">
            <div class="w-[44px] h-[44px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div>
              <p class="text-[16px] font-bold text-[#222] mb-1">내보험다보여 정보 조회</p>
              <p class="text-[13px] text-[#888] leading-relaxed">
                신용정보원 내보험다보여 서비스를 통해 가입된 보험정보를 한눈에 조회할 수 있습니다.
              </p>
            </div>
          </div>
        </CardSection>

        <!-- 동의 내용 -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">정보이용 동의</p>
          <CardSection>
            <div class="max-h-[300px] overflow-y-auto pr-1">
              <p class="text-[13px] text-[#555] leading-relaxed whitespace-pre-line">{{ consentText }}</p>
            </div>
          </CardSection>
        </div>

        <!-- 동의 체크 -->
        <div class="mb-5">
          <label class="flex items-center gap-3 px-1 cursor-pointer" @click="agreed = !agreed">
            <div
              class="w-[22px] h-[22px] rounded-full border-2 flex items-center justify-center transition-colors"
              :class="agreed ? 'bg-[#FF7B22] border-[#FF7B22]' : 'bg-white border-[#D0D0D0]'"
            >
              <svg v-if="agreed" width="12" height="12" viewBox="0 0 24 24" fill="none">
                <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[14px] font-medium text-[#333]">위 내용을 확인하였으며, 정보이용에 동의합니다.</span>
          </label>
        </div>

        <!-- 에러 메시지 -->
        <div v-if="store.error" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mb-4">
          <p class="text-[13px] text-red-600">{{ store.error }}</p>
        </div>

        <!-- 동의 버튼 -->
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50 disabled:cursor-not-allowed"
          :disabled="!agreed || store.loading"
          @click="onAgree"
        >
          <span v-if="store.loading" class="flex items-center justify-center gap-2">
            <svg class="animate-spin h-4 w-4" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            처리 중...
          </span>
          <span v-else>동의하고 계속하기</span>
        </button>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'
import { consentApi } from '@shared/services/insuranceApi'

const router = useRouter()
const store = useCredit4uStore()

const agreed = ref(false)
const consentText = ref('')
const consentTemplateId = ref<number | undefined>(undefined)

onMounted(async () => {
  store.clearError()
  try {
    const response = await consentApi.getAll()
    if (response.data.success) {
      // credit4u 타입의 동의서 찾기, 없으면 기본 텍스트 사용
      const credit4uConsent = response.data.data.find(
        (t) => t.consent_type === 'credit' || t.title.includes('내보험다보여') || t.title.includes('신용정보')
      )
      if (credit4uConsent) {
        consentText.value = credit4uConsent.content
        consentTemplateId.value = credit4uConsent.consent_template_id
      } else {
        consentText.value = defaultConsentText
      }
    }
  } catch {
    consentText.value = defaultConsentText
  }
})

const defaultConsentText = `[개인(신용)정보 수집·이용 동의서]

1. 수집·이용 목적
- 신용정보원 내보험다보여 서비스를 통한 보험계약 정보 조회
- 가입 보험정보 분석 및 보장 현황 제공

2. 수집·이용 항목
- 성명, 주민등록번호, 휴대전화번호
- 보험계약 정보 (보험사, 상품명, 보장내역 등)
- 보험료 납입 정보

3. 보유·이용 기간
- 서비스 이용 해지 시까지 또는 동의 철회 시까지

4. 동의 거부 권리 및 불이익
- 위 동의를 거부할 권리가 있으며, 동의 거부 시 내보험다보여 보험정보 조회 서비스 이용이 제한됩니다.`

async function onAgree(): Promise<void> {
  const success = await store.agreeConsent(consentTemplateId.value)
  if (success) {
    router.push('/insurance/credit4u/login')
  }
}
</script>
