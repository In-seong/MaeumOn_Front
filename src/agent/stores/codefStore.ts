import { defineStore } from 'pinia'
import { ref } from 'vue'
import type {
  CodefCustomerSync, MedicalRecordFull, HealthCheckupRecord, HealthAgeRecord,
} from '../types'
import type { InsuranceContract } from '@shared/types'
import * as api from '../services/agentApi'

export const useCodefStore = defineStore('codef', () => {
  const customers = ref<CodefCustomerSync[]>([])
  const customersLoading = ref(false)
  const searchQuery = ref('')

  const insuranceList = ref<InsuranceContract[]>([])
  const insuranceDetail = ref<InsuranceContract | null>(null)
  const medicalRecords = ref<MedicalRecordFull[]>([])
  const checkups = ref<HealthCheckupRecord[]>([])
  const healthAge = ref<HealthAgeRecord | null>(null)

  const tabLoading = ref(false)

  async function loadCustomers() {
    customersLoading.value = true
    try {
      const res = await api.fetchCodefCustomers(
        searchQuery.value ? { search: searchQuery.value } : undefined
      )
      customers.value = res.data.data as CodefCustomerSync[]
    } catch {
      customers.value = []
    } finally {
      customersLoading.value = false
    }
  }

  async function loadInsurance(customerId: string) {
    tabLoading.value = true
    try {
      const res = await api.getInsuranceContracts(customerId)
      insuranceList.value = res.data.data
    } catch {
      insuranceList.value = []
    } finally {
      tabLoading.value = false
    }
  }

  async function loadInsuranceDetail(customerId: string, insuranceId: number) {
    tabLoading.value = true
    try {
      const res = await api.getInsuranceDetail(customerId, insuranceId)
      insuranceDetail.value = res.data.data
    } catch {
      insuranceDetail.value = null
    } finally {
      tabLoading.value = false
    }
  }

  async function loadMedical(customerId: string) {
    tabLoading.value = true
    try {
      const res = await api.getMedicalRecords(customerId)
      medicalRecords.value = res.data.data
    } catch {
      medicalRecords.value = []
    } finally {
      tabLoading.value = false
    }
  }

  async function loadCheckups(customerId: string) {
    tabLoading.value = true
    try {
      const res = await api.getCheckups(customerId)
      checkups.value = res.data.data
    } catch {
      checkups.value = []
    } finally {
      tabLoading.value = false
    }
  }

  async function loadHealthAge(customerId: string) {
    tabLoading.value = true
    try {
      const res = await api.getHealthAge(customerId)
      healthAge.value = res.data.data
    } catch {
      healthAge.value = null
    } finally {
      tabLoading.value = false
    }
  }

  function resetDetail() {
    insuranceList.value = []
    insuranceDetail.value = null
    medicalRecords.value = []
    checkups.value = []
    healthAge.value = null
  }

  return {
    customers, customersLoading, searchQuery,
    insuranceList, insuranceDetail,
    medicalRecords, checkups, healthAge,
    tabLoading,
    loadCustomers, loadInsurance, loadInsuranceDetail,
    loadMedical, loadCheckups, loadHealthAge,
    resetDetail,
  }
})
