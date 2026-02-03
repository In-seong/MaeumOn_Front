<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white flex flex-col">
      <BackHeader title="예약하기" />
      <main class="flex-1 px-6 py-4 pb-20 overflow-y-auto">
        <section class="mb-6">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">병원 선택</h2>
          <FormSelect v-model="selectedHospital" :options="hospitalOptions" placeholder="병원을 선택하세요" />
        </section>
        <section class="mb-6">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">날짜 선택</h2>
          <CalendarPicker v-model="selectedDate" />
        </section>
        <section class="mb-6">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">시간 선택</h2>
          <TimeSlotPicker v-model="selectedTime" :slots="timeSlots" />
        </section>
        <section class="mb-6">
          <h2 class="text-[15px] font-bold text-[#333] mb-3">메모</h2>
          <FormTextarea v-model="memo" placeholder="증상이나 요청사항을 입력하세요" :rows="3" />
        </section>
        <ActionButton label="예약하기" @click="handleReservation" />
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '../../components/layout/BackHeader.vue'
import FormSelect from '../../components/form/FormSelect.vue'
import FormTextarea from '../../components/form/FormTextarea.vue'
import CalendarPicker from '../../components/form/CalendarPicker.vue'
import TimeSlotPicker from '../../components/form/TimeSlotPicker.vue'
import ActionButton from '../../components/ui/ActionButton.vue'
import BottomNav from '../../components/layout/BottomNav.vue'

const router = useRouter()
const selectedHospital = ref('')
const selectedDate = ref('')
const selectedTime = ref('')
const memo = ref('')

const hospitalOptions = [
  '서울대학교병원',
  '삼성서울병원',
  '세브란스병원',
]

const timeSlots = [
  '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
  '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
  '16:00', '16:30', '17:00',
]

function handleReservation(): void {
  // TODO: 예약 API 연동
  alert('예약이 완료되었습니다.')
  router.push('/hospital')
}
</script>
