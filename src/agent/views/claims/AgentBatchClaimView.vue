<template>
  <div class="min-h-screen bg-[#F8F8F8]" :style="mainStyle" @focusin="handleFocusIn">
    <!-- 헤더 -->
    <div class="sticky top-0 z-30 bg-white border-b border-[#F0F0F0]">
      <div class="flex items-center h-[56px] px-4 max-w-[402px] mx-auto">
        <button @click="handleBack" class="mr-3">
          <span class="material-symbols-outlined text-[24px] text-[#333]">arrow_back</span>
        </button>
        <h1 class="text-[17px] font-bold text-[#222]">
          {{ currentStep === 1 ? '통합 청구서 작성' : '확인 & 서명' }}
        </h1>
        <div class="ml-auto flex items-center gap-2">
          <button
            v-if="currentStep === 1"
            @click="handleSaveDraft"
            :disabled="batchStore.loading"
            class="text-[13px] text-[#FF7B22] font-medium"
          >임시저장</button>
        </div>
      </div>
    </div>

    <div class="max-w-[402px] mx-auto pb-[100px]">
      <!-- 로딩 -->
      <div v-if="!batchStore.allFormsLoaded" class="text-center py-10">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
        <p class="mt-2 text-[13px] text-[#999]">양식을 불러오는 중...</p>
      </div>

      <template v-else>
        <!-- ========== Step 1: 통합 입력 ========== -->
        <template v-if="currentStep === 1">
          <!-- 보험사별 진행률 -->
          <div class="px-4 pt-4 pb-2">
            <p class="text-[12px] text-[#999] mb-2">입력 현황</p>
            <div class="flex gap-2 overflow-x-auto pb-1">
              <div
                v-for="(entry, idx) in batchStore.selectedEntries"
                :key="entry.company.company_id"
                class="flex-shrink-0 bg-white rounded-[12px] px-3 py-2 shadow-[0_0_6px_rgba(0,0,0,0.04)] min-w-[100px]"
              >
                <p class="text-[11px] text-[#666] font-medium truncate">{{ entry.company.company_name }}</p>
                <div class="mt-1 h-[4px] bg-[#F0F0F0] rounded-full overflow-hidden">
                  <div
                    class="h-full rounded-full transition-all duration-300"
                    :class="progressPercent(idx) === 100 ? 'bg-[#34C759]' : 'bg-[#FF7B22]'"
                    :style="{ width: progressPercent(idx) + '%' }"
                  ></div>
                </div>
                <p class="text-[10px] mt-0.5" :class="progressPercent(idx) === 100 ? 'text-[#34C759]' : 'text-[#999]'">
                  {{ progressPercent(idx) }}%
                </p>
              </div>
            </div>
          </div>

          <!-- 고객 정보 자동 채움 토글 -->
          <div v-if="batchStore.selectedCustomer" class="px-4 py-2">
            <div class="bg-[#FFF8F3] rounded-[12px] px-4 py-3 flex items-center justify-between">
              <div>
                <p class="text-[13px] font-medium text-[#333]">{{ batchStore.selectedCustomer.name }} 고객 정보 자동 입력</p>
                <p class="text-[11px] text-[#999]">이름, 연락처, 주소 등 자동 채움</p>
              </div>
              <span class="material-symbols-outlined text-[20px] text-[#FF7B22]">check_circle</span>
            </div>
          </div>

          <!-- 공통 필드 카테고리별 섹션 -->
          <template v-for="cat in commonCategories" :key="cat">
            <section v-if="commonFieldsByCategory(cat).length > 0" class="mx-4 mt-4">
              <button
                @click="toggleCategory(cat)"
                class="w-full flex items-center justify-between bg-white rounded-t-[12px] px-4 py-3 border border-[#E8E8E8]"
                :class="{ 'rounded-b-[12px]': !openCategories.has(cat) }"
              >
                <span class="text-[14px] font-bold text-[#333]">{{ batchStore.CATEGORY_LABELS[cat] || '기타' }}</span>
                <span
                  class="material-symbols-outlined text-[18px] text-[#999] transition-transform"
                  :class="{ 'rotate-180': openCategories.has(cat) }"
                >expand_more</span>
              </button>
              <div v-if="openCategories.has(cat)" class="bg-white border-x border-b border-[#E8E8E8] rounded-b-[12px] px-4 pb-4">
                <div v-for="field in commonFieldsByCategory(cat)" :key="field.key" class="mt-4">
                  <div class="flex items-baseline justify-between mb-1">
                    <label class="text-[13px] font-medium text-[#333]">
                      {{ field.label }}
                      <span v-if="field.isRequired" class="text-red-500 ml-0.5">*</span>
                    </label>
                  </div>
                  <div class="flex flex-wrap gap-1 mb-1.5">
                    <span
                      v-for="e in field.entries"
                      :key="e.formFieldId"
                      class="text-[10px] px-1.5 py-0.5 bg-[#FFF3ED] text-[#FF7B22] rounded-full"
                    >{{ e.companyName }}</span>
                  </div>
                  <ClaimFieldInput
                    :field="fieldToFormField(field)"
                    :model-value="batchStore.getUnifiedValue(field)"
                    @update:model-value="val => batchStore.setUnifiedValue(field, val)"
                    @format-input="(fid, ft, ev) => handleFormatInput(field, ft, ev)"
                  />
                </div>
              </div>
            </section>
          </template>

          <!-- 보험사별 전용 필드 -->
          <template v-for="(entry, idx) in batchStore.selectedEntries" :key="'specific-' + entry.company.company_id">
            <section class="mx-4 mt-4">
              <button
                @click="toggleSpecific(idx)"
                class="w-full flex items-center justify-between bg-white rounded-t-[12px] px-4 py-3 border border-[#E8E8E8]"
                :class="{ 'rounded-b-[12px]': !openSpecifics.has(idx) }"
              >
                <span class="text-[14px] font-bold text-[#333]">{{ entry.company.company_name }} 전용</span>
                <div class="flex items-center gap-2">
                  <span v-if="specificFieldsForCompany(idx).length === 0" class="text-[11px] text-[#34C759]">추가 입력 없음 ✓</span>
                  <span v-else class="text-[11px] text-[#999]">{{ specificFieldsForCompany(idx).length }}개 필드</span>
                  <span
                    class="material-symbols-outlined text-[18px] text-[#999] transition-transform"
                    :class="{ 'rotate-180': openSpecifics.has(idx) }"
                  >expand_more</span>
                </div>
              </button>
              <div v-if="openSpecifics.has(idx) && specificFieldsForCompany(idx).length > 0" class="bg-white border-x border-b border-[#E8E8E8] rounded-b-[12px] px-4 pb-4">
                <div v-for="field in specificFieldsForCompany(idx)" :key="field.key" class="mt-4">
                  <label class="text-[13px] font-medium text-[#333] mb-1.5 block">
                    {{ field.label }}
                    <span v-if="field.isRequired" class="text-red-500 ml-0.5">*</span>
                  </label>
                  <ClaimFieldInput
                    :field="fieldToFormField(field)"
                    :model-value="batchStore.getUnifiedValue(field)"
                    @update:model-value="val => batchStore.setUnifiedValue(field, val)"
                    @format-input="(fid, ft, ev) => handleFormatInput(field, ft, ev)"
                  />
                </div>
              </div>
            </section>
          </template>

          <!-- 첨부파일 -->
          <section class="mx-4 mt-4">
            <button
              @click="showDocSection = !showDocSection"
              class="w-full flex items-center justify-between bg-white rounded-t-[12px] px-4 py-3 border border-[#E8E8E8]"
              :class="{ 'rounded-b-[12px]': !showDocSection }"
            >
              <span class="text-[14px] font-bold text-[#333]">첨부 서류</span>
              <div class="flex items-center gap-2">
                <span class="text-[11px] text-[#999]">{{ batchStore.commonDocuments.length }}개</span>
                <span
                  class="material-symbols-outlined text-[18px] text-[#999] transition-transform"
                  :class="{ 'rotate-180': showDocSection }"
                >expand_more</span>
              </div>
            </button>
            <div v-if="showDocSection" class="bg-white border-x border-b border-[#E8E8E8] rounded-b-[12px] px-4 pb-4 pt-3">
              <p class="text-[12px] text-[#999] mb-3">진단서, 영수증 등 공통 서류를 첨부하세요</p>
              <label class="flex items-center justify-center gap-2 py-3 border-2 border-dashed border-[#E8E8E8] rounded-[10px] cursor-pointer hover:border-[#FF7B22] transition-colors">
                <span class="material-symbols-outlined text-[20px] text-[#999]">upload_file</span>
                <span class="text-[13px] text-[#999]">파일 선택</span>
                <input type="file" class="hidden" multiple @change="handleFileUpload" />
              </label>
              <div v-for="doc in batchStore.commonDocuments" :key="doc.id" class="flex items-center justify-between mt-2 px-3 py-2 bg-[#F8F8F8] rounded-[8px]">
                <div class="min-w-0">
                  <p class="text-[13px] text-[#333] truncate">{{ doc.name }}</p>
                  <p class="text-[10px] text-[#999]">{{ formatFileSize(doc.size) }}</p>
                </div>
                <button @click="batchStore.removeCommonDocument(doc.id)" class="ml-2 shrink-0">
                  <span class="material-symbols-outlined text-[18px] text-[#999]">close</span>
                </button>
              </div>
            </div>
          </section>

          <!-- 하단 버튼 -->
          <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-4 py-3 z-20">
            <div class="max-w-[402px] mx-auto">
              <button
                @click="goToStep2"
                class="w-full py-3.5 rounded-[12px] text-[15px] font-bold transition-colors"
                :class="hasMinimumInput ? 'bg-[#FF7B22] text-white active:scale-[0.98]' : 'bg-[#E8E8E8] text-[#999]'"
                :disabled="!hasMinimumInput"
              >다음: 확인 & 서명</button>
            </div>
          </div>
        </template>

        <!-- ========== Step 2: 확인 & 서명 ========== -->
        <template v-if="currentStep === 2">
          <!-- 보험사별 검토 -->
          <div class="px-4 pt-4">
            <p class="text-[14px] font-bold text-[#333] mb-3">청구 내역 확인</p>
            <div v-for="(entry, idx) in batchStore.selectedEntries" :key="entry.company.company_id" class="mb-3">
              <div
                class="bg-white rounded-[12px] border px-4 py-3"
                :class="progressPercent(idx) === 100 ? 'border-[#34C759]' : 'border-[#FFB74D]'"
              >
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span
                      class="material-symbols-outlined text-[18px]"
                      :class="progressPercent(idx) === 100 ? 'text-[#34C759]' : 'text-[#FFB74D]'"
                    >{{ progressPercent(idx) === 100 ? 'check_circle' : 'warning' }}</span>
                    <span class="text-[14px] font-medium text-[#333]">{{ entry.company.company_name }}</span>
                  </div>
                  <span class="text-[12px]" :class="progressPercent(idx) === 100 ? 'text-[#34C759]' : 'text-[#FFB74D]'">
                    {{ progressPercent(idx) === 100 ? '입력 완료' : `${missingFieldCount(idx)}개 미입력` }}
                  </span>
                </div>
                <button
                  v-if="progressPercent(idx) < 100"
                  @click="currentStep = 1"
                  class="mt-2 text-[12px] text-[#FF7B22] font-medium"
                >미입력 항목 채우기 →</button>
              </div>
            </div>
          </div>

          <!-- 서명 -->
          <section class="mx-4 mt-4">
            <div class="bg-white rounded-[12px] border border-[#E8E8E8] p-4">
              <p class="text-[14px] font-bold text-[#333] mb-3">서명</p>
              <p class="text-[12px] text-[#999] mb-3">한번 서명하면 모든 보험사 청구서에 적용됩니다</p>

              <div v-if="!signatureDataUrl">
                <div class="relative border-2 border-dashed border-[#E8E8E8] rounded-[10px] overflow-hidden bg-[#FAFAFA]" style="height: 160px;">
                  <canvas
                    ref="signatureCanvasRef"
                    class="absolute inset-0 w-full h-full touch-none"
                    @mousedown="startDraw"
                    @mousemove="onDraw"
                    @mouseup="endDraw"
                    @mouseleave="endDraw"
                    @touchstart.prevent="startDraw"
                    @touchmove.prevent="onDraw"
                    @touchend="endDraw"
                  ></canvas>
                  <p v-if="!hasDrawn" class="absolute inset-0 flex items-center justify-center text-[13px] text-[#CCC] pointer-events-none">여기에 서명하세요</p>
                </div>
                <div class="flex gap-2 mt-2">
                  <button @click="clearCanvas" class="flex-1 py-2 text-[13px] text-[#999] border border-[#E8E8E8] rounded-[8px]">지우기</button>
                  <button @click="completeSignature" class="flex-1 py-2 text-[13px] text-white bg-[#FF7B22] rounded-[8px] font-medium">서명 완료</button>
                </div>
              </div>

              <div v-else class="text-center">
                <img :src="signatureDataUrl" alt="서명" class="max-h-[120px] mx-auto border border-[#E8E8E8] rounded-[8px]" />
                <button @click="resetSignature" class="mt-2 text-[12px] text-[#FF7B22] font-medium">다시 서명</button>
              </div>
            </div>
          </section>

          <!-- 동의 -->
          <section class="mx-4 mt-4">
            <label class="flex items-start gap-3 bg-white rounded-[12px] border border-[#E8E8E8] p-4 cursor-pointer">
              <input v-model="consentChecked" type="checkbox" class="mt-0.5 w-5 h-5 accent-[#FF7B22]" />
              <div>
                <p class="text-[13px] font-medium text-[#333]">개인정보 수집·이용 전체 동의</p>
                <p class="text-[11px] text-[#999] mt-1">
                  {{ batchStore.selectedEntries.map(e => e.company.company_name).join(', ') }} 보험금 청구를 위한 개인정보 수집·이용에 동의합니다.
                </p>
              </div>
            </label>
          </section>

          <!-- 하단 버튼 -->
          <div class="fixed bottom-0 left-0 right-0 bg-white border-t border-[#F0F0F0] px-4 py-3 z-20">
            <div class="max-w-[402px] mx-auto">
              <button
                @click="handleSubmit"
                :disabled="!canSubmit || batchStore.loading"
                class="w-full py-3.5 rounded-[12px] text-[15px] font-bold transition-colors"
                :class="canSubmit ? 'bg-[#FF7B22] text-white active:scale-[0.98]' : 'bg-[#E8E8E8] text-[#999]'"
              >
                <span v-if="batchStore.loading" class="flex items-center justify-center gap-2">
                  <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  제출 중...
                </span>
                <span v-else>{{ batchStore.selectedEntries.length }}건 일괄 청구 제출</span>
              </button>
            </div>
          </div>
        </template>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import type { UnifiedField } from '../../stores/agentBatchClaimStore'
