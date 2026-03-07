import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { CalendarEvent } from '../types'
import {
  fetchMonthSchedules as apiFetchMonth,
  fetchUpcomingSchedules as apiFetchUpcoming,
  createSchedule as apiCreate,
  updateSchedule as apiUpdate,
  deleteSchedule as apiDelete,
  toggleScheduleComplete as apiToggle,
} from '../services/agentApi'

export const useScheduleStore = defineStore('agentSchedule', () => {
  const today = new Date()

  const selectedDate = ref(formatDate(today))
  const selectedMonth = ref(today.getMonth() + 1)
  const selectedYear = ref(today.getFullYear())

  // 월간 이벤트 (날짜별 그룹핑)
  const monthEvents = ref<Record<string, CalendarEvent[]>>({})
  const upcomingEvents = ref<CalendarEvent[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // 선택한 날짜의 일정
  const schedulesForDate = computed(() => {
    const list = monthEvents.value[selectedDate.value] ?? []
    return [...list].sort((a, b) => (a.start_time ?? '').localeCompare(b.start_time ?? ''))
  })

  // 일정이 있는 날짜 목록 (캘린더 마킹용)
  const monthDates = computed(() => Object.keys(monthEvents.value))

  // 이벤트 유형별 분류 (캘린더 dot 색상용)
  const monthDateTypes = computed(() => {
    const result: Record<string, Set<string>> = {}
    for (const [date, events] of Object.entries(monthEvents.value)) {
      result[date] = new Set(events.map((e) => e.event_type))
    }
    return result
  })

  async function loadMonth(year?: number, month?: number): Promise<void> {
    const y = year ?? selectedYear.value
    const m = month ?? selectedMonth.value
    loading.value = true
    error.value = null
    try {
      const res = await apiFetchMonth(y, m)
      monthEvents.value = res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '일정을 불러오는데 실패했습니다.'
      monthEvents.value = {}
    } finally {
      loading.value = false
    }
  }

  async function loadUpcoming(days = 30): Promise<void> {
    try {
      const res = await apiFetchUpcoming(days)
      upcomingEvents.value = res.data.data
    } catch {
      upcomingEvents.value = []
    }
  }

  async function addSchedule(data: Record<string, unknown>): Promise<CalendarEvent | null> {
    error.value = null
    try {
      const res = await apiCreate(data)
      const event = res.data.data
      // 월간 캐시에 추가
      const dateKey = event.event_date?.slice(0, 10)
      if (dateKey) {
        if (!monthEvents.value[dateKey]) {
          monthEvents.value[dateKey] = []
        }
        monthEvents.value[dateKey]!.push(event)
      }
      return event
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '일정 등록에 실패했습니다.'
      throw e
    }
  }

  async function editSchedule(id: number, data: Record<string, unknown>): Promise<CalendarEvent | null> {
    error.value = null
    try {
      const res = await apiUpdate(id, data)
      // 월간 캐시 갱신을 위해 다시 로드
      await loadMonth()
      return res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '일정 수정에 실패했습니다.'
      throw e
    }
  }

  async function removeSchedule(id: number): Promise<void> {
    error.value = null
    try {
      await apiDelete(id)
      // 월간 캐시에서 제거
      for (const [date, events] of Object.entries(monthEvents.value)) {
        monthEvents.value[date] = events.filter((e) => e.event_id !== id)
        if (monthEvents.value[date]!.length === 0) {
          delete monthEvents.value[date]
        }
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '일정 삭제에 실패했습니다.'
      throw e
    }
  }

  async function toggleComplete(id: number): Promise<void> {
    try {
      const res = await apiToggle(id)
      const updated = res.data.data
      const dateKey = updated.event_date?.slice(0, 10)
      if (dateKey && monthEvents.value[dateKey]) {
        const idx = monthEvents.value[dateKey]!.findIndex((e) => e.event_id === id)
        if (idx !== -1) {
          monthEvents.value[dateKey]![idx] = updated
        }
      }
    } catch {
      // silent
    }
  }

  return {
    selectedDate,
    selectedMonth,
    selectedYear,
    monthEvents,
    upcomingEvents,
    loading,
    error,
    schedulesForDate,
    monthDates,
    monthDateTypes,
    loadMonth,
    loadUpcoming,
    addSchedule,
    editSchedule,
    removeSchedule,
    toggleComplete,
  }
})

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
