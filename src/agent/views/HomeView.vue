<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader :unread-count="unreadCount" />

      <main class="px-4 py-3 pb-20 overflow-y-auto" style="height: calc(100dvh - 66px - 60px);">
        <!-- 인사 헤더 -->
        <section class="mb-4">
          <div class="bg-gradient-to-r from-[#FF7B22] to-[#FF9F5A] rounded-[16px] p-5 text-white">
            <p class="text-[12px] opacity-80">{{ formattedToday }}</p>
            <h2 class="text-[18px] font-bold mt-1">{{ dashboard?.header.agent_name ?? '' }} FC님, 오늘도 화이팅!</h2>
            <p v-if="dashboard?.header.branch_name" class="text-[12px] opacity-80 mt-0.5">{{ dashboard.header.branch_name }}</p>
          </div>
        </section>

        <!-- 오늘의 일정 -->
        <section class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-[15px] font-bold text-[#333]">오늘의 일정</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium" @click="router.push('/schedule')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.today_schedules.length === 0" class="bg-white rounded-xl border border-[#ECECEC] p-4 text-center text-[13px] text-[#999]">
            오늘 예정된 일정이 없습니다
          </div>
          <div v-else class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            <div
              v-for="sch in dashboard.today_schedules"
              :key="sch.event_id"
              class="flex-shrink-0 w-[160px] bg-white rounded-xl border border-[#ECECEC] p-3 cursor-pointer active:bg-[#F8F8F8]"
              @click="router.push('/schedule')"
            >
              <div class="flex items-center gap-1.5 mb-1.5">
                <span class="w-2 h-2 rounded-full" :class="scheduleTypeColor(sch.event_type)" />
                <span class="text-[11px] text-[#999]">{{ scheduleTypeLabel(sch.event_type) }}</span>
              </div>
              <p class="text-[13px] font-semibold text-[#333] truncate">{{ sch.title }}</p>
              <p v-if="sch.start_time" class="text-[11px] text-[#999] mt-0.5">
                {{ formatTime(sch.start_time) }}<template v-if="sch.end_time"> ~ {{ formatTime(sch.end_time) }}</template>
              </p>
              <p v-if="sch.customer" class="text-[11px] text-[#777] mt-0.5 truncate">{{ sch.customer.name }}</p>
            </div>
          </div>
        </section>

        <!-- 이달의 실적 -->
        <section class="mb-4">
          <h3 class="text-[15px] font-bold text-[#333] mb-2">이달의 실적</h3>
          <div class="bg-white rounded-xl border border-[#ECECEC] p-4">
            <div class="grid grid-cols-3 gap-3 mb-3">
              <div class="text-center">
                <p class="text-[11px] text-[#999]">계약</p>
                <p class="text-[20px] font-bold text-[#FF7B22]">{{ perf.contracts_count }}</p>
                <p class="text-[10px] text-[#BBB]">건</p>
              </div>
              <div class="text-center">
                <p class="text-[11px] text-[#999]">체결률</p>
                <p class="text-[20px] font-bold text-[#333]">{{ perf.conversion_rate }}%</p>
              </div>
              <div class="text-center">
                <p class="text-[11px] text-[#999]">신규고객</p>
                <p class="text-[20px] font-bold text-[#333]">{{ perf.new_customers }}</p>
                <p class="text-[10px] text-[#BBB]">명</p>
              </div>
            </div>
            <div class="flex items-center justify-between text-[12px] text-[#777] mb-1.5">
              <span>계약금액 <b class="text-[#333]">{{ formatAmount(perf.contracts_amount) }}</b></span>
              <span>DB <b class="text-[#333]">{{ perf.db_count }}건</b></span>
            </div>
            <div v-if="perf.branch_rank != null && perf.branch_total != null" class="mt-2">
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#999]">지점순위</span>
                <span class="font-bold text-[#FF7B22]">{{ perf.branch_rank }}위 <span class="text-[#BBB] font-normal">/ {{ perf.branch_total }}명</span></span>
              </div>
              <div class="h-2 bg-[#F0F0F0] rounded-full overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-[#FF7B22] to-[#FFB574] rounded-full transition-all duration-500"
                  :style="{ width: rankPercent + '%' }"
                />
              </div>
            </div>
          </div>
        </section>

        <!-- 체크리스트 -->
        <section class="mb-4">
          <h3 class="text-[15px] font-bold text-[#333] mb-2">체크리스트</h3>
          <div class="flex gap-2.5">
            <button
              class="flex-1 bg-white rounded-xl border border-[#ECECEC] p-3 text-center active:bg-[#F8F8F8]"
              @click="router.push('/db-distribution')"
            >
              <div class="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-[16px] font-bold"
                :class="checklist.unregistered_db > 0 ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#F5F5F5] text-[#CCC]'"
              >{{ checklist.unregistered_db }}</div>
              <p class="text-[11px] text-[#777]">미등록DB</p>
            </button>
            <button
              class="flex-1 bg-white rounded-xl border border-[#ECECEC] p-3 text-center active:bg-[#F8F8F8]"
              @click="router.push('/claims')"
            >
              <div class="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-[16px] font-bold"
                :class="checklist.incomplete_claims > 0 ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#CCC]'"
              >{{ checklist.incomplete_claims }}</div>
              <p class="text-[11px] text-[#777]">미완료청구</p>
            </button>
            <button
              class="flex-1 bg-white rounded-xl border border-[#ECECEC] p-3 text-center active:bg-[#F8F8F8]"
              @click="router.push('/consultations')"
            >
              <div class="w-10 h-10 rounded-full mx-auto mb-1.5 flex items-center justify-center text-[16px] font-bold"
                :class="checklist.pending_consultations > 0 ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-[#F5F5F5] text-[#CCC]'"
              >{{ checklist.pending_consultations }}</div>
              <p class="text-[11px] text-[#777]">고객문의</p>
            </button>
          </div>
        </section>

        <!-- DB 배분 내역 -->
        <section class="mb-4">
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-[15px] font-bold text-[#333]">DB 배분 내역</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium" @click="router.push('/db-distribution')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.db_distributions.length === 0" class="bg-white rounded-xl border border-[#ECECEC] p-4 text-center text-[13px] text-[#999]">
            배분된 DB가 없습니다
          </div>
          <div v-else class="bg-white rounded-xl border border-[#ECECEC] overflow-hidden">
            <table class="w-full text-[12px]">
              <thead class="bg-[#FAFAFA] text-[#999]">
                <tr>
                  <th class="py-2 px-3 text-left font-medium">배분일</th>
                  <th class="py-2 px-3 text-left font-medium">고객</th>
                  <th class="py-2 px-3 text-left font-medium">병원</th>
                  <th class="py-2 px-3 text-right font-medium">등록기한</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dashboard.db_distributions"
                  :key="item.assignment_id"
                  class="border-t border-[#F0F0F0] cursor-pointer active:bg-[#FAFAFA]"
                  @click="router.push(`/customers/${item.customer_id}`)"
                >
                  <td class="py-2.5 px-3 text-[#777]">{{ formatDate(item.assignment_date) }}</td>
                  <td class="py-2.5 px-3 text-[#333] font-medium">{{ item.customer_name }}</td>
                  <td class="py-2.5 px-3 text-[#777] truncate max-w-[80px]">{{ item.hospital }}</td>
                  <td class="py-2.5 px-3 text-right" :class="deadlineClass(item.deadline)">{{ formatDate(item.deadline) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- 고객 관리 알림 -->
        <section v-if="dashboard && dashboard.customer_alerts.length > 0" class="mb-4">
          <h3 class="text-[15px] font-bold text-[#333] mb-2">고객 관리 알림</h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="(alert, idx) in dashboard.customer_alerts"
              :key="idx"
              class="bg-white rounded-xl border border-[#ECECEC] p-3 flex items-center gap-3 cursor-pointer active:bg-[#F8F8F8]"
              @click="router.push(`/customers/${alert.customer_id}`)"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6]' : 'bg-[#E3F2FD]'"
              >
                <svg v-if="alert.type === 'birthday'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75M8 3.13a4 4 0 0 0 0 7.75"/><circle cx="12" cy="7" r="4"/><path d="M12 11v10"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-[#333]">{{ alert.customer_name }}</p>
                <p class="text-[11px] text-[#999]">{{ alert.label }} · {{ formatDate(alert.date) }}</p>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-full shrink-0"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#E3F2FD] text-[#2196F3]'"
              >{{ alert.type === 'birthday' ? '생일' : '갱신' }}</span>
            </div>
          </div>
        </section>

        <!-- 공지·교육 -->
        <section v-if="dashboard && dashboard.notices.length > 0" class="mb-4">
          <h3 class="text-[15px] font-bold text-[#333] mb-2">공지·교육</h3>
          <div class="flex flex-col gap-2">
            <div
              v-for="notice in dashboard.notices"
              :key="notice.notice_id"
              class="bg-white rounded-xl border border-[#ECECEC] p-3"
            >
              <div class="flex items-center gap-2 mb-1">
                <span v-if="notice.is_pinned" class="text-[10px] px-1.5 py-0.5 bg-[#FF7B22] text-white rounded font-medium">고정</span>
                <span v-if="notice.notice_type" class="text-[10px] px-1.5 py-0.5 bg-[#F0F0F0] text-[#777] rounded">{{ notice.notice_type }}</span>
              </div>
              <p class="text-[13px] font-medium text-[#333] truncate">{{ notice.title }}</p>
              <p class="text-[11px] text-[#BBB] mt-0.5">{{ formatDate(notice.created_at) }}</p>
            </div>
          </div>
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
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboardFull, registerFcmToken } from '../services/agentApi'
import type { DashboardFull } from '../types'

const router = useRouter()
const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)

const dashboard = ref<DashboardFull | null>(null)

const perf = computed(() => dashboard.value?.performance ?? {
  contracts_count: 0,
  contracts_amount: 0,
  db_count: 0,
  conversion_rate: 0,
  new_customers: 0,
  branch_rank: null,
  branch_total: null,
})

const checklist = computed(() => dashboard.value?.checklist ?? {
  unregistered_db: 0,
  incomplete_claims: 0,
  pending_consultations: 0,
})

const rankPercent = computed(() => {
  const p = perf.value
  if (!p.branch_rank || !p.branch_total || p.branch_total === 0) return 0
  return Math.max(5, Math.round(((p.branch_total - p.branch_rank + 1) / p.branch_total) * 100))
})

const formattedToday = computed(() => {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const day = days[d.getDay()]
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${day})`
})

function scheduleTypeColor(type: string): string {
  const map: Record<string, string> = {
    manual: 'bg-[#FF7B22]',
    birthday: 'bg-[#E91E63]',
    contract_expiry: 'bg-[#2196F3]',
    insurance_expiry: 'bg-[#4CAF50]',
  }
  return map[type] ?? 'bg-[#999]'
}

function scheduleTypeLabel(type: string): string {
  const map: Record<string, string> = {
    manual: '일정',
    birthday: '생일',
    contract_expiry: '만기',
    insurance_expiry: '자동차만기',
  }
  return map[type] ?? '일정'
}

function formatTime(time: string): string {
  return time ? time.slice(0, 5) : ''
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(d.getTime())) return '-'
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function formatAmount(amount: number): string {
  if (amount >= 10000) return Math.round(amount / 10000) + '만원'
  if (amount >= 1000) return Math.round(amount / 1000) + '천원'
  return amount.toLocaleString() + '원'
}

function deadlineClass(dateStr: string | null | undefined): string {
  if (!dateStr) return 'text-[#999]'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(target.getTime())) return 'text-[#999]'
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return 'text-[#FF4444] font-semibold'
  if (diff <= 1) return 'text-[#FF7B22] font-semibold'
  return 'text-[#999]'
}

function setupFcmTokenHandler() {
  const win = window as unknown as Record<string, unknown>
  win.__handleFCMToken__ = async (token: string) => {
    if (!token) return
    win.__fcmToken__ = token
    try { await registerFcmToken({ fcm_token: token }) } catch { /* silent */ }
  }
  const android = (window as unknown as Record<string, { sendFCMToken?: () => void }>).Android
  if (android?.sendFCMToken) android.sendFCMToken()
  const savedToken = win.__fcmToken__ as string | undefined
  if (savedToken) (win.__handleFCMToken__ as (t: string) => void)(savedToken)
}

onMounted(async () => {
  setupFcmTokenHandler()
  await Promise.all([
    notificationStore.refreshUnreadCount(),
    fetchDashboardFull().then(res => {
      dashboard.value = res.data?.data ?? null
    }).catch(() => {}),
  ])
})
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
