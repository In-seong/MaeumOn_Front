<template>
  <div class="p-6">
    <!-- 인사 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-[22px] font-bold text-[#333]">{{ dashboard?.header.agent_name ?? '' }} FC님, 오늘도 화이팅!</h1>
        <p class="text-[13px] text-[#999] mt-0.5">
          {{ formattedToday }}
          <template v-if="dashboard?.header.branch_name"> · {{ dashboard.header.branch_name }}</template>
        </p>
      </div>
    </div>

    <!-- 상단 3열: 실적 + 체크리스트 + 일정 -->
    <div class="grid grid-cols-3 gap-5 mb-6">
      <!-- 이달의 실적 -->
      <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
        <h2 class="text-[15px] font-bold text-[#333] mb-4">이달의 실적</h2>
        <div class="grid grid-cols-3 gap-3 mb-4">
          <div class="text-center">
            <p class="text-[11px] text-[#999]">계약</p>
            <p class="text-[24px] font-bold text-[#FF7B22]">{{ perf.contracts_count }}</p>
            <p class="text-[10px] text-[#BBB]">건</p>
          </div>
          <div class="text-center">
            <p class="text-[11px] text-[#999]">체결률</p>
            <p class="text-[24px] font-bold text-[#333]">{{ perf.conversion_rate }}%</p>
          </div>
          <div class="text-center">
            <p class="text-[11px] text-[#999]">신규고객</p>
            <p class="text-[24px] font-bold text-[#333]">{{ perf.new_customers }}</p>
            <p class="text-[10px] text-[#BBB]">명</p>
          </div>
        </div>
        <div class="flex items-center justify-between text-[12px] text-[#777] mb-2">
          <span>계약금액 <b class="text-[#333]">{{ formatAmount(perf.contracts_amount) }}</b></span>
          <span>DB <b class="text-[#333]">{{ perf.db_count }}건</b></span>
        </div>
        <div v-if="perf.branch_rank != null && perf.branch_total != null">
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

      <!-- 체크리스트 -->
      <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
        <h2 class="text-[15px] font-bold text-[#333] mb-4">체크리스트</h2>
        <div class="space-y-3">
          <button
            class="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/db-distribution')"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold"
              :class="checklist.unregistered_db > 0 ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#F5F5F5] text-[#CCC]'"
            >{{ checklist.unregistered_db }}</div>
            <div class="text-left">
              <p class="text-[14px] font-medium text-[#333]">미등록 DB</p>
              <p class="text-[11px] text-[#999]">배정 후 미등록 고객</p>
            </div>
          </button>
          <button
            class="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/claims')"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold"
              :class="checklist.incomplete_claims > 0 ? 'bg-[#E8F5E9] text-[#4CAF50]' : 'bg-[#F5F5F5] text-[#CCC]'"
            >{{ checklist.incomplete_claims }}</div>
            <div class="text-left">
              <p class="text-[14px] font-medium text-[#333]">미완료 청구</p>
              <p class="text-[11px] text-[#999]">임시저장 또는 접수대기</p>
            </div>
          </button>
          <button
            class="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            @click="router.push('/consultations')"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center text-[18px] font-bold"
              :class="checklist.pending_consultations > 0 ? 'bg-[#E3F2FD] text-[#2196F3]' : 'bg-[#F5F5F5] text-[#CCC]'"
            >{{ checklist.pending_consultations }}</div>
            <div class="text-left">
              <p class="text-[14px] font-medium text-[#333]">고객 문의</p>
              <p class="text-[11px] text-[#999]">답변 대기중</p>
            </div>
          </button>
        </div>
      </div>

      <!-- 오늘의 일정 -->
      <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[15px] font-bold text-[#333]">오늘의 일정</h2>
          <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/schedule')">전체보기</button>
        </div>
        <div v-if="!dashboard || dashboard.today_schedules.length === 0" class="text-[13px] text-[#999] py-8 text-center">
          오늘 예정된 일정이 없습니다
        </div>
        <div v-else class="space-y-2.5">
          <div
            v-for="sch in dashboard.today_schedules.slice(0, 6)"
            :key="sch.event_id"
            class="flex items-center gap-3 p-2.5 rounded-lg hover:bg-[#FAFAFA] cursor-pointer transition-colors"
            @click="router.push('/schedule')"
          >
            <span class="w-2 h-2 rounded-full shrink-0" :class="scheduleTypeColor(sch.event_type)" />
            <div class="flex-1 min-w-0">
              <p class="text-[13px] font-medium text-[#333] truncate">{{ sch.title }}</p>
              <p class="text-[11px] text-[#999]">
                {{ scheduleTypeLabel(sch.event_type) }}
                <template v-if="sch.start_time"> · {{ formatTime(sch.start_time) }}</template>
                <template v-if="sch.customer"> · {{ sch.customer.name }}</template>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 하단 2열: DB배분 + 알림/공지 -->
    <div class="grid grid-cols-3 gap-5">
      <!-- DB 배분 내역 (2/3 너비) -->
      <div class="col-span-2 bg-white rounded-xl border border-[#E8E8E8] p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[15px] font-bold text-[#333]">DB 배분 내역</h2>
          <button class="text-[12px] text-[#FF7B22] font-medium hover:underline" @click="router.push('/db-distribution')">전체보기</button>
        </div>
        <div v-if="!dashboard || dashboard.db_distributions.length === 0" class="text-[13px] text-[#999] py-8 text-center">
          배분된 DB가 없습니다
        </div>
        <table v-else class="w-full text-[13px]">
          <thead class="text-[12px] text-[#999] border-b border-[#F0F0F0]">
            <tr>
              <th class="py-2 text-left font-medium">배분일</th>
              <th class="py-2 text-left font-medium">고객</th>
              <th class="py-2 text-left font-medium">병원</th>
              <th class="py-2 text-left font-medium">연락처</th>
              <th class="py-2 text-right font-medium">등록기한</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in dashboard.db_distributions"
              :key="item.assignment_id"
              class="border-b border-[#F8F8F8] hover:bg-[#FAFAFA] cursor-pointer transition-colors"
              @click="router.push(`/customers/${item.customer_id}`)"
            >
              <td class="py-2.5 text-[#777]">{{ formatDate(item.assignment_date) }}</td>
              <td class="py-2.5 text-[#333] font-medium">{{ item.customer_name }}</td>
              <td class="py-2.5 text-[#777]">{{ item.hospital }}</td>
              <td class="py-2.5 text-[#777]">{{ item.customer_phone }}</td>
              <td class="py-2.5 text-right" :class="deadlineClass(item.deadline)">{{ formatDate(item.deadline) }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 우측: 고객알림 + 공지 -->
      <div class="space-y-5">
        <!-- 고객 관리 알림 -->
        <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">고객 관리 알림</h2>
          <div v-if="!dashboard || dashboard.customer_alerts.length === 0" class="text-[13px] text-[#999] py-4 text-center">
            알림이 없습니다
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="(alert, idx) in dashboard.customer_alerts.slice(0, 5)"
              :key="idx"
              class="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[#FAFAFA] cursor-pointer transition-colors"
              @click="router.push(`/customers/${alert.customer_id}`)"
            >
              <span class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px]"
                :class="alert.type === 'birthday' ? 'bg-[#FFF0E6] text-[#FF7B22]' : 'bg-[#E3F2FD] text-[#2196F3]'"
              >{{ alert.type === 'birthday' ? 'B' : 'R' }}</span>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] text-[#333] truncate">{{ alert.customer_name }}</p>
                <p class="text-[11px] text-[#999]">{{ alert.label }} · {{ formatDate(alert.date) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 공지·교육 -->
        <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">공지·교육</h2>
          <div v-if="!dashboard || dashboard.notices.length === 0" class="text-[13px] text-[#999] py-4 text-center">
            공지사항이 없습니다
          </div>
          <div v-else class="space-y-2">
            <div
              v-for="notice in dashboard.notices"
              :key="notice.notice_id"
              class="p-2 rounded-lg hover:bg-[#FAFAFA] transition-colors"
            >
              <div class="flex items-center gap-1.5 mb-0.5">
                <span v-if="notice.is_pinned" class="text-[9px] px-1 py-px bg-[#FF7B22] text-white rounded font-medium">고정</span>
                <span v-if="notice.notice_type" class="text-[9px] px-1 py-px bg-[#F0F0F0] text-[#777] rounded">{{ notice.notice_type }}</span>
              </div>
              <p class="text-[13px] text-[#333] truncate">{{ notice.title }}</p>
              <p class="text-[10px] text-[#BBB] mt-0.5">{{ formatDate(notice.created_at) }}</p>
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

onMounted(async () => {
  await Promise.all([
    notificationStore.refreshUnreadCount(),
    fetchDashboardFull().then(res => {
      dashboard.value = res.data?.data ?? null
    }).catch(() => {}),
  ])
})
</script>
