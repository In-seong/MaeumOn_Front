<template>
  <div class="space-y-4">
    <!-- 총 금액 헤더 -->
    <div class="bg-gradient-to-br from-[#FF6B2D] to-[#FF9F5A] rounded-[16px] p-6 text-center text-white">
      <p class="text-[13px] opacity-80">총 숨은 보험금 (추정)</p>
      <p class="text-[32px] font-black mt-1">{{ formatCurrency(totalAmount) }}</p>
      <p class="text-[12px] opacity-70 mt-2">{{ results.length }}건의 미청구 항목이 발견되었습니다</p>
    </div>

    <!-- 결과 없음 -->
    <div v-if="results.length === 0" class="bg-white rounded-[14px] border border-[#E8E8E8] p-8 text-center">
      <svg class="w-16 h-16 text-[#DDD] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
      <p class="text-[14px] text-[#888]">미청구 보험금이 발견되지 않았습니다.</p>
      <p class="text-[12px] text-[#BBB] mt-1">모든 진료 건에 대해 보험금이 청구된 것으로 보입니다.</p>
    </div>

    <!-- 결과 리스트 -->
    <div v-else class="space-y-2">
      <h3 class="text-[14px] font-bold text-[#222] px-1">미청구 항목</h3>
      <div
        v-for="r in results"
        :key="r.result_id"
        class="bg-white rounded-[14px] border border-[#E8E8E8] p-4"
      >
        <div class="flex items-start justify-between mb-2">
          <div class="min-w-0 flex-1">
            <p class="text-[14px] font-semibold text-[#222]">{{ r.hospital_name || '-' }}</p>
            <p class="text-[12px] text-[#999] mt-0.5">{{ r.visit_date || '-' }}</p>
          </div>
          <span
            :class="statusClass(r.claim_status)"
            class="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0"
          >{{ statusLabel(r.claim_status) }}</span>
        </div>

        <div class="grid grid-cols-2 gap-2 text-[12px]">
          <div><span class="text-[#999]">진단명</span> <span class="text-[#333] ml-1">{{ r.diagnosis || '-' }}</span></div>
          <div><span class="text-[#999]">진료구분</span> <span class="text-[#333] ml-1">{{ r.treatment_type || '-' }}</span></div>
          <div><span class="text-[#999]">진료비</span> <span class="text-[#333] ml-1">{{ formatCurrency(r.total_cost) }}</span></div>
          <div><span class="text-[#999]">추정 청구액</span> <span class="text-[#FF6B2D] font-bold ml-1">{{ formatCurrency(r.estimated_claim_amount) }}</span></div>
        </div>

        <div v-if="r.matched_insurance_product" class="mt-3 pt-2 border-t border-[#F0F0F0]">
          <p class="text-[11px] text-[#999]">
            매칭 보험: <span class="text-[#555]">{{ r.matched_insurance_product }}</span>
          </p>
        </div>
      </div>
    </div>

    <!-- 액션 버튼 -->
    <div class="space-y-2 pt-2">
      <button
        v-if="results.length > 0"
        class="w-full py-3.5 bg-[#FF6B2D] text-white text-[14px] font-bold rounded-[12px] active:scale-[0.98] transition-transform"
        @click="emit('start-claim')"
      >
        보험금 청구하기
      </button>
      <button
        class="w-full py-3 border border-[#E0E0E0] text-[#888] text-[14px] font-medium rounded-[12px]"
        @click="emit('new-session')"
      >
        새로 조회하기
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { UnclaimedResult } from '../../types'

defineProps<{
  results: UnclaimedResult[]
  totalAmount: number
}>()

const emit = defineEmits<{
  'start-claim': []
  'new-session': []
}>()

function formatCurrency(val?: number): string {
  if (val == null) return '0원'
  return new Intl.NumberFormat('ko-KR').format(Math.round(val)) + '원'
}

function statusLabel(s: string): string {
  const map: Record<string, string> = {
    unclaimed: '미청구',
    claiming: '청구중',
    claimed: '청구완료',
    not_applicable: '해당없음',
  }
  return map[s] ?? s
}

function statusClass(s: string): string {
  const map: Record<string, string> = {
    unclaimed: 'bg-orange-50 text-[#FF6B2D]',
    claiming: 'bg-blue-50 text-blue-600',
    claimed: 'bg-green-50 text-green-600',
    not_applicable: 'bg-gray-100 text-[#999]',
  }
  return map[s] ?? 'bg-gray-100 text-[#999]'
}
</script>
