<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <!-- Month/Year Header -->
    <div class="flex items-center justify-between mb-4">
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
        aria-label="이전 달"
        @click="prevMonth"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M15 18l-6-6 6-6" />
        </svg>
      </button>
      <h2 class="text-[16px] font-bold text-[#333]">
        {{ displayYear }}년 {{ displayMonth }}월
      </h2>
      <button
        class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
        aria-label="다음 달"
        @click="nextMonth"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M9 18l6-6-6-6" />
        </svg>
      </button>
    </div>

    <!-- Day of Week Headers -->
    <div class="grid grid-cols-7 mb-2">
      <div
        v-for="day in weekDays"
        :key="day"
        class="text-center text-[12px] font-medium py-1"
        :class="day === '일' ? 'text-[#FF3B30]' : day === '토' ? 'text-[#4285F4]' : 'text-[#999]'"
      >
        {{ day }}
      </div>
    </div>

    <!-- Date Grid -->
    <div class="grid grid-cols-7 gap-y-1">
      <button
        v-for="(cell, idx) in calendarCells"
        :key="idx"
        class="flex flex-col items-center justify-center py-1.5 rounded-[10px] transition-colors relative"
        :class="cellClass(cell)"
        :disabled="!cell.date"
        @click="cell.date && emitSelect(cell.dateStr)"
      >
        <span class="text-[13px] leading-tight" :class="dateTextClass(cell)">
          {{ cell.date || '' }}
        </span>
        <span
          v-if="cell.hasSchedule"
          class="w-1 h-1 rounded-full mt-0.5"
          :class="isSelected(cell.dateStr) ? 'bg-white' : 'bg-[#FF7B22]'"
        />
        <span v-else class="w-1 h-1 mt-0.5" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  selectedDate: string
  markedDates: string[]
  year: number
  month: number
}

const props = defineProps<Props>()

const emit = defineEmits<{
  select: [date: string]
  'update:year': [year: number]
  'update:month': [month: number]
}>()

const weekDays = ['일', '월', '화', '수', '목', '금', '토']

const displayYear = computed(() => props.year)
const displayMonth = computed(() => props.month)

interface CalendarCell {
  date: number | null
  dateStr: string
  hasSchedule: boolean
  isToday: boolean
  dayOfWeek: number
}

const todayStr = computed(() => {
  const now = new Date()
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
})

const calendarCells = computed<CalendarCell[]>(() => {
  const y = props.year
  const m = props.month
  const firstDay = new Date(y, m - 1, 1).getDay()
  const daysInMonth = new Date(y, m, 0).getDate()

  const cells: CalendarCell[] = []

  // Leading empty cells
  for (let i = 0; i < firstDay; i++) {
    cells.push({ date: null, dateStr: '', hasSchedule: false, isToday: false, dayOfWeek: i })
  }

  // Date cells
  for (let d = 1; d <= daysInMonth; d++) {
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
    const dayOfWeek = (firstDay + d - 1) % 7
    cells.push({
      date: d,
      dateStr,
      hasSchedule: props.markedDates.includes(dateStr),
      isToday: dateStr === todayStr.value,
      dayOfWeek,
    })
  }

  return cells
})

function isSelected(dateStr: string): boolean {
  return dateStr === props.selectedDate
}

function cellClass(cell: CalendarCell): string {
  if (!cell.date) return ''
  if (isSelected(cell.dateStr)) return 'bg-[#FF7B22]'
  if (cell.isToday) return 'bg-[#FFF0E5]'
  return 'hover:bg-[#F5F5F5]'
}

function dateTextClass(cell: CalendarCell): string {
  if (!cell.date) return ''
  if (isSelected(cell.dateStr)) return 'text-white font-bold'
  if (cell.isToday) return 'text-[#FF7B22] font-bold'
  if (cell.dayOfWeek === 0) return 'text-[#FF3B30]'
  if (cell.dayOfWeek === 6) return 'text-[#4285F4]'
  return 'text-[#333]'
}

function emitSelect(dateStr: string): void {
  emit('select', dateStr)
}

function prevMonth(): void {
  let m = props.month - 1
  let y = props.year
  if (m < 1) {
    m = 12
    y--
  }
  emit('update:year', y)
  emit('update:month', m)
}

function nextMonth(): void {
  let m = props.month + 1
  let y = props.year
  if (m > 12) {
    m = 1
    y++
  }
  emit('update:year', y)
  emit('update:month', m)
}
</script>
