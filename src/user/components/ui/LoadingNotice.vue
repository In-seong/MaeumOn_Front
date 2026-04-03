<template>
  <div class="bg-[#F0F4FF] rounded-[12px] px-4 py-3 mb-4">
    <div class="flex items-start gap-2.5">
      <svg class="flex-shrink-0 mt-0.5 animate-spin" width="16" height="16" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="#4A7CFF" stroke-width="3" fill="none"/>
        <path class="opacity-75" fill="#4A7CFF" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
      <div>
        <p class="text-[13px] font-medium text-[#4A7CFF] mb-0.5">보험정보 조회 중입니다</p>
        <p class="text-[11px] text-[#888] leading-relaxed">
          신용정보원과 통신 중이며, 최대 5분까지 소요될 수 있습니다.
          화면을 닫지 마시고 잠시 기다려주세요.
        </p>
        <!-- 경과 시간 표시 -->
        <p v-if="elapsed > 0" class="text-[11px] text-[#AAA] mt-1">경과 시간: {{ formattedElapsed }}</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

const elapsed = ref(0)
let timer: ReturnType<typeof setInterval> | null = null

const formattedElapsed = computed(() => {
  const min = Math.floor(elapsed.value / 60)
  const sec = elapsed.value % 60
  if (min > 0) {
    return `${min}분 ${sec}초`
  }
  return `${sec}초`
})

onMounted(() => {
  timer = setInterval(() => {
    elapsed.value++
  }, 1000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
    timer = null
  }
})
</script>
