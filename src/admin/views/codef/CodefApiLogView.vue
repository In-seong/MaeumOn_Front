<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">CODEF API 사용 로그</h1>

    <!-- 필터 -->
    <div class="mb-4 flex flex-wrap items-center gap-3">
      <input v-model="month" type="month" class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]" @change="fetchSummary" />
      <div class="relative">
        <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#BBB]">search</span>
        <input v-model="searchName" type="text" placeholder="설계사 이름 검색" class="pl-9 pr-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] w-[200px]" />
      </div>
      <button v-if="filteredSummary.length > 0" @click="printInvoiceBatch" class="ml-auto flex items-center gap-1.5 px-4 py-2.5 bg-[#333] text-white text-[13px] font-medium rounded-[12px] hover:bg-[#555] transition-colors">
        <span class="material-symbols-outlined text-[18px]">print</span>
        월별 청구서 일괄 발행 ({{ filteredSummary.length }}명)
      </button>
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
          <tr v-for="(agent, index) in filteredSummary" :key="agent.agent_id" class="hover:bg-[#FFF8F3] transition-colors cursor-pointer" @click="openDetail(agent)">
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
          <tr v-if="filteredSummary.length === 0">
            <td colspan="9" class="px-4 lg:px-6 py-10 text-center text-[#999]">해당 월에 API 사용 기록이 없습니다.</td>
          </tr>
        </tbody>
      </table>
      <div v-if="filteredSummary.length > 0" class="px-6 py-3 border-t border-[#F0F0F0] text-right text-[14px] text-[#999]">
        전체 합계: <span class="font-bold text-[#333]">{{ filteredTotal }}건</span> · 총 사용료: <span class="font-bold text-[#FF7B22]">{{ (filteredTotal * 100).toLocaleString() }}원</span>
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
                <p class="text-[13px] text-[#999] mt-0.5">{{ month || '전체 기간' }} · 총 {{ detailPagination?.total ?? 0 }}건 · 사용료 <span class="font-semibold text-[#FF7B22]">{{ ((detailPagination?.total ?? 0) * 100).toLocaleString() }}원</span></p>
              </div>
              <button @click="selectedAgent = null" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                <span class="material-symbols-outlined text-[22px] text-[#999]">close</span>
              </button>
            </div>

            <!-- 모달 필터 -->
            <div class="px-6 py-3 border-b border-[#F5F5F5] flex flex-wrap items-center gap-3">
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
              <div class="ml-auto">
                <button @click="printInvoiceSingle(selectedAgent!)" class="flex items-center gap-1.5 px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E66A1A] transition-colors">
                  <span class="material-symbols-outlined text-[18px]">receipt_long</span>
                  청구서 발행
                </button>
              </div>
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
import { ref, computed, onMounted } from 'vue'
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
const searchName = ref('')

const filteredSummary = computed(() => {
  if (!searchName.value.trim()) return summary.value
  const keyword = searchName.value.trim().toLowerCase()
  return summary.value.filter(a => a.agent_name.toLowerCase().includes(keyword))
})

const filteredTotal = computed(() => filteredSummary.value.reduce((sum, a) => sum + a.total_count, 0))
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

function formatMonth(m: string) {
  const parts = m.split('-')
  const y = parts[0] ?? ''
  const mm = parts[1] ?? ''
  return `${y}년 ${parseInt(mm) || 0}월`
}

