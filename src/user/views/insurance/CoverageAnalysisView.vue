<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보장 분석" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Score Card -->
        <CardSection class="mb-4">
          <div class="flex items-center gap-4">
            <div class="relative w-[80px] h-[80px]">
              <svg class="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="42" fill="none" stroke="#F0F0F0" stroke-width="8" />
                <circle cx="50" cy="50" r="42" fill="none" stroke="#FF7B22" stroke-width="8" stroke-dasharray="263.9" :stroke-dashoffset="263.9 * (1 - score / 100)" stroke-linecap="round" />
              </svg>
              <div class="absolute inset-0 flex items-center justify-center">
                <span class="text-[22px] font-bold text-[#FF7B22]">{{ score }}점</span>
              </div>
            </div>
            <div>
              <p class="text-[15px] font-semibold text-[#222] mb-1">보장 점수</p>
              <p class="text-[12px] text-[#888] leading-relaxed">전체적으로 양호하나 일부<br/>보장 항목 보완이 필요합니다.</p>
            </div>
          </div>
        </CardSection>

        <!-- Coverage Status -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">보장 현황</p>
          <div class="flex flex-col gap-3">
            <CardSection v-for="item in coverageStatus" :key="item.name">
              <div class="flex items-center justify-between mb-2">
                <span class="text-[14px] font-medium text-[#333]">{{ item.name }}</span>
                <StatusBadge :label="item.badge.label" :variant="item.badge.variant" />
              </div>
              <ProgressBar :percent="item.percent" :variant="item.progressVariant" />
              <p class="text-[11px] text-[#999] mt-1.5">{{ item.description }}</p>
            </CardSection>
          </div>
        </div>

        <!-- Duplicate Warning -->
        <CardSection class="mb-4 !bg-[#FFF9F0]">
          <div class="flex items-start gap-2">
            <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <p class="text-[13px] font-semibold text-[#F3940E] mb-0.5">중복 보장 주의</p>
              <p class="text-[12px] text-[#888] leading-relaxed">실손보험과 건강보험에서 입원일당이 중복됩니다. 보험료 절약을 위해 조정을 권장합니다.</p>
            </div>
          </div>
        </CardSection>

        <!-- Recommendations -->
        <div class="mb-5">
          <p class="text-[15px] font-semibold text-[#222] mb-2">추천 보완 사항</p>
          <div class="flex flex-col gap-2">
            <CardSection v-for="rec in recommendations" :key="rec.title">
              <div class="flex items-start gap-3">
                <div class="w-[36px] h-[36px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
                  <span class="text-[16px]">{{ rec.icon }}</span>
                </div>
                <div>
                  <p class="text-[14px] font-semibold text-[#222] mb-0.5">{{ rec.title }}</p>
                  <p class="text-[12px] text-[#888] leading-relaxed">{{ rec.description }}</p>
                </div>
              </div>
            </CardSection>
          </div>
        </div>

        <!-- CTA -->
        <button class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform mb-6" @click="router.push('/consultation')">
          전문가 상담 받기
        </button>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import ProgressBar from '@user/components/ui/ProgressBar.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'

const router = useRouter()

const score = 72

interface CoverageStatusItem {
  name: string
  badge: { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' }
  percent: number
  progressVariant: string
  description: string
}

const coverageStatus: CoverageStatusItem[] = [
  { name: '사망보장', badge: { label: '충분', variant: 'success' }, percent: 90, progressVariant: 'success', description: '종신보험 1억 + 건강보험 1억 = 2억원' },
  { name: '암 보장', badge: { label: '충분', variant: 'success' }, percent: 85, progressVariant: 'success', description: '암보험 5,000만원 + 건강보험 3,000만원' },
  { name: '뇌/심장 보장', badge: { label: '보통', variant: 'warning' }, percent: 60, progressVariant: 'warning', description: '건강보험 2,000만원 (추가 보완 권장)' },
  { name: '입원/수술 보장', badge: { label: '부족', variant: 'danger' }, percent: 35, progressVariant: 'danger', description: '입원일당 5만원 (10만원 이상 권장)' },
  { name: '실손 보장', badge: { label: '양호', variant: 'primary' }, percent: 75, progressVariant: 'primary', description: '4세대 실손보험 가입 중' },
]

interface Recommendation {
  icon: string
  title: string
  description: string
}

const recommendations: Recommendation[] = [
  { icon: '🏥', title: '입원/수술 보장 강화', description: '현재 입원일당 5만원으로 부족합니다. 10만원 이상으로 보완하는 것을 권장합니다.' },
  { icon: '🧠', title: '뇌혈관 보장 추가', description: '뇌출혈만 보장되며, 뇌경색 등 광범위 뇌혈관 보장 추가를 권장합니다.' },
  { icon: '💰', title: '중복 보장 정리', description: '입원일당 중복 부분을 정리하면 월 약 15,000원 절약 가능합니다.' },
]
</script>
