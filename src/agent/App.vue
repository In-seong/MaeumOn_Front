<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import { useDeviceMode } from './composables/useDeviceMode'
import AgentPcLayout from './components/layout/AgentPcLayout.vue'
import AgentBottomNav from './components/layout/AgentBottomNav.vue'

const route = useRoute()
const { isPC } = useDeviceMode()

const showPcLayout = computed(() => isPC.value && route.meta.requiresAuth === true)
const showBottomNav = computed(() => !isPC.value && route.meta.requiresAuth === true)
</script>

<template>
  <AgentPcLayout v-if="showPcLayout">
    <RouterView />
  </AgentPcLayout>
  <template v-else>
    <RouterView />
    <AgentBottomNav v-if="showBottomNav" />
  </template>
</template>

<style scoped>
</style>
