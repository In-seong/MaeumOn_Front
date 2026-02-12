<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="고객 관리" />

      <main class="px-5 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Search -->
        <div class="relative mb-3 mt-2">
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="11" cy="11" r="7" stroke="#AAAAAA" stroke-width="2"/>
              <path d="M16 16L20 20" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
          <input
            v-model="store.searchQuery"
            type="text"
            placeholder="고객명 또는 연락처 검색"
            class="w-full bg-white rounded-[12px] pl-10 pr-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] shadow-[0_0_6px_rgba(0,0,0,0.05)]"
          />
        </div>

        <!-- Filter Chips -->
        <div class="flex gap-2 mb-3 overflow-x-auto scrollbar-hide">
          <button
            v-for="tag in filterTags"
            :key="tag"
            class="flex-shrink-0 px-3.5 py-1.5 rounded-full text-[13px] font-medium transition-all"
            :class="
              store.filterTag === tag
                ? 'bg-[#FF7B22] text-white shadow-[0_2px_8px_rgba(255,123,34,0.3)]'
                : 'bg-white text-[#888] border border-[#E8E8E8]'
            "
            @click="store.filterTag = tag"
          >
            {{ tag }}
          </button>
        </div>

        <!-- Sort + Count Row -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[13px] text-[#888]">
            총 <span class="font-semibold text-[#FF7B22]">{{ store.filteredCustomers.length }}</span>명
          </span>
          <select
            v-model="store.sortBy"
            class="text-[12px] text-[#888] bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 bg-no-repeat bg-[right_0px_center] bg-[length:12px]"
            style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')"
          >
            <option value="name">이름순</option>
            <option value="lastContact">최근연락순</option>
            <option value="registered">등록일순</option>
          </select>
        </div>

        <!-- Customer List -->
        <div class="flex flex-col gap-2.5">
          <CustomerListItem
            v-for="customer in store.filteredCustomers"
            :key="customer.customer_id"
            :customer="customer"
            :contract-count="store.getContractCount(customer.customer_id)"
            @click="goToDetail(customer.customer_id)"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="store.filteredCustomers.length === 0"
          class="flex flex-col items-center justify-center py-16"
        >
          <div class="w-[56px] h-[56px] rounded-full bg-[#F5F5F5] flex items-center justify-center mb-3">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <circle cx="9" cy="7" r="4" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <p class="text-[14px] text-[#AAAAAA]">검색 결과가 없습니다</p>
        </div>
      </main>

      <!-- Floating Add Button -->
      <button
        class="absolute bottom-[76px] right-5 w-[52px] h-[52px] rounded-full bg-[#FF7B22] text-white shadow-[0_4px_16px_rgba(255,123,34,0.4)] flex items-center justify-center active:scale-95 transition-transform z-30"
        @click="router.push({ name: 'customer-add' })"
        aria-label="고객 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CustomerListItem from '../../components/ui/CustomerListItem.vue'
import { useCustomerStore } from '../../stores/customerStore'

const router = useRouter()
const store = useCustomerStore()

const filterTags = ['전체', 'VIP', '신규', '관심', '일반'] as const

onMounted(() => {
  store.fetchCustomers()
})

function goToDetail(customerId: number): void {
  router.push({ name: 'customer-detail', params: { id: customerId } })
}
</script>
