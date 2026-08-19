import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import api from '@shared/api'
import type { Branch } from '@shared/types'

interface ApiResponse<T> { success: boolean; data: T; message?: string }

export const useBranchStore = defineStore('branch', () => {
  const branches = ref<Branch[]>([])
  const selectedBranchId = ref<number | null>(null)
  const loading = ref(false)

  const selectedBranch = computed(() =>
    branches.value.find(b => b.branch_id === selectedBranchId.value) ?? null
  )

  async function loadBranches() {
    loading.value = true
    try {
      const res = await api.get<ApiResponse<Branch[]>>('/admin/branches/dropdown')
      branches.value = res.data.data
    } catch {
      branches.value = []
    } finally {
      loading.value = false
    }
  }

  function selectBranch(id: number | null) {
    selectedBranchId.value = id
    if (id === null) {
      localStorage.removeItem('selectedBranchId')
    } else {
      localStorage.setItem('selectedBranchId', String(id))
    }
  }

  function restoreSelection() {
    const saved = localStorage.getItem('selectedBranchId')
    if (saved) {
      selectedBranchId.value = Number(saved)
    }
  }

  function getBranchParam(): Record<string, unknown> {
    return selectedBranchId.value ? { branch_id: selectedBranchId.value } : {}
  }

  return {
    branches,
    selectedBranchId,
    selectedBranch,
    loading,
    loadBranches,
    selectBranch,
    restoreSelection,
    getBranchParam,
  }
})
