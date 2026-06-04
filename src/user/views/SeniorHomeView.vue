<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <!-- 상단 바 -->
      <header class="bg-white px-5 pt-4 pb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#03C75A] flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78L12 21.23l8.84-8.84a5.5 5.5 0 000-7.78z" fill="white"/>
            </svg>
          </div>
          <span class="text-[#222] text-[20px] font-bold">ON 케어</span>
        </div>
      </header>

      <!-- 인사말 섹션 -->
      <div class="bg-white px-5 pb-3">
        <p class="text-[#222] text-[20px] font-bold">안녕하세요 :)</p>
        <p class="text-[#888] text-[14px] mt-1">오늘도 건강하고 행복한 하루 되세요!</p>
      </div>

      <!-- 프로모션 배너 카드 -->
      <div class="mx-5 mt-2">
        <div class="bg-gradient-to-r from-[#E8F7EE] to-[#F0FBF4] rounded-[16px] p-5 relative overflow-hidden">
          <div class="flex items-center">
            <!-- 텍스트 영역 -->
            <div class="flex-1 min-w-0">
              <p class="text-[13px] text-[#666]">놓치고 있는</p>
              <p class="text-[18px] font-bold text-[#222] mt-0.5">보험금이 있을 수 있어요</p>
              <p class="text-[13px] text-[#888] mt-1">지금 확인하고 간편하게 청구하세요!</p>
              <button
                class="mt-4 bg-[#03C75A] text-white text-[13px] font-bold px-4 py-2.5 rounded-full"
                @click="$router.push('/claim-request')"
              >
                내 보험 조회하기 &gt;
              </button>
            </div>
            <!-- 일러스트 -->
            <div class="flex-shrink-0 w-[110px] h-[110px] ml-2">
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
                <!-- 서류 (뒤) -->
                <rect x="30" y="8" width="52" height="68" rx="6" fill="white" stroke="#E0E0E0" stroke-width="1.5"/>
                <text x="44" y="24" font-size="8" font-weight="bold" fill="#333">보험금</text>
                <rect x="40" y="30" width="8" height="8" rx="2" fill="#03C75A"/>
                <path d="M42 34.5L44 36.5L48 32.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="52" y="32" width="22" height="3" rx="1.5" fill="#E0E0E0"/>
                <rect x="40" y="42" width="8" height="8" rx="2" fill="#03C75A"/>
                <path d="M42 46.5L44 48.5L48 44.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="52" y="44" width="18" height="3" rx="1.5" fill="#E0E0E0"/>
                <rect x="40" y="54" width="8" height="8" rx="2" fill="#03C75A"/>
                <path d="M42 58.5L44 60.5L48 56.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <rect x="52" y="56" width="20" height="3" rx="1.5" fill="#E0E0E0"/>
                <!-- 지갑 (ON) -->
                <rect x="10" y="62" width="50" height="36" rx="8" fill="#2D8B4E"/>
                <rect x="10" y="62" width="50" height="14" rx="6" fill="#03C75A"/>
                <text x="24" y="90" font-size="16" font-weight="900" fill="white" letter-spacing="1">ON</text>
                <!-- 돋보기 -->
                <circle cx="88" cy="42" r="14" fill="white" stroke="#03C75A" stroke-width="3"/>
                <circle cx="88" cy="42" r="8" fill="#E8F7EE"/>
                <line x1="98" y1="52" x2="108" y2="62" stroke="#03C75A" stroke-width="4" stroke-linecap="round"/>
                <!-- 동전들 -->
                <ellipse cx="72" cy="100" rx="12" ry="5" fill="#F5C842"/>
                <ellipse cx="72" cy="97" rx="12" ry="5" fill="#FFD74B"/>
                <ellipse cx="58" cy="104" rx="9" ry="4" fill="#F5C842"/>
                <ellipse cx="58" cy="101" rx="9" ry="4" fill="#FFD74B"/>
                <ellipse cx="84" cy="106" rx="8" ry="3.5" fill="#F5C842"/>
                <ellipse cx="84" cy="103.5" rx="8" ry="3.5" fill="#FFD74B"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <!-- 6개 아이콘 그리드 -->
      <div class="mx-5 mt-6 bg-white rounded-[16px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="flex flex-col items-center gap-2 py-2 active:scale-95 transition-transform"
            @click="handleMenuClick(item)"
          >
            <div class="w-12 h-12 rounded-full flex items-center justify-center" :class="item.bgClass">
              <!-- 보험금 청구 -->
              <svg v-if="item.icon === 'claim'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M14 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V8L14 2Z" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M14 2V8H20" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 18V12" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 15H15" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 병원 예약 -->
              <svg v-else-if="item.icon === 'hospital'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M3 21H21" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M5 21V5C5 4.46957 5.21071 3.96086 5.58579 3.58579C5.96086 3.21071 6.46957 3 7 3H17C17.5304 3 18.0391 3.21071 18.4142 3.58579C18.7893 3.96086 19 4.46957 19 5V21" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M12 7V13" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M9 10H15" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 건강검진 -->
              <svg v-else-if="item.icon === 'health'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M22 12H18L15 21L9 3L6 12H2" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 내 예약 조회 -->
              <svg v-else-if="item.icon === 'calendar'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" :stroke="item.iconColor" stroke-width="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round"/>
                <path d="M8 14H10M14 14H16M8 18H10" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
              <!-- 내 보험 조회 -->
              <svg v-else-if="item.icon === 'shield'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 전문가 상담 -->
              <svg v-else-if="item.icon === 'chat'" width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M21 15C21 15.5304 20.7893 16.0391 20.4142 16.4142C20.0391 16.7893 19.5304 17 19 17H7L3 21V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V15Z" :stroke="item.iconColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[13px] font-medium text-[#333]">{{ item.label }}</span>
          </button>
        </div>
      </div>

      <!-- 하단 프로모션 배너 -->
      <div class="mx-5 mt-5 mb-28 bg-[#E8F7EE] rounded-[16px] p-6">
        <p class="text-[15px] font-semibold text-[#222] leading-relaxed">
          보험 청구부터 건강 관리까지<br />마음ON이 함께합니다
        </p>
        <p class="text-[13px] text-[#888] mt-2">언제든 편하게 이용하세요</p>
      </div>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'

const router = useRouter()

interface MenuItem {
  icon: string
  label: string
  path?: string
  bgClass: string
  iconColor: string
  comingSoon?: boolean
}

const menuItems: MenuItem[] = [
  { icon: 'claim', label: '보험금 청구', path: '/claim-request', bgClass: 'bg-[#E5F6EB]', iconColor: '#03C75A' },
  { icon: 'hospital', label: '병원 예약', path: '/hospitals', bgClass: 'bg-[#E8F5E9]', iconColor: '#4CAF50' },
  { icon: 'health', label: '건강검진 예약', path: '/health-centers', bgClass: 'bg-[#E3F2FD]', iconColor: '#2196F3' },
  { icon: 'calendar', label: '내 예약 조회', path: '/my-reservations', bgClass: 'bg-[#FFF3E0]', iconColor: '#FF9800' },
  { icon: 'shield', label: '내 보험 조회', bgClass: 'bg-[#F3E5F5]', iconColor: '#9C27B0', comingSoon: true },
  { icon: 'chat', label: '전문가 상담', bgClass: 'bg-[#FBE9E7]', iconColor: '#FF5722', comingSoon: true },
]

function handleMenuClick(item: MenuItem): void {
  if (item.comingSoon) {
    alert('준비 중입니다. 빠른 시일 내에 제공해드리겠습니다.')
    return
  }
  if (item.path) {
    router.push(item.path)
  }
}
</script>
