<template>
  <div class="p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">청구 관리</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap gap-3">
      <input
        v-model="filters.search"
        type="text"
        placeholder="고객명 또는 사용자명으로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="filters.status"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
          {{ opt.label }}
        </option>
      </select>
      <input
        v-model="filters.date_from"
        type="date"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      />
      <span class="self-center text-[#999]">~</span>
      <input
        v-model="filters.date_to"
        type="date"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      />
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">ID</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">보험사 / 양식</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">팩스</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">생성일</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="claim in claims" :key="claim.claim_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ claim.claim_id }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] font-medium text-[#333]">{{ claim.customer?.name }}</div>
              <div class="text-[12px] text-[#999]">{{ claim.customer?.email }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] text-[#333]">{{ claim.claim_form?.insurance_company?.company_name }}</div>
              <div class="text-[12px] text-[#999]">{{ claim.claim_form?.form_name }}</div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <select
                :value="claim.claim_status"
                @change="handleStatusChange(claim.claim_id, ($event.target as HTMLSelectElement).value)"
                :class="getStatusClass(claim.claim_status)"
                class="px-2 py-1 text-[12px] font-medium rounded-full border-0 cursor-pointer"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              <span v-if="claim.fax_status === 'sent'" class="text-green-600">발송완료</span>
              <span v-else-if="claim.fax_status === 'failed'" class="text-red-500">발송실패</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatDate(claim.created_at ?? '') }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-[14px]">
              <a
                v-if="claim.generated_pdf_url"
                :href="claim.generated_pdf_url"
                target="_blank"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                이미지
              </a>
              <a
                v-if="claim.generated_pdf_url"
                :href="claim.generated_pdf_url"
                target="_blank"
                class="text-green-600 hover:text-green-700"
              >
                PDF
              </a>
            </td>
          </tr>
          <tr v-if="claims.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-[#999]">
              청구 내역이 없습니다.
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
      claim_status: filters.status || undefined,
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
    await claimApi.updateStatus(claimId, { claim_status: newStatus })
    const claim = claims.value.find(c => c.claim_id === claimId)
    if (claim) {
      claim.claim_status = newStatus as any
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
