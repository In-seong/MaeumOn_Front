<template>
  <div class="p-4 lg:p-6">
    <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">실적 현황</h1>
        <button
          @click="downloadExcel"
          :disabled="excelLoading"
          class="w-9 h-9 flex items-center justify-center rounded-[10px] border border-[#E0E0E0] hover:bg-[#F8F8F8] hover:border-[#CCC] transition-colors disabled:opacity-50"
          title="엑셀 다운로드"
        >
          <svg v-if="!excelLoading" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
            <polyline points="7 10 12 15 17 10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
          </svg>
          <div v-else class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF7B22]"></div>
        </button>
      </div>

      <!-- 기간 선택 -->
      <div class="flex items-center gap-2">
        <input type="date" v-model="dateFrom" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <span class="text-[#999] text-[13px]">~</span>
        <input type="date" v-model="dateTo" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <button @click="onSearchDate" class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[13px] font-medium hover:bg-[#E56D1E] transition-colors">조회</button>
      </div>
    </div>

    <!-- 로딩 상태 (요약) -->
    <div v-if="summaryLoading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <template v-else>
      <!-- 요약 카드 (클릭 가능) -->
      <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4 mb-6">
        <div
          v-for="card in summaryCards"
          :key="card.label"
          :class="[
            'bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5 transition-all',
            card.detailType
              ? 'cursor-pointer hover:shadow-[0_0_16px_rgba(255,123,34,0.15)] hover:border-[#FF7B22] border border-transparent active:scale-[0.98]'
              : ''
          ]"
          @click="card.detailType ? openDetailModal(card) : undefined"
        >
          <div class="flex items-center justify-between mb-2">
            <p class="text-[13px] text-[#999]">{{ card.label }}</p>
            <span v-if="card.detailType" class="material-symbols-outlined text-[16px] text-[#CCC]">open_in_new</span>
          </div>
          <p class="text-[22px] font-bold text-[#333]">{{ card.value }}</p>
          <p v-if="card.unit" class="text-[12px] text-[#999] mt-1">{{ card.unit }}</p>
        </div>
      </div>

      <!-- 에러 상태 -->
      <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px] mb-4">
        {{ store.error }}
      </div>

      <!-- 설계사 실적 테이블 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <div class="px-4 lg:px-6 py-4 border-b border-[#F0F0F0]">
          <h2 class="text-[16px] font-bold text-[#333]">설계사별 실적</h2>
        </div>

        <!-- 테이블 로딩 -->
        <div v-if="tableLoading" class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
        </div>

        <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th
                v-for="col in columns"
                :key="col.key"
                @click="toggleSort(col.key)"
                :class="[
                  'px-6 py-3 text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333] transition-colors',
                  col.align === 'right' ? 'text-right' : 'text-left'
                ]"
              >
                {{ col.label }}
                <span v-if="sortField === col.key" class="ml-1">
                  {{ sortDirection === 'asc' ? '↑' : '↓' }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-[#F0F0F0]">
            <tr
              v-for="agent in sortedAgentPerformances"
              :key="agent.agent_id"
              class="hover:bg-[#FFF8F3] transition-colors cursor-pointer"
              @click="openAgentDetail(agent)"
            >
              <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ agent.agent_name }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.db_assigned_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.contract_count }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ formatAmount(agent.contract_amount) }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] text-right">{{ agent.consultation_count }}</td>
            </tr>
            <tr v-if="store.agentPerformances.length === 0">
              <td colspan="5" class="px-6 py-10 text-center text-[#999]">
                실적 데이터가 없습니다.
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
    </template>

    <!-- 설계사 상세 실적 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="selectedAgent" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="selectedAgent = null"></div>
          <div class="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[800px] max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <div>
                <h2 class="text-[18px] font-bold text-[#333]">{{ selectedAgent.agent_name }} — 월별 실적 추이</h2>
                <p class="text-[13px] text-[#999] mt-0.5">최근 12개월</p>
              </div>
              <button @click="selectedAgent = null" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                <span class="material-symbols-outlined text-[22px] text-[#999]">close</span>
              </button>
            </div>

            <div class="flex-1 overflow-auto">
              <div v-if="detailLoading" class="text-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
              </div>
              <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
                <thead class="bg-[#FAFAFA] sticky top-0">
                  <tr>
                    <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">기간</th>
                    <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">DB배분</th>
                    <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">계약 건수</th>
                    <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">계약 금액</th>
                    <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">상담 건수</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-[#F0F0F0]">
                  <tr v-for="perf in store.selectedAgentPerformance" :key="`${perf.year}-${perf.month}`" class="hover:bg-[#FAFAFA] transition-colors">
                    <td class="px-5 py-3.5 text-[14px] font-medium text-[#333]">{{ perf.year }}년 {{ perf.month }}월</td>
                    <td class="px-5 py-3.5 text-[14px] text-[#999] text-right">{{ perf.db_assigned_count }}</td>
                    <td class="px-5 py-3.5 text-[14px] text-[#999] text-right">{{ perf.contract_count }}</td>
                    <td class="px-5 py-3.5 text-[14px] text-[#999] text-right">{{ formatAmount(perf.contract_amount) }}</td>
                    <td class="px-5 py-3.5 text-[14px] text-[#999] text-right">{{ perf.consultation_count }}</td>
                  </tr>
                  <tr v-if="store.selectedAgentPerformance.length === 0">
                    <td colspan="5" class="px-5 py-10 text-center text-[#999]">실적 데이터가 없습니다.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- 카드 상세 내역 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="cardDetail.visible" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="closeCardDetail"></div>
          <div class="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[900px] max-h-[85vh] flex flex-col">
            <div class="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <div>
                <h2 class="text-[18px] font-bold text-[#333]">{{ cardDetail.title }} 상세 내역</h2>
                <p class="text-[13px] text-[#999] mt-0.5">{{ periodLabel }} 기준</p>
              </div>
              <button @click="closeCardDetail" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                <span class="material-symbols-outlined text-[22px] text-[#999]">close</span>
              </button>
            </div>

            <div class="flex-1 overflow-auto">
              <div v-if="cardDetail.loading" class="text-center py-10">
                <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
              </div>

              <!-- DB배분 내역 테이블 -->
              <template v-else-if="cardDetail.type === 'assignments'">
                <table class="min-w-full divide-y divide-[#E8E8E8]">
                  <thead class="bg-[#FAFAFA] sticky top-0">
                    <tr>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">고객명</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">연락처</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">배분유형</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">배분일시</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#F0F0F0]">
                    <tr v-for="(item, idx) in cardDetail.items" :key="item.id" class="hover:bg-[#FAFAFA] transition-colors">
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ ((cardDetail.currentPage - 1) * 20) + idx + 1 }}</td>
                      <td class="px-5 py-3 text-[14px] font-medium text-[#333]">{{ item.agent_name }}</td>
                      <td class="px-5 py-3 text-[14px] text-[#333]">{{ item.customer_name }}</td>
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ item.customer_phone }}</td>
                      <td class="px-5 py-3 text-[13px]">
                        <span :class="assignmentTypeBadge(item.assignment_type)">
                          {{ assignmentTypeLabel(item.assignment_type) }}
                        </span>
                      </td>
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ item.created_at }}</td>
                    </tr>
                    <tr v-if="cardDetail.items.length === 0">
                      <td colspan="6" class="px-5 py-10 text-center text-[#999]">데이터가 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </template>

              <!-- 계약 내역 테이블 -->
              <template v-else-if="cardDetail.type === 'contracts'">
                <table class="min-w-full divide-y divide-[#E8E8E8]">
                  <thead class="bg-[#FAFAFA] sticky top-0">
                    <tr>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">고객명</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">보험사</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">보험상품</th>
                      <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">계약금액</th>
                      <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">계약일</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#F0F0F0]">
                    <tr v-for="(item, idx) in cardDetail.items" :key="item.id" class="hover:bg-[#FAFAFA] transition-colors">
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ ((cardDetail.currentPage - 1) * 20) + idx + 1 }}</td>
                      <td class="px-5 py-3 text-[14px] font-medium text-[#333]">{{ item.agent_name }}</td>
                      <td class="px-5 py-3 text-[14px] text-[#333]">{{ item.customer_name }}</td>
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ item.company_name }}</td>
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ item.insurance_product }}</td>
                      <td class="px-5 py-3 text-[14px] text-[#333] text-right">{{ formatAmount(item.contract_amount) }}원</td>
                      <td class="px-5 py-3 text-[13px] text-[#999]">{{ item.contract_date }}</td>
                    </tr>
                    <tr v-if="cardDetail.items.length === 0">
                      <td colspan="7" class="px-5 py-10 text-center text-[#999]">데이터가 없습니다.</td>
                    </tr>
                  </tbody>
                </table>
              </template>
            </div>

            <!-- 페이지네이션 -->
            <div v-if="cardDetail.lastPage > 1" class="px-6 py-4 border-t border-[#F0F0F0] flex items-center justify-center gap-2">
              <button
                :disabled="cardDetail.currentPage <= 1"
                @click="loadCardDetailPage(cardDetail.currentPage - 1)"
                class="px-3 py-1.5 text-[13px] rounded-[8px] border border-[#E0E0E0] disabled:opacity-40 hover:bg-[#F8F8F8] transition-colors"
              >이전</button>
              <span class="text-[13px] text-[#999]">{{ cardDetail.currentPage }} / {{ cardDetail.lastPage }}</span>
              <button
                :disabled="cardDetail.currentPage >= cardDetail.lastPage"
                @click="loadCardDetailPage(cardDetail.currentPage + 1)"
                class="px-3 py-1.5 text-[13px] rounded-[8px] border border-[#E0E0E0] disabled:opacity-40 hover:bg-[#F8F8F8] transition-colors"
              >다음</button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, watch } from 'vue'
