<template>
  <CardSection>
    <button
      class="w-full flex items-center gap-3 text-left"
      @click="$emit('click', customer)"
    >
      <!-- Avatar -->
      <div class="w-[44px] h-[44px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
        <span class="text-[16px] font-bold text-[#FF7B22]">
          {{ customer.name.charAt(0) }}
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-2 mb-1">
          <span class="text-[15px] font-semibold text-[#222] truncate">
            {{ customer.name }}
          </span>
        </div>
        <p class="text-[13px] text-[#888] mb-0.5">{{ customer.phone }}</p>
        <div class="flex items-center gap-3 text-[11px] text-[#AAAAAA]">
          <span v-if="customer.acquisition_channel">
            {{ customer.acquisition_channel }}
          </span>
          <span v-if="customer.job" class="text-[#999]">
            {{ customer.job }}
          </span>
        </div>
      </div>

      <!-- Chevron -->
      <ChevronRightIcon class="flex-shrink-0" />
    </button>
  </CardSection>
</template>

<script setup lang="ts">
import type { Customer } from '../../types'
import CardSection from '@user/components/ui/CardSection.vue'
import ChevronRightIcon from '@user/components/icons/ChevronRightIcon.vue'

interface Props {
  customer: Customer
}

defineProps<Props>()

defineEmits<{
  click: [customer: Customer]
}>()
</script>
