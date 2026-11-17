<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">문의 관리</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        type="text"
        placeholder="설계사명 또는 제목으로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="filters.status"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option value="pending">미답변</option>
        <option value="answered">답변완료</option>
      </select>
      <select
        v-model="filters.category"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 카테고리</option>
        <option value="system_error">시스템 오류</option>
        <option value="feature_request">기능 건의</option>
        <option value="business">업무 문의</option>
        <option value="other">기타</option>
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
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">카테고리</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">제목</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">등록일</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">처리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="item in inquiries" :key="item.inquiry_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#FF7B22]">
              {{ item.inquiry_id }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span :class="getCategoryClass(item.category)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ getCategoryLabel(item.category) }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#333] max-w-[280px] truncate">
              {{ item.title }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <div class="text-[14px] font-medium text-[#333]">{{ item.agent?.name || '-' }}</div>
              <div class="text-[12px] text-[#999]">{{ item.agent_id }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(item.status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ getStatusLabel(item.status) }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ formatDate(item.created_at) }}
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
          <tr v-if="inquiries.length === 0">
            <td colspan="7" class="px-4 lg:px-6 py-10 text-center text-[#999]">
              문의 내역이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        v-if="pagination"
        :current-page="pagination.current_page"
        :last-page="pagination.last_page"
        @change="goToPage"
      />
    </div>

    <!-- 상세/답변 모달 -->
    <div
      v-if="modalOpen"
      class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
      @click.self="closeModal"
    >
      <div class="bg-white rounded-[16px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-xl">
        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">
            문의 상세
            <span v-if="activeInquiry" class="text-[14px] font-normal text-[#888] ml-2">#{{ activeInquiry.inquiry_id }}</span>
          </h2>
          <button @click="closeModal" class="text-[#888] hover:text-[#333] text-[22px] leading-none">×</button>
        </div>

        <!-- 본문 -->
        <div class="px-6 py-5 space-y-5">
          <div v-if="detailLoading" class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          </div>

          <template v-else-if="activeInquiry">
            <!-- 문의 정보 -->
            <section class="space-y-2.5 text-[14px]">
              <div class="flex">
                <span class="w-[90px] text-[#888] flex-shrink-0">설계사</span>
                <span class="text-[#222]">
                  {{ activeInquiry.agent?.name || '-' }}
                  <span class="text-[#888] ml-1">({{ activeInquiry.agent_id }})</span>
                  <span v-if="activeInquiry.agent?.phone" class="text-[#888] ml-2">{{ activeInquiry.agent.phone }}</span>
                </span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888] flex-shrink-0">카테고리</span>
                <span :class="getCategoryClass(activeInquiry.category)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">
                  {{ getCategoryLabel(activeInquiry.category) }}
                </span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888] flex-shrink-0">상태</span>
                <span :class="getStatusClass(activeInquiry.status)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">
                  {{ getStatusLabel(activeInquiry.status) }}
                </span>
              </div>
              <div class="flex">
                <span class="w-[90px] text-[#888] flex-shrink-0">등록일</span>
                <span class="text-[#222]">{{ formatDate(activeInquiry.created_at) }}</span>
              </div>
              <div>
                <p class="text-[#888] mb-1">{{ activeInquiry.title }}</p>
                <p class="bg-[#FAFAFA] rounded-[10px] px-4 py-3 text-[#333] whitespace-pre-wrap">{{ activeInquiry.content }}</p>
              </div>

              <!-- 첨부파일 -->
              <div v-if="activeInquiry.attachment_urls && activeInquiry.attachment_urls.length > 0">
                <p class="text-[#888] mb-1">첨부파일</p>
                <div class="space-y-1">
                  <a
                    v-for="(file, fi) in activeInquiry.attachment_urls"
                    :key="fi"
                    :href="file.url"
                    target="_blank"
                    class="flex items-center gap-2 text-[13px] text-[#FF7B22] hover:underline"
                  >
                    <span class="material-symbols-outlined text-[16px]">attach_file</span>
                    {{ file.name }}
                    <span class="text-[#999] text-[12px]">({{ formatFileSize(file.size) }})</span>
                  </a>
                </div>
              </div>

              <!-- 기존 답변 -->
              <div v-if="activeInquiry.answer">
                <p class="text-[#888] mb-1">
                  답변
                  <span v-if="activeInquiry.answered_by_admin" class="text-[12px] ml-1">- {{ activeInquiry.answered_by_admin.name }}</span>
                  <span v-if="activeInquiry.answered_at" class="text-[12px] text-[#BBB] ml-1">{{ formatDate(activeInquiry.answered_at) }}</span>
                </p>
                <p class="bg-[#FFF7F0] rounded-[10px] px-4 py-3 text-[#333] whitespace-pre-wrap">{{ activeInquiry.answer }}</p>
              </div>
            </section>

            <!-- 답변 입력 (미답변인 경우) -->
            <section
              v-if="activeInquiry.status === 'pending'"
              class="border-t border-[#F0F0F0] pt-5"
            >
              <h3 class="text-[15px] font-semibold text-[#222] mb-3">답변 작성</h3>
              <textarea
                v-model="answerText"
                rows="5"
                placeholder="설계사에게 보낼 답변을 입력하세요."
                class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px] resize-none"
              ></textarea>
              <div class="flex justify-end mt-2">
                <button
                  @click="submitAnswer"
                  :disabled="!answerText.trim() || submitting"
                  class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#E66A1A]"
                >
                  {{ submitting ? '처리 중...' : '답변 등록' }}
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
import { fetchInquiries, fetchInquiryDetail, answerInquiry } from '../../services/adminApi'
import type { InquiryItem, LaravelPagination } from '../../types'
import Pagination from '../../components/Pagination.vue'

