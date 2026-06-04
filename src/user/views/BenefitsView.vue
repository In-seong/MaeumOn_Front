<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <BackHeader title="혜택" />

      <main class="px-5 pt-6 pb-28 space-y-4">
        <div
          v-for="banner in banners"
          :key="banner.id"
          class="rounded-[16px] p-6 shadow-[0_2px_12px_rgba(0,0,0,0.06)]"
          :class="banner.bgClass"
        >
          <span class="text-[12px] font-medium px-2 py-0.5 rounded-full bg-white/20 text-white">{{ banner.tag }}</span>
          <h3 class="text-[18px] font-bold text-white mt-3 leading-snug">{{ banner.title }}</h3>
          <p class="text-[14px] text-white/80 mt-2">{{ banner.description }}</p>
        </div>
      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackHeader from '@user/components/layout/BackHeader.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'

interface Banner {
  id: number
  tag: string
  title: string
  description: string
  bgClass: string
}

const banners: Banner[] = [
  {
    id: 1,
    tag: '보험 혜택',
    title: '놓치고 있는 보험금\n지금 확인해보세요',
    description: '간편하게 보험금을 청구하고 돌려받으세요.',
    bgClass: 'bg-gradient-to-r from-[#03C75A] to-[#05D662]',
  },
  {
    id: 2,
    tag: '건강 관리',
    title: '무료 건강검진\n대상자 확인',
    description: '국가 건강검진 대상 여부를 확인하세요.',
    bgClass: 'bg-gradient-to-r from-[#2196F3] to-[#42A5F5]',
  },
  {
    id: 3,
    tag: '제휴 혜택',
    title: '협약 병원\n진료비 할인',
    description: '마음ON 협약 병원에서 할인 혜택을 받으세요.',
    bgClass: 'bg-gradient-to-r from-[#FF9800] to-[#FFB74D]',
  },
  {
    id: 4,
    tag: '상담 서비스',
    title: '전문 설계사\n무료 상담',
    description: '보험 관련 궁금한 점을 전문가에게 물어보세요.',
    bgClass: 'bg-gradient-to-r from-[#9C27B0] to-[#BA68C8]',
  },
]
</script>
