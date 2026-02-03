<template>
  <button
    :class="[
      'rounded-[12px] text-[15px] font-semibold transition-all active:scale-[0.98]',
      variantClass,
      full ? 'w-full' : '',
      large ? 'py-3.5 px-6' : 'py-2.5 px-4 text-[13px]'
    ]"
  >
    <slot />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  variant?: string
  full?: boolean
  large?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  full: false,
  large: false
})

const variantClass = computed(() => {
  if (props.variant === 'outline') return 'bg-white border border-[#E0E0E0] text-[#555]'
  return 'bg-[#FF7B22] text-white'
})
</script>
