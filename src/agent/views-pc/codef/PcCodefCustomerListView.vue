<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">보험·건강 조회</h1>

    <!-- 검색 -->
    <div class="flex items-center gap-3 mb-4">
      <div class="relative flex-1 max-w-[400px]">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#AAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      <span class="text-[13px] text-[#888] whitespace-nowrap">
        총 <span class="font-semibold text-[#FF7B22]">{{ store.customers.length }}</span>명
      </span>
    </div>

    <!-- 로딩 -->
    <div v-if="store.customersLoading" class="text-center py-10">
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
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">만나이</th>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider">보험</th>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider">진료</th>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider">검진</th>
            <th class="px-6 py-3 text-center text-[12px] font-medium text-[#999] uppercase tracking-wider">건강나이</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(c, index) in store.customers"
            :key="c.customer_id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="goToDashboard(c.customer_id)"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ index + 1 }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ c.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ formatPhone(c.phone) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#666]">{{ calcAge(c.birth_date) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="c.insurance_synced_at ? 'bg-blue-50 text-blue-600' : 'bg-gray-50 text-[#CCC]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ c.insurance_synced_at ? '연동' : '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="c.medical_synced_at ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-[#CCC]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ c.medical_synced_at ? '연동' : '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="c.checkup_synced_at ? 'bg-purple-50 text-purple-600' : 'bg-gray-50 text-[#CCC]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ c.checkup_synced_at ? '연동' : '-' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-center">
              <span
                :class="c.health_age_synced_at ? 'bg-orange-50 text-orange-600' : 'bg-gray-50 text-[#CCC]'"
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
              >{{ c.health_age_synced_at ? '연동' : '-' }}</span>
            </td>
          </tr>
          <tr v-if="store.customers.length === 0">
            <td colspan="8" class="px-6 py-16 text-center text-[14px] text-[#999]">
              {{ store.searchQuery ? `"${store.searchQuery}" 검색 결과가 없습니다` : '담당 고객이 없습니다' }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCodefStore } from '../../stores/codefStore'

const router = useRouter()
const store = useCodefStore()

let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  store.loadCustomers()
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})

function handleSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    store.loadCustomers()
  }, 400)
}

function goToDashboard(customerId: string) {
  router.push({ name: 'codef-dashboard', params: { customerId } })
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
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return phone
}
</script>
