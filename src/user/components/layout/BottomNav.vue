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
import InsuranceIcon from '@user/components/icons/InsuranceIcon.vue'
import HealthIcon from '@user/components/icons/HealthIcon.vue'
import HospitalNavIcon from '@user/components/icons/HospitalNavIcon.vue'
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
  { icon: markRaw(InsuranceIcon), label: '보험', path: '/insurance', matchPaths: ['/insurance', '/coverage-analysis', '/unclaimed', '/claims'] },
  { icon: markRaw(HealthIcon), label: '건강', path: '/health-checkup', matchPaths: ['/health-checkup'] },
  { icon: markRaw(HospitalNavIcon), label: '병원', path: '/hospital', matchPaths: ['/hospital', '/reservation'] },
  { icon: markRaw(MyPageIcon), label: '마이', path: '/mypage', matchPaths: ['/mypage', '/notifications'] }
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
