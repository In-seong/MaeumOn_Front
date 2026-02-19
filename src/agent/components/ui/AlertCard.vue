<template>
  <div
    class="flex items-center gap-3 rounded-[12px] px-4 py-3 cursor-pointer active:scale-[0.98] transition-transform"
    :class="bgClass"
    @click="$emit('click')"
  >
    <div class="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" :class="iconBgClass">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="iconStroke" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="svgPath" />
    </div>
    <div class="flex-1">
      <p class="text-[14px] font-medium" :class="textClass">{{ title }}</p>
      <p v-if="subtitle" class="text-[12px] text-[#888] mt-0.5">{{ subtitle }}</p>
    </div>
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2"><polyline points="9 18 15 12 9 6"/></svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  title: string
  subtitle?: string
  variant?: 'warning' | 'info' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  subtitle: '',
  variant: 'info'
})

defineEmits<{
  click: []
}>()

const bgClass = computed(() => {
  const map: Record<string, string> = {
    warning: 'bg-[#FFF4E5]',
    info: 'bg-[#E8F0FE]',
    danger: 'bg-[#FFE5E5]',
  }
  return map[props.variant]
})

const textClass = computed(() => {
  const map: Record<string, string> = {
    warning: 'text-[#F3940E]',
    info: 'text-[#4285F4]',
    danger: 'text-[#FF3B30]',
  }
  return map[props.variant]
})

const iconBgClass = computed(() => {
  const map: Record<string, string> = {
    warning: 'bg-[#FFF0E5]',
    info: 'bg-[#E0ECFC]',
    danger: 'bg-[#FFD6D6]',
  }
  return map[props.variant]
})

const iconStroke = computed(() => {
  const map: Record<string, string> = {
    warning: '#F3940E',
    info: '#4285F4',
    danger: '#FF3B30',
  }
  return map[props.variant]
})

const svgPath = computed(() => {
  const map: Record<string, string> = {
    warning: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
    info: '<circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>',
    danger: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
  }
  return map[props.variant]
})
</script>
