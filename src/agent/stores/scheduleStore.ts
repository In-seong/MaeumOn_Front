import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Schedule } from '../types'

export const useScheduleStore = defineStore('agentSchedule', () => {
  const today = new Date()
  const todayStr = formatDate(today)

  const selectedDate = ref(todayStr)
  const selectedMonth = ref(today.getMonth() + 1)
  const selectedYear = ref(today.getFullYear())

  const schedules = ref<Schedule[]>([
    {
      schedule_id: 1,
      agent_id: 'AGT00001',
      customer_id: 101,
      customer_name: '김영수',
      title: '보험 갱신 상담',
      schedule_date: todayStr,
      start_time: '10:00',
      end_time: '11:00',
      schedule_type: 'meeting',
      memo: '자동차보험 갱신 관련 상담',
      is_completed: false,
      created_at: '2026-02-10',
    },
    {
      schedule_id: 2,
      agent_id: 'AGT00001',
      customer_id: 102,
      customer_name: '박미정',
      title: '만기 안내 전화',
      schedule_date: todayStr,
      start_time: '14:00',
      end_time: '14:30',
      schedule_type: 'call',
      memo: '실비보험 만기 안내',
      is_completed: true,
      created_at: '2026-02-09',
    },
    {
      schedule_id: 3,
      agent_id: 'AGT00001',
      customer_id: 103,
      customer_name: '이정훈',
      title: '현장 방문 - 서류 수령',
      schedule_date: todayStr,
      start_time: '16:00',
      end_time: '17:00',
      schedule_type: 'visit',
      memo: '청구 서류 직접 수령',
      is_completed: false,
      created_at: '2026-02-08',
    },
    {
      schedule_id: 4,
      agent_id: 'AGT00001',
      customer_id: 104,
      customer_name: '최수연',
      title: '신규 계약 상담',
      schedule_date: getDateOffset(1),
      start_time: '09:30',
      end_time: '10:30',
      schedule_type: 'meeting',
      memo: '종합보험 신규 가입 상담',
      is_completed: false,
      created_at: '2026-02-10',
    },
    {
      schedule_id: 5,
      agent_id: 'AGT00001',
      customer_name: '정민호',
      customer_id: 105,
      title: '계약 체결 확인 전화',
      schedule_date: getDateOffset(1),
      start_time: '11:00',
      end_time: '11:30',
      schedule_type: 'call',
      is_completed: false,
      created_at: '2026-02-10',
    },
    {
      schedule_id: 6,
      agent_id: 'AGT00001',
      title: '팀 회의',
      schedule_date: getDateOffset(3),
      start_time: '09:00',
      end_time: '10:00',
      schedule_type: 'other',
      memo: '월간 실적 점검 회의',
      is_completed: false,
      created_at: '2026-02-07',
    },
    {
      schedule_id: 7,
      agent_id: 'AGT00001',
      customer_id: 101,
      customer_name: '김영수',
      title: '보험증권 전달 방문',
      schedule_date: getDateOffset(5),
      start_time: '15:00',
      end_time: '16:00',
      schedule_type: 'visit',
      memo: '보험증권 직접 전달',
      is_completed: false,
      created_at: '2026-02-11',
    },
    {
      schedule_id: 8,
      agent_id: 'AGT00001',
      customer_id: 106,
      customer_name: '한지원',
      title: 'DB배분 고객 첫 상담',
      schedule_date: getDateOffset(-1),
      start_time: '13:00',
      end_time: '14:00',
      schedule_type: 'meeting',
      memo: '신규 DB배분 고객 첫 상담',
      is_completed: true,
      created_at: '2026-02-06',
    },
    {
      schedule_id: 9,
      agent_id: 'AGT00001',
      customer_id: 102,
      customer_name: '박미정',
      title: '추가 서류 요청 전화',
      schedule_date: getDateOffset(-2),
      start_time: '10:00',
      end_time: '10:30',
      schedule_type: 'call',
      is_completed: true,
      created_at: '2026-02-05',
    },
  ])

  const schedulesForDate = computed(() =>
    schedules.value
      .filter((s) => s.schedule_date === selectedDate.value)
      .sort((a, b) => a.start_time.localeCompare(b.start_time)),
  )

  const monthDates = computed(() => {
    const dates = new Set<string>()
    schedules.value.forEach((s) => {
      const d = new Date(s.schedule_date)
      if (d.getFullYear() === selectedYear.value && d.getMonth() + 1 === selectedMonth.value) {
        dates.add(s.schedule_date)
      }
    })
    return Array.from(dates)
  })

  function addSchedule(data: Omit<Schedule, 'schedule_id' | 'agent_id' | 'created_at'>): void {
    const newSchedule: Schedule = {
      ...data,
      schedule_id: Date.now(),
      agent_id: 'AGT00001',
      created_at: formatDate(new Date()),
    }
    schedules.value.push(newSchedule)
  }

  function updateSchedule(id: number, data: Partial<Schedule>): void {
    const idx = schedules.value.findIndex((s) => s.schedule_id === id)
    if (idx !== -1) {
      const existing = schedules.value[idx]
      if (existing) {
        schedules.value[idx] = { ...existing, ...data } as Schedule
      }
    }
  }

  function deleteSchedule(id: number): void {
    schedules.value = schedules.value.filter((s) => s.schedule_id !== id)
  }

  function toggleComplete(id: number): void {
    const schedule = schedules.value.find((s) => s.schedule_id === id)
    if (schedule) {
      schedule.is_completed = !schedule.is_completed
    }
  }

  return {
    schedules,
    selectedDate,
    selectedMonth,
    selectedYear,
    schedulesForDate,
    monthDates,
    addSchedule,
    updateSchedule,
    deleteSchedule,
    toggleComplete,
  }
})

function formatDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function getDateOffset(days: number): string {
  const date = new Date()
  date.setDate(date.getDate() + days)
  return formatDate(date)
}
