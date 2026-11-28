<template>
  <div class="min-h-screen bg-[#E8E9EB] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-[#F4F5F7]">
      <header class="flex items-center h-[56px] px-5">
        <button v-if="showBack" class="mr-2 -ml-1 p-1" @click="router.back()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </button>
        <span class="text-[18px] font-bold text-[#1c1c1c]">고객 관리</span>
      </header>

      <main
        ref="scrollContainer"
        class="px-4 py-3 pb-24 overflow-y-auto"
        :style="mainStyle('calc(100dvh - 56px)', 80)"
        @scroll="handleScroll"
        @focusin="handleFocusIn"
      >
        <!-- Search -->
        <div class="relative mb-3">
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
            class="w-full bg-white rounded-[12px] pl-10 pr-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF6B2D] transition-colors text-[#333] shadow-[0_0_6px_rgba(0,0,0,0.05)]"
            @input="handleSearch"
          />
        </div>

        <!-- Sort + Count Row -->
        <div class="flex items-center justify-between mb-3">
          <span class="text-[13px] text-[#888]">
            총 <span class="font-semibold text-[#FF6B2D]">{{ store.total }}</span>명
          </span>
          <select
            v-model="store.sortBy"
            class="text-[12px] text-[#888] bg-transparent border-none outline-none cursor-pointer appearance-none pr-4 bg-no-repeat bg-[right_0px_center] bg-[length:12px]"
            style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2212%22 height=%2212%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')"
            @change="handleSortChange"
          >
            <option value="name">이름순</option>
            <option value="created_at">등록일순</option>
          </select>
        </div>

        <!-- Customer List -->
        <div class="flex flex-col gap-2.5">
          <CustomerListItem
            v-for="customer in store.customers"
            :key="customer.customer_id"
            :customer="customer"
            @click="goToDetail(customer.customer_id)"
          />
        </div>

        <!-- Empty State -->
        <div
          v-if="store.customers.length === 0 && !store.loading"
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

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Load More Indicator -->
        <div v-if="loadingMore" class="flex justify-center py-4">
          <p class="text-[12px] text-[#BBB]">더 불러오는 중...</p>
        </div>
      </main>

      <!-- Floating Add Button -->
      <button
        class="absolute bottom-[76px] right-5 w-[52px] h-[52px] rounded-full bg-[#FF6B2D] text-white shadow-[0_4px_16px_rgba(255,123,34,0.4)] flex items-center justify-center active:scale-95 transition-transform z-30"
        @click="router.push({ name: 'customer-add' })"
        aria-label="고객 추가"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 5V19M5 12H19" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useKeyboardSafe } from '../../composables/useKeyboardSafe'
import CustomerListItem from '../../components/ui/CustomerListItem.vue'
import { useCustomerStore } from '../../stores/customerStore'

const { handleFocusIn, mainStyle } = useKeyboardSafe()
const route = useRoute()
const router = useRouter()
const showBack = computed(() => route.query.from === 'home')
const store = useCustomerStore()

const scrollContainer = ref<HTMLElement | null>(null)
const loadingMore = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

onMounted(async () => {
  if (store.customers.length > 0) {
    await nextTick()
    if (scrollContainer.value) {
      scrollContainer.value.scrollTop = store.listScrollTop
    }
  } else {
    store.currentPage = 1
    store.loadCustomers()
  }
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
  if (scrollContainer.value) {
    store.listScrollTop = scrollContainer.value.scrollTop
  }
  router.push({ name: 'customer-detail', params: { id: customerId } })
}

async function handleScroll(): Promise<void> {
  const el = scrollContainer.value
  if (!el || loadingMore.value || store.loading) return
  if (store.currentPage >= store.lastPage) return

  const threshold = 100
  const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
  if (distanceFromBottom < threshold) {
    loadingMore.value = true
    store.currentPage += 1
    try {
      const res = await import('../../services/agentApi').then(m => m.fetchCustomers({
        page: store.currentPage,
        sort_by: store.sortBy,
        sort_direction: 'desc',
        ...(store.searchQuery.trim() ? { search: store.searchQuery.trim() } : {}),
      }))
      const paginated = res.data.data
      store.customers.push(...paginated.data)
      store.lastPage = paginated.last_page
      store.total = paginated.total
    } catch {
      store.currentPage -= 1
    } finally {
      loadingMore.value = false
    }
  }
}
</script>
