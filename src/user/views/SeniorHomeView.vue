<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <!-- 상단 바 -->
      <header class="bg-white px-5 pt-4 pb-3 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <div class="w-8 h-8 rounded-full bg-[#FF7B22] flex items-center justify-center">
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
        <div class="bg-gradient-to-r from-[#FFF3ED] to-[#F0FBF4] rounded-[16px] p-5 relative overflow-hidden">
          <!-- 일러스트 (오른쪽 배경 장식) -->
          <div class="absolute right-3 top-1/2 -translate-y-1/2 w-[100px] h-[100px] opacity-70 pointer-events-none">
            <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" class="w-full h-full">
              <rect x="30" y="8" width="52" height="68" rx="6" fill="white" stroke="#E0E0E0" stroke-width="1.5"/>
              <text x="44" y="24" font-size="8" font-weight="bold" fill="#333">보험금</text>
              <rect x="40" y="30" width="8" height="8" rx="2" fill="#FF7B22"/>
              <path d="M42 34.5L44 36.5L48 32.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="52" y="32" width="22" height="3" rx="1.5" fill="#E0E0E0"/>
              <rect x="40" y="42" width="8" height="8" rx="2" fill="#FF7B22"/>
              <path d="M42 46.5L44 48.5L48 44.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="52" y="44" width="18" height="3" rx="1.5" fill="#E0E0E0"/>
              <rect x="40" y="54" width="8" height="8" rx="2" fill="#FF7B22"/>
              <path d="M42 58.5L44 60.5L48 56.5" stroke="white" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="52" y="56" width="20" height="3" rx="1.5" fill="#E0E0E0"/>
              <rect x="10" y="62" width="50" height="36" rx="8" fill="#2D8B4E"/>
              <rect x="10" y="62" width="50" height="14" rx="6" fill="#FF7B22"/>
              <text x="24" y="90" font-size="16" font-weight="900" fill="white" letter-spacing="1">ON</text>
              <circle cx="88" cy="42" r="14" fill="white" stroke="#FF7B22" stroke-width="3"/>
              <circle cx="88" cy="42" r="8" fill="#FFF3ED"/>
              <line x1="98" y1="52" x2="108" y2="62" stroke="#FF7B22" stroke-width="4" stroke-linecap="round"/>
              <ellipse cx="72" cy="100" rx="12" ry="5" fill="#F5C842"/>
              <ellipse cx="72" cy="97" rx="12" ry="5" fill="#FFD74B"/>
              <ellipse cx="58" cy="104" rx="9" ry="4" fill="#F5C842"/>
              <ellipse cx="58" cy="101" rx="9" ry="4" fill="#FFD74B"/>
              <ellipse cx="84" cy="106" rx="8" ry="3.5" fill="#F5C842"/>
              <ellipse cx="84" cy="103.5" rx="8" ry="3.5" fill="#FFD74B"/>
            </svg>
          </div>
          <!-- 텍스트 영역 -->
          <div class="relative z-10 pr-[100px]">
            <p class="text-[#666]" style="font-size: clamp(11px, 3.2vw, 13px);">놓치고 있는</p>
            <p class="font-bold text-[#222] mt-0.5" style="font-size: clamp(15px, 4.5vw, 18px);">보험금이 있을 수 있어요</p>
            <p class="text-[#888] mt-1" style="font-size: clamp(11px, 3.2vw, 13px);">지금 확인하고 간편하게 청구하세요!</p>
            <button
              class="mt-4 bg-[#FF7B22] text-white font-bold px-4 py-2.5 rounded-full"
              style="font-size: clamp(11px, 3.2vw, 13px);"
              @click="$router.push('/claim-request')"
            >
              내 보험 조회하기 &gt;
            </button>
          </div>
        </div>
      </div>

      <!-- 6개 아이콘 그리드 -->
      <div class="mx-5 mt-6 bg-white rounded-[16px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
        <div class="grid grid-cols-3 gap-4">
          <button
            v-for="item in menuItems"
            :key="item.label"
            class="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform"
            @click="handleMenuClick(item)"
          >
            <div class="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center" :class="item.bgClass">
              <!-- 보험금 청구: 서류 + 원화 마크 -->
              <svg v-if="item.icon === 'claim'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <rect x="8" y="4" width="20" height="28" rx="3" fill="#FF7B22" opacity="0.15"/>
                <rect x="10" y="6" width="20" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
                <rect x="14" y="12" width="12" height="1.5" rx="0.75" fill="#A5D6A7"/>
                <rect x="14" y="16" width="9" height="1.5" rx="0.75" fill="#A5D6A7"/>
                <rect x="14" y="20" width="11" height="1.5" rx="0.75" fill="#A5D6A7"/>
                <circle cx="27" cy="28" r="8" fill="#FF7B22"/>
                <text x="27" y="32" text-anchor="middle" font-size="11" font-weight="bold" fill="white">&#8361;</text>
              </svg>
              <!-- 병원 예약: 건물 + 십자가 -->
              <svg v-else-if="item.icon === 'hospital'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <rect x="9" y="10" width="22" height="24" rx="3" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
                <rect x="14" y="4" width="12" height="12" rx="2" fill="#FF7B22"/>
                <path d="M20 7V13M17 10H23" stroke="white" stroke-width="2" stroke-linecap="round"/>
                <rect x="13" y="20" width="5" height="5" rx="1" fill="#A5D6A7"/>
                <rect x="22" y="20" width="5" height="5" rx="1" fill="#A5D6A7"/>
                <rect x="16" y="28" width="8" height="6" rx="1" fill="#FF7B22"/>
              </svg>
              <!-- 건강검진 예약: 클립보드 + 체크 -->
              <svg v-else-if="item.icon === 'health'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <rect x="8" y="8" width="24" height="28" rx="3" fill="white" stroke="#E56D1E" stroke-width="1.5"/>
                <rect x="14" y="4" width="12" height="7" rx="2" fill="#E56D1E"/>
                <circle cx="20" cy="7.5" r="1.5" fill="white"/>
                <circle cx="20" cy="23" r="7" fill="#FFF3ED" stroke="#E56D1E" stroke-width="1.5"/>
                <path d="M16.5 23L19 25.5L24 20" stroke="#E56D1E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 내 예약 조회: 달력 (초록색) -->
              <svg v-else-if="item.icon === 'calendar'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <rect x="6" y="9" width="28" height="26" rx="4" fill="white" stroke="#E56D1E" stroke-width="1.5"/>
                <rect x="6" y="9" width="28" height="9" rx="4" fill="#E56D1E"/>
                <rect x="12" y="5" width="3" height="7" rx="1.5" fill="#E56D1E"/>
                <rect x="25" y="5" width="3" height="7" rx="1.5" fill="#E56D1E"/>
                <rect x="11" y="22" width="5" height="4" rx="1" fill="#C8E6C9"/>
                <rect x="18" y="22" width="5" height="4" rx="1" fill="#C8E6C9"/>
                <rect x="25" y="22" width="5" height="4" rx="1" fill="#C8E6C9"/>
                <rect x="11" y="28" width="5" height="4" rx="1" fill="#C8E6C9"/>
                <rect x="18" y="28" width="5" height="4" rx="1" fill="#E56D1E" opacity="0.6"/>
              </svg>
              <!-- 내 보험 조회: 방패 + 체크 -->
              <svg v-else-if="item.icon === 'shield'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <path d="M20 4L6 10V18C6 26.8 12.2 34.6 20 37C27.8 34.6 34 26.8 34 18V10L20 4Z" fill="#FFF3ED" stroke="#E56D1E" stroke-width="1.5"/>
                <path d="M20 6L8 11.2V18C8 25.8 13.4 32.8 20 35C26.6 32.8 32 25.8 32 18V11.2L20 6Z" fill="white"/>
                <path d="M20 4L6 10V18C6 26.8 12.2 34.6 20 37C27.8 34.6 34 26.8 34 18V10L20 4Z" fill="none" stroke="#E56D1E" stroke-width="1.5"/>
                <path d="M15 20L18.5 23.5L26 16" stroke="#E56D1E" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 전문가 상담: 사람 + 헤드셋 -->
              <svg v-else-if="item.icon === 'consultant'" width="45" height="45" viewBox="0 0 40 40" fill="none">
                <circle cx="20" cy="14" r="7" fill="#FFF3ED" stroke="#E56D1E" stroke-width="1.5"/>
                <circle cx="20" cy="13" r="4.5" fill="white"/>
                <circle cx="20" cy="11.5" r="3" fill="#C8E6C9"/>
                <path d="M8 36C8 28.3 13.4 24 20 24C26.6 24 32 28.3 32 36" fill="#FFF3ED" stroke="#E56D1E" stroke-width="1.5"/>
                <path d="M8 36C8 29 13.4 25 20 25C26.6 25 32 29 32 36" fill="#E56D1E" opacity="0.2"/>
                <path d="M27 12C28.5 12 30 13 30 15V17C30 18.5 28.5 19 28 19" stroke="#E56D1E" stroke-width="1.5" stroke-linecap="round"/>
                <circle cx="30" cy="17" r="1.5" fill="#E56D1E"/>
              </svg>
            </div>
            <span class="text-[13px] font-bold text-[#333]">{{ item.label }}</span>
            <span class="text-[11px] text-[#999] -mt-1">{{ item.sub }}</span>
          </button>
        </div>
      </div>

      <!-- 배너 캐러셀 -->
      <div v-if="banners.length > 0" class="mx-5 mt-5 mb-28">
        <div class="relative rounded-[16px] overflow-hidden" @touchstart="onTouchStart" @touchend="onTouchEnd">
          <div
            class="flex transition-transform duration-300 ease-out"
            :style="{ transform: `translateX(-${currentBanner * 100}%)` }"
          >
            <div v-for="b in banners" :key="b.banner_id" class="w-full flex-shrink-0 cursor-pointer" @click="onBannerClick(b)">
              <img
                v-if="b.image_url"
                :src="b.image_url"
                :alt="b.title"
                class="w-full h-[160px] object-cover"
              />
            </div>
          </div>
        </div>
        <!-- 인디케이터 -->
        <div v-if="banners.length > 1" class="flex justify-center gap-1.5 mt-3">
          <button
            v-for="(_, i) in banners"
            :key="i"
            class="w-2 h-2 rounded-full transition-colors"
            :class="i === currentBanner ? 'bg-[#FF7B22]' : 'bg-[#D9D9D9]'"
            @click="currentBanner = i"
          ></button>
        </div>
      </div>
      <!-- 배너 없을 때 기본 -->
      <div v-else class="mx-5 mt-5 mb-28 bg-[#FFF3ED] rounded-[16px] p-6">
        <p class="text-[15px] font-semibold text-[#222] leading-relaxed">
          보험 청구부터 건강 관리까지<br />ON케어가 함께합니다
        </p>
        <p class="text-[13px] text-[#888] mt-2">언제든 편하게 이용하세요</p>
      </div>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { useDialog } from '@user/composables/useDialog'
import { fetchBanners } from '@user/services/publicApi'
import type { BannerData } from '@user/services/publicApi'

const router = useRouter()
const dialog = useDialog()
const banners = ref<BannerData[]>([])
const currentBanner = ref(0)
let touchStartX = 0
let swiped = false

onMounted(async () => {
  try {
    const res = await fetchBanners()
    banners.value = res.data.data
  } catch {
    banners.value = []
  }
})

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (touch) touchStartX = touch.clientX
  swiped = false
}

