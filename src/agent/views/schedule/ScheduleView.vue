<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <main class="px-6 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 66px - 60px);">
        <!-- Calendar -->
        <section class="mb-4">
          <ScheduleCalendar
            :selected-date="store.selectedDate"
            :marked-dates="store.monthDates"
            :year="store.selectedYear"
            :month="store.selectedMonth"
            @select="handleDateSelect"
            @update:year="handleYearChange"
            @update:month="handleMonthChange"
          />
        </section>

        <!-- Selected Date Header -->
        <section class="flex items-center justify-between mb-3">
          <h3 class="text-[15px] font-semibold text-[#333]">
            {{ formattedSelectedDate }}
          </h3>
          <ActionButton @click="openAddModal">
            + 일정 추가
          </ActionButton>
        </section>

        <!-- Loading -->
        <div v-if="store.loading" class="flex items-center justify-center py-12">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Schedule List -->
        <section v-else class="flex flex-col gap-2">
          <ScheduleEventItem
            v-for="event in store.schedulesForDate"
            :key="event.event_id"
            :schedule="event"
            @toggle="store.toggleComplete"
            @edit="handleEdit"
            @delete="handleDelete"
          />
          <div
            v-if="store.schedulesForDate.length === 0"
            class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-8 text-center"
          >
            <p class="text-[14px] text-[#999]">등록된 일정이 없습니다</p>
          </div>
        </section>
      </main>

      <AgentBottomNav />

      <!-- Add/Edit Schedule Modal -->
      <Teleport to="body">
        <Transition name="slide-up">
          <div
            v-if="showModal"
            class="fixed inset-0 z-[100] flex items-end justify-center px-3 pb-[68px]"
            @click.self="closeModal"
          >
            <div class="absolute inset-0 bg-black/40" @click="closeModal" />

            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 max-h-[85vh] overflow-y-auto z-10">
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-[17px] font-bold text-[#333]">
                  {{ editingId ? '일정 수정' : '일정 추가' }}
                </h3>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F5F5F5]"
                  @click="closeModal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="flex flex-col gap-4">
                <!-- 일정 유형 -->
                <div>
                  <label class="text-[12px] text-[#888] mb-1.5 block font-medium">유형 *</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="opt in eventTypeOptions"
                      :key="opt.value"
                      type="button"
                      class="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                      :class="form.event_type === opt.value ? 'bg-[#FFF0E5] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                      @click="form.event_type = opt.value"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <FormInput
                  v-model="form.title"
                  label="제목 *"
                  placeholder="일정 제목을 입력하세요"
                />

                <div>
                  <label class="text-[12px] text-[#888] mb-1.5 block font-medium">고객 (선택)</label>
                  <select
                    v-model="form.customer_id"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
                  >
                    <option value="">없음</option>
                    <option v-for="c in customers" :key="c.customer_id" :value="c.customer_id">
                      {{ c.name }}
                    </option>
                  </select>
                </div>

                <FormInput
                  v-model="form.event_date"
                  label="날짜 *"
                  type="date"
                />

                <div class="grid grid-cols-2 gap-3">
                  <FormInput
                    v-model="form.start_time"
                    label="시작 시간"
                    type="time"
                  />
                  <FormInput
                    v-model="form.end_time"
                    label="종료 시간"
                    type="time"
                  />
                </div>

                <!-- 리마인더 설정 -->
                <div>
                  <label class="text-[12px] text-[#888] mb-1.5 block font-medium">사전 알림</label>
                  <div class="flex flex-wrap gap-2">
                    <button
                      v-for="opt in reminderOptions"
                      :key="opt.value"
                      type="button"
                      class="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all"
                      :class="form.reminder_days.includes(opt.value) ? 'bg-[#FFF0E5] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                      @click="toggleReminder(opt.value)"
                    >
                      {{ opt.label }}
                    </button>
                  </div>
                </div>

                <FormTextarea
                  v-model="form.memo"
                  label="메모"
                  placeholder="메모를 입력하세요 (선택)"
                  :rows="3"
                />

                <ActionButton full large class="mt-2" :disabled="saving" @click="handleSubmit">
                  {{ saving ? '저장 중...' : (editingId ? '수정' : '등록') }}
                </ActionButton>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Toast -->
      <Transition name="fade">
        <div
          v-if="toast.visible.value"
          class="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap"
          :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'"
        >
          {{ toast.message.value }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AgentAppHeader from '../../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ScheduleCalendar from '../../components/ui/ScheduleCalendar.vue'
import ScheduleEventItem from '../../components/ui/ScheduleEventItem.vue'
import { useScheduleStore } from '../../stores/scheduleStore'
import { useCustomerStore } from '../../stores/customerStore'
import { useToast } from '../../composables/useToast'
import type { CalendarEvent, CalendarEventType } from '../../types'

const store = useScheduleStore()
const customerStore = useCustomerStore()
const toast = useToast()

const showModal = ref(false)
const editingId = ref<number | null>(null)
const saving = ref(false)

const customers = computed(() => customerStore.customers)

const eventTypeOptions: Array<{ value: CalendarEventType; label: string }> = [
  { value: 'manual', label: '일반 일정' },
  { value: 'birthday', label: '생일' },
  { value: 'contract_expiry', label: '보험 만기' },
  { value: 'insurance_expiry', label: '자동차보험 만기' },
]

const reminderOptions = [
  { value: 0, label: '당일' },
  { value: 1, label: '1일 전' },
  { value: 3, label: '3일 전' },
  { value: 7, label: '7일 전' },
  { value: 30, label: '30일 전' },
] as const

const form = ref({
  event_type: 'manual' as CalendarEventType,
  title: '',
  customer_id: '',
  event_date: store.selectedDate,
  start_time: '09:00',
  end_time: '10:00',
  memo: '',
  reminder_days: [1] as number[],
})

const formattedSelectedDate = computed(() => {
  const d = new Date(store.selectedDate + 'T00:00:00')
  const dayNames = ['일', '월', '화', '수', '목', '금', '토']
  const dayName = dayNames[d.getDay()]
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${dayName})`
})

onMounted(async () => {
  await Promise.all([
    store.loadMonth(),
    customerStore.loadCustomers({ per_page: 100 }),
  ])
})

// 월 변경 시 데이터 재로드
watch([() => store.selectedYear, () => store.selectedMonth], () => {
  store.loadMonth()
})

function handleDateSelect(dateStr: string): void {
  store.selectedDate = dateStr
}

function handleYearChange(year: number): void {
  store.selectedYear = year
}

function handleMonthChange(month: number): void {
  store.selectedMonth = month
}

function toggleReminder(days: number): void {
  const idx = form.value.reminder_days.indexOf(days)
  if (idx !== -1) {
    form.value.reminder_days.splice(idx, 1)
  } else {
    form.value.reminder_days.push(days)
  }
}

function openAddModal(): void {
  editingId.value = null
  form.value = {
    event_type: 'manual',
    title: '',
    customer_id: '',
    event_date: store.selectedDate,
    start_time: '09:00',
    end_time: '10:00',
    memo: '',
    reminder_days: [1],
  }
  showModal.value = true
}

function handleEdit(eventId: number): void {
  // 현재 날짜의 일정에서 찾기
  const event = findEvent(eventId)
  if (!event) return

  editingId.value = eventId
  form.value = {
    event_type: event.event_type,
    title: event.title,
    customer_id: event.customer_id ?? '',
    event_date: event.event_date?.slice(0, 10) ?? store.selectedDate,
    start_time: event.start_time?.slice(0, 5) ?? '09:00',
    end_time: event.end_time?.slice(0, 5) ?? '10:00',
    memo: event.memo ?? '',
    reminder_days: event.reminders?.map((r) => r.remind_before_days) ?? [1],
  }
  showModal.value = true
}

async function handleDelete(eventId: number): Promise<void> {
  if (!confirm('이 일정을 삭제하시겠습니까?')) return
  try {
    await store.removeSchedule(eventId)
    toast.showToast('일정이 삭제되었습니다.')
  } catch {
    toast.showToast(store.error ?? '삭제에 실패했습니다.', 'error')
  }
}

async function handleSubmit(): Promise<void> {
  if (!form.value.title.trim()) {
    toast.showToast('제목을 입력해주세요.', 'error')
    return
  }
  saving.value = true
  try {
    const payload: Record<string, unknown> = {
      title: form.value.title.trim(),
      customer_id: form.value.customer_id || undefined,
      event_type: form.value.event_type,
      event_date: form.value.event_date,
      start_time: form.value.start_time || undefined,
      end_time: form.value.end_time || undefined,
      memo: form.value.memo.trim() || undefined,
      reminder_days: form.value.reminder_days,
    }

    if (editingId.value) {
      await store.editSchedule(editingId.value, payload)
      toast.showToast('일정이 수정되었습니다.')
    } else {
      await store.addSchedule(payload)
      toast.showToast('일정이 등록되었습니다.')
    }
    closeModal()
  } catch {
    toast.showToast(store.error ?? '저장에 실패했습니다.', 'error')
  } finally {
    saving.value = false
  }
}

function closeModal(): void {
  showModal.value = false
  editingId.value = null
}

function findEvent(eventId: number): CalendarEvent | undefined {
  for (const events of Object.values(store.monthEvents)) {
    const found = events.find((e) => e.event_id === eventId)
    if (found) return found
  }
  return undefined
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
