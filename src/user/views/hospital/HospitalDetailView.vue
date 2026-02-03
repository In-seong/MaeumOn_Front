<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="병원 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- Hospital Info -->
        <CardSection class="mb-4">
          <div class="flex items-start justify-between mb-2">
            <div>
              <p class="text-[18px] font-bold text-[#222]">강남세브란스병원</p>
              <p class="text-[13px] text-[#888] mt-0.5">종합병원</p>
            </div>
            <StatusBadge label="협약병원" variant="primary" />
          </div>
          <div class="flex items-center gap-1.5 mt-2">
            <span class="text-[14px] font-medium text-[#FF7B22]">4.8</span>
            <div class="flex">
              <svg v-for="s in 5" :key="s" width="14" height="14" viewBox="0 0 24 24" :fill="s <= 5 ? '#FF7B22' : '#E0E0E0'">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </div>
            <span class="text-[12px] text-[#B0B0B0]">리뷰 2,847개</span>
          </div>
        </CardSection>

        <!-- Benefits -->
        <CardSection class="mb-4 !bg-[#FFF9F0]">
          <div class="flex items-start gap-2">
            <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <div>
              <p class="text-[13px] font-semibold text-[#FF7B22] mb-0.5">보험 혜택 안내</p>
              <p class="text-[12px] text-[#888] leading-relaxed">협약병원으로 보험금 직접 청구 및 진료비 할인 혜택이 제공됩니다.</p>
            </div>
          </div>
        </CardSection>

        <!-- Hospital Details -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">병원 정보</p>
          <CardSection>
            <div class="flex items-start gap-2 py-2.5 border-b border-[#F5F5F5]">
              <svg class="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#999" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#999" stroke-width="2"/>
              </svg>
              <div>
                <p class="text-[13px] text-[#333]">서울 강남구 언주로 211</p>
                <p class="text-[11px] text-[#999]">역삼역 3번 출구 도보 5분</p>
              </div>
            </div>
            <div class="flex items-center gap-2 py-2.5 border-b border-[#F5F5F5]">
              <svg class="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#999" stroke-width="2"/>
              </svg>
              <p class="text-[13px] text-[#333]">02-2019-3114</p>
            </div>
            <div class="flex items-start gap-2 py-2.5">
              <svg class="flex-shrink-0 mt-0.5" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="12" r="10" stroke="#999" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#999" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <div>
                <p class="text-[13px] text-[#333]">평일 08:30 - 17:30</p>
                <p class="text-[11px] text-[#999]">토요일 08:30 - 12:30 | 일요일/공휴일 휴진</p>
              </div>
            </div>
          </CardSection>
        </div>

        <!-- Departments -->
        <div class="mb-4">
          <p class="text-[15px] font-semibold text-[#222] mb-2">진료과목</p>
          <div class="flex flex-wrap gap-2">
            <span v-for="dept in departments" :key="dept" class="px-3 py-1.5 bg-white border border-[#E8E8E8] rounded-full text-[12px] text-[#555]">
              {{ dept }}
            </span>
          </div>
        </div>

        <!-- Map Placeholder -->
        <div class="w-full h-[160px] bg-[#E8E8E8] rounded-[16px] mb-5 flex items-center justify-center">
          <div class="text-center">
            <svg class="mx-auto mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#B0B0B0" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#B0B0B0" stroke-width="2"/>
            </svg>
            <p class="text-[12px] text-[#B0B0B0]">지도 영역</p>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex gap-3 mb-6">
          <a href="tel:02-2019-3114" class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[15px] font-semibold text-center active:scale-[0.98] transition-transform">
            전화하기
          </a>
          <button class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform" @click="router.push('/reservation')">
            예약하기
          </button>
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

const departments: string[] = [
  '내과', '외과', '정형외과', '신경외과', '산부인과',
  '소아청소년과', '피부과', '이비인후과', '안과', '비뇨기과',
]
</script>