function onBannerClick(b: BannerData) {
  if (swiped) return
  if (!b.link_url) return
  if (b.link_url.startsWith('http')) {
    window.open(b.link_url, '_blank')
  } else {
    router.push(b.link_url)
  }
}

function onTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const diff = touchStartX - touch.clientX
  if (Math.abs(diff) < 50) {
    swiped = false
    return
  }
  swiped = true
  if (diff > 0 && currentBanner.value < banners.value.length - 1) {
    currentBanner.value++
  } else if (diff < 0 && currentBanner.value > 0) {
    currentBanner.value--
  }
}

interface MenuItem {
  icon: string
  label: string
  sub: string
  path?: string
  bgClass: string
  comingSoon?: boolean
}

const menuItems: MenuItem[] = [
  { icon: 'claim', label: '보험금 청구', sub: '간편하게 청구하기', path: '/claim-request', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'hospital', label: '병원 예약', sub: '협약 병원 찾기', path: '/hospitals', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'health', label: '건강검진 예약', sub: '검진센터 예약하기', path: '/health-centers', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'calendar', label: '내 예약 조회', sub: '예약 현황 확인', path: '/my-reservations', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'shield', label: '내 보험 조회', sub: '가입 내역 확인', bgClass: 'bg-[#FFF3ED]', comingSoon: true },
  { icon: 'consultant', label: '전문가 상담', sub: '담당 설계사 연결', bgClass: 'bg-[#FFF3ED]', comingSoon: true },
]

function handleMenuClick(item: MenuItem): void {
  if (item.comingSoon) {
    dialog.info('준비 중입니다. 빠른 시일 내에 제공해드리겠습니다.')
    return
  }
  if (item.path) {
    router.push(item.path)
  }
}
</script>
