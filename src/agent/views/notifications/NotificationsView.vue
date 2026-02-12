<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="알림" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Notification List -->
        <div class="flex flex-col gap-3">
          <div
            v-for="noti in notifications"
            :key="noti.notification_id"
            class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4 transition-colors"
            :class="noti.is_read ? 'opacity-60' : ''"
            @click="markAsRead(noti.notification_id)"
          >
            <div class="flex items-start gap-3">
              <div
                class="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0 text-[16px]"
                :class="iconBg(noti.type)"
              >
                {{ iconEmoji(noti.type) }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center justify-between mb-1">
                  <span class="text-[14px] font-semibold text-[#333]">{{ noti.title }}</span>
                  <span
                    v-if="!noti.is_read"
                    class="w-2 h-2 rounded-full bg-[#FF7B22] flex-shrink-0"
                  />
                </div>
                <p class="text-[13px] text-[#666] leading-relaxed">{{ noti.content }}</p>
                <p class="text-[11px] text-[#BBB] mt-1.5">{{ noti.created_at }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="notifications.length === 0" class="text-center py-16">
          <p class="text-[14px] text-[#BBB]">알림이 없습니다</p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import type { AgentNotification } from '../../types'

const notifications = ref<AgentNotification[]>([
  {
    notification_id: 1,
    agent_id: 'AGT00001',
    title: '새 상담요청',
    content: '김영수 고객님이 보험상담을 요청하셨습니다.',
    type: 'consultation',
    is_read: false,
    created_at: '2026-02-12 09:30',
  },
  {
    notification_id: 2,
    agent_id: 'AGT00001',
    title: '알릴의무 만기 임박',
    content: '이정아 고객 직업변경고지 D-Day입니다.',
    type: 'obligation',
    is_read: false,
    created_at: '2026-02-12 08:00',
  },
  {
    notification_id: 3,
    agent_id: 'AGT00001',
    title: 'DB 배분 알림',
    content: '신규 DB 3건이 배분되었습니다.',
    type: 'system',
    is_read: false,
    created_at: '2026-02-11 17:00',
  },
  {
    notification_id: 4,
    agent_id: 'AGT00001',
    title: '만족도 조사 응답',
    content: '김영수 고객님이 만족도 조사에 응답하셨습니다.',
    type: 'claim',
    is_read: true,
    created_at: '2026-02-11 14:30',
  },
  {
    notification_id: 5,
    agent_id: 'AGT00001',
    title: '일정 알림',
    content: '내일 09:30 최수연 고객 신규 계약 상담이 예정되어 있습니다.',
    type: 'schedule',
    is_read: true,
    created_at: '2026-02-11 09:00',
  },
])

function markAsRead(id: number): void {
  const noti = notifications.value.find(n => n.notification_id === id)
  if (noti) noti.is_read = true
}

function iconBg(type: AgentNotification['type']): string {
  const map: Record<string, string> = {
    consultation: 'bg-[#FFF0E5]',
    obligation: 'bg-[#FFE5E5]',
    distribution: 'bg-[#E8F0FE]',
    survey: 'bg-[#E5F7ED]',
    schedule: 'bg-[#F3E8FF]',
    system: 'bg-[#F5F5F5]',
  }
  return map[type] ?? 'bg-[#F5F5F5]'
}

function iconEmoji(type: AgentNotification['type']): string {
  const map: Record<string, string> = {
    consultation: '💬',
    obligation: '⚠️',
    distribution: '📋',
    survey: '⭐',
    schedule: '📅',
    system: '🔔',
  }
  return map[type] ?? '🔔'
}
</script>
