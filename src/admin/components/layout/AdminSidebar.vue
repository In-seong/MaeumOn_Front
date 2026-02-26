<script setup lang="ts">
import { useRoute } from 'vue-router'

const route = useRoute()

defineProps<{
  open: boolean
}>()

const emit = defineEmits<{
  close: []
}>()

interface NavItem {
  label: string
  icon: string
  to: string
  match?: string[]
}

interface NavGroup {
  title: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: '',
    items: [
      { label: '대시보드', icon: 'dashboard', to: '/', match: ['/'] },
    ],
  },
  {
    title: '고객/설계사',
    items: [
      { label: '고객 관리', icon: 'people', to: '/customers', match: ['/customers'] },
      { label: '설계사 관리', icon: 'badge', to: '/agents', match: ['/agents'] },
      { label: 'DB 배분', icon: 'swap_horiz', to: '/assignments', match: ['/assignments'] },
    ],
  },
  {
    title: '영업',
    items: [
      { label: '추가계약 발굴', icon: 'person_search', to: '/additional-contracts', match: ['/additional-contracts'] },
      { label: '실적 현황', icon: 'bar_chart', to: '/performance', match: ['/performance'] },
    ],
  },
  {
    title: '운영',
    items: [
      { label: '공지사항', icon: 'campaign', to: '/notices', match: ['/notices'] },
      { label: '보험사 관리', icon: 'business', to: '/insurance-companies', match: ['/insurance-companies'] },
      { label: '양식 관리', icon: 'description', to: '/templates', match: ['/templates'] },
      { label: '청구 관리', icon: 'receipt_long', to: '/claims', match: ['/claims'] },
    ],
  },
]

function isActive(item: NavItem): boolean {
  const currentPath = route.path
  if (item.to === '/' && currentPath === '/') return true
  if (item.to !== '/' && currentPath.startsWith(item.to)) return true
  return false
}
</script>

<template>
  <!-- 모바일 오버레이 -->
  <Teleport to="body">
    <Transition name="fade">
      <div
        v-if="open"
        class="fixed inset-0 bg-black/40 z-40 lg:hidden"
        @click="emit('close')"
      />
    </Transition>
  </Teleport>

  <aside
    :class="[
      'fixed top-0 left-0 z-50 h-full w-[240px] bg-white border-r border-[#E8E8E8] flex flex-col transition-transform duration-200 ease-in-out',
      'lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:shrink-0',
      open ? 'translate-x-0' : '-translate-x-full',
    ]"
  >
    <!-- 로고 -->
    <div class="h-16 flex items-center justify-between px-5 border-b border-[#E8E8E8] shrink-0">
      <router-link to="/" class="flex items-center gap-2" @click="emit('close')">
        <img src="/icons/LogoIcon.svg" alt="마음ON" class="w-7 h-7" />
        <span class="text-[20px] font-bold text-[#FF7B22]">보험청구ON</span>
        <span class="text-[13px] text-[#999] font-medium">관리자</span>
      </router-link>
      <button class="lg:hidden text-[#999] hover:text-[#333]" @click="emit('close')">
        <span class="material-symbols-outlined text-[22px]">close</span>
      </button>
    </div>

    <!-- 네비게이션 -->
    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <div v-for="(group, gi) in navGroups" :key="gi" class="mb-4">
        <p v-if="group.title" class="px-3 mb-1 text-[11px] font-semibold text-[#AAAAAA] uppercase tracking-wider">
          {{ group.title }}
        </p>
        <ul class="space-y-0.5">
          <li v-for="item in group.items" :key="item.to">
            <router-link
              :to="item.to"
              :class="[
                'flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[14px] transition-colors',
                isActive(item)
                  ? 'bg-[#FFF3ED] text-[#FF7B22] font-medium'
                  : 'text-[#555] hover:bg-[#F8F8F8] hover:text-[#333]',
              ]"
              @click="emit('close')"
            >
              <span class="material-symbols-outlined text-[20px]">{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </router-link>
          </li>
        </ul>
      </div>
    </nav>
  </aside>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
