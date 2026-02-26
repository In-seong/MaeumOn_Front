<template>
  <div class="p-4 lg:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">실적 현황</h1>

      <!-- 기간 토글 -->
      <div class="flex bg-[#F8F8F8] rounded-[12px] p-1 shrink-0">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          @click="changePeriod(option.value as 'day' | 'week' | 'month')"
          :class="[
            'px-4 py-2 text-[13px] font-medium rounded-[10px] transition-colors',
            store.period === option.value
              ? 'bg-[#FF7B22] text-white shadow-sm'
              : 'text-[#999] hover:text-[#333]'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- 로딩 상태 (요약) -->
    <div v-if="summaryLoading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <template v-else>
      <!-- 요약 카드 -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5"
        >
          <p class="text-[13px] text-[#999] mb-2">{{ card.label }}</p>
          <p class="text-[22px] font-bold text-[#333]">{{ card.value }}</p>
          <p v-if="card.unit" class="text-[12px] text-[#999] mt-1">{{ card.unit }}</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px] mb-4">
        {{ store.error }}
      </div>

      <!-- 설계사 실적 테이블 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <div class="px-4 lg:px-6 py-4 border-b border-[#F0F0F0]">
          <h2 class="text-[16px] font-bold text-[#333]">설계사별 실적</h2>
        </div>

        <!-- 테이블 로딩 -->
        <div v-if="tableLoading" class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
        </div>

        <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                @click="toggleSort(col.key)"
                :class="[
                  'px-6 py-3 text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333] transition-colors',
                  col.align === 'right' ? 'text-right' : 'text-left'
                ]"
              >
                {{ col.label }}
                <span v-if="sortField === col.key" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-[#F0F0F0]">
            <tr
              v-for="agent in sortedAgentPerformances"
              :key="agent.agent_id"
              class="hover:bg-[#FAFAFA] transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ agent.agent_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.db_assigned_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.contract_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ formatAmount(agent.contract_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.consultation_count }}</td>
            </tr>
            <tr v-if="store.agentPerformances.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-[#999]">
                실적 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>

        <!-- 페이지네이션 -->
        <div v-if="store.pagination && store.pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
          <div class="flex justify-center gap-2">
            <button
              v-for="page in store.pagination.last_page"
              :key="page"
              @click="goToPage(page)"
              :class="[
                'px-3 py-1 rounded-[8px] text-[14px]',
                page === store.pagination.current_page
                  ? 'bg-[#FF7B22] text-white'
                  : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
              ]"
            >
              {{ page }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { usePerformanceStore } from '../../stores/performanceStore'
import type { AgentPerformance } from '../../types'

const store = usePerformanceStore()

const summaryLoading = ref(false)
const tableLoading = ref(false)

const sortField = ref<string>('agent_name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const periodOptions = [
  { label: '일간', value: 'day' },
  { label: '주간', value: 'week' },
  { label: '월간', value: 'month' },
]

const columns = [
  { key: 'agent_name', label: '설계사명', align: 'left' },
  { key: 'db_assigned_count', label: 'DB배분', align: 'right' },
  { key: 'contract_count', label: '계약 건수', align: 'right' },
  { key: 'contract_amount', label: '계약 금액', align: 'right' },
  { key: 'consultation_count', label: '상담 건수', align: 'right' },
]

const summaryCards = computed(() => {
  const s = store.summary
  if (!s) {
    return [
      { label: 'DB배분 건수', value: '-' },
      { label: '계약 건수', value: '-' },
      { label: '계약 금액', value: '-' },
      { label: 'DB처리율', value: '-' },
      { label: '전환율', value: '-' },
    ]
  }
  return [
    { label: 'DB배분 건수', value: s.total_assignments.toLocaleString(), unit: '건' },
    { label: '계약 건수', value: s.total_contracts.toLocaleString(), unit: '건' },
    { label: '계약 금액', value: formatAmount(s.total_contract_amount), unit: '원' },
    { label: 'DB처리율', value: `${s.db_processing_rate}%` },
    { label: '전환율', value: `${s.conversion_rate}%` },
  ]
})

const sortedAgentPerformances = computed(() => {
  const list = [...store.agentPerformances]
  const field = sortField.value as keyof AgentPerformance
  const dir = sortDirection.value === 'asc' ? 1 : -1

  list.sort((a, b) => {
    const valA = a[field] ?? 0
    const valB = b[field] ?? 0
    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB, 'ko') * dir
    }
    return ((valA as number) - (valB as number)) * dir
  })

  return list
})

function toggleSort(key: string) {
  if (sortField.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = key
    sortDirection.value = 'asc'
  }
}

async function changePeriod(newPeriod: 'day' | 'week' | 'month') {
  summaryLoading.value = true
  await store.loadSummary(newPeriod)
  summaryLoading.value = false
}

async function fetchAgentTable(page = 1) {
  tableLoading.value = true
  await store.loadAgentPerformances({ page })
  tableLoading.value = false
}

function goToPage(page: number) {
  fetchAgentTable(page)
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null) return '-'
  return amount.toLocaleString('ko-KR')
}

onMounted(async () => {
  summaryLoading.value = true
  tableLoading.value = true
  await Promise.all([
    store.loadSummary(),
    store.loadAgentPerformances(),
  ])
  summaryLoading.value = false
  tableLoading.value = false
})
</script>
