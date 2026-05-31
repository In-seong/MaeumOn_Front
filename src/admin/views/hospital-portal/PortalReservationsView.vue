<template>
  <div class="min-h-screen bg-[#F8F8F8]">
    <!-- 헤더 -->
    <header class="bg-white border-b border-[#E8E8E8] px-6 py-4 flex items-center justify-between">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-[#FFF0E5] flex items-center justify-center">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M3 21H21" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
            <path d="M5 21V5C5 3.89543 5.89543 3 7 3H17C18.1046 3 19 3.89543 19 5V21" stroke="#FF7B22" stroke-width="2"/>
            <path d="M12 7V13M9 10H15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h1 class="text-[18px] font-bold text-[#222]">{{ portalName || '병원 포털' }}</h1>
          <p class="text-[13px] text-[#888]">예약 관리</p>
        </div>
      </div>
      <div class="flex items-center gap-3">
        <button @click="openScheduleModal" class="px-4 py-2 text-[14px] text-[#FF7B22] font-medium hover:bg-[#FFF0E5] rounded-[8px]">예약 시간 설정</button>
        <button @click="logout" class="px-4 py-2 text-[14px] text-[#888] hover:text-[#333]">로그아웃</button>
      </div>
    </header>

    <main class="max-w-[900px] mx-auto p-4 lg:p-6">
      <!-- 날짜 선택 -->
      <div class="flex items-center gap-4 mb-6">
        <button @click="changeDate(-1)" class="w-10 h-10 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center hover:bg-[#F8F8F8]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
        <div class="flex items-center gap-2">
          <input v-model="selectedDate" type="date" class="px-4 py-2.5 bg-white border border-[#E8E8E8] rounded-[12px] text-[15px] focus:outline-none focus:border-[#FF7B22]" @change="fetchReservations" />
          <button @click="goToday" class="px-3 py-2 text-[13px] text-[#FF7B22] font-medium hover:bg-[#FFF0E5] rounded-[8px]">오늘</button>
        </div>
        <button @click="changeDate(1)" class="w-10 h-10 rounded-full bg-white border border-[#E8E8E8] flex items-center justify-center hover:bg-[#F8F8F8]">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5L16 12L9 19" stroke="#333" stroke-width="2" stroke-linecap="round"/></svg>
        </button>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <!-- 예약 목록 -->
      <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">시간</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">환자명</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">전화번호</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">메모</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
              <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase">처리</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#F0F0F0]">
            <tr v-for="r in reservations" :key="r.reservation_id" class="hover:bg-[#FAFAFA] transition-colors">
              <td class="px-6 py-4 text-[15px] font-semibold text-[#FF7B22]">{{ r.reservation_time }}</td>
              <td class="px-6 py-4 text-[14px] font-medium text-[#333]">{{ r.patient_name }}</td>
              <td class="px-6 py-4 text-[14px] text-[#555]">
                <a :href="'tel:' + r.patient_phone" class="text-[#FF7B22] hover:underline">{{ r.patient_phone }}</a>
              </td>
              <td class="px-6 py-4 text-[13px] text-[#555] hidden sm:table-cell max-w-[200px] truncate">{{ r.memo || '-' }}</td>
              <td class="px-6 py-4">
                <span :class="getStatusClass(r.status)" class="px-2.5 py-1 text-[12px] font-medium rounded-full">
                  {{ getStatusLabel(r.status) }}
                </span>
              </td>
              <td class="px-6 py-4 text-right space-x-2">
                <button v-if="r.status === 'pending'" @click="updateStatus(r.reservation_id, 'confirmed')"
                  class="px-3 py-1.5 bg-green-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-green-600">확인</button>
                <button v-if="r.status === 'pending' || r.status === 'confirmed'" @click="updateStatus(r.reservation_id, 'cancelled')"
                  class="px-3 py-1.5 bg-red-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-red-600">취소</button>
                <button v-if="r.status === 'confirmed'" @click="updateStatus(r.reservation_id, 'completed')"
                  class="px-3 py-1.5 bg-blue-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-blue-600">완료</button>
              </td>
            </tr>
            <tr v-if="reservations.length === 0">
              <td colspan="6" class="px-6 py-10 text-center text-[#999]">해당 날짜에 예약이 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <p class="text-center text-[13px] text-[#999] mt-4">총 {{ reservations.length }}건의 예약</p>
    </main>

    <!-- 스케줄 설정 모달 -->
    <div v-if="scheduleModalOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="scheduleModalOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">예약 시간 설정</h2>
          <button @click="scheduleModalOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div class="px-6 py-5">
          <ScheduleConfigEditor v-model="scheduleConfig" />
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button @click="scheduleModalOpen = false" class="px-4 py-2 text-[#555] text-[14px]">취소</button>
          <button @click="saveSchedule" :disabled="scheduleSaving" class="px-5 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 hover:bg-[#E66A1A]">
            {{ scheduleSaving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@shared/api'
import type { ApiResponse } from '@shared/types'
import type { ScheduleConfig } from '../../types'
import { fetchPortalSchedule, updatePortalSchedule } from '../../services/adminApi'
import ScheduleConfigEditor from '../../components/ScheduleConfigEditor.vue'

interface Reservation {
  reservation_id: number
  patient_name: string
  patient_phone: string
  reservation_date: string
  reservation_time: string
  memo?: string
  status: string
}

const router = useRouter()
const portalName = ref(localStorage.getItem('portalName') || '')
const selectedDate = ref(new Date().toISOString().slice(0, 10))
const reservations = ref<Reservation[]>([])
const loading = ref(false)

function getToken(): string {
  return localStorage.getItem('portalToken') || ''
}

async function fetchReservations() {
  const token = getToken()
  if (!token) { router.push({ name: 'portal-login' }); return }

  loading.value = true
  try {
    const res = await api.get<ApiResponse<Reservation[]>>('/hospital-portal/reservations', {
      params: { date: selectedDate.value },
      headers: { Authorization: `Bearer ${token}` },
    })
    reservations.value = res.data.data
  } catch {
    reservations.value = []
  } finally {
    loading.value = false
  }
}

async function updateStatus(id: number, status: string) {
  const token = getToken()
  try {
    await api.put(`/hospital-portal/reservations/${id}/status`, { status }, {
      headers: { Authorization: `Bearer ${token}` },
    })
    fetchReservations()
  } catch {
    alert('상태 변경에 실패했습니다.')
  }
}

function changeDate(delta: number) {
  const d = new Date(selectedDate.value)
  d.setDate(d.getDate() + delta)
  selectedDate.value = d.toISOString().slice(0, 10)
  fetchReservations()
}

function goToday() {
  selectedDate.value = new Date().toISOString().slice(0, 10)
  fetchReservations()
}

function logout() {
  localStorage.removeItem('portalToken')
  localStorage.removeItem('portalName')
  router.push({ name: 'portal-login' })
}

function getStatusLabel(s: string) {
  const m: Record<string, string> = { pending: '대기', confirmed: '확인', cancelled: '취소', completed: '완료' }
  return m[s] || s
}

function getStatusClass(s: string) {
  const m: Record<string, string> = { pending: 'bg-yellow-100 text-yellow-800', confirmed: 'bg-green-100 text-green-800', cancelled: 'bg-red-100 text-red-800', completed: 'bg-blue-100 text-blue-800' }
  return m[s] || 'bg-gray-100 text-gray-800'
}

const scheduleModalOpen = ref(false)
const scheduleConfig = ref<ScheduleConfig | null>(null)
const scheduleSaving = ref(false)

async function openScheduleModal() {
  const token = getToken()
  if (!token) return
  try {
    const res = await fetchPortalSchedule(token)
    scheduleConfig.value = res.data.data
  } catch {
    scheduleConfig.value = null
  }
  scheduleModalOpen.value = true
}

async function saveSchedule() {
  const token = getToken()
  if (!token) return
  scheduleSaving.value = true
  try {
    await updatePortalSchedule(token, scheduleConfig.value)
    alert('예약 시간 설정이 저장되었습니다.')
    scheduleModalOpen.value = false
  } catch {
    alert('저장에 실패했습니다.')
  } finally {
    scheduleSaving.value = false
  }
}

onMounted(() => fetchReservations())
</script>
