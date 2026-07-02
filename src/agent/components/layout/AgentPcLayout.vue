<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAgentAuthStore } from '../../stores/agentAuthStore'
import { useNotificationStore } from '../../stores/notificationStore'
import AgentPcSidebar from './AgentPcSidebar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAgentAuthStore()
const notificationStore = useNotificationStore()
const sidebarOpen = ref(false)

watch(() => route.path, () => {
  sidebarOpen.value = false
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8F8F8]">
    <AgentPcSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 lg:h-16 bg-white border-b border-[#E8E8E8] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
        <button
          class="lg:hidden text-[#555] hover:text-[#FF7B22] transition-colors"
          @click="sidebarOpen = true"
        >
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div class="lg:hidden flex items-center gap-1.5">
          <img src="/icons/LogoIcon.svg" alt="마음ON" class="w-6 h-6" />
          <span class="text-[16px] font-bold text-[#FF7B22]">보험청구ON</span>
        </div>

        <div class="hidden lg:block" />

        <div class="flex items-center gap-3 lg:gap-4">
          <button
            @click="router.push('/notifications')"
            class="relative text-[#999] hover:text-[#FF7B22] transition-colors"
          >
            <span class="material-symbols-outlined text-[22px]">notifications</span>
            <span
              v-if="notificationStore.unreadCount > 0"
              class="absolute -top-1 -right-1 min-w-[16px] h-[16px] bg-[#FF3B30] text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1"
            >{{ notificationStore.unreadCount > 99 ? '99+' : notificationStore.unreadCount }}</span>
          </button>
          <span class="text-[12px] lg:text-[13px] text-[#999]">
            {{ authStore.agentName || '설계사' }}
          </span>
          <button
            @click="handleLogout"
            class="text-[12px] lg:text-[13px] text-[#999] hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
