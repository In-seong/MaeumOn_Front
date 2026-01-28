<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import { claimApi } from '@shared/services/insuranceApi'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'

const router = useRouter()
const route = useRoute()
const claimStore = useClaimStore()

const claimId = computed(() => Number(route.params.id))
const showFaxModal = ref(false)
const faxNumber = ref('')
const sendingFax = ref(false)

onMounted(async () => {
  await claimStore.fetchClaimDetail(claimId.value)

  // 보험사 기본 팩스번호 설정
  if (claimStore.currentClaim?.claim_form_template?.insurance_company?.fax_number) {
    faxNumber.value = claimStore.currentClaim.claim_form_template.insurance_company.fax_number
  }
})

function getStatusClass(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
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

function downloadImage() {
  if (claimStore.currentClaim?.generated_image_url) {
    window.open(claimStore.currentClaim.generated_image_url, '_blank')
  }
}

function downloadPdf() {
  if (claimStore.currentClaim?.generated_pdf_url) {
    window.open(claimStore.currentClaim.generated_pdf_url, '_blank')
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

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 헤더 -->
      <div class="mb-6">
        <button @click="goBack" class="text-purple-600 hover:text-purple-700 flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          목록으로
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="claimStore.loadingClaims" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>

      <!-- 청구 상세 -->
      <div v-else-if="claimStore.currentClaim" class="space-y-6">
        <!-- 기본 정보 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="flex justify-between items-start mb-4">
            <div>
              <h1 class="text-xl font-bold text-gray-900 dark:text-white">
                {{ claimStore.currentClaim.claim_form_template?.insurance_company?.name }}
              </h1>
              <p class="text-gray-500 dark:text-gray-400">
                {{ claimStore.currentClaim.claim_form_template?.name }}
              </p>
            </div>
            <span :class="['px-3 py-1 text-sm font-medium rounded', getStatusClass(claimStore.currentClaim.status)]">
              {{ getStatusLabel(claimStore.currentClaim.status) }}
            </span>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div class="text-gray-500 dark:text-gray-400">청구번호</div>
              <div class="font-medium text-gray-900 dark:text-white">#{{ claimStore.currentClaim.id }}</div>
            </div>
            <div>
              <div class="text-gray-500 dark:text-gray-400">청구일</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ formatDate(claimStore.currentClaim.created_at) }}</div>
            </div>
            <div>
              <div class="text-gray-500 dark:text-gray-400">팩스 상태</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ getFaxStatusLabel(claimStore.currentClaim.fax_status) }}</div>
            </div>
            <div v-if="claimStore.currentClaim.fax_sent_at">
              <div class="text-gray-500 dark:text-gray-400">팩스 발송일</div>
              <div class="font-medium text-gray-900 dark:text-white">{{ formatDate(claimStore.currentClaim.fax_sent_at) }}</div>
            </div>
          </div>
        </div>

        <!-- 입력 정보 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">입력 정보</h2>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              v-for="fieldValue in claimStore.currentClaim.field_values"
              :key="fieldValue.id"
              class="border-b border-gray-200 dark:border-gray-700 pb-3"
            >
              <div class="text-sm text-gray-500 dark:text-gray-400">
                {{ fieldValue.template_field?.field_label }}
              </div>
              <div class="font-medium text-gray-900 dark:text-white">
                {{ fieldValue.field_value || '-' }}
              </div>
            </div>
          </div>
        </div>

        <!-- 생성된 문서 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">생성된 청구서</h2>

          <!-- 이미지 미리보기 -->
          <div v-if="claimStore.currentClaim.generated_image_url" class="mb-4">
            <img
              :src="claimStore.currentClaim.generated_image_url"
              alt="청구서"
              class="max-w-full h-auto border rounded"
            />
          </div>

          <!-- 다운로드/발송 버튼 -->
          <div class="flex flex-wrap gap-3">
            <button
              v-if="claimStore.currentClaim.generated_image_url"
              @click="downloadImage"
              class="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              이미지 다운로드
            </button>

            <button
              v-if="claimStore.currentClaim.generated_pdf_url"
              @click="downloadPdf"
              class="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
              PDF 다운로드
            </button>

            <button
              v-if="claimStore.currentClaim.fax_status !== 'sent'"
              @click="showFaxModal = true"
              class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center"
            >
              <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              팩스 발송
            </button>
          </div>
        </div>

        <!-- 비고 -->
        <div v-if="claimStore.currentClaim.notes" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-2">비고</h2>
          <p class="text-gray-600 dark:text-gray-400">{{ claimStore.currentClaim.notes }}</p>
        </div>
      </div>

      <!-- 청구 없음 -->
      <div v-else class="text-center py-20">
        <p class="text-gray-500">청구 정보를 찾을 수 없습니다.</p>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          목록으로 돌아가기
        </button>
      </div>
    </div>

    <!-- 팩스 발송 모달 -->
    <div
      v-if="showFaxModal"
      class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      @click.self="showFaxModal = false"
    >
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md mx-4">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          팩스 발송
        </h3>

        <div class="mb-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            팩스 번호
          </label>
          <input
            v-model="faxNumber"
            type="tel"
            placeholder="02-1234-5678"
            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
          <p class="mt-1 text-sm text-gray-500">
            보험사 기본 팩스번호가 입력되어 있습니다. 변경 가능합니다.
          </p>
        </div>

        <div v-if="claimStore.error" class="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
          {{ claimStore.error }}
        </div>

        <div class="flex gap-3">
          <button
            @click="showFaxModal = false"
            class="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            취소
          </button>
          <button
            @click="handleSendFax"
            :disabled="sendingFax"
            class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300"
          >
            {{ sendingFax ? '발송 중...' : '발송하기' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
