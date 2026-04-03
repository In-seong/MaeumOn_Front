<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보장 분석" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="loading" class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-[#FF7B22] mb-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-[14px] text-[#999]">보장 분석 데이터를 불러오는 중...</p>
        </div>

        <!-- 데이터 없음 -->
        <div v-else-if="!hasData" class="flex flex-col items-center justify-center py-16">
          <div class="w-[64px] h-[64px] mb-4 bg-[#F0F0F0] rounded-full flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="text-[16px] font-semibold text-[#222] mb-2">분석 데이터가 없습니다</p>
          <p class="text-[13px] text-[#999] text-center leading-relaxed">
            보험정보를 조회하면 보장 분석을<br/>확인할 수 있습니다.
          </p>
        </div>

        <!-- 분석 결과 -->
        <template v-else>
          <!-- 정액형 보장 통계 -->
          <div v-if="flatRateStats.length > 0" class="mb-5">
            <p class="text-[15px] font-semibold text-[#222] mb-2">정액형 보장 현황</p>
            <div class="flex flex-col gap-3">
              <CardSection v-for="stat in flatRateStats" :key="stat.stat_id">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[14px] font-medium text-[#333]">{{ stat.coverage_name }}</span>
                  <StatusBadge
                    :label="getCoverageBadgeLabel(stat)"
                    :variant="getCoverageBadgeVariant(stat)"
                  />
                </div>
                <ProgressBar
                  :percent="getCoveragePercent(stat)"
                  :variant="getCoverageProgressVariant(stat)"
                />
                <div class="flex items-center justify-between mt-2">
                  <span class="text-[11px] text-[#999]">
                    내 보장: {{ formatStatAmount(stat.self_coverage_amt) }}
                  </span>
                  <span class="text-[11px] text-[#999]">
                    동일그룹 평균: {{ formatStatAmount(stat.avg_group_coverage_amt) }}
                  </span>
                </div>
              </CardSection>
            </div>
          </div>

          <!-- 실손형 보장 통계 -->
          <div v-if="actualLossStats.length > 0" class="mb-5">
            <p class="text-[15px] font-semibold text-[#222] mb-2">실손형 보장 현황</p>
            <div class="flex flex-col gap-3">
              <CardSection v-for="stat in actualLossStats" :key="stat.stat_id">
                <div class="flex items-center justify-between mb-2">
                  <span class="text-[14px] font-medium text-[#333]">{{ stat.coverage_name }}</span>
                  <StatusBadge
                    :label="stat.self_reg_yn === 'Y' ? '가입' : '미가입'"
                    :variant="stat.self_reg_yn === 'Y' ? 'success' : 'danger'"
                  />
                </div>
                <div class="bg-[#F8F8F8] rounded-[10px] px-3 py-2.5">
                  <div class="flex items-center justify-between">
                    <span class="text-[12px] text-[#888]">동일그룹 가입률</span>
                    <span class="text-[14px] font-bold text-[#FF7B22]">
                      {{ stat.avg_group_reg_rate || '-' }}
                    </span>
                  </div>
                </div>
              </CardSection>
            </div>
          </div>

          <!-- 전체 보험 목록 요약 -->
          <div v-if="store.contracts.length > 0" class="mb-5">
            <p class="text-[15px] font-semibold text-[#222] mb-2">가입 보험 현황</p>
            <CardSection>
              <div
                v-for="contract in store.contracts"
                :key="contract.insurance_id"
                class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0"
              >
                <div>
                  <p class="text-[13px] font-medium text-[#333]">{{ contract.product_name || '보험상품' }}</p>
                  <p class="text-[11px] text-[#999]">{{ contract.insurance_company?.company_name || '' }}</p>
                </div>
                <span v-if="contract.premium_amount" class="text-[13px] font-bold text-[#222]">
                  월 {{ formatAmount(contract.premium_amount) }}
                </span>
              </div>
            </CardSection>
          </div>

          <!-- CTA -->
          <button
            class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform mb-6"
            @click="router.push('/consultation')"
          >
            전문가 상담 받기
          </button>
        </template>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import ProgressBar from '@user/components/ui/ProgressBar.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'
import type { InsuranceStatistic } from '@shared/types/credit4u'

const router = useRouter()
const store = useCredit4uStore()

const loading = ref(false)

const flatRateStats = computed(() =>
  store.statistics.filter(s => s.stat_type === 'flat_rate')
)

const actualLossStats = computed(() =>
  store.statistics.filter(s => s.stat_type === 'actual_loss')
)

const hasData = computed(() =>
  store.statistics.length > 0 || store.contracts.length > 0
)

function formatAmount(amount: number | null | undefined): string {
  if (!amount) return '0원'
  return amount.toLocaleString('ko-KR') + '원'
}

function formatStatAmount(amount: number | null | undefined): string {
  if (!amount) return '-'
  // 큰 금액은 만원 단위로 표시
  if (amount >= 10000) {
    return Math.round(amount / 10000).toLocaleString('ko-KR') + '만원'
  }
  return amount.toLocaleString('ko-KR') + '원'
}

function getCoveragePercent(stat: InsuranceStatistic): number {
  if (!stat.self_coverage_amt || !stat.avg_group_coverage_amt || stat.avg_group_coverage_amt === 0) {
    return 0
  }
  const pct = (stat.self_coverage_amt / stat.avg_group_coverage_amt) * 100
  return Math.min(pct, 100)
}

function getCoverageBadgeLabel(stat: InsuranceStatistic): string {
  const pct = getCoveragePercent(stat)
  if (pct >= 80) return '충분'
  if (pct >= 50) return '보통'
  return '부족'
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default'

function getCoverageBadgeVariant(stat: InsuranceStatistic): BadgeVariant {
  const pct = getCoveragePercent(stat)
  if (pct >= 80) return 'success'
  if (pct >= 50) return 'warning'
  return 'danger'
}

function getCoverageProgressVariant(stat: InsuranceStatistic): string {
  return getCoverageBadgeVariant(stat)
}

onMounted(async () => {
  loading.value = true
  try {
    // 통계 + 계약 목록 동시 조회
    await Promise.all([
      store.fetchStatistics(),
      store.contracts.length === 0 ? store.checkContracts() : Promise.resolve(),
    ])
  } finally {
    loading.value = false
  }
})
</script>
