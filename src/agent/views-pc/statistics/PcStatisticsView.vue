<template>
  <div class="p-6 bg-[#F4F5F7] min-h-full">
    <!-- 인사 헤더 -->
    <div class="mb-6">
      <p class="text-[13px] text-[#999]">{{ formattedToday }}</p>
      <h1 class="text-[24px] font-bold text-[#222] mt-1">
        {{ dashboard?.header.agent_name ?? '' }} <span class="text-[#FF7B22]">FC</span>님의 통계
      </h1>
    </div>

    <!-- 상단: 실적(8col) + 체크리스트(4col) -->
    <div class="grid grid-cols-12 gap-5 mb-5">
      <!-- 실적 카드 -->
      <div class="col-span-8">
        <div class="grid grid-cols-4 gap-4">
          <div class="bg-[#FF7B22] rounded-2xl p-5 text-white">
            <p class="text-[12px] opacity-80">이달 계약</p>
            <p class="text-[32px] font-extrabold leading-none mt-2">{{ perf.contracts_count }}</p>
            <p class="text-[12px] opacity-70 mt-1.5">{{ formatAmount(perf.contracts_amount) }}</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <p class="text-[12px] text-[#999]">체결률</p>
            <p class="text-[32px] font-extrabold text-[#222] leading-none mt-2">{{ perf.conversion_rate }}<span class="text-[18px] font-bold">%</span></p>
            <p class="text-[12px] text-[#BBB] mt-1.5">DB {{ perf.db_count }}건</p>
          </div>
          <div class="bg-white rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)]">
            <p class="text-[12px] text-[#999]">신규고객</p>
            <p class="text-[32px] font-extrabold text-[#222] leading-none mt-2">{{ perf.new_customers }}<span class="text-[18px] font-bold">명</span></p>
          </div>
          <div v-if="perf.branch_rank != null && perf.branch_total != null" class="bg-white rounded-2xl p-5 shadow-[0_1px_8px_rgba(0,0,0,0.06)] flex flex-col justify-center items-center">
            <p class="text-[12px] text-[#999]">지점순위</p>
            <p class="text-[32px] font-extrabold text-[#FF7B22] leading-none mt-2">{{ perf.branch_rank }}<span class="text-[18px] font-bold text-[#BBB]">/{{ perf.branch_total }}</span></p>
          </div>
        </div>
      </div>

      <!-- 체크리스트 -->
      <div class="col-span-4">
        <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] h-full divide-y divide-[#F5F5F5]">
          <button
            class="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors first:rounded-t-2xl"
            @click="router.push('/db-distribution')"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.unregistered_db > 0 ? 'bg-[#FFF0E6]' : 'bg-[#F5F5F5]'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.unregistered_db > 0 ? '#FF7B22' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <span class="flex-1 text-left text-[13px] font-medium text-[#333]">미등록 DB</span>
            <span class="text-[18px] font-bold" :class="checklist.unregistered_db > 0 ? 'text-[#FF7B22]' : 'text-[#DDD]'">{{ checklist.unregistered_db }}</span>
          </button>
          <button
            class="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/claims')"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.incomplete_claims > 0 ? 'bg-[#EBF5EB]' : 'bg-[#F5F5F5]'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.incomplete_claims > 0 ? '#4CAF50' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>
            </div>
            <span class="flex-1 text-left text-[13px] font-medium text-[#333]">미완료 청구</span>
            <span class="text-[18px] font-bold" :class="checklist.incomplete_claims > 0 ? 'text-[#4CAF50]' : 'text-[#DDD]'">{{ checklist.incomplete_claims }}</span>
          </button>
          <button
            class="w-full flex items-center gap-3.5 px-5 py-3.5 hover:bg-[#FAFAFA] transition-colors last:rounded-b-2xl"
            @click="router.push('/consultations')"
          >
            <div class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
              :class="checklist.pending_consultations > 0 ? 'bg-[#E8F0FE]' : 'bg-[#F5F5F5]'"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" :stroke="checklist.pending_consultations > 0 ? '#2196F3' : '#CCC'" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
            </div>
            <span class="flex-1 text-left text-[13px] font-medium text-[#333]">고객 문의</span>
            <span class="text-[18px] font-bold" :class="checklist.pending_consultations > 0 ? 'text-[#2196F3]' : 'text-[#DDD]'">{{ checklist.pending_consultations }}</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 하단: 일정(3col) + DB배분(5col) + 알림/공지(4col) -->
    <div class="grid grid-cols-12 gap-5">
      <!-- 오늘의 일정 -->
      <div class="col-span-3">
        <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5 h-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] font-bold text-[#222]">오늘의 일정</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/schedule')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.today_schedules.length === 0" class="text-center py-8">
            <svg class="mx-auto mb-2 text-[#DDD]" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
            <p class="text-[13px] text-[#BBB]">예정된 일정 없음</p>
          </div>
          <div v-else class="space-y-3">
            <div
              v-for="sch in dashboard.today_schedules"
              :key="sch.event_id"
              class="p-3 rounded-xl bg-[#FAFAFA] cursor-pointer hover:bg-[#F5F5F5] transition-colors"
              @click="router.push('/schedule')"
            >
              <div class="flex items-center gap-1.5 mb-1">
                <span class="w-1.5 h-1.5 rounded-full" :class="scheduleTypeColor(sch.event_type)" />
                <span class="text-[11px] text-[#AAA]">{{ scheduleTypeLabel(sch.event_type) }}</span>
              </div>
              <p class="text-[13px] font-semibold text-[#222] truncate">{{ sch.title }}</p>
              <p v-if="sch.start_time" class="text-[12px] text-[#FF7B22] font-medium mt-0.5">
                {{ formatTime(sch.start_time) }}<template v-if="sch.end_time"> ~ {{ formatTime(sch.end_time) }}</template>
              </p>
              <p v-if="sch.customer" class="text-[11px] text-[#999] mt-0.5 truncate">{{ sch.customer.name }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- DB 배분 -->
      <div class="col-span-5">
        <div class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5 h-full">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[15px] font-bold text-[#222]">DB 배분</h3>
            <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/db-distribution')">전체보기</button>
          </div>
          <div v-if="!dashboard || dashboard.db_distributions.length === 0" class="text-center py-8">
            <p class="text-[13px] text-[#BBB]">배분된 DB가 없습니다</p>
          </div>
          <div v-else>
            <table class="w-full text-[13px]">
              <thead>
                <tr class="text-[11px] text-[#AAA] border-b border-[#F0F0F0]">
                  <th class="text-left font-medium pb-2">고객</th>
                  <th class="text-left font-medium pb-2">병원</th>
                  <th class="text-left font-medium pb-2">배분일</th>
                  <th class="text-right font-medium pb-2">기한</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="item in dashboard.db_distributions"
                  :key="item.assignment_id"
                  class="border-b border-[#F5F5F5] last:border-0 cursor-pointer hover:bg-[#FAFAFA] transition-colors"
                  @click="router.push(`/customers/${item.customer_id}`)"
                >
                  <td class="py-2.5 font-medium text-[#222]">{{ item.customer_name }}</td>
                  <td class="py-2.5 text-[#888]">{{ item.hospital }}</td>
                  <td class="py-2.5 text-[#999]">{{ formatDate(item.assignment_date) }}</td>
                  <td class="py-2.5 text-right font-semibold" :class="deadlineClass(item.deadline)">{{ deadlineLabel(item.deadline) }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- 알림 + 공지 -->
      <div class="col-span-4 flex flex-col gap-5">
        <!-- 고객 알림 -->
        <div v-if="dashboard && dashboard.customer_alerts.length > 0" class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5">
          <h3 class="text-[15px] font-bold text-[#222] mb-3">고객 알림</h3>
          <div class="space-y-2">
            <div
              v-for="(alert, idx) in dashboard.customer_alerts"
              :key="idx"
              class="flex items-center gap-3 p-2.5 rounded-xl cursor-pointer hover:bg-[#FAFAFA] transition-colors"
              @click="router.push(`/customers/${alert.customer_id}`)"
            >
              <div class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6]' : 'bg-[#E8F0FE]'"
              >
                <svg v-if="alert.type === 'birthday'" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 0 0-3-3.87M4 21v-2a4 4 0 0 1 3-3.87"/><circle cx="12" cy="7" r="4"/></svg>
                <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v6l4 2"/></svg>
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] font-medium text-[#222] truncate">{{ alert.customer_name }}</p>
                <p class="text-[11px] text-[#999]">{{ alert.label }}</p>
              </div>
              <span class="text-[11px] px-2 py-0.5 rounded-md shrink-0 font-medium"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#E8F0FE] text-[#2196F3]'"
              >{{ formatDate(alert.date) }}</span>
            </div>
          </div>
        </div>

        <!-- 공지 -->
        <div v-if="dashboard && dashboard.notices.length > 0" class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5">
          <h3 class="text-[15px] font-bold text-[#222] mb-3">공지</h3>
          <div class="space-y-2">
            <div
              v-for="notice in dashboard.notices"
              :key="notice.notice_id"
              class="p-2.5 rounded-xl hover:bg-[#FAFAFA] transition-colors"
            >
              <div class="flex items-center gap-1.5 mb-1">
                <span v-if="notice.is_pinned" class="text-[10px] px-1.5 py-px bg-[#FF7B22] text-white rounded font-medium">고정</span>
                <span v-if="notice.notice_type" class="text-[10px] px-1.5 py-px bg-[#F0F0F0] text-[#888] rounded">{{ notice.notice_type }}</span>
                <span class="text-[10px] text-[#CCC] ml-auto">{{ formatDate(notice.created_at) }}</span>
              </div>
              <p class="text-[13px] font-medium text-[#333] truncate">{{ notice.title }}</p>
            </div>
          </div>
        </div>

        <!-- 알림/공지 없을 때 -->
        <div v-if="dashboard && dashboard.customer_alerts.length === 0 && dashboard.notices.length === 0" class="bg-white rounded-2xl shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5 text-center py-8">
          <p class="text-[13px] text-[#BBB]">알림 및 공지가 없습니다</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchDashboardFull } from '../../services/agentApi'
import type { DashboardFullData } from '../../services/agentApi'

const router = useRouter()

const dashboard = ref<DashboardFullData | null>(null)

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
  try {
    const res = await fetchDashboardFull()
    dashboard.value = res.data?.data ?? null
  } catch { /* silent */ }
})
</script>
