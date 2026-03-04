<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, RouterView } from 'vue-router'
import AdminLayout from './components/layout/AdminLayout.vue'

const route = useRoute()

const showLayout = computed(() => route.meta.requiresAuth === true)
</script>

<template>
  <AdminLayout v-if="showLayout">
    <RouterView />
  </AdminLayout>
  <RouterView v-else />
</template>

<style scoped>
</style>
