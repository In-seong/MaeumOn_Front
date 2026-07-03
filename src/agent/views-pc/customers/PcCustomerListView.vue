<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">고객 관리</h1>
      <button
        class="px-4 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] transition-colors"
        @click="router.push({ name: 'customer-add' })"
      >
        + 고객 등록
      </button>
    </div>

    <!-- 검색 + 정렬 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1 max-w-[400px]">
        <svg
          class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#AAA]"
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <path d="M16 16L20 20" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="고객명 또는 연락처 검색"
          class="w-full pl-10 pr-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22] transition-colors"
          @input="handleSearch"
        />
      </div>
      <select
        v-model="store.sortBy"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] outline-none focus:border-[#FF7B22] transition-colors"
        @change="handleSortChange"
      >
        <option value="name">이름순</option>
        <option value="created_at">등록일순</option>
      </select>
      <span class="text-[13px] text-[#888] whitespace-nowrap">
        총 <span class="font-semibold text-[#FF7B22]">{{ store.total }}</span>명
      </span>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto" />
      <p class="mt-2 text-[14px] text-[#999]">불러오는 중...</p>
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">No.</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">이름</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">전화번호</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">만나이</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">성별</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">등록일</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(customer, index) in store.customers"
            :key="customer.customer_id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="goToDetail(customer.customer_id)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ rowNum(index) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ customer.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ formatPhone(customer.phone) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] hidden md:table-cell">{{ calcAge(customer.birth_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666] hidden lg:table-cell">{{ genderLabel(customer.gender) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden lg:table-cell">{{ formatDate(customer.created_at) }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ customer.is_active ? '활성' : '비활성' }}
              </span>
            </td>
          </tr>
          <tr v-if="store.customers.length === 0">
            <td colspan="7" class="px-6 py-16 text-center text-[14px] text-[#999]">
              {{ store.searchQuery ? `"${store.searchQuery}" 검색 결과가 없습니다` : '등록된 고객이 없습니다' }}
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="store.lastPage > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex items-center justify-center gap-1">
          <button
            :disabled="store.currentPage <= 1"
            class="px-3 py-1.5 rounded-[8px] text-[13px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(store.currentPage - 1)"
          >
            이전
          </button>
          <button
            v-for="page in visiblePages"
            :key="page"
            :class="[
              'px-3 py-1.5 rounded-[8px] text-[13px] transition-colors',
              page === store.currentPage
                ? 'bg-[#FF7B22] text-white'
                : 'text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]',
            ]"
            @click="goToPage(page)"
          >
            {{ page }}
          </button>
          <button
            :disabled="store.currentPage >= store.lastPage"
            class="px-3 py-1.5 rounded-[8px] text-[13px] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            @click="goToPage(store.currentPage + 1)"
          >
            다음
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCustomerStore } from '../../stores/customerStore'

const router = useRouter()
const store = useCustomerStore()

let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  store.currentPage = 1
  store.loadCustomers()
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})

function handleSearch(): void {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.currentPage = 1
    store.loadCustomers()
  }, 400)
}

function handleSortChange(): void {
  store.currentPage = 1
  store.loadCustomers()
}

function goToDetail(customerId: string): void {
  router.push({ name: 'customer-detail', params: { id: customerId } })
}

function goToPage(page: number): void {
  if (page < 1 || page > store.lastPage) return
  store.currentPage = page
  store.loadCustomers()
}

function rowNum(index: number): number {
  return (store.currentPage - 1) * 15 + index + 1
}

const visiblePages = computed(() => {
  const pages: number[] = []
  const total = store.lastPage
  const current = store.currentPage
  let start = Math.max(1, current - 2)
  let end = Math.min(total, current + 2)
  if (end - start < 4) {
    if (start === 1) end = Math.min(total, start + 4)
    else start = Math.max(1, end - 4)
  }
  for (let i = start; i <= end; i++) pages.push(i)
  return pages
})

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
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return phone
}

function genderLabel(gender?: string): string {
  if (gender === 'M') return '남'
  if (gender === 'F') return '여'
  return '-'
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}
</script>
