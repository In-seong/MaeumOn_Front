<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">DB 배분</h1>
      <span class="text-[13px] text-[#888]">
        총 <span class="font-semibold text-[#FF7B22]">{{ store.total + store.claimAssignments.length }}</span>건
      </span>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto" />
      <p class="mt-2 text-[14px] text-[#999]">불러오는 중...</p>
    </div>

    <template v-else>
      <!-- 청구 배정 테이블 -->
      <div v-if="store.claimAssignments.length > 0" class="mb-6">
        <h2 class="text-[16px] font-semibold text-[#333] mb-3">청구 배정</h2>
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">병원</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">메모</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배정일</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-[#F0F0F0]">
              <tr
                v-for="(item, index) in store.claimAssignments"
                :key="'claim-' + item.request_id"
                class="hover:bg-[#FAFAFA] transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ index + 1 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.name }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ formatPhone(item.phone) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] hidden md:table-cell">{{ item.hospital?.hospital_name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span
                    :class="claimAssignStatusClass(item.status)"
                    class="px-2.5 py-1 text-[12px] font-medium rounded-full"
                  >
                    {{ claimAssignStatusLabel(item.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 text-[14px] text-[#666] max-w-[200px] truncate hidden lg:table-cell">{{ item.memo || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(item.created_at) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- DB 배분 테이블 -->
      <div>
        <h2 v-if="store.claimAssignments.length > 0" class="text-[16px] font-semibold text-[#333] mb-3">고객 배분</h2>
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">배분유형</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">메모</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">배분일</th>
                <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-[#F0F0F0]">
              <tr
                v-for="(item, index) in store.distributions"
                :key="item.assignment_id"
                class="hover:bg-[#FAFAFA] transition-colors"
              >
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.customer?.name || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ formatPhone(item.customer?.phone) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] hidden md:table-cell">{{ item.assignment_type || '-' }}</td>
                <td class="px-6 py-4 text-[14px] text-[#666] max-w-[200px] truncate hidden lg:table-cell">{{ item.notes || '-' }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(item.assignment_date ?? item.created_at) }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-right">
                  <button
                    class="text-[13px] text-[#FF7B22] font-medium hover:text-[#E56D1E] transition-colors"
                    @click="openEditForm(item.assignment_id, item.notes)"
                  >
                    메모 수정
                  </button>
                </td>
              </tr>
              <tr v-if="store.distributions.length === 0">
                <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
                  배분 내역이 없습니다
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

    <!-- 메모 수정 모달 -->
    <Teleport to="body">
      <div
        v-if="editingId !== null"
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
      >
        <div class="absolute inset-0 bg-black/30" @click="closeEditForm" />
        <div class="relative bg-white rounded-[16px] p-6 w-full max-w-[460px] z-10 shadow-xl">
          <h3 class="text-[16px] font-semibold text-[#333] mb-4">메모 수정</h3>
          <textarea
            v-model="editNotes"
            placeholder="메모를 입력하세요"
            class="w-full p-3 border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] resize-none transition-colors"
            rows="3"
          />
          <div class="flex gap-3 mt-4">
            <button
              class="flex-1 py-2.5 border border-[#E8E8E8] text-[#666] rounded-[12px] text-[14px] font-medium hover:bg-[#F8F8F8] transition-colors"
              @click="closeEditForm"
            >
              취소
            </button>
            <button
              class="flex-1 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] font-medium hover:bg-[#E56D1E] transition-colors disabled:opacity-50"
              :disabled="processing"
              @click="confirmEdit"
            >
              {{ processing ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useDbDistributionStore } from '../../stores/dbDistributionStore'

const store = useDbDistributionStore()

const editingId = ref<number | null>(null)
const editNotes = ref('')
const processing = ref(false)

onMounted(() => {
  store.loadDistributions()
})

function openEditForm(id: number, currentNotes?: string): void {
  editingId.value = id
  editNotes.value = currentNotes ?? ''
}

function closeEditForm(): void {
  editingId.value = null
  editNotes.value = ''
}

async function confirmEdit(): Promise<void> {
  if (editingId.value === null) return
  processing.value = true
  try {
    await store.process(editingId.value, { notes: editNotes.value })
    closeEditForm()
  } catch {
    // Error handled in store
  } finally {
    processing.value = false
  }
}

function goToPage(page: number): void {
  if (page < 1 || page > store.lastPage) return
  store.currentPage = page
  store.loadDistributions()
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

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return phone
}

function claimAssignStatusLabel(status?: string): string {
  const map: Record<string, string> = {
    pending: '대기',
    assigned: '배정',
    in_progress: '진행중',
    completed: '완료',
  }
  return status ? (map[status] ?? status) : '-'
}

function claimAssignStatusClass(status?: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
  }
  return status ? (map[status] ?? 'bg-gray-100 text-gray-600') : 'bg-gray-100 text-gray-600'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
