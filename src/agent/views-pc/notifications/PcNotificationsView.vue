<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">알림</h1>
      <button
        v-if="unreadCount > 0"
        class="text-[13px] text-[#FF7B22] font-medium hover:text-[#E56D1E] transition-colors disabled:opacity-50"
        :disabled="markingAllRead"
        @click="handleMarkAllRead"
      >
        {{ markingAllRead ? '처리 중...' : '전체 읽음 처리' }}
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto" />
      <p class="mt-2 text-[14px] text-[#999]">불러오는 중...</p>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider w-[50px]">상태</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-[100px]">유형</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">제목</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">내용</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-[140px]">시간</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="noti in notifications"
            :key="noti.notification_id"
            :class="[
              'transition-colors cursor-pointer',
              noti.is_read ? 'opacity-60 hover:bg-[#FAFAFA]' : 'hover:bg-[#FFF8F4]',
            ]"
            @click="handleMarkRead(noti)"
          >
            <td class="px-6 py-4 text-center">
              <span
                v-if="!noti.is_read"
                class="inline-block w-2.5 h-2.5 rounded-full bg-[#FF7B22]"
              />
              <span v-else class="text-[12px] text-[#CCC]">--</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="typeChipClass(noti.notification_type)"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >
                {{ typeLabel(noti.notification_type) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ noti.title }}</td>
            <td class="px-6 py-4 text-[14px] text-[#666] max-w-[400px] truncate">{{ noti.content }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[13px] text-[#999]">{{ formatDate(noti.created_at ?? '') }}</td>
          </tr>
          <tr v-if="notifications.length === 0">
            <td colspan="5" class="px-6 py-16 text-center text-[14px] text-[#999]">
              알림이 없습니다
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { useNotificationStore } from '../../stores/notificationStore'
import type { AgentNotification } from '../../types'

const store = useNotificationStore()
const markingAllRead = ref(false)

const notifications = computed(() => store.notifications)
const loading = computed(() => store.loading)
const unreadCount = computed(() => store.unreadCount)

onMounted(() => {
  store.loadNotifications()
})

async function handleMarkRead(noti: AgentNotification): Promise<void> {
  await store.markRead(noti)
}

async function handleMarkAllRead(): Promise<void> {
  markingAllRead.value = true
  try {
    await store.markAllRead()
  } finally {
    markingAllRead.value = false
  }
}

function typeLabel(type: string): string {
  const map: Record<string, string> = {
    consultation: '상담',
    obligation: '알릴의무',
    distribution: '배분',
    claim: '청구',
    survey: '설문',
    schedule: '일정',
    ADMIN_MESSAGE: '관리자',
    NOTICE: '공지',
    ASSIGNMENT: '배정',
    system: '시스템',
  }
  return map[type] ?? '기타'
}

function typeChipClass(type: string): string {
  const map: Record<string, string> = {
    consultation: 'bg-[#FFF0E5] text-[#FF7B22]',
    obligation: 'bg-[#FFE5E5] text-[#FF3B30]',
    distribution: 'bg-[#E8F0FE] text-[#4285F4]',
    claim: 'bg-[#E8F9EE] text-[#1FBD53]',
    survey: 'bg-[#FFF4E5] text-[#F5A623]',
    schedule: 'bg-[#F3E8FF] text-[#8B5CF6]',
    ADMIN_MESSAGE: 'bg-[#FFF0E5] text-[#FF7B22]',
    NOTICE: 'bg-[#E8F0FE] text-[#4285F4]',
    ASSIGNMENT: 'bg-[#E8F9EE] text-[#1FBD53]',
    system: 'bg-[#F5F5F5] text-[#888]',
  }
  return map[type] ?? 'bg-[#F5F5F5] text-[#888]'
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return '방금 전'
  if (mins < 60) return `${mins}분 전`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}시간 전`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}일 전`
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
