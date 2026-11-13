<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader :unread-count="unreadCount" />

      <main class="px-4 py-3 pb-20 overflow-y-auto" style="height: calc(100dvh - 66px - 60px);">

        <!-- 인사 헤더 -->
        <section class="mb-5">
          <p class="text-[12px] text-[#999] tracking-wide">{{ formattedToday }}</p>
          <h2 class="text-[20px] font-bold text-[#222] mt-1 leading-tight">
            {{ dashboard?.header.agent_name ?? '' }} <span class="text-[#FF7B22]">FC</span>님,
          </h2>
          <p class="text-[15px] text-[#666] mt-0.5">오늘도 화이팅!</p>
        </section>

        <!-- 실적 요약 -->
        <section class="mb-5">
          <div class="grid grid-cols-3 gap-2.5">
            <div class="bg-[#FF7B22] rounded-2xl p-3.5 text-white">
              <p class="text-[11px] opacity-80">이달 계약</p>
              <p class="text-[28px] font-extrabold leading-none mt-1.5">{{ perf.contracts_count }}</p>
              <p class="text-[11px] opacity-70 mt-1">{{ formatAmount(perf.contracts_amount) }}</p>
            </div>
            <div class="bg-white rounded-2xl p-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              <p class="text-[11px] text-[#999]">체결률</p>
              <p class="text-[28px] font-extrabold text-[#222] leading-none mt-1.5">{{ perf.conversion_rate }}<span class="text-[16px] font-bold">%</span></p>
              <p class="text-[11px] text-[#BBB] mt-1">DB {{ perf.db_count }}건</p>
            </div>
            <div class="bg-white rounded-2xl p-3.5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
              <p class="text-[11px] text-[#999]">신규고객</p>
              <p class="text-[28px] font-extrabold text-[#222] leading-none mt-1.5">{{ perf.new_customers }}<span class="text-[16px] font-bold">명</span></p>
              <div v-if="perf.branch_rank != null && perf.branch_total != null" class="mt-1">
                <p class="text-[11px] text-[#FF7B22] font-semibold">
                  <svg class="inline w-3 h-3 -mt-px mr-px" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M12 20V4m-7 7l7-7 7 7"/></svg>
                  {{ perf.branch_rank }}위<span class="text-[#BBB] font-normal">/{{ perf.branch_total }}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 체크리스트 -->
        <section class="mb-5">
          <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] divide-y divide-[#F5F5F5]">
            <button
              class="w-full flex items-center gap-3.5 px-4 py-3 active:bg-[#FAFAFA]"
              @click="router.push('/db-distribution')"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :class="checklist.unregistered_db > 0 ? 'bg-[#FFF0E6]' : 'bg-[#F5F5F5]'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.unregistered_db > 0 ? '#FF7B22' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              </div>
              <div class="flex-1 text-left">
                <p class="text-[13px] font-medium text-[#333]">미등록 DB</p>
              </div>
              <span class="text-[18px] font-bold" :class="checklist.unregistered_db > 0 ? 'text-[#FF7B22]' : 'text-[#DDD]'">{{ checklist.unregistered_db }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button
              class="w-full flex items-center gap-3.5 px-4 py-3 active:bg-[#FAFAFA]"
              @click="router.push('/claims')"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :class="checklist.incomplete_claims > 0 ? 'bg-[#EBF5EB]' : 'bg-[#F5F5F5]'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.incomplete_claims > 0 ? '#4CAF50' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
              </div>
              <div class="flex-1 text-left">
                <p class="text-[13px] font-medium text-[#333]">미완료 청구</p>
              </div>
              <span class="text-[18px] font-bold" :class="checklist.incomplete_claims > 0 ? 'text-[#4CAF50]' : 'text-[#DDD]'">{{ checklist.incomplete_claims }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
            <button
              class="w-full flex items-center gap-3.5 px-4 py-3 active:bg-[#FAFAFA]"
              @click="router.push('/consultations')"
            >
              <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                :class="checklist.pending_consultations > 0 ? 'bg-[#E8F0FE]' : 'bg-[#F5F5F5]'"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.pending_consultations > 0 ? '#2196F3' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
              </div>
              <div class="flex-1 text-left">
                <p class="text-[13px] font-medium text-[#333]">고객 문의</p>
              </div>
              <span class="text-[18px] font-bold" :class="checklist.pending_consultations > 0 ? 'text-[#2196F3]' : 'text-[#DDD]'">{{ checklist.pending_consultations }}</span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </div>
        </section>

        <!-- 오늘의 일정 -->
        <section class="mb-5">
          <div class="flex items-center justify-between mb-2.5">
            <h3 class="text-[15px] font-bold text-[#222]">오늘의 일정</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium" @click="router.push('/schedule')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.today_schedules.length === 0" class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5 text-center">
            <svg class="mx-auto mb-2 text-[#DDD]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <p class="text-[13px] text-[#BBB]">오늘 예정된 일정이 없습니다</p>
          </div>
          <div v-else class="flex gap-2.5 overflow-x-auto pb-1 scrollbar-hide">
            <div
              v-for="sch in dashboard.today_schedules"
              :key="sch.event_id"
              class="flex-shrink-0 w-[152px] bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-3.5 cursor-pointer active:bg-[#FAFAFA]"
              @click="router.push('/schedule')"
            >
              <div class="flex items-center gap-1.5 mb-2">
                <span class="w-1.5 h-1.5 rounded-full" :class="scheduleTypeColor(sch.event_type)" />
                <span class="text-[11px] text-[#AAA]">{{ scheduleTypeLabel(sch.event_type) }}</span>
              </div>
              <p class="text-[13px] font-semibold text-[#222] truncate leading-tight">{{ sch.title }}</p>
              <p v-if="sch.start_time" class="text-[12px] text-[#FF7B22] font-medium mt-1">
                {{ formatTime(sch.start_time) }}<template v-if="sch.end_time"> ~ {{ formatTime(sch.end_time) }}</template>
              </p>
              <p v-if="sch.customer" class="text-[11px] text-[#999] mt-0.5 truncate">{{ sch.customer.name }}</p>
            </div>
          </div>
        </section>

        <!-- DB 배분 내역 -->
        <section class="mb-5">
          <div class="flex items-center justify-between mb-2.5">
            <h3 class="text-[15px] font-bold text-[#222]">DB 배분</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium" @click="router.push('/db-distribution')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.db_distributions.length === 0" class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5 text-center">
            <p class="text-[13px] text-[#BBB]">배분된 DB가 없습니다</p>
          </div>
          <div v-else class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div
              v-for="(item, idx) in dashboard.db_distributions"
              :key="item.assignment_id"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-[#FAFAFA]"
              :class="idx > 0 ? 'border-t border-[#F5F5F5]' : ''"
              @click="router.push(`/customers/${item.customer_id}`)"
            >
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <p class="text-[14px] font-semibold text-[#222]">{{ item.customer_name }}</p>
                  <span class="text-[11px] text-[#BBB]">{{ item.hospital }}</span>
                </div>
                <p class="text-[11px] text-[#999] mt-0.5">배분 {{ formatDate(item.assignment_date) }}</p>
              </div>
              <div class="text-right shrink-0">
                <p class="text-[12px] font-semibold" :class="deadlineClass(item.deadline)">
                  {{ deadlineLabel(item.deadline) }}
                </p>
              </div>
            </div>
          </div>
        </section>

        <!-- 고객 관리 알림 -->
        <section v-if="dashboard && dashboard.customer_alerts.length > 0" class="mb-5">
          <h3 class="text-[15px] font-bold text-[#222] mb-2.5">고객 알림</h3>
          <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div
              v-for="(alert, idx) in dashboard.customer_alerts"
              :key="idx"
              class="flex items-center gap-3 px-4 py-3 cursor-pointer active:bg-[#FAFAFA]"
              :class="idx > 0 ? 'border-t border-[#F5F5F5]' : ''"
              @click="router.push(`/customers/${alert.customer_id}`)"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6]' : 'bg-[#E8F0FE]'"
              >
                <svg v-if="alert.type === 'birthday'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-[#222]">{{ alert.customer_name }}</p>
                <p class="text-[11px] text-[#999]">{{ alert.label }}</p>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-md shrink-0 font-medium"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#E8F0FE] text-[#2196F3]'"
              >{{ formatDate(alert.date) }}</span>
            </div>
          </div>
        </section>

        <!-- 공지 -->
        <section v-if="dashboard && dashboard.notices.length > 0" class="mb-5">
          <h3 class="text-[15px] font-bold text-[#222] mb-2.5">공지</h3>
          <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] overflow-hidden">
            <div
              v-for="(notice, idx) in dashboard.notices"
              :key="notice.notice_id"
              class="px-4 py-3"
              :class="idx > 0 ? 'border-t border-[#F5F5F5]' : ''"
            >
              <div class="flex items-center gap-1.5">
                <span v-if="notice.is_pinned" class="text-[10px] px-1.5 py-px bg-[#FF7B22] text-white rounded font-medium">고정</span>
                <span v-if="notice.notice_type" class="text-[10px] px-1.5 py-px bg-[#F0F0F0] text-[#888] rounded">{{ notice.notice_type }}</span>
                <span class="text-[10px] text-[#CCC] ml-auto">{{ formatDate(notice.created_at) }}</span>
              </div>
              <p class="text-[13px] font-medium text-[#333] truncate mt-1">{{ notice.title }}</p>
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
  if (diff < 0) return 'text-[#FF3B30]'
  if (diff <= 1) return 'text-[#FF7B22]'
  return 'text-[#999]'
}

function deadlineLabel(dateStr: string | null | undefined): string {
  if (!dateStr) return '-'
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const target = new Date(dateStr.slice(0, 10) + 'T00:00:00')
  if (isNaN(target.getTime())) return '-'
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return `${Math.abs(diff)}일 초과`
  if (diff === 0) return 'D-Day'
  if (diff <= 3) return `D-${diff}`
  return formatDate(dateStr)
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
