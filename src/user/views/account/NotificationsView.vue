<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white flex flex-col">
      <BackHeader title="알림" />
      <main class="flex-1 px-6 py-4 pb-20 overflow-y-auto">
        <div v-if="notifications.length === 0" class="text-center py-16">
          <p class="text-[#999] text-[14px]">알림이 없습니다.</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="noti in notifications" :key="noti.id"
            class="p-4 rounded-xl transition-colors"
            :class="noti.is_read ? 'bg-[#F8F8F8]' : 'bg-[#FFF3ED] border border-[#FFD5B5]'"
            @click="markAsRead(noti)">
            <div class="flex items-start justify-between mb-1">
              <StatusBadge :label="noti.typeLabel" :variant="noti.typeVariant" />
              <span class="text-[11px] text-[#BBB]">{{ noti.timeAgo }}</span>
            </div>
            <p class="text-[14px] font-semibold text-[#333] mt-2">{{ noti.title }}</p>
            <p class="text-[12px] text-[#888] mt-1">{{ noti.message }}</p>
          </div>
        </div>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackHeader from '../../components/layout/BackHeader.vue'
import StatusBadge from '../../components/ui/StatusBadge.vue'
import BottomNav from '../../components/layout/BottomNav.vue'

interface Notification {
  id: number
  title: string
  message: string
  type: string
  typeLabel: string
  typeVariant: 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default'
  is_read: boolean
  timeAgo: string
}

const notifications = ref<Notification[]>([
  {
    id: 1,
    title: '보험 만기 안내',
    message: '삼성화재 건강보험이 30일 후 만기됩니다.',
    type: 'insurance',
    typeLabel: '보험',
    typeVariant: 'primary',
    is_read: false,
    timeAgo: '1시간 전',
  },
  {
    id: 2,
    title: '건강검진 예약 확인',
    message: '12월 15일 건강검진 예약이 확인되었습니다.',
    type: 'health',
    typeLabel: '건강',
    typeVariant: 'success',
    is_read: false,
    timeAgo: '3시간 전',
  },
  {
    id: 3,
    title: '상담 답변 완료',
    message: '문의하신 보험 청구 건에 대한 답변이 등록되었습니다.',
    type: 'consultation',
    typeLabel: '상담',
    typeVariant: 'warning',
    is_read: true,
    timeAgo: '1일 전',
  },
])

function markAsRead(noti: Notification): void {
  noti.is_read = true
}
</script>
