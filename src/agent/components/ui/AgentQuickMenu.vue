<template>
  <div class="grid grid-cols-4 gap-3">
    <button
      v-for="item in menuItems"
      :key="item.label"
      class="flex flex-col items-center gap-1.5 py-3 rounded-[12px] bg-white shadow-[0_0_8px_rgba(0,0,0,0.06)] active:scale-[0.96] transition-transform"
      @click="router.push(item.path)"
    >
      <div class="w-9 h-9 rounded-full flex items-center justify-center" :class="item.bgColor">
        <span class="text-[18px]">{{ item.emoji }}</span>
      </div>
      <span class="text-[11px] font-medium text-[#555]">{{ item.label }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()

const menuItems = [
  { emoji: '👥', label: '고객관리', path: '/customers', bgColor: 'bg-[#FFF0E5]' },
  { emoji: '💬', label: '상담요청', path: '/consultations', bgColor: 'bg-[#E8F0FE]' },
  { emoji: '📋', label: '청구관리', path: '/claims', bgColor: 'bg-[#E8F9EE]' },
  { emoji: '✉️', label: '메시지', path: '/messages/send', bgColor: 'bg-[#FFF4E5]' },
  { emoji: '📊', label: 'DB배분', path: '/db-distribution', bgColor: 'bg-[#F3E8FF]' },
  { emoji: '⚠️', label: '알릴의무', path: '/alert-duty', bgColor: 'bg-[#FFE5E5]' },
  { emoji: '⭐', label: '만족도', path: '/satisfaction', bgColor: 'bg-[#FFFCE5]' },
  { emoji: '📅', label: '일정관리', path: '/schedule', bgColor: 'bg-[#E5F6FF]' },
]
</script>
