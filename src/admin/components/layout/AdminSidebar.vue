<script setup lang="ts">
import { ref, computed } from 'vue'
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
  collapsible: boolean
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    title: '',
    collapsible: false,
    items: [
      { label: '대시보드', icon: 'dashboard', to: '/', match: ['/'] },
    ],
  },
  {
    title: '고객/설계사',
    collapsible: true,
    items: [
      { label: '고객 관리', icon: 'people', to: '/customers', match: ['/customers'] },
      { label: '설계사 관리', icon: 'badge', to: '/agents', match: ['/agents'] },
      { label: 'DB 배분', icon: 'swap_horiz', to: '/assignments', match: ['/assignments'] },
    ],
  },
  {
    title: '설계사 앱',
    collapsible: true,
    items: [
      { label: '양식 관리', icon: 'description', to: '/templates', match: ['/templates'] },
      { label: '동의서 관리', icon: 'verified_user', to: '/consent-templates', match: ['/consent-templates'] },
      { label: '청구 관리', icon: 'receipt_long', to: '/claims', match: ['/claims'] },
      { label: '배치 청구', icon: 'content_copy', to: '/batch-claims', match: ['/batch-claims'] },
    ],
  },
  {
    title: '사용자 앱',
    collapsible: true,
    items: [
      { label: '병원 관리', icon: 'local_hospital', to: '/hospitals', match: ['/hospitals'] },
      { label: '건강검진 센터', icon: 'health_and_safety', to: '/health-centers', match: ['/health-centers'] },
      { label: '예약 관리', icon: 'event_note', to: '/reservations', match: ['/reservations'] },
      { label: '청구 신청 관리', icon: 'assignment', to: '/claim-requests', match: ['/claim-requests'] },
      { label: '배너 관리', icon: 'image', to: '/banners', match: ['/banners'] },
    ],
  },
  {
    title: '영업',
    collapsible: true,
    items: [
      { label: '추가계약 발굴', icon: 'person_search', to: '/additional-contracts', match: ['/additional-contracts'] },
      { label: '실적 현황', icon: 'bar_chart', to: '/performance', match: ['/performance'] },
    ],
  },
  {
    title: '운영',
    collapsible: true,
    items: [
      { label: '공지사항', icon: 'campaign', to: '/notices', match: ['/notices'] },
      { label: '알림 발송', icon: 'notifications_active', to: '/notifications', match: ['/notifications'] },
      { label: '상담 관리', icon: 'forum', to: '/consultations', match: ['/consultations'] },
      { label: 'API 사용 로그', icon: 'api', to: '/codef-logs', match: ['/codef-logs'] },
    ],
  },
]

function isActive(item: NavItem): boolean {
  const currentPath = route.path
  if (item.to === '/' && currentPath === '/') return true
  if (item.to !== '/' && currentPath.startsWith(item.to)) return true
  return false
}

function groupHasActive(group: NavGroup): boolean {
  return group.items.some(isActive)
}

const collapsed = ref<Record<number, boolean>>({})

const isCollapsed = computed(() => (gi: number) => {
  const group = navGroups[gi]
  if (!group || !group.collapsible) return false
  if (collapsed.value[gi] !== undefined) return collapsed.value[gi]
  return !groupHasActive(group)
})

function toggleGroup(gi: number) {
  collapsed.value[gi] = !isCollapsed.value(gi)
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
      <div v-for="(group, gi) in navGroups" :key="gi" class="mb-1">
        <!-- 접기 불가 그룹 (대시보드) -->
        <template v-if="!group.collapsible">
          <ul class="space-y-0.5 mb-3">
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
        </template>

        <!-- 아코디언 그룹 -->
        <template v-else>
          <button
            class="w-full flex items-center justify-between px-3 py-2 rounded-[8px] hover:bg-[#F8F8F8] transition-colors"
            @click="toggleGroup(gi)"
          >
            <span
              :class="[
                'text-[11px] font-semibold uppercase tracking-wider',
                groupHasActive(group) ? 'text-[#FF7B22]' : 'text-[#AAAAAA]',
              ]"
            >{{ group.title }}</span>
            <span
              :class="[
                'material-symbols-outlined text-[16px] transition-transform duration-200',
                isCollapsed(gi) ? '' : 'rotate-180',
                groupHasActive(group) ? 'text-[#FF7B22]' : 'text-[#CCCCCC]',
              ]"
            >expand_more</span>
          </button>
          <div
            :class="[
              'overflow-hidden transition-all duration-200',
              isCollapsed(gi) ? 'max-h-0 opacity-0' : 'max-h-[500px] opacity-100',
            ]"
          >
            <ul class="space-y-0.5 mt-0.5 mb-2">
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
        </template>
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
