<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useDeviceMode } from './composables/useDeviceMode'
import AgentPcLayout from './components/layout/AgentPcLayout.vue'

const route = useRoute()
const { isPC } = useDeviceMode()

const showPcLayout = computed(() => isPC.value && route.meta.requiresAuth === true)
</script>

<template>
  <AgentPcLayout v-if="showPcLayout">
    <RouterView />
  </AgentPcLayout>
  <RouterView v-else />
</template>

<style scoped>
</style>
