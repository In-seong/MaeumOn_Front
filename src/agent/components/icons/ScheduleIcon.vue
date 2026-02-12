<template>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="colorClass">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
    <line x1="16" y1="2" x2="16" y2="6"/>
    <line x1="8" y1="2" x2="8" y2="6"/>
    <line x1="3" y1="10" x2="21" y2="10"/>
  </svg>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  active?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  active: false
})

const colorClass = computed(() => props.active ? 'text-[#FF7B22]' : 'text-[#B0B0B0]')
</script>
