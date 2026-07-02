<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">청구 관리</h1>
      <button
        class="px-4 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors"
        @click="router.push('/claims/new')"
      >
        + 새 청구
      </button>
    </div>

    <!-- 검색 + 필터 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1 max-w-[400px]">
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#AAA]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          :value="store.searchQuery"
          placeholder="고객명, 보험사, 청구유형 검색"
          class="w-full pl-10 pr-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] transition-colors"
          @input="store.setSearchQuery(($event.target as HTMLInputElement).value)"
        />
      </div>
      <span class="text-[13px] text-[#888] whitespace-nowrap">
        총 <span class="font-semibold text-[#FF7B22]">{{ store.total }}</span>건
      </span>
    </div>

    <!-- 상태 필터 칩 -->
    <div class="flex gap-2 mb-5">
      <button
        v-for="chip in filterChips"
        :key="chip.value"
        :class="[
          'px-4 py-2 rounded-full text-[13px] font-medium transition-colors',
          store.filterStatus === chip.value
            ? 'bg-[#FF7B22] text-white'
            : 'bg-white text-[#888] border border-[#E8E8E8] hover:border-[#FF7B22] hover:text-[#FF7B22]',
        ]"
        @click="store.setFilter(chip.value)"
      >
        {{ chip.label }}
        <span
          :class="[
            'ml-1 text-[11px]',
            store.filterStatus === chip.value ? 'text-white/80' : 'text-[#BBB]',
          ]"
        >
          {{ store.statusCounts[chip.value] }}
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
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">청구유형</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">보험사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">청구금액</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">청구일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(claim, index) in store.filteredClaims"
            :key="claim.claim_id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="goToDetail(claim.claim_id)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ claim.customer?.name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ claimTypeLabel(claim.claim_type) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] hidden md:table-cell">{{ claim.claim_form?.insurance_company?.company_name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="statusClass(claim.claim_status)"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ statusLabel(claim.claim_status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] text-right hidden lg:table-cell">
              {{ claim.claim_amount ? Number(claim.claim_amount).toLocaleString() + '원' : '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(claim.claim_date ?? claim.created_at) }}</td>
          </tr>
          <tr v-if="store.filteredClaims.length === 0">
            <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
              {{ store.searchQuery ? `"${store.searchQuery}" 검색 결과가 없습니다` : '청구 내역이 없습니다' }}
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
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentClaimStore } from '../../stores/agentClaimStore'

const router = useRouter()
const store = useAgentClaimStore()

interface FilterChip {
  label: string
  value: 'all' | 'draft' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid'
}

const filterChips: FilterChip[] = [
  { label: '전체', value: 'all' },
  { label: '임시저장', value: 'draft' },
  { label: '접수대기', value: 'pending' },
  { label: '처리중', value: 'processing' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
  { label: '지급완료', value: 'paid' },
]

onMounted(() => {
  store.loadClaims()
})

function goToDetail(id: number): void {
  router.push(`/claims/${id}`)
}

function goToPage(page: number): void {
  if (page < 1 || page > store.lastPage) return
  store.currentPage = page
  store.loadClaims()
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

function claimTypeLabel(type?: string): string {
  const map: Record<string, string> = {
    hospitalization: '입원',
    outpatient: '통원',
    surgery: '수술',
    death: '사망',
    diagnosis: '진단',
    disability: '장해',
    other: '기타',
  }
  return type ? (map[type] ?? type) : '-'
}

function statusLabel(status?: string): string {
  const map: Record<string, string> = {
    draft: '임시저장',
    pending: '접수대기',
    processing: '처리중',
    approved: '승인',
    rejected: '거절',
    paid: '지급완료',
  }
  return status ? (map[status] ?? status) : '-'
}

function statusClass(status?: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600',
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-600',
    paid: 'bg-emerald-100 text-emerald-700',
  }
  return status ? (map[status] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
