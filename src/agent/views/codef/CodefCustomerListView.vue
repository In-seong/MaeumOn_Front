<template>
  <div class="min-h-screen bg-[#F8F8F8]">
    <BackHeader title="보험·건강 조회" />

    <div class="px-4 pt-3 pb-28">
      <!-- 검색 -->
      <div class="relative mb-4">
        <svg class="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-[#AAA]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="7" stroke-width="2" />
          <path d="M16 16L20 20" stroke-width="2" stroke-linecap="round" />
        </svg>
        <input
          v-model="store.searchQuery"
          type="text"
          placeholder="고객명 또는 연락처 검색"
          class="w-full pl-10 pr-4 py-3 bg-white border border-[#E8E8E8] rounded-[14px] text-[14px] text-[#333] placeholder-[#999] outline-none focus:border-[#FF7B22]"
          @input="handleSearch"
        />
      </div>

      <!-- 로딩 -->
      <div v-if="store.customersLoading" class="text-center py-16">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto" />
        <p class="mt-3 text-[13px] text-[#999]">불러오는 중...</p>
      </div>

      <!-- 고객 리스트 -->
      <div v-else-if="store.customers.length > 0" class="space-y-2">
        <button
          v-for="c in store.customers"
          :key="c.customer_id"
          class="w-full bg-white rounded-[14px] border border-[#E8E8E8] p-4 text-left active:scale-[0.98] transition-transform"
          @click="goToDashboard(c.customer_id)"
        >
          <div class="flex items-center gap-3">
            <div class="w-[42px] h-[42px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <span class="text-[15px] font-bold text-[#FF7B22]">{{ c.name.charAt(0) }}</span>
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-0.5">
                <span class="text-[15px] font-semibold text-[#222] truncate">{{ c.name }}</span>
                <span v-if="calcAge(c.birth_date)" class="text-[12px] text-[#999]">{{ calcAge(c.birth_date) }}</span>
              </div>
              <p class="text-[13px] text-[#888]">{{ c.phone }}</p>
            </div>
            <svg class="w-5 h-5 text-[#CCC] flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path d="M9 5l7 7-7 7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </div>
          <!-- 동기화 상태 뱃지 -->
          <div class="flex flex-wrap gap-1.5 mt-2.5 ml-[54px]">
            <span
              v-if="c.insurance_synced_at"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-blue-50 text-blue-600"
            >보험 ✓</span>
            <span
              v-if="c.medical_synced_at"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-green-50 text-green-600"
            >진료 ✓</span>
            <span
              v-if="c.checkup_synced_at"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-purple-50 text-purple-600"
            >검진 ✓</span>
            <span
              v-if="c.health_age_synced_at"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-orange-50 text-orange-600"
            >건강나이 ✓</span>
            <span
              v-if="!c.insurance_synced_at && !c.medical_synced_at && !c.checkup_synced_at && !c.health_age_synced_at"
              class="px-2 py-0.5 rounded-full text-[11px] font-medium bg-gray-100 text-[#999]"
            >미연동</span>
          </div>
        </button>
      </div>

      <!-- 빈 상태 -->
      <div v-else class="text-center py-16">
        <p class="text-[14px] text-[#999]">
          {{ store.searchQuery ? `"${store.searchQuery}" 검색 결과가 없습니다` : '담당 고객이 없습니다' }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
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
  if (!bd) return ''
  const birth = new Date(bd)
  if (isNaN(birth.getTime())) return ''
  const today = new Date()
  let age = today.getFullYear() - birth.getFullYear()
  const m = today.getMonth() - birth.getMonth()
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--
  return `${age}세`
}
</script>
