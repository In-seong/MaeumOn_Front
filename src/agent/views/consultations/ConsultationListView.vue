<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="상담요청 목록" />

      <main class="px-5 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Status Filter Tabs -->
        <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide" role="tablist" aria-label="상담 상태 필터">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            role="tab"
            :aria-selected="store.filterStatus === tab.value"
            :class="[
              'flex-shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all',
              store.filterStatus === tab.value
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white text-[#888] border border-[#E8E8E8]',
            ]"
            @click="store.setFilter(tab.value)"
          >
            {{ tab.label }}
            <span
              :class="[
                'ml-1 text-[11px]',
                store.filterStatus === tab.value ? 'text-white/80' : 'text-[#BBB]',
              ]"
            >
              {{ store.statusCounts[tab.value] }}
            </span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Consultation List -->
        <div v-else-if="store.filteredConsultations.length > 0" class="flex flex-col gap-3">
          <ConsultationListItem
            v-for="consultation in store.filteredConsultations"
            :key="consultation.consultation_id"
            :consultation="consultation"
            @respond="handleRespond"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-[#FFF3ED] rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p class="text-[15px] font-medium text-[#888]">상담요청이 없습니다</p>
          <p class="text-[13px] text-[#BBB] mt-1">{{ emptyStateMessage }}</p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ConsultationListItem from '../../components/ui/ConsultationListItem.vue'
import { useConsultationStore } from '../../stores/consultationStore'

const store = useConsultationStore()

interface FilterTab {
  label: string
  value: 'all' | 'pending' | 'in_progress' | 'completed'
}

const filterTabs: FilterTab[] = [
  { label: '전체', value: 'all' },
  { label: '대기중', value: 'pending' },
  { label: '진행중', value: 'in_progress' },
  { label: '완료', value: 'completed' },
]

const emptyStateMessage = computed(() => {
  const map: Record<string, string> = {
    all: '아직 접수된 상담이 없습니다',
    pending: '대기 중인 상담이 없습니다',
    in_progress: '진행 중인 상담이 없습니다',
    completed: '완료된 상담이 없습니다',
  }
  return map[store.filterStatus] ?? ''
})

onMounted(() => {
  store.loadConsultations()
})

function handleRespond(id: number, answer: string): void {
  store.answerConsultation(id, answer)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}

.scrollbar-hide {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
