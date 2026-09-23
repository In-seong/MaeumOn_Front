<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center gap-3 mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">배정 통계</h1>
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

    <div class="mb-4 flex flex-wrap items-center gap-3">
      <div class="flex items-center gap-2">
        <input type="date" v-model="dateFrom" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <span class="text-[#999] text-[13px]">~</span>
        <input type="date" v-model="dateTo" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <button @click="onSearch" class="px-4 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[13px] font-medium hover:bg-[#E56D1E] transition-colors">조회</button>
      </div>

      <select
        :value="store.selectedHospitalId ?? ''"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="onHospitalChange"
      >
        <option value="">전체 병원</option>
        <option v-for="h in store.hospitals" :key="h.hospital_id" :value="h.hospital_id">{{ h.hospital_name }}</option>
      </select>
    </div>

    <div class="mb-4 flex flex-wrap gap-3">
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">전체</div>
        <div class="text-[24px] font-bold text-[#333]">{{ store.summary.total }}</div>
      </div>
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">상주 DB</div>
        <div class="text-[24px] font-bold text-[#2196F3]">{{ store.summary.total_resident }}</div>
      </div>
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">배분 DB</div>
        <div class="text-[24px] font-bold text-[#FF7B22]">{{ store.summary.total_distribution }}</div>
      </div>
      <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-5 py-4 min-w-[140px]">
        <div class="text-[12px] text-[#999] mb-1">기업 DB</div>
        <div class="text-[24px] font-bold text-[#4CAF50]">{{ store.summary.total_corporate }}</div>
      </div>
      <div class="bg-[#F8F8F8] rounded-[12px] px-5 py-4 flex items-center">
        <span class="text-[13px] text-[#999]">기간: {{ dateFrom }} ~ {{ dateTo }}</span>
      </div>
    </div>

    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else-if="store.agents.length === 0" class="text-center py-10 text-[#999] text-[14px]">
      해당 기간에 배정 데이터가 없습니다.
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">설계사</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">상주 DB</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">배분 DB</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">기업 DB</th>
            <th class="px-4 lg:px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase">합계</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="(row, index) in store.agents" :key="row.agent_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#FF7B22] cursor-pointer hover:underline" @click="openDetail(row)">{{ row.agent_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-[#2196F3] font-medium">{{ row.resident }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-[#FF7B22] font-medium">{{ row.distribution }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center text-[#4CAF50] font-medium">{{ row.corporate }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-center font-bold text-[#333]">{{ row.total }}</td>
          </tr>
        </tbody>
        <tfoot class="bg-[#FAFAFA]">
          <tr>
            <td class="px-4 lg:px-6 py-3"></td>
            <td class="px-4 lg:px-6 py-3 text-[13px] font-bold text-[#333]">합계</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#2196F3]">{{ store.summary.total_resident }}</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#FF7B22]">{{ store.summary.total_distribution }}</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#4CAF50]">{{ store.summary.total_corporate }}</td>
            <td class="px-4 lg:px-6 py-3 text-[13px] text-center font-bold text-[#333]">{{ store.summary.total }}</td>
          </tr>
        </tfoot>
      </table>
    </div>

    <!-- 상세 모달 -->
    <div v-if="showDetailModal" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="closeDetail">
      <div class="absolute inset-0 bg-black/40"></div>
      <div class="relative bg-white rounded-[16px] shadow-2xl w-full max-w-3xl max-h-[80vh] flex flex-col">
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <h2 class="text-[18px] font-bold text-[#333]">{{ detailAgentName }} 배정 상세</h2>
          <button @click="closeDetail" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <div class="flex-1 overflow-auto">
          <div v-if="detailLoading" class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          </div>

          <div v-else-if="detailItems.length === 0" class="text-center py-10 text-[#999] text-[14px]">
            배정 내역이 없습니다.
          </div>

          <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA] sticky top-0">
              <tr>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase w-[50px]">No.</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">고객명</th>
                <th class="px-4 py-3 text-center text-[12px] font-medium text-[#999] uppercase">DB</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">병원</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">배분일시</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">메모</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F0F0F0]">
              <tr v-for="(item, idx) in detailItems" :key="idx" class="hover:bg-[#FAFAFA] transition-colors">
                <td class="px-4 py-3 text-[13px] text-[#999]">{{ idx + 1 }}</td>
                <td class="px-4 py-3 text-[13px] font-medium text-[#333]">{{ item.customer_name }}</td>
                <td class="px-4 py-3 text-center">
                  <span :class="dbTypeColor(item.db_type)" class="inline-flex items-center px-2 py-0.5 text-[11px] font-medium rounded-full">
                    {{ dbTypeLabel(item.db_type) }}
                  </span>
                </td>
                <td class="px-4 py-3 text-[13px] text-[#666]">{{ item.hospital_name || '-' }}</td>
                <td class="px-4 py-3 text-[13px] text-[#999]">{{ formatDateTime(item.assigned_at) }}</td>
                <td class="px-4 py-3 text-[13px] text-[#666] max-w-[200px] truncate">{{ item.memo || '-' }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useClaimRequestStatStore } from '../../stores/claimRequestStatStore'
import { useDateRange } from '../../composables/useDateRange'
import { exportToExcel } from '@shared/utils/exportExcel'
import { fetchClaimRequestStatDetails } from '../../services/adminApi'
import type { ClaimRequestStatDetail, ClaimRequestStatAgentRow } from '../../types'

const store = useClaimRequestStatStore()
const { dateFrom, dateTo } = useDateRange('month')

function onSearch() {
  store.setDateRange(dateFrom.value, dateTo.value)
}

function onHospitalChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  store.setHospital(val ? Number(val) : null)
}

const excelLoading = ref(false)

async function downloadExcel() {
  excelLoading.value = true
  try {
    const res = await fetchClaimRequestStatDetails({
      date_from: dateFrom.value,
      date_to: dateTo.value,
      hospital_id: store.selectedHospitalId || undefined,
    })
    const details = res.data.data.details as Array<{
      agent_name?: string
      customer_name: string
      db_type: string
      hospital_name: string | null
      assigned_at: string | null
      memo: string | null
    }>
    const rows = details.map(d => ({
      agent_name: d.agent_name ?? '',
      customer_name: d.customer_name,
      hospital_name: d.hospital_name ?? '',
      db_type: dbTypeLabel(d.db_type),
      assigned_at: d.assigned_at ?? '',
      memo: d.memo ?? '',
    }))
    exportToExcel(rows, [
      { key: '__index__', label: '번호' },
      { key: 'agent_name', label: '설계사 이름' },
      { key: 'customer_name', label: '고객명' },
      { key: 'hospital_name', label: '병원' },
      { key: 'db_type', label: 'DB' },
      { key: 'assigned_at', label: '배분일시' },
      { key: 'memo', label: '메모' },
    ], '배정통계')
  } catch {
    alert('엑셀 다운로드에 실패했습니다.')
  } finally {
    excelLoading.value = false
  }
}

// 상세 모달
const showDetailModal = ref(false)
const detailAgentName = ref('')
const detailLoading = ref(false)
const detailItems = ref<ClaimRequestStatDetail[]>([])

async function openDetail(row: ClaimRequestStatAgentRow) {
  showDetailModal.value = true
  detailAgentName.value = row.agent_name
  detailLoading.value = true
  try {
    const res = await fetchClaimRequestStatDetails({
      agent_id: row.agent_id,
      date_from: dateFrom.value,
      date_to: dateTo.value,
      hospital_id: store.selectedHospitalId || undefined,
    })
    detailItems.value = res.data.data.details
  } catch {
    detailItems.value = []
  } finally {
    detailLoading.value = false
  }
}

function closeDetail() {
  showDetailModal.value = false
}

function dbTypeLabel(type: string) {
  if (type === 'resident') return '상주'
  if (type === 'distribution') return '배분'
  if (type === 'corporate') return '기업'
  return type
}

function dbTypeColor(type: string) {
  if (type === 'resident') return 'bg-blue-50 text-[#2196F3]'
  if (type === 'distribution') return 'bg-[#FFF3ED] text-[#FF7B22]'
  if (type === 'corporate') return 'bg-green-50 text-[#4CAF50]'
  return 'bg-gray-50 text-gray-600'
}

function formatDateTime(dt: string) {
  if (!dt) return '-'
  return dt.slice(0, 16).replace('T', ' ')
}

onMounted(() => {
  store.setDateRange(dateFrom.value, dateTo.value)
})
</script>
