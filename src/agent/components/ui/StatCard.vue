<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4 relative overflow-hidden">
    <!-- Top Color Border -->
    <div class="absolute top-0 left-0 right-0 h-1" :class="topBorderColor" />

    <!-- Trend Arrow -->
    <div class="flex items-center justify-between mb-2">
      <span class="text-[12px] text-[#999]">{{ label }}</span>
      <div
        v-if="trend !== 'flat'"
        class="flex items-center gap-0.5 text-[11px] font-semibold"
        :class="trend === 'up' ? 'text-[#1FBD53]' : 'text-[#FF3B30]'"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path v-if="trend === 'up'" d="M18 15l-6-6-6 6" />
          <path v-else d="M6 9l6 6 6-6" />
        </svg>
      </div>
      <div
        v-else
        class="flex items-center text-[11px] font-semibold text-[#999]"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
          <path d="M5 12h14" />
        </svg>
      </div>
    </div>

    <!-- Value -->
    <div class="flex items-baseline gap-1">
      <span class="text-[24px] font-bold" :class="valueColor">{{ displayValue }}</span>
      <span v-if="unit" class="text-[13px] text-[#999]">{{ unit }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  value: string | number
  unit?: string
  trend?: 'up' | 'down' | 'flat'
  color?: 'orange' | 'blue' | 'green' | 'purple'
}

const props = withDefaults(defineProps<Props>(), {
  unit: '',
  trend: 'flat',
  color: 'orange',
})

const colorMap: Record<string, { border: string; text: string }> = {
  orange: { border: 'bg-[#FF7B22]', text: 'text-[#FF7B22]' },
  blue: { border: 'bg-[#4285F4]', text: 'text-[#4285F4]' },
  green: { border: 'bg-[#1FBD53]', text: 'text-[#1FBD53]' },
  purple: { border: 'bg-[#9B59B6]', text: 'text-[#9B59B6]' },
}

const fallback = { border: 'bg-[#FF7B22]', text: 'text-[#FF7B22]' }
const topBorderColor = computed(() => colorMap[props.color]?.border ?? fallback.border)
const valueColor = computed(() => colorMap[props.color]?.text ?? fallback.text)

const displayValue = computed(() => {
  if (typeof props.value === 'number') {
    return props.value.toLocaleString('ko-KR')
  }
  return props.value
})
</script>
