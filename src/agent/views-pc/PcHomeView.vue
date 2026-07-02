<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">대시보드</h1>

    <!-- 알림 배너 -->
    <div v-if="pendingConsultations > 0 || upcomingObligations > 0" class="flex gap-4 mb-6">
      <div
        v-if="pendingConsultations > 0"
        class="flex-1 bg-[#FFF8E1] border border-[#FFE082] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FFF3CD] transition-colors"
        @click="router.push('/consultations')"
      >
        <span class="material-symbols-outlined text-[24px] text-[#F9A825]">forum</span>
        <div>
          <p class="text-[14px] font-semibold text-[#333]">미처리 상담요청 {{ pendingConsultations }}건</p>
          <p class="text-[12px] text-[#999]">빠른 응답이 필요합니다</p>
        </div>
      </div>
      <div
        v-if="upcomingObligations > 0"
        class="flex-1 bg-[#FFEBEE] border border-[#EF9A9A] rounded-xl p-4 flex items-center gap-3 cursor-pointer hover:bg-[#FFCDD2] transition-colors"
        @click="router.push('/alert-duty')"
      >
        <span class="material-symbols-outlined text-[24px] text-[#E53935]">security</span>
        <div>
          <p class="text-[14px] font-semibold text-[#333]">알릴의무 만기 임박 {{ upcomingObligations }}건</p>
          <p class="text-[12px] text-[#999]">30일 이내 처리 필요</p>
        </div>
      </div>
    </div>

    <!-- 요약 카드 그리드 -->
    <div class="grid grid-cols-4 gap-4 mb-6">
      <router-link
        to="/customers"
        class="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[22px] text-[#FF7B22]">people</span>
          <span class="text-[13px] text-[#999]">고객관리</span>
        </div>
        <p class="text-[13px] text-[#555]">고객 목록 관리</p>
      </router-link>
      <router-link
        to="/claims"
        class="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[22px] text-[#FF7B22]">receipt_long</span>
          <span class="text-[13px] text-[#999]">청구관리</span>
        </div>
        <p class="text-[13px] text-[#555]">청구 현황 보기</p>
      </router-link>
      <router-link
        to="/claims/new"
        class="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[22px] text-[#FF7B22]">add_circle</span>
          <span class="text-[13px] text-[#999]">새 청구</span>
        </div>
        <p class="text-[13px] text-[#555]">보험금 청구하기</p>
      </router-link>
      <router-link
        to="/schedule"
        class="bg-white rounded-xl border border-[#E8E8E8] p-5 hover:shadow-md transition-shadow"
      >
        <div class="flex items-center gap-3 mb-2">
          <span class="material-symbols-outlined text-[22px] text-[#FF7B22]">event</span>
          <span class="text-[13px] text-[#999]">일정관리</span>
        </div>
        <p class="text-[13px] text-[#555]">오늘 일정 {{ todayScheduleCount }}건</p>
      </router-link>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- 오늘의 할일 -->
      <div class="col-span-2 bg-white rounded-xl border border-[#E8E8E8] p-5">
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
              :class="task.is_completed ? 'border-[#FF7B22] bg-[#FF7B22]' : 'border-[#D0D0D0]'"
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
      <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[16px] font-semibold text-[#333]">다가오는 일정</h2>
          <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/schedule')">전체보기</button>
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
            <span class="text-[16px]">{{ eventTypeIcon[event.event_type] ?? '📌' }}</span>
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useScheduleStore } from '../stores/scheduleStore'
import { useConsultationStore } from '../stores/consultationStore'
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboard, fetchTodayTasks, toggleScheduleComplete } from '../services/agentApi'
import type { CalendarEvent, DashboardTask } from '../types'

const router = useRouter()
const scheduleStore = useScheduleStore()
const consultationStore = useConsultationStore()
const notificationStore = useNotificationStore()
const upcomingObligations = ref(0)
const dashboardPendingConsultations = ref(0)

const todayScheduleCount = computed(() => scheduleStore.schedulesForDate.length)
const pendingConsultations = computed(() => dashboardPendingConsultations.value)
const upcomingEvents = computed(() => scheduleStore.upcomingEvents)

const eventTypeIcon: Record<string, string> = {
  birthday: '🎂',
  contract_expiry: '📋',
  insurance_expiry: '🚗',
  manual: '📌',
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
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff === 0) return '오늘'
  if (diff === 1) return '내일'
  if (diff < 0) return `${Math.abs(diff)}일 전`
  return `${diff}일 후`
}

function daysUntilVariant(dateStr: string): string {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff <= 1) return 'text-[#FF4444] font-semibold'
  if (diff <= 7) return 'text-[#FF7B22] font-semibold'
  return 'text-[#999]'
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
    consultationStore.loadConsultations(),
    scheduleStore.loadMonth(),
    scheduleStore.loadUpcoming(30),
    notificationStore.refreshUnreadCount(),
    fetchDashboard().then(res => {
      upcomingObligations.value = res.data?.data?.upcoming_obligations ?? 0
      dashboardPendingConsultations.value = res.data?.data?.pending_consultations ?? 0
    }).catch(() => {}),
    fetchTodayTasks().then(res => {
      todayTasks.value = res.data?.data ?? []
    }).catch(() => {}),
  ])
})
</script>
