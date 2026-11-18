<template>
  <div class="p-6 bg-[#F4F5F7] min-h-full">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">대시보드</h1>

    <!-- 퀵메뉴 2행 3열 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <router-link
        v-for="item in quickMenuItems"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-5 flex items-center gap-4 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-shadow"
      >
        <img
          :src="`${baseUrl}icons/3d/${item.image}`"
          :alt="item.label"
          class="w-[52px] h-[52px] object-contain shrink-0"
          loading="lazy"
        />
        <div>
          <p class="text-[14px] font-semibold text-[#333]">{{ item.label }}</p>
          <p class="text-[12px] text-[#999]">{{ item.sub }}</p>
        </div>
      </router-link>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- 오늘의 할일 -->
      <div class="col-span-2 bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-5">
        <h2 class="text-[16px] font-semibold text-[#333] mb-4">오늘의 할일</h2>
        <div v-if="todayTasks.length === 0" class="text-[13px] text-[#999] py-6 text-center">
          오늘 할일이 없습니다
        </div>
        <ul v-else class="space-y-2">
          <li
            v-for="task in todayTasks"
            :key="task.id"
            class="flex items-center gap-3 p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            :class="{ 'opacity-50': task.is_completed }"
          >
            <button
              v-if="task.can_toggle"
              class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="task.is_completed ? 'border-[#FF6B2D] bg-[#FF6B2D]' : 'border-[#D0D0D0]'"
              @click="toggleTodo(task.id)"
            >
              <span v-if="task.is_completed" class="material-symbols-outlined text-[14px] text-white">check</span>
            </button>
            <span v-else class="w-5 h-5 rounded-full bg-[#F0F0F0] shrink-0" />
            <div class="flex-1 min-w-0 cursor-pointer" @click="task.route && router.push(task.route)">
              <p class="text-[13px] text-[#333] truncate" :class="{ 'line-through': task.is_completed }">{{ task.title }}</p>
              <p v-if="task.subtitle" class="text-[11px] text-[#999] truncate">{{ task.subtitle }}</p>
            </div>
          </li>
        </ul>
      </div>

      <!-- 다가오는 일정 -->
      <div class="bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[16px] font-semibold text-[#333]">다가오는 일정</h2>
          <button class="text-[12px] text-[#FF6B2D] font-medium hover:underline" @click="router.push('/schedule')">전체보기</button>
        </div>
        <div v-if="upcomingEvents.length === 0" class="text-[13px] text-[#999] py-6 text-center">
          예정된 일정이 없습니다
        </div>
        <div v-else class="space-y-2.5">
          <div
            v-for="event in upcomingEvents.slice(0, 8)"
            :key="event.event_id"
            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] cursor-pointer transition-colors"
            @click="router.push('/schedule')"
          >
            <span class="material-symbols-outlined text-[18px] text-[#FF6B2D]">{{ eventTypeIcon[event.event_type] ?? 'push_pin' }}</span>
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-[#333] truncate">{{ event.title }}</p>
              <p class="text-[11px] text-[#999]">
                {{ eventTypeLabel(event) }}
                <template v-if="event.customer">· {{ event.customer.name }}</template>
              </p>
            </div>
            <span class="text-[12px] shrink-0" :class="daysUntilVariant(event.event_date)">
              {{ daysUntil(event.event_date) }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <!-- 팝업 공지 모달 -->
    <div
      v-if="currentPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      @click.self="dismissPopup(false)"
    >
      <div class="relative w-full max-w-[480px]">
        <button
          class="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center"
          @click="dismissPopup(false)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <img
          v-if="currentPopup.image_url"
          :src="currentPopup.image_url"
          :alt="currentPopup.title"
          class="w-full rounded-2xl cursor-pointer"
          @click="openPopupLink"
        />
        <button
          class="w-full mt-3 py-2.5 text-[13px] text-white/80 bg-black/30 rounded-xl backdrop-blur-sm"
          @click="dismissPopup(true)"
        >
          오늘 하루 안보기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/scheduleStore'
import { useNotificationStore } from '../stores/notificationStore'
import { useAgentAuthStore } from '../stores/agentAuthStore'
import { fetchTodayTasks, toggleScheduleComplete, fetchActivePopupNotices } from '../services/agentApi'
import type { PopupNoticeItem } from '../services/agentApi'
import type { CalendarEvent, DashboardTask } from '../types'

const router = useRouter()
const scheduleStore = useScheduleStore()
const notificationStore = useNotificationStore()
const authStore = useAgentAuthStore()

const upcomingEvents = computed(() => scheduleStore.upcomingEvents)

const isReviewAccount = computed(() => authStore.agent?.employee_number === 'TEST001')

const baseUrl = import.meta.env.BASE_URL

const allQuickMenuItems = [
  { image: '01_customer_management.png', label: '고객관리', sub: '고객 목록 관리', path: '/customers', review: true },
  { image: '02_claim_management.png', label: '청구관리', sub: '청구 현황 보기', path: '/claims', review: false },
  { image: '03_new_claim.png', label: '새 청구', sub: '보험금 청구하기', path: '/claims/new', review: false },
  { image: '04_messages.png', label: '메시지', sub: '안내 메시지 발송', path: '/messages/send', review: true },
  { image: '05_db_distribution.png', label: 'DB배분', sub: '신규 고객 배분', path: '/db-distribution', review: true },
  { image: '06_insurance_health.png', label: '보험·건강', sub: '보험 건강정보 조회', path: '/codef', review: false },
]

const quickMenuItems = computed(() =>
  isReviewAccount.value ? allQuickMenuItems.filter(i => i.review) : allQuickMenuItems
)

const eventTypeIcon: Record<string, string> = {
  birthday: 'cake',
  contract_expiry: 'description',
  insurance_expiry: 'directions_car',
  manual: 'push_pin',
}

function eventTypeLabel(event: CalendarEvent): string {
  const map: Record<string, string> = {
    birthday: '생일',
    contract_expiry: '보험 만기',
    insurance_expiry: '자동차보험 만기',
    manual: '일정',
  }
  return map[event.event_type] ?? '일정'
}

function daysUntil(dateStr: string): string {
  if (!dateStr) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(target.getTime())) return '-'
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '내일'
  if (diff < 0) return `${Math.abs(diff)}일 전`
  return `${diff}일 후`
}

function daysUntilVariant(dateStr: string): string {
  if (!dateStr) return 'text-[#999]'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(target.getTime())) return 'text-[#999]'
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 1) return 'text-[#FF4444] font-semibold'
  if (diff <= 7) return 'text-[#FF6B2D] font-semibold'
  return 'text-[#999]'
}

