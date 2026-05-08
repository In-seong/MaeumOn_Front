<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">상담 관리</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        type="text"
        placeholder="고객명 또는 내용으로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="filters.status"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option value="pending">대기</option>
        <option value="in_progress">진행중</option>
        <option value="completed">답변완료</option>
      </select>
      <select
        v-model="filters.type"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 유형</option>
        <option value="claim">보험청구</option>
        <option value="contract">계약</option>
        <option value="general">일반</option>
        <option value="complaint">불만</option>
      </select>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">담당설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">상담유형</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">내용 미리보기</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">답변</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">날짜</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">처리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="item in consultations" :key="item.consultation_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#FF7B22]">
              {{ item.consultation_id }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] font-medium text-[#333]">{{ item.customer?.name || item.customer_name || '-' }}</div>
              <div class="text-[12px] text-[#999]">{{ item.customer?.phone || item.customer_phone || '' }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#555] hidden md:table-cell">
              {{ item.assignee_id || '-' }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#555] hidden sm:table-cell">
              {{ getTypeLabel(item.consultation_type) }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(item.consultation_status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ getStatusLabel(item.consultation_status) }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[13px] text-[#555] hidden lg:table-cell max-w-[200px] truncate">
              {{ item.consultation_content || '-' }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] hidden md:table-cell">
              <span v-if="item.consultation_answer" class="text-green-600">O</span>
              <span v-else class="text-[#999]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ formatDate(item.created_at ?? '') }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right">
              <button
                @click="openDetail(item)"
                class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#E66A1A] transition-colors"
              >
                보기
              </button>
            </td>
          </tr>
          <tr v-if="consultations.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">
              상담 내역이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button
            v-for="page in pagination.last_page"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-[8px] text-[14px]',
              page === pagination.current_page
                ? 'bg-[#FF7B22] text-white'
                : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- 상세/처리 모달 -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-[16px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-xl">
        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">
            상담 처리
            <span v-if="activeConsultation" class="text-[14px] font-normal text-[#888] ml-2">#{{ activeConsultation.consultation_id }}</span>
          </h2>
          <button @click="closeModal" class="text-[#888] hover:text-[#333] text-[22px] leading-none">×</button>
        </div>

        <!-- 본문 -->
        <div class="px-6 py-5 space-y-5">
          <div v-if="detailLoading" class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          </div>

          <template v-else-if="activeConsultation">
            <!-- 상담 정보 -->
            <section class="space-y-2.5 text-[14px]">
              <div class="flex">
                <span class="w-[90px] text-[#888]">고객</span>
                <span class="text-[#222]">{{ activeConsultation.customer?.name || activeConsultation.customer_name || '-' }}
                  <span v-if="activeConsultation.customer_phone" class="text-[#888] ml-2">{{ activeConsultation.customer_phone }}</span>
                </span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888]">상담 유형</span>
                <span class="text-[#222]">{{ activeConsultation.consultation_type || '-' }}</span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888]">상태</span>
                <span :class="getStatusClass(activeConsultation.consultation_status)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">
                  {{ getStatusLabel(activeConsultation.consultation_status) }}
                </span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888] flex-shrink-0">담당 설계사</span>
                <span class="text-[#222]">
                  <template v-if="activeAgent">{{ activeAgent.name }} <span class="text-[#888]">({{ activeAgent.agent_id }})</span></template>
                  <template v-else>미배정</template>
                </span>
              </div>
              <div>
                <p class="text-[#888] mb-1">요청 내용</p>
                <p class="bg-[#FAFAFA] rounded-[10px] px-4 py-3 text-[#333] whitespace-pre-wrap">{{ activeConsultation.consultation_content || '-' }}</p>
              </div>
              <div v-if="activeConsultation.consultation_answer">
                <p class="text-[#888] mb-1">기존 답변</p>
                <p class="bg-[#FFF7F0] rounded-[10px] px-4 py-3 text-[#333] whitespace-pre-wrap">{{ activeConsultation.consultation_answer }}</p>
              </div>
            </section>

            <!-- 담당 설계사 배정 (미배정인 경우) -->
            <section
              v-if="activeConsultation.assignee_type !== 'AGENT' || !activeConsultation.assignee_id"
              class="border-t border-[#F0F0F0] pt-5"
            >
              <h3 class="text-[15px] font-semibold text-[#222] mb-3">담당 설계사 배정</h3>
              <div class="flex gap-2">
                <select
                  v-model="selectedAgentId"
                  class="flex-1 px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px]"
                >
                  <option value="">설계사 선택</option>
                  <option v-for="a in agents" :key="a.agent_id" :value="a.agent_id">
                    {{ a.name }} ({{ a.agent_id }}{{ a.office_location ? ` · ${a.office_location}` : '' }})
                  </option>
                </select>
                <button
                  @click="submitAssign"
                  :disabled="!selectedAgentId || submitting"
                  class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E66A1A]"
                >
                  {{ submitting ? '처리 중…' : '배정' }}
                </button>
              </div>
            </section>

            <!-- 답변 입력 (답변 미완료) -->
            <section
              v-if="activeConsultation.consultation_status !== 'completed'"
              class="border-t border-[#F0F0F0] pt-5"
            >
              <h3 class="text-[15px] font-semibold text-[#222] mb-3">답변 등록</h3>
              <textarea
                v-model="answerText"
                rows="4"
                placeholder="고객에게 전달할 답변을 입력하세요."
                class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px] resize-none"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="submitAnswer"
                  :disabled="!answerText.trim() || submitting"
                  class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E66A1A]"
                >
                  {{ submitting ? '처리 중…' : '답변 등록' }}
                </button>
              </div>
            </section>
          </template>
        </div>

        <!-- 푸터 -->
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end">
          <button
            @click="closeModal"
            class="px-4 py-2 text-[#555] hover:text-[#333] text-[14px]"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  fetchConsultations,
  fetchConsultation,
  answerConsultation,
  assignConsultation,
  fetchAgents,
} from '../../services/adminApi'
import type { AdminConsultation, AdminAgent, LaravelPagination } from '../../types'

