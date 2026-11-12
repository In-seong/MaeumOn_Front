<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useBranchStore } from '../stores/branchStore'
import { fetchDashboardSummary } from '../services/adminApi'
import type { DashboardSummary } from '../types'

const router = useRouter()
const authStore = useAuthStore()
const branchStore = useBranchStore()
const dashboard = ref<DashboardSummary | null>(null)
const loading = ref(false)

const now = new Date()
const startDate = ref(formatDate(new Date(now.getFullYear(), now.getMonth(), 1)))
const endDate = ref(formatDate(now))

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10)
}

function setToday() {
  const today = new Date()
  startDate.value = formatDate(new Date(today.getFullYear(), today.getMonth(), 1))
  endDate.value = formatDate(today)
  loadDashboard()
}

const dateLabel = computed(() => {
  const d = new Date()
  const days = ['일', '월', '화', '수', '목', '금', '토']
  const day = d.getDay()
  const h = String(d.getHours()).padStart(2, '0')
  const m = String(d.getMinutes()).padStart(2, '0')
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} (${days[day]}) ${h}:${m} 기준`
})

async function loadDashboard() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {
      start_date: startDate.value,
      end_date: endDate.value,
      ...branchStore.getBranchParam(),
    }
    const res = await fetchDashboardSummary(params)
    dashboard.value = res.data.data
  } catch {
    dashboard.value = null
  } finally {
    loading.value = false
  }
}

function formatAmount(amount: number): string {
  if (amount >= 100000000) {
    const eok = Math.floor(amount / 100000000)
    const man = Math.floor((amount % 100000000) / 10000)
    return man > 0 ? `${eok}억 ${man.toLocaleString()}만` : `${eok}억`
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만`
  }
  return amount.toLocaleString()
}

function getBarWidth(count: number, max: number): string {
  if (max <= 0) return '0%'
  return Math.min((count / max) * 100, 100) + '%'
}

const maxRankingScore = computed(() => {
  if (!dashboard.value) return 1
  const top = dashboard.value.agent_ranking.top
  if (top.length === 0) return 1
  return Math.max(...top.map(a => a.contract_count + a.db_count), 1)
})

const actionItems = computed(() => {
  if (!dashboard.value) return []
  const ai = dashboard.value.action_items
  return [
    { key: 'unassigned_db', count: ai.unassigned_db, label: '미배분 DB', sub: '배분 대기 DB', color: '#FF7B22', to: '/assignments' },
    { key: 'no_contact_db', count: ai.no_contact_db, label: '미연락 DB', sub: '배분 후 24시간 경과', color: '#E8A838', to: '/assignments' },
    { key: 'pending_reservations', count: ai.pending_reservations, label: '병원 예약', sub: '신규 예약 고객', color: '#7C8DB5', to: '/reservations' },
    { key: 'unanswered_qna', count: ai.unanswered_qna, label: 'QnA', sub: '미답변 문의', color: '#999', to: '/consultations' },
  ]
})

const activityLabelStyle: Record<string, { bg: string; text: string }> = {
  paid: { bg: '#FFF3ED', text: '#FF7B22' },
  claim: { bg: '#E8F5E9', text: '#388E3C' },
  distribution: { bg: '#E3F2FD', text: '#1976D2' },
  contract: { bg: '#F3F3F3', text: '#555' },
}

watch(() => branchStore.selectedBranchId, () => loadDashboard())

onMounted(async () => {
  await authStore.fetchUser()
  await loadDashboard()
})
</script>

