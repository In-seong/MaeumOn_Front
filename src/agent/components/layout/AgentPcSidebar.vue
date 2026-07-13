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
      { label: '홈', icon: 'home', to: '/' },
    ],
  },
  {
    title: '고객 관리',
    collapsible: true,
    items: [
      { label: '고객 목록', icon: 'people', to: '/customers' },
      { label: '상담 요청', icon: 'forum', to: '/consultations' },
      { label: 'DB 배분', icon: 'swap_horiz', to: '/db-distribution' },
    ],
  },
  {
    title: '보험 청구',
    collapsible: true,
    items: [
      { label: '청구 관리', icon: 'receipt_long', to: '/claims' },
      { label: '새 청구', icon: 'add_circle', to: '/claims/new' },
      { label: '다중 청구', icon: 'content_copy', to: '/batch-claims/new' },
    ],
  },
  {
    title: '업무 관리',
    collapsible: true,
    items: [
      { label: '일정 관리', icon: 'event', to: '/schedule' },
      { label: '알릴의무', icon: 'security', to: '/alert-duty' },
      { label: '보험·건강 조회', icon: 'health_and_safety', to: '/codef' },
    ],
  },
  {
    title: '기타',
    collapsible: true,
    items: [
      { label: '통계', icon: 'bar_chart', to: '/statistics' },
      { label: '메시지 발송', icon: 'send', to: '/messages/send' },
      { label: '알림', icon: 'notifications', to: '/notifications' },
    ],
  },
]

const bottomItems: NavItem[] = [
  { label: '마이페이지', icon: 'person', to: '/mypage' },
]

function isActive(item: NavItem): boolean {
  const currentPath = route.path
  if (item.to === '/' && currentPath === '/') return true
  if (item.to === '/claims/new' && currentPath === '/claims/new') return true
  if (item.to === '/claims' && currentPath.startsWith('/claims') && !currentPath.startsWith('/claims/new')) return true
  if (item.to !== '/' && item.to !== '/claims' && item.to !== '/claims/new' && currentPath.startsWith(item.to)) return true
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
    <div class="h-16 flex items-center justify-between px-5 border-b border-[#E8E8E8] shrink-0">
      <router-link to="/" class="flex items-center gap-2" @click="emit('close')">
        <img src="/icons/LogoIcon.svg" alt="ON:CARE" class="w-7 h-7" />
        <span class="text-[20px] font-bold"><span class="text-[#EE7623]">ON:</span><span class="text-[#1c1c1c]">CARE</span></span>
        <span class="text-[13px] text-[#999] font-medium">설계사</span>
      </router-link>
      <button class="lg:hidden text-[#999] hover:text-[#333]" @click="emit('close')">
        <span class="material-symbols-outlined text-[22px]">close</span>
      </button>
    </div>

    <nav class="flex-1 overflow-y-auto py-4 px-3">
      <div v-for="(group, gi) in navGroups" :key="gi" class="mb-1">
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

    <div class="border-t border-[#E8E8E8] px-3 py-3 shrink-0">
      <ul class="space-y-0.5">
        <li v-for="item in bottomItems" :key="item.to">
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
