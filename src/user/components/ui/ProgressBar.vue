<template>
  <div class="w-full h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
    <div
      class="h-full rounded-full transition-all duration-300"
      :class="barColor"
      :style="{ width: percent + '%' }"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  percent?: number
  variant?: string
}

const props = withDefaults(defineProps<Props>(), {
  percent: 0,
  variant: 'success'
})

const barColor = computed(() => {
  const map: Record<string, string> = {
    success: 'bg-[#1FBD53]',
    warning: 'bg-[#F3940E]',
    danger: 'bg-[#FF0000]',
    primary: 'bg-[#FF7B22]'
  }
  return map[props.variant] || map.primary
})
</script>
