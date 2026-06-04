<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <BackHeader title="예약" />

      <main class="px-5 pt-6 pb-28 space-y-4">
        <!-- 병원 예약 카드 -->
        <button
          class="w-full bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-left active:scale-[0.98] transition-transform"
          @click="$router.push('/hospitals')"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7V13" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 10H15" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-[18px] font-bold text-[#222]">병원 예약</h2>
              <p class="text-[14px] text-[#888] mt-1">협약 병원을 찾고 예약하세요</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
              <path d="M9 5L16 12L9 19" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>

        <!-- 건강검진 예약 카드 -->
        <button
          class="w-full bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-left active:scale-[0.98] transition-transform"
          @click="$router.push('/health-centers')"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-full bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-[18px] font-bold text-[#222]">건강검진 예약</h2>
              <p class="text-[14px] text-[#888] mt-1">가까운 검진 센터를 예약하세요</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
              <path d="M9 5L16 12L9 19" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>
      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import BackHeader from '@user/components/layout/BackHeader.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
</script>
