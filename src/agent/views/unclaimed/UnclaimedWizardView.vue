<template>
  <div class="min-h-screen bg-[#F4F5F7]">
    <!-- 헤더 -->
    <div class="sticky top-0 z-10 bg-white border-b border-[#E8E8E8]">
      <div class="flex items-center h-[52px] px-4">
        <button class="p-1 -ml-1" @click="handleBack">
          <svg class="w-6 h-6 text-[#333]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        </button>
        <h1 class="flex-1 text-center text-[16px] font-bold text-[#222]">숨은 보험금 찾기</h1>
        <div class="w-6" />
      </div>

      <!-- 스텝 인디케이터 -->
      <div class="flex items-center gap-1 px-4 pb-3">
        <div
          v-for="s in totalSteps"
          :key="s"
          :class="[
            'h-1 rounded-full flex-1 transition-colors',
            s <= currentStep ? 'bg-[#FF6B2D]' : 'bg-[#E8E8E8]'
          ]"
        />
      </div>
    </div>

    <!-- 컨텐츠 -->
    <div class="px-4 pt-4 pb-4">
      <StepCustomerInfo
        v-if="currentStep === 1"
        v-model="customerForm"
      />

      <StepConsent
        v-else-if="currentStep === 2"
        @update:template-ids="consentTemplateIds = $event"
        @update:all-agreed="allConsentsAgreed = $event"
      />

      <StepAuth
        v-else-if="currentStep === 3"
        :session-id="sessionId"
        :default-telecom="customerForm.customer_telecom"
        @auth-completed="onAuthCompleted"
      />

      <StepIdCard
        v-else-if="currentStep === 4"
        :session-id="sessionId"
        @uploaded="onIdCardUploaded"
      />

      <StepSignature
        v-else-if="currentStep === 5"
        :session-id="sessionId"
        @uploaded="onSignatureUploaded"
      />

      <StepFetching
        v-else-if="currentStep === 6"
        :session-id="sessionId"
        @completed="onAnalysisCompleted"
        @failed="onAnalysisFailed"
      />

      <StepResult
        v-else-if="currentStep === 7"
        :results="results"
        :total-amount="totalAmount"
        @start-claim="startClaim"
        @new-session="resetWizard"
      />
      <!-- 하단 버튼 -->
      <div v-if="showBottomBtn" class="mt-4 pb-24">
        <button
          class="w-full py-3.5 bg-[#FF6B2D] text-white text-[14px] font-bold rounded-[12px] active:scale-[0.98] transition-transform disabled:opacity-40"
          :disabled="!canNext"
          @click="nextStep"
        >
          {{ nextBtnText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import type { UnclaimedResult } from '../../types'
import {
  createUnclaimedSession,
  fetchUnclaimedSession,
  submitUnclaimedConsents,
  fetchUnclaimedResults,
} from '../../services/agentApi'
import StepCustomerInfo from '../../components/unclaimed/StepCustomerInfo.vue'
import StepConsent from '../../components/unclaimed/StepConsent.vue'
import StepAuth from '../../components/unclaimed/StepAuth.vue'
import StepIdCard from '../../components/unclaimed/StepIdCard.vue'
import StepSignature from '../../components/unclaimed/StepSignature.vue'
import StepFetching from '../../components/unclaimed/StepFetching.vue'
import StepResult from '../../components/unclaimed/StepResult.vue'

const route = useRoute()
const router = useRouter()

const totalSteps = 7
const currentStep = ref(1)
const sessionId = ref(0)
const loading = ref(false)

const customerForm = ref({
  customer_id: undefined as string | undefined,
  customer_name: '',
  customer_phone: '',
  customer_birth_date: '',
  customer_gender: '',
  customer_telecom: '',
  customer_address: '',
  customer_detailed_address: '',
})

const consentTemplateIds = ref<number[]>([])
const allConsentsAgreed = ref(false)
const authCompleted = ref(false)
const idCardUploaded = ref(false)
const signatureUploaded = ref(false)
const results = ref<UnclaimedResult[]>([])
const totalAmount = ref(0)

// 기존 세션 이어가기
const existingSessionId = route.params.sessionId
if (existingSessionId) {
  sessionId.value = Number(existingSessionId)
  loadExistingSession()
}

async function loadExistingSession() {
  try {
    const res = await fetchUnclaimedSession(sessionId.value)
    const s = res.data.data
    const statusStep: Record<string, number> = {
      consent: 2,
      identity_verify: 3,
      id_upload: 4,
      signature: 5,
      fetching: 6,
      analyzing: 6,
      completed: 7,
    }
    currentStep.value = statusStep[s.status] ?? 1
    customerForm.value.customer_name = s.customer_name
    customerForm.value.customer_phone = s.customer_phone

    if (s.status === 'completed' && s.results) {
      results.value = s.results
      totalAmount.value = s.total_unclaimed_amount ?? 0
    }
  } catch {
    // 세션 로드 실패 시 처음부터
  }
}

const showBottomBtn = computed(() => {
  return currentStep.value <= 2 || currentStep.value === 4 || currentStep.value === 5
})

const canNext = computed(() => {
  if (currentStep.value === 1) {
    return !!(customerForm.value.customer_name && customerForm.value.customer_phone && customerForm.value.customer_birth_date)
  }
  if (currentStep.value === 2) return allConsentsAgreed.value
  if (currentStep.value === 4) return idCardUploaded.value
  if (currentStep.value === 5) return signatureUploaded.value
  return true
})

const nextBtnText = computed(() => {
  if (currentStep.value === 1) return '다음'
  if (currentStep.value === 2) return '동의하고 진행'
  if (currentStep.value === 4) return '다음'
  if (currentStep.value === 5) return '조회 시작'
  return '다음'
})

async function nextStep() {
  if (loading.value) return
  loading.value = true

  try {
    if (currentStep.value === 1) {
      const res = await createUnclaimedSession({
        customer_id: customerForm.value.customer_id,
        customer_name: customerForm.value.customer_name,
        customer_phone: customerForm.value.customer_phone,
        customer_birth_date: customerForm.value.customer_birth_date,
        customer_gender: customerForm.value.customer_gender || undefined,
        customer_telecom: customerForm.value.customer_telecom || undefined,
        customer_address: customerForm.value.customer_address || undefined,
        customer_detailed_address: customerForm.value.customer_detailed_address || undefined,
      })
      sessionId.value = res.data.data.session_id
      currentStep.value = 2
    } else if (currentStep.value === 2) {
      await submitUnclaimedConsents(sessionId.value, {
        consent_template_ids: consentTemplateIds.value,
      })
      currentStep.value = 3
    } else if (currentStep.value === 4) {
      currentStep.value = 5
    } else if (currentStep.value === 5) {
      currentStep.value = 6
    }
  } catch {
    // 에러 처리
  } finally {
    loading.value = false
  }
}

function onAuthCompleted() {
  authCompleted.value = true
  currentStep.value = 4
}

function onIdCardUploaded() {
  idCardUploaded.value = true
}

function onSignatureUploaded() {
  signatureUploaded.value = true
}

async function onAnalysisCompleted() {
  try {
    const res = await fetchUnclaimedResults(sessionId.value)
    results.value = res.data.data
    totalAmount.value = results.value.reduce((sum, r) => sum + (r.estimated_claim_amount ?? 0), 0)
  } catch {
    // fallback
  }
  currentStep.value = 7
}

function onAnalysisFailed(msg: string) {
  alert(msg)
  currentStep.value = 3
}

function startClaim() {
  router.push({ name: 'agent-claim-select' })
}

function resetWizard() {
  currentStep.value = 1
  sessionId.value = 0
  customerForm.value = {
    customer_id: undefined,
    customer_name: '',
    customer_phone: '',
    customer_birth_date: '',
    customer_gender: '',
    customer_telecom: '',
    customer_address: '',
    customer_detailed_address: '',
  }
  consentTemplateIds.value = []
  allConsentsAgreed.value = false
  authCompleted.value = false
  idCardUploaded.value = false
  signatureUploaded.value = false
  results.value = []
  totalAmount.value = 0
}

function handleBack() {
  if (currentStep.value > 1 && currentStep.value < 6) {
    currentStep.value--
  } else {
    router.back()
  }
}
</script>

<style scoped>
.safe-area-bottom {
  padding-bottom: max(16px, env(safe-area-inset-bottom));
}
</style>
