<template>
  <header class="flex justify-between items-center h-[56px] px-5 py-2">
    <div class="flex items-center gap-2">
      <img :src="`${baseUrl}icons/LogoIcon.svg`" alt="ON:CARE" class="w-6 h-6" />
      <span class="text-[24px] font-bold leading-none translate-y-[0.5px]"><span class="text-[#FF6B2D]">ON:CARE</span></span>
      <span class="text-[11px] text-[#555] bg-white rounded px-2 py-0.5 font-bold ml-0.5">설계사</span>
    </div>
    <div class="flex items-center gap-1.5">
      <button class="p-1.5 relative" @click="router.push('/notifications')">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        </svg>
        <span
          v-if="unreadCount > 0"
          class="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 bg-[#FF3B30] rounded-full text-white text-[9px] font-bold flex items-center justify-center px-1"
        >{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
      </button>
      <div class="relative">
        <button class="p-1.5" @click="showMenu = !showMenu">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round">
            <line x1="4" y1="6" x2="20" y2="6"/>
            <line x1="4" y1="12" x2="20" y2="12"/>
            <line x1="4" y1="18" x2="20" y2="18"/>
          </svg>
        </button>
        <Teleport to="body">
          <div v-if="showMenu" class="fixed inset-0 z-[90]" @click="showMenu = false">
            <div
              class="absolute bg-white rounded-xl shadow-lg border border-[#E8E8E8] w-[200px] py-1.5 overflow-hidden"
              :style="{ top: '50px', right: '16px' }"
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

interface Props {
  unreadCount?: number
}

withDefaults(defineProps<Props>(), {
  unreadCount: 0
})

const router = useRouter()
const baseUrl = import.meta.env.BASE_URL

const showMenu = ref(false)

const menuItems = [
  { icon: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>', label: '고객관리', path: '/customers' },
  { icon: '<path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="1"/><path d="M9 14h6"/><path d="M9 18h6"/>', label: '청구관리', path: '/claims' },
  { icon: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/>', label: '새청구', path: '/claims/new' },
  { icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>', label: 'DB배분', path: '/db-distribution' },
  { icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>', label: '보험·건강', path: '/codef' },
  { icon: '<circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/><path d="M11 8v6"/><path d="M8 11h6"/>', label: '숨은 보험금 찾기', path: '/unclaimed' },
  { icon: '<path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/>', label: '통계', path: '/statistics' },
  { icon: '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>', label: '문의하기', path: '/inquiry' },
]

function goTo(path: string) {
  showMenu.value = false
  router.push(path)
}
</script>
