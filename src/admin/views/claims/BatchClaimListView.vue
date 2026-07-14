<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">배치 청구 관리</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        type="text"
        placeholder="고객명 또는 설계사명으로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="filters.status"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option value="draft">임시저장</option>
        <option value="pending">접수 대기</option>
        <option value="processing">발송완료</option>
        <option value="completed">전체 완료</option>
        <option value="partial_failed">일부 실패</option>
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
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('batch_status')">상태 {{ sortIcon('batch_status') }}</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">청구건수</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">완료건수</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">비고</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell cursor-pointer select-none hover:text-[#333]" @click="handleSort('created_at')">생성일 {{ sortIcon('created_at') }}</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="(item, index) in batchClaims" :key="item.batch_claim_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ rowNum(index) }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] font-medium text-[#333]">{{ item.customer?.name || '-' }}</div>
              <div class="text-[12px] text-[#999]">{{ item.customer_id }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap hidden md:table-cell">
              <div class="text-[14px] text-[#333]">{{ item.agent?.name || '-' }}</div>
              <div class="text-[12px] text-[#999]">{{ item.agent_id }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span :class="getBatchStatusClass(item.batch_status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ item.batch_status_label || item.batch_status }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-[14px] text-[#333] hidden sm:table-cell">
              {{ item.claims_count ?? item.total_count }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-center text-[14px] text-[#333] hidden sm:table-cell">
              {{ item.completed_count }}
            </td>
            <td class="px-4 lg:px-6 py-4 text-[13px] text-[#555] hidden lg:table-cell max-w-[200px] truncate">
              {{ item.notes || '-' }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ formatDate(item.created_at ?? '') }}
            </td>
          </tr>
          <tr v-if="batchClaims.length === 0">
            <td colspan="8" class="px-4 lg:px-6 py-10 text-center text-[#999]">
              배치 청구 내역이 없습니다.
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
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchBatchClaims } from '../../services/adminApi'
import { useSortable } from '../../composables/useSortable'
import type { AdminBatchClaim, LaravelPagination } from '../../types'
import Pagination from '../../components/Pagination.vue'

const batchClaims = ref<AdminBatchClaim[]>([])
const pagination = ref<Omit<LaravelPagination<AdminBatchClaim>, 'data'> | null>(null)
const loading = ref(false)

const filters = reactive({
  search: '',
  status: '',
})
const { toggleSort, sortParams, sortIcon } = useSortable()

let searchTimeout: ReturnType<typeof setTimeout>

function rowNum(index: number): number {
  const p = pagination.value
  return ((p?.current_page ?? 1) - 1) * (p?.per_page ?? 15) + index + 1
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(), 300)
}

async function fetchData(page = 1) {
  loading.value = true
  try {
    const response = await fetchBatchClaims({
      search: filters.search || undefined,
      batch_status: filters.status || undefined,
      page,
      ...sortParams(),
    })
    const { data, ...paginationData } = response.data.data
    batchClaims.value = data
    pagination.value = paginationData
  } finally {
    loading.value = false
  }
}

function handleSort(field: string) {
  toggleSort(field)
  fetchData()
}

function goToPage(page: number) {
  fetchData(page)
}

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

function getBatchStatusClass(status: string) {
  switch (status) {
    case 'draft': return 'bg-gray-100 text-gray-600'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'partial_failed': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

onMounted(() => {
  fetchData()
})
</script>
