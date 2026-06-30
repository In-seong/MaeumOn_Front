import { ref } from 'vue'

export interface SortState {
  field: string
  direction: 'asc' | 'desc'
}

export function useSortable(defaultField = 'created_at', defaultDirection: 'asc' | 'desc' = 'desc') {
  const sortField = ref(defaultField)
  const sortDirection = ref<'asc' | 'desc'>(defaultDirection)

  function toggleSort(field: string) {
    if (sortField.value === field) {
      sortDirection.value = sortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      sortField.value = field
      sortDirection.value = 'asc'
    }
  }

  function sortParams(): { sort_by: string; sort_direction: string } {
    return {
      sort_by: sortField.value,
      sort_direction: sortDirection.value,
    }
  }

  function sortIcon(field: string): string {
    if (sortField.value !== field) return ''
    return sortDirection.value === 'asc' ? '↑' : '↓'
  }

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortParams,
    sortIcon,
  }
}
