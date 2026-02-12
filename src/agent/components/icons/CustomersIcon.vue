<template>
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" :class="colorClass">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
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
