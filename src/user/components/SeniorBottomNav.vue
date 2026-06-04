<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] bg-white border-t border-[#E0E0E0] z-40">
    <div class="relative flex items-end justify-between px-2 pb-1 pt-2">
      <button
        v-for="item in navItems"
        :key="item.label"
        class="flex flex-col items-center justify-end flex-1 gap-0.5"
        :class="item.isCenter ? 'relative -mt-4' : ''"
        @click="navigateTo(item)"
      >
        <!-- 중앙 원형 버튼 (청구하기) -->
        <template v-if="item.isCenter">
          <div class="w-14 h-14 rounded-full bg-[#03C75A] -mt-7 shadow-lg flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <span class="text-[11px] font-semibold mt-0.5 text-[#03C75A]">{{ item.label }}</span>
        </template>
        <!-- 일반 탭 -->
        <template v-else>
          <div class="w-7 h-7 flex items-center justify-center">
            <!-- 홈 아이콘 -->
            <svg v-if="item.icon === 'home'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 9.5L12 3L21 9.5V20C21 20.5304 20.7893 21.0391 20.4142 21.4142C20.0391 21.7893 19.5304 22 19 22H5C4.46957 22 3.96086 21.7893 3.58579 21.4142C3.21071 21.0391 3 20.5304 3 20V9.5Z" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 22V12H15V22" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 예약 아이콘 (병원) -->
            <svg v-else-if="item.icon === 'reservation'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M3 21H21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 7V13" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M9 10H15" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <!-- 혜택 아이콘 (선물) -->
            <svg v-else-if="item.icon === 'benefits'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="8" width="18" height="13" rx="2" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2"/>
              <path d="M12 8V21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round"/>
              <path d="M3 12H21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round"/>
              <path d="M7.5 8C7.5 8 7.5 3 12 3C16.5 3 16.5 8 16.5 8" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <!-- 내예약 아이콘 (캘린더) -->
            <svg v-else-if="item.icon === 'my-reservations'" width="24" height="24" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="4" width="18" height="18" rx="2" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2"/>
              <path d="M16 2V6M8 2V6M3 10H21" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round"/>
              <path d="M8 14H10M14 14H16M8 18H10" :stroke="isActive(item) ? '#03C75A' : '#B0B0B0'" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <span
            class="text-[11px] font-semibold"
            :class="isActive(item) ? 'text-[#03C75A]' : 'text-[#B0B0B0]'"
          >
            {{ item.label }}
          </span>
        </template>
      </button>
    </div>
    <!-- safe area 하단 -->
    <div class="h-[env(safe-area-inset-bottom,0px)] bg-white"></div>
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
  isCenter?: boolean
}

const navItems: NavItem[] = [
  { icon: 'home', label: '홈', path: '/', matchPaths: ['/'] },
  { icon: 'reservation', label: '예약', path: '/reservation-select', matchPaths: ['/reservation-select', '/hospitals', '/health-centers'] },
  { icon: 'claim', label: '청구하기', path: '/claim-request', matchPaths: ['/claim-request'], isCenter: true },
  { icon: 'benefits', label: '혜택', path: '/benefits', matchPaths: ['/benefits'] },
  { icon: 'my-reservations', label: '내예약', path: '/my-reservations', matchPaths: ['/my-reservations'] },
]

function isActive(item: NavItem): boolean {
  if (item.path === '/') {
    return route.path === '/'
  }
  return item.matchPaths.some(p => route.path.startsWith(p))
}

function navigateTo(item: NavItem): void {
  router.push(item.path)
}
</script>
