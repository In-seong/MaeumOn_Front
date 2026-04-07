<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-[#FF7B22] mb-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-[14px] text-[#999]">보험 정보를 불러오는 중...</p>
        </div>

        <!-- 에러 -->
        <div v-else-if="errorMsg" class="flex flex-col items-center justify-center py-16">
          <p class="text-[14px] text-[#999] mb-4">{{ errorMsg }}</p>
          <button
            class="text-[14px] text-[#FF7B22] font-medium underline"
            @click="router.back()"
          >
            뒤로 가기
          </button>
        </div>

        <!-- 상세 정보 -->
        <template v-else-if="contract">
          <!-- Policy Header -->
          <CardSection class="mb-4">
            <div class="flex items-start justify-between gap-2 mb-3">
              <div class="min-w-0 flex-1">
                <span class="text-[13px] text-[#888]">
                  {{ contract.insurance_company?.company_name || '보험사' }}
                </span>
                <p class="text-[18px] font-bold text-[#222] mt-0.5 break-keep">
                  {{ contract.product_name || '보험상품' }}
                </p>
              </div>
              <StatusBadge
                :label="contractStatusLabel"
                :variant="contractStatusVariant"
              />
            </div>
            <div class="flex items-center gap-2">
              <span v-if="contract.premium_amount" class="text-[20px] font-bold text-[#FF7B22]">
                월 {{ formatAmount(contract.premium_amount) }}
              </span>
              <span class="text-[12px] text-[#B0B0B0]">
                {{ contractPeriod }}
              </span>
            </div>
          </CardSection>

          <!-- 납입 정보 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">납입 정보</p>
            <CardSection>
              <InfoRow label="납입방법" :value="contract.payment_cycle || '-'" />
              <InfoRow label="납입기간" :value="contract.payment_period || '-'" />
              <InfoRow v-if="contract.premium_amount" label="보험료" :value="formatAmount(contract.premium_amount)" />
            </CardSection>
          </div>

          <!-- 계약 정보 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">계약 정보</p>
            <CardSection>
              <InfoRow label="증권번호" :value="contract.policy_number || '-'" />
              <InfoRow label="계약일" :value="formatDate(contract.subscription_date)" />
              <InfoRow v-if="contract.contractor_name" label="계약자" :value="contract.contractor_name" />
              <InfoRow v-if="contract.insured_person" label="피보험자" :value="contract.insured_person" />
              <InfoRow v-if="contract.contract_type" label="계약유형" :value="contractTypeLabel" />
              <InfoRow v-if="contract.car_name" label="차량" :value="contract.car_name" />
              <InfoRow v-if="contract.car_number" label="차량번호" :value="contract.car_number" />
              <InfoRow v-if="contract.company_phone" label="보험사 전화" :value="contract.company_phone" />
            </CardSection>
          </div>

          <!-- 보장 내역 -->
          <div v-if="contract.coverages && contract.coverages.length > 0" class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">보장 내역</p>
            <CardSection>
              <div
                v-for="(cov, idx) in contract.coverages"
                :key="cov.coverage_id || idx"
                class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0"
              >
                <div>
                  <p class="text-[13px] font-medium text-[#333]">{{ cov.coverage_name }}</p>
                  <p v-if="cov.agreement_type || cov.coverage_status" class="text-[11px] text-[#999]">
                    {{ cov.agreement_type || '' }}{{ cov.agreement_type && cov.coverage_status ? ' / ' : '' }}{{ cov.coverage_status || '' }}
                  </p>
                </div>
                <span v-if="cov.coverage_amount" class="text-[14px] font-bold text-[#222]">
                  {{ formatAmount(cov.coverage_amount) }}
                </span>
              </div>
            </CardSection>
          </div>

          <!-- CODEF 동기화 표시 -->
          <div v-if="contract.codef_synced" class="mb-4">
            <CardSection class="!bg-[#F0F4FF]">
              <div class="flex items-center gap-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#4A7CFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <p class="text-[12px] text-[#4A7CFF]">
                  내보험다보여 연동 데이터
                  <span v-if="contract.synced_at" class="text-[#AAA] ml-1">
                    ({{ formatDateTime(contract.synced_at) }} 동기화)
                  </span>
                </p>
              </div>
            </CardSection>
          </div>

          <!-- Action Buttons -->
          <div class="flex gap-3 mb-6">
            <button
              class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              @click="router.push('/claims/new')"
            >
              보험금 청구
            </button>
            <button
              class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              @click="router.push('/consultation')"
            >
              상담 요청
            </button>
          </div>
        </template>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'
import type { InsuranceContract } from '@shared/types/credit4u'

const route = useRoute()
const router = useRouter()
const store = useCredit4uStore()

const contract = ref<InsuranceContract | null>(null)
const loading = ref(false)
const errorMsg = ref<string | null>(null)

const CONTRACT_TYPE_LABELS: Record<string, string> = {
  savings: '저축성보험',
  car: '자동차보험',
  property: '화재특종',
  actual_loss: '실손형',
  flat_rate: '정액형',
}

const contractTypeLabel = computed(() => {
  if (!contract.value?.contract_type) return '-'
  return CONTRACT_TYPE_LABELS[contract.value.contract_type] || contract.value.contract_type
})

const contractStatusLabel = computed(() => {
  if (!contract.value) return '유지중'
  const status = contract.value.contract_status
  if (status === 'expired' || status === '만기') return '만기'
  if (status === 'cancelled' || status === '해지') return '해지'
  return '유지중'
})

const contractStatusVariant = computed(() => {
  const label = contractStatusLabel.value
  if (label === '만기') return 'default'
  if (label === '해지') return 'danger'
  return 'success'
})

const contractPeriod = computed(() => {
  if (!contract.value) return ''
  if (contract.value.expiration_date) {
    const d = new Date(contract.value.expiration_date)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')} 만기`
  }
  if (contract.value.end_date) {
    const d = new Date(contract.value.end_date)
    return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')} 만기`
  }
  return contract.value.payment_period || ''
})

function formatAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '-'
  const num = Math.round(Number(amount))
  if (isNaN(num) || num === 0) return '-'
  return num.toLocaleString('ko-KR') + '원'
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`
}

function formatDateTime(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

onMounted(async () => {
  const id = Number(route.params.id)
  if (!id || isNaN(id)) {
    errorMsg.value = '유효하지 않은 보험 정보입니다.'
    return
  }

  loading.value = true
  try {
    const result = await store.fetchContractDetail(id)
    if (result) {
      contract.value = result
    } else {
      errorMsg.value = store.error || '보험 정보를 찾을 수 없습니다.'
    }
  } catch {
    errorMsg.value = '보험 정보를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
})
</script>