const consultations = ref<AdminConsultation[]>([])
const pagination = ref<Omit<LaravelPagination<AdminConsultation>, 'data'> | null>(null)
const loading = ref(false)

const filters = reactive({
  search: '',
  status: '',
  type: '',
})

let searchTimeout: ReturnType<typeof setTimeout>

// ===== 상세/처리 모달 상태 =====
const modalOpen = ref(false)
const activeConsultation = ref<AdminConsultation | null>(null)
const activeAgent = ref<AdminAgent | null>(null)
const agents = ref<AdminAgent[]>([])
const selectedAgentId = ref('')
const answerText = ref('')
const submitting = ref(false)
const detailLoading = ref(false)

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(), 300)
}

async function fetchData(page = 1) {
  loading.value = true
  try {
    const response = await fetchConsultations({
      search: filters.search || undefined,
      consultation_status: filters.status || undefined,
      consultation_type: filters.type || undefined,
      page,
    })
    const { data, ...paginationData } = response.data.data
    consultations.value = data
    pagination.value = paginationData
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  fetchData(page)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

function getStatusLabel(status?: string) {
  switch (status) {
    case 'pending': return '대기'
    case 'in_progress': return '진행중'
    case 'completed': return '답변완료'
    default: return status || '-'
  }
}

function getStatusClass(status?: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'in_progress': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getTypeLabel(type?: string) {
  switch (type) {
    case 'claim': return '보험청구'
    case 'contract': return '계약'
    case 'general': return '일반'
    case 'complaint': return '불만'
    default: return type || '-'
  }
}

// ===== 모달 액션 =====
async function openDetail(item: AdminConsultation) {
  modalOpen.value = true
  detailLoading.value = true
  activeConsultation.value = null
  activeAgent.value = null
  answerText.value = ''
  selectedAgentId.value = ''

  try {
    const detailReq = fetchConsultation(item.consultation_id)
    const agentsReq = agents.value.length === 0
      ? fetchAgents({ per_page: 200 })
      : Promise.resolve(null)

    const [detailRes, agentsRes] = await Promise.all([detailReq, agentsReq])

    activeConsultation.value = detailRes.data.data.consultation
    activeAgent.value = detailRes.data.data.agent
    selectedAgentId.value = activeConsultation.value?.assignee_id ?? ''

    if (agentsRes) {
      agents.value = agentsRes.data.data.data ?? []
    }
  } catch {
    alert('상담 상세를 불러오지 못했습니다.')
    modalOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  activeConsultation.value = null
  activeAgent.value = null
  answerText.value = ''
  selectedAgentId.value = ''
}

async function submitAssign() {
  if (!activeConsultation.value || !selectedAgentId.value || submitting.value) return
  submitting.value = true
  try {
    await assignConsultation(activeConsultation.value.consultation_id, selectedAgentId.value)
    alert('담당 설계사가 배정되었습니다.')
    closeModal()
    fetchData(pagination.value?.current_page ?? 1)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '배정에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

async function submitAnswer() {
  if (!activeConsultation.value || !answerText.value.trim() || submitting.value) return
  submitting.value = true
  try {
    await answerConsultation(activeConsultation.value.consultation_id, answerText.value.trim())
    alert('답변이 등록되었습니다.')
    closeModal()
    fetchData(pagination.value?.current_page ?? 1)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '답변 등록에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  fetchData()
})
</script>
