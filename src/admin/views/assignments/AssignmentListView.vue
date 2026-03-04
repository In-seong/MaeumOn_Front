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

    <!-- 검색 -->
    <div class="mb-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="고객 이름으로 검색"
        class="w-full sm:max-w-[400px] px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객 전화번호</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배분 설계사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배분일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">비고</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="assignment in store.assignments"
            :key="assignment.assignment_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
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
            <td colspan="6" class="px-6 py-10 text-center text-[#999]">
              배분 이력이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="store.pagination && store.pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button
            v-for="page in store.pagination.last_page"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-[8px] text-[14px]',
              page === store.pagination.current_page
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
import { ref, onMounted } from 'vue'
import { useAssignmentStore } from '../../stores/assignmentStore'
import type { Assignment } from '../../types'

const store = useAssignmentStore()
const searchQuery = ref('')

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
}

async function fetchData(page = 1) {
  await store.loadAssignments({
    search: searchQuery.value || undefined,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
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
