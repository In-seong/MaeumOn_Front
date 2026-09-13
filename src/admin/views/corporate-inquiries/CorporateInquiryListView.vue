<template>
  <div class="p-4 lg:p-6">
    <div class="mb-6">
      <div class="flex items-center gap-3">
        <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">기업용 보험</h1>
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
      <p class="text-[13px] text-[#999] mt-1">외부 사이트에서 접수된 기업 보험 상담 문의를 관리합니다.</p>
    </div>

    <!-- 필터 + 검색 -->
    <div class="flex flex-col lg:flex-row gap-3 mb-4">
      <div class="flex border-b border-[#E8E8E8]">
        <button v-for="tab in statusTabs" :key="tab.value" @click="filterStatus = tab.value; loadData()"
          :class="['px-5 py-3 text-[14px] font-medium border-b-2 transition-colors -mb-[1px]',
            filterStatus === tab.value ? 'border-[#FF7B22] text-[#FF7B22]' : 'border-transparent text-[#999] hover:text-[#333]']">
          {{ tab.label }}
        </button>
      </div>
      <div class="lg:ml-auto">
        <input v-model="search" @keyup.enter="loadData()" type="text" placeholder="업체명, 대표자명, 연락처 검색"
          class="w-full lg:w-[280px] px-4 py-2.5 border border-[#E5E5E5] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-[60px] cursor-pointer select-none hover:text-[#333]" @click="handleSort('id')">No. {{ sortIcon('id') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('company_name')">업체명 {{ sortIcon('company_name') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('ceo_name')">대표자명 {{ sortIcon('ceo_name') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">연락처</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('annual_revenue')">연매출 {{ sortIcon('annual_revenue') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('industry')">업종 {{ sortIcon('industry') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('consultation_field')">상담분야 {{ sortIcon('consultation_field') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">담당 설계사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('status')">상태 {{ sortIcon('status') }}</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('created_at')">접수일 {{ sortIcon('created_at') }}</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr v-if="store.inquiries.length === 0">
            <td colspan="10" class="px-6 py-10 text-center text-[14px] text-[#999]">접수된 문의가 없습니다.</td>
          </tr>
          <tr v-for="(item, index) in store.inquiries" :key="item.id"
            @click="router.push(`/corporate-inquiries/${item.id}`)"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer">
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.company_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ item.ceo_name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ item.phone }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ item.annual_revenue || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ item.industry || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ item.consultation_field || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              <span v-if="item.agent" class="text-[#333] font-medium">{{ item.agent.name }}</span>
              <span v-else>-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="statusClass(item.status)" class="inline-flex items-center px-2.5 py-1 text-[12px] font-medium rounded-full">
                {{ statusLabel(item.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatDate(item.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 페이지네이션 -->
    <Pagination
      v-if="store.pagination"
      :current-page="store.pagination.current_page"
      :last-page="store.pagination.last_page"
      @change="changePage"
      class="mt-4"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCorporateInquiryStore } from '../../stores/corporateInquiryStore'
import { useBranchStore } from '../../stores/branchStore'
import { useSortable } from '../../composables/useSortable'
import { fetchCorporateInquiries } from '../../services/adminApi'
import { exportToExcel } from '../../utils/exportExcel'
import Pagination from '../../components/Pagination.vue'

const router = useRouter()
const store = useCorporateInquiryStore()
const branchStore = useBranchStore()

const search = ref('')
const filterStatus = ref('')
const currentPage = ref(1)
const perPage = 20

const { toggleSort, sortParams, sortIcon } = useSortable('created_at', 'desc')

const statusTabs = [
  { label: '전체', value: '' },
  { label: '신규', value: 'NEW' },
  { label: '진행중', value: 'IN_PROGRESS' },
  { label: '완료', value: 'COMPLETED' },
]

function handleSort(field: string) {
  toggleSort(field)
  loadData()
}

function loadData() {
  currentPage.value = 1
  fetchData()
}

function changePage(page: number) {
  currentPage.value = page
  fetchData()
}

function fetchData() {
  store.loadInquiries({
    page: currentPage.value,
    per_page: perPage,
    search: search.value || undefined,
    status: filterStatus.value || undefined,
    ...sortParams(),
    ...branchStore.getBranchParam(),
  })
}

function rowNum(index: number) {
  return ((currentPage.value - 1) * perPage) + index + 1
}

function statusLabel(s: string) {
  if (s === 'NEW') return '신규'
  if (s === 'IN_PROGRESS') return '진행중'
  if (s === 'COMPLETED') return '완료'
  return s
}

function statusClass(s: string) {
  if (s === 'NEW') return 'bg-blue-50 text-blue-600'
  if (s === 'IN_PROGRESS') return 'bg-[#FFF3ED] text-[#FF7B22]'
  if (s === 'COMPLETED') return 'bg-green-50 text-green-600'
  return 'bg-gray-50 text-gray-600'
}

function formatDate(d: string) {
  if (!d) return '-'
  return d.slice(0, 10)
}

watch(() => branchStore.selectedBranchId, () => {
  currentPage.value = 1
  fetchData()
})

const excelLoading = ref(false)

async function downloadExcel() {
  excelLoading.value = true
  try {
    const res = await fetchCorporateInquiries({
      search: search.value || undefined,
      status: filterStatus.value || undefined,
      per_page: 9999,
      ...sortParams(),
      ...branchStore.getBranchParam(),
    })
    const items = res.data.data.data
    const rows = items.map(item => ({
      company_name: item.company_name,
      ceo_name: item.ceo_name,
      phone: item.phone,
      annual_revenue: item.annual_revenue ?? '',
      industry: item.industry ?? '',
      consultation_field: item.consultation_field ?? '',
      agent_name: item.agent?.name ?? '',
      created_at: item.created_at ? item.created_at.slice(0, 16).replace('T', ' ') : '',
      notes: item.notes ?? '',
    }))
    exportToExcel(rows, [
      { key: '__index__', label: '번호' },
      { key: 'company_name', label: '업체명' },
      { key: 'ceo_name', label: '대표자명' },
      { key: 'phone', label: '연락처' },
      { key: 'annual_revenue', label: '연매출' },
      { key: 'industry', label: '업종' },
      { key: 'consultation_field', label: '상담분야' },
      { key: 'agent_name', label: '담당 설계사' },
      { key: 'created_at', label: '접수일시' },
      { key: 'notes', label: '메모' },
    ], '기업용보험')
  } catch {
    alert('엑셀 다운로드에 실패했습니다.')
  } finally {
    excelLoading.value = false
  }
}

onMounted(() => fetchData())
</script>
