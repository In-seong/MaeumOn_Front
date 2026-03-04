<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[430px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="다중 청구 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="batchStore.loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
        </div>

        <!-- 배치 상세 -->
        <div v-else-if="batch">
          <!-- 기본 정보 카드 -->
          <CardSection class="mb-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <p class="text-[18px] font-bold text-[#222]">다중 청구</p>
                <p v-if="batch.customer" class="text-[13px] text-[#888] mt-0.5">
                  고객: {{ batch.customer.name }}
                </p>
              </div>
              <StatusBadge
                :label="getBatchStatusLabel(batch.batch_status)"
                :variant="getBatchStatusVariant(batch.batch_status)"
              />
            </div>
            <div class="space-y-2">
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-[#888]">배치번호</span>
                <span class="text-[14px] font-bold text-[#FF7B22]">#{{ batch.batch_claim_id }}</span>
              </div>
              <InfoRow label="생성일" :value="formatDate(batch.created_at)" />
              <!-- 진행상황 바 -->
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-[#888] flex-shrink-0">진행</span>
                <div class="flex-1 bg-[#E8E8E8] rounded-full h-2 overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all"
                    :class="batch.completed_count === batch.total_count ? 'bg-[#22C55E]' : 'bg-[#FF7B22]'"
                    :style="{ width: progressPercent + '%' }"
                  ></div>
                </div>
                <span class="text-[13px] font-semibold text-[#333] flex-shrink-0">
                  {{ batch.completed_count }}/{{ batch.total_count }}
                </span>
              </div>
            </div>
          </CardSection>

          <!-- 비고 -->
          <CardSection v-if="batch.notes" class="mb-4 !bg-[#FFF9F0]">
            <div class="flex items-start gap-2">
              <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div>
                <p class="text-[13px] font-semibold text-[#F3940E] mb-0.5">비고</p>
                <p class="text-[12px] text-[#888] leading-relaxed">{{ batch.notes }}</p>
              </div>
            </div>
          </CardSection>

          <!-- 개별 청구 목록 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">
              청구 목록 ({{ batchClaims.length }}건)
            </p>
            <div class="flex flex-col gap-3">
              <CardSection
                v-for="claim in batchClaims"
                :key="claim.claim_id"
              >
                <!-- 보험사 + 상태 -->
                <div class="flex items-start justify-between mb-2">
                  <div class="min-w-0 flex-1">
                    <p class="text-[15px] font-bold text-[#222] truncate">
                      {{ claim.claim_form?.insurance_company?.company_name ?? '-' }}
                    </p>
                    <p class="text-[12px] text-[#888] mt-0.5 truncate">
                      {{ claim.claim_form?.form_name ?? '-' }}
                    </p>
                  </div>
                  <StatusBadge
                    :label="getClaimStatusLabel(claim.claim_status)"
                    :variant="getClaimStatusVariant(claim.claim_status)"
                    class="ml-2 flex-shrink-0"
                  />
                </div>

                <!-- 팩스 상태 -->
                <div class="flex items-center gap-2 py-2 border-t border-[#F0F0F0]">
                  <span class="text-[12px] text-[#888]">팩스</span>
                  <!-- 발송완료 -->
                  <template v-if="claim.fax_status === 'sent'">
                    <svg class="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="text-[12px] font-medium text-[#22C55E]">발송 완료</span>
                    <span v-if="claim.fax_sent_at" class="text-[11px] text-[#999]">
                      {{ formatDate(claim.fax_sent_at) }}
                    </span>
                  </template>
                  <!-- 발송중/대기 -->
                  <template v-else-if="claim.fax_status === 'pending' || claim.fax_status === 'sending'">
                    <div class="animate-spin rounded-full h-3.5 w-3.5 border-b-2 border-[#FF7B22]"></div>
                    <span class="text-[12px] font-medium text-[#FF7B22]">
                      {{ claim.fax_status === 'pending' ? '발송 대기중' : '발송중' }}
                    </span>
                  </template>
                  <!-- 실패 -->
                  <template v-else-if="claim.fax_status === 'failed'">
                    <svg class="flex-shrink-0" width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                    <span class="text-[12px] font-medium text-[#EF4444]">발송 실패</span>
                  </template>
                  <!-- 미발송 -->
                  <template v-else>
                    <span class="text-[12px] text-[#999]">미발송</span>
                  </template>
                </div>

                <!-- 액션 버튼 -->
                <div class="flex items-center gap-2 pt-2 border-t border-[#F0F0F0]">
                  <!-- PDF 보기 -->
                  <button
                    v-if="claim.generated_pdf_url"
                    class="flex-1 bg-[#F8F8F8] text-[#555] rounded-[8px] py-2 text-[12px] font-medium active:scale-[0.98] transition-transform"
                    @click="openPdf(claim.generated_pdf_url)"
                  >
                    PDF 보기
                  </button>
                  <!-- 상세 보기 -->
                  <button
                    class="flex-1 bg-[#F8F8F8] text-[#555] rounded-[8px] py-2 text-[12px] font-medium active:scale-[0.98] transition-transform"
                    @click="goToClaimDetail(claim.claim_id)"
                  >
                    상세
                  </button>
                  <!-- 팩스 발송 (미발송/실패 시) -->
                  <button
                    v-if="canSendClaimFax(claim)"
                    :disabled="sendingClaimFaxId === claim.claim_id"
                    class="flex-1 bg-[#FF7B22] text-white rounded-[8px] py-2 text-[12px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
                    @click="handleSendClaimFax(claim.claim_id)"
                  >
                    {{ sendingClaimFaxId === claim.claim_id ? '발송중...' : (claim.fax_status === 'failed' ? '재발송' : '팩스 발송') }}
                  </button>
                </div>
              </CardSection>
            </div>
          </div>

          <!-- 일괄 팩스 발송 -->
          <div v-if="unsentCount > 0" class="mb-6">
            <button
              :disabled="sendingBatchFax"
              class="w-full bg-[#FF7B22] text-white rounded-[16px] py-4 text-[15px] font-bold active:scale-[0.98] transition-transform disabled:opacity-50 flex items-center justify-center gap-2"
              @click="handleSendBatchFax"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M6 14h12v8H6z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ sendingBatchFax ? '발송 중...' : `일괄 팩스 발송 (${unsentCount}건)` }}
            </button>
          </div>

          <!-- 에러 메시지 -->
          <div v-if="batchStore.error" class="mb-4 p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
            {{ batchStore.error }}
          </div>
        </div>

        <!-- 배치 없음 -->
        <div v-else class="text-center py-20">
          <p class="text-[15px] text-[#888]">배치 정보를 찾을 수 없습니다.</p>
          <button
            class="mt-4 bg-[#FF7B22] text-white rounded-[12px] px-6 py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform"
            @click="goBack"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>
      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import { BATCH_STATUS_OPTIONS, CLAIM_STATUS_OPTIONS } from '@shared/types'
import type { InsuranceClaim } from '../../types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()
const route = useRoute()
const batchStore = useAgentBatchClaimStore()

const batchId = computed(() => Number(route.params.id))
const sendingBatchFax = ref(false)
const sendingClaimFaxId = ref<number | null>(null)
let pollTimer: ReturnType<typeof setInterval> | null = null

const batch = computed(() => batchStore.selectedBatch)
const batchClaims = computed<InsuranceClaim[]>(() => batch.value?.claims ?? [])

const progressPercent = computed(() => {
  const b = batch.value
  if (!b || b.total_count === 0) return 0
  return (b.completed_count / b.total_count) * 100
})

const unsentCount = computed(() =>
  batchClaims.value.filter(c => !c.fax_status || c.fax_status === 'failed').length,
)

const needsPolling = computed(() =>
  batchClaims.value.some(c => c.fax_status === 'pending' || c.fax_status === 'sending'),
)

// ===== Lifecycle =====
onMounted(async () => {
  await batchStore.loadBatchClaim(batchId.value)
  startPollingIfNeeded()
})

onUnmounted(() => {
  stopPolling()
})

watch(needsPolling, (val) => {
  if (val) {
    startPollingIfNeeded()
  } else {
    stopPolling()
  }
})

// ===== Polling =====
function startPollingIfNeeded(): void {
  if (needsPolling.value && !pollTimer) {
    pollTimer = setInterval(async () => {
      await batchStore.loadBatchClaim(batchId.value)
      if (!needsPolling.value) {
        stopPolling()
      }
    }, 10000)
  }
}

function stopPolling(): void {
  if (pollTimer) {
    clearInterval(pollTimer)
    pollTimer = null
  }
}

// ===== Status helpers =====
function getBatchStatusLabel(status: string): string {
  const opt = BATCH_STATUS_OPTIONS.find(o => o.value === status)
  return opt?.label ?? status
}

function getBatchStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' {
  switch (status) {
    case 'draft': return 'default'
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'partial_failed': return 'danger'
    default: return 'default'
  }
}

function getClaimStatusLabel(status: string): string {
  const opt = CLAIM_STATUS_OPTIONS.find(o => o.value === status)
  return opt?.label ?? status
}

function getClaimStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' {
  switch (status) {
    case 'draft': return 'default'
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'paid': return 'primary'
    default: return 'default'
  }
}

function canSendClaimFax(claim: InsuranceClaim): boolean {
  return claim.claim_status !== 'draft' && (!claim.fax_status || claim.fax_status === 'failed')
}

// ===== Actions =====
async function handleSendClaimFax(claimId: number): Promise<void> {
  sendingClaimFaxId.value = claimId
  try {
    const success = await batchStore.sendFax(batchId.value, [claimId])
    if (success) {
      alert('팩스 발송이 요청되었습니다.')
    }
  } finally {
    sendingClaimFaxId.value = null
  }
}

async function handleSendBatchFax(): Promise<void> {
  const count = unsentCount.value
  if (count === 0) return

  const confirmed = confirm(`미발송 ${count}건에 대해 일괄 팩스 발송하시겠습니까?`)
  if (!confirmed) return

  sendingBatchFax.value = true
  try {
    const success = await batchStore.sendFax(batchId.value)
    if (success) {
      alert('일괄 팩스 발송이 요청되었습니다.')
    }
  } finally {
    sendingBatchFax.value = false
  }
}

function openPdf(url?: string): void {
  if (url) window.open(url, '_blank')
}

function goToClaimDetail(claimId: number): void {
  router.push(`/claims/${claimId}`)
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

function goBack(): void {
  router.back()
}
</script>
