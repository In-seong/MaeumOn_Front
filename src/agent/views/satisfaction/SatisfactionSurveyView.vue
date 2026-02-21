<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="만족도 조사" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Average Rating Card -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 mb-5 text-center">
          <p class="text-[13px] text-[#888] mb-2">평균 만족도</p>
          <div class="flex items-center justify-center gap-2">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="#FF7B22" stroke="#FF7B22" stroke-width="2">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
            <span class="text-[32px] font-bold text-[#333]">{{ averageRating }}</span>
          </div>
          <p class="text-[12px] text-[#BBB] mt-1">{{ respondedCount }}명 응답 / {{ surveys.length }}명 발송</p>
        </div>

        <!-- Send Survey Button -->
        <button
          class="w-full mb-5 py-3 bg-[#FF7B22] text-white text-[14px] font-semibold rounded-[12px] active:scale-[0.98] transition-transform"
          @click="showSendModal = true"
        >
          새 설문 발송하기
        </button>

        <!-- Status Filter -->
        <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            class="flex-shrink-0 px-4 py-2 rounded-full text-[13px] font-semibold transition-colors"
            :class="activeFilter === tab.value
              ? 'bg-[#FF7B22] text-white'
              : 'bg-white text-[#888] border border-[#E0E0E0]'"
            @click="activeFilter = tab.value"
          >
            {{ tab.label }}
            <span
              class="ml-1 text-[11px]"
              :class="activeFilter === tab.value ? 'text-white/80' : 'text-[#BBB]'"
            >{{ countByStatus[tab.value] }}</span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Survey List -->
        <div v-else class="flex flex-col gap-3">
          <SurveyListItem
            v-for="item in filteredSurveys"
            :key="item.survey_id"
            :survey="item"
          />
        </div>

        <div v-if="!loading && filteredSurveys.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">해당 상태의 설문이 없습니다</p>
        </div>

        <!-- Send Survey Modal -->
        <Transition name="slide-up">
          <div
            v-if="showSendModal"
            class="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[68px]"
            @click.self="showSendModal = false"
          >
            <div class="absolute inset-0 bg-black/30" @click="showSendModal = false" />
            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 z-10">
              <h3 class="text-[16px] font-semibold text-[#333] mb-4">설문 발송</h3>

              <div class="flex flex-col gap-4">
                <FormInput
                  v-model="sendForm.customerId"
                  label="고객 ID"
                  placeholder="고객 ID를 입력하세요"
                />
                <FormInput
                  v-model="sendForm.surveyTitle"
                  label="설문 제목"
                  placeholder="설문 제목을 입력하세요"
                />
                <FormTextarea
                  v-model="sendForm.surveyContent"
                  label="설문 내용"
                  placeholder="설문 내용을 입력하세요"
                  :rows="4"
                />

                <div class="flex gap-3 mt-2">
                  <ActionButton variant="outline" full @click="showSendModal = false">취소</ActionButton>
                  <ActionButton full :disabled="sending" @click="handleSendSurvey">
                    {{ sending ? '발송 중...' : '발송하기' }}
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
import { ref, computed, reactive, onMounted } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import SurveyListItem from '../../components/ui/SurveyListItem.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import { fetchSurveys, createSurvey } from '../../services/agentApi'
import type { SatisfactionSurvey } from '../../types'

type SurveyFilter = 'all' | 'sent' | 'responded'

const activeFilter = ref<SurveyFilter>('all')
const showSendModal = ref(false)
const loading = ref(false)
const sending = ref(false)

const sendForm = reactive({
  customerId: '',
  surveyTitle: '',
  surveyContent: '',
})

const filterTabs: { label: string; value: SurveyFilter }[] = [
  { label: '전체', value: 'all' },
  { label: '발송됨', value: 'sent' },
  { label: '응답완료', value: 'responded' },
]

const surveys = ref<SatisfactionSurvey[]>([])

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchSurveys()
    surveys.value = res.data?.data?.data ?? []
  } catch {
    // Error handled globally
  } finally {
    loading.value = false
  }
})

const respondedSurveys = computed(() =>
  surveys.value.filter(s => s.survey_status === 'responded' && s.rating !== undefined),
)

const respondedCount = computed(() => respondedSurveys.value.length)

const averageRating = computed(() => {
  if (respondedSurveys.value.length === 0) return '0.0'
  const sum = respondedSurveys.value.reduce((acc, s) => acc + (s.rating ?? 0), 0)
  return (sum / respondedSurveys.value.length).toFixed(1)
})

const countByStatus = computed(() => ({
  all: surveys.value.length,
  sent: surveys.value.filter(s => s.survey_status === 'sent').length,
  responded: surveys.value.filter(s => s.survey_status === 'responded').length,
}))

const filteredSurveys = computed(() => {
  if (activeFilter.value === 'all') return surveys.value
  return surveys.value.filter(s => s.survey_status === activeFilter.value)
})

async function handleSendSurvey(): Promise<void> {
  if (!sendForm.customerId || !sendForm.surveyTitle || !sendForm.surveyContent) return
  sending.value = true
  try {
    const res = await createSurvey({
      customer_id: sendForm.customerId,
      survey_title: sendForm.surveyTitle,
      survey_content: sendForm.surveyContent,
    })
    const newSurvey = res.data?.data
    if (newSurvey) {
      surveys.value.unshift(newSurvey)
    }
    sendForm.customerId = ''
    sendForm.surveyTitle = ''
    sendForm.surveyContent = ''
    showSendModal.value = false
  } catch {
    // Error handled globally
  } finally {
    sending.value = false
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
