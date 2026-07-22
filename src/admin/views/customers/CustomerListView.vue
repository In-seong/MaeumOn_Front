<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">고객 관리</h1>
      <router-link
        to="/customers/create"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        고객 등록
      </router-link>
    </div>

    <!-- 검색 및 필터 -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="이름, 전화번호, 주민번호로 검색"
        class="flex-1 px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <div class="relative" ref="agentDropdownRef">
        <button
          type="button"
          class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] min-w-[160px] text-left flex items-center justify-between gap-2 hover:border-[#CCC] transition-colors"
          :class="{ 'border-[#FF7B22]': agentDropdownOpen }"
          @click="agentDropdownOpen = !agentDropdownOpen"
        >
          <span :class="{ 'text-[#999]': !agentFilter }">{{ agentFilterLabel }}</span>
          <svg class="w-4 h-4 text-[#999] shrink-0 transition-transform" :class="{ 'rotate-180': agentDropdownOpen }" viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/></svg>
        </button>
        <div
          v-if="agentDropdownOpen"
          class="absolute top-full left-0 mt-1 w-[240px] bg-white border border-[#E8E8E8] rounded-[12px] shadow-lg z-50 overflow-hidden"
        >
          <div class="p-2 border-b border-[#F0F0F0]">
            <input
              ref="agentSearchInputRef"
              v-model="agentSearchQuery"
              type="text"
              placeholder="설계사 이름 검색"
              class="w-full px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#999] focus:outline-none focus:border-[#FF7B22]"
            />
          </div>
          <ul class="max-h-[240px] overflow-y-auto py-1">
            <li
              class="px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[#FFF3ED] transition-colors"
              :class="{ 'text-[#FF7B22] font-medium bg-[#FFF8F3]': agentFilter === '' }"
              @click="selectAgent('')"
            >전체 설계사</li>
            <li
              class="px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[#FFF3ED] transition-colors"
              :class="{ 'text-[#FF7B22] font-medium bg-[#FFF8F3]': agentFilter === 'null' }"
              @click="selectAgent('null')"
            >미배정 고객</li>
            <li
              v-for="agent in filteredAgentList"
              :key="agent.agent_id"
              class="px-4 py-2.5 text-[13px] cursor-pointer hover:bg-[#FFF3ED] transition-colors"
              :class="{ 'text-[#FF7B22] font-medium bg-[#FFF8F3]': agentFilter === agent.agent_id }"
              @click="selectAgent(agent.agent_id)"
            >{{ agent.name }}</li>
            <li v-if="filteredAgentList.length === 0 && agentSearchQuery" class="px-4 py-3 text-[13px] text-[#999] text-center">
              검색 결과 없음
            </li>
          </ul>
        </div>
      </div>
      <select
        v-model="activeFilter"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option value="true">활성화</option>
        <option value="false">비활성화</option>
      </select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider cursor-pointer select-none hover:text-[#333]" @click="handleSort('name')">이름 {{ sortIcon('name') }}</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">전화번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">만나이</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">담당 설계사</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(customer, index) in store.customers"
            :key="customer.customer_id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="goToDetail(customer.customer_id)"
          >
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ customer.name }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatPhone(customer.phone) }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">{{ calcAge(customer.birth_date) }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden lg:table-cell">{{ customer.agent?.name || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span
                :class="customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ customer.is_active ? '활성화' : '비활성화' }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium" @click.stop>
              <router-link
                :to="`/customers/${customer.customer_id}`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                상세
              </router-link>
              <router-link
                :to="`/customers/${customer.customer_id}/edit`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3 hidden sm:inline"
              >
                수정
              </router-link>
              <button
                @click="handleDelete(customer)"
                class="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="store.customers.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-[#999]">
              등록된 고객이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <Pagination
        v-if="store.pagination"
        :current-page="store.pagination.current_page"
        :last-page="store.pagination.last_page"
        @change="goToPage"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '../../stores/customerStore'
import { fetchAgents } from '../../services/adminApi'
import Pagination from '../../components/Pagination.vue'
import { useSortable } from '../../composables/useSortable'
import type { AdminCustomer, AdminAgent } from '../../types'

const router = useRouter()
const store = useCustomerStore()

const searchQuery = ref('')
const activeFilter = ref('')
const agentFilter = ref('')
const agentList = ref<AdminAgent[]>([])
const agentDropdownOpen = ref(false)
const agentSearchQuery = ref('')
const agentDropdownRef = ref<HTMLElement | null>(null)
const agentSearchInputRef = ref<HTMLInputElement | null>(null)

const sortedAgentList = computed(() =>
  [...agentList.value].sort((a, b) => a.name.localeCompare(b.name, 'ko'))
)

const filteredAgentList = computed(() => {
  if (!agentSearchQuery.value) return sortedAgentList.value
  const q = agentSearchQuery.value.toLowerCase()
  return sortedAgentList.value.filter(a => a.name.toLowerCase().includes(q))
})

const agentFilterLabel = computed(() => {
  if (agentFilter.value === '') return '전체 설계사'
  if (agentFilter.value === 'null') return '미배정 고객'
  const found = agentList.value.find(a => a.agent_id === agentFilter.value)
  return found?.name ?? '전체 설계사'
})

function selectAgent(value: string) {
  agentFilter.value = value
  agentDropdownOpen.value = false
  agentSearchQuery.value = ''
  fetchData()
}

function handleClickOutside(e: MouseEvent) {
  if (agentDropdownRef.value && !agentDropdownRef.value.contains(e.target as Node)) {
    agentDropdownOpen.value = false
    agentSearchQuery.value = ''
  }
}

watch(agentDropdownOpen, (open) => {
  if (open) {
    nextTick(() => agentSearchInputRef.value?.focus())
  }
})
const { toggleSort, sortParams, sortIcon } = useSortable()

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
}

async function fetchData(page = 1) {
  await store.loadCustomers({
    search: searchQuery.value || undefined,
    is_active: activeFilter.value ? activeFilter.value === 'true' : undefined,
    agent_id: agentFilter.value || undefined,
    page,
    ...sortParams(),
  })
}

function handleSort(field: string) {
  toggleSort(field)
  fetchData()
}

function goToPage(page: number) {
  fetchData(page)
}

function goToDetail(customerId: string) {
  router.push(`/customers/${customerId}`)
}

function rowNum(index: number): number {
  const p = store.pagination
  return ((p?.current_page ?? 1) - 1) * (p?.per_page ?? 15) + index + 1
}

function calcAge(bd?: string): string {
  if (!bd) return '-'
  const birth = new Date(bd)
  if (isNaN(birth.getTime())) return '-'
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age}세`
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

async function handleDelete(customer: AdminCustomer) {
  if (!confirm(`"${customer.name}" 고객을 비활성화하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteCustomer(customer.customer_id)
    alert('비활성화되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '처리에 실패했습니다.')
  }
}

async function loadAgentList() {
  try {
    const res = await fetchAgents({ per_page: 200 })
    agentList.value = res.data.data.data
  } catch {
    // 설계사 목록 로드 실패해도 고객 목록은 정상 표시
  }
}

onMounted(() => {
  loadAgentList()
  fetchData()
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>
