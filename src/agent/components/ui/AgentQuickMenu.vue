<template>
  <div class="grid grid-cols-3 gap-2.5">
    <button
      v-for="item in menuItems"
      :key="item.label"
      class="flex flex-col bg-white rounded-[14px] shadow-[0_2px_8px_rgba(0,0,0,0.07)] text-left active:scale-[0.97] transition-transform overflow-hidden"
      @click="router.push(item.path)"
    >
      <div class="px-2.5 pt-2.5 pb-1">
        <span class="block text-[13px] font-bold text-[#333] leading-tight">{{ item.label }}</span>
        <span class="block text-[10px] text-[#999] mt-0.5 leading-snug">{{ item.sub }}</span>
      </div>
      <div class="flex-1 flex items-end justify-end px-1 pb-1">
        <img
          :src="item.image"
          :alt="item.label"
          class="w-[56px] h-[56px] object-contain"
          loading="lazy"
        />
      </div>
    </button>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../../stores/agentAuthStore'

const router = useRouter()
const authStore = useAgentAuthStore()

const isReviewAccount = computed(() => authStore.agent?.employee_number === 'TEST001')

const allMenuItems = [
  { label: '고객 관리', sub: '고객 목록 관리', path: '/customers?from=home', image: `${import.meta.env.BASE_URL}icons/3d/01_customer_management.png`, review: true },
  { label: '청구 관리', sub: '청구 현황 보기', path: '/claims', image: `${import.meta.env.BASE_URL}icons/3d/02_claim_management.png`, review: false },
  { label: '새 청구', sub: '보험금 청구하기', path: '/claims/new', image: `${import.meta.env.BASE_URL}icons/3d/03_new_claim.png`, review: false },
  { label: '메세지', sub: '안내 메세지 발송', path: '/messages/send', image: `${import.meta.env.BASE_URL}icons/3d/04_messages.png`, review: true },
  { label: 'DB 배분', sub: '배분 내역 관리', path: '/db-distribution', image: `${import.meta.env.BASE_URL}icons/3d/05_db_distribution.png`, review: true },
  { label: '보험·건강', sub: '보험 건강정보 조회', path: '/codef', image: `${import.meta.env.BASE_URL}icons/3d/06_insurance_health.png`, review: false },
]

const menuItems = computed(() =>
  isReviewAccount.value ? allMenuItems.filter(i => i.review) : allMenuItems
)
</script>