function todayString() {
  const d = new Date()
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}년 ${pad(d.getMonth() + 1)}월 ${pad(d.getDate())}일`
}

function buildInvoiceHtml(agent: AgentSummary): string {
  const items = [
    { label: '보험 조회', count: agent.insurance_count },
    { label: '진료 조회', count: agent.medical_count },
    { label: '검진 조회', count: agent.checkup_count },
    { label: '건강나이 조회', count: agent.health_age_count },
  ]
  const unitPrice = 100
  const rows = items.map(i => `
    <tr>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;">${i.label}</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:right;">${i.count.toLocaleString()}건</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:right;">${unitPrice.toLocaleString()}원</td>
      <td style="padding:10px 16px;border-bottom:1px solid #eee;text-align:right;font-weight:600;">${(i.count * unitPrice).toLocaleString()}원</td>
    </tr>
  `).join('')

  const total = agent.total_count * unitPrice

  return `
    <div style="max-width:680px;margin:0 auto;padding:48px 40px;font-family:'Pretendard','Apple SD Gothic Neo',sans-serif;color:#222;">
      <div style="text-align:center;margin-bottom:36px;">
        <h1 style="font-size:26px;font-weight:800;margin:0 0 6px;">API 사용료 청구서</h1>
        <p style="font-size:13px;color:#999;margin:0;">Invoice</p>
      </div>

      <div style="display:flex;justify-content:space-between;margin-bottom:28px;font-size:14px;">
        <div>
          <p style="margin:0 0 4px;color:#999;font-size:12px;">청구 대상</p>
          <p style="margin:0;font-size:18px;font-weight:700;">${agent.agent_name}</p>
        </div>
        <div style="text-align:right;">
          <p style="margin:0 0 4px;color:#999;font-size:12px;">서비스 기간</p>
          <p style="margin:0;font-weight:600;">${formatMonth(month.value)}</p>
          <p style="margin:4px 0 0;color:#999;font-size:12px;">발행일: ${todayString()}</p>
        </div>
      </div>

      <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:24px;">
        <thead>
          <tr style="background:#f8f8f8;">
            <th style="padding:10px 16px;text-align:left;font-weight:600;border-bottom:2px solid #ddd;">항목</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #ddd;">건수</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #ddd;">단가</th>
            <th style="padding:10px 16px;text-align:right;font-weight:600;border-bottom:2px solid #ddd;">금액</th>
          </tr>
        </thead>
        <tbody>
          ${rows}
        </tbody>
        <tfoot>
          <tr style="background:#FFF8F3;">
            <td style="padding:12px 16px;font-weight:700;border-top:2px solid #FF7B22;">합계</td>
            <td style="padding:12px 16px;text-align:right;font-weight:700;border-top:2px solid #FF7B22;">${agent.total_count.toLocaleString()}건</td>
            <td style="padding:12px 16px;border-top:2px solid #FF7B22;"></td>
            <td style="padding:12px 16px;text-align:right;font-weight:800;font-size:16px;color:#FF7B22;border-top:2px solid #FF7B22;">${total.toLocaleString()}원</td>
          </tr>
        </tfoot>
      </table>

      <div style="background:#f8f8f8;border-radius:8px;padding:16px 20px;font-size:13px;color:#666;margin-bottom:32px;">
        <p style="margin:0 0 4px;font-weight:600;color:#333;">비고</p>
        <p style="margin:0;">API 사용 건수 기준 과금 (건당 ${unitPrice.toLocaleString()}원)</p>
      </div>

      <div style="text-align:center;border-top:1px solid #eee;padding-top:24px;font-size:13px;color:#999;">
        <p style="margin:0;font-weight:600;color:#555;">보험ON (MaeumON)</p>
        <p style="margin:4px 0 0;">본 청구서는 전산 발행되었습니다.</p>
      </div>
    </div>
  `
}

function openPrintWindow(htmlContent: string) {
  const win = window.open('', '_blank')
  if (!win) return
  win.document.write(`<!DOCTYPE html><html><head><meta charset="utf-8"><title>청구서</title>
    <style>
      @page { size: A4; margin: 20mm; }
      body { margin:0; }
      .page-break { page-break-after: always; }
      .page-break:last-child { page-break-after: auto; }
      @media print {
        .no-print { display: none !important; }
      }
    </style>
  </head><body>
    <div class="no-print" style="text-align:center;padding:16px;background:#f5f5f5;font-family:sans-serif;">
      <button onclick="window.print()" style="padding:10px 28px;background:#FF7B22;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;margin-right:8px;">인쇄 / PDF 저장</button>
      <button onclick="window.close()" style="padding:10px 28px;background:#666;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;">닫기</button>
    </div>
    ${htmlContent}
  </body></html>`)
  win.document.close()
}

function printInvoiceSingle(agent: AgentSummary) {
  openPrintWindow(buildInvoiceHtml(agent))
}

function printInvoiceBatch() {
  const pages = filteredSummary.value
    .filter(a => a.total_count > 0)
    .map((a, i, arr) => {
      const html = buildInvoiceHtml(a)
      return i < arr.length - 1 ? `<div class="page-break">${html}</div>` : `<div>${html}</div>`
    })
    .join('')
  openPrintWindow(pages)
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
