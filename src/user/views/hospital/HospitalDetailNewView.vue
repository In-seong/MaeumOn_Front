<template>
  <div class="fixed inset-0 bg-white flex justify-center overflow-hidden overscroll-none">
    <div class="w-full max-w-[402px] relative bg-white flex flex-col h-full">
      <div @touchmove.prevent>
        <BackHeader :title="hospital?.hospital_name || '병원 상세'" fallback-route="hospital-list" />
      </div>

      <main class="px-5 flex-1 overflow-y-auto overscroll-none pb-28">
        <!-- 로딩 -->
        <div v-if="loading" class="py-12 text-center">
          <p class="text-[14px] text-[#999]">정보를 불러오는 중...</p>
        </div>

        <template v-else-if="hospital">
          <!-- 병원 정보 -->
          <div class="py-5">
            <CardSection>
              <h2 class="text-[18px] font-bold text-[#222] mb-3">{{ hospital.hospital_name }}</h2>
              <div class="space-y-2">
                <div class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke="#888" stroke-width="2"/><circle cx="12" cy="10" r="3" stroke="#888" stroke-width="2"/></svg>
                  <p class="text-[14px] text-[#555]">{{ hospital.address }}</p>
                </div>
                <div v-if="hospital.contact_phone" class="flex items-center gap-2">
                  <svg class="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" stroke="#888" stroke-width="2"/></svg>
                  <a :href="'tel:' + hospital.contact_phone" class="text-[14px] text-[#03C75A] font-medium">{{ hospital.contact_phone }}</a>
                </div>
                <div v-if="hospital.business_hours" class="flex items-start gap-2">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="#888" stroke-width="2"/><path d="M12 6v6l4 2" stroke="#888" stroke-width="2" stroke-linecap="round"/></svg>
                  <p class="text-[14px] text-[#555]">{{ hospital.business_hours }}</p>
                </div>
                <div v-if="hospital.specialties" class="flex items-start gap-2 cursor-pointer" @click="specialtiesExpanded = !specialtiesExpanded">
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0" viewBox="0 0 24 24" fill="none"><path d="M12 2L2 7l10 5 10-5-10-5z" stroke="#888" stroke-width="2"/><path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#888" stroke-width="2"/></svg>
                  <p class="text-[14px] text-[#555] flex-1 min-w-0" :class="specialtiesExpanded ? '' : 'truncate'">{{ hospital.specialties }}</p>
                  <svg class="w-4 h-4 mt-0.5 flex-shrink-0 transition-transform" :class="specialtiesExpanded ? 'rotate-180' : ''" viewBox="0 0 24 24" fill="none"><path d="M6 9L12 15L18 9" stroke="#888" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </div>
              </div>
            </CardSection>
          </div>

          <!-- 병원 이미지 캐러셀 또는 지도 -->
          <div v-if="hospitalImages.length > 0" class="mb-5 rounded-[16px] overflow-hidden relative select-none" @touchstart="onImgTouchStart" @touchend="onImgTouchEnd" @mousedown="onImgMouseDown" @mouseup="onImgMouseUp">
            <div class="flex transition-transform duration-300 ease-out" :style="{ transform: `translateX(-${currentImg * 100}%)` }">
              <div v-for="img in hospitalImages" :key="img.image_id" class="w-full flex-shrink-0">
                <img :src="img.image_url" :alt="hospital.hospital_name" class="w-full aspect-[720/400] object-cover pointer-events-none" />
              </div>
            </div>
            <!-- 좌우 화살표 (PC용) -->
            <button v-if="hospitalImages.length > 1 && currentImg > 0"
              class="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
              @click="currentImg--"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button v-if="hospitalImages.length > 1 && currentImg < hospitalImages.length - 1"
              class="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/30 hover:bg-black/50 rounded-full flex items-center justify-center transition-colors"
              @click="currentImg++"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <div v-if="hospitalImages.length > 1" class="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
              <span
                v-for="(_, i) in hospitalImages"
                :key="i"
                class="w-2 h-2 rounded-full"
                :class="i === currentImg ? 'bg-white' : 'bg-white/50'"
              ></span>
            </div>
          </div>
          <div v-else-if="hospital.latitude && hospital.longitude" class="mb-5">
            <NaverMap
              :height="200"
              :markers="[{ id: hospital.hospital_id, name: hospital.hospital_name, latitude: hospital.latitude, longitude: hospital.longitude }]"
              :center-lat="hospital.latitude"
              :center-lng="hospital.longitude"
              :zoom="16"
            />
          </div>

          <!-- 예약 섹션 -->
          <div class="mb-5">
            <CardSection>
              <h3 class="text-[16px] font-bold text-[#222] mb-4">예약하기</h3>

              <div class="space-y-4">
                <FormInput
                  label="이름"
                  v-model="reserveForm.patient_name"
                  placeholder="이름을 입력하세요"
                />

                <FormInput
                  label="전화번호"
                  v-model="reserveForm.patient_phone"
                  type="tel"
                  inputmode="tel"
                  placeholder="010-0000-0000"
                  @update:model-value="formatPhone"
                />

                <!-- 방문 목적 -->
                <div>
                  <p class="text-[13px] font-medium text-[#555] mb-2">방문 목적</p>
                  <div class="flex gap-2">
                    <button
                      type="button"
                      class="flex-1 py-3 rounded-[10px] text-[14px] font-medium border transition-colors"
                      :class="reserveForm.visit_type === 'treatment' ? 'bg-[#03C75A] text-white border-[#03C75A]' : 'bg-white text-[#555] border-[#E0E0E0]'"
                      @click="reserveForm.visit_type = 'treatment'"
                    >
                      치료
                    </button>
                    <button
                      type="button"
                      class="flex-1 py-3 rounded-[10px] text-[14px] font-medium border transition-colors"
                      :class="reserveForm.visit_type === 'checkup' ? 'bg-[#03C75A] text-white border-[#03C75A]' : 'bg-white text-[#555] border-[#E0E0E0]'"
                      @click="reserveForm.visit_type = 'checkup'"
                    >
                      검진
                    </button>
                  </div>
                </div>

                <!-- 날짜 선택 -->
                <div>
                  <p class="text-[13px] font-medium text-[#555] mb-2">날짜 선택</p>
                  <ReservationCalendar
                    :selected-date="reserveForm.reservation_date"
                    @select="onDateSelect"
                  />
                </div>

                <!-- 시간 선택 -->
                <div v-if="reserveForm.reservation_date">
                  <p class="text-[13px] font-medium text-[#555] mb-2">시간 선택</p>
                  <div v-if="slotsLoading" class="text-center py-4">
                    <p class="text-[13px] text-[#999]">시간을 불러오는 중...</p>
                  </div>
                  <div v-else-if="timeSlots.length === 0" class="py-4 text-center">
                    <p class="text-[14px] text-[#999]">해당 날짜는 예약이 불가합니다.</p>
                  </div>
                  <div v-else class="flex flex-wrap gap-2">
                    <button
                      v-for="slot in timeSlots"
                      :key="slot.time"
                      class="px-3.5 py-2.5 rounded-[10px] text-[14px] font-medium border transition-colors"
                      :class="getSlotClass(slot)"
                      :disabled="!slot.available"
                      @click="reserveForm.reservation_time = slot.time"
                    >
                      {{ slot.time }}
                    </button>
                  </div>
                </div>

                <FormTextarea
                  label="메모 (선택)"
                  v-model="reserveForm.memo"
                  placeholder="진료 관련 메모를 입력하세요"
                  :rows="2"
                />
              </div>

              <button
                class="w-full py-4 rounded-[12px] text-[16px] font-semibold transition-all active:scale-[0.98] mt-5"
                :class="isReservationValid ? 'bg-[#03C75A] text-white' : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'"
                :disabled="!isReservationValid || reserveLoading"
                @click="submitReservation"
              >
                {{ reserveLoading ? '예약 중...' : '예약하기' }}
              </button>
            </CardSection>
          </div>
        </template>
      </main>

      <SeniorBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDialog } from '@user/composables/useDialog'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import NaverMap from '@user/components/NaverMap.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ReservationCalendar from '@user/components/ReservationCalendar.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { fetchHospital, fetchHospitalSlots, submitReservation as apiSubmitReservation } from '@user/services/publicApi'
