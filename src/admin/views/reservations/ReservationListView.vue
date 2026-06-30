<template>
  <div>
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[22px] font-bold text-[#222]">예약 관리</h1>
    </div>

    <!-- 필터 -->
    <div class="bg-white rounded-[12px] border border-[#E8E8E8] p-4 mb-4 flex flex-wrap gap-3 items-end">
      <div>
        <label class="block text-[12px] text-[#888] mb-1">상태</label>
        <select v-model="filters.status" class="border border-[#DDD] rounded-lg px-3 py-2 text-[14px] min-w-[120px]" @change="loadReservations()">
          <option value="">전체</option>
          <option value="pending">대기</option>
          <option value="confirmed">확정</option>
          <option value="completed">완료</option>
          <option value="cancelled">취소</option>
        </select>
      </div>
      <div>
        <label class="block text-[12px] text-[#888] mb-1">유형</label>
        <select v-model="filters.reservation_type" class="border border-[#DDD] rounded-lg px-3 py-2 text-[14px] min-w-[120px]" @change="loadReservations()">
          <option value="">전체</option>
          <option value="hospital">병원</option>
          <option value="health_center">건강검진센터</option>
        </select>
      </div>
      <div>
        <label class="block text-[12px] text-[#888] mb-1">날짜</label>
        <input v-model="filters.date" type="date" class="border border-[#DDD] rounded-lg px-3 py-2 text-[14px]" @change="loadReservations()" />
      </div>
      <div class="flex-1 min-w-[200px]">
        <label class="block text-[12px] text-[#888] mb-1">검색</label>
        <input v-model="filters.search" type="text" placeholder="이름, 전화번호" class="w-full border border-[#DDD] rounded-lg px-3 py-2 text-[14px]" @input="debouncedSearch" />
      </div>
    </div>

    <!-- 테이블 -->
    <div class="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <div v-if="loading" class="py-12 text-center text-[14px] text-[#999]">불러오는 중...</div>

      <table v-else class="w-full text-[14px]">
        <thead class="bg-[#F9F9F9] border-b border-[#E8E8E8]">
          <tr>
            <th class="px-4 py-3 text-left font-medium text-[#666]">No.</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">유형</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">병원/센터</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">환자명</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">전화번호</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">예약일</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">시간</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">상태</th>
            <th class="px-4 py-3 text-left font-medium text-[#666]">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-if="reservations.length === 0">
            <td colspan="9" class="px-4 py-12 text-center text-[#999]">예약 데이터가 없습니다</td>
          </tr>
          <tr v-for="(r, index) in reservations" :key="r.reservation_id" class="hover:bg-[#FAFAFA]">
            <td class="px-4 py-3 text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-[12px] font-medium" :class="r.reservation_type === 'hospital' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'">
                {{ r.reservation_type === 'hospital' ? '병원' : '검진센터' }}
              </span>
            </td>
            <td class="px-4 py-3 font-medium text-[#333]">{{ getPlaceName(r) }}</td>
            <td class="px-4 py-3 text-[#333]">{{ r.patient_name }}</td>
            <td class="px-4 py-3 text-[#666]">{{ r.patient_phone }}</td>
            <td class="px-4 py-3 text-[#666]">{{ r.reservation_date }}</td>
            <td class="px-4 py-3 text-[#666]">{{ r.reservation_time }}</td>
            <td class="px-4 py-3">
              <span class="px-2 py-0.5 rounded text-[12px] font-medium" :class="statusClass(r.status)">
                {{ statusLabel(r.status) }}
              </span>
            </td>
            <td class="px-4 py-3">
              <select
                :value="r.status"
                class="border border-[#DDD] rounded px-2 py-1 text-[13px]"
                @change="changeStatus(r.reservation_id, ($event.target as HTMLSelectElement).value)"
              >
                <option value="pending">대기</option>
                <option value="confirmed">확정</option>
                <option value="completed">완료</option>
                <option value="cancelled">취소</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="totalPages > 1" class="flex justify-center gap-1 py-4 border-t border-[#F0F0F0]">
        <button
          v-for="p in totalPages"
          :key="p"
          class="px-3 py-1 rounded text-[13px]"
          :class="p === currentPage ? 'bg-[#FF7B22] text-white' : 'text-[#666] hover:bg-[#F0F0F0]'"
          @click="goToPage(p)"
        >
          {{ p }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchAdminReservations, updateAdminReservationStatus } from '@admin/services/adminApi'
import type { AdminReservation } from '@admin/types'

const reservations = ref<AdminReservation[]>([])
const loading = ref(false)
const currentPage = ref(1)
const totalPages = ref(1)
const perPage = ref(20)

const filters = reactive({
  status: '',
  reservation_type: '',
  date: '',
  search: '',
})

let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => loadReservations())

async function loadReservations(page = 1) {
  loading.value = true
  try {
    const params: Record<string, unknown> = { page }
    if (filters.status) params.status = filters.status
    if (filters.reservation_type) params.reservation_type = filters.reservation_type
    if (filters.date) params.date = filters.date
    if (filters.search) params.search = filters.search

    const res = await fetchAdminReservations(params)
    const data = res.data.data
    reservations.value = data.data
    currentPage.value = data.current_page
    totalPages.value = data.last_page
    perPage.value = data.per_page ?? 20
  } catch {
    reservations.value = []
  } finally {
    loading.value = false
  }
}

function rowNum(index: number): number {
  return (currentPage.value - 1) * perPage.value + index + 1
}

function debouncedSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => loadReservations(), 300)
}

function goToPage(page: number) {
  loadReservations(page)
}

function getPlaceName(r: AdminReservation): string {
  if (r.reservation_type === 'hospital') {
    return r.hospital?.hospital_name ?? '-'
  }
  return r.health_center?.center_name ?? '-'
}

async function changeStatus(id: number, status: string) {
  try {
    await updateAdminReservationStatus(id, status)
    await loadReservations(currentPage.value)
  } catch {
    alert('상태 변경에 실패했습니다.')
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = { pending: '대기', confirmed: '확정', completed: '완료', cancelled: '취소' }
  return map[status] ?? status
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-blue-50 text-blue-700',
    completed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-700',
  }
  return map[status] ?? 'bg-gray-50 text-gray-700'
}
</script>
