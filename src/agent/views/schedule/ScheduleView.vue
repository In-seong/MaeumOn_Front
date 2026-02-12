<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Calendar -->
        <section class="mb-4">
          <ScheduleCalendar
            :selected-date="scheduleStore.selectedDate"
            :marked-dates="scheduleStore.monthDates"
            :year="scheduleStore.selectedYear"
            :month="scheduleStore.selectedMonth"
            @select="handleDateSelect"
            @update:year="scheduleStore.selectedYear = $event"
            @update:month="scheduleStore.selectedMonth = $event"
          />
        </section>

        <!-- Selected Date Header -->
        <section class="flex items-center justify-between mb-3">
          <h3 class="text-[15px] font-semibold text-[#333]">
            {{ formattedSelectedDate }}
          </h3>
          <ActionButton @click="showAddModal = true">
            + 일정 추가
          </ActionButton>
        </section>

        <!-- Schedule List -->
        <section class="flex flex-col gap-2">
          <ScheduleEventItem
            v-for="schedule in scheduleStore.schedulesForDate"
            :key="schedule.schedule_id"
            :schedule="schedule"
            @toggle="scheduleStore.toggleComplete"
          />
          <div
            v-if="scheduleStore.schedulesForDate.length === 0"
            class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-8 text-center"
          >
            <p class="text-[14px] text-[#999]">등록된 일정이 없습니다</p>
          </div>
        </section>
      </main>

      <AgentBottomNav />

      <!-- Add Schedule Modal -->
      <Teleport to="body">
        <Transition name="slide-up">
          <div
            v-if="showAddModal"
            class="fixed inset-0 z-[100] flex items-end justify-center px-3 pb-[68px]"
            @click.self="closeModal"
          >
            <!-- Backdrop -->
            <div class="absolute inset-0 bg-black/40" @click="closeModal" />

            <!-- Modal Content -->
            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 max-h-[85vh] overflow-y-auto z-10">
            <div class="flex items-center justify-between mb-5">
              <h3 class="text-[17px] font-bold text-[#333]">일정 추가</h3>
              <button
                class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]"
                aria-label="닫기"
                @click="closeModal"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M18 6L6 18" />
                  <path d="M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div class="flex flex-col gap-4">
              <FormInput
                v-model="addForm.title"
                label="제목"
                placeholder="일정 제목을 입력하세요"
              />

              <FormSelect
                v-model="addForm.customerName"
                label="고객 (선택)"
                :options="customerOptions"
              />

              <FormInput
                v-model="addForm.scheduleDate"
                label="날짜"
                type="date"
              />

              <div class="grid grid-cols-2 gap-3">
                <FormInput
                  v-model="addForm.startTime"
                  label="시작 시간"
                  type="time"
                />
                <FormInput
                  v-model="addForm.endTime"
                  label="종료 시간"
                  type="time"
                />
              </div>

              <FormSelect
                v-model="addForm.scheduleType"
                label="유형"
                :options="typeOptions"
              />

              <FormTextarea
                v-model="addForm.memo"
                label="메모"
                placeholder="메모를 입력하세요 (선택)"
                :rows="3"
              />

              <ActionButton full large class="mt-2" @click="handleAdd">
                일정 등록
              </ActionButton>
            </div>
            </div>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import AgentAppHeader from '../../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ScheduleCalendar from '../../components/ui/ScheduleCalendar.vue'
import ScheduleEventItem from '../../components/ui/ScheduleEventItem.vue'
import { useScheduleStore } from '../../stores/scheduleStore'
import type { Schedule } from '../../types'

const scheduleStore = useScheduleStore()

const showAddModal = ref(false)

const customerOptions = ['없음', '김영수', '박미정', '이정훈', '최수연', '정민호', '한지원']
const typeOptions = ['미팅', '전화', '방문', '기타']

const typeMap: Record<string, Schedule['schedule_type']> = {
  '미팅': 'meeting',
  '전화': 'call',
  '방문': 'visit',
  '기타': 'other',
}

const addForm = ref({
  title: '',
  customerName: '없음',
  scheduleDate: scheduleStore.selectedDate,
  startTime: '09:00',
  endTime: '10:00',
  scheduleType: '미팅',
  memo: '',
})

const formattedSelectedDate = computed(() => {
  const d = new Date(scheduleStore.selectedDate + 'T00:00:00')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const month = d.getMonth() + 1
  const date = d.getDate()
  const day = dayNames[d.getDay()]
  return `${month}월 ${date}일 (${day})`
})

function handleDateSelect(dateStr: string): void {
  scheduleStore.selectedDate = dateStr
  addForm.value.scheduleDate = dateStr
}

function handleAdd(): void {
  if (!addForm.value.title) return

  scheduleStore.addSchedule({
    customer_name: addForm.value.customerName === '없음' ? undefined : addForm.value.customerName,
    title: addForm.value.title,
    schedule_date: addForm.value.scheduleDate,
    start_time: addForm.value.startTime,
    end_time: addForm.value.endTime,
    schedule_type: typeMap[addForm.value.scheduleType] || 'other',
    memo: addForm.value.memo || undefined,
    is_completed: false,
  })

  resetForm()
  showAddModal.value = false
}

function closeModal(): void {
  showAddModal.value = false
  resetForm()
}

function resetForm(): void {
  addForm.value = {
    title: '',
    customerName: '없음',
    scheduleDate: scheduleStore.selectedDate,
    startTime: '09:00',
    endTime: '10:00',
    scheduleType: '미팅',
    memo: '',
  }
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }
</style>
