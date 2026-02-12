<template>
  <nav class="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[402px] h-[60px] bg-white border-t border-[#E0E0E0] flex items-center justify-between py-1 z-50">
    <button
      v-for="item in navItems"
      :key="item.label"
      class="flex flex-col items-center justify-center flex-1 gap-0.5"
      @click="navigateTo(item)"
    >
      <div class="w-6 h-6 flex items-center justify-center">
        <component :is="item.icon" :active="isActive(item)" />
      </div>
      <span
        class="text-[10px] font-medium"
        :class="isActive(item) ? 'text-[#FF7B22]' : 'text-[#B0B0B0]'"
      >
        {{ item.label }}
      </span>
    </button>
  </nav>
</template>

<script setup lang="ts">
import { markRaw, type Component } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import HomeIcon from '@user/components/icons/HomeIcon.vue'
import CustomersIcon from '../icons/CustomersIcon.vue'
import ScheduleIcon from '../icons/ScheduleIcon.vue'
import StatisticsIcon from '../icons/StatisticsIcon.vue'
import MyPageIcon from '@user/components/icons/MyPageIcon.vue'

const route = useRoute()
const router = useRouter()

interface NavItem {
  icon: Component
  label: string
  path: string
  matchPaths: string[]
}

const navItems: NavItem[] = [
  { icon: markRaw(HomeIcon), label: '홈', path: '/', matchPaths: ['/'] },
  { icon: markRaw(CustomersIcon), label: '고객', path: '/customers', matchPaths: ['/customers'] },
  { icon: markRaw(ScheduleIcon), label: '일정', path: '/schedule', matchPaths: ['/schedule'] },
  { icon: markRaw(StatisticsIcon), label: '통계', path: '/statistics', matchPaths: ['/statistics'] },
  { icon: markRaw(MyPageIcon), label: '마이', path: '/mypage', matchPaths: ['/mypage'] },
]

function isActive(item: NavItem): boolean {
  const currentPath = route.path
  if (item.path === '/' && currentPath === '/') return true
  if (item.path === '/') return false
  return item.matchPaths.some(p => currentPath.startsWith(p))
}

function navigateTo(item: NavItem): void {
  router.push(item.path)
}
</script>
