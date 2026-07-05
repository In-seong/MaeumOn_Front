<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">CODEF API 사용 로그</h1>

    <div class="mb-4 flex flex-wrap gap-3">
      <select v-model="filters.agent_id" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchData()">
        <option value="">전체 설계사</option>
        <option v-for="a in agents" :key="a.agent_id" :value="a.agent_id">{{ a.name }}</option>
      </select>
      <select v-model="filters.api_type" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchData()">
        <option value="">전체 API</option>
        <option value="insurance">보험</option>
        <option value="medical">진료</option>
        <option value="checkup">검진</option>
        <option value="health_age">건강나이</option>
      </select>
      <select v-model="filters.status" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchData()">
        <option value="">전체 상태</option>
        <option value="success">성공</option>
        <option value="failed">실패</option>
        <option value="two_way">2-Way 대기</option>
      </select>
      <input v-model="filters.month" type="month" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchData()" />
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">고객</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">API 종류</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">액션</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">결과</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden lg:table-cell">에러</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">일시</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="(log, index) in logs" :key="log.log_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ log.agent_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555]">{{ log.customer?.name || '-' }}</td>
            <td class="px-4 lg:px-6 py-4">
              <span :class="typeClass(log.api_type)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">{{ typeLabel(log.api_type) }}</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555]">{{ actionLabel(log.api_action) }}</td>
            <td class="px-4 lg:px-6 py-4">
              <span :class="statusClass(log.status)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">{{ statusLabel(log.status) }}</span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden md:table-cell">{{ log.result_count ?? 0 }}건</td>
            <td class="px-4 lg:px-6 py-4 text-[13px] text-[#999] hidden lg:table-cell max-w-[200px] truncate">{{ log.error_message || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 text-[13px] text-[#999] whitespace-nowrap">{{ formatDateTime(log.created_at) }}</td>
          </tr>
          <tr v-if="logs.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">로그가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <Pagination v-if="pagination" :current-page="pagination.current_page" :last-page="pagination.last_page" @change="fetchData" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import api from '@shared/api'
import Pagination from '../../components/Pagination.vue'

interface LogItem {
  log_id: number
  agent_id: string
  agent_name: string
  customer_id: string
  customer?: { customer_id: string; name: string; phone: string }
  api_type: string
  api_action: string
  status: string
  result_count: number | null
  error_message: string | null
  created_at: string
}

interface AgentOption {
  agent_id: string
  name: string
}

const loading = ref(false)
const logs = ref<LogItem[]>([])
const agents = ref<AgentOption[]>([])
const pagination = ref<{ current_page: number; last_page: number; per_page: number; total: number } | null>(null)

const filters = ref({
  agent_id: '',
  api_type: '',
  status: '',
  month: '',
})

function rowNum(index: number) {
  if (!pagination.value) return index + 1
  return ((pagination.value.current_page - 1) * pagination.value.per_page) + index + 1
}

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

async function fetchData(page = 1) {
  loading.value = true
  try {
    const params: Record<string, string | number> = { page, per_page: 30 }
    if (filters.value.agent_id) params.agent_id = filters.value.agent_id
    if (filters.value.api_type) params.api_type = filters.value.api_type
    if (filters.value.status) params.status = filters.value.status
    if (filters.value.month) params.month = filters.value.month

    const res = await api.get('/admin/codef-billing/logs', { params })
    const data = res.data.data
    logs.value = data.data
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
      per_page: data.per_page,
      total: data.total,
    }
  } catch {
    logs.value = []
  } finally {
    loading.value = false
  }
}

async function fetchAgents() {
  try {
    const res = await api.get('/admin/agents', { params: { per_page: 100 } })
    const data = res.data.data?.data || res.data.data || []
    agents.value = data.map((a: { agent_id: string; account?: { name?: string } }) => ({
      agent_id: a.agent_id,
      name: a.account?.name || a.agent_id,
    }))
  } catch {
    agents.value = []
  }
}

onMounted(() => {
  fetchAgents()
  fetchData()
})
</script>
