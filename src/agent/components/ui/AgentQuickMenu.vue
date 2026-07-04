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
          <!-- 고객관리: 올 주황 -->
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
          <!-- 청구관리: 체크 주황, 텍스트라인 초록 -->
          <svg v-else-if="item.icon === 'claims'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="8" width="24" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="4" width="12" height="7" rx="2" fill="#FF7B22"/>
            <circle cx="20" cy="7.5" r="1.5" fill="white"/>
            <rect x="13" y="16" width="14" height="2" rx="1" fill="#A8D5BA"/>
            <rect x="13" y="21" width="10" height="2" rx="1" fill="#A8D5BA"/>
            <rect x="13" y="26" width="12" height="2" rx="1" fill="#A8D5BA"/>
            <circle cx="29" cy="29" r="6" fill="#FF7B22"/>
            <path d="M26 29L28.5 31.5L33 27" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 새 청구: 플러스 주황, 텍스트라인 초록 -->
          <svg v-else-if="item.icon === 'newClaim'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="8" y="4" width="20" height="28" rx="3" fill="#FF7B22" opacity="0.15"/>
            <rect x="10" y="6" width="20" height="28" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <rect x="14" y="12" width="12" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="14" y="16" width="9" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="14" y="20" width="11" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <circle cx="27" cy="28" r="7" fill="#FF7B22"/>
            <path d="M27 24.5V31.5M23.5 28H30.5" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <!-- 메시지: N뱃지 주황 -->
          <svg v-else-if="item.icon === 'message'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <rect x="5" y="10" width="30" height="22" rx="3" fill="white" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M5 13L20 24L35 13" stroke="#FF7B22" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
            <rect x="5" y="10" width="30" height="8" rx="3" fill="#FF7B22" opacity="0.15"/>
            <rect x="10" y="24" width="10" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <rect x="10" y="27" width="7" height="1.5" rx="0.75" fill="#A8D5BA"/>
            <circle cx="32" cy="10" r="5" fill="#FF7B22"/>
            <text x="32" y="13.5" text-anchor="middle" font-size="8" font-weight="bold" fill="white">N</text>
          </svg>
          <!-- DB배분: 초록 하이라이트 유지 -->
          <svg v-else-if="item.icon === 'db'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <ellipse cx="20" cy="10" rx="13" ry="5" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 10V30C7 32.76 12.8 35 20 35C27.2 35 33 32.76 33 30V10" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 17C7 19.76 12.8 22 20 22C27.2 22 33 19.76 33 17" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M7 24C7 26.76 12.8 29 20 29C27.2 29 33 26.76 33 24" stroke="#FF7B22" stroke-width="1.5"/>
            <ellipse cx="20" cy="10" rx="9" ry="3" fill="#FF7B22" opacity="0.2"/>
            <ellipse cx="20" cy="17" rx="8" ry="2.5" fill="#C8E6C9" opacity="0.5"/>
            <ellipse cx="20" cy="24" rx="8" ry="2.5" fill="#C8E6C9" opacity="0.35"/>
          </svg>
          <!-- 보험·건강: 하트+방패 -->
          <svg v-else-if="item.icon === 'codef'" width="45" height="45" viewBox="0 0 40 40" fill="none">
            <path d="M20 6L8 12V20C8 28 13 33 20 36C27 33 32 28 32 20V12L20 6Z" fill="#FFF3ED" stroke="#FF7B22" stroke-width="1.5"/>
            <path d="M20 10L12 14V20C12 26 15.5 30 20 32C24.5 30 28 26 28 20V14L20 10Z" fill="#FF7B22" opacity="0.2"/>
            <path d="M20 18C18.5 16 16 16 15 17.5C14 19 14.5 21 20 25C25.5 21 26 19 25 17.5C24 16 21.5 16 20 18Z" fill="#FF7B22" opacity="0.6"/>
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
  { icon: 'claims', label: '청구관리', sub: '청구 현황 보기', path: '/claims', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'newClaim', label: '새 청구', sub: '보험금 청구하기', path: '/claims/new', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'message', label: '메시지', sub: '안내 메시지 발송', path: '/messages/send', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'db', label: 'DB배분', sub: '신규 고객 배분', path: '/db-distribution', bgClass: 'bg-[#FFF3ED]' },
  { icon: 'codef', label: '보험·건강', sub: '보험 건강정보 조회', path: '/codef', bgClass: 'bg-[#FFF3ED]' },
]
</script>
