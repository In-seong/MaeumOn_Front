<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[430px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="청구 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="store.loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
        </div>

        <!-- 청구 상세 -->
        <div v-else-if="claim">
          <!-- 기본 정보 -->
          <CardSection class="mb-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[13px] text-[#888]">
                  {{ claim.claim_form?.insurance_company?.company_name ?? '-' }}
                </span>
                <p class="text-[18px] font-bold text-[#222] mt-0.5">
                  {{ claim.claim_form?.form_name ?? '-' }}
                </p>
              </div>
              <StatusBadge
                :label="getStatusLabel(claim.claim_status)"
                :variant="getStatusVariant(claim.claim_status)"
              />
            </div>
            <div class="space-y-1">
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-[#888]">청구번호</span>
                <span class="text-[14px] font-bold text-[#FF7B22]">#{{ claim.claim_id }}</span>
              </div>
              <div v-if="claim.customer" class="flex items-center gap-2">
                <span class="text-[13px] text-[#888]">고객명</span>
                <span class="text-[14px] font-medium text-[#333]">{{ claim.customer.name }}</span>
              </div>
            </div>
          </CardSection>

          <!-- 청구 정보 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">청구 정보</p>
            <CardSection>
              <InfoRow label="청구일" :value="formatDate(claim.created_at ?? '')" />
              <InfoRow label="팩스 상태" :value="getFaxStatusLabel(claim.fax_status)" />
              <InfoRow
                v-if="claim.fax_sent_at"
                label="팩스 발송일"
                :value="formatDate(claim.fax_sent_at)"
              />
            </CardSection>
          </div>

          <!-- 입력 정보 -->
          <div v-if="claimFieldValues && claimFieldValues.length > 0" class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">입력 정보</p>
            <CardSection>
              <InfoRow
                v-for="fieldValue in claimFieldValues"
                :key="fieldValue.claim_field_value_id"
                :label="fieldValue.form_field?.field_label || ''"
                :value="fieldValue.field_value || '-'"
              />
            </CardSection>
          </div>

          <!-- 생성된 청구서 (페이지 이미지) -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">생성된 청구서</p>
            <CardSection>
              <div v-if="claimImageUrls && claimImageUrls.length > 0" class="flex flex-col gap-3">
                <div v-for="img in claimImageUrls" :key="img.page_number">
                  <p v-if="claimImageUrls.length > 1" class="text-[12px] text-[#999] mb-1">
                    {{ img.page_number }}페이지
                  </p>
                  <img
                    :src="img.url"
                    :alt="'청구서 ' + img.page_number + '페이지'"
                    class="w-full rounded-[8px] border border-[#E8E8E8]"
                  />
                </div>
              </div>
              <p v-else class="text-[13px] text-[#999] text-center py-6">
                생성된 청구서가 없습니다.
              </p>
            </CardSection>
          </div>

          <!-- 첨부파일 -->
          <div v-if="claimDocuments && claimDocuments.length > 0" class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">첨부파일</p>
            <CardSection>
              <div
                v-for="doc in claimDocuments"
                :key="doc.claim_document_id"
                class="flex items-center gap-3 py-2.5 border-b border-[#F0F0F0] last:border-0"
              >
                <svg class="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <div class="flex-1 min-w-0">
                  <p class="text-[13px] text-[#333] truncate">{{ doc.document_file_name }}</p>
                  <p v-if="doc.document_file_size" class="text-[11px] text-[#999]">{{ formatFileSize(doc.document_file_size) }}</p>
                </div>
                <a
                  v-if="doc.document_url"
                  :href="doc.document_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-[12px] text-[#FF7B22] font-semibold flex-shrink-0"
                >
                  보기
                </a>
              </div>
            </CardSection>
          </div>

          <!-- 비고 -->
          <CardSection v-if="claim.notes" class="mb-4 !bg-[#FFF9F0]">
            <div class="flex items-start gap-2">
              <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div>
                <p class="text-[13px] font-semibold text-[#F3940E] mb-0.5">비고</p>
                <p class="text-[12px] text-[#888] leading-relaxed">{{ claim.notes }}</p>
              </div>
            </div>
          </CardSection>

          <!-- 팩스 발송 섹션 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">팩스 발송</p>
            <CardSection>
              <!-- 발송완료 상태 -->
              <div v-if="claim.fax_status === 'sent'" class="flex items-center gap-2 py-2">
                <svg class="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#22C55E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-[14px] font-medium text-[#22C55E]">팩스 발송 완료</span>
              </div>

              <!-- 발송대기/발송중 상태 -->
              <div
                v-else-if="claim.fax_status === 'pending' || claim.fax_status === 'sending'"
                class="flex items-center gap-2 py-2"
              >
                <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF7B22]"></div>
                <span class="text-[14px] font-medium text-[#FF7B22]">
                  {{ claim.fax_status === 'pending' ? '발송 대기중...' : '팩스 발송중...' }}
                </span>
              </div>

              <!-- 실패 상태 -->
              <div v-else-if="claim.fax_status === 'failed'" class="space-y-3">
                <div class="flex items-center gap-2 py-2">
                  <svg class="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  <span class="text-[14px] font-medium text-[#EF4444]">팩스 발송 실패</span>
                </div>
                <div>
                  <label class="block text-[13px] font-medium text-[#888] mb-2">팩스 번호</label>
                  <input
                    v-model="faxNumber"
                    type="tel"
                    placeholder="02-1234-5678"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
                  />
                </div>
                <button
                  :disabled="sendingFax"
                  class="w-full bg-[#EF4444] text-white rounded-[12px] py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
                  @click="handleSendFax"
                >
                  {{ sendingFax ? '발송 중...' : '팩스 재발송' }}
                </button>
              </div>

              <!-- 미발송 상태: 팩스 번호 입력 + 발송 버튼 -->
              <div v-else class="space-y-3">
                <div>
                  <label class="block text-[13px] font-medium text-[#888] mb-2">팩스 번호</label>
                  <input
                    v-model="faxNumber"
                    type="tel"
                    placeholder="02-1234-5678"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
                  />
                  <p class="mt-1.5 text-[11px] text-[#999]">
                    보험사 기본 팩스번호가 입력되어 있습니다. 변경 가능합니다.
                  </p>
                </div>
                <button
                  :disabled="sendingFax"
                  class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
                  @click="handleSendFax"
                >
                  {{ sendingFax ? '발송 중...' : '팩스 발송' }}
                </button>
              </div>

              <!-- 에러 메시지 -->
              <div v-if="store.error" class="mt-3 p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
                {{ store.error }}
              </div>
            </CardSection>
          </div>

          <!-- 액션 버튼 -->
          <div class="flex flex-col gap-3 mb-6">
            <!-- 수정 버튼 (pending 상태이고 팩스 미발송일 때) -->
            <button
              v-if="claim.claim_status === 'pending' && !claim.fax_status"
              class="w-full bg-white border border-[#FF7B22] text-[#FF7B22] rounded-[12px] py-3.5 text-[14px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
              @click="goToEdit"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              청구서 수정
            </button>

            <!-- PDF 다운로드 -->
            <button
              v-if="claim.generated_pdf_url"
              class="w-full bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[14px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
              @click="downloadPdf"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              PDF 다운로드
            </button>
          </div>
        </div>

        <!-- 청구 없음 -->
        <div v-else class="text-center py-20">
          <p class="text-[15px] text-[#888]">청구 정보를 찾을 수 없습니다.</p>
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
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'
import type { InsuranceClaim as SharedInsuranceClaim } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()
const route = useRoute()
const store = useAgentClaimStore()

const claimId = computed(() => Number(route.params.id))
const faxNumber = ref('')
const sendingFax = ref(false)
let pollTimer: ReturnType<typeof setInterval> | null = null

// Agent 타입에는 generated_image_urls, field_values, documents가 없으므로
// shared InsuranceClaim으로 캐스팅하여 접근
const claim = computed(() => store.selectedClaim)

const claimImageUrls = computed(() => {
  const raw = claim.value as unknown as SharedInsuranceClaim | null
  return raw?.generated_image_urls ?? null
})

const claimFieldValues = computed(() => {
  const raw = claim.value as unknown as SharedInsuranceClaim | null
  return raw?.field_values ?? null
})

const claimDocuments = computed(() => {
  const raw = claim.value as unknown as SharedInsuranceClaim | null
  return raw?.documents ?? null
})

onMounted(async () => {
  await store.loadClaim(claimId.value)

  // 보험사 팩스번호 기본값 설정
  const companyFax = claim.value?.claim_form?.insurance_company
  if (companyFax) {
    const faxObj = companyFax as unknown as { fax_number?: string }
    if (faxObj.fax_number) {
      faxNumber.value = faxObj.fax_number
    }
  }

  startPollingIfNeeded()
})

onUnmounted(() => {
  stopPolling()
})

// pending/sending 상태 변화 감시
watch(() => claim.value?.fax_status, (newStatus) => {
  if (newStatus === 'pending' || newStatus === 'sending') {
    startPollingIfNeeded()
  } else {
    stopPolling()
  }
})

function startPollingIfNeeded(): void {
  const status = claim.value?.fax_status
  if ((status === 'pending' || status === 'sending') && !pollTimer) {
    pollTimer = setInterval(async () => {
      await store.loadClaim(claimId.value)
      const updatedStatus = claim.value?.fax_status
      if (updatedStatus !== 'pending' && updatedStatus !== 'sending') {
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

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'approved': return 'success'
    case 'rejected': return 'danger'
    case 'paid': return 'primary'
    default: return 'default'
  }
}

function getStatusLabel(status: string): string {
  const option = CLAIM_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label ?? status
}

function getFaxStatusLabel(status?: string): string {
  switch (status) {
    case 'sent': return '발송완료'
    case 'failed': return '발송실패'
    case 'pending': return '발송대기'
    case 'sending': return '발송중'
    default: return '미발송'
  }
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('ko-KR')
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

function downloadPdf(): void {
  if (claim.value?.generated_pdf_url) {
    window.open(claim.value.generated_pdf_url, '_blank')
  }
}

function goToEdit(): void {
  if (claim.value) {
    router.push(`/claims/${claim.value.claim_id}/edit`)
  }
}

async function handleSendFax(): Promise<void> {
  if (!faxNumber.value.trim()) {
    alert('팩스번호를 입력해주세요.')
    return
  }

  sendingFax.value = true
  try {
    const success = await store.sendFax(claimId.value, faxNumber.value)
    if (success) {
      alert('팩스 발송이 요청되었습니다.')
    }
  } finally {
    sendingFax.value = false
  }
}

function goBack(): void {
  router.push('/claims')
}
</script>
