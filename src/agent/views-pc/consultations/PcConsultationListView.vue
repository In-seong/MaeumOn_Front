<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">상담요청 목록</h1>
      <span class="text-[13px] text-[#888]">
        총 <span class="font-semibold text-[#FF7B22]">{{ store.total }}</span>건
      </span>
    </div>

    <!-- 상태 필터 칩 -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="tab in filterTabs"
        :key="tab.value"
        :class="[
          'px-4 py-2 rounded-full text-[13px] font-medium transition-colors',
          store.filterStatus === tab.value
            ? 'bg-[#FF7B22] text-white'
            : 'bg-white text-[#888] border border-[#E8E8E8] hover:border-[#FF7B22] hover:text-[#FF7B22]',
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

    <!-- 로딩 -->
    <div v-if="store.loading" class="text-center py-10">
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
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상담유형</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상담내용</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">요청일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">답변</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(consultation, index) in store.filteredConsultations"
            :key="consultation.consultation_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ consultation.customer?.name ?? consultation.customer_name ?? '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ consultationTypeLabel(consultation.consultation_type) }}</td>
            <td class="px-6 py-4 text-[14px] text-[#666] max-w-[300px] truncate">{{ consultation.consultation_content }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="statusClass(consultation.consultation_status)"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ statusLabel(consultation.consultation_status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden lg:table-cell">{{ formatDate(consultation.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <template v-if="consultation.consultation_status === 'completed'">
                <span class="text-[13px] text-[#999]">답변 완료</span>
              </template>
              <template v-else>
                <button
                  class="text-[13px] text-[#FF7B22] font-medium hover:text-[#E56D1E] transition-colors"
                  @click.stop="openAnswer(consultation)"
                >
                  답변하기
                </button>
              </template>
            </td>
          </tr>
          <tr v-if="store.filteredConsultations.length === 0">
            <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
              {{ emptyStateMessage }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="store.lastPage > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex items-center justify-center gap-1">
          <button
            :disabled="store.currentPage <= 1"
            class="px-3 py-1.5 rounded-[8px] text-[13px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(store.currentPage - 1)"
          >
            이전
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[
              'px-3 py-1.5 rounded-[8px] text-[13px] transition-colors',
              page === store.currentPage
                ? 'bg-[#FF7B22] text-white'
                : 'text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]',
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            :disabled="store.currentPage >= store.lastPage"
            class="px-3 py-1.5 rounded-[8px] text-[13px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(store.currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>

    <!-- 답변 모달 -->
    <Teleport to="body">
      <div
        v-if="answeringConsultation !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/30" @click="closeAnswer" />
        <div class="relative bg-white rounded-[16px] p-6 w-full max-w-[500px] z-10 shadow-xl">
          <h3 class="text-[16px] font-semibold text-[#333] mb-1">상담 답변</h3>
          <p class="text-[13px] text-[#888] mb-4">{{ answeringConsultation.customer?.name ?? answeringConsultation.customer_name ?? '' }} - {{ answeringConsultation.consultation_content }}</p>
          <textarea
            v-model="answerText"
            placeholder="답변 내용을 입력하세요"
            class="w-full p-3 border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] resize-none transition-colors"
            rows="4"
          />
          <div class="flex gap-3 mt-4">
            <button
              class="flex-1 py-2.5 border border-[#E8E8E8] text-[#666] rounded-[12px] text-[14px] font-medium hover:bg-[#F8F8F8] transition-colors"
              @click="closeAnswer"
            >
              취소
            </button>
            <button
              class="flex-1 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] font-medium hover:bg-[#E56D1E] transition-colors disabled:opacity-50"
              :disabled="!answerText.trim()"
              @click="submitAnswer"
            >
              답변 전송
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useConsultationStore } from '../../stores/consultationStore'
import type { Consultation } from '../../types'

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

const answeringConsultation = ref<Consultation | null>(null)
const answerText = ref('')

onMounted(() => {
  store.loadConsultations()
})

const emptyStateMessage = computed(() => {
  const map: Record<string, string> = {
    all: '아직 접수된 상담이 없습니다',
    pending: '대기 중인 상담이 없습니다',
    in_progress: '진행 중인 상담이 없습니다',
    completed: '완료된 상담이 없습니다',
  }
  return map[store.filterStatus] ?? ''
})

function goToPage(page: number): void {
  if (page < 1 || page > store.lastPage) return
  store.currentPage = page
  store.loadConsultations()
}

function rowNum(index: number): number {
  return (store.currentPage - 1) * 15 + index + 1
}

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = store.lastPage
  const current = store.currentPage
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

function openAnswer(consultation: Consultation): void {
  answeringConsultation.value = consultation
  answerText.value = ''
}

function closeAnswer(): void {
  answeringConsultation.value = null
  answerText.value = ''
}

async function submitAnswer(): Promise<void> {
  if (!answeringConsultation.value || !answerText.value.trim()) return
  await store.answerConsultation(answeringConsultation.value.consultation_id, answerText.value.trim())
  closeAnswer()
}

function consultationTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    general: '일반',
    claim: '보험금 청구',
    contract: '계약',
    complaint: '불만/민원',
  }
  return type ? (map[type] ?? type) : '-'
}

function statusLabel(status?: string): string {
  const map: Record<string, string> = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료',
  }
  return status ? (map[status] ?? status) : '-'
}

function statusClass(status?: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return status ? (map[status] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
