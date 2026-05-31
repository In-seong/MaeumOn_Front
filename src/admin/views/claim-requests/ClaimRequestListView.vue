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
          <tr v-for="item in requests" :key="item.request_id" class="hover:bg-[#FAFAFA] transition-colors">
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
            <td class="px-4 lg:px-6 py-4 text-right">
              <button @click="openAssign(item)" class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#E66A1A]">
                {{ item.status === 'pending' ? '배정' : '보기' }}
              </button>
            </td>
          </tr>
          <tr v-if="requests.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">청구 신청 내역이 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button v-for="page in pagination.last_page" :key="page" @click="fetchData(page)"
            :class="['px-3 py-1 rounded-[8px] text-[14px]', page === pagination.current_page ? 'bg-[#FF7B22] text-white' : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED]']">
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- 배정 모달 -->
    <div v-if="modalOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="modalOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[540px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">청구 신청 상세 <span class="text-[14px] font-normal text-[#888]">#{{ activeItem?.request_id }}</span></h2>
          <button @click="modalOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div v-if="activeItem" class="px-6 py-5 space-y-4 text-[14px]">
          <div class="flex"><span class="w-[90px] text-[#888]">이름</span><span class="text-[#222]">{{ activeItem.name }}</span></div>
          <div class="flex"><span class="w-[90px] text-[#888]">전화번호</span><span class="text-[#222]">{{ activeItem.phone }}</span></div>
          <div class="flex"><span class="w-[90px] text-[#888]">메모</span><span class="text-[#222]">{{ activeItem.memo || '-' }}</span></div>
          <div class="flex"><span class="w-[90px] text-[#888]">첨부파일</span><span class="text-[#222]">{{ activeItem.files?.length || 0 }}건</span></div>
          <div v-if="activeItem.files && activeItem.files.length > 0" class="space-y-1 pl-[90px]">
            <a v-for="f in activeItem.files" :key="f.file_id" :href="f.file_download_url" target="_blank" class="block text-[13px] text-[#FF7B22] hover:underline">
              {{ f.file_name || '파일 다운로드' }}
            </a>
          </div>

          <div v-if="activeItem.status === 'pending'" class="border-t border-[#F0F0F0] pt-4">
            <h3 class="text-[15px] font-semibold text-[#222] mb-3">설계사 배정</h3>
            <div class="flex gap-2">
              <select v-model="selectedAgentId" class="flex-1 px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]">
                <option value="">설계사 선택</option>
                <option v-for="a in agents" :key="a.agent_id" :value="a.agent_id">{{ a.name }} ({{ a.agent_id }})</option>
              </select>
              <button @click="submitAssign" :disabled="!selectedAgentId || submitting"
                class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 hover:bg-[#E66A1A]">
                {{ submitting ? '처리 중...' : '배정' }}
              </button>
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end">
          <button @click="modalOpen = false" class="px-4 py-2 text-[#555] text-[14px]">닫기</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchAdminClaimRequests, assignClaimRequest, fetchAgents } from '../../services/adminApi'
import type { AdminClaimRequest, AdminAgent, LaravelPagination } from '../../types'

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

function getStatusLabel(s: string) {
  const m: Record<string, string> = { pending: '대기', assigned: '배정됨', completed: '완료', cancelled: '취소' }
  return m[s] || s
}

function getStatusClass(s: string) {
  const m: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', assigned: 'bg-blue-100 text-blue-800', completed: 'bg-green-100 text-green-800', cancelled: 'bg-gray-100 text-gray-800' }
  return m[s] || 'bg-gray-100 text-gray-800'
}

async function openAssign(item: AdminClaimRequest) {
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
    await assignClaimRequest(activeItem.value.request_id, selectedAgentId.value)
    alert('설계사가 배정되었습니다.')
    modalOpen.value = false
    fetchData(pagination.value?.current_page ?? 1)
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '배정에 실패했습니다.')
  } finally { submitting.value = false }
}

onMounted(() => fetchData())
</script>