const inquiries = ref<InquiryItem[]>([])
const pagination = ref<Omit<LaravelPagination<InquiryItem>, 'data'> | null>(null)
const loading = ref(false)

const filters = reactive({
  search: '',
  status: '',
  category: '',
})

let searchTimeout: ReturnType<typeof setTimeout>

const modalOpen = ref(false)
const activeInquiry = ref<InquiryItem | null>(null)
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
    const response = await fetchInquiries({
      search: filters.search || undefined,
      status: filters.status || undefined,
      category: filters.category || undefined,
      page,
    })
    const { data, ...paginationData } = response.data.data
    inquiries.value = data
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

function formatFileSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function getCategoryLabel(cat: string) {
  switch (cat) {
    case 'system_error': return '시스템 오류'
    case 'feature_request': return '기능 건의'
    case 'business': return '업무 문의'
    case 'other': return '기타'
    default: return cat || '-'
  }
}

function getCategoryClass(cat: string) {
  switch (cat) {
    case 'system_error': return 'bg-red-100 text-red-700'
    case 'feature_request': return 'bg-purple-100 text-purple-700'
    case 'business': return 'bg-blue-100 text-blue-700'
    case 'other': return 'bg-gray-100 text-gray-700'
    default: return 'bg-gray-100 text-gray-700'
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case 'pending': return '미답변'
    case 'answered': return '답변완료'
    default: return status || '-'
  }
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'answered': return 'bg-green-100 text-green-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

async function openDetail(item: InquiryItem) {
  modalOpen.value = true
  detailLoading.value = true
  activeInquiry.value = null
  answerText.value = ''

  try {
    const res = await fetchInquiryDetail(item.inquiry_id)
    activeInquiry.value = res.data.data
  } catch {
    alert('문의 상세를 불러오지 못했습니다.')
    modalOpen.value = false
  } finally {
    detailLoading.value = false
  }
}

function closeModal() {
  modalOpen.value = false
  activeInquiry.value = null
  answerText.value = ''
}

async function submitAnswer() {
  if (!activeInquiry.value || !answerText.value.trim() || submitting.value) return
  submitting.value = true
  try {
    await answerInquiry(activeInquiry.value.inquiry_id, answerText.value.trim())
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
