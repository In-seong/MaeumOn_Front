<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">DB 배분 관리</h1>
      <router-link
        to="/assignments/create"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        배분 등록
      </router-link>
    </div>

    <!-- 탭 -->
    <div class="flex gap-1 mb-4 bg-[#F5F5F5] rounded-[12px] p-1">
      <button
        v-for="tab in tabs"
        :key="tab.key"
        :class="[
          'flex-1 py-2 text-[13px] font-medium rounded-[10px] transition-colors',
          activeTab === tab.key
            ? 'bg-white text-[#FF7B22] shadow-sm'
            : 'text-[#888] hover:text-[#555]',
        ]"
        @click="switchTab(tab.key)"
      >
        {{ tab.label }}
      </button>
    </div>

    <!-- 검색 -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        :placeholder="activeTab === 'db' ? '고객 이름으로 검색' : '이름으로 검색'"
        class="w-full sm:max-w-[400px] px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
    </div>

    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- DB 배분 테이블 -->
    <div v-else-if="activeTab === 'db'" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-[60px]">No.</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객 전화번호</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배분 설계사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('assignment_date')">배분일 {{ sortIcon('assignment_date') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">비고</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(assignment, index) in store.assignments"
            :key="assignment.assignment_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index, store.pagination) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">
              {{ assignment.customer?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatPhone(assignment.customer?.phone) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">
              {{ assignment.agent?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatDate(assignment.assignment_date) }}
            </td>
            <td class="px-6 py-4 text-[14px] text-[#999] max-w-[200px] truncate">
              {{ assignment.notes || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium">
              <button
                @click="handleDelete(assignment)"
                class="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="store.assignments.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-[#999]">
              배분 이력이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        v-if="store.pagination"
        :current-page="store.pagination.current_page"
        :last-page="store.pagination.last_page"
        @change="goToPage"
      />
    </div>

    <!-- 청구 배정 테이블 -->
    <div v-else-if="activeTab === 'claim'" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-[60px]">No.</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">이름</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">전화번호</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배정 설계사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">병원</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">첨부</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배정일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(item, index) in store.claimAssignments"
            :key="item.request_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index, store.claimPagination) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatPhone(item.phone) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">
              {{ item.assigned_agent?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">
              {{ (item as any).hospital?.hospital_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(item.status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ statusLabel(item.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ item.files?.length || 0 }}개
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatDate(item.updated_at) }}
            </td>
          </tr>
          <tr v-if="store.claimAssignments.length === 0">
            <td colspan="8" class="px-6 py-10 text-center text-[#999]">
              청구 배정 이력이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        v-if="store.claimPagination"
        :current-page="store.claimPagination.current_page"
        :last-page="store.claimPagination.last_page"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useAssignmentStore } from '../../stores/assignmentStore'
import { useSortable } from '../../composables/useSortable'
import type { Assignment } from '../../types'
import Pagination from '../../components/Pagination.vue'

const store = useAssignmentStore()
const searchQuery = ref('')
const activeTab = ref<'db' | 'claim'>('db')
const { toggleSort, sortParams, sortIcon } = useSortable()

const tabs = [
  { key: 'db' as const, label: 'DB 배분' },
  { key: 'claim' as const, label: '청구 배정' },
]

const isLoading = computed(() =>
  activeTab.value === 'db' ? store.loading : store.claimLoading
)

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
}

function switchTab(tab: 'db' | 'claim') {
  activeTab.value = tab
  searchQuery.value = ''
  fetchData()
}

async function fetchData(page = 1) {
  if (activeTab.value === 'db') {
    await store.loadAssignments({
      search: searchQuery.value || undefined,
      page,
      ...sortParams(),
    })
  } else {
    await store.loadClaimAssignments({
      search: searchQuery.value || undefined,
      page,
      ...sortParams(),
    })
  }
}

function handleSort(field: string) {
  toggleSort(field)
  fetchData()
}

function goToPage(page: number) {
  fetchData(page)
}

function rowNum(index: number, pag?: { current_page: number; per_page: number } | null): number {
  return ((pag?.current_page ?? 1) - 1) * (pag?.per_page ?? 15) + index + 1
}

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    pending: '대기',
    assigned: '배정완료',
    completed: '처리완료',
    cancelled: '취소',
  }
  return map[status] || status
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    assigned: 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
  }
  return map[status] || 'bg-gray-100 text-gray-800'
}

async function handleDelete(assignment: Assignment) {
  const customerName = assignment.customer?.name || '해당 고객'
  if (!confirm(`"${customerName}"의 배분을 삭제하시겠습니까?\n담당 설계사 배정이 해제됩니다.`)) {
    return
  }

  try {
    await store.deleteAssignment(assignment.assignment_id)
    alert('배분이 삭제되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(() => {
  fetchData()
})
</script>
