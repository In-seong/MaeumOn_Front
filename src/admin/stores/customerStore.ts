import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminCustomer, Memo, LaravelPagination } from '../types'
import {
  fetchCustomers as apiFetchCustomers,
  fetchCustomer as apiFetchCustomer,
  createCustomer as apiCreateCustomer,
  updateCustomer as apiUpdateCustomer,
  deleteCustomer as apiDeleteCustomer,
  fetchMemos as apiFetchMemos,
  createMemo as apiCreateMemo,
  updateMemo as apiUpdateMemo,
  deleteMemo as apiDeleteMemo,
} from '../services/adminApi'

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<AdminCustomer[]>([])
  const selectedCustomer = ref<AdminCustomer | null>(null)
  const memos = ref<Memo[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref<Omit<LaravelPagination<AdminCustomer>, 'data'> | null>(null)

  async function loadCustomers(params?: {
    search?: string
    is_active?: boolean
    page?: number
    per_page?: number
    sort_by?: string
    sort_direction?: string
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchCustomers(params as Record<string, unknown>)
      const { data, ...paginationData } = response.data.data
      customers.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '고객 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadCustomer(id: string) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchCustomer(id)
      selectedCustomer.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '고객 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCustomer(data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateCustomer(data)
      customers.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '고객 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCustomer(id: string, data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiUpdateCustomer(id, data)
      const index = customers.value.findIndex(c => c.customer_id === id)
      if (index !== -1) {
        customers.value[index] = response.data.data
      }
      if (selectedCustomer.value?.customer_id === id) {
        selectedCustomer.value = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '고객 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCustomer(id: string) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteCustomer(id)
      customers.value = customers.value.filter(c => c.customer_id !== id)
      if (selectedCustomer.value?.customer_id === id) {
        selectedCustomer.value = null
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '고객 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadMemos(customerId: string) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchMemos(customerId)
      const { data } = response.data.data
      memos.value = data
    } catch (e: any) {
      error.value = e.response?.data?.message || '메모 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function createMemo(customerId: string, data: { title?: string; content: string; memo_date: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateMemo(customerId, data)
      memos.value.unshift(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '메모 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateMemo(memoId: number, data: { title?: string; content?: string; memo_date?: string }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiUpdateMemo(memoId, data)
      const index = memos.value.findIndex(m => m.memo_id === memoId)
      if (index !== -1) {
        memos.value[index] = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '메모 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteMemo(memoId: number) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteMemo(memoId)
      memos.value = memos.value.filter(m => m.memo_id !== memoId)
    } catch (e: any) {
      error.value = e.response?.data?.message || '메모 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    customers,
    selectedCustomer,
    memos,
    loading,
    error,
    pagination,
    loadCustomers,
    loadCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    loadMemos,
    createMemo,
    updateMemo,
    deleteMemo,
  }
})
