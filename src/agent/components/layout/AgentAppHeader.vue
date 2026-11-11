<template>
  <header class="flex justify-between items-center h-[66px] px-6 py-3">
    <div class="flex items-center gap-2.5">
      <img src="/icons/LogoIcon.svg" alt="ON:CARE" class="w-10 h-10" />
      <div class="flex flex-col justify-center translate-y-[1px]">
        <span class="text-[20px] font-bold leading-none"><span class="text-[#EE7623]">ON:</span><span class="text-[#1c1c1c]">CARE</span></span>
        <span class="text-[11px] text-[#999] mt-1">{{ agentAuthStore.agentName }} · {{ agentAuthStore.agencyName }}</span>
      </div>
    </div>
    <div class="flex items-center gap-2">
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
      <div class="relative">
        <button class="p-1" @click="showMenu = !showMenu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="#333">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
        <Teleport to="body">
          <div v-if="showMenu" class="fixed inset-0 z-[90]" @click="showMenu = false">
            <div
              class="absolute bg-white rounded-xl shadow-lg border border-[#E8E8E8] w-[200px] py-1.5 overflow-hidden"
              :style="{ top: '58px', right: '16px' }"
              @click.stop
            >
              <button
                v-for="item in menuItems"
                :key="item.path"
                class="w-full px-4 py-2.5 text-left text-[14px] text-[#333] hover:bg-[#F5F5F5] flex items-center gap-2.5 transition-colors"
                @click="goTo(item.path)"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" v-html="item.icon" />
                {{ item.label }}
              </button>
            </div>
          </div>
        </Teleport>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
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

const showMenu = ref(false)

const menuItems = [
  { icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14h6"/><path d="M9 18h6"/>', label: '청구 관리', path: '/claims' },
  { icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', label: 'DB 배분', path: '/db-distribution' },
  { icon: '<path d="M3 21h18"/><path d="M5 21V7l8-4v18"/><path d="M19 21V11l-6-4"/><path d="M9 9v.01"/><path d="M9 12v.01"/><path d="M9 15v.01"/><path d="M9 18v.01"/>', label: '기업보험 문의', path: '/corporate-inquiries' },
  { icon: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>', label: '보험 조회 (CODEF)', path: '/codef' },
  { icon: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/><path d="M2 8c0-3.3 2.7-6 6-6"/><path d="M22 8c0-3.3-2.7-6-6-6"/>', label: '당직/민원', path: '/alert-duty' },
]

function goTo(path: string) {
  showMenu.value = false
  router.push(path)
}
</script>
