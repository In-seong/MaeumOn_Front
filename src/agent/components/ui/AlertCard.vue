<template>
  <div
    class="flex items-center gap-3 rounded-[12px] px-4 py-3 cursor-pointer active:scale-[0.98] transition-transform"
    :class="bgClass"
    @click="$emit('click')"
  >
    <span class="text-[20px]">{{ icon }}</span>
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
  icon?: string
  title: string
  subtitle?: string
  variant?: 'warning' | 'info' | 'danger'
}

const props = withDefaults(defineProps<Props>(), {
  icon: '🔔',
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
</script>
