<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">알릴의무 관리</h1>

    <!-- 요약 카드 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-[#FFE5E5] rounded-[12px] p-4 text-center">
        <p class="text-[24px] font-bold text-[#FF0000]">{{ countByUrgency.imminent }}</p>
        <p class="text-[12px] text-[#FF0000]/70 mt-1">D-Day (당일)</p>
      </div>
      <div class="bg-[#FFF4E5] rounded-[12px] p-4 text-center">
        <p class="text-[24px] font-bold text-[#F3940E]">{{ countByUrgency.upcoming }}</p>
        <p class="text-[12px] text-[#F3940E]/70 mt-1">7일 이내</p>
      </div>
      <div class="bg-[#E8F0FE] rounded-[12px] p-4 text-center">
        <p class="text-[24px] font-bold text-[#4285F4]">{{ countByUrgency.normal }}</p>
        <p class="text-[12px] text-[#4285F4]/70 mt-1">30일 이내</p>
      </div>
    </div>

    <!-- 긴급도 필터 -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-full text-[13px] font-medium transition-colors',
          activeFilter === tab.value
            ? 'bg-[#FF7B22] text-white'
            : 'bg-white text-[#888] border border-[#E8E8E8] hover:border-[#FF7B22] hover:text-[#FF7B22]',
        ]"
        @click="activeFilter = tab.value"
      >
        {{ tab.label }}
        <span
          :class="[
            'ml-1 text-[11px]',
            activeFilter === tab.value ? 'text-white/80' : 'text-[#BBB]',
          ]"
        >{{ countByUrgency[tab.value] }}</span>
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto" />
      <p class="mt-2 text-[14px] text-[#999]">불러오는 중...</p>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">질병명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">진단일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">추적 종료일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">잔여일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">긴급도</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(item, index) in filteredObligations"
            :key="item.disclosure_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.customer?.name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ item.disease_name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">{{ formatDate(item.diagnosis_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(item.tracking_end_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px]" :class="daysRemainingClass(item.tracking_end_date)">
              {{ daysRemainingText(item.tracking_end_date) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="urgencyClass(item.tracking_end_date)"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ urgencyLabel(item.tracking_end_date) }}
              </span>
            </td>
          </tr>
          <tr v-if="filteredObligations.length === 0">
            <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
              해당 기간의 알릴의무 항목이 없습니다
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchObligations } from '../../services/agentApi'
import type { DisclosureObligation } from '../../types'

type UrgencyFilter = 'all' | 'imminent' | 'upcoming' | 'normal'

const activeFilter = ref<UrgencyFilter>('all')
const obligations = ref<DisclosureObligation[]>([])
const loading = ref(false)

const filterTabs: { label: string; value: UrgencyFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '당일 (D-Day)', value: 'imminent' },
  { label: '7일 이내', value: 'upcoming' },
  { label: '30일 이내', value: 'normal' },
]

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchObligations()
    obligations.value = res.data?.data?.data ?? []
  } catch {
    // Error handled globally
  } finally {
    loading.value = false
  }
})

function getDaysRemaining(endDate?: string): number {
  if (!endDate) return 999
  const end = new Date(endDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  end.setHours(0, 0, 0, 0)
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function getUrgency(endDate?: string): 'imminent' | 'upcoming' | 'normal' {
  const days = getDaysRemaining(endDate)
  if (days <= 0) return 'imminent'
  if (days <= 7) return 'upcoming'
  return 'normal'
}

const countByUrgency = computed(() => {
  const active = obligations.value.filter(o => !o.is_disclosed)
  return {
    all: active.length,
    imminent: active.filter(o => getUrgency(o.tracking_end_date) === 'imminent').length,
    upcoming: active.filter(o => getUrgency(o.tracking_end_date) === 'upcoming').length,
    normal: active.filter(o => getUrgency(o.tracking_end_date) === 'normal').length,
  }
})

const filteredObligations = computed(() => {
  let filtered = obligations.value.filter(o => !o.is_disclosed)
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(o => getUrgency(o.tracking_end_date) === activeFilter.value)
  }
  return [...filtered].sort(
    (a, b) => getDaysRemaining(a.tracking_end_date) - getDaysRemaining(b.tracking_end_date),
  )
})

function daysRemainingText(endDate?: string): string {
  const days = getDaysRemaining(endDate)
  if (days <= 0) return 'D-Day'
  return `D-${days}`
}

function daysRemainingClass(endDate?: string): string {
  const days = getDaysRemaining(endDate)
  if (days <= 0) return 'text-[#FF0000] font-bold'
  if (days <= 7) return 'text-[#F3940E] font-semibold'
  return 'text-[#4285F4]'
}

function urgencyLabel(endDate?: string): string {
  const u = getUrgency(endDate)
  const map: Record<string, string> = { imminent: 'D-Day', upcoming: '7일 이내', normal: '30일 이내' }
  return map[u] ?? '-'
}

function urgencyClass(endDate?: string): string {
  const u = getUrgency(endDate)
  const map: Record<string, string> = {
    imminent: 'bg-red-100 text-red-600',
    upcoming: 'bg-orange-100 text-orange-600',
    normal: 'bg-blue-100 text-blue-600',
  }
  return map[u] ?? 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
