<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="미청구 보험금" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Summary -->
        <CardSection class="mb-4 !bg-[#FF7B22]">
          <div class="text-center">
            <p class="text-[13px] text-white/80 mb-1">받을 수 있는 미청구 보험금</p>
            <p class="text-[28px] font-bold text-white">2,150,000원</p>
            <p class="text-[12px] text-white/60 mt-1">2건의 미청구 내역이 있습니다</p>
          </div>
        </CardSection>

        <!-- Unclaimed Items -->
        <div class="mb-5">
          <p class="text-[15px] font-semibold text-[#222] mb-2">미청구 내역</p>
          <div class="flex flex-col gap-3">
            <CardSection v-for="item in unclaimedItems" :key="item.id">
              <div class="flex items-start justify-between mb-2">
                <div>
                  <span class="text-[12px] text-[#999]">{{ item.company }}</span>
                  <p class="text-[15px] font-semibold text-[#222] mt-0.5">{{ item.name }}</p>
                </div>
                <StatusBadge :label="item.badge.label" :variant="item.badge.variant" />
              </div>
              <div class="bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 mb-3">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[12px] text-[#888]">예상 수령액</span>
                  <span class="text-[15px] font-bold text-[#FF7B22]">{{ item.amount }}</span>
                </div>
                <p class="text-[11px] text-[#999]">{{ item.reason }}</p>
              </div>
              <div class="flex gap-2">
                <button class="flex-1 bg-[#FF7B22] text-white rounded-[10px] py-2.5 text-[13px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/claims/new')">
                  직접 청구
                </button>
                <button class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[10px] py-2.5 text-[13px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/consultation')">
                  대리 청구 요청
                </button>
              </div>
            </CardSection>
          </div>
        </div>

        <!-- Completed Section -->
        <div class="mb-6">
          <p class="text-[15px] font-semibold text-[#222] mb-2">청구 완료</p>
          <div class="flex flex-col gap-3">
            <CardSection v-for="item in completedItems" :key="item.id">
              <div class="flex items-start justify-between mb-1">
                <div>
                  <span class="text-[12px] text-[#999]">{{ item.company }}</span>
                  <p class="text-[14px] font-medium text-[#222] mt-0.5">{{ item.name }}</p>
                </div>
                <StatusBadge label="청구완료" variant="success" />
              </div>
              <div class="flex items-center justify-between">
                <span class="text-[12px] text-[#999]">{{ item.date }}</span>
                <span class="text-[14px] font-bold text-[#333]">{{ item.amount }}</span>
              </div>
            </CardSection>
          </div>
        </div>
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
import BottomNav from '@user/components/layout/BottomNav.vue'

const router = useRouter()

interface UnclaimedItem {
  id: number
  company: string
  name: string
  amount: string
  reason: string
  badge: { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' }
}

const unclaimedItems: UnclaimedItem[] = [
  {
    id: 1,
    company: '삼성화재 건강보험',
    name: '입원일당 미청구',
    amount: '1,500,000원',
    reason: '2024년 11월 입원(15일) 건에 대한 입원일당 미청구',
    badge: { label: '청구가능', variant: 'primary' },
  },
  {
    id: 2,
    company: 'DB손해보험 암보험',
    name: '진단비 미청구',
    amount: '650,000원',
    reason: '2024년 12월 건강검진 결과 추가 진단비 청구 가능',
    badge: { label: '확인필요', variant: 'warning' },
  },
]

interface CompletedItem {
  id: number
  company: string
  name: string
  amount: string
  date: string
}

const completedItems: CompletedItem[] = [
  { id: 3, company: '현대해상', name: '통원치료비', amount: '320,000원', date: '2024.10.15 청구' },
  { id: 4, company: '삼성화재', name: '수술비', amount: '2,000,000원', date: '2024.08.22 청구' },
]
</script>
