<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="병원 찾기" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Location Bar -->
        <div class="flex items-center gap-2 mb-4">
          <div class="flex-1 flex items-center gap-2 bg-white rounded-[12px] border border-[#E8E8E8] px-4 py-3">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="8" stroke="#999" stroke-width="2"/>
              <path d="M21 21l-4.35-4.35" stroke="#999" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <input type="text" placeholder="병원명, 진료과목 검색" class="flex-1 text-[14px] text-[#333] outline-none bg-transparent placeholder-[#B0B0B0]" />
          </div>
          <button class="w-[44px] h-[44px] bg-white rounded-[12px] border border-[#E8E8E8] flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF7B22" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="#FF7B22" stroke-width="2"/>
            </svg>
          </button>
        </div>

        <!-- Location Info -->
        <div class="flex items-center gap-1.5 mb-4">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#FF7B22" stroke-width="2"/>
            <circle cx="12" cy="10" r="3" stroke="#FF7B22" stroke-width="2"/>
          </svg>
          <span class="text-[12px] text-[#888]">서울특별시 강남구 역삼동 기준</span>
          <StatusBadge label="현재위치" variant="primary" />
        </div>

        <!-- Map Placeholder -->
        <div class="w-full h-[180px] bg-[#E8E8E8] rounded-[16px] mb-4 flex items-center justify-center">
          <div class="text-center">
            <svg class="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#B0B0B0" stroke-width="2"/>
              <circle cx="12" cy="10" r="3" stroke="#B0B0B0" stroke-width="2"/>
            </svg>
            <p class="text-[12px] text-[#B0B0B0]">지도 영역</p>
          </div>
        </div>

        <!-- Hospital Cards -->
        <div class="flex flex-col gap-3 mb-6">
          <router-link v-for="hospital in hospitalList" :key="hospital.id" :to="'/hospital/' + hospital.id" class="block">
            <CardSection>
              <div class="flex items-start justify-between mb-2">
                <div>
                  <p class="text-[15px] font-semibold text-[#222]">{{ hospital.name }}</p>
                  <p class="text-[12px] text-[#999] mt-0.5">{{ hospital.department }}</p>
                </div>
                <StatusBadge :label="hospital.badge.label" :variant="hospital.badge.variant" />
              </div>
              <div class="flex items-center gap-3 text-[12px] text-[#888]">
                <span class="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#B0B0B0" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#B0B0B0" stroke-width="2"/></svg>
                  {{ hospital.distance }}
                </span>
                <span>{{ hospital.address }}</span>
              </div>
              <div class="flex items-center gap-1.5 mt-2">
                <span class="text-[12px] font-medium text-[#FF7B22]">{{ hospital.rating }}</span>
                <div class="flex">
                  <svg v-for="s in 5" :key="s" width="12" height="12" viewBox="0 0 24 24" :fill="s <= Math.round(hospital.ratingNum) ? '#FF7B22' : '#E0E0E0'">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
                <span class="text-[11px] text-[#B0B0B0]">리뷰 {{ hospital.reviewCount }}개</span>
              </div>
            </CardSection>
          </router-link>
        </div>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'

interface Hospital {
  id: number
  name: string
  department: string
  distance: string
  address: string
  rating: string
  ratingNum: number
  reviewCount: number
  badge: { label: string; variant: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' }
}

const hospitalList: Hospital[] = [
  {
    id: 1,
    name: '강남세브란스병원',
    department: '내과 / 외과 / 정형외과',
    distance: '350m',
    address: '서울 강남구 언주로 211',
    rating: '4.8',
    ratingNum: 4.8,
    reviewCount: 2847,
    badge: { label: '협약병원', variant: 'primary' },
  },
  {
    id: 2,
    name: '역삼성모내과',
    department: '내과 / 건강검진',
    distance: '500m',
    address: '서울 강남구 역삼로 180',
    rating: '4.5',
    ratingNum: 4.5,
    reviewCount: 1203,
    badge: { label: '영업중', variant: 'success' },
  },
  {
    id: 3,
    name: '강남정형외과',
    department: '정형외과 / 재활의학과',
    distance: '800m',
    address: '서울 강남구 테헤란로 152',
    rating: '4.3',
    ratingNum: 4.3,
    reviewCount: 876,
    badge: { label: '예약가능', variant: 'info' },
  },
]
</script>
