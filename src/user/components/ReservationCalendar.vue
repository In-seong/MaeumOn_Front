<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-center justify-between mb-4">
      <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="text-[15px] font-semibold text-[#333]">{{ displayYear }}년 {{ displayMonth }}월</span>
      <button @click="nextMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M9 5L16 12L9 19" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
    </div>
    <div class="grid grid-cols-7 gap-1 mb-2">
      <div v-for="day in weekdays" :key="day" class="text-center text-[11px] font-medium" :class="day === '일' ? 'text-[#FF0000]' : day === '토' ? 'text-[#4285F4]' : 'text-[#999]'">
        {{ day }}
      </div>
    </div>
    <div class="grid grid-cols-7 gap-1">
      <div v-for="(cell, idx) in calendarCells" :key="idx" class="aspect-square flex items-center justify-center">
        <button
          v-if="cell.day"
          class="w-9 h-9 rounded-full text-[13px] font-medium transition-colors"
          :class="getCellClass(cell)"
          :disabled="cell.disabled"
          @click="selectDate(cell)"
        >
          {{ cell.day }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  selectedDate?: string
}

const props = withDefaults(defineProps<Props>(), {
  selectedDate: '',
})

const emit = defineEmits<{
  select: [date: string]
}>()

const today = new Date()
const displayYear = ref(today.getFullYear())
const displayMonth = ref(today.getMonth() + 1)
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarCell {
  day: number | null
  dateStr: string
  disabled: boolean
  isSunday: boolean
  isSaturday: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const firstDay = new Date(displayYear.value, displayMonth.value - 1, 1).getDay()
  const daysInMonth = new Date(displayYear.value, displayMonth.value, 0).getDate()
  const cells: CalendarCell[] = []
  const todayStr = formatDate(today.getFullYear(), today.getMonth() + 1, today.getDate())

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null, dateStr: '', disabled: true, isSunday: false, isSaturday: false })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (firstDay + d - 1) % 7
    const dateStr = formatDate(displayYear.value, displayMonth.value, d)
    const isPast = dateStr < todayStr

    cells.push({
      day: d,
      dateStr,
      disabled: isPast || dayOfWeek === 0, // 과거 또는 일요일 비활성화
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6,
    })
  }

  return cells
})

function formatDate(year: number, month: number, day: number): string {
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function getCellClass(cell: CalendarCell): string {
  if (cell.disabled) return 'text-[#D9D9D9] cursor-default'
  if (cell.dateStr === props.selectedDate) return 'bg-[#FF7B22] text-white'
  if (cell.isSunday) return 'text-[#FF0000]'
  if (cell.isSaturday) return 'text-[#4285F4] hover:bg-[#FFF0E5]'
  return 'text-[#333] hover:bg-[#FFF0E5]'
}

function selectDate(cell: CalendarCell): void {
  if (cell.disabled || !cell.day) return
  emit('select', cell.dateStr)
}

function prevMonth(): void {
  if (displayMonth.value === 1) {
    displayMonth.value = 12
    displayYear.value--
  } else {
    displayMonth.value--
  }
}

function nextMonth(): void {
  if (displayMonth.value === 12) {
    displayMonth.value = 1
    displayYear.value++
  } else {
    displayMonth.value++
  }
}
</script>