import type { PartnerHospital, TimeSlotItem } from '@user/services/publicApi'

const route = useRoute()
const router = useRouter()
const dialog = useDialog()
const hospitalId = Number(route.params.id)

interface HospitalImageData {
  image_id: number
  image_url: string
}

const hospital = ref<PartnerHospital | null>(null)
const loading = ref(false)
const hospitalImages = ref<HospitalImageData[]>([])
const currentImg = ref(0)
const specialtiesExpanded = ref(false)
let imgTouchStartX = 0
let imgMouseStartX = 0
const timeSlots = ref<TimeSlotItem[]>([])
const slotsLoading = ref(false)
const reserveLoading = ref(false)

function todayStr() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const reserveForm = ref({
  patient_name: '',
  patient_phone: '',
  visit_type: 'treatment' as 'treatment' | 'checkup',
  reservation_date: todayStr(),
  reservation_time: '',
  memo: '',
})

const isReservationValid = computed(() => {
  return (
    reserveForm.value.patient_name.trim().length > 0 &&
    reserveForm.value.patient_phone.trim().length >= 10 &&
    reserveForm.value.reservation_date &&
    reserveForm.value.reservation_time
  )
})

onMounted(async () => {
  loading.value = true
  try {
    const res = await fetchHospital(hospitalId)
    hospital.value = res.data.data
    const imgs = (res.data.data as unknown as { images?: HospitalImageData[] }).images
    hospitalImages.value = imgs?.filter(i => i.image_url) ?? []
    loadSlots(reserveForm.value.reservation_date)
  } catch {
    await dialog.error('병원 정보를 불러오지 못했습니다.')
    router.back()
  } finally {
    loading.value = false
  }
})

function onImgTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (touch) imgTouchStartX = touch.clientX
}

function onImgTouchEnd(e: TouchEvent) {
  const touch = e.changedTouches[0]
  if (!touch) return
  const diff = imgTouchStartX - touch.clientX
  if (Math.abs(diff) < 50) return
  if (diff > 0 && currentImg.value < hospitalImages.value.length - 1) {
    currentImg.value++
  } else if (diff < 0 && currentImg.value > 0) {
    currentImg.value--
  }
}

function onImgMouseDown(e: MouseEvent) {
  imgMouseStartX = e.clientX
}

function onImgMouseUp(e: MouseEvent) {
  const diff = imgMouseStartX - e.clientX
  if (Math.abs(diff) < 50) return
  if (diff > 0 && currentImg.value < hospitalImages.value.length - 1) {
    currentImg.value++
  } else if (diff < 0 && currentImg.value > 0) {
    currentImg.value--
  }
}

function formatPhone(value: string) {
  const numbers = value.replace(/[^0-9]/g, '')
  if (numbers.length <= 3) {
    reserveForm.value.patient_phone = numbers
  } else if (numbers.length <= 7) {
    reserveForm.value.patient_phone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    reserveForm.value.patient_phone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }
}

async function loadSlots(date: string) {
  slotsLoading.value = true
  try {
    const res = await fetchHospitalSlots(hospitalId, date)
    timeSlots.value = res.data.data
  } catch {
    timeSlots.value = []
  } finally {
    slotsLoading.value = false
  }
}

async function onDateSelect(date: string) {
  reserveForm.value.reservation_date = date
  reserveForm.value.reservation_time = ''
  await loadSlots(date)
}

function getSlotClass(slot: TimeSlotItem): string {
  if (!slot.available) return 'bg-[#F5F5F5] text-[#D0D0D0] border-[#F0F0F0] cursor-not-allowed'
  if (slot.time === reserveForm.value.reservation_time) return 'bg-[#03C75A] text-white border-[#03C75A]'
  return 'bg-white text-[#555] border-[#E0E0E0] hover:border-[#03C75A]'
}

async function submitReservation() {
  if (!isReservationValid.value || reserveLoading.value) return

  reserveLoading.value = true
  try {
    const visitLabel = reserveForm.value.visit_type === 'checkup' ? '[검진]' : '[치료]'
    const memoWithType = reserveForm.value.memo ? `${visitLabel} ${reserveForm.value.memo}` : visitLabel
    await apiSubmitReservation({
      hospital_id: hospitalId,
      reservation_type: 'hospital',
      patient_name: reserveForm.value.patient_name,
      patient_phone: reserveForm.value.patient_phone,
      reservation_date: reserveForm.value.reservation_date,
      reservation_time: reserveForm.value.reservation_time,
      memo: memoWithType,
    })
    localStorage.setItem('reservationPhone', reserveForm.value.patient_phone)
    await dialog.success('예약이 접수되었습니다!')
    router.push('/my-reservations')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    await dialog.error(msg || '예약에 실패했습니다. 다시 시도해주세요.')
  } finally {
    reserveLoading.value = false
  }
}
</script>
