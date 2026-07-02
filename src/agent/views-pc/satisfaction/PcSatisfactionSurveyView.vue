<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">만족도 조사</h1>
      <button
        class="px-4 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors"
        @click="showSendModal = true"
      >
        + 새 설문 발송
      </button>
    </div>

    <!-- 평균 만족도 카드 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5 text-center">
        <p class="text-[13px] text-[#888] mb-2">평균 만족도</p>
        <div class="flex items-center justify-center gap-2">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="#FF7B22" stroke="#FF7B22" stroke-width="2">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
          <span class="text-[28px] font-bold text-[#333]">{{ averageRating }}</span>
        </div>
      </div>
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5 text-center">
        <p class="text-[13px] text-[#888] mb-2">응답 현황</p>
        <p class="text-[28px] font-bold text-[#FF7B22]">{{ respondedCount }}<span class="text-[16px] text-[#999] font-normal"> / {{ surveys.length }}</span></p>
      </div>
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5 text-center">
        <p class="text-[13px] text-[#888] mb-2">응답률</p>
        <p class="text-[28px] font-bold text-[#333]">{{ responseRate }}%</p>
      </div>
    </div>

    <!-- 상태 필터 -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-full text-[13px] font-medium transition-colors',
          activeFilter === tab.value
            ? 'bg-[#FF7B22] text-white'
            : 'bg-white text-[#888] border border-[#E8E8E8] hover:border-[#FF7B22] hover:text-[#FF7B22]',
        ]"
        @click="activeFilter = tab.value"
      >
        {{ tab.label }}
        <span
          :class="[
            'ml-1 text-[11px]',
            activeFilter === tab.value ? 'text-white/80' : 'text-[#BBB]',
          ]"
        >{{ countByStatus[tab.value] }}</span>
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
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">설문 제목</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider">평점</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">피드백</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">발송일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(item, index) in filteredSurveys"
            :key="item.survey_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.customer?.name || '-' }}</td>
            <td class="px-6 py-4 text-[14px] text-[#666] max-w-[200px] truncate">{{ item.survey_title || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="item.survey_status === 'responded' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ item.survey_status === 'responded' ? '응답완료' : '발송됨' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <template v-if="item.rating !== undefined && item.rating !== null">
                <div class="flex items-center justify-center gap-0.5">
                  <svg
                    v-for="star in 5"
                    :key="star"
                    width="14" height="14" viewBox="0 0 24 24"
                    :fill="star <= (item.rating ?? 0) ? '#FF7B22' : '#E8E8E8'"
                    :stroke="star <= (item.rating ?? 0) ? '#FF7B22' : '#E8E8E8'"
                    stroke-width="1"
                  >
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </div>
              </template>
              <span v-else class="text-[13px] text-[#BBB]">-</span>
            </td>
            <td class="px-6 py-4 text-[14px] text-[#666] max-w-[200px] truncate hidden md:table-cell">{{ item.feedback || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(item.sent_at ?? item.created_at) }}</td>
          </tr>
          <tr v-if="filteredSurveys.length === 0">
            <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
              해당 상태의 설문이 없습니다
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 설문 발송 모달 -->
    <Teleport to="body">
      <div
        v-if="showSendModal"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/30" @click="showSendModal = false" />
        <div class="relative bg-white rounded-[16px] p-6 w-full max-w-[500px] z-10 shadow-xl">
          <h3 class="text-[16px] font-semibold text-[#333] mb-4">설문 발송</h3>
          <div class="flex flex-col gap-4">
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-1">고객 ID</label>
              <input
                v-model="sendForm.customerId"
                type="text"
                placeholder="고객 ID를 입력하세요"
                class="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] transition-colors"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-1">설문 제목</label>
              <input
                v-model="sendForm.surveyTitle"
                type="text"
                placeholder="설문 제목을 입력하세요"
                class="w-full px-3 py-2.5 border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] transition-colors"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-1">설문 내용</label>
              <textarea
                v-model="sendForm.surveyContent"
                placeholder="설문 내용을 입력하세요"
                class="w-full p-3 border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] resize-none transition-colors"
                rows="4"
              />
            </div>
            <div class="flex gap-3 mt-2">
              <button
                class="flex-1 py-2.5 border border-[#E8E8E8] text-[#666] rounded-[12px] text-[14px] font-medium hover:bg-[#F8F8F8] transition-colors"
                @click="showSendModal = false"
              >
                취소
              </button>
              <button
                class="flex-1 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] font-medium hover:bg-[#E56D1E] transition-colors disabled:opacity-50"
                :disabled="sending || !sendForm.customerId || !sendForm.surveyTitle || !sendForm.surveyContent"
                @click="handleSendSurvey"
              >
                {{ sending ? '발송 중...' : '발송하기' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted } from 'vue'
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

const responseRate = computed(() => {
  if (surveys.value.length === 0) return '0'
  return ((respondedCount.value / surveys.value.length) * 100).toFixed(0)
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

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
