<template>
  <Teleport to="body">
    <div v-if="visible" class="fixed inset-0 z-50 flex items-center justify-center">
      <div class="absolute inset-0 bg-black/50" @click="handleCancel" />
      <div class="relative bg-white rounded-[16px] shadow-xl w-[640px] max-h-[80vh] flex flex-col mx-4">
        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h3 class="text-[16px] font-bold text-[#333]">PDF 페이지 미리보기</h3>
          <button @click="handleCancel" class="text-[#999] hover:text-[#333] transition-colors">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- 본문 -->
        <div class="flex-1 overflow-y-auto p-6">
          <!-- 파일 선택 -->
          <div v-if="step === 'select'">
            <label class="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-[#E0E0E0] rounded-[12px] cursor-pointer hover:border-[#FF7B22] hover:bg-[#FFF9F5] transition-colors">
              <svg class="w-10 h-10 text-[#CCC] mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span class="text-[14px] text-[#999]">PDF 파일을 선택하세요</span>
              <span class="text-[12px] text-[#CCC] mt-1">최대 20MB</span>
              <input type="file" accept="application/pdf" class="hidden" @change="handleFileSelect" />
            </label>
          </div>

          <!-- 로딩 -->
          <div v-else-if="step === 'loading'" class="flex flex-col items-center justify-center py-12">
            <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mb-4"></div>
            <p class="text-[14px] text-[#999]">PDF를 변환하고 있습니다...</p>
          </div>

          <!-- 미리보기 -->
          <div v-else-if="step === 'preview'">
            <p class="text-[14px] text-[#555] mb-4">
              <span class="font-medium text-[#FF7B22]">{{ previewData?.page_count }}페이지</span>가 감지되었습니다. 확인 후 추가해주세요.
            </p>
            <div class="grid grid-cols-3 gap-4">
              <div
                v-for="page in previewData?.pages"
                :key="page.page_number"
                class="border border-[#E8E8E8] rounded-[8px] overflow-hidden bg-[#FAFAFA]"
              >
                <img
                  :src="page.thumbnail"
                  :alt="`${page.page_number}페이지`"
                  class="w-full object-contain bg-white"
                  style="aspect-ratio: 3/4"
                />
                <div class="px-2 py-1.5 text-center border-t border-[#F0F0F0]">
                  <span class="text-[12px] text-[#777]">{{ page.page_number }}페이지</span>
                  <span class="text-[11px] text-[#BBB] ml-1">({{ page.width }}x{{ page.height }})</span>
                </div>
              </div>
            </div>
          </div>

          <!-- 에러 -->
          <div v-else-if="step === 'error'" class="flex flex-col items-center justify-center py-12">
            <svg class="w-10 h-10 text-red-400 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p class="text-[14px] text-red-500">{{ errorMessage }}</p>
            <button @click="reset" class="mt-3 text-[13px] text-[#FF7B22] hover:underline">다시 시도</button>
          </div>
        </div>

        <!-- 하단 버튼 -->
        <div v-if="step === 'preview'" class="px-6 py-4 border-t border-[#F0F0F0] flex justify-between items-center">
          <button @click="reset" class="text-[13px] text-[#999] hover:text-[#555] transition-colors">
            다른 파일 선택
          </button>
          <div class="flex gap-2">
            <button
              @click="handleCancel"
              class="px-4 py-2 text-[14px] text-[#777] bg-[#F5F5F5] rounded-[10px] hover:bg-[#EBEBEB] transition-colors"
            >
              취소
            </button>
            <button
              @click="handleConfirm"
              :disabled="confirming"
              class="px-5 py-2 text-[14px] text-white bg-[#FF7B22] rounded-[10px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors font-medium"
            >
              {{ confirming ? '추가 중...' : `${previewData?.page_count}페이지 추가하기` }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { claimFormApi } from '@shared/services/insuranceApi'

const props = defineProps<{
  visible: boolean
  templateId: number
}>()

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirmed', addedCount: number): void
}>()

type Step = 'select' | 'loading' | 'preview' | 'error'

const step = ref<Step>('select')
const confirming = ref(false)
const errorMessage = ref('')
const previewData = ref<{
  preview_key: string
  page_count: number
  pages: Array<{ page_number: number; width: number; height: number; thumbnail: string }>
} | null>(null)

function reset() {
  step.value = 'select'
  previewData.value = null
  errorMessage.value = ''
}

function handleCancel() {
  reset()
  emit('update:visible', false)
}

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file) return
  input.value = ''

  step.value = 'loading'
  try {
    const response = await claimFormApi.previewPdf(file)
    previewData.value = response.data.data
    step.value = 'preview'
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || 'PDF 변환에 실패했습니다.'
    step.value = 'error'
  }
}

async function handleConfirm() {
  if (!previewData.value) return
  confirming.value = true
  try {
    const response = await claimFormApi.confirmPdfPages(props.templateId, previewData.value.preview_key)
    const addedCount = previewData.value.page_count
    reset()
    emit('update:visible', false)
    emit('confirmed', addedCount)
    alert(response.data.message || `${addedCount}페이지가 추가되었습니다.`)
  } catch (e: any) {
    errorMessage.value = e.response?.data?.message || '페이지 추가에 실패했습니다.'
    step.value = 'error'
  } finally {
    confirming.value = false
  }
}
</script>
