<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="청구 상세" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="claimStore.loadingClaims" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
        </div>

        <!-- 청구 상세 -->
        <div v-else-if="claimStore.currentClaim">
          <!-- 기본 정보 -->
          <CardSection class="mb-4">
            <div class="flex items-start justify-between mb-3">
              <div>
                <span class="text-[13px] text-[#888]">
                  {{ claimStore.currentClaim.claim_form?.insurance_company?.company_name }}
                </span>
                <p class="text-[18px] font-bold text-[#222] mt-0.5">
                  {{ claimStore.currentClaim.claim_form?.form_name }}
                </p>
              </div>
              <StatusBadge
                :label="getStatusLabel(claimStore.currentClaim.claim_status)"
                :variant="getStatusVariant(claimStore.currentClaim.claim_status)"
              />
            </div>
            <div class="flex items-center gap-2">
              <span class="text-[13px] text-[#888]">청구번호</span>
              <span class="text-[14px] font-bold text-[#FF7B22]">#{{ claimStore.currentClaim.claim_id }}</span>
            </div>
          </CardSection>

          <!-- 청구 정보 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">청구 정보</p>
            <CardSection>
              <InfoRow label="청구일" :value="formatDate(claimStore.currentClaim.created_at ?? '')" />
              <InfoRow label="팩스 상태" :value="getFaxStatusLabel(claimStore.currentClaim.fax_status)" />
              <InfoRow
                v-if="claimStore.currentClaim.fax_sent_at"
                label="팩스 발송일"
                :value="formatDate(claimStore.currentClaim.fax_sent_at)"
              />
            </CardSection>
          </div>

          <!-- 입력 정보 -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">입력 정보</p>
            <CardSection>
              <InfoRow
                v-for="fieldValue in claimStore.currentClaim.field_values"
                :key="fieldValue.claim_field_value_id"
                :label="fieldValue.form_field?.field_label || ''"
                :value="fieldValue.field_value || '-'"
              />
            </CardSection>
          </div>

          <!-- 생성된 청구서 (PDF 뷰어) -->
          <div class="mb-4">
            <p class="text-[15px] font-semibold text-[#222] mb-2">생성된 청구서</p>
            <CardSection>
              <div v-if="claimStore.currentClaim.generated_pdf_url" class="mb-4">
                <iframe
                  :src="claimStore.currentClaim.generated_pdf_url"
                  class="w-full rounded-[8px] border border-[#E8E8E8]"
                  style="height: 500px;"
                  title="청구서 PDF"
                ></iframe>
              </div>
              <p v-else class="text-[13px] text-[#999] text-center py-6">
                생성된 청구서가 없습니다.
              </p>
            </CardSection>
          </div>

          <!-- 비고 -->
          <CardSection v-if="claimStore.currentClaim.notes" class="mb-4 !bg-[#FFF9F0]">
            <div class="flex items-start gap-2">
              <svg class="flex-shrink-0 mt-0.5" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" stroke="#F3940E" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <div>
                <p class="text-[13px] font-semibold text-[#F3940E] mb-0.5">비고</p>
                <p class="text-[12px] text-[#888] leading-relaxed">{{ claimStore.currentClaim.notes }}</p>
              </div>
            </div>
          </CardSection>

          <!-- 액션 버튼 -->
          <div class="flex flex-col gap-3 mb-6">
            <!-- 수정 버튼 (pending 상태에서만) -->
            <button
              v-if="claimStore.currentClaim.claim_status === 'pending'"
              @click="goToEdit"
              class="w-full bg-white border border-[#FF7B22] text-[#FF7B22] rounded-[12px] py-3.5 text-[14px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              청구서 수정
            </button>

            <div class="flex gap-3">
              <button
                v-if="claimStore.currentClaim.generated_pdf_url"
                @click="downloadPdf"
                class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[14px] font-semibold active:scale-[0.98] transition-transform flex items-center justify-center gap-1.5"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                  <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                PDF 다운로드
              </button>
            </div>
            <button
              v-if="claimStore.currentClaim.fax_status !== 'sent'"
              @click="showFaxModal = true"
              class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
            >
              팩스 발송
            </button>
          </div>
        </div>

        <!-- 청구 없음 -->
        <div v-else class="text-center py-20">
          <p class="text-[15px] text-[#888]">청구 정보를 찾을 수 없습니다.</p>
          <button
            @click="goBack"
            class="mt-4 bg-[#FF7B22] text-white rounded-[12px] px-6 py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            목록으로 돌아가기
          </button>
        </div>
      </main>
      <BottomNav />
    </div>

    <!-- 팩스 발송 모달 -->
    <div
      v-if="showFaxModal"
      class="fixed inset-0 bg-black/50 flex items-end justify-center z-50"
      @click.self="showFaxModal = false"
    >
      <div class="w-full max-w-[402px] bg-white rounded-t-[20px] p-5 pb-8">
        <div class="w-10 h-1 bg-[#E0E0E0] rounded-full mx-auto mb-5"></div>
        <h3 class="text-[18px] font-bold text-[#222] mb-5">팩스 발송</h3>

        <div class="mb-5">
          <label class="block text-[13px] font-medium text-[#888] mb-2">팩스 번호</label>
          <input
            v-model="faxNumber"
            type="tel"
            placeholder="02-1234-5678"
            class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
          />
          <p class="mt-2 text-[11px] text-[#999]">
            보험사 기본 팩스번호가 입력되어 있습니다. 변경 가능합니다.
          </p>
        </div>

        <div v-if="claimStore.error" class="mb-4 p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
          {{ claimStore.error }}
        </div>

        <div class="flex gap-3">
          <button
            @click="showFaxModal = false"
            class="flex-1 bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
          >
            취소
          </button>
          <button
            @click="handleSendFax"
            :disabled="sendingFax"
            class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
          >
            {{ sendingFax ? '발송 중...' : '발송하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '../../components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()
const route = useRoute()
const claimStore = useClaimStore()

const claimId = computed(() => Number(route.params.id))
const showFaxModal = ref(false)
const faxNumber = ref('')
const sendingFax = ref(false)

onMounted(async () => {
  await claimStore.fetchClaimDetail(claimId.value)

  if (claimStore.currentClaim?.claim_form?.insurance_company?.fax_number) {
    faxNumber.value = claimStore.currentClaim.claim_form.insurance_company.fax_number
  }
})

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'rejected': return 'danger'
    default: return 'default'
  }
}

function getStatusLabel(status: string) {
  const option = CLAIM_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status
}

function getFaxStatusLabel(status?: string) {
  switch (status) {
    case 'sent': return '발송완료'
    case 'failed': return '발송실패'
    case 'pending': return '발송대기'
    default: return '미발송'
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleString('ko-KR')
}

function downloadPdf() {
  if (claimStore.currentClaim?.generated_pdf_url) {
    window.open(claimStore.currentClaim.generated_pdf_url, '_blank')
  }
}

function goToEdit() {
  if (claimStore.currentClaim) {
    router.push(`/claims/${claimStore.currentClaim.claim_id}/edit`)
  }
}

async function handleSendFax() {
  if (!faxNumber.value.trim()) {
    alert('팩스번호를 입력해주세요.')
    return
  }

  sendingFax.value = true
  try {
    const success = await claimStore.sendFax(claimId.value, faxNumber.value)
    if (success) {
      showFaxModal.value = false
      alert('팩스 발송이 요청되었습니다.')
    }
  } finally {
    sendingFax.value = false
  }
}

function goBack() {
  router.push('/claims')
}
</script>
