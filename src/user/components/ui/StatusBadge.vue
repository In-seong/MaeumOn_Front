<template>
  <span
    class="px-2.5 py-1 rounded-full text-[11px] font-semibold inline-block"
    :class="variantClasses"
  >
    {{ label }}
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  label: string
  variant?: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default'
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default'
})

const variantClasses = computed(() => {
  const map: Record<string, string> = {
    success: 'bg-[#E8F9EE] text-[#1FBD53]',
    warning: 'bg-[#FFF4E5] text-[#F3940E]',
    danger: 'bg-[#FFE5E5] text-[#FF0000]',
    primary: 'bg-[#FFF0E5] text-[#FF7B22]',
    info: 'bg-[#E8F0FE] text-[#4285F4]',
    default: 'bg-[#F0F0F0] text-[#888]'
  }
  return map[props.variant] || map.default
})
</script>
