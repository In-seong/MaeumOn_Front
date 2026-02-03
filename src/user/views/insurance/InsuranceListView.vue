<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내 보험" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <div class="flex items-center justify-between mb-4">
          <span class="text-[12px] text-[#999]">2025년 1월 15일 기준</span>
          <button class="flex items-center gap-1 text-[12px] text-[#FF7B22] font-medium">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M23 4v6h-6M1 20v-6h6" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            새로고침
          </button>
        </div>
        <CardSection class="mb-4">
          <div class="flex items-center justify-between">
            <div>
              <p class="text-[12px] text-[#999]">총 보험 수</p>
              <p class="text-[20px] font-bold text-[#222]">5건</p>
            </div>
            <div class="text-right">
              <p class="text-[12px] text-[#999]">월 납입료</p>
              <p class="text-[20px] font-bold text-[#FF7B22]">385,000원</p>
            </div>
          </div>
        </CardSection>
        <div class="flex flex-col gap-3 mb-5">
          <router-link v-for="item in insuranceList" :key="item.id" :to="'/insurance/' + item.id" class="block">
            <CardSection>
              <div class="flex items-start justify-between mb-2">
                <span class="text-[13px] font-medium text-[#888]">{{ item.company }}</span>
                <div v-if="item.badge" class="flex gap-1">
                  <StatusBadge :label="item.badge.label" :variant="item.badge.variant" />
                </div>
              </div>
              <p class="text-[15px] font-semibold text-[#222] mb-1">{{ item.name }}</p>
              <div class="flex items-center gap-1.5">
                <span class="text-[14px] font-bold text-[#FF7B22]">월 {{ item.premium }}</span>
                <span class="text-[12px] text-[#B0B0B0]">{{ item.period }}</span>
              </div>
            </CardSection>
          </router-link>
        </div>
        <button class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/coverage-analysis')">
          전체 보장 분석 보기
        </button>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()

interface BadgeInfo {
  label: string
  variant: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default'
}

interface InsuranceItem {
  id: number
  company: string
  name: string
  premium: string
  period: string
  badge: BadgeInfo | null
}

const insuranceList: InsuranceItem[] = [
  { id: 1, company: '삼성화재', name: '건강보험', premium: '85,000원', period: '종신', badge: { label: '알릴의무 7일', variant: 'warning' } },
  { id: 2, company: '한화생명', name: '종신보험', premium: '120,000원', period: '2045.03 만기', badge: null },
  { id: 3, company: '현대해상', name: '운전자보험', premium: '45,000원', period: '2030.06 만기', badge: null },
  { id: 4, company: 'DB손해보험', name: '암보험', premium: '65,000원', period: '종신', badge: { label: '보장충분', variant: 'success' } },
  { id: 5, company: '메리츠화재', name: '실손보험', premium: '70,000원', period: '갱신형', badge: { label: '갱신예정', variant: 'primary' } },
]
</script>