import type { FormField } from '@shared/types'
import { useKeyboardSafe } from '../../composables/useKeyboardSafe'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'

const router = useRouter()
const route = useRoute()
const batchStore = useAgentBatchClaimStore()
const { handleFocusIn, mainStyle } = useKeyboardSafe()

const currentStep = ref(1)
const openCategories = ref(new Set<number>([2, 3]))
const openSpecifics = ref(new Set<number>())
const showDocSection = ref(false)
const consentChecked = ref(false)

// 서명
const signatureCanvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const hasDrawn = ref(false)
const signatureDataUrl = ref('')

const commonCategories = computed(() => {
  const cats = new Set<number>()
  for (const f of batchStore.unifiedFields) {
    if (!f.isCompanySpecific) cats.add(f.category)
  }
  return [...cats].sort()
})

function commonFieldsByCategory(cat: number): UnifiedField[] {
  return batchStore.unifiedFields.filter(f => !f.isCompanySpecific && f.category === cat)
}

function specificFieldsForCompany(entryIndex: number): UnifiedField[] {
  return batchStore.unifiedFields.filter(f => f.isCompanySpecific && f.entries[0]?.entryIndex === entryIndex)
}

function progressPercent(entryIndex: number): number {
  const p = batchStore.getCompanyProgress(entryIndex)
  return p.total === 0 ? 100 : Math.round((p.filled / p.total) * 100)
}

