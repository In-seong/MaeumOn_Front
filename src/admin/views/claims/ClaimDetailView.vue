<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.back()" class="text-[#999] hover:text-[#333]">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
      </button>
      <h1 class="text-[22px] font-bold text-[#333]">청구 상세 #{{ claimId }}</h1>
    </div>

    <div v-if="loading" class="text-center py-20">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else-if="claim" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 왼쪽 -->
      <div class="flex flex-col gap-6">
        <!-- 기본 정보 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">기본 정보</h2>
          <div class="flex flex-col gap-2.5">
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">청구번호</span><span class="text-[13px] text-[#333]">{{ claim.claim_number || '-' }}</span></div>
            <div class="flex items-center"><span class="text-[13px] text-[#888] w-[100px]">상태</span><span :class="getStatusClass(claim.claim_status)" class="px-2 py-0.5 text-[12px] font-medium rounded-full">{{ getStatusLabel(claim.claim_status) }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">고객</span><span class="text-[13px] text-[#333]">{{ claim.customer?.name || '-' }} ({{ claim.customer?.phone || '-' }})</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">담당 설계사</span><span class="text-[13px] text-[#333]">{{ (claim as any).agent?.name || '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">보험사</span><span class="text-[13px] text-[#333]">{{ claim.claim_form?.insurance_company?.company_name || '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">양식</span><span class="text-[13px] text-[#333]">{{ claim.claim_form?.form_name || '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">청구일</span><span class="text-[13px] text-[#333]">{{ formatDate(claim.created_at || '') }}</span></div>
          </div>
        </div>

        <!-- 보험금 + 상태 변경 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">보험금 정보</h2>
          <div class="flex flex-col gap-2.5 mb-5">
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">청구 금액</span><span class="text-[13px] text-[#333]">{{ claim.claim_amount ? Number(claim.claim_amount).toLocaleString() + '원' : '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">승인 금액</span><span class="text-[13px] font-medium text-green-600">{{ claim.approved_amount ? Number(claim.approved_amount).toLocaleString() + '원' : '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">승인일</span><span class="text-[13px] text-[#333]">{{ claim.approval_date ? formatDate(claim.approval_date) : '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">지급 금액</span><span class="text-[13px] font-medium text-purple-600">{{ claim.paid_amount ? Number(claim.paid_amount).toLocaleString() + '원' : '-' }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#888] w-[100px]">지급일</span><span class="text-[13px] text-[#333]">{{ claim.paid_date ? formatDate(claim.paid_date) : '-' }}</span></div>
          </div>

          <div class="pt-4 border-t border-[#F0F0F0]">
            <label class="block text-[13px] font-medium text-[#555] mb-2">상태 변경</label>
            <div class="flex gap-2">
              <select v-model="newStatus" class="flex-1 px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] text-[#333]">
                <option v-for="opt in statusOptions" :key="opt.value" :value="opt.value">{{ opt.label }}</option>
              </select>
              <button @click="handleChangeStatus" :disabled="newStatus === claim.claim_status || changing" class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-semibold disabled:opacity-40">
                {{ changing ? '처리중...' : '변경' }}
              </button>
            </div>
            <div v-if="newStatus === 'approved' || newStatus === 'paid'" class="mt-3">
              <label class="block text-[13px] font-medium text-[#555] mb-1">{{ newStatus === 'approved' ? '승인 금액' : '지급 금액' }} (원)</label>
              <input v-model="amountInput" type="text" inputmode="numeric" placeholder="0" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] text-[#333] text-right" @input="formatAmount" />
            </div>
          </div>
        </div>

        <!-- 첨부파일 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">첨부파일</h2>
          <div v-if="documents.length > 0" class="flex flex-col gap-2">
            <a v-for="doc in documents" :key="doc.claim_document_id" :href="doc.document_url" target="_blank" class="flex items-center gap-3 p-3 bg-[#F8F8F8] rounded-[10px] hover:bg-[#FFF3ED] transition-colors">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#888" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/></svg>
              <div class="flex-1 min-w-0">
                <p class="text-[13px] text-[#333] truncate">{{ doc.document_file_name }}</p>
                <p v-if="doc.document_file_size" class="text-[11px] text-[#999]">{{ formatFileSize(doc.document_file_size) }}</p>
              </div>
              <span class="text-[12px] text-[#FF7B22] font-medium flex-shrink-0">보기</span>
            </a>
          </div>
          <p v-else class="text-[13px] text-[#999] text-center py-4">첨부파일이 없습니다.</p>
          <div v-if="claim.generated_pdf_url" class="mt-4 pt-4 border-t border-[#F0F0F0]">
            <a :href="claim.generated_pdf_url" target="_blank" class="inline-flex items-center gap-2 text-[14px] text-[#FF7B22] font-medium hover:text-[#E56D1E]">PDF 보기</a>
          </div>
        </div>
      </div>

      <!-- 오른쪽 -->
      <div class="flex flex-col gap-6">
        <!-- 비고 -->
        <div v-if="claim.notes" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-3">비고</h2>
          <p class="text-[13px] text-[#666] leading-relaxed">{{ claim.notes }}</p>
        </div>

        <!-- 생성된 청구서 이미지 -->
        <div v-if="imageUrls.length > 0" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">생성된 청구서</h2>
          <div class="flex flex-col gap-3">
            <div v-for="img in imageUrls" :key="img.page_number">
              <p v-if="imageUrls.length > 1" class="text-[12px] text-[#999] mb-1">{{ img.page_number }}페이지</p>
              <img :src="img.url" :alt="'청구서 ' + img.page_number + '페이지'" class="w-full rounded-[8px] border border-[#E8E8E8]" />
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-20">
      <p class="text-[15px] text-[#999]">청구 정보를 찾을 수 없습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { claimApi } from '@shared/services/insuranceApi'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'
import type { InsuranceClaim } from '@shared/types'

const router = useRouter()
const route = useRoute()

const claimId = computed(() => Number(route.params.id))
const claim = ref<InsuranceClaim | null>(null)
const loading = ref(false)
const changing = ref(false)
const newStatus = ref('')
const amountInput = ref('')

const statusOptions = CLAIM_STATUS_OPTIONS
const documents = computed(() => claim.value?.documents ?? [])
const imageUrls = computed(() => claim.value?.generated_image_urls ?? [])

onMounted(async () => {
  loading.value = true
  try {
    const res = await claimApi.getAdminDetail(claimId.value)
    claim.value = res.data.data
    newStatus.value = claim.value?.claim_status ?? ''
  } finally {
    loading.value = false
  }
})

function getStatusLabel(status: string): string {
  return CLAIM_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status
}

function getStatusClass(status: string): string {
  const map: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-600', pending: 'bg-yellow-100 text-yellow-800',
    processing: 'bg-blue-100 text-blue-800', approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800', paid: 'bg-purple-100 text-purple-800',
  }
  return map[status] ?? 'bg-gray-100 text-gray-800'
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

function formatAmount(event: Event) {
  const input = event.target as HTMLInputElement
  const raw = input.value.replace(/[^0-9]/g, '')
  amountInput.value = raw ? Number(raw).toLocaleString() : ''
}

async function handleChangeStatus() {
  if (!claim.value || newStatus.value === claim.value.claim_status) return
  changing.value = true
  try {
    const rawAmount = amountInput.value.replace(/[^0-9]/g, '')
    const amount = rawAmount ? Number(rawAmount) : undefined
    const payload: Record<string, unknown> = { claim_status: newStatus.value }
    if (newStatus.value === 'approved' && amount) payload.approved_amount = amount
    if (newStatus.value === 'paid' && amount) payload.paid_amount = amount

    await claimApi.updateStatus(claim.value.claim_id, payload as Parameters<typeof claimApi.updateStatus>[1])
    const res = await claimApi.getAdminDetail(claimId.value)
    claim.value = res.data.data
    newStatus.value = claim.value?.claim_status ?? ''
    amountInput.value = ''
    alert('상태가 변경되었습니다.')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '상태 변경에 실패했습니다.')
  } finally {
    changing.value = false
  }
}
</script>
