import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { MaintenanceTask } from '../types'
import {
  fetchMaintenanceTasks as apiFetch,
  createMaintenanceTask as apiCreate,
  updateMaintenanceTask as apiUpdate,
  deleteMaintenanceTask as apiDelete,
} from '../services/adminApi'

export const useMaintenanceTaskStore = defineStore('maintenanceTask', () => {
  const tasks = ref<MaintenanceTask[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 100,
  })

  async function loadTasks(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetch(params)
      const { data, current_page, last_page, total, per_page } = res.data.data
      tasks.value = data
      pagination.value = { currentPage: current_page, lastPage: last_page, total, perPage: per_page }
    } catch (e: unknown) {
      error.value = (e as { response?: { data?: { message?: string } } })?.response?.data?.message || '목록 로드 실패'
    } finally {
      loading.value = false
    }
  }

  async function addTask(data: Record<string, unknown>) {
    const res = await apiCreate(data)
    tasks.value.unshift(res.data.data)
    pagination.value.total++
  }

  async function editTask(id: number, data: Record<string, unknown>) {
    const res = await apiUpdate(id, data)
    const idx = tasks.value.findIndex(t => t.id === id)
    if (idx !== -1) tasks.value[idx] = res.data.data
  }

  async function removeTask(id: number) {
    await apiDelete(id)
    tasks.value = tasks.value.filter(t => t.id !== id)
    pagination.value.total--
  }

  return { tasks, loading, error, pagination, loadTasks, addTask, editTask, removeTask }
})
