import { ref } from 'vue'

export interface DatePreset {
  label: string
  value: string
}

export const datePresets: DatePreset[] = [
  { label: '오늘', value: 'day' },
  { label: '이번 주', value: 'week' },
  { label: '이번 달', value: 'month' },
  { label: '전체', value: 'all' },
]

function getPresetRange(preset: string): { from: string; to: string } {
  const now = new Date()
  const to = now.toISOString().slice(0, 10)

  switch (preset) {
    case 'day':
      return { from: to, to }
    case 'week': {
      const day = now.getDay()
      const diff = day === 0 ? 6 : day - 1
      const monday = new Date(now)
      monday.setDate(now.getDate() - diff)
      return { from: monday.toISOString().slice(0, 10), to }
    }
    case 'month': {
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      return { from: first.toISOString().slice(0, 10), to }
    }
    case 'all':
      return { from: '2020-01-01', to }
    default:
      return { from: to, to }
  }
}

export function useDateRange(defaultPreset = 'month') {
  const initial = getPresetRange(defaultPreset)
  const dateFrom = ref(initial.from)
  const dateTo = ref(initial.to)
  const activePreset = ref(defaultPreset)

  function applyPreset(preset: string) {
    activePreset.value = preset
    const range = getPresetRange(preset)
    dateFrom.value = range.from
    dateTo.value = range.to
  }

  function clearPreset() {
    activePreset.value = ''
  }

  return {
    dateFrom,
    dateTo,
    activePreset,
    applyPreset,
    clearPreset,
    datePresets,
  }
}
