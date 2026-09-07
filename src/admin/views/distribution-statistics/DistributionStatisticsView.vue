<template>
  <div class="p-4 lg:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">배분 통계</h1>

      <div class="flex bg-[#F8F8F8] rounded-[12px] p-1 shrink-0">
        <button
          v-for="option in periodOptions"
          :key="option.value"
          @click="changePeriod(option.value as 'day' | 'week' | 'month')"
          :class="[
            'px-4 py-2 text-[13px] font-medium rounded-[10px] transition-colors',
            currentPeriod === option.value
              ? 'bg-[#FF7B22] text-white shadow-sm'
              : 'text-[#999] hover:text-[#333]'
          ]"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <template v-else>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mb-6">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5"
        >
          <p class="text-[13px] text-[#999] mb-2">{{ card.label }}</p>
          <p class="text-[22px] font-bold text-[#333]">{{ card.value }}</p>
          <p class="text-[12px] text-[#999] mt-1">{{ card.unit }}</p>
        </div>
      </div>

      <div v-if="error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px] mb-4">
        {{ error }}
      </div>

      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <div class="px-4 lg:px-6 py-4 border-b border-[#F0F0F0]">
          <h2 class="text-[16px] font-bold text-[#333]">설계사별 배분 현황</h2>
        </div>

        <table class="min-w-full divide-y divide-[#E8E8E8]">
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
              v-for="agent in sortedAgents"
              :key="agent.agent_id"
              class="hover:bg-[#FFF8F3] transition-colors"
            >
              <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ agent.agent_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.resident_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.distribution_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] font-semibold text-[#333] text-right">{{ agent.total_count }}</td>
            </tr>
            <tr v-if="agents.length === 0">
              <td colspan="4" class="px-6 py-10 text-center text-[#999]">
                배분 데이터가 없습니다.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useBranchStore } from '../../stores/branchStore'
import { fetchDistributionStatistics } from '../../services/adminApi'
import type { DistributionStatAgent, DistributionStatSummary } from '../../types'

const branchStore = useBranchStore()

const loading = ref(false)
const error = ref<string | null>(null)
const currentPeriod = ref<'day' | 'week' | 'month'>('month')
const summary = ref<DistributionStatSummary | null>(null)
const agents = ref<DistributionStatAgent[]>([])
const sortField = ref<string>('total_count')
const sortDirection = ref<'asc' | 'desc'>('desc')

const periodOptions = [
  { label: '일간', value: 'day' },
  { label: '주간', value: 'week' },
  { label: '월간', value: 'month' },
]

const columns = [
  { key: 'agent_name', label: '설계사명', align: 'left' },
  { key: 'resident_count', label: '상주 DB', align: 'right' },
  { key: 'distribution_count', label: '배분 DB', align: 'right' },
  { key: 'total_count', label: '합계', align: 'right' },
]

const summaryCards = computed(() => {
  const s = summary.value
  if (!s) {
    return [
      { label: '상주 DB', value: '-', unit: '건' },
      { label: '배분 DB', value: '-', unit: '건' },
      { label: '전체 배분', value: '-', unit: '건' },
      { label: '배분 설계사', value: '-', unit: '명' },
    ]
  }
  return [
    { label: '상주 DB', value: s.total_resident.toLocaleString(), unit: '건' },
    { label: '배분 DB', value: s.total_distribution.toLocaleString(), unit: '건' },
    { label: '전체 배분', value: s.total_all.toLocaleString(), unit: '건' },
    { label: '배분 설계사', value: s.agent_count.toLocaleString(), unit: '명' },
  ]
})

const sortedAgents = computed(() => {
  const list = [...agents.value]
  const field = sortField.value as keyof DistributionStatAgent
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
    sortDirection.value = key === 'agent_name' ? 'asc' : 'desc'
  }
}

async function loadData() {
  loading.value = true
  error.value = null
  try {
    const response = await fetchDistributionStatistics({
      period: currentPeriod.value,
      ...branchStore.getBranchParam(),
    })
    summary.value = response.data.data.summary
    agents.value = response.data.data.agents
  } catch (e: any) {
    error.value = e.response?.data?.message || '배분 통계를 불러오는데 실패했습니다.'
  } finally {
    loading.value = false
  }
}

async function changePeriod(newPeriod: 'day' | 'week' | 'month') {
  currentPeriod.value = newPeriod
  await loadData()
}

watch(() => branchStore.selectedBranchId, () => {
  loadData()
})

onMounted(() => {
  loadData()
})
</script>
