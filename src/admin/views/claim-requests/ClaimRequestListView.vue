<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">청구 신청 관리</h1>

    <div class="mb-4 flex flex-wrap gap-3">
      <input v-model="filters.search" type="text" placeholder="이름 또는 전화번호 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch" />
      <select v-model="filters.status" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchData()">
        <option value="">전체 상태</option>
        <option value="pending">대기</option>
        <option value="assigned">배정됨</option>
        <option value="completed">완료</option>
        <option value="cancelled">취소</option>
      </select>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">이름</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">전화번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">메모</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">첨부파일</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">담당 설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">접수일</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase">처리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="item in requests" :key="item.request_id" class="hover:bg-[#FAFAFA] transition-colors cursor-pointer" @click="openDetail(item)">
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#FF7B22]">{{ item.request_id }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ item.name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555]">{{ item.phone }}</td>
            <td class="px-4 lg:px-6 py-4 text-[13px] text-[#555] hidden md:table-cell max-w-[150px] truncate">{{ item.memo || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden sm:table-cell">{{ item.files?.length || 0 }}건</td>
            <td class="px-4 lg:px-6 py-4">
              <span :class="getStatusClass(item.status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ getStatusLabel(item.status) }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden md:table-cell">{{ item.assigned_agent?.name || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#999] hidden sm:table-cell">{{ formatDate(item.created_at ?? '') }}</td>
            <td class="px-4 lg:px-6 py-4 text-right" @click.stop>
              <button @click="openDetail(item)" class="px-3 py-1.5 text-white rounded-[8px] text-[13px] font-medium"
                :class="item.status === 'pending' ? 'bg-[#FF7B22] hover:bg-[#E66A1A]' : 'bg-[#888] hover:bg-[#666]'">
                {{ item.status === 'pending' ? '배정' : '보기' }}
              </button>
            </td>
          </tr>
          <tr v-if="requests.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">청구 신청 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <!-- 페이징 -->
      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex items-center justify-center gap-1">
          <button @click="fetchData(1)" :disabled="pagination.current_page === 1"
            class="px-2 py-1 rounded-[6px] text-[13px] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed">
            &laquo;
          </button>
          <button @click="fetchData(pagination.current_page - 1)" :disabled="pagination.current_page === 1"
            class="px-2 py-1 rounded-[6px] text-[13px] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed">
            &lsaquo;
          </button>
          <template v-for="page in visiblePages" :key="page">
            <span v-if="page === '...'" class="px-2 py-1 text-[13px] text-[#999]">...</span>
            <button v-else @click="fetchData(page as number)"
              :class="['px-3 py-1 rounded-[8px] text-[13px]', page === pagination.current_page ? 'bg-[#FF7B22] text-white font-medium' : 'text-[#555] hover:bg-[#FFF3ED]']">
              {{ page }}
            </button>
          </template>
          <button @click="fetchData(pagination.current_page + 1)" :disabled="pagination.current_page === pagination.last_page"
            class="px-2 py-1 rounded-[6px] text-[13px] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed">
            &rsaquo;
          </button>
          <button @click="fetchData(pagination.last_page)" :disabled="pagination.current_page === pagination.last_page"
            class="px-2 py-1 rounded-[6px] text-[13px] text-[#555] hover:bg-[#F0F0F0] disabled:opacity-30 disabled:cursor-not-allowed">
            &raquo;
          </button>
        </div>
        <p class="text-center text-[12px] text-[#999] mt-2">
          총 {{ pagination.total }}건 ({{ pagination.current_page }}/{{ pagination.last_page }} 페이지)
        </p>
      </div>
    </div>

    <!-- 상세/배정 모달 -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="modalOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[640px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">청구 신청 상세 <span class="text-[14px] font-normal text-[#888]">#{{ activeItem?.request_id }}</span></h2>
          <button @click="modalOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div v-if="activeItem" class="px-6 py-5 space-y-4 text-[14px]">
          <!-- 기본 정보 -->
          <div class="grid grid-cols-2 gap-3">
            <div>
              <p class="text-[12px] text-[#888] mb-1">이름</p>
              <p class="text-[#222] font-medium">{{ activeItem.name }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">전화번호</p>
              <p class="text-[#222]">{{ activeItem.phone }}</p>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">상태</p>
              <span :class="getStatusClass(activeItem.status)" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ getStatusLabel(activeItem.status) }}
              </span>
            </div>
            <div>
              <p class="text-[12px] text-[#888] mb-1">접수일</p>
              <p class="text-[#222]">{{ formatDateTime(activeItem.created_at ?? '') }}</p>
            </div>
            <div v-if="activeItem.assigned_agent">
              <p class="text-[12px] text-[#888] mb-1">담당 설계사</p>
              <p class="text-[#222]">{{ activeItem.assigned_agent.name }}</p>
            </div>
          </div>

          <!-- 메모 -->
          <div v-if="activeItem.memo" class="bg-[#F8F8F8] rounded-[10px] p-4">
            <p class="text-[12px] text-[#888] mb-1">메모</p>
            <p class="text-[#333] whitespace-pre-wrap">{{ activeItem.memo }}</p>
          </div>

          <!-- 첨부파일 -->
          <div v-if="activeItem.files && activeItem.files.length > 0">
            <p class="text-[12px] text-[#888] mb-2">첨부파일 ({{ activeItem.files.length }}건)</p>
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
              <div v-for="f in activeItem.files" :key="f.file_id"
                class="border border-[#E8E8E8] rounded-[10px] overflow-hidden group cursor-pointer"
                @click="isImageFile(f.file_name) ? openViewer(f) : downloadFile(f)">
                <!-- 이미지 미리보기 -->
                <div v-if="isImageFile(f.file_name) && f.file_download_url" class="aspect-square bg-[#F0F0F0] relative overflow-hidden">
                  <img :src="f.file_download_url" :alt="f.file_name || '첨부 이미지'"
                    class="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <svg class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-lg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                </div>
                <!-- 일반 파일 아이콘 -->
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

          <!-- 설계사 배정/변경 -->
          <div v-if="activeItem.status === 'pending' || activeItem.status === 'assigned'" class="border-t border-[#F0F0F0] pt-4">
            <h3 class="text-[15px] font-semibold text-[#222] mb-3">
              {{ activeItem.status === 'assigned' ? '담당 설계사 변경' : '설계사 배정' }}
            </h3>
            <p v-if="activeItem.assigned_agent?.name" class="text-[13px] text-[#666] mb-2">
              현재: <span class="font-medium text-[#333]">{{ activeItem.assigned_agent.name }} ({{ activeItem.assigned_agent_id }})</span>
            </p>
            <div class="flex gap-2">
              <select v-model="selectedAgentId" class="flex-1 px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]">
                <option value="">설계사 선택</option>
                <option v-for="a in agents" :key="a.agent_id" :value="a.agent_id">{{ a.name }} ({{ a.agent_id }})</option>
              </select>
              <button @click="submitAssign" :disabled="!selectedAgentId || submitting"
                class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 hover:bg-[#E66A1A]">
                {{ submitting ? '처리 중...' : activeItem.status === 'assigned' ? '변경' : '배정' }}
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end">
          <button @click="modalOpen = false" class="px-4 py-2 text-[#555] text-[14px] hover:text-[#222]">닫기</button>
        </div>
      </div>
    </div>

    <!-- 이미지 뷰어 -->
    <div v-if="viewerOpen" class="fixed inset-0 z-[60] bg-black/80 flex items-center justify-center" @click.self="viewerOpen = false">
      <button @click="viewerOpen = false" class="absolute top-4 right-4 text-white/80 hover:text-white text-[32px] z-10">&times;</button>
      <!-- 이전/다음 버튼 -->
      <button v-if="imageFiles.length > 1" @click="prevImage"
        class="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[20px]">
        &lsaquo;
      </button>
      <button v-if="imageFiles.length > 1" @click="nextImage"
        class="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 text-white flex items-center justify-center text-[20px]">
        &rsaquo;
      </button>
      <img v-if="viewerFile?.file_download_url" :src="viewerFile.file_download_url" :alt="viewerFile.file_name || ''"
        class="max-w-[90vw] max-h-[85vh] object-contain rounded-lg shadow-2xl" />
      <div class="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/80 text-[13px] bg-black/40 px-3 py-1 rounded-full">
        {{ viewerFile?.file_name || '이미지' }}
        <span v-if="imageFiles.length > 1" class="ml-2">{{ viewerIndex + 1 }} / {{ imageFiles.length }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { fetchAdminClaimRequests, assignClaimRequest, fetchAgents } from '../../services/adminApi'
import type { AdminClaimRequest, AdminClaimRequestFile, AdminAgent, LaravelPagination } from '../../types'

const requests = ref<AdminClaimRequest[]>([])
const pagination = ref<Omit<LaravelPagination<AdminClaimRequest>, 'data'> | null>(null)
const loading = ref(false)
const filters = reactive({ search: '', status: '' })
let searchTimeout: ReturnType<typeof setTimeout>

const modalOpen = ref(false)
const activeItem = ref<AdminClaimRequest | null>(null)
const agents = ref<AdminAgent[]>([])
const selectedAgentId = ref('')
const submitting = ref(false)

// 이미지 뷰어
const viewerOpen = ref(false)
const viewerFile = ref<AdminClaimRequestFile | null>(null)
const viewerIndex = ref(0)

const imageFiles = computed(() =>
  activeItem.value?.files?.filter(f => isImageFile(f.file_name)) ?? []
)

const visiblePages = computed((): (number | '...')[] => {
  if (!pagination.value) return []
  const current = pagination.value.current_page
  const last = pagination.value.last_page
  if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1)

  const pages: (number | '...')[] = [1]
  const start = Math.max(2, current - 1)
  const end = Math.min(last - 1, current + 1)

  if (start > 2) pages.push('...')
  for (let i = start; i <= end; i++) pages.push(i)
  if (end < last - 1) pages.push('...')
  pages.push(last)
  return pages
})

function debouncedSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => fetchData(), 300) }

async function fetchData(page = 1) {
  loading.value = true
  try {
    const res = await fetchAdminClaimRequests({ search: filters.search || undefined, status: filters.status || undefined, page })
    const { data, ...pag } = res.data.data
    requests.value = data
    pagination.value = pag
  } finally { loading.value = false }
}

function formatDate(d: string) { return d ? new Date(d).toLocaleDateString('ko-KR') : '-' }
function formatDateTime(d: string) {
  if (!d) return '-'
  const dt = new Date(d)
  return `${dt.toLocaleDateString('ko-KR')} ${dt.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}`
}

function getStatusLabel(s: string) {
  const m: Record<string, string> = { pending: '대기', assigned: '배정됨', completed: '완료', cancelled: '취소' }
  return m[s] || s
}

function getStatusClass(s: string) {
  const m: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', assigned: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-gray-100 text-gray-800' }
  return m[s] || 'bg-gray-100 text-gray-800'
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

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function openViewer(file: AdminClaimRequestFile) {
  viewerFile.value = file
  viewerIndex.value = imageFiles.value.findIndex(f => f.file_id === file.file_id)
  if (viewerIndex.value < 0) viewerIndex.value = 0
  viewerOpen.value = true
}

function prevImage() {
  const idx = (viewerIndex.value - 1 + imageFiles.value.length) % imageFiles.value.length
  const file = imageFiles.value[idx]
  if (file) {
    viewerIndex.value = idx
    viewerFile.value = file
  }
}

function nextImage() {
  const idx = (viewerIndex.value + 1) % imageFiles.value.length
  const file = imageFiles.value[idx]
  if (file) {
    viewerIndex.value = idx
    viewerFile.value = file
  }
}

function downloadFile(file: AdminClaimRequestFile) {
  if (file.file_download_url) {
    window.open(file.file_download_url, '_blank')
  }
}

async function openDetail(item: AdminClaimRequest) {
  activeItem.value = item
  selectedAgentId.value = item.assigned_agent_id || ''
  modalOpen.value = true
  if (agents.value.length === 0) {
    try { const res = await fetchAgents({ per_page: 200 }); agents.value = res.data.data.data ?? [] } catch { /* ignore */ }
  }
}

async function submitAssign() {
  if (!activeItem.value || !selectedAgentId.value || submitting.value) return
  submitting.value = true
  try {
    const isReassign = activeItem.value.status === 'assigned'
    await assignClaimRequest(activeItem.value.request_id, selectedAgentId.value)
    alert(isReassign ? '담당 설계사가 변경되었습니다.' : '설계사가 배정되었습니다.')
    modalOpen.value = false
    fetchData(pagination.value?.current_page ?? 1)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '배정에 실패했습니다.')
  } finally { submitting.value = false }
}

onMounted(() => fetchData())
</script>
