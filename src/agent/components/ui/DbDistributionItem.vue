<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <p class="text-[15px] font-semibold text-[#333]">{{ distribution.customer?.name ?? '-' }}</p>
        <p class="text-[13px] text-[#888] mt-0.5">{{ distribution.customer?.phone ?? '-' }}</p>
      </div>
      <span v-if="distribution.assignment_type" class="text-[12px] text-[#FF7B22] bg-[#FFF3ED] px-2 py-0.5 rounded-full font-medium">
        {{ distribution.assignment_type }}
      </span>
    </div>

    <div class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span>{{ distribution.assignment_date ?? distribution.created_at }}</span>
    </div>

    <p v-if="distribution.notes" class="text-[12px] text-[#666] mt-2 line-clamp-2">{{ distribution.notes }}</p>

    <button
      class="mt-3 w-full py-2.5 bg-[#FF7B22] text-white text-[13px] font-semibold rounded-[12px] active:scale-[0.98] transition-transform"
      @click="$emit('edit', distribution.assignment_id, distribution.notes)"
    >
      메모 수정
    </button>
  </div>
</template>

<script setup lang="ts">
import type { DbDistribution } from '../../types'

interface Props {
  distribution: DbDistribution
}

defineProps<Props>()

defineEmits<{
  edit: [id: number, notes?: string]
}>()
</script>