function missingFieldCount(entryIndex: number): number {
  const p = batchStore.getCompanyProgress(entryIndex)
  return p.total - p.filled
}

const hasMinimumInput = computed(() => {
  const common = batchStore.unifiedFields.filter(f => !f.isCompanySpecific)
  if (common.length === 0) return true
  return common.some(f => {
    const val = batchStore.getUnifiedValue(f)
    return val !== undefined && val !== ''
  })
})

const canSubmit = computed(() => signatureDataUrl.value !== '' && consentChecked.value)

function toggleCategory(cat: number) {
  if (openCategories.value.has(cat)) openCategories.value.delete(cat)
  else openCategories.value.add(cat)
}

function toggleSpecific(idx: number) {
  if (openSpecifics.value.has(idx)) openSpecifics.value.delete(idx)
  else openSpecifics.value.add(idx)
}

function fieldToFormField(uf: UnifiedField): FormField {
  const first = uf.entries[0]
  return {
    form_field_id: first?.formFieldId ?? 0,
    claim_form_id: 0,
    field_name: uf.key,
    standard_field_code: uf.standardCode,
    field_label: uf.label,
    field_type: uf.fieldType,
    field_order: 0,
    is_required: uf.isRequired,
    field_options: uf.fieldOptions,
    x_position: 0,
    y_position: 0,
    width: 0,
    height: 0,
    font_size: 12,
    font_color: '#000',
    placeholder: uf.placeholder,
  }
}

