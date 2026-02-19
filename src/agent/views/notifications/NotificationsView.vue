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
                class="w-[36px] h-[36px] rounded-full flex items-center justify-center flex-shrink-0"
                :class="iconBg(noti.type)"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" :stroke="iconColor(noti.type)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" v-html="iconSvg(noti.type)" />
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
    claim: 'bg-[#E8F9EE]',
    survey: 'bg-[#E5F7ED]',
    schedule: 'bg-[#F3E8FF]',
    system: 'bg-[#F5F5F5]',
  }
  return map[type] ?? 'bg-[#F5F5F5]'
}

function iconColor(type: AgentNotification['type']): string {
  const map: Record<string, string> = {
    consultation: '#FF7B22',
    obligation: '#FF3B30',
    distribution: '#4285F4',
    claim: '#1FBD53',
    survey: '#F5A623',
    schedule: '#8B5CF6',
    system: '#888',
  }
  return map[type] ?? '#888'
}

function iconSvg(type: AgentNotification['type']): string {
  const map: Record<string, string> = {
    consultation: '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>',
    obligation: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>',
    distribution: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>',
    claim: '<path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/><path d="M9 14l2 2 4-4"/>',
    survey: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    schedule: '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>',
    system: '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>',
  }
  return map[type] ?? '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'
}
</script>