<template>
  <div class="p-4 lg:p-6 max-w-[1200px]">
    <!-- 헤더 -->
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
      <div>
        <h2 class="text-[20px] lg:text-[22px] font-bold text-[#333]">한눈에 보기</h2>
        <p class="text-[13px] text-[#999] mt-0.5">{{ dateLabel }}</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <button
          class="px-3 py-1.5 text-[13px] font-medium rounded-[8px] border border-[#333] text-[#333] bg-white hover:bg-[#F5F5F5]"
          @click="setToday"
        >오늘</button>
        <input
          type="date"
          v-model="startDate"
          class="px-2 py-1.5 text-[13px] border border-[#E0E0E0] rounded-[8px] bg-white"
          @change="loadDashboard"
        />
        <span class="text-[13px] text-[#999]">~</span>
        <input
          type="date"
          v-model="endDate"
          class="px-2 py-1.5 text-[13px] border border-[#E0E0E0] rounded-[8px] bg-white"
          @change="loadDashboard"
        />
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="flex items-center justify-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22]"></div>
    </div>

    <template v-else-if="dashboard">
      <!-- KPI 카드 — 1열: 3개 큰 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <!-- 신규 계약 · DB 전환률 (강조) -->
        <div class="bg-[#3D3024] text-white p-5 rounded-[16px]">
          <p class="text-[13px] text-[#CCBFB0] mb-1">신규 계약 · DB 전환률</p>
          <p class="text-[28px] font-bold leading-tight">
            {{ formatAmount(dashboard.kpi.contract_amount) }}<span class="text-[16px] font-normal">원</span>
          </p>
          <div class="mt-3 h-[6px] bg-[#5A4D3F] rounded-full overflow-hidden">
            <div
              class="h-full bg-[#E8A838] rounded-full transition-all"
              :style="{ width: Math.min(dashboard.kpi.conversion_rate, 100) + '%' }"
            ></div>
          </div>
          <div class="flex justify-between mt-2 text-[12px] text-[#CCBFB0]">
            <span>DB {{ dashboard.kpi.db_count }}건 중 계약 {{ dashboard.kpi.contract_count }}건</span>
            <span class="text-[#E8A838] font-bold">체결률 {{ dashboard.kpi.conversion_rate }}%</span>
          </div>
        </div>

        <!-- 신규 DB 유입 -->
        <div class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[13px] text-[#999] mb-1">신규 DB 유입</p>
          <p class="text-[28px] font-bold text-[#333] leading-tight">
            {{ dashboard.kpi.new_db_count.toLocaleString() }}<span class="text-[14px] font-normal text-[#999]">건</span>
          </p>
          <p class="text-[12px] text-[#999] mt-2">배분완료 {{ dashboard.kpi.assign_complete_rate }}%</p>
        </div>

        <!-- 활동 FC -->
        <div class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[13px] text-[#999] mb-1">활동 FC</p>
          <p class="text-[28px] font-bold text-[#333] leading-tight">
            {{ dashboard.kpi.active_agents.toLocaleString() }}<span class="text-[14px] font-normal text-[#999]">명</span>
          </p>
          <p v-if="dashboard.kpi.new_agents > 0" class="text-[12px] text-[#FF7B22] mt-2 font-medium">
            &#9650; 신규 {{ dashboard.kpi.new_agents }}명
          </p>
        </div>
      </div>

      <!-- KPI 카드 — 2열: 4개 작은 카드 -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <!-- 등록 고객 -->
        <div class="bg-white p-4 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[12px] text-[#999] mb-1">등록 고객</p>
          <p class="text-[22px] font-bold text-[#333]">
            {{ dashboard.kpi.total_customers.toLocaleString() }}<span class="text-[13px] font-normal text-[#999]">명</span>
          </p>
          <p v-if="dashboard.kpi.new_customers > 0" class="text-[11px] text-[#FF7B22] mt-1 font-medium">
            &#9650; 신규 {{ dashboard.kpi.new_customers }}명
          </p>
        </div>

        <!-- 제휴 병원 -->
        <div class="bg-white p-4 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[12px] text-[#999] mb-1">제휴 병원</p>
          <p class="text-[22px] font-bold text-[#333]">
            {{ dashboard.kpi.hospitals.toLocaleString() }}<span class="text-[13px] font-normal text-[#999]">개</span>
          </p>
          <p v-if="dashboard.kpi.new_hospitals > 0" class="text-[11px] text-[#FF7B22] mt-1 font-medium">
            &#9650; 신규 {{ dashboard.kpi.new_hospitals }}개
          </p>
        </div>

        <!-- API 사용 -->
        <div class="bg-white p-4 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[12px] text-[#999] mb-1">API 사용</p>
          <p class="text-[22px] font-bold text-[#333]">
            {{ dashboard.kpi.api_usage.toLocaleString() }}<span class="text-[13px] font-normal text-[#999]">건</span>
          </p>
        </div>

        <!-- 청구 접수 -->
        <div class="bg-white p-4 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
          <p class="text-[12px] text-[#999] mb-1">청구 접수</p>
          <p class="text-[22px] font-bold text-[#333]">
            {{ dashboard.kpi.claim_count.toLocaleString() }}<span class="text-[13px] font-normal text-[#999]">건</span>
          </p>
        </div>
      </div>

      <!-- 지금 처리할 일 -->
      <div class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] mb-6">
        <h3 class="text-[16px] font-bold text-[#333] mb-4">지금 처리할 일</h3>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div
            v-for="item in actionItems"
            :key="item.key"
            class="flex items-center gap-3 p-3 rounded-[12px] hover:bg-[#FAFAFA] cursor-pointer transition"
            @click="router.push(item.to)"
          >
            <div
              class="w-[40px] h-[40px] rounded-full flex items-center justify-center text-white text-[15px] font-bold flex-shrink-0"
              :style="{ backgroundColor: item.color }"
            >
              {{ item.count }}
            </div>
            <div class="min-w-0">
              <p class="text-[14px] font-semibold text-[#333] truncate">{{ item.label }}</p>
              <p class="text-[12px] text-[#999] truncate">{{ item.sub }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 설계사 성과 -->
      <div class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] mb-6">
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center gap-2">
            <h3 class="text-[16px] font-bold text-[#333]">설계사 성과</h3>
            <span class="text-[12px] text-[#999]">이번 달</span>
          </div>
          <span class="text-[13px] text-[#FF7B22] font-medium">
            전체 {{ dashboard.agent_ranking.total_agents }}명
          </span>
        </div>

        <!-- 범례 -->
        <div class="flex items-center gap-1 mb-3 text-[12px] text-[#999]">
          <span class="ml-[80px]">설계사</span>
          <span class="ml-1 inline-block w-[10px] h-[10px] rounded-sm bg-[#E86A33]"></span>
          <span>계약</span>
          <span class="ml-1 inline-block w-[10px] h-[10px] rounded-sm bg-[#E8A838]"></span>
          <span>DB</span>
          <span class="flex-1"></span>
          <span class="w-[70px] text-right">계약/DB</span>
          <span class="w-[55px] text-right">체결률</span>
          <span class="w-[55px] text-right">API 사용</span>
          <span class="w-[55px] text-right">청구처리</span>
        </div>

        <!-- 상위 랭킹 -->
        <div v-if="dashboard.agent_ranking.top.length > 0" class="space-y-2">
          <div
            v-for="(agent, idx) in dashboard.agent_ranking.top"
            :key="agent.agent_id"
            class="flex items-center gap-1 text-[13px]"
          >
            <span class="w-[80px] flex-shrink-0 font-medium text-[#333] truncate">
              <span class="text-[#999] mr-1">{{ idx + 1 }}</span>
              {{ agent.name }}
            </span>
            <div class="flex-1 h-[20px] flex items-center gap-0 min-w-0">
              <div
                class="h-full bg-[#E86A33] rounded-l-[4px]"
                :style="{ width: getBarWidth(agent.contract_count, maxRankingScore) }"
              ></div>
              <div
                class="h-full bg-[#E8A838] rounded-r-[4px]"
                :style="{ width: getBarWidth(agent.db_count, maxRankingScore) }"
              ></div>
            </div>
            <span class="w-[70px] text-right text-[#333] flex-shrink-0">
              <b>{{ agent.contract_count }}</b> / {{ agent.db_count }}건
            </span>
            <span class="w-[55px] text-right font-bold flex-shrink-0"
              :class="agent.conversion_rate >= 50 ? 'text-[#333]' : 'text-[#E86A33]'"
            >
              {{ agent.conversion_rate }}%
            </span>
            <span class="w-[55px] text-right text-[#333] flex-shrink-0">{{ agent.api_count }}</span>
            <span class="w-[55px] text-right text-[#333] flex-shrink-0">{{ agent.claim_count }}</span>
          </div>
        </div>
        <p v-else class="text-[13px] text-[#999] py-3">이번 달 활동 데이터가 없습니다.</p>

        <!-- 관리 필요 -->
        <template v-if="dashboard.agent_ranking.needs_care.length > 0">
          <div class="mt-4 pt-3 border-t border-[#F0F0F0]">
            <p class="text-[13px] text-[#E86A33] font-bold mb-2">관리 필요</p>
            <div class="space-y-2">
              <div
                v-for="agent in dashboard.agent_ranking.needs_care"
                :key="agent.agent_id"
                class="flex items-center gap-1 text-[13px]"
              >
                <span class="w-[80px] flex-shrink-0 text-[#333] truncate">{{ agent.name }}</span>
                <div class="flex-1 h-[20px] flex items-center gap-0 min-w-0">
                  <div
                    class="h-full bg-[#E86A33] rounded-l-[4px]"
                    :style="{ width: getBarWidth(agent.contract_count, maxRankingScore) }"
                  ></div>
                  <div
                    class="h-full bg-[#E8A838] rounded-r-[4px]"
                    :style="{ width: getBarWidth(agent.db_count, maxRankingScore) }"
                  ></div>
                </div>
                <span class="w-[70px] text-right text-[#333] flex-shrink-0">
                  <b>{{ agent.contract_count }}</b> / {{ agent.db_count }}건
                </span>
                <span class="w-[55px] text-right text-[#E86A33] font-bold flex-shrink-0">
                  {{ agent.conversion_rate }}%
                </span>
                <span class="w-[55px] text-right text-[#333] flex-shrink-0">{{ agent.api_count }}</span>
                <span class="w-[55px] text-right text-[#333] flex-shrink-0">{{ agent.claim_count }}</span>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- 최근 활동 -->
      <div class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-[16px] font-bold text-[#333]">최근 활동</h3>
        </div>
        <div v-if="dashboard.recent_activities.length > 0" class="space-y-0">
          <div
            v-for="(activity, idx) in dashboard.recent_activities"
            :key="idx"
            class="flex items-start gap-3 py-3 border-b border-[#F5F5F5] last:border-0"
          >
            <span class="text-[13px] text-[#999] w-[42px] flex-shrink-0 pt-0.5">{{ activity.time }}</span>
            <span
              class="px-2 py-0.5 rounded-[6px] text-[12px] font-medium flex-shrink-0"
              :style="{
                backgroundColor: activityLabelStyle[activity.type]?.bg ?? '#F3F3F3',
                color: activityLabelStyle[activity.type]?.text ?? '#555',
              }"
            >{{ activity.label }}</span>
            <span class="text-[13px] text-[#333]">{{ activity.description }}</span>
          </div>
        </div>
        <p v-else class="text-[13px] text-[#999] py-3">최근 활동이 없습니다.</p>
      </div>
    </template>

    <!-- 데이터 없음 -->
    <div v-else class="text-center py-20">
      <p class="text-[14px] text-[#999]">대시보드 데이터를 불러올 수 없습니다.</p>
      <button class="mt-3 px-4 py-2 text-[13px] bg-[#FF7B22] text-white rounded-[8px]" @click="loadDashboard">
        다시 시도
      </button>
    </div>
  </div>
</template>
