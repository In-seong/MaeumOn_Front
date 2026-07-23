<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/40" />
      <div class="relative bg-white rounded-[16px] shadow-xl w-full max-w-[640px] mx-4 max-h-[80vh] flex flex-col">
        <!-- 헤더 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-[#F0F0F0]">
          <div>
            <h2 class="text-[16px] font-bold text-[#333]">{{ agentName }} 담당 고객</h2>
            <p class="text-[13px] text-[#999] mt-0.5">총 {{ totalCount }}명</p>
          </div>
          <button
            @click="$emit('close')"
            class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors"
          >
            <span class="material-symbols-outlined text-[20px] text-[#999]">close</span>
          </button>
        </div>

        <!-- 검색 -->
        <div class="px-6 py-3 border-b border-[#F0F0F0]">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="이름, 연락처로 검색"
            class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            @input="debouncedSearch"
          />
        </div>

        <!-- 테이블 -->
        <div class="flex-1 overflow-y-auto">
          <div v-if="loading" class="text-center py-10">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
            <p class="mt-2 text-[13px] text-[#999]">로딩 중...</p>
          </div>
          <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA] sticky top-0">
              <tr>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">이름</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">연락처</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">등록일</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-[#F0F0F0]">
              <tr
                v-for="customer in customers"
                :key="customer.customer_id"
                class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                @click="goToCustomer(customer.customer_id)"
              >
                <td class="px-6 py-3.5 whitespace-nowrap text-[14px] font-medium text-[#FF7B22] hover:underline">
                  {{ customer.name }}
                </td>
                <td class="px-6 py-3.5 whitespace-nowrap text-[14px] text-[#999]">
                  {{ formatPhone(customer.phone) }}
                </td>
                <td class="px-6 py-3.5 whitespace-nowrap text-[14px] text-[#999]">
                  {{ formatDate(customer.created_at) }}
                </td>
              </tr>
              <tr v-if="customers.length === 0 && !loading">
                <td colspan="3" class="px-6 py-10 text-center text-[#999] text-[14px]">
                  {{ searchQuery ? '검색 결과가 없습니다.' : '담당 고객이 없습니다.' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- 페이지네이션 -->
        <Pagination
          v-if="pagination && pagination.last_page > 1"
          :current-page="pagination.current_page"
          :last-page="pagination.last_page"
          @change="fetchCustomers"
        />
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchCustomers as apiFetchCustomers } from '../services/adminApi'
import type { AdminCustomer } from '../types'
import Pagination from './Pagination.vue'

const props = defineProps<{
  visible: boolean
  agentId: string
  agentName: string
}>()

const emit = defineEmits<{
  close: []
}>()

const router = useRouter()
const loading = ref(false)
const searchQuery = ref('')
const totalCount = ref(0)
const customers = ref<AdminCustomer[]>([])
const pagination = ref<{ current_page: number; last_page: number } | null>(null)

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchCustomers(1)
  }, 300)
}

async function fetchCustomers(page = 1) {
  loading.value = true
  try {
    const res = await apiFetchCustomers({
      agent_id: props.agentId,
      search: searchQuery.value || undefined,
      page,
      per_page: 10,
    })
    const data = res.data.data
    customers.value = data.data
    totalCount.value = data.total
    pagination.value = {
      current_page: data.current_page,
      last_page: data.last_page,
    }
  } catch {
    customers.value = []
    totalCount.value = 0
    pagination.value = null
  } finally {
    loading.value = false
  }
}

function goToCustomer(customerId: string) {
  emit('close')
  router.push(`/customers/${customerId}`)
}

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

watch(() => props.visible, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    fetchCustomers(1)
  }
})
</script>
