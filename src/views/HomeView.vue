<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-4">
        MaeumOn
      </h1>
      <p class="text-gray-600 dark:text-gray-300">
        Welcome to MaeumOn
      </p>

      <div class="mt-8">
        <router-link
          v-if="!authStore.isAuthenticated"
          to="/login"
          class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
        >
          Login
        </router-link>
        <button
          v-else
          @click="authStore.logout()"
          class="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  </div>
</template>
