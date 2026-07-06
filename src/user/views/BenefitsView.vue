<template>
  <div class="min-h-screen bg-[#F6F6F8] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-[#F6F6F8]">
      <!-- 헤더 -->
      <header class="bg-white px-5 pt-4 pb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <img src="/icons/LogoIcon.svg" alt="ON:CARE" class="w-8 h-8" />
          <span class="text-[20px] font-bold"><span class="text-[#EE7623]">ON:</span><span class="text-[#1c1c1c]">CARE</span></span>
        </div>
      </header>

      <main class="px-4 pt-4 pb-28 overflow-y-auto" style="height: calc(100dvh - 52px - 68px);">

        <!-- 히어로 배너 -->
        <div class="relative rounded-[20px] overflow-hidden bg-gradient-to-br from-[#FFF3ED] to-[#FFECD9] p-5 pb-4 mb-4">
          <p class="text-[13px] text-[#EE7623] font-medium">놓치고 있는 보험금</p>
          <h2 class="text-[22px] font-extrabold text-[#222] mt-1 leading-tight">보험금 청구,<br/>간편하게 바로</h2>
          <p class="text-[13px] text-[#888] mt-2">서류 없이 3분만에 실손보험 청구</p>
          <button
            class="mt-4 px-5 py-2.5 bg-[#FF7B22] text-white text-[14px] font-semibold rounded-full"
            @click="$router.push('/claim-request')"
          >
            바로 청구하기
          </button>
          <!-- 일러스트 -->
          <div class="absolute right-3 bottom-2 w-[100px] h-[100px] opacity-80 pointer-events-none">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <rect x="20" y="10" width="60" height="80" rx="8" fill="white" stroke="#E8E8E8" stroke-width="1.5"/>
              <rect x="30" y="24" width="40" height="4" rx="2" fill="#FFD4B8"/>
              <rect x="30" y="34" width="32" height="4" rx="2" fill="#FFD4B8"/>
              <rect x="30" y="44" width="36" height="4" rx="2" fill="#FFD4B8"/>
              <circle cx="50" cy="66" r="10" fill="#FFF3ED" stroke="#FF7B22" stroke-width="2"/>
              <path d="M46 66L49 69L55 63" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="70" y="50" width="32" height="42" rx="6" fill="#FF7B22" opacity="0.15"/>
              <rect x="76" y="56" width="20" height="3" rx="1.5" fill="#FF7B22" opacity="0.4"/>
              <rect x="76" y="63" width="14" height="3" rx="1.5" fill="#FF7B22" opacity="0.4"/>
              <circle cx="86" cy="78" r="6" fill="#FF7B22" opacity="0.25"/>
              <path d="M83 78L85 80L89 76" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round" opacity="0.6"/>
            </svg>
          </div>
        </div>

        <!-- 메인 서비스 카드 목록 -->
        <div class="space-y-3 mb-4">
          <!-- 카드 1: 협약 병원 예약 -->
          <button
            class="w-full bg-white rounded-[16px] p-5 flex items-center gap-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
            @click="$router.push('/hospitals')"
          >
            <div class="w-[52px] h-[52px] rounded-[14px] bg-[#E8F5E9] flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
                <path d="M5 21V5C5 3.9 5.9 3 7 3H17C18.1 3 19 3.9 19 5V21" stroke="#4CAF50" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7V13M9 10H15" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[16px] font-bold text-[#222]">협약 병원 예약</p>
              <p class="text-[13px] text-[#999] mt-0.5">내 손안의 실시간 예약 서비스</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0">
              <path d="M9 18L15 12L9 6" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- 카드 2: 건강검진 예약 -->
          <button
            class="w-full bg-white rounded-[16px] p-5 flex items-center gap-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
            @click="$router.push('/health-centers')"
          >
            <div class="w-[52px] h-[52px] rounded-[14px] bg-[#E3F2FD] flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="3" stroke="#2196F3" stroke-width="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="#2196F3" stroke-width="2" stroke-linecap="round"/>
                <path d="M12 14V18M10 16H14" stroke="#2196F3" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[16px] font-bold text-[#222]">건강검진 예약</p>
              <p class="text-[13px] text-[#999] mt-0.5">검진센터 예약하기</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0">
              <path d="M9 18L15 12L9 6" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>

          <!-- 카드 3: 청구 이력 조회 -->
          <button
            class="w-full bg-white rounded-[16px] p-5 flex items-center gap-4 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform text-left"
            @click="$router.push('/my-reservations')"
          >
            <div class="w-[52px] h-[52px] rounded-[14px] bg-[#FFF3E0] flex items-center justify-center shrink-0">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="3" width="16" height="18" rx="3" stroke="#FF9800" stroke-width="2"/>
                <path d="M9 8H15M9 12H15M9 16H12" stroke="#FF9800" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-[16px] font-bold text-[#222]">내 예약 · 청구 조회</p>
              <p class="text-[13px] text-[#999] mt-0.5">예약현황 및 청구내역 확인</p>
            </div>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0">
              <path d="M9 18L15 12L9 6" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>

        <!-- 2컬럼 그리드 -->
        <div class="grid grid-cols-2 gap-3 mb-4">
          <button
            class="bg-white rounded-[16px] p-5 flex flex-col items-center gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
            @click="$router.push('/claim-request')"
          >
            <div class="w-[48px] h-[48px] rounded-full bg-[#FFF0E5] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="2" width="14" height="20" rx="3" stroke="#FF7B22" stroke-width="2"/>
                <path d="M9 7H15M9 11H15M9 15H12" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="text-center">
              <p class="text-[14px] font-bold text-[#222]">보험금 청구</p>
              <p class="text-[11px] text-[#999] mt-0.5">간편 실손청구</p>
            </div>
          </button>

          <button
            class="bg-white rounded-[16px] p-5 flex flex-col items-center gap-3 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
            @click="$router.push('/')"
          >
            <div class="w-[48px] h-[48px] rounded-full bg-[#EDE7F6] flex items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="4" stroke="#7C4DFF" stroke-width="2"/>
                <path d="M6 21V19C6 16.79 7.79 15 10 15H14C16.21 15 18 16.79 18 19V21" stroke="#7C4DFF" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="text-center">
              <p class="text-[14px] font-bold text-[#222]">전문가 상담</p>
              <p class="text-[11px] text-[#999] mt-0.5">담당 설계사 연결</p>
            </div>
          </button>
        </div>

        <!-- 오늘의 보험 정보 -->
        <div class="bg-white rounded-[16px] p-5 shadow-[0_1px_6px_rgba(0,0,0,0.04)] mb-4">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-[16px] font-bold text-[#222]">오늘의 보험 정보</h3>
          </div>
          <div class="space-y-3">
            <div
              v-for="(tip, idx) in tips"
              :key="idx"
              class="flex items-start gap-3 p-3 bg-[#FAFAFA] rounded-[12px]"
            >
              <div class="w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[16px]" :class="tip.bgClass">
                {{ tip.emoji }}
              </div>
              <div>
                <p class="text-[14px] font-semibold text-[#333] leading-snug">{{ tip.title }}</p>
                <p class="text-[12px] text-[#999] mt-0.5">{{ tip.desc }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 3컬럼 바로가기 -->
        <div class="grid grid-cols-3 gap-2.5 mb-4">
          <button
            v-for="shortcut in shortcuts"
            :key="shortcut.label"
            class="bg-white rounded-[14px] py-4 px-2 flex flex-col items-center gap-2 shadow-[0_1px_6px_rgba(0,0,0,0.04)] active:scale-[0.98] transition-transform"
            @click="$router.push(shortcut.path)"
          >
            <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="shortcut.bgClass">
              <span class="text-[20px]">{{ shortcut.emoji }}</span>
            </div>
            <p class="text-[12px] font-semibold text-[#444] text-center leading-tight">{{ shortcut.label }}</p>
          </button>
        </div>

        <!-- 하단 안내 배너 -->
        <div class="bg-gradient-to-r from-[#F0F4FF] to-[#E8F0FE] rounded-[16px] p-5 flex items-center gap-4">
          <div class="flex-1">
            <p class="text-[13px] text-[#5B7FFF] font-medium">ON:CARE와 함께</p>
            <p class="text-[15px] font-bold text-[#333] mt-0.5">보험을 점검해 보세요</p>
          </div>
          <div class="w-12 h-12 rounded-full bg-white/60 flex items-center justify-center shrink-0">
            <img src="/icons/LogoIcon.svg" alt="" class="w-7 h-7" />
          </div>
        </div>

      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'

const tips = [
  { emoji: '💡', title: '실손보험, 5천원도 청구 가능해요', desc: '소액도 꼭 챙기세요', bgClass: 'bg-[#FFF8E1]' },
  { emoji: '🏥', title: '건강검진 무료 대상자 확인하세요', desc: '국가 건강검진 안내', bgClass: 'bg-[#E8F5E9]' },
  { emoji: '📋', title: '보험 서류, 이제 앱에서 바로 발급', desc: '병원 방문 없이 간편하게', bgClass: 'bg-[#E3F2FD]' },
]

const shortcuts = [
  { emoji: '❤️', label: '건강검진\n결과 확인', path: '/health-centers', bgClass: 'bg-[#FFEBEE]' },
  { emoji: '🚗', label: '내 보험\n한눈에', path: '/', bgClass: 'bg-[#E3F2FD]' },
  { emoji: '📅', label: '예약 현황\n확인', path: '/my-reservations', bgClass: 'bg-[#FFF3E0]' },
]
</script>