import { usePerformanceStore } from '../../stores/performanceStore'
import { useBranchStore } from '../../stores/branchStore'
import { fetchPerformanceDetails } from '../../services/adminApi'
import { exportToExcel } from '../../utils/exportExcel'
import { useDateRange } from '../../composables/useDateRange'
import type { AgentPerformance } from '../../types'
import Pagination from '../../components/Pagination.vue'

const store = usePerformanceStore()
const branchStore = useBranchStore()
const { dateFrom, dateTo } = useDateRange('month')

const summaryLoading = ref(false)
const tableLoading = ref(false)

const selectedAgent = ref<AgentPerformance | null>(null)
const detailLoading = ref(false)
const sortField = ref<string>('agent_name')
const sortDirection = ref<'asc' | 'desc'>('asc')

const columns = [
  { key: 'agent_name', label: '설계사명', align: 'left' },
  { key: 'db_assigned_count', label: 'DB배분', align: 'right' },
  { key: 'contract_count', label: '계약 건수', align: 'right' },
  { key: 'contract_amount', label: '계약 금액', align: 'right' },
  { key: 'consultation_count', label: '상담 건수', align: 'right' },
]

interface SummaryCard {
  label: string
  value: string
  unit?: string
  detailType?: 'assignments' | 'contracts'
}

