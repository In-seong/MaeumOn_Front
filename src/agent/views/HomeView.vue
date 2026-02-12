<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader :unread-count="3" />

      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Hero Banner -->
        <section class="mb-4">
          <HeroBanner :schedule-count="todayScheduleCount" :contact-count="pendingConsultations" />
        </section>

        <!-- Alerts -->
        <section class="flex flex-col gap-2 mb-4">
          <AlertCard
            icon="🔔"
            :title="`미처리 상담요청 ${pendingConsultations}건`"
            subtitle="빠른 응답이 필요합니다"
            variant="warning"
            @click="router.push('/consultations')"
          />
          <AlertCard
            icon="⚠️"
            title="알릴의무 만기 임박 2건"
            subtitle="7일 이내 처리 필요"
            variant="danger"
            @click="router.push('/alert-duty')"
          />
        </section>

        <!-- Quick Menu -->
        <section class="mb-5">
          <AgentQuickMenu />
        </section>

        <!-- Todo List -->
        <section class="mb-5">
          <TodoListCard :items="todoItems" @toggle="toggleTodo" />
        </section>

        <!-- Recent Summary -->
        <section>
          <CardSection>
            <h3 class="text-[15px] font-semibold text-[#333] mb-3">이번 달 실적 요약</h3>
            <div class="grid grid-cols-3 gap-3">
              <div class="text-center">
                <p class="text-[20px] font-bold text-[#FF7B22]">{{ dbDistributed }}</p>
                <p class="text-[11px] text-[#999]">DB배분</p>
              </div>
              <div class="text-center">
                <p class="text-[20px] font-bold text-[#4285F4]">{{ contractsCount }}</p>
                <p class="text-[11px] text-[#999]">계약체결</p>
              </div>
              <div class="text-center">
                <p class="text-[20px] font-bold text-[#1FBD53]">{{ conversionRate }}%</p>
                <p class="text-[11px] text-[#999]">전환율</p>
              </div>
            </div>
          </CardSection>
        </section>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import AgentAppHeader from '../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../components/layout/AgentBottomNav.vue'
import HeroBanner from '../components/ui/HeroBanner.vue'
import AgentQuickMenu from '../components/ui/AgentQuickMenu.vue'
import TodoListCard from '../components/ui/TodoListCard.vue'
import AlertCard from '../components/ui/AlertCard.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import { useScheduleStore } from '../stores/scheduleStore'
import { useConsultationStore } from '../stores/consultationStore'
import { useStatisticsStore } from '../stores/statisticsStore'

const router = useRouter()
const scheduleStore = useScheduleStore()
const consultationStore = useConsultationStore()
const statisticsStore = useStatisticsStore()

const todayScheduleCount = computed(() => scheduleStore.schedulesForDate.length)
const pendingConsultations = computed(() => consultationStore.statusCounts.pending)
const dbDistributed = computed(() => statisticsStore.currentPerformance.db_distributed)
const contractsCount = computed(() => statisticsStore.currentPerformance.contracts_count)
const conversionRate = computed(() => statisticsStore.currentPerformance.conversion_rate)

// Mock data
const todoItems = ref([
  { id: 1, text: '김영수 고객 계약 상담 (14:00)', done: false },
  { id: 2, text: '박미정 고객 만기 안내 전화', done: true },
  { id: 3, text: 'DB배분 신규 고객 3명 확인', done: false },
  { id: 4, text: '이정훈 고객 청구서류 확인', done: false },
])

function toggleTodo(id: number) {
  const item = todoItems.value.find(t => t.id === id)
  if (item) item.done = !item.done
}
</script>
