<template>
  <div class="p-4 lg:p-6">
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
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">보험사 / 양식</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">승인금액</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">팩스</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">생성일</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="claim in claims" :key="claim.claim_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ claim.claim_id }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] font-medium text-[#333]">{{ claim.customer?.name }}</div>
              <div class="text-[12px] text-[#999]">{{ claim.customer?.email }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <div class="text-[14px] text-[#333]">{{ claim.claim_form?.insurance_company?.company_name }}</div>
              <div class="text-[12px] text-[#999]">{{ claim.claim_form?.form_name }}</div>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <select
                :value="claim.claim_status"
                @change="handleStatusChange(claim, ($event.target as HTMLSelectElement).value)"
                :class="getStatusClass(claim.claim_status)"
                class="px-2 py-1 text-[12px] font-medium rounded-full border-0 cursor-pointer"
              >
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-[14px] hidden lg:table-cell">
              <span v-if="claim.approved_amount" class="font-medium text-[#22C55E]">
                {{ Number(claim.approved_amount).toLocaleString() }}원
              </span>
              <span v-else class="text-[#999]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">
              <span v-if="claim.fax_status === 'sent'" class="text-green-600">발송완료</span>
              <span v-else-if="claim.fax_status === 'failed'" class="text-red-500">발송실패</span>
              <span v-else>-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ formatDate(claim.created_at ?? '') }}
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-[14px]">
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
            <td colspan="8" class="px-4 lg:px-6 py-10 text-center text-[#999]">
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

    <!-- 승인 금액 입력 모달 -->
    <Teleport to="body">
      <div v-if="showApprovalModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="cancelApproval"></div>
        <div class="relative bg-white rounded-[16px] w-[90%] max-w-[400px] p-6 shadow-xl">
          <h3 class="text-[18px] font-bold text-[#222] mb-1">승인 처리</h3>
          <p class="text-[13px] text-[#888] mb-5">
            청구 #{{ pendingApproval?.claim.claim_id }} — {{ pendingApproval?.claim.customer?.name }}
          </p>

          <label class="block text-[13px] font-medium text-[#555] mb-2">승인 금액 (원)</label>
          <input
            v-model="approvalAmount"
            type="text"
            inputmode="numeric"
            placeholder="0"
            class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[15px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors text-right"
            @input="formatAmountInput"
          />
          <p class="text-[12px] text-[#999] mt-1.5">비워두면 금액 없이 승인됩니다.</p>

          <div class="flex gap-3 mt-6">
            <button
              class="flex-1 border border-[#E0E0E0] text-[#555] rounded-[12px] py-3 text-[14px] font-semibold"
              @click="cancelApproval"
            >
              취소
            </button>
            <button
              class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3 text-[14px] font-semibold"
              @click="confirmApproval"
            >
              승인 확정
            </button>
          </div>
        </div>
      </div>
    </Teleport>
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

// 승인 모달 상태
const showApprovalModal = ref(false)
const approvalAmount = ref('')
const pendingApproval = ref<{ claim: InsuranceClaim; newStatus: string } | null>(null)

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
    case 'draft': return 'bg-gray-100 text-gray-600'
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'approved': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    case 'paid': return 'bg-purple-100 text-purple-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function formatAmountInput(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/[^0-9]/g, '')
  approvalAmount.value = raw ? Number(raw).toLocaleString() : ''
}

async function handleStatusChange(claim: InsuranceClaim, newStatus: string) {
  // approved로 변경 시 승인금액 입력 모달 표시
  if (newStatus === 'approved') {
    pendingApproval.value = { claim, newStatus }
    approvalAmount.value = ''
    showApprovalModal.value = true
    return
  }

  await doStatusChange(claim.claim_id, newStatus)
}

async function confirmApproval() {
  if (!pendingApproval.value) return

  const rawAmount = approvalAmount.value.replace(/[^0-9]/g, '')
  const amount = rawAmount ? Number(rawAmount) : undefined

  await doStatusChange(
    pendingApproval.value.claim.claim_id,
    pendingApproval.value.newStatus,
    amount,
  )

  showApprovalModal.value = false
  pendingApproval.value = null
}

function cancelApproval() {
  showApprovalModal.value = false
  pendingApproval.value = null
  fetchData() // select 원래 값으로 복원
}

async function doStatusChange(claimId: number, newStatus: string, approvedAmount?: number) {
  try {
    await claimApi.updateStatus(claimId, {
      claim_status: newStatus,
      approved_amount: approvedAmount,
    })
    const claim = claims.value.find(c => c.claim_id === claimId)
    if (claim) {
      claim.claim_status = newStatus as typeof claim.claim_status
      if (approvedAmount !== undefined) {
        claim.approved_amount = approvedAmount
      }
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
