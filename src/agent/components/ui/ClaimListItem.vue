<template>
  <button
    type="button"
    class="w-full text-left bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4 transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[#FF7B22] focus:ring-inset"
    @click="$emit('select', claim.claim_id)"
  >
    <!-- Top: Customer Name + Status -->
    <div class="flex items-center justify-between mb-2">
      <div class="flex items-center gap-2">
        <span class="text-[15px] font-semibold text-[#222]">{{ claim.customer?.name ?? '-' }}</span>
        <span class="text-[12px] font-medium text-[#FF7B22] bg-[#FFF3ED] px-2 py-0.5 rounded-full">
          {{ claim.claim_type }}
        </span>
      </div>
      <StatusBadge :label="statusLabel" :variant="statusVariant" />
    </div>

    <!-- Insurance Company -->
    <div class="flex items-center gap-1 mb-2">
      <svg class="w-3.5 h-3.5 text-[#AAA] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
      <span class="text-[13px] text-[#666]">{{ companyName }}</span>
    </div>

    <!-- Bottom: Amount + Date -->
    <div class="flex items-center justify-between">
      <span v-if="claim.claim_amount" class="text-[14px] font-bold text-[#333]">
        {{ formatAmount(claim.claim_amount) }}
      </span>
      <span v-else class="text-[13px] text-[#AAA]">금액 미정</span>
      <span class="text-[11px] text-[#AAA]">{{ claim.created_at }}</span>
    </div>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { AgentClaim } from '../../types'

interface Props {
  claim: AgentClaim
}

const props = defineProps<Props>()

defineEmits<{
  select: [id: number]
}>()

const companyName = computed(() =>
  props.claim.claim_form?.insurance_company?.company_name ?? '-'
)

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    pending: '접수대기',
    processing: '처리중',
    approved: '승인',
    rejected: '거절',
    paid: '지급완료',
  }
  return map[props.claim.claim_status] ?? props.claim.claim_status
})

const statusVariant = computed<'default' | 'info' | 'warning' | 'success' | 'danger'>(() => {
  const map: Record<string, 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
    pending: 'info',
    processing: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: 'success',
  }
  return map[props.claim.claim_status] ?? 'default'
})

function formatAmount(amount: string): string {
  const num = Number(amount)
  if (isNaN(num)) return amount + '원'
  return num.toLocaleString('ko-KR') + '원'
}
</script>
