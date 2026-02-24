<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="청구 관리" />

      <main class="px-5 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Search + New Claim Button Row -->
        <div class="flex items-center gap-2 mb-4">
          <div class="relative flex-1">
            <svg
              class="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-[#BBB]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              :value="store.searchQuery"
              placeholder="고객명, 보험사, 청구유형 검색"
              class="w-full pl-10 pr-4 py-3 bg-white rounded-[12px] border border-[#E8E8E8] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22] transition-colors"
              aria-label="청구 검색"
              @input="store.setSearchQuery(($event.target as HTMLInputElement).value)"
            />
            <button
              v-if="store.searchQuery"
              type="button"
              class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 flex items-center justify-center text-[#BBB] hover:text-[#888]"
              aria-label="검색어 지우기"
              @click="store.setSearchQuery('')"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            type="button"
            class="flex-shrink-0 px-3 py-3 bg-[#FF7B22] text-white text-[13px] font-semibold rounded-[12px] active:scale-[0.97] transition-all"
            @click="router.push('/claims/new')"
          >
            + 새 청구
          </button>
        </div>

        <!-- Status Filter Chips -->
        <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide -mx-5 px-5" role="tablist" aria-label="청구 상태 필터">
          <button
            v-for="chip in filterChips"
            :key="chip.value"
            role="tab"
            :aria-selected="store.filterStatus === chip.value"
            :class="[
              'flex-shrink-0 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all',
              store.filterStatus === chip.value
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white text-[#888] border border-[#E8E8E8]',
            ]"
            @click="store.setFilter(chip.value)"
          >
            {{ chip.label }}
            <span
              :class="[
                'ml-1 text-[10px]',
                store.filterStatus === chip.value ? 'text-white/80' : 'text-[#BBB]',
              ]"
            >
              {{ store.statusCounts[chip.value] }}
            </span>
          </button>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Claim List -->
        <div v-else-if="store.filteredClaims.length > 0" class="flex flex-col gap-3">
          <ClaimListItem
            v-for="claim in store.filteredClaims"
            :key="claim.claim_id"
            :claim="claim"
            @select="goToDetail"
          />
        </div>

        <!-- Empty State -->
        <div v-else class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-[#FFF3ED] rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p class="text-[15px] font-medium text-[#888]">청구 내역이 없습니다</p>
          <p v-if="store.searchQuery" class="text-[13px] text-[#BBB] mt-1">
            "{{ store.searchQuery }}" 검색 결과가 없습니다
          </p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import ClaimListItem from '../../components/ui/ClaimListItem.vue'
import { useAgentClaimStore } from '../../stores/agentClaimStore'

const router = useRouter()
const store = useAgentClaimStore()

interface FilterChip {
  label: string
  value: 'all' | 'pending' | 'processing' | 'approved' | 'rejected' | 'paid'
}

const filterChips: FilterChip[] = [
  { label: '전체', value: 'all' },
  { label: '접수대기', value: 'pending' },
  { label: '처리중', value: 'processing' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
  { label: '지급완료', value: 'paid' },
]

onMounted(() => {
  store.loadClaims()
})

function goToDetail(id: number): void {
  router.push(`/claims/${id}`)
}
</script>

<style scoped>
.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
