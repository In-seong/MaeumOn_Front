<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Period Toggle -->
        <section class="flex gap-2 mb-5">
          <button
            class="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all"
            :class="
              statisticsStore.period === 'monthly'
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#555]'
            "
            @click="statisticsStore.period = 'monthly'"
          >
            월간
          </button>
          <button
            class="flex-1 py-2.5 rounded-[12px] text-[13px] font-semibold transition-all"
            :class="
              statisticsStore.period === 'quarterly'
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white border border-[#E0E0E0] text-[#555]'
            "
            @click="statisticsStore.period = 'quarterly'"
          >
            분기
          </button>
        </section>

        <!-- Month Label -->
        <section class="mb-4">
          <h3 class="text-[16px] font-bold text-[#333]">
            {{ statisticsStore.currentPerformance.year }}년
            {{ statisticsStore.currentPerformance.month }}월 실적
          </h3>
        </section>

        <!-- Stat Cards Grid -->
        <section class="grid grid-cols-2 gap-3 mb-6">
          <StatCard
            label="DB배분"
            :value="statisticsStore.currentPerformance.db_distributed"
            unit="건"
            trend="up"
            color="orange"
          />
          <StatCard
            label="계약체결"
            :value="statisticsStore.currentPerformance.contracts_count"
            unit="건"
            trend="down"
            color="blue"
          />
          <StatCard
            label="계약금액"
            :value="formattedAmount"
            unit="만원"
            trend="up"
            color="green"
          />
          <StatCard
            label="전환율"
            :value="statisticsStore.currentPerformance.conversion_rate"
            unit="%"
            trend="down"
            color="purple"
          />
        </section>

        <!-- Processing Stats -->
        <section class="mb-6">
          <CardSection>
            <h4 class="text-[14px] font-semibold text-[#333] mb-3">처리 현황</h4>
            <div class="flex items-center gap-3 mb-2">
              <span class="text-[12px] text-[#999] w-[60px]">DB처리</span>
              <div class="flex-1 bg-[#F0F0F0] rounded-full h-[8px] overflow-hidden">
                <div
                  class="h-full bg-[#FF7B22] rounded-full transition-all"
                  :style="{ width: processedRate + '%' }"
                />
              </div>
              <span class="text-[12px] font-semibold text-[#FF7B22] w-[48px] text-right">
                {{ statisticsStore.currentPerformance.db_processed }}/{{ statisticsStore.currentPerformance.db_distributed }}
              </span>
            </div>
            <div class="flex items-center gap-3">
              <span class="text-[12px] text-[#999] w-[60px]">전환율</span>
              <div class="flex-1 bg-[#F0F0F0] rounded-full h-[8px] overflow-hidden">
                <div
                  class="h-full bg-[#4285F4] rounded-full transition-all"
                  :style="{ width: statisticsStore.currentPerformance.conversion_rate + '%' }"
                />
              </div>
              <span class="text-[12px] font-semibold text-[#4285F4] w-[48px] text-right">
                {{ statisticsStore.currentPerformance.conversion_rate }}%
              </span>
            </div>
          </CardSection>
        </section>

        <!-- Trend Section -->
        <section class="mb-4">
          <h3 class="text-[15px] font-semibold text-[#333] mb-3">최근 6개월 추이</h3>

          <!-- Bar Chart -->
          <CardSection>
            <div class="flex items-end gap-2 h-[160px] mb-3">
              <div
                v-for="item in statisticsStore.trendData"
                :key="item.month"
                class="flex-1 flex flex-col items-center justify-end h-full"
              >
                <span class="text-[10px] font-semibold text-[#333] mb-1">
                  {{ item.contracts_count }}
                </span>
                <div
                  class="w-full rounded-t-[4px] transition-all"
                  :class="isCurrentMonth(item.month) ? 'bg-[#FF7B22]' : 'bg-[#FFD5B8]'"
                  :style="{ height: barHeight(item.contracts_count) + '%' }"
                />
                <span class="text-[10px] text-[#999] mt-1.5">
                  {{ shortMonth(item.month) }}
                </span>
              </div>
            </div>
            <p class="text-[11px] text-[#999] text-center">계약 건수 기준</p>
          </CardSection>
        </section>

        <!-- Trend List -->
        <section>
          <CardSection>
            <h4 class="text-[14px] font-semibold text-[#333] mb-3">월별 상세</h4>
            <div class="flex flex-col divide-y divide-[#F0F0F0]">
              <div
                v-for="item in reversedTrendData"
                :key="item.month"
                class="flex items-center justify-between py-3 first:pt-0 last:pb-0"
              >
                <div>
                  <p class="text-[13px] font-semibold text-[#333]">{{ fullMonth(item.month) }}</p>
                  <p class="text-[11px] text-[#999]">전환율 {{ item.conversion_rate }}%</p>
                </div>
                <div class="text-right">
                  <p class="text-[14px] font-bold text-[#FF7B22]">{{ item.contracts_count }}건</p>
                  <p class="text-[11px] text-[#999]">{{ formatWon(item.contracts_amount) }}만원</p>
                </div>
              </div>
            </div>
          </CardSection>
        </section>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AgentAppHeader from '../../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatCard from '../../components/ui/StatCard.vue'
import { useStatisticsStore } from '../../stores/statisticsStore'

const statisticsStore = useStatisticsStore()

const formattedAmount = computed(() =>
  Math.round(statisticsStore.currentPerformance.contracts_amount / 10000).toLocaleString('ko-KR'),
)

const processedRate = computed(() => {
  const { db_processed, db_distributed } = statisticsStore.currentPerformance
  if (db_distributed === 0) return 0
  return Math.round((db_processed / db_distributed) * 100)
})

const reversedTrendData = computed(() => [...statisticsStore.trendData].reverse())

function barHeight(count: number): number {
  const max = Math.max(...statisticsStore.trendData.map((t) => t.contracts_count), 1)
  return Math.max((count / max) * 85, 5)
}

function isCurrentMonth(month: string): boolean {
  const now = new Date()
  const current = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
  return month === current
}

function shortMonth(month: string): string {
  const parts = month.split('-')
  return `${parseInt(parts[1] ?? '0')}월`
}

function fullMonth(month: string): string {
  const parts = month.split('-')
  return `${parts[0] ?? ''}년 ${parseInt(parts[1] ?? '0')}월`
}

function formatWon(amount: number): string {
  return Math.round(amount / 10000).toLocaleString('ko-KR')
}
</script>
