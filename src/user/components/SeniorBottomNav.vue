<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] h-[70px] bg-white border-t border-[#E0E0E0] flex items-center justify-between py-1 z-40">
    <button
      v-for="item in navItems"
      :key="item.label"
      class="flex flex-col items-center justify-center flex-1 gap-1"
      @click="navigateTo(item)"
    >
      <div class="w-8 h-8 flex items-center justify-center">
        <svg v-if="item.icon === 'claim'" width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M14 2V8H20" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 18V12" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 15H15" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="item.icon === 'hospital'" width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M3 21H21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M12 7V13" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M9 10H15" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
        <svg v-else-if="item.icon === 'health'" width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M22 12H18L15 21L9 3L6 12H2" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span
        class="text-[12px] font-semibold"
        :class="isActive(item) ? 'text-[#03C75A]' : 'text-[#B0B0B0]'"
      >
        {{ item.label }}
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

interface NavItem {
  icon: string
  label: string
  path: string
  matchPaths: string[]
}

const navItems: NavItem[] = [
  { icon: 'claim', label: '청구신청', path: '/claim-request', matchPaths: ['/claim-request'] },
  { icon: 'hospital', label: '병원예약', path: '/hospitals', matchPaths: ['/hospitals'] },
  { icon: 'health', label: '건강검진', path: '/health-centers', matchPaths: ['/health-centers'] },
]

function isActive(item: NavItem): boolean {
  return item.matchPaths.some(p => route.path.startsWith(p))
}

function navigateTo(item: NavItem): void {
  router.push(item.path)
}
</script>
