<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <p class="text-[15px] font-semibold text-[#333]">{{ distribution.customer_name }}</p>
        <p class="text-[13px] text-[#888] mt-0.5">{{ distribution.customer_phone }}</p>
      </div>
      <StatusBadge :label="statusLabel" :variant="statusVariant" />
    </div>

    <div class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <span class="inline-flex items-center gap-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
        {{ distribution.source }}
      </span>
      <span class="text-[#DDD]">|</span>
      <span>{{ distribution.assigned_at }}</span>
    </div>

    <div v-if="distribution.memo" class="mt-2 text-[12px] text-[#666] bg-[#F8F8F8] rounded-[8px] px-3 py-2">
      {{ distribution.memo }}
    </div>

    <button
      v-if="distribution.status === 'unprocessed'"
      class="mt-3 w-full py-2.5 bg-[#FF7B22] text-white text-[13px] font-semibold rounded-[12px] active:scale-[0.98] transition-transform"
      @click="$emit('process', distribution.assignment_id)"
    >
      처리하기
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { DbDistribution } from '../../types'

interface Props {
  distribution: DbDistribution
}

const props = defineProps<Props>()

defineEmits<{
  process: [id: number]
}>()

const statusLabel = computed(() => {
  const map: Record<DbDistribution['status'], string> = {
    unprocessed: '미처리',
    processing: '처리중',
    completed: '완료',
  }
  return map[props.distribution.status]
})

const statusVariant = computed<'danger' | 'warning' | 'success'>(() => {
  const map: Record<DbDistribution['status'], 'danger' | 'warning' | 'success'> = {
    unprocessed: 'danger',
    processing: 'warning',
    completed: 'success',
  }
  return map[props.distribution.status]
})
</script>
