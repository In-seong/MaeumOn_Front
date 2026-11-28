<template>
  <CardSection>
    <button
      class="w-full flex items-center gap-3 text-left"
      @click="$emit('click', customer)"
    >
      <!-- Avatar: 최근 메모 진도 표시 (없으면 공백) -->
      <div class="w-[40px] h-[40px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
        <span v-if="customer.latest_memo?.progress" class="text-[11px] font-bold text-[#FF6B2D] leading-tight text-center">
          {{ customer.latest_memo.progress }}
        </span>
      </div>

      <!-- Info -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-1.5">
          <span class="text-[15px] font-semibold text-[#222] truncate">
            {{ customer.name }}
          </span>
          <span v-if="calcAge(customer.birth_date)" class="text-[12px] text-[#999]">
            {{ calcAge(customer.birth_date) }}
          </span>
        </div>
        <div class="flex items-center gap-3 mt-0.5 text-[12px] text-[#888]">
          <span>{{ customer.phone }}</span>
          <span v-if="customer.job" class="text-[#AAAAAA]">{{ customer.job }}</span>
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

function calcAge(bd?: string): string {
  if (!bd) return ''
  const birth = new Date(bd)
  if (isNaN(birth.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age}세`
}
</script>
