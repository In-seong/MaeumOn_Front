<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="DB 배분" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Status Filter Tabs -->
        <div class="flex gap-2 mb-5 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            class="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
            :class="store.filterStatus === tab.value
              ? 'bg-[#FF7B22] text-white'
              : 'bg-white text-[#888] border border-[#E0E0E0]'"
            @click="store.setFilter(tab.value)"
          >
            {{ tab.label }}
            <span
              class="ml-1 text-[11px]"
              :class="store.filterStatus === tab.value ? 'text-white/80' : 'text-[#BBB]'"
            >{{ store.countByStatus[tab.value] }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Distribution List -->
        <div v-else class="flex flex-col gap-3">
          <DbDistributionItem
            v-for="item in store.filteredDistributions"
            :key="item.assignment_id"
            :distribution="item"
            @process="openProcessForm"
          />
        </div>

        <div v-if="!store.loading && store.filteredDistributions.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">해당 상태의 배분 내역이 없습니다</p>
        </div>

        <!-- Inline Process Form -->
        <Transition name="slide-up">
          <div
            v-if="processingId !== null"
            class="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[68px]"
            @click.self="closeProcessForm"
          >
            <div class="absolute inset-0 bg-black/30" @click="closeProcessForm" />
            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 z-10">
              <h3 class="text-[16px] font-semibold text-[#333] mb-4">배분 처리</h3>

              <div class="flex flex-col gap-4">
                <FormSelect
                  v-model="processForm.status"
                  label="처리 상태"
                  :options="['처리중', '완료']"
                />

                <div class="flex gap-3 mt-2">
                  <ActionButton variant="outline" full @click="closeProcessForm">취소</ActionButton>
                  <ActionButton full :disabled="processing" @click="confirmProcess">
                    {{ processing ? '처리 중...' : '확인' }}
                  </ActionButton>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useDbDistributionStore } from '../../stores/dbDistributionStore'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import DbDistributionItem from '../../components/ui/DbDistributionItem.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import type { DbDistribution } from '../../types'

const store = useDbDistributionStore()

const filterTabs: { label: string; value: 'all' | 'pending' | 'processing' | 'completed' }[] = [
  { label: '전체', value: 'all' },
  { label: '미처리', value: 'pending' },
  { label: '처리중', value: 'processing' },
  { label: '완료', value: 'completed' },
]

const processingId = ref<number | null>(null)
const processing = ref(false)
const processForm = reactive({
  status: '처리중',
})

onMounted(() => {
  store.loadDistributions()
})

function openProcessForm(id: number): void {
  processingId.value = id
  processForm.status = '처리중'
}

function closeProcessForm(): void {
  processingId.value = null
}

async function confirmProcess(): Promise<void> {
  if (processingId.value === null) return

  const statusMap: Record<string, DbDistribution['status']> = {
    '처리중': 'processing',
    '완료': 'completed',
  }
  const status = statusMap[processForm.status] ?? 'processing'

  processing.value = true
  try {
    await store.process(processingId.value, { status })
    closeProcessForm()
  } catch {
    // Error handled in store
  } finally {
    processing.value = false
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }
</style>
