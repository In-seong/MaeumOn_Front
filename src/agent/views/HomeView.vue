<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader :unread-count="unreadCount" />

      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Hero Banner -->
        <section class="mb-4">
          <HeroBanner :schedule-count="todayScheduleCount" :contact-count="pendingConsultations" />
        </section>

        <!-- Alerts -->
        <section class="flex flex-col gap-2 mb-4">
          <AlertCard
            v-if="pendingConsultations > 0"
            :title="`미처리 상담요청 ${pendingConsultations}건`"
            subtitle="빠른 응답이 필요합니다"
            variant="warning"
            @click="router.push('/consultations')"
          />
          <AlertCard
            v-if="upcomingObligations > 0"
            :title="`알릴의무 만기 임박 ${upcomingObligations}건`"
            subtitle="30일 이내 처리 필요"
            variant="danger"
            @click="router.push('/alert-duty')"
          />
        </section>

        <!-- Quick Menu -->
        <section class="mb-5">
          <AgentQuickMenu />
        </section>

        <!-- Todo List -->
        <section class="mb-5">
          <TodoListCard :items="todoDisplayItems" @toggle="toggleTodo" @navigate="navigateTo" />
        </section>

        <!-- 다가오는 알림 -->
        <section v-if="upcomingEvents.length > 0" class="mb-5">
          <CardSection>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[15px] font-semibold text-[#333]">다가오는 알림</h3>
              <button
                class="text-[12px] text-[#FF7B22] font-medium"
                @click="router.push('/schedule')"
              >
                전체보기
              </button>
            </div>
            <div class="flex flex-col gap-2.5">
              <div
                v-for="event in upcomingEvents.slice(0, 5)"
                :key="event.event_id"
                class="flex items-center gap-3 p-2.5 bg-[#FAFAFA] rounded-[10px] cursor-pointer active:bg-[#F0F0F0]"
                @click="router.push('/schedule')"
              >
                <span class="text-[18px]">{{ eventTypeIcon[event.event_type] ?? '📌' }}</span>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] font-medium text-[#333] truncate">{{ event.title }}</p>
                  <p class="text-[11px] text-[#999]">
                    {{ eventTypeLabel(event) }}
                    <template v-if="event.customer">· {{ event.customer.name }}</template>
                  </p>
                </div>
                <span class="text-[12px] flex-shrink-0" :class="daysUntilVariant(event.event_date)">
                  {{ daysUntil(event.event_date) }}
                </span>
              </div>
            </div>
          </CardSection>
        </section>

      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AgentAppHeader from '../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../components/layout/AgentBottomNav.vue'
import HeroBanner from '../components/ui/HeroBanner.vue'
import AgentQuickMenu from '../components/ui/AgentQuickMenu.vue'
import TodoListCard from '../components/ui/TodoListCard.vue'
import AlertCard from '../components/ui/AlertCard.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import { useScheduleStore } from '../stores/scheduleStore'
import { useConsultationStore } from '../stores/consultationStore'
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboard, registerFcmToken, fetchTodayTasks, toggleScheduleComplete } from '../services/agentApi'
import type { CalendarEvent, DashboardTask } from '../types'

const router = useRouter()
const scheduleStore = useScheduleStore()
const consultationStore = useConsultationStore()
const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)
const upcomingObligations = ref(0)
const dashboardPendingConsultations = ref(0)

const todayScheduleCount = computed(() => scheduleStore.schedulesForDate.length)
const pendingConsultations = computed(() => dashboardPendingConsultations.value)

// 다가오는 일정 (생일, 만기 등)
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

// FCM 토큰 수신 핸들러 (네이티브 앱에서 호출)
function setupFcmTokenHandler() {
  const win = window as unknown as Record<string, unknown>
  win.__handleFCMToken__ = async (token: string) => {
    if (!token) return
    try {
      await registerFcmToken({ fcm_token: token })
    } catch {
      // silent - 토큰 등록 실패해도 앱 사용에 지장 없음
    }
  }

  // 네이티브 앱에 토큰 요청
  const android = (window as unknown as Record<string, { sendFCMToken?: () => void }>).Android
  if (android?.sendFCMToken) {
    android.sendFCMToken()
  }
}

onMounted(async () => {
  setupFcmTokenHandler()

  await Promise.all([
    consultationStore.loadConsultations(),
    scheduleStore.loadMonth(),
    scheduleStore.loadUpcoming(30),
    notificationStore.refreshUnreadCount(),
    fetchDashboard().then(res => {
      upcomingObligations.value = res.data?.data?.upcoming_obligations ?? 0
      dashboardPendingConsultations.value = res.data?.data?.pending_consultations ?? 0
    }).catch(() => { /* silent */ }),
    fetchTodayTasks().then(res => {
      todayTasks.value = res.data?.data ?? []
    }).catch(() => { /* silent */ }),
  ])
})

// 오늘의 할일 (API 연동)
const todayTasks = ref<DashboardTask[]>([])

const todoDisplayItems = computed(() =>
  todayTasks.value.map(task => ({
    id: task.id,
    text: task.title,
    done: task.is_completed,
    type: task.type,
    subtitle: task.subtitle || undefined,
    canToggle: task.can_toggle,
    route: task.route,
  }))
)

async function toggleTodo(id: string) {
  const task = todayTasks.value.find(t => t.id === id)
  if (!task || !task.can_toggle) return

  // 낙관적 업데이트
  task.is_completed = !task.is_completed

  try {
    if (task.type === 'calendar' && task.related_id) {
      await toggleScheduleComplete(task.related_id)
    }
    // obligation 토글은 현재 별도 API가 없으므로 로컬만 변경
  } catch {
    // 실패 시 롤백
    task.is_completed = !task.is_completed
  }
}

function navigateTo(route: string) {
  router.push(route)
}
</script>
