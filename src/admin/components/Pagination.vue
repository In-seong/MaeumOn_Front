<template>
  <div v-if="lastPage > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
    <div class="flex justify-center items-center gap-1">
      <button
        @click="$emit('change', 1)"
        :disabled="currentPage === 1"
        class="px-2 py-1 rounded-[8px] text-[14px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-30 disabled:cursor-not-allowed"
      >«</button>
      <button
        @click="$emit('change', currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-2 py-1 rounded-[8px] text-[14px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-30 disabled:cursor-not-allowed"
      >‹</button>

      <template v-for="page in visiblePages" :key="page">
        <span v-if="page === '...'" class="px-2 py-1 text-[14px] text-[#999]">…</span>
        <button
          v-else
          @click="$emit('change', page)"
          :class="[
            'min-w-[32px] px-2 py-1 rounded-[8px] text-[14px]',
            page === currentPage
              ? 'bg-[#FF7B22] text-white'
              : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
          ]"
        >
          {{ page }}
        </button>
      </template>

      <button
        @click="$emit('change', currentPage + 1)"
        :disabled="currentPage === lastPage"
        class="px-2 py-1 rounded-[8px] text-[14px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-30 disabled:cursor-not-allowed"
      >›</button>
      <button
        @click="$emit('change', lastPage)"
        :disabled="currentPage === lastPage"
        class="px-2 py-1 rounded-[8px] text-[14px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-30 disabled:cursor-not-allowed"
      >»</button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentPage: number
  lastPage: number
}>()

defineEmits<{
  change: [page: number]
}>()

const visiblePages = computed(() => {
  const current = props.currentPage
  const last = props.lastPage
  const delta = 2
  const pages: (number | string)[] = []

  const rangeStart = Math.max(2, current - delta)
  const rangeEnd = Math.min(last - 1, current + delta)

  pages.push(1)
  if (rangeStart > 2) pages.push('...')

  for (let i = rangeStart; i <= rangeEnd; i++) {
    pages.push(i)
  }

  if (rangeEnd < last - 1) pages.push('...')
  if (last > 1) pages.push(last)

  return pages
})
</script>
