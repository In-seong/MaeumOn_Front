<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <p class="text-[15px] font-semibold text-[#333]">{{ obligation.customer_name }}</p>
        <p class="text-[13px] text-[#888] mt-0.5">
          {{ obligation.insurance_company }} &middot; {{ obligation.obligation_type }}
        </p>
      </div>
      <StatusBadge
        v-if="obligation.status === 'completed'"
        label="완료"
        variant="success"
      />
    </div>

    <div class="flex items-center justify-between mt-3">
      <div class="flex items-center gap-2 text-[12px] text-[#999]">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span>{{ obligation.due_date }}</span>
      </div>

      <span
        class="px-3 py-1 rounded-full text-[12px] font-bold"
        :class="dDayClass"
      >
        {{ dDayLabel }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { DisclosureObligation } from '../../types'

interface Props {
  obligation: DisclosureObligation
}

const props = defineProps<Props>()

const dDayLabel = computed(() => {
  const days = props.obligation.days_remaining
  if (days === 0) return 'D-Day'
  if (days > 0) return `D-${days}`
  return `D+${Math.abs(days)}`
})

const dDayClass = computed(() => {
  const urgency = props.obligation.urgency
  const map: Record<DisclosureObligation['urgency'], string> = {
    imminent: 'bg-[#FFE5E5] text-[#FF0000]',
    upcoming: 'bg-[#FFF4E5] text-[#F3940E]',
    normal: 'bg-[#E8F0FE] text-[#4285F4]',
  }
  return map[urgency]
})
</script>