const summaryCards = computed<SummaryCard[]>(() => {
  const s = store.summary
  if (!s) {
    return [
      { label: 'DB배분 건수', value: '-' },
      { label: '계약 건수', value: '-' },
      { label: '계약 금액', value: '-' },
      { label: 'DB처리율', value: '-' },
      { label: '전환율', value: '-' },
    ]
  }
  return [
    { label: 'DB배분 건수', value: s.total_assignments.toLocaleString(), unit: '건', detailType: 'assignments' },
    { label: '계약 건수', value: s.total_contracts.toLocaleString(), unit: '건', detailType: 'contracts' },
    { label: '계약 금액', value: formatAmount(s.total_contract_amount), unit: '원', detailType: 'contracts' },
    { label: 'DB처리율', value: `${s.db_processing_rate}%`, detailType: 'assignments' },
    { label: '전환율', value: `${s.conversion_rate}%`, detailType: 'contracts' },
  ]
})

const periodLabel = computed(() => {
  return `${dateFrom.value} ~ ${dateTo.value}`
})

// 카드 상세 모달 상태
const cardDetail = reactive({
  visible: false,
  loading: false,
  title: '',
  type: '' as 'assignments' | 'contracts',
  items: [] as any[],
  currentPage: 1,
  lastPage: 1,
})

async function openDetailModal(card: SummaryCard) {
  if (!card.detailType) return
  cardDetail.visible = true
  cardDetail.title = card.label
  cardDetail.type = card.detailType
  cardDetail.items = []
  cardDetail.currentPage = 1
  cardDetail.lastPage = 1
  await loadCardDetailPage(1)
}

async function loadCardDetailPage(page: number) {
  cardDetail.loading = true
  try {
    const response = await fetchPerformanceDetails({
      type: cardDetail.type,
      date_from: dateFrom.value,
      date_to: dateTo.value,
      page,
      per_page: 20,
      ...branchStore.getBranchParam(),
    })
    const paginatedData = response.data.data
    cardDetail.items = paginatedData.data
    cardDetail.currentPage = paginatedData.current_page
    cardDetail.lastPage = paginatedData.last_page
  } catch {
    cardDetail.items = []
  } finally {
    cardDetail.loading = false
  }
}

