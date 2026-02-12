<template>
  <div class="bg-gradient-to-r from-[#FF7B22] to-[#FF9F5A] rounded-[16px] p-5 text-white">
    <p class="text-[13px] opacity-90 mb-1">{{ todayDate }}</p>
    <h2 class="text-[18px] font-bold mb-3">오늘의 일정</h2>
    <div class="flex items-center gap-4">
      <div class="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        <span class="text-[14px]">예정 <b>{{ scheduleCount }}건</b></span>
      </div>
      <div class="flex items-center gap-1.5">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
        <span class="text-[14px]">연락 <b>{{ contactCount }}건</b></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  scheduleCount?: number
  contactCount?: number
}

withDefaults(defineProps<Props>(), {
  scheduleCount: 0,
  contactCount: 0
})

const todayDate = computed(() => {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[d.getDay()]})`
})
</script>
