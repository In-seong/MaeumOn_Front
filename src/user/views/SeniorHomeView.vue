<template>
  <div class="min-h-screen bg-gradient-to-b from-[#E8F7EE] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#E8F7EE] to-[#FFFFFF]">
      <!-- 헤더 -->
      <header class="pt-12 pb-6 px-6 text-center">
        <div class="w-16 h-16 mx-auto rounded-full bg-[#03C75A] flex items-center justify-center mb-4">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
            <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" stroke="white" stroke-width="2" fill="white"/>
          </svg>
        </div>
        <h1 class="text-[24px] font-bold text-[#222]">마음ON</h1>
        <p class="text-[15px] text-[#888] mt-1">필요한 서비스를 선택하세요</p>
      </header>

      <!-- 메인 카드 버튼들 -->
      <main class="px-5 pb-28 space-y-4">
        <!-- 보험금 청구 신청 -->
        <button
          class="w-full bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-6 text-left transition-all active:scale-[0.97] hover:shadow-[0_4px_20px_rgba(255,123,34,0.15)]"
          @click="$router.push('/claim-request')"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-[16px] bg-[#E5F6EB] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" stroke="#03C75A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" stroke="#03C75A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V12" stroke="#03C75A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15H15" stroke="#03C75A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-[18px] font-bold text-[#222]">보험금 청구 신청</h2>
              <p class="text-[14px] text-[#888] mt-1">간편하게 보험금을 청구하세요</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
              <path d="M9 5L16 12L9 19" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </button>

        <!-- 병원 예약 -->
        <button
          class="w-full bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-6 text-left transition-all active:scale-[0.97] hover:shadow-[0_4px_20px_rgba(255,123,34,0.15)]"
          @click="$router.push('/hospitals')"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-[16px] bg-[#E8F5E9] flex items-center justify-center flex-shrink-0">
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

        <!-- 건강검진 센터 예약 -->
        <button
          class="w-full bg-white rounded-[20px] shadow-[0_2px_16px_rgba(0,0,0,0.08)] p-6 text-left transition-all active:scale-[0.97] hover:shadow-[0_4px_20px_rgba(255,123,34,0.15)]"
          @click="$router.push('/health-centers')"
        >
          <div class="flex items-center gap-4">
            <div class="w-14 h-14 rounded-[16px] bg-[#E3F2FD] flex items-center justify-center flex-shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M22 12H18L15 21L9 3L6 12H2" stroke="#2196F3" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <div class="flex-1">
              <h2 class="text-[18px] font-bold text-[#222]">건강검진 센터 예약</h2>
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
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
</script>
