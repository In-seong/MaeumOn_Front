<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">CODEF API 사용 로그</h1>

    <!-- 월 필터 -->
    <div class="mb-4">
      <input v-model="month" type="month" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchSummary" />
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <!-- 설계사별 요약 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">보험</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">진료</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">검진</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">건강나이</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">성공</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">실패</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase font-bold">총 건수</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="(agent, index) in summary" :key="agent.agent_id" class="hover:bg-[#FFF8F3] transition-colors cursor-pointer" @click="openDetail(agent)">
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ agent.agent_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center">
              <span v-if="agent.insurance_count > 0" class="px-2 py-0.5 bg-blue-50 text-blue-600 text-[12px] font-medium rounded-full">{{ agent.insurance_count }}</span>
              <span v-else class="text-[#ccc]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center">
              <span v-if="agent.medical_count > 0" class="px-2 py-0.5 bg-purple-50 text-purple-600 text-[12px] font-medium rounded-full">{{ agent.medical_count }}</span>
              <span v-else class="text-[#ccc]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center">
              <span v-if="agent.checkup_count > 0" class="px-2 py-0.5 bg-green-50 text-green-600 text-[12px] font-medium rounded-full">{{ agent.checkup_count }}</span>
              <span v-else class="text-[#ccc]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center">
              <span v-if="agent.health_age_count > 0" class="px-2 py-0.5 bg-orange-50 text-orange-600 text-[12px] font-medium rounded-full">{{ agent.health_age_count }}</span>
              <span v-else class="text-[#ccc]">-</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-green-600 font-medium">{{ agent.success_count }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center">
              <span :class="agent.failed_count > 0 ? 'text-red-500 font-medium' : 'text-[#ccc]'">{{ agent.failed_count || '-' }}</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[15px] text-center font-bold text-[#333]">{{ agent.total_count }}건</td>
          </tr>
          <tr v-if="summary.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">해당 월에 API 사용 기록이 없습니다.</td>
          </tr>
        </tbody>
      </table>
      <div v-if="summary.length > 0" class="px-6 py-3 border-t border-[#F0F0F0] text-right text-[14px] text-[#999]">
        전체 합계: <span class="font-bold text-[#333]">{{ totalAll }}건</span>
      </div>
    </div>

    <!-- ===== 상세 모달 ===== -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedAgent" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="selectedAgent = null"></div>
          <div class="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[1100px] max-h-[85vh] flex flex-col">
            <!-- 모달 헤더 -->
            <div class="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <div>
                <h2 class="text-[18px] font-bold text-[#333]">{{ selectedAgent.agent_name }} — API 사용 상세</h2>
                <p class="text-[13px] text-[#999] mt-0.5">{{ month || '전체 기간' }} · 총 {{ detailPagination?.total ?? 0 }}건</p>
              </div>
              <button @click="selectedAgent = null" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                <span class="material-symbols-outlined text-[22px] text-[#999]">close</span>
              </button>
            </div>

            <!-- 모달 필터 -->
            <div class="px-6 py-3 border-b border-[#F5F5F5] flex flex-wrap gap-3">
              <select v-model="detailFilters.api_type" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]" @change="fetchDetail()">
                <option value="">전체 API</option>
                <option value="insurance">보험</option>
                <option value="medical">진료</option>
                <option value="checkup">검진</option>
                <option value="health_age">건강나이</option>
              </select>
              <select v-model="detailFilters.status" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[13px] text-[#333]" @change="fetchDetail()">
                <option value="">전체 상태</option>
                <option value="success">성공</option>
                <option value="failed">실패</option>
                <option value="two_way">2-Way 대기</option>
              </select>
            </div>

            <!-- 모달 테이블 -->
            <div class="flex-1 overflow-auto">
              <div v-if="detailLoading" class="text-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
              </div>
              <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
                <thead class="bg-[#FAFAFA] sticky top-0">
                  <tr>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">고객</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">API 종류</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">액션</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">결과</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">에러</th>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">일시</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F0F0F0]">
                  <tr v-for="(log, index) in detailLogs" :key="log.log_id" class="hover:bg-[#FAFAFA] transition-colors">
                    <td class="px-5 py-3.5 text-[13px] text-[#999]">{{ detailRowNum(index) }}</td>
                    <td class="px-5 py-3.5 text-[13px] text-[#555]">{{ log.customer?.name || '-' }}</td>
                    <td class="px-5 py-3.5">
                      <span :class="typeClass(log.api_type)" class="px-2 py-0.5 text-[11px] font-medium rounded-full">{{ typeLabel(log.api_type) }}</span>
                    </td>
                    <td class="px-5 py-3.5 text-[13px] text-[#555]">{{ actionLabel(log.api_action) }}</td>
                    <td class="px-5 py-3.5">
                      <span :class="statusClass(log.status)" class="px-2 py-0.5 text-[11px] font-medium rounded-full">{{ statusLabel(log.status) }}</span>
                    </td>
                    <td class="px-5 py-3.5 text-[13px] text-[#555]">{{ log.result_count ?? 0 }}건</td>
                    <td class="px-5 py-3.5 text-[12px] text-[#999] max-w-[180px] truncate">{{ log.error_message || '-' }}</td>
                    <td class="px-5 py-3.5 text-[12px] text-[#999] whitespace-nowrap">{{ formatDateTime(log.created_at) }}</td>
                  </tr>
                  <tr v-if="detailLogs.length === 0">
                    <td colspan="8" class="px-5 py-10 text-center text-[#999]">로그가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- 모달 페이지네이션 -->
            <div v-if="detailPagination && detailPagination.last_page > 1" class="border-t border-[#F0F0F0]">
              <Pagination :current-page="detailPagination.current_page" :last-page="detailPagination.last_page" @change="fetchDetail" />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@shared/api'
import Pagination from '../../components/Pagination.vue'

interface AgentSummary {
  agent_id: string
  agent_name: string
  insurance_count: number
  medical_count: number
  checkup_count: number
  health_age_count: number
  success_count: number
  failed_count: number
  total_count: number
}

interface LogItem {
  log_id: number
  agent_id: string
  customer_id: string
  customer?: { customer_id: string; name: string; phone: string }
  api_type: string
  api_action: string
  status: string
  result_count: number | null
  error_message: string | null
  created_at: string
}

const loading = ref(false)
const detailLoading = ref(false)
const summary = ref<AgentSummary[]>([])
const totalAll = ref(0)
const selectedAgent = ref<AgentSummary | null>(null)
const detailLogs = ref<LogItem[]>([])
const detailPagination = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)

