<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-center justify-between mb-4">
      <button @click="prevMonth" class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M15 19L8 12L15 5" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      </button>
      <span class="text-[15px] font-semibold text-[#333]">{{ year }}년 {{ month }}월</span>
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
          @click="selectDate(cell.day)"
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
  selectedDay?: number
}

const props = withDefaults(defineProps<Props>(), {
  selectedDay: 7
})

const emit = defineEmits<{
  select: [day: number]
}>()

const year = ref(2025)
const month = ref(1)
const selected = ref(props.selectedDay)
const weekdays = ['일', '월', '화', '수', '목', '금', '토']

interface CalendarCell {
  day: number | null
  disabled?: boolean
  isSunday?: boolean
  isSaturday?: boolean
}

const calendarCells = computed<CalendarCell[]>(() => {
  const firstDay = new Date(year.value, month.value - 1, 1).getDay()
  const daysInMonth = new Date(year.value, month.value, 0).getDate()
  const cells: CalendarCell[] = []

  for (let i = 0; i < firstDay; i++) {
    cells.push({ day: null })
  }

  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = (firstDay + d - 1) % 7
    cells.push({
      day: d,
      disabled: d < 6,
      isSunday: dayOfWeek === 0,
      isSaturday: dayOfWeek === 6
    })
  }

  return cells
})

function getCellClass(cell: CalendarCell): string {
  if (cell.disabled) return 'text-[#D9D9D9] cursor-default'
  if (cell.day === selected.value) return 'bg-[#FF7B22] text-white'
  if (cell.isSunday) return 'text-[#FF0000] hover:bg-[#FFF0E5]'
  if (cell.isSaturday) return 'text-[#4285F4] hover:bg-[#FFF0E5]'
  return 'text-[#333] hover:bg-[#FFF0E5]'
}

function selectDate(day: number): void {
  selected.value = day
  emit('select', day)
}

function prevMonth(): void {
  if (month.value === 1) { month.value = 12; year.value-- }
  else month.value--
}

function nextMonth(): void {
  if (month.value === 12) { month.value = 1; year.value++ }
  else month.value++
}
</script>