function handleFormatInput(field: UnifiedField, fieldType: string, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value
  switch (fieldType) {
    case 'phone':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 3 && value.length <= 7) value = value.slice(0, 3) + '-' + value.slice(3)
      else if (value.length > 7) value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
      target.value = value
      break
    case 'resident_number':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 6) value = value.slice(0, 6) + '-' + value.slice(6, 13)
      target.value = value
      break
    case 'resident_number_front':
      value = value.replace(/[^0-9]/g, '').slice(0, 6)
      target.value = value
      break
    case 'resident_number_back':
      value = value.replace(/[^0-9]/g, '').slice(0, 7)
      target.value = value
      break
    case 'number':
      value = value.replace(/[^0-9]/g, '')
      target.value = value
      break
  }
  batchStore.setUnifiedValue(field, value)
}

// 파일 업로드
function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i]
    if (file) batchStore.addCommonDocument(file)
  }
  input.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// 서명 캔버스
function initCanvas() {
  const canvas = signatureCanvasRef.value
  if (!canvas) return
  const dpr = window.devicePixelRatio || 1
  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * dpr
  canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.scale(dpr, dpr)
    ctx.lineWidth = 2
    ctx.lineCap = 'round'
    ctx.strokeStyle = '#000000'
  }
}

function getPos(e: MouseEvent | TouchEvent) {
  const canvas = signatureCanvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  if ('touches' in e) {
    const touch = e.touches[0]
    if (!touch) return { x: 0, y: 0 }
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function startDraw(e: MouseEvent | TouchEvent) {
  isDrawing.value = true
  hasDrawn.value = true
  const ctx = signatureCanvasRef.value?.getContext('2d')
  if (!ctx) return
  const pos = getPos(e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
}

function onDraw(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value) return
  const ctx = signatureCanvasRef.value?.getContext('2d')
  if (!ctx) return
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function endDraw() {
  isDrawing.value = false
}

function clearCanvas() {
  const canvas = signatureCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height)
  hasDrawn.value = false
}

function completeSignature() {
  const canvas = signatureCanvasRef.value
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  signatureDataUrl.value = dataUrl
  batchStore.applySignatureToAll(dataUrl)
}

function resetSignature() {
  signatureDataUrl.value = ''
  batchStore.applySignatureToAll('')
  nextTick(() => {
    nextTick(() => initCanvas())
  })
}

// 네비게이션
function goToStep2() {
  currentStep.value = 2
  window.scrollTo(0, 0)
}

function handleBack() {
  if (currentStep.value === 2) {
    currentStep.value = 1
    window.scrollTo(0, 0)
  } else {
    router.back()
  }
}

async function handleSaveDraft() {
  if (batchStore.currentBatch) {
    await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
  } else {
    await batchStore.saveDraft()
  }
  if (!batchStore.error) {
    alert('임시저장되었습니다.')
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return
  const batch = batchStore.currentBatch
    ? await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
    : await batchStore.createBatch()

  if (batch && !batchStore.error) {
    const result = await batchStore.submitDraft(batch.batch_claim_id)
    if (result) {
      router.replace(`/batch-claims/${batch.batch_claim_id}`)
    }
  }
  if (batchStore.error) alert(batchStore.error)
}

// 초기화
onMounted(() => {
  if (batchStore.selectedEntries.length === 0) {
    router.replace('/claims/new')
    return
  }
  batchStore.autoFillFromCustomer()
})

watch(currentStep, (step) => {
  if (step === 2) {
    nextTick(() => initCanvas())
  }
})

watch(signatureCanvasRef, (el) => {
  if (el) nextTick(() => initCanvas())
})
</script>