const now = new Date()
const month = ref(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`)

const detailFilters = ref({ api_type: '', status: '' })

function typeLabel(t: string) {
  const m: Record<string, string> = { insurance: '보험', medical: '진료', checkup: '검진', health_age: '건강나이' }
  return m[t] || t
}

function typeClass(t: string) {
  const m: Record<string, string> = {
    insurance: 'bg-blue-50 text-blue-600',
    medical: 'bg-purple-50 text-purple-600',
    checkup: 'bg-green-50 text-green-600',
    health_age: 'bg-orange-50 text-orange-600',
  }
  return m[t] || 'bg-gray-100 text-[#999]'
}

function actionLabel(a: string) {
  return a === 'fetch' ? '조회' : a === 'confirm' ? '인증완료' : a
}

function statusLabel(s: string) {
  const m: Record<string, string> = { success: '성공', failed: '실패', two_way: '2-Way' }
  return m[s] || s
}

function statusClass(s: string) {
  const m: Record<string, string> = {
    success: 'bg-green-50 text-green-600',
    failed: 'bg-red-50 text-red-600',
    two_way: 'bg-yellow-50 text-yellow-700',
  }
  return m[s] || 'bg-gray-100 text-[#999]'
}

function formatDateTime(dt: string) {
  if (!dt) return '-'
  const d = new Date(dt)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}.${pad(d.getMonth() + 1)}.${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function detailRowNum(index: number) {
  if (!detailPagination.value) return index + 1
  return ((detailPagination.value.current_page - 1) * detailPagination.value.per_page) + index + 1
}

async function fetchSummary() {
  loading.value = true
  try {
    const params: Record<string, string> = {}
    if (month.value) params.month = month.value
    const res = await api.get('/admin/codef-billing/summary', { params })
    summary.value = res.data.data.agents
    totalAll.value = res.data.data.total
  } catch {
    summary.value = []
    totalAll.value = 0
  } finally {
    loading.value = false
  }
}

function openDetail(agent: AgentSummary) {
  selectedAgent.value = agent
  detailFilters.value = { api_type: '', status: '' }
  fetchDetail()
}

async function fetchDetail(page = 1) {
  if (!selectedAgent.value) return
  detailLoading.value = true
  try {
    const params: Record<string, string | number> = {
      agent_id: selectedAgent.value.agent_id,
      page,
      per_page: 30,
    }
    if (month.value) params.month = month.value
    if (detailFilters.value.api_type) params.api_type = detailFilters.value.api_type
    if (detailFilters.value.status) params.status = detailFilters.value.status

    const res = await api.get('/admin/codef-billing/logs', { params })
    const data = res.data.data
    detailLogs.value = data.data
    detailPagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
    }
  } catch {
    detailLogs.value = []
  } finally {
    detailLoading.value = false
  }
}

onMounted(() => {
  fetchSummary()
})
</script>

<style scoped>
.modal-enter-active,
.modal-leave-active {
  transition: opacity 0.2s ease;
}
.modal-enter-active > div:last-child,
.modal-leave-active > div:last-child {
  transition: transform 0.2s ease;
}
.modal-enter-from,
.modal-leave-to {
  opacity: 0;
}
.modal-enter-from > div:last-child {
  transform: scale(0.95);
}
.modal-leave-to > div:last-child {
  transform: scale(0.95);
}
</style>