// 팝업 공지
const popupNotices = ref<PopupNoticeItem[]>([])
const popupIndex = ref(0)
const currentPopup = computed(() => {
  const item = popupNotices.value[popupIndex.value]
  return item ?? null
})

function isDismissedToday(id: number): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10)
    return localStorage.getItem(`popup_dismissed_${id}_${today}`) === '1'
  } catch {
    return false
  }
}

function dismissPopup(hideToday: boolean) {
  const popup = currentPopup.value
  if (popup && hideToday) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem(`popup_dismissed_${popup.popup_notice_id}_${today}`, '1')
    } catch { /* silent */ }
  }
  popupIndex.value++
}

function openPopupLink() {
  const popup = currentPopup.value
  if (popup?.link_url) {
    window.open(popup.link_url, '_blank', 'noopener')
  }
}

async function loadPopupNotices() {
  try {
    const res = await fetchActivePopupNotices()
    const all: PopupNoticeItem[] = res.data?.data ?? []
    popupNotices.value = all.filter(p => !isDismissedToday(p.popup_notice_id))
    popupIndex.value = 0
  } catch { /* silent */ }
}

const todayTasks = ref<DashboardTask[]>([])

async function toggleTodo(id: string) {
  const task = todayTasks.value.find(t => t.id === id)
  if (!task || !task.can_toggle) return
  task.is_completed = !task.is_completed
  try {
    if (task.type === 'calendar' && task.related_id) {
      await toggleScheduleComplete(task.related_id)
    }
  } catch {
    task.is_completed = !task.is_completed
  }
}

onMounted(async () => {
  await Promise.all([
    scheduleStore.loadMonth(),
    scheduleStore.loadUpcoming(30),
    notificationStore.refreshUnreadCount(),
    fetchTodayTasks().then(res => {
      todayTasks.value = res.data?.data ?? []
    }).catch(() => {}),
    loadPopupNotices(),
  ])
})
</script>
