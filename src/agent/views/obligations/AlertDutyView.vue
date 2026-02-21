<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="알릴의무 관리" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Urgency Filter Tabs -->
        <div class="flex gap-2 mb-5 overflow-x-auto scrollbar-hide -mx-6 px-6">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            class="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
            :class="activeFilter === tab.value
              ? 'bg-[#FF7B22] text-white'
              : 'bg-white text-[#888] border border-[#E0E0E0]'"
            @click="activeFilter = tab.value"
          >
            {{ tab.label }}
            <span
              class="ml-1 text-[11px]"
              :class="activeFilter === tab.value ? 'text-white/80' : 'text-[#BBB]'"
            >{{ countByUrgency[tab.value] }}</span>
          </button>
        </div>

        <!-- Summary Cards -->
        <div class="grid grid-cols-3 gap-3 mb-5">
          <div class="bg-[#FFE5E5] rounded-[12px] p-3 text-center">
            <p class="text-[20px] font-bold text-[#FF0000]">{{ countByUrgency.imminent }}</p>
            <p class="text-[11px] text-[#FF0000]/70 mt-0.5">D-Day</p>
          </div>
          <div class="bg-[#FFF4E5] rounded-[12px] p-3 text-center">
            <p class="text-[20px] font-bold text-[#F3940E]">{{ countByUrgency.upcoming }}</p>
            <p class="text-[11px] text-[#F3940E]/70 mt-0.5">7일 이내</p>
          </div>
          <div class="bg-[#E8F0FE] rounded-[12px] p-3 text-center">
            <p class="text-[20px] font-bold text-[#4285F4]">{{ countByUrgency.normal }}</p>
            <p class="text-[11px] text-[#4285F4]/70 mt-0.5">30일 이내</p>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Obligation List -->
        <div v-else class="flex flex-col gap-3">
          <ObligationItem
            v-for="item in filteredObligations"
            :key="item.obligation_id"
            :obligation="item"
          />
        </div>

        <div v-if="!loading && filteredObligations.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">해당 기간의 알릴의무 항목이 없습니다</p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ObligationItem from '../../components/ui/ObligationItem.vue'
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
  const active = obligations.value.filter(o => o.obligation_status !== 'completed')
  return {
    all: active.length,
    imminent: active.filter(o => getUrgency(o.obligation_end_date) === 'imminent').length,
    upcoming: active.filter(o => getUrgency(o.obligation_end_date) === 'upcoming').length,
    normal: active.filter(o => getUrgency(o.obligation_end_date) === 'normal').length,
  }
})

const filteredObligations = computed(() => {
  let filtered = obligations.value.filter(o => o.obligation_status !== 'completed')
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(o => getUrgency(o.obligation_end_date) === activeFilter.value)
  }
  return [...filtered].sort(
    (a, b) => getDaysRemaining(a.obligation_end_date) - getDaysRemaining(b.obligation_end_date),
  )
})
</script>