function closeCardDetail() {
  cardDetail.visible = false
}

function assignmentTypeLabel(type: string): string {
  const map: Record<string, string> = {
    NEW: '상주',
    auto_distribute: '자동배분',
    auto_timeout_reassign: '타임아웃 재배분',
    manual: '수동',
  }
  return map[type] ?? type
}

function assignmentTypeBadge(type: string): string {
  if (type === 'NEW') return 'inline-block px-2 py-0.5 rounded-full text-[12px] bg-blue-50 text-blue-600'
  if (type === 'auto_distribute') return 'inline-block px-2 py-0.5 rounded-full text-[12px] bg-green-50 text-green-600'
  if (type === 'auto_timeout_reassign') return 'inline-block px-2 py-0.5 rounded-full text-[12px] bg-orange-50 text-orange-600'
  return 'inline-block px-2 py-0.5 rounded-full text-[12px] bg-gray-50 text-gray-600'
}

const excelLoading = ref(false)

function downloadExcel() {
  excelLoading.value = true
  try {
    const rows = sortedAgentPerformances.value.map(a => ({
      agent_name: a.agent_name,
      db_assigned_count: a.db_assigned_count,
      contract_count: a.contract_count,
      contract_amount: formatAmount(a.contract_amount),
      processing_rate: a.db_assigned_count > 0
        ? ((a.consultation_count / a.db_assigned_count) * 100).toFixed(1) + '%'
        : '0%',
      conversion_rate: a.db_assigned_count > 0
        ? ((a.contract_count / a.db_assigned_count) * 100).toFixed(1) + '%'
        : '0%',
    }))
    exportToExcel(rows, [
      { key: '__index__', label: '번호' },
      { key: 'agent_name', label: '설계사 이름' },
      { key: 'db_assigned_count', label: 'DB 배분' },
      { key: 'contract_count', label: '계약 건수' },
      { key: 'contract_amount', label: '계약 금액' },
      { key: 'processing_rate', label: 'DB 처리율' },
      { key: 'conversion_rate', label: '전환율' },
    ], '실적현황')
  } catch {
    alert('엑셀 다운로드에 실패했습니다.')
  } finally {
    excelLoading.value = false
  }
}

const sortedAgentPerformances = computed(() => {
  const list = [...store.agentPerformances]
  const field = sortField.value as keyof AgentPerformance
  const dir = sortDirection.value === 'asc' ? 1 : -1

  list.sort((a, b) => {
    const valA = a[field] ?? 0
    const valB = b[field] ?? 0
    if (typeof valA === 'string' && typeof valB === 'string') {
      return valA.localeCompare(valB, 'ko') * dir
    }
    return ((valA as number) - (valB as number)) * dir
  })

  return list
})

function toggleSort(key: string) {
  if (sortField.value === key) {
    sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortField.value = key
    sortDirection.value = 'asc'
  }
}

async function reloadSummary() {
  store.setDateRange(dateFrom.value, dateTo.value)
  summaryLoading.value = true
  await store.loadSummary(branchStore.getBranchParam())
  summaryLoading.value = false
}

function onSearchDate() {
  reloadSummary()
}

async function fetchAgentTable(page = 1) {
  tableLoading.value = true
  await store.loadAgentPerformances({ page, ...branchStore.getBranchParam() })
  tableLoading.value = false
}

function goToPage(page: number) {
  fetchAgentTable(page)
}

async function openAgentDetail(agent: AgentPerformance) {
  selectedAgent.value = agent
  detailLoading.value = true
  await store.loadAgentDetail(agent.agent_id)
  detailLoading.value = false
}

function formatAmount(amount?: number): string {
  if (amount === undefined || amount === null) return '-'
  return amount.toLocaleString('ko-KR')
}

watch(() => branchStore.selectedBranchId, async () => {
  store.setDateRange(dateFrom.value, dateTo.value)
  summaryLoading.value = true
  tableLoading.value = true
  await Promise.all([
    store.loadSummary(branchStore.getBranchParam()),
    store.loadAgentPerformances({ ...branchStore.getBranchParam() }),
  ])
  summaryLoading.value = false
  tableLoading.value = false
})

onMounted(async () => {
  store.setDateRange(dateFrom.value, dateTo.value)
  summaryLoading.value = true
  tableLoading.value = true
  await Promise.all([
    store.loadSummary(branchStore.getBranchParam()),
    store.loadAgentPerformances({ ...branchStore.getBranchParam() }),
  ])
  summaryLoading.value = false
  tableLoading.value = false
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
