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
          </tr>
          <tr v-if="consultations.length === 0">
            <td colspan="8" class="px-4 lg:px-6 py-10 text-center text-[#999]">
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchConsultations } from '../../services/adminApi'
import type { AdminConsultation, LaravelPagination } from '../../types'

const consultations = ref<AdminConsultation[]>([])
const pagination = ref<Omit<LaravelPagination<AdminConsultation>, 'data'> | null>(null)
const loading = ref(false)

const filters = reactive({
  search: '',
  status: '',
  type: '',
})

let searchTimeout: ReturnType<typeof setTimeout>

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

onMounted(() => {
  fetchData()
})
</script>
