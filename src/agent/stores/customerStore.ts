import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Customer, Contract, Memo } from '../types'
import {
  fetchCustomers as apiFetchCustomers,
  fetchCustomer as apiFetchCustomer,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  fetchCustomerContracts as apiFetchContracts,
  fetchMemos as apiFetchMemos,
  createMemo as apiCreateMemo,
  updateMemo as apiUpdateMemo,
  deleteMemo as apiDeleteMemo,
} from '../services/agentApi'

export const useCustomerStore = defineStore('customer', () => {
  // ===== State =====
  const customers = ref<Customer[]>([])
  const selectedCustomer = ref<Customer | null>(null)
  const contracts = ref<Contract[]>([])
  const memos = ref<Memo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)

  // UI state
  const searchQuery = ref('')
  const sortBy = ref<'name' | 'created_at'>('created_at')

  // Pagination
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  // ===== Actions =====
  async function loadCustomers(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        sort_by: sortBy.value,
        sort_direction: 'desc',
        ...params,
      }
      if (searchQuery.value.trim()) {
        queryParams.search = searchQuery.value.trim()
      }
      const res = await apiFetchCustomers(queryParams)
      const paginated = res.data.data
      customers.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '고객 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadCustomer(id: string) {
    loading.value = true
    error.value = null
    try {
      const res = await apiFetchCustomer(id)
      selectedCustomer.value = res.data.data
      // Populate relations from eager-loaded data
      if (selectedCustomer.value?.contracts) {
        contracts.value = selectedCustomer.value.contracts
      }
      if (selectedCustomer.value?.memos) {
        memos.value = selectedCustomer.value.memos
      }
      return selectedCustomer.value
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '고객 정보를 불러오는데 실패했습니다.'
      return undefined
    } finally {
      loading.value = false
    }
  }

  async function addCustomer(data: Partial<Customer>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiCreateCustomer(data)
      const newCustomer = res.data.data
      customers.value.unshift(newCustomer)
      return newCustomer
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '고객 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function editCustomer(id: string, data: Partial<Customer>) {
    loading.value = true
    error.value = null
    try {
      const res = await apiUpdateCustomer(id, data)
      const updated = res.data.data
      const index = customers.value.findIndex((c) => c.customer_id === id)
      if (index !== -1) {
        customers.value[index] = updated
      }
      if (selectedCustomer.value?.customer_id === id) {
        selectedCustomer.value = updated
      }
      return updated
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '고객 정보 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function removeCustomer(id: string) {
    loading.value = true
    error.value = null
    try {
      await apiDeleteCustomer(id)
      customers.value = customers.value.filter((c) => c.customer_id !== id)
      if (selectedCustomer.value?.customer_id === id) {
        selectedCustomer.value = null
      }
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '고객 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadContracts(customerId: string) {
    try {
      const res = await apiFetchContracts(customerId)
      contracts.value = res.data.data.data
    } catch {
      contracts.value = []
    }
  }

  async function loadMemos(customerId: string) {
    try {
      const res = await apiFetchMemos(customerId)
      memos.value = res.data.data.data
    } catch {
      memos.value = []
    }
  }

  async function addMemo(customerId: string, data: { title?: string; content: string; memo_date: string }) {
    try {
      const res = await apiCreateMemo(customerId, data)
      memos.value.unshift(res.data.data)
      return res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메모 등록에 실패했습니다.'
      throw e
    }
  }

  async function editMemo(memoId: number, data: { title?: string; content?: string; memo_date?: string }) {
    try {
      const res = await apiUpdateMemo(memoId, data)
      const index = memos.value.findIndex((m) => m.memo_id === memoId)
      if (index !== -1) {
        memos.value[index] = res.data.data
      }
      return res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메모 수정에 실패했습니다.'
      throw e
    }
  }

  async function removeMemo(memoId: number) {
    try {
      await apiDeleteMemo(memoId)
      memos.value = memos.value.filter((m) => m.memo_id !== memoId)
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메모 삭제에 실패했습니다.'
      throw e
    }
  }

  return {
    // State
    customers,
    selectedCustomer,
    contracts,
    memos,
    loading,
    error,
    searchQuery,
    sortBy,
    currentPage,
    lastPage,
    total,

    // Actions
    loadCustomers,
    loadCustomer,
    addCustomer,
    editCustomer,
    removeCustomer,
    loadContracts,
    loadMemos,
    addMemo,
    editMemo,
    removeMemo,
  }
})
