<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">청구 관리</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap gap-4">
      <input
        v-model="filters.search"
        type="text"
        placeholder="고객명 또는 이메일로 검색"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @input="debouncedSearch"
      />
      <select
        v-model="filters.status"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @change="fetchData"
      >
        <option value="">전체 상태</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <input
        v-model="filters.date_from"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @change="fetchData"
      />
      <span class="self-center text-gray-500">~</span>
      <input
        v-model="filters.date_to"
        type="date"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @change="fetchData"
      />
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
        <thead class="bg-gray-50 dark:bg-gray-700">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">고객</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">보험사 / 양식</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">팩스</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">생성일</th>
            <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="claim in claims" :key="claim.id" class="hover:bg-gray-50 dark:hover:bg-gray-700">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">{{ claim.id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm font-medium text-gray-900 dark:text-white">{{ claim.user?.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ claim.user?.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-sm text-gray-900 dark:text-white">{{ claim.claim_form_template?.insurance_company?.name }}</div>
              <div class="text-sm text-gray-500 dark:text-gray-400">{{ claim.claim_form_template?.name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="claim.status"
                @change="handleStatusChange(claim.id, ($event.target as HTMLSelectElement).value)"
                :class="getStatusClass(claim.status)"
                class="px-2 py-1 text-xs font-medium rounded border-0"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              <span v-if="claim.fax_status === 'sent'" class="text-green-600">발송완료</span>
              <span v-else-if="claim.fax_status === 'failed'" class="text-red-600">발송실패</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
              {{ formatDate(claim.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
              <a
                v-if="claim.generated_image_url"
                :href="claim.generated_image_url"
                target="_blank"
                class="text-blue-600 hover:text-blue-900 dark:text-blue-400 mr-3"
              >
                이미지
              </a>
              <a
                v-if="claim.generated_pdf_url"
                :href="claim.generated_pdf_url"
                target="_blank"
                class="text-green-600 hover:text-green-900 dark:text-green-400"
              >
                PDF
              </a>
            </td>
          </tr>
          <tr v-if="claims.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-gray-500 dark:text-gray-400">
              청구 내역이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
        <div class="flex justify-center gap-2">
          <button
            v-for="page in pagination.last_page"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded',
              page === pagination.current_page
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300'
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
import { claimApi } from '@shared/services/insuranceApi'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'
import type { InsuranceClaim, PaginatedResponse } from '@shared/types'

const claims = ref<InsuranceClaim[]>([])
const pagination = ref<Omit<PaginatedResponse<InsuranceClaim>, 'data'> | null>(null)
const loading = ref(false)

const statusOptions = CLAIM_STATUS_OPTIONS

const filters = reactive({
  search: '',
  status: '',
  date_from: '',
  date_to: '',
})

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchData(), 300)
}

async function fetchData(page = 1) {
  loading.value = true
  try {
    const response = await claimApi.getAdminList({
      search: filters.search || undefined,
      status: filters.status || undefined,
      date_from: filters.date_from || undefined,
      date_to: filters.date_to || undefined,
      page,
    })
    const { data, ...paginationData } = response.data.data
    claims.value = data
    pagination.value = paginationData
  } finally {
    loading.value = false
  }
}

function goToPage(page: number) {
  fetchData(page)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR')
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

async function handleStatusChange(claimId: number, newStatus: string) {
  try {
    await claimApi.updateStatus(claimId, { status: newStatus })
    const claim = claims.value.find(c => c.id === claimId)
    if (claim) {
      claim.status = newStatus as any
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '상태 변경에 실패했습니다.')
    fetchData()
  }
}

onMounted(() => {
  fetchData()
})
</script>
