<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="알릴의무 관리" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Urgency Filter Tabs -->
        <div class="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
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

        <!-- Obligation List -->
        <div class="flex flex-col gap-3">
          <ObligationItem
            v-for="item in filteredObligations"
            :key="item.obligation_id"
            :obligation="item"
          />
        </div>

        <div v-if="filteredObligations.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">해당 기간의 알릴의무 항목이 없습니다</p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ObligationItem from '../../components/ui/ObligationItem.vue'
import type { DisclosureObligation } from '../../types'

type UrgencyFilter = 'all' | 'imminent' | 'upcoming' | 'normal'

const activeFilter = ref<UrgencyFilter>('all')

const filterTabs: { label: string; value: UrgencyFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '당일 (D-Day)', value: 'imminent' },
  { label: '7일 이내', value: 'upcoming' },
  { label: '30일 이내', value: 'normal' },
]

const obligations = ref<DisclosureObligation[]>([
  {
    obligation_id: 1,
    customer_id: 201,
    customer_name: '김민수',
    contract_id: 301,
    insurance_company: '삼성생명',
    obligation_type: '건강고지',
    due_date: '2026-02-12',
    days_remaining: 0,
    urgency: 'imminent',
    status: 'pending',
  },
  {
    obligation_id: 2,
    customer_id: 202,
    customer_name: '이정아',
    contract_id: 302,
    insurance_company: '한화생명',
    obligation_type: '직업변경고지',
    due_date: '2026-02-12',
    days_remaining: 0,
    urgency: 'imminent',
    status: 'pending',
  },
  {
    obligation_id: 3,
    customer_id: 203,
    customer_name: '박서연',
    contract_id: 303,
    insurance_company: 'DB손보',
    obligation_type: '건강고지',
    due_date: '2026-02-15',
    days_remaining: 3,
    urgency: 'upcoming',
    status: 'pending',
  },
  {
    obligation_id: 4,
    customer_id: 204,
    customer_name: '최영호',
    contract_id: 304,
    insurance_company: '메리츠화재',
    obligation_type: '위험변경고지',
    due_date: '2026-02-17',
    days_remaining: 5,
    urgency: 'upcoming',
    status: 'pending',
  },
  {
    obligation_id: 5,
    customer_id: 205,
    customer_name: '정은지',
    contract_id: 305,
    insurance_company: '현대해상',
    obligation_type: '건강고지',
    due_date: '2026-02-19',
    days_remaining: 7,
    urgency: 'upcoming',
    status: 'pending',
  },
  {
    obligation_id: 6,
    customer_id: 206,
    customer_name: '한지원',
    contract_id: 306,
    insurance_company: '교보생명',
    obligation_type: '직업변경고지',
    due_date: '2026-02-28',
    days_remaining: 16,
    urgency: 'normal',
    status: 'pending',
  },
  {
    obligation_id: 7,
    customer_id: 207,
    customer_name: '오성민',
    contract_id: 307,
    insurance_company: 'KB손보',
    obligation_type: '건강고지',
    due_date: '2026-03-05',
    days_remaining: 21,
    urgency: 'normal',
    status: 'pending',
  },
  {
    obligation_id: 8,
    customer_id: 208,
    customer_name: '강수현',
    contract_id: 308,
    insurance_company: '삼성화재',
    obligation_type: '위험변경고지',
    due_date: '2026-03-10',
    days_remaining: 26,
    urgency: 'normal',
    status: 'pending',
  },
  {
    obligation_id: 9,
    customer_id: 209,
    customer_name: '윤재호',
    contract_id: 309,
    insurance_company: '한화손보',
    obligation_type: '건강고지',
    due_date: '2026-02-10',
    days_remaining: -2,
    urgency: 'imminent',
    status: 'completed',
  },
])

const countByUrgency = computed(() => {
  const pending = obligations.value.filter(o => o.status === 'pending')
  return {
    all: pending.length,
    imminent: pending.filter(o => o.urgency === 'imminent').length,
    upcoming: pending.filter(o => o.urgency === 'upcoming').length,
    normal: pending.filter(o => o.urgency === 'normal').length,
  }
})

const filteredObligations = computed(() => {
  let filtered = obligations.value.filter(o => o.status !== 'completed')
  if (activeFilter.value !== 'all') {
    filtered = filtered.filter(o => o.urgency === activeFilter.value)
  }
  return [...filtered].sort((a, b) => a.days_remaining - b.days_remaining)
})
</script>
