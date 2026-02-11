import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { insuranceCompanyApi } from '@shared/services/insuranceApi'
import type { InsuranceCompany, PaginatedResponse } from '@shared/types'

export const useInsuranceStore = defineStore('insurance', () => {
  const companies = ref<InsuranceCompany[]>([])
  const pagination = ref<Omit<PaginatedResponse<InsuranceCompany>, 'data'> | null>(null)
  const currentCompany = ref<InsuranceCompany | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const activeCompanies = computed(() => companies.value.filter(c => c.is_active))

  async function fetchCompanies(params?: { search?: string; is_active?: boolean; per_page?: number; page?: number }) {
    loading.value = true
    error.value = null

    try {
      const response = await insuranceCompanyApi.getList(params)
      const { data, ...paginationData } = response.data.data
      companies.value = data
      pagination.value = paginationData
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 목록을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  async function fetchCompany(id: number) {
    loading.value = true
    error.value = null

    try {
      const response = await insuranceCompanyApi.get(id)
      currentCompany.value = response.data.data
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 정보를 불러오는데 실패했습니다.'
      return null
    } finally {
      loading.value = false
    }
  }

  async function createCompany(data: Partial<InsuranceCompany>) {
    loading.value = true
    error.value = null

    try {
      const response = await insuranceCompanyApi.create(data)
      companies.value.push(response.data.data)
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 등록에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function updateCompany(id: number, data: Partial<InsuranceCompany>) {
    loading.value = true
    error.value = null

    try {
      const response = await insuranceCompanyApi.update(id, data)
      const index = companies.value.findIndex(c => c.company_id === id)
      if (index !== -1) {
        companies.value[index] = response.data.data
      }
      if (currentCompany.value?.company_id === id) {
        currentCompany.value = response.data.data
      }
      return response.data.data
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 수정에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteCompany(id: number) {
    loading.value = true
    error.value = null

    try {
      await insuranceCompanyApi.delete(id)
      companies.value = companies.value.filter(c => c.company_id !== id)
      if (currentCompany.value?.company_id === id) {
        currentCompany.value = null
      }
    } catch (e: any) {
      error.value = e.response?.data?.message || '보험사 삭제에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  return {
    companies,
    pagination,
    currentCompany,
    loading,
    error,
    activeCompanies,
    fetchCompanies,
    fetchCompany,
    createCompany,
    updateCompany,
    deleteCompany,
  }
})
