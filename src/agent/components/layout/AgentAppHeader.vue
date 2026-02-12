<template>
  <header class="flex justify-between items-center h-[66px] px-6 py-3">
    <div class="flex items-center gap-2.5">
      <img src="/icons/LogoIcon.svg" alt="보험청구ON" class="w-10 h-10" />
      <div class="flex flex-col justify-center translate-y-[1px]">
        <span class="text-[18px] font-jalnan font-bold text-black leading-none">보험청구ON</span>
        <span class="text-[11px] text-[#999] mt-1">{{ agentAuthStore.agentName }} · {{ agentAuthStore.agencyName }}</span>
      </div>
    </div>
    <div class="flex items-center gap-4">
      <button class="p-1 relative" @click="router.push('/notifications')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#FF3B30] rounded-full text-white text-[9px] font-bold flex items-center justify-center"
        >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../../stores/agentAuthStore'

interface Props {
  unreadCount?: number
}

withDefaults(defineProps<Props>(), {
  unreadCount: 0
})

const router = useRouter()
const agentAuthStore = useAgentAuthStore()
</script>
