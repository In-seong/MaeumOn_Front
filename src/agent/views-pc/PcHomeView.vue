<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">대시보드</h1>

    <!-- 퀵메뉴 2행 3열 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <router-link
        v-for="item in quickMenuItems"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-xl border border-[#E8E8E8] p-5 flex items-center gap-4 hover:shadow-md transition-shadow"
      >
        <div class="w-[52px] h-[52px] rounded-[14px] bg-[#FFF3ED] flex items-center justify-center shrink-0">
          <!-- 고객관리: 올 주황 -->
          <svg v-if="item.icon === 'customers'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <circle cx="16" cy="13" r="6" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <circle cx="16" cy="12" r="3.5" fill="white"/>
            <circle cx="16" cy="11" r="2.5" fill="#FFD5B8"/>
            <path d="M6 34C6 27 10.5 23 16 23C21.5 23 26 27 26 34" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M6 34C6 27.5 10.5 24 16 24C21.5 24 26 27.5 26 34" fill="#FF7B22" opacity="0.2"/>
            <circle cx="28" cy="15" r="4.5" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <circle cx="28" cy="14" r="2.5" fill="white"/>
            <circle cx="28" cy="13.5" r="1.8" fill="#FFD5B8"/>
            <path d="M24 34C24 29 26.5 26 29 25" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <!-- 청구관리: 체크 주황, 텍스트라인 초록 -->
          <svg v-else-if="item.icon === 'claims'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="8" width="24" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="4" width="12" height="7" rx="2" fill="#FF7B22"/>
            <circle cx="20" cy="7.5" r="1.5" fill="white"/>
            <rect x="13" y="16" width="14" height="2" rx="1" fill="#A8D5BA"/>
            <rect x="13" y="21" width="10" height="2" rx="1" fill="#A8D5BA"/>
            <rect x="13" y="26" width="12" height="2" rx="1" fill="#A8D5BA"/>
            <circle cx="29" cy="29" r="6" fill="#FF7B22"/>
            <path d="M26 29L28.5 31.5L33 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 새 청구: 플러스 주황, 텍스트라인 초록 -->
          <svg v-else-if="item.icon === 'newClaim'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="4" width="20" height="28" rx="3" fill="#FF7B22" opacity="0.15"/>
            <rect x="10" y="6" width="20" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="12" width="12" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="14" y="16" width="9" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="14" y="20" width="11" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <circle cx="27" cy="28" r="7" fill="#FF7B22"/>
            <path d="M27 24.5V31.5M23.5 28H30.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 메시지: N뱃지 주황 -->
          <svg v-else-if="item.icon === 'message'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="10" width="30" height="22" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M5 13L20 24L35 13" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="5" y="10" width="30" height="8" rx="3" fill="#FF7B22" opacity="0.15"/>
            <rect x="10" y="24" width="10" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="10" y="27" width="7" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <circle cx="32" cy="10" r="5" fill="#FF7B22"/>
            <text x="32" y="13.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">N</text>
          </svg>
          <!-- DB배분: 초록 하이라이트 유지 -->
          <svg v-else-if="item.icon === 'db'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <ellipse cx="20" cy="10" rx="13" ry="5" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 10V30C7 32.76 12.8 35 20 35C27.2 35 33 32.76 33 30V10" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 17C7 19.76 12.8 22 20 22C27.2 22 33 19.76 33 17" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 24C7 26.76 12.8 29 20 29C27.2 29 33 26.76 33 24" stroke="#FF7B22" stroke-width="1.5"/>
            <ellipse cx="20" cy="10" rx="9" ry="3" fill="#FF7B22" opacity="0.2"/>
            <ellipse cx="20" cy="17" rx="8" ry="2.5" fill="#C8E6C9" opacity="0.5"/>
            <ellipse cx="20" cy="24" rx="8" ry="2.5" fill="#C8E6C9" opacity="0.35"/>
          </svg>
          <!-- 보험·건강: 하트+방패 -->
          <svg v-else-if="item.icon === 'codef'" width="32" height="32" viewBox="0 0 40 40" fill="none">
            <path d="M20 6L8 12V20C8 28 13 33 20 36C27 33 32 28 32 20V12L20 6Z" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M20 10L12 14V20C12 26 15.5 30 20 32C24.5 30 28 26 28 20V14L20 10Z" fill="#FF7B22" opacity="0.2"/>
            <path d="M20 18C18.5 16 16 16 15 17.5C14 19 14.5 21 20 25C25.5 21 26 19 25 17.5C24 16 21.5 16 20 18Z" fill="#FF7B22" opacity="0.6"/>
          </svg>
        </div>
        <div>
          <p class="text-[14px] font-semibold text-[#333]">{{ item.label }}</p>
          <p class="text-[12px] text-[#999]">{{ item.sub }}</p>
        </div>
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
import { useNotificationStore } from '../stores/notificationStore'
import { fetchTodayTasks, toggleScheduleComplete } from '../services/agentApi'
import type { CalendarEvent, DashboardTask } from '../types'

const router = useRouter()
const scheduleStore = useScheduleStore()
const notificationStore = useNotificationStore()

const upcomingEvents = computed(() => scheduleStore.upcomingEvents)

const quickMenuItems = [
  { icon: 'customers', label: '고객관리', sub: '고객 목록 관리', path: '/customers' },
  { icon: 'claims', label: '청구관리', sub: '청구 현황 보기', path: '/claims' },
  { icon: 'newClaim', label: '새 청구', sub: '보험금 청구하기', path: '/claims/new' },
  { icon: 'message', label: '메시지', sub: '안내 메시지 발송', path: '/messages/send' },
  { icon: 'db', label: 'DB배분', sub: '신규 고객 배분', path: '/db-distribution' },
  { icon: 'codef', label: '보험·건강', sub: '보험 건강정보 조회', path: '/codef' },
]

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
    scheduleStore.loadMonth(),
    scheduleStore.loadUpcoming(30),
    notificationStore.refreshUnreadCount(),
    fetchTodayTasks().then(res => {
      todayTasks.value = res.data?.data ?? []
    }).catch(() => {}),
  ])
})
</script>
