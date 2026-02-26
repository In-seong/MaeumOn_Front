import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { AdminNotice } from '../types'
import {
  fetchNotices as apiFetchNotices,
  fetchNotice as apiFetchNotice,
  createNotice as apiCreateNotice,
  updateNotice as apiUpdateNotice,
  deleteNotice as apiDeleteNotice,
} from '../services/adminApi'

export const useNoticeStore = defineStore('notice', () => {
  const notices = ref<AdminNotice[]>([])
  const selectedNotice = ref<AdminNotice | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)
  const pagination = ref({
    currentPage: 1,
    lastPage: 1,
    total: 0,
    perPage: 15,
  })

  async function loadNotices(params?: {
    notice_type?: string
    is_pinned?: boolean
    page?: number
    per_page?: number
  }) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchNotices(params as Record<string, unknown>)
      const { data, current_page, last_page, total, per_page } = response.data.data
      notices.value = data
      pagination.value = {
        currentPage: current_page,
        lastPage: last_page,
        total,
        perPage: per_page,
      }
    } catch (e: any) {
      error.value = (e as any)?.response?.data?.message || '공지사항 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function loadNotice(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await apiFetchNotice(id)
      selectedNotice.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = (e as any)?.response?.data?.message || '공지사항을 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createNotice(data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiCreateNotice(data)
      notices.value.unshift(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = (e as any)?.response?.data?.message || '공지사항 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateNotice(id: number, data: Record<string, unknown>) {
    loading.value = true
    error.value = null

    try {
      const response = await apiUpdateNotice(id, data)
      const index = notices.value.findIndex(n => n.notice_id === id)
      if (index !== -1) {
        notices.value[index] = response.data.data
      }
      if (selectedNotice.value?.notice_id === id) {
        selectedNotice.value = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = (e as any)?.response?.data?.message || '공지사항 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteNotice(id: number) {
    loading.value = true
    error.value = null

    try {
      await apiDeleteNotice(id)
      notices.value = notices.value.filter(n => n.notice_id !== id)
      if (selectedNotice.value?.notice_id === id) {
        selectedNotice.value = null
      }
    } catch (e: any) {
      error.value = (e as any)?.response?.data?.message || '공지사항 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    notices,
    selectedNotice,
    loading,
    error,
    pagination,
    loadNotices,
    loadNotice,
    createNotice,
    updateNotice,
    deleteNotice,
  }
})
