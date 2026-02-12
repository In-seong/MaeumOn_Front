<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="청구 관리" />

      <main class="px-5 py-3 pb-20 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Search Input -->
        <div class="relative mb-4">
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

        <!-- Status Filter Chips -->
        <div class="flex gap-2 mb-4 overflow-x-auto scrollbar-hide" role="tablist" aria-label="청구 상태 필터">
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

        <!-- Claim List -->
        <div v-if="store.filteredClaims.length > 0" class="flex flex-col gap-3">
          <ClaimListItem
            v-for="claim in store.filteredClaims"
            :key="claim.claim_id"
            :claim="claim"
            @select="openDetail"
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

        <!-- Detail Modal -->
        <Teleport to="body">
          <Transition name="slide-up">
            <div
              v-if="selectedClaim"
              class="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[68px]"
              role="dialog"
              aria-modal="true"
              :aria-label="`${selectedClaim.customer_name} 청구 상세`"
            >
              <!-- Backdrop -->
              <div
                class="absolute inset-0 bg-black/40"
                @click="closeDetail"
              />

              <!-- Modal Content -->
              <div class="relative w-full max-w-[354px] bg-white rounded-[20px] shadow-2xl max-h-[80vh] overflow-y-auto z-10">
                <!-- Handle Bar -->
                <div class="flex justify-center pt-3 pb-2">
                  <div class="w-10 h-1 bg-[#DDD] rounded-full" />
                </div>

                <!-- Header -->
                <div class="px-5 pb-3 border-b border-[#F0F0F0]">
                  <div class="flex items-center justify-between">
                    <h3 class="text-[17px] font-bold text-[#222]">청구 상세</h3>
                    <button
                      type="button"
                      class="w-8 h-8 flex items-center justify-center text-[#AAA] hover:text-[#555]"
                      aria-label="닫기"
                      @click="closeDetail"
                    >
                      <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                <!-- Detail Content -->
                <div class="px-5 py-4">
                  <!-- Customer & Status -->
                  <div class="flex items-center justify-between mb-4">
                    <span class="text-[18px] font-bold text-[#222]">{{ selectedClaim.customer_name }}</span>
                    <StatusBadge :label="getStatusLabel(selectedClaim.status)" :variant="getStatusVariant(selectedClaim.status)" />
                  </div>

                  <!-- Info Rows -->
                  <div class="bg-[#F8F8F8] rounded-[12px] p-4 mb-4">
                    <InfoRow label="청구 유형" :value="selectedClaim.claim_type" />
                    <InfoRow label="보험사" :value="selectedClaim.insurance_company" />
                    <InfoRow
                      label="청구 금액"
                      :value="selectedClaim.claim_amount ? formatAmount(selectedClaim.claim_amount) : '미정'"
                    />
                    <InfoRow label="접수일" :value="selectedClaim.submitted_at" />
                    <InfoRow
                      v-if="selectedClaim.processed_at"
                      label="처리일"
                      :value="selectedClaim.processed_at"
                    />
                    <InfoRow label="청구번호" :value="`#${selectedClaim.claim_id}`" />
                  </div>

                  <!-- Action (placeholder for future) -->
                  <ActionButton full large variant="outline" @click="closeDetail">
                    닫기
                  </ActionButton>
                </div>
              </div>
            </div>
          </Transition>
        </Teleport>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import ClaimListItem from '../../components/ui/ClaimListItem.vue'
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import type { AgentClaim } from '../../types'

const store = useAgentClaimStore()

interface FilterChip {
  label: string
  value: 'all' | 'draft' | 'submitted' | 'processing' | 'approved' | 'rejected'
}

const filterChips: FilterChip[] = [
  { label: '전체', value: 'all' },
  { label: '임시저장', value: 'draft' },
  { label: '접수', value: 'submitted' },
  { label: '처리중', value: 'processing' },
  { label: '승인', value: 'approved' },
  { label: '거절', value: 'rejected' },
]

const selectedClaim = ref<AgentClaim | null>(null)

function openDetail(id: number): void {
  const claim = store.claims.find((c) => c.claim_id === id)
  if (claim) {
    selectedClaim.value = claim
  }
}

function closeDetail(): void {
  selectedClaim.value = null
}

function getStatusLabel(status: AgentClaim['status']): string {
  const map: Record<AgentClaim['status'], string> = {
    draft: '임시저장',
    submitted: '접수',
    processing: '처리중',
    approved: '승인',
    rejected: '거절',
  }
  return map[status]
}

function getStatusVariant(status: AgentClaim['status']): 'default' | 'info' | 'warning' | 'success' | 'danger' {
  const map: Record<AgentClaim['status'], 'default' | 'info' | 'warning' | 'success' | 'danger'> = {
    draft: 'default',
    submitted: 'info',
    processing: 'warning',
    approved: 'success',
    rejected: 'danger',
  }
  return map[status]
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('ko-KR') + '원'
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }

.scrollbar-hide::-webkit-scrollbar { display: none; }
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
</style>
