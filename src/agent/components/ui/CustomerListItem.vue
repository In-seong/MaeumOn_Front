<template>
  <CardSection>
    <button
      class="w-full flex items-center gap-3 text-left"
      @click="$emit('click', customer)"
    >
      <!-- Avatar -->
      <div class="w-[44px] h-[44px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
        <span class="text-[16px] font-bold text-[#FF7B22]">
          {{ customer.customer_name.charAt(0) }}
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[15px] font-semibold text-[#222] truncate">
            {{ customer.customer_name }}
          </span>
          <StatusBadge
            v-if="customer.customer_tag"
            :label="customer.customer_tag"
            :variant="tagVariant"
          />
        </div>
        <p class="text-[13px] text-[#888] mb-0.5">{{ customer.customer_phone }}</p>
        <div class="flex items-center gap-3 text-[11px] text-[#AAAAAA]">
          <span v-if="customer.last_contact_date">
            최근연락 {{ formatDate(customer.last_contact_date) }}
          </span>
          <span v-if="customer.acquisition_source">
            {{ customer.acquisition_source }}
          </span>
          <span v-if="contractCount > 0" class="text-[#FF7B22]">
            보험 {{ contractCount }}건
          </span>
        </div>
      </div>

      <!-- Chevron -->
      <ChevronRightIcon class="flex-shrink-0" />
    </button>
  </CardSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Customer } from '../../types'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import ChevronRightIcon from '@user/components/icons/ChevronRightIcon.vue'

interface Props {
  customer: Customer
  contractCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  contractCount: 0,
})

defineEmits<{
  click: [customer: Customer]
}>()

const tagVariant = computed(() => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'default'> = {
    VIP: 'primary',
    '신규': 'success',
    '관심': 'info',
    '일반': 'default',
  }
  return map[props.customer.customer_tag ?? ''] ?? 'default'
})

function formatDate(dateStr: string): string {
  const parts = dateStr.split('-')
  if (parts.length < 3) return dateStr
  return `${parts[1] ?? ''}.${parts[2] ?? ''}`
}
</script>
