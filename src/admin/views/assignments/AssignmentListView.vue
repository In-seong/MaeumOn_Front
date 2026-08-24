<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">DB 배분 관리</h1>
      <div class="flex gap-2">
        <router-link
          to="/assignments/create"
          class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
        >
          개인 배분 등록
        </router-link>
        <router-link
          to="/assignments/corporate-create"
          class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#2563EB] text-white rounded-[12px] hover:bg-[#1D4ED8] transition-colors text-[13px] lg:text-[14px] font-medium"
        >
          기업용 배분 등록
        </router-link>
      </div>
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
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">구분</th>
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
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="openClaimDetail(item)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index, store.claimPagination) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">
              {{ item.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap hidden sm:table-cell">
              <span
                :class="(item as any).source_type === 'resident' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >
                {{ (item as any).source_type === 'resident' ? '상주' : '배분' }}
              </span>
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
            <td colspan="9" class="px-6 py-10 text-center text-[#999]">
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

    <!-- 청구 배정 상세 모달 -->
    <div v-if="claimDetailOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="claimDetailOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">청구 배정 상세</h2>
          <button @click="claimDetailOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div v-if="claimDetailItem" class="px-6 py-5 space-y-4 text-[14px]">
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-[12px] text-[#888] mb-1">이름</p>
              <p class="text-[#222] font-medium">{{ claimDetailItem.name }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">전화번호</p>
              <p class="text-[#222]">{{ formatPhone(claimDetailItem.phone) }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">구분</p>
              <span
                :class="(claimDetailItem as any).source_type === 'resident' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >
                {{ (claimDetailItem as any).source_type === 'resident' ? '상주' : '배분' }}
              </span>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">상태</p>
              <span :class="statusClass(claimDetailItem.status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ statusLabel(claimDetailItem.status) }}
              </span>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">배정 설계사</p>
              <p class="text-[#222]">{{ claimDetailItem.assigned_agent?.name || '-' }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">병원</p>
              <p class="text-[#222]">{{ (claimDetailItem as any).hospital?.hospital_name || '-' }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">배정일</p>
              <p class="text-[#222]">{{ formatDate(claimDetailItem.updated_at) }}</p>
            </div>
          </div>

          <div v-if="claimDetailItem.memo" class="bg-[#F8F8F8] rounded-[10px] p-4">
            <p class="text-[12px] text-[#888] mb-1">메모</p>
            <p class="text-[#333] whitespace-pre-wrap">{{ claimDetailItem.memo }}</p>
          </div>

          <!-- 첨부파일 -->
          <div v-if="claimDetailItem.files && claimDetailItem.files.length > 0">
            <p class="text-[12px] text-[#888] mb-2">첨부파일 ({{ claimDetailItem.files.length }}건)</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="f in claimDetailItem.files" :key="f.file_id"
                class="border border-[#E8E8E8] rounded-[10px] overflow-hidden group cursor-pointer"
                @click="isImageFile(f.file_name) ? openImageViewer(f) : openFileDownload(f)">
                <div v-if="isImageFile(f.file_name) && f.file_download_url" class="aspect-square bg-[#F0F0F0] relative overflow-hidden">
                  <img :src="f.file_download_url" :alt="f.file_name || '첨부 이미지'"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <div v-else class="aspect-square bg-[#F8F8F8] flex flex-col items-center justify-center gap-2">
                  <svg class="w-10 h-10 text-[#BDBDBD]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <span class="text-[11px] text-[#999]">{{ getFileExt(f.file_name) }}</span>
                </div>
                <div class="px-2 py-1.5 border-t border-[#F0F0F0]">
                  <p class="text-[11px] text-[#555] truncate">{{ f.file_name || '파일' }}</p>
                  <p v-if="f.file_size" class="text-[10px] text-[#999]">{{ formatFileSize(f.file_size) }}</p>
                </div>
              </div>
            </div>
          </div>
          <div v-else class="bg-[#F8F8F8] rounded-[10px] p-4 text-center text-[13px] text-[#999]">
            첨부파일이 없습니다.
          </div>
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end">
          <button @click="claimDetailOpen = false" class="px-4 py-2 text-[#555] text-[14px] hover:text-[#222]">닫기</button>
        </div>
      </div>
    </div>

    <!-- 이미지 뷰어 -->
    <div v-if="imageViewerOpen" class="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center" @click.self="imageViewerOpen = false">
      <button @click="imageViewerOpen = false" class="absolute top-4 right-4 text-white/80 hover:text-white text-[32px] z-10">&times;</button>
      <button v-if="claimImageFiles.length > 1" @click="prevClaimImage"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[20px]">
        &lsaquo;
      </button>
      <button v-if="claimImageFiles.length > 1" @click="nextClaimImage"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[20px]">
        &rsaquo;
      </button>
      <img v-if="currentViewerFile?.file_download_url" :src="currentViewerFile.file_download_url" :alt="currentViewerFile.file_name || ''"
        class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-[13px] bg-black/40 px-3 py-1 rounded-full">
        {{ currentViewerFile?.file_name || '이미지' }}
        <span v-if="claimImageFiles.length > 1" class="ml-2">{{ imageViewerIndex + 1 }} / {{ claimImageFiles.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useAssignmentStore } from '../../stores/assignmentStore'
import { useBranchStore } from '../../stores/branchStore'
import { useSortable } from '../../composables/useSortable'
import type { Assignment, AdminClaimRequest, AdminClaimRequestFile } from '../../types'
import Pagination from '../../components/Pagination.vue'

const store = useAssignmentStore()
const branchStore = useBranchStore()
const searchQuery = ref('')
const activeTab = ref<'db' | 'claim'>('db')
const { toggleSort, sortParams, sortIcon } = useSortable()

// 청구 배정 상세 모달
const claimDetailOpen = ref(false)
const claimDetailItem = ref<AdminClaimRequest | null>(null)

// 이미지 뷰어
const imageViewerOpen = ref(false)
const imageViewerIndex = ref(0)

const claimImageFiles = computed(() =>
  claimDetailItem.value?.files?.filter(f => isImageFile(f.file_name)) ?? []
)

const currentViewerFile = computed(() => {
  const file = claimImageFiles.value[imageViewerIndex.value]
  return file ?? null
})

function openClaimDetail(item: AdminClaimRequest) {
  claimDetailItem.value = item
  claimDetailOpen.value = true
}

function isImageFile(name?: string): boolean {
  if (!name) return false
  return /\.(jpg|jpeg|png|gif|webp|bmp|svg)$/i.test(name)
}

function getFileExt(name?: string): string {
  if (!name) return 'FILE'
  const ext = name.split('.').pop()
  return ext ? ext.toUpperCase() : 'FILE'
}

function formatFileSize(bytes?: number): string {
  if (!bytes) return ''
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function openImageViewer(file: AdminClaimRequestFile) {
  imageViewerIndex.value = claimImageFiles.value.findIndex(f => f.file_id === file.file_id)
  if (imageViewerIndex.value < 0) imageViewerIndex.value = 0
  imageViewerOpen.value = true
}

function openFileDownload(file: AdminClaimRequestFile) {
  if (file.file_download_url) {
    window.open(file.file_download_url, '_blank')
  }
}

function prevClaimImage() {
  imageViewerIndex.value = (imageViewerIndex.value - 1 + claimImageFiles.value.length) % claimImageFiles.value.length
}

function nextClaimImage() {
  imageViewerIndex.value = (imageViewerIndex.value + 1) % claimImageFiles.value.length
}

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
  const bp = branchStore.getBranchParam()
  if (activeTab.value === 'db') {
    await store.loadAssignments({
      search: searchQuery.value || undefined,
      page,
      ...sortParams(),
      ...bp,
    })
  } else {
    await store.loadClaimAssignments({
      search: searchQuery.value || undefined,
      page,
      per_page: 10,
      ...sortParams(),
      ...bp,
    })
  }
}

watch(() => branchStore.selectedBranchId, () => fetchData())

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
