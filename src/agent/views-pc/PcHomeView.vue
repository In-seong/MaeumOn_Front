<template>
  <div class="p-6 max-w-[1200px] mx-auto">

    <!-- 인사 헤더 -->
    <div class="flex items-end justify-between mb-6">
      <div>
        <p class="text-[13px] text-[#999] tracking-wide">{{ formattedToday }}</p>
        <h1 class="text-[24px] font-bold text-[#222] mt-0.5">
          {{ dashboard?.header.agent_name ?? '' }} <span class="text-[#FF7B22]">FC</span>님, 오늘도 화이팅!
        </h1>
      </div>
      <p v-if="dashboard?.header.branch_name" class="text-[13px] text-[#999]">{{ dashboard.header.branch_name }}</p>
    </div>

    <!-- 실적 + 체크리스트 한 줄 -->
    <div class="grid grid-cols-12 gap-5 mb-5">

      <!-- 실적 카드 (8칸) -->
      <div class="col-span-8 bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
        <h2 class="text-[14px] font-bold text-[#222] mb-4">이달의 실적</h2>
        <div class="grid grid-cols-5 gap-4">
          <div class="bg-[#FF7B22] rounded-xl p-4 text-white col-span-1">
            <p class="text-[11px] opacity-80">계약</p>
            <p class="text-[32px] font-extrabold leading-none mt-2">{{ perf.contracts_count }}</p>
            <p class="text-[12px] opacity-70 mt-1.5">{{ formatAmount(perf.contracts_amount) }}</p>
          </div>
          <div class="p-4">
            <p class="text-[11px] text-[#999]">체결률</p>
            <p class="text-[32px] font-extrabold text-[#222] leading-none mt-2">{{ perf.conversion_rate }}<span class="text-[18px] font-bold">%</span></p>
          </div>
          <div class="p-4">
            <p class="text-[11px] text-[#999]">배분 DB</p>
            <p class="text-[32px] font-extrabold text-[#222] leading-none mt-2">{{ perf.db_count }}<span class="text-[18px] font-bold">건</span></p>
          </div>
          <div class="p-4">
            <p class="text-[11px] text-[#999]">신규고객</p>
            <p class="text-[32px] font-extrabold text-[#222] leading-none mt-2">{{ perf.new_customers }}<span class="text-[18px] font-bold">명</span></p>
          </div>
          <div class="p-4">
            <p class="text-[11px] text-[#999]">지점순위</p>
            <template v-if="perf.branch_rank != null && perf.branch_total != null">
              <p class="text-[32px] font-extrabold text-[#FF7B22] leading-none mt-2">{{ perf.branch_rank }}<span class="text-[18px] font-bold">위</span></p>
              <p class="text-[12px] text-[#BBB] mt-1.5">{{ perf.branch_total }}명 중</p>
            </template>
            <p v-else class="text-[24px] font-bold text-[#DDD] mt-2">-</p>
          </div>
        </div>
      </div>

      <!-- 체크리스트 (4칸) -->
      <div class="col-span-4 bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
        <h2 class="text-[14px] font-bold text-[#222] mb-4">체크리스트</h2>
        <div class="space-y-2">
          <button
            class="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/db-distribution')"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.unregistered_db > 0 ? 'bg-[#FFF0E6]' : 'bg-[#F5F5F5]'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="checklist.unregistered_db > 0 ? '#FF7B22' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div class="flex-1 text-left">
              <p class="text-[13px] font-medium text-[#333]">미등록 DB</p>
              <p class="text-[11px] text-[#AAA]">배정 후 미등록 고객</p>
            </div>
            <span class="text-[20px] font-bold" :class="checklist.unregistered_db > 0 ? 'text-[#FF7B22]' : 'text-[#DDD]'">{{ checklist.unregistered_db }}</span>
          </button>
          <button
            class="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/claims')"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.incomplete_claims > 0 ? 'bg-[#EBF5EB]' : 'bg-[#F5F5F5]'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="checklist.incomplete_claims > 0 ? '#4CAF50' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            </div>
            <div class="flex-1 text-left">
              <p class="text-[13px] font-medium text-[#333]">미완료 청구</p>
              <p class="text-[11px] text-[#AAA]">임시저장·접수대기</p>
            </div>
            <span class="text-[20px] font-bold" :class="checklist.incomplete_claims > 0 ? 'text-[#4CAF50]' : 'text-[#DDD]'">{{ checklist.incomplete_claims }}</span>
          </button>
          <button
            class="w-full flex items-center gap-3.5 p-3 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/consultations')"
          >
            <div class="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.pending_consultations > 0 ? 'bg-[#E8F0FE]' : 'bg-[#F5F5F5]'"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" :stroke="checklist.pending_consultations > 0 ? '#2196F3' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <div class="flex-1 text-left">
              <p class="text-[13px] font-medium text-[#333]">고객 문의</p>
              <p class="text-[11px] text-[#AAA]">답변 대기중</p>
            </div>
            <span class="text-[20px] font-bold" :class="checklist.pending_consultations > 0 ? 'text-[#2196F3]' : 'text-[#DDD]'">{{ checklist.pending_consultations }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 하단: 일정 + DB배분 + 알림/공지 -->
    <div class="grid grid-cols-12 gap-5">

      <!-- 오늘의 일정 (3칸) -->
      <div class="col-span-3 bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[14px] font-bold text-[#222]">오늘의 일정</h2>
          <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/schedule')">전체보기</button>
        </div>
        <div v-if="!dashboard || dashboard.today_schedules.length === 0" class="py-8 text-center">
          <svg class="mx-auto mb-2 text-[#DDD]" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
          <p class="text-[13px] text-[#BBB]">오늘 예정된 일정이 없습니다</p>
        </div>
        <div v-else class="space-y-2">
          <div
            v-for="sch in dashboard.today_schedules.slice(0, 6)"
            :key="sch.event_id"
            class="flex items-start gap-2.5 p-2.5 rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors"
            @click="router.push('/schedule')"
          >
            <span class="w-1.5 h-1.5 rounded-full mt-[7px] shrink-0" :class="scheduleTypeColor(sch.event_type)" />
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-[#222] truncate leading-tight">{{ sch.title }}</p>
              <p class="text-[11px] text-[#999] mt-0.5">
                <template v-if="sch.start_time"><span class="text-[#FF7B22] font-medium">{{ formatTime(sch.start_time) }}</span> · </template>
                {{ scheduleTypeLabel(sch.event_type) }}
                <template v-if="sch.customer"> · {{ sch.customer.name }}</template>
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- DB 배분 내역 (5칸) -->
      <div class="col-span-5 bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[14px] font-bold text-[#222]">DB 배분</h2>
          <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/db-distribution')">전체보기</button>
        </div>
        <div v-if="!dashboard || dashboard.db_distributions.length === 0" class="py-8 text-center">
          <p class="text-[13px] text-[#BBB]">배분된 DB가 없습니다</p>
        </div>
        <table v-else class="w-full text-[13px]">
          <thead class="text-[11px] text-[#AAA] uppercase tracking-wider">
            <tr>
              <th class="pb-2.5 text-left font-medium">고객</th>
              <th class="pb-2.5 text-left font-medium">병원</th>
              <th class="pb-2.5 text-left font-medium">연락처</th>
              <th class="pb-2.5 text-right font-medium">기한</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in dashboard.db_distributions"
              :key="item.assignment_id"
              class="border-t border-[#F5F5F5] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
              @click="router.push(`/customers/${item.customer_id}`)"
            >
              <td class="py-2.5">
                <p class="font-medium text-[#222]">{{ item.customer_name }}</p>
                <p class="text-[11px] text-[#BBB]">{{ formatDate(item.assignment_date) }} 배분</p>
              </td>
              <td class="py-2.5 text-[#777]">{{ item.hospital }}</td>
              <td class="py-2.5 text-[#777]">{{ item.customer_phone }}</td>
              <td class="py-2.5 text-right font-semibold" :class="deadlineClass(item.deadline)">{{ deadlineLabel(item.deadline) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 우측: 알림 + 공지 (4칸) -->
      <div class="col-span-4 space-y-5">
        <!-- 고객 알림 -->
        <div class="bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 class="text-[14px] font-bold text-[#222] mb-3">고객 알림</h2>
          <div v-if="!dashboard || dashboard.customer_alerts.length === 0" class="py-4 text-center">
            <p class="text-[13px] text-[#BBB]">알림이 없습니다</p>
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="(alert, idx) in dashboard.customer_alerts.slice(0, 5)"
              :key="idx"
              class="flex items-center gap-2.5 p-2 rounded-xl hover:bg-[#FAFAFA] cursor-pointer transition-colors"
              @click="router.push(`/customers/${alert.customer_id}`)"
            >
              <div class="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6]' : 'bg-[#E8F0FE]'"
              >
                <svg v-if="alert.type === 'birthday'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] text-[#222] truncate">{{ alert.customer_name }}</p>
                <p class="text-[11px] text-[#999]">{{ alert.label }}</p>
              </div>
              <span class="text-[11px] font-medium shrink-0"
                :class="alert.type === 'birthday' ? 'text-[#FF7B22]' : 'text-[#2196F3]'"
              >{{ formatDate(alert.date) }}</span>
            </div>
          </div>
        </div>

        <!-- 공지 -->
        <div class="bg-white rounded-2xl shadow-[0_1px_12px_rgba(0,0,0,0.06)] p-5">
          <h2 class="text-[14px] font-bold text-[#222] mb-3">공지</h2>
          <div v-if="!dashboard || dashboard.notices.length === 0" class="py-4 text-center">
            <p class="text-[13px] text-[#BBB]">공지사항이 없습니다</p>
          </div>
          <div v-else class="space-y-1">
            <div
              v-for="notice in dashboard.notices"
              :key="notice.notice_id"
              class="p-2.5 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            >
              <div class="flex items-center gap-1.5">
                <span v-if="notice.is_pinned" class="text-[9px] px-1.5 py-px bg-[#FF7B22] text-white rounded font-medium">고정</span>
                <span v-if="notice.notice_type" class="text-[9px] px-1.5 py-px bg-[#F0F0F0] text-[#888] rounded">{{ notice.notice_type }}</span>
                <span class="text-[10px] text-[#CCC] ml-auto">{{ formatDate(notice.created_at) }}</span>
              </div>
              <p class="text-[13px] text-[#333] truncate mt-1">{{ notice.title }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboardFull } from '../services/agentApi'
import type { DashboardFull } from '../types'

const router = useRouter()
const notificationStore = useNotificationStore()

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

onMounted(async () => {
  await Promise.all([
    notificationStore.refreshUnreadCount(),
    fetchDashboardFull().then(res => {
      dashboard.value = res.data?.data ?? null
    }).catch(() => {}),
  ])
})
</script>
