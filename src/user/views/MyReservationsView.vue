<template>
  <div class="min-h-screen bg-white flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white">
      <BackHeader title="내 예약" />

      <main class="px-5 pb-28" style="height: calc(100vh - 56px); overflow-y: auto;">
        <!-- 전화번호 입력 (저장된 번호 없을 때) -->
        <div v-if="!phoneVerified" class="pt-8">
          <div class="bg-white rounded-[16px] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6">
            <h2 class="text-[16px] font-bold text-[#222] mb-1">예약 조회</h2>
            <p class="text-[13px] text-[#888] mb-5">예약 시 입력한 전화번호로 조회합니다.</p>
            <div class="flex gap-2">
              <input
                v-model="phoneInput"
                type="tel"
                placeholder="010-0000-0000"
                class="flex-1 px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[15px] focus:outline-none focus:border-[#03C75A]"
                @keyup.enter="lookupReservations"
              />
              <button
                @click="lookupReservations"
                :disabled="!phoneInput.trim()"
                class="px-5 py-3 bg-[#03C75A] text-white rounded-[12px] text-[15px] font-semibold disabled:opacity-40 hover:bg-[#02A94D] transition-colors"
              >
                조회
              </button>
            </div>
          </div>
        </div>

        <!-- 예약 목록 -->
        <template v-else>
          <div class="flex items-center justify-between pt-5 mb-4">
            <div>
              <p class="text-[13px] text-[#888]">{{ savedPhone }}</p>
              <p class="text-[12px] text-[#BBB]">총 {{ reservations.length }}건</p>
            </div>
            <button @click="resetPhone" class="text-[13px] text-[#03C75A] font-medium">다른 번호로 조회</button>
          </div>

          <div v-if="loading" class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#03C75A] mx-auto"></div>
          </div>

          <div v-else-if="reservations.length === 0" class="text-center py-16">
            <div class="w-16 h-16 mx-auto bg-[#F5F5F5] rounded-full flex items-center justify-center mb-4">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="#CCC" stroke-width="2"/>
                <path d="M16 2V6M8 2V6M3 10H21" stroke="#CCC" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <p class="text-[15px] text-[#999]">예약 내역이 없습니다.</p>
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="r in reservations"
              :key="r.reservation_id"
              class="bg-white rounded-[16px] shadow-[0_1px_8px_rgba(0,0,0,0.06)] p-5"
            >
              <div class="flex items-start justify-between mb-3">
                <div>
                  <h3 class="text-[16px] font-bold text-[#222]">{{ getPlaceName(r) }}</h3>
                  <p class="text-[13px] text-[#888] mt-0.5">{{ getPlaceAddress(r) }}</p>
                </div>
                <span
                  class="px-2.5 py-1 text-[12px] font-medium rounded-full flex-shrink-0"
                  :class="statusClass(r.status)"
                >
                  현재 상태: {{ statusLabel(r.status) }}
                </span>
              </div>

              <div class="flex items-center gap-4 text-[14px]">
                <div class="flex items-center gap-1.5 text-[#555]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="18" rx="2" stroke="#888" stroke-width="2"/><path d="M16 2V6M8 2V6M3 10H21" stroke="#888" stroke-width="2" stroke-linecap="round"/></svg>
                  {{ r.reservation_date }}
                </div>
                <div class="flex items-center gap-1.5 text-[#555]">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="2"/><path d="M12 6V12L16 14" stroke="#888" stroke-width="2" stroke-linecap="round"/></svg>
                  {{ r.reservation_time }}
                </div>
              </div>

              <div v-if="r.memo" class="mt-2 text-[13px] text-[#999]">{{ r.memo }}</div>

              <div v-if="r.status === 'pending' || r.status === 'confirmed'" class="mt-3 pt-3 border-t border-[#F0F0F0]">
                <button
                  @click="handleCancel(r.reservation_id)"
                  class="text-[13px] text-red-500 font-medium hover:text-red-600"
                >
                  예약 취소
                </button>
              </div>
            </div>
          </div>
        </template>
      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDialog } from '@user/composables/useDialog'
import BackHeader from '@user/components/layout/BackHeader.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { fetchMyReservations, cancelReservation } from '@user/services/publicApi'
import type { MyReservation } from '@user/services/publicApi'

const dialog = useDialog()
const phoneInput = ref('')
const savedPhone = ref('')
const phoneVerified = ref(false)
const reservations = ref<MyReservation[]>([])
const loading = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('reservationPhone')
  if (stored) {
    savedPhone.value = stored
    phoneVerified.value = true
    loadReservations()
  }
})

async function lookupReservations() {
  if (!phoneInput.value.trim()) return
  savedPhone.value = phoneInput.value.trim()
  localStorage.setItem('reservationPhone', savedPhone.value)
  phoneVerified.value = true
  await loadReservations()
}

async function loadReservations() {
  loading.value = true
  try {
    const res = await fetchMyReservations(savedPhone.value)
    reservations.value = res.data.data
  } catch {
    reservations.value = []
  } finally {
    loading.value = false
  }
}

function resetPhone() {
  localStorage.removeItem('reservationPhone')
  phoneVerified.value = false
  savedPhone.value = ''
  phoneInput.value = ''
  reservations.value = []
}

async function handleCancel(id: number) {
  const confirmed = await dialog.confirm('이 예약을 취소하시겠습니까?')
  if (!confirmed) return
  try {
    await cancelReservation(id, savedPhone.value)
    await loadReservations()
  } catch {
    await dialog.error('취소에 실패했습니다.')
  }
}

function getPlaceName(r: MyReservation): string {
  if (r.reservation_type === 'hospital') return r.hospital?.hospital_name ?? '병원'
  return r.health_center?.center_name ?? '건강검진 센터'
}

function getPlaceAddress(r: MyReservation): string {
  if (r.reservation_type === 'hospital') return r.hospital?.address ?? ''
  return r.health_center?.address ?? ''
}

function statusLabel(s: string): string {
  const m: Record<string, string> = { pending: '대기', confirmed: '확인', cancelled: '취소', completed: '완료' }
  return m[s] ?? s
}

function statusClass(s: string): string {
  const m: Record<string, string> = {
    pending: 'bg-yellow-50 text-yellow-700',
    confirmed: 'bg-green-50 text-green-700',
    cancelled: 'bg-red-50 text-red-500',
    completed: 'bg-blue-50 text-blue-700',
  }
  return m[s] ?? 'bg-gray-100 text-gray-600'
}
</script>
