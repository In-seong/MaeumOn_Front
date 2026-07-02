<template>
  <div class="bg-white rounded-[16px] border border-[#E0E0E0] shadow-[0_2px_12px_rgba(0,0,0,0.08)] p-5">
    <div class="grid grid-cols-3 gap-4">
      <button
        v-for="item in menuItems"
        :key="item.label"
        class="flex flex-col items-center gap-1.5 py-2 active:scale-95 transition-transform"
        @click="router.push(item.path)"
      >
        <div class="w-[60px] h-[60px] rounded-[16px] flex items-center justify-center" :class="item.bgClass">
          <!-- 고객관리: 사람 두 명 -->
          <svg v-if="item.icon === 'customers'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <circle cx="16" cy="13" r="6" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <circle cx="16" cy="12" r="3.5" fill="white"/>
            <circle cx="16" cy="11" r="2.5" fill="#FFD5B8"/>
            <path d="M6 34C6 27 10.5 23 16 23C21.5 23 26 27 26 34" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M6 34C6 27.5 10.5 24 16 24C21.5 24 26 27.5 26 34" fill="#FF7B22" opacity="0.2"/>
            <circle cx="28" cy="15" r="4.5" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <circle cx="28" cy="14" r="2.5" fill="white"/>
            <circle cx="28" cy="13.5" r="1.8" fill="#FFD5B8"/>
            <path d="M24 34C24 29 26.5 26 29 25" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <!-- 상담요청: 말풍선 -->
          <svg v-else-if="item.icon === 'consultation'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="6" width="24" height="18" rx="4" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M12 24L8 30V24" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5" stroke-linejoin="round"/>
            <rect x="11" y="12" width="12" height="2" rx="1" fill="#FF7B22" opacity="0.4"/>
            <rect x="11" y="16" width="8" height="2" rx="1" fill="#FF7B22" opacity="0.4"/>
            <circle cx="30" cy="12" r="5" fill="#FF7B22"/>
            <text x="30" y="15.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">!</text>
          </svg>
          <!-- 청구관리: 클립보드 + 체크 -->
          <svg v-else-if="item.icon === 'claims'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="8" width="24" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="4" width="12" height="7" rx="2" fill="#FF7B22"/>
            <circle cx="20" cy="7.5" r="1.5" fill="white"/>
            <rect x="13" y="16" width="14" height="2" rx="1" fill="#FFD5B8"/>
            <rect x="13" y="21" width="10" height="2" rx="1" fill="#FFD5B8"/>
            <rect x="13" y="26" width="12" height="2" rx="1" fill="#FFD5B8"/>
            <circle cx="29" cy="29" r="6" fill="#FF7B22"/>
            <path d="M26 29L28.5 31.5L33 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 새 청구: 서류 + 플러스 -->
          <svg v-else-if="item.icon === 'newClaim'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="4" width="20" height="28" rx="3" fill="#FF7B22" opacity="0.15"/>
            <rect x="10" y="6" width="20" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="12" width="12" height="1.5" rx="0.75" fill="#FFD5B8"/>
            <rect x="14" y="16" width="9" height="1.5" rx="0.75" fill="#FFD5B8"/>
            <rect x="14" y="20" width="11" height="1.5" rx="0.75" fill="#FFD5B8"/>
            <circle cx="27" cy="28" r="7" fill="#FF7B22"/>
            <path d="M27 24.5V31.5M23.5 28H30.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 메시지: 봉투 -->
          <svg v-else-if="item.icon === 'message'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="10" width="30" height="22" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M5 13L20 24L35 13" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="5" y="10" width="30" height="8" rx="3" fill="#FF7B22" opacity="0.15"/>
            <circle cx="32" cy="10" r="5" fill="#FF7B22"/>
            <text x="32" y="13.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">N</text>
          </svg>
          <!-- DB배분: 데이터베이스 -->
          <svg v-else-if="item.icon === 'db'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <ellipse cx="20" cy="10" rx="13" ry="5" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 10V30C7 32.76 12.8 35 20 35C27.2 35 33 32.76 33 30V10" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 17C7 19.76 12.8 22 20 22C27.2 22 33 19.76 33 17" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 24C7 26.76 12.8 29 20 29C27.2 29 33 26.76 33 24" stroke="#FF7B22" stroke-width="1.5"/>
            <ellipse cx="20" cy="10" rx="9" ry="3" fill="#FF7B22" opacity="0.2"/>
          </svg>
          <!-- 알릴의무: 경고 방패 -->
          <svg v-else-if="item.icon === 'alert'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <path d="M20 4L6 10V18C6 26.8 12.2 34.6 20 37C27.8 34.6 34 26.8 34 18V10L20 4Z" fill="#FFF3ED" stroke="#E56D1E" stroke-width="1.5"/>
            <path d="M20 6L8 11.2V18C8 25.8 13.4 32.8 20 35C26.6 32.8 32 25.8 32 18V11.2L20 6Z" fill="white"/>
            <path d="M20 4L6 10V18C6 26.8 12.2 34.6 20 37C27.8 34.6 34 26.8 34 18V10L20 4Z" fill="none" stroke="#E56D1E" stroke-width="1.5"/>
            <path d="M20 13V22" stroke="#FF3B30" stroke-width="2.5" stroke-linecap="round"/>
            <circle cx="20" cy="27" r="1.5" fill="#FF3B30"/>
          </svg>
          <!-- 만족도: 별 -->
          <svg v-else-if="item.icon === 'satisfaction'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <polygon points="20,4 24.5,14 35,15.5 27.5,23 29.5,33.5 20,28.5 10.5,33.5 12.5,23 5,15.5 15.5,14" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <polygon points="20,8 23.2,15 30,15.8 25,20.8 26.4,27.5 20,24.2 13.6,27.5 15,20.8 10,15.8 16.8,15" fill="#FF7B22" opacity="0.25"/>
            <polygon points="20,11 22.2,16 28,16.6 24,20.4 25,26 20,23.2 15,26 16,20.4 12,16.6 17.8,16" fill="#FF7B22" opacity="0.4"/>
          </svg>
        </div>
        <span class="text-[13px] font-bold text-[#333]">{{ item.label }}</span>
        <span class="text-[11px] text-[#999] -mt-1">{{ item.sub }}</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { icon: 'customers', label: '고객관리', sub: '고객 목록 관리', path: '/customers', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'consultation', label: '상담요청', sub: '요청 확인하기', path: '/consultations', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'claims', label: '청구관리', sub: '청구 현황 보기', path: '/claims', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'newClaim', label: '새 청구', sub: '보험금 청구하기', path: '/claims/new', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'message', label: '메시지', sub: '안내 메시지 발송', path: '/messages/send', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'db', label: 'DB배분', sub: '신규 고객 배분', path: '/db-distribution', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'alert', label: '알릴의무', sub: '의무 사항 관리', path: '/alert-duty', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'satisfaction', label: '만족도', sub: '고객 만족 조회', path: '/satisfaction', bgClass: 'bg-[#FFF3ED]' },
]
</script>
