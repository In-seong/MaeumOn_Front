<template>
  <div class="min-h-screen bg-white" :style="mainStyle('100dvh')" @focusin="handleFocusIn">
    <!-- 헤더 -->
    <div class="sticky top-0 z-30 bg-white">
      <div class="flex items-center h-[56px] px-5 max-w-[402px] mx-auto">
        <button @click="handleBack" class="mr-3 -ml-1">
          <span class="material-symbols-outlined text-[22px] text-[#1A1A1A]">arrow_back_ios</span>
        </button>
        <h1 class="text-[17px] font-bold text-[#1A1A1A]">{{ STEP_TITLES[currentStep] || '' }}</h1>
        <div class="ml-auto">
          <button v-if="currentStep <= 7" @click="handleSaveDraft" :disabled="batchStore.loading"
            class="text-[13px] text-[#FF7B22] font-semibold">임시저장</button>
        </div>
      </div>
      <div class="h-[3px] bg-[#F0F0F0]">
        <div class="h-full bg-[#FF7B22] transition-all duration-300"
          :style="{ width: `${(activeStepIndex + 1) / activeSteps.length * 100}%` }"></div>
      </div>
    </div>

    <div class="max-w-[402px] mx-auto">
      <!-- 로딩 -->
      <div v-if="!batchStore.allFormsLoaded" class="text-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
        <p class="mt-3 text-[14px] text-[#6B7280]">양식을 불러오는 중...</p>
      </div>

      <template v-else>
        <!-- ========== Step 1: 약관 동의 ========== -->
        <div v-if="currentStep === 1" class="px-5 pt-6 pb-[120px]">
          <p class="text-[22px] font-bold text-[#1A1A1A] mb-1">약관 동의</p>
          <p class="text-[14px] text-[#6B7280] mb-6">보험금 청구를 위한 약관에 동의해주세요</p>

          <!-- 전체 동의 -->
          <button type="button" @click="toggleAllConsents"
            class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-4 transition-colors"
            :class="allConsentsChecked ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
            <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="allConsentsChecked ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
              <svg v-if="allConsentsChecked" width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="text-[16px] font-bold text-[#1A1A1A]">전체 동의</span>
          </button>

          <!-- 개별 항목 -->
          <div class="flex flex-col gap-2">
            <button v-for="item in CONSENT_ITEMS" :key="item.id" type="button"
              @click="toggleConsent(item.id)"
              class="w-full flex items-center gap-3 bg-white border rounded-[14px] p-4 transition-colors text-left"
              :class="consentState[item.id] ? 'border-[#FF7B22]' : 'border-[#E5E5E5]'">
              <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="consentState[item.id] ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                <svg v-if="consentState[item.id]" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <span class="flex-1 text-[14px] text-[#1A1A1A]">
                <span class="text-[#FF3B30] font-medium">[필수]</span> {{ item.title }}
              </span>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="text-[#C4C4C4] shrink-0">
                <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- ========== Steps 2-6: 필드 입력 ========== -->
        <div v-else-if="currentStep >= 2 && currentStep <= 6" class="px-5 pt-6 pb-[120px]">
          <p class="text-[22px] font-bold text-[#1A1A1A] mb-1">{{ STEP_TITLES[currentStep] }}</p>
          <p class="text-[14px] text-[#6B7280] mb-6">{{ STEP_SUBTITLES[currentStep] || '' }}</p>

          <!-- Step 4: 고객 정보와 동일 -->
          <button v-if="currentStep === 4 && batchStore.selectedCustomer" type="button"
            @click="autoFillContractor = !autoFillContractor; handleAutoFillContractor()"
            class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-6 transition-colors"
            :class="autoFillContractor ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
            <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="autoFillContractor ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
              <svg v-if="autoFillContractor" width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="text-[14px] font-medium text-[#1A1A1A]">고객 정보와 동일</span>
          </button>

          <!-- Step 5: 계약자와 동일 -->
          <button v-if="currentStep === 5" type="button"
            @click="autoFillInsured = !autoFillInsured; handleAutoFillInsured()"
            class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-6 transition-colors"
            :class="autoFillInsured ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
            <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
              :class="autoFillInsured ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
              <svg v-if="autoFillInsured" width="12" height="10" viewBox="0 0 12 10" fill="none">
                <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </span>
            <span class="text-[14px] font-medium text-[#1A1A1A]">계약자와 동일</span>
          </button>

          <!-- Step 6: 자동이체 계좌 -->
          <div v-if="currentStep === 6 && hasAutoTransferField" class="mb-6">
            <p class="text-[13px] font-medium text-[#6B7280] mb-3">보험료 자동이체 계좌로 수령하시겠습니까?</p>
            <p v-if="autoTransferAccount && !allHaveAutoTransfer" class="text-[12px] text-[#FF7B22] mb-2">
              일부 보험사는 자동이체 수령을 지원하지 않아 계좌 정보를 입력해야 합니다.
            </p>
            <div class="flex gap-3">
              <button type="button" @click="autoTransferAccount = true"
                class="flex-1 h-[52px] rounded-[12px] text-[15px] font-medium border-[1.5px] transition-colors"
                :class="autoTransferAccount ? 'border-[#FF7B22] bg-[#FFF3ED] text-[#FF7B22]' : 'border-[#E5E5E5] bg-white text-[#6B7280]'">
                네
              </button>
              <button type="button" @click="autoTransferAccount = false"
                class="flex-1 h-[52px] rounded-[12px] text-[15px] font-medium border-[1.5px] transition-colors"
                :class="!autoTransferAccount ? 'border-[#FF7B22] bg-[#FFF3ED] text-[#FF7B22]' : 'border-[#E5E5E5] bg-white text-[#6B7280]'">
                아니오
              </button>
            </div>
          </div>

          <!-- Step 5: 피보험자 섹션 헤더 -->
          <p v-if="currentStep === 5 && insuredFields.length > 0"
            class="text-[15px] font-semibold text-[#1A1A1A] mb-3">피보험자 정보</p>

          <!-- 공통 필드 -->
          <template v-for="field in currentStepCommonFields" :key="field.key">
            <div class="mb-5">
              <div v-if="field.entries.length > 1" class="flex flex-wrap gap-1 mb-1">
                <span v-for="e in field.entries" :key="e.formFieldId"
                  class="text-[10px] px-1.5 py-0.5 bg-[#FFF3ED] text-[#FF7B22] rounded-full">{{ e.companyName }}</span>
              </div>
              <ClaimFieldInput
                :field="fieldToFormField(field)"
                :model-value="batchStore.getUnifiedValue(field)"
                @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                variant="underline"
              />
            </div>
          </template>

          <!-- Step 5: 수익자 섹션 -->
          <template v-if="currentStep === 5 && beneficiaryFields.length > 0">
            <div class="mt-8 mb-3 pt-6 border-t border-[#F0F0F0]">
              <p class="text-[15px] font-semibold text-[#1A1A1A]">수익자 정보</p>
            </div>
            <template v-for="field in beneficiaryFields" :key="field.key">
              <div class="mb-5">
                <ClaimFieldInput
                  :field="fieldToFormField(field)"
                  :model-value="batchStore.getUnifiedValue(field)"
                  @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                  @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                  variant="underline"
                />
              </div>
            </template>
          </template>

          <!-- 보험사별 전용 필드 -->
          <template v-for="(entry, idx) in batchStore.selectedEntries" :key="'spec-' + idx">
            <template v-if="specificFieldsForStep(currentStep, idx).length > 0">
              <div class="mt-6 mb-3 flex items-center gap-2">
                <span class="w-[6px] h-[6px] rounded-full bg-[#FF7B22]"></span>
                <p class="text-[13px] font-semibold text-[#FF7B22]">{{ entry.company.company_name }}</p>
              </div>
              <template v-for="field in specificFieldsForStep(currentStep, idx)" :key="field.key">
                <div class="mb-5">
                  <ClaimFieldInput
                    :field="fieldToFormField(field)"
                    :model-value="batchStore.getUnifiedValue(field)"
                    @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                    @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                    variant="underline"
                  />
                </div>
              </template>
            </template>
          </template>
        </div>

        <!-- ========== Step 7: 증빙 서류 ========== -->
        <div v-else-if="currentStep === 7" class="px-5 pt-6 pb-[120px]">
          <p class="text-[22px] font-bold text-[#1A1A1A] mb-1">증빙 서류</p>
          <p class="text-[14px] text-[#6B7280] mb-6">진단서, 영수증 등 청구에 필요한 서류를 첨부해주세요</p>

          <!-- 업로드 버튼 -->
          <label class="flex items-center justify-center gap-2 h-[52px] border-2 border-dashed border-[#E5E5E5] rounded-[12px] cursor-pointer hover:border-[#FF7B22] transition-colors mb-4">
            <span class="material-symbols-outlined text-[20px] text-[#6B7280]">add_photo_alternate</span>
            <span class="text-[14px] text-[#6B7280] font-medium">사진/서류 추가</span>
            <input type="file" class="hidden" multiple accept="image/*,application/pdf" @change="handleFileUpload" />
          </label>

          <!-- 썸네일 그리드 -->
          <div v-if="batchStore.commonDocuments.length > 0" class="grid grid-cols-4 gap-3">
            <div v-for="doc in batchStore.commonDocuments" :key="doc.id"
              class="relative w-[80px] h-[80px] rounded-[12px] overflow-hidden bg-[#F5F5F5]">
              <img v-if="isImageFile(doc.name)" :src="getFilePreview(doc.file)" :alt="doc.name"
                class="w-full h-full object-cover" />
              <div v-else class="w-full h-full flex flex-col items-center justify-center">
                <span class="material-symbols-outlined text-[24px] text-[#C4C4C4]">description</span>
                <span class="text-[9px] text-[#C4C4C4] mt-0.5 truncate max-w-[60px]">{{ doc.name.split('.').pop() }}</span>
              </div>
              <button @click="batchStore.removeCommonDocument(doc.id)" type="button"
                class="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#FF3B30] rounded-full flex items-center justify-center shadow-sm">
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                  <path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.5" stroke-linecap="round"/>
                </svg>
              </button>
            </div>
          </div>

          <p v-if="batchStore.commonDocuments.length === 0" class="text-center text-[13px] text-[#C4C4C4] mt-8">
            아직 첨부된 서류가 없습니다
          </p>
        </div>

        <!-- ========== Step 8: 청구 내용 확인 ========== -->
        <div v-else-if="currentStep === 8" class="px-5 pt-6 pb-[120px]">
          <p class="text-[22px] font-bold text-[#1A1A1A] mb-1">청구 내용 확인</p>
          <p class="text-[14px] text-[#6B7280] mb-6">입력하신 내용을 확인해주세요</p>

          <div v-for="(entry, idx) in batchStore.selectedEntries" :key="'review-' + idx" class="mb-4">
            <div class="bg-[#F6F6F8] rounded-[14px] p-[18px_20px]">
              <div class="flex items-center justify-between mb-3">
                <p class="text-[15px] font-bold text-[#1A1A1A]">{{ entry.company.company_name }}</p>
                <span class="text-[12px] font-medium px-2 py-0.5 rounded-full"
                  :class="progressPercent(idx) === 100
                    ? 'bg-[#E8F8EE] text-[#34C759]'
                    : 'bg-[#FFF3ED] text-[#FF7B22]'">
                  {{ progressPercent(idx) }}%
                </span>
              </div>
              <div class="space-y-2">
                <template v-for="item in getSummaryForEntry(idx)" :key="item.label">
                  <div v-if="item.value" class="flex justify-between text-[13px]">
                    <span class="text-[#6B7280] shrink-0 mr-3">{{ item.label }}</span>
                    <span class="text-[#1A1A1A] text-right truncate">{{ displayValue(item.value) }}</span>
                  </div>
                </template>
              </div>
              <button v-if="progressPercent(idx) < 100" type="button"
                @click="goToFirstIncompleteStep()"
                class="mt-3 text-[12px] text-[#FF7B22] font-medium">
                미입력 항목 채우기 →
              </button>
            </div>
          </div>

          <!-- 첨부파일 요약 -->
          <div class="bg-[#F6F6F8] rounded-[14px] p-[18px_20px]">
            <p class="text-[15px] font-bold text-[#1A1A1A] mb-2">첨부 서류</p>
            <p class="text-[13px] text-[#6B7280]">{{ batchStore.commonDocuments.length }}개 파일</p>
          </div>
        </div>

        <!-- ========== Step 9: 서명 ========== -->
        <div v-else-if="currentStep === 9" class="px-5 pt-6 pb-[120px]">
          <div class="flex items-center justify-between mb-1">
            <p class="text-[22px] font-bold text-[#1A1A1A]">서명</p>
            <button type="button" @click="resetSignature" class="flex items-center gap-1 text-[12px] text-[#999] active:text-[#FF7B22]">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-5.07-11.36L23 10"/></svg>
              다시 쓰기
            </button>
          </div>
          <p class="text-[14px] text-[#6B7280] mb-6">아래 영역에 서명해주세요. 모든 보험사 청구서에 적용됩니다.</p>

          <div v-if="!signatureDataUrl">
            <div class="relative rounded-[14px] overflow-hidden bg-[#FAF0F0]" style="height: 160px;">
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
              <p v-if="!hasDrawn" class="absolute inset-0 flex items-center justify-center text-[14px] text-[#C4C4C4] pointer-events-none">
                여기에 서명해주세요
              </p>
            </div>
            <div class="flex gap-3 mt-3">
              <button type="button" @click="clearCanvas"
                class="flex-1 h-[44px] rounded-[12px] text-[14px] font-medium text-[#6B7280] border border-[#E5E5E5]">
                지우기
              </button>
              <button type="button" @click="completeSignature"
                class="flex-1 h-[44px] rounded-[12px] text-[14px] font-medium text-white bg-[#FF7B22]">
                서명 완료
              </button>
            </div>
          </div>

          <div v-else class="text-center">
            <div class="rounded-[14px] overflow-hidden bg-[#FAF0F0] p-4">
              <img :src="signatureDataUrl" alt="서명" class="max-h-[120px] mx-auto" />
            </div>
            <button type="button" @click="resetSignature" class="mt-3 text-[13px] text-[#FF7B22] font-medium">
              다시 서명
            </button>
          </div>
        </div>

        <!-- ========== Step 10: 최종 확인 ========== -->
        <div v-else-if="currentStep === 10" class="px-5 pt-6 pb-[120px]">
          <p class="text-[22px] font-bold text-[#1A1A1A] mb-1">최종 확인</p>
          <p class="text-[14px] text-[#6B7280] mb-6">
            {{ batchStore.selectedEntries.length }}개 보험사에 청구서를 제출합니다
          </p>

          <!-- 보험사 카드 목록 -->
          <div class="space-y-3 mb-6">
            <div v-for="(entry, idx) in batchStore.selectedEntries" :key="'final-' + idx"
              class="flex items-center gap-3 bg-[#F6F6F8] rounded-[14px] p-4">
              <span class="w-[40px] h-[40px] rounded-full flex items-center justify-center text-[16px] font-bold shrink-0"
                :class="progressPercent(idx) === 100 ? 'bg-[#E8F8EE] text-[#34C759]' : 'bg-[#FFF3ED] text-[#FF7B22]'">
                {{ progressPercent(idx) === 100 ? '✓' : '!' }}
              </span>
              <div class="flex-1 min-w-0">
                <p class="text-[15px] font-medium text-[#1A1A1A] truncate">{{ entry.company.company_name }}</p>
                <p class="text-[12px] text-[#6B7280]">{{ entry.claimForm?.form_name || '' }}</p>
              </div>
              <span class="text-[13px] font-semibold shrink-0"
                :class="progressPercent(idx) === 100 ? 'text-[#34C759]' : 'text-[#FF7B22]'">
                {{ progressPercent(idx) }}%
              </span>
            </div>
          </div>

          <!-- 서명 확인 -->
          <div v-if="signatureDataUrl" class="bg-[#F6F6F8] rounded-[14px] p-4 mb-6">
            <p class="text-[13px] text-[#6B7280] mb-2">서명</p>
            <img :src="signatureDataUrl" alt="서명" class="h-[60px]" />
          </div>

          <!-- 동의 확인 -->
          <div class="bg-[#F6F6F8] rounded-[14px] p-4">
            <label class="flex items-start gap-3 cursor-pointer">
              <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                :class="finalConsentChecked ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'"
                @click="finalConsentChecked = !finalConsentChecked">
                <svg v-if="finalConsentChecked" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </span>
              <div @click="finalConsentChecked = !finalConsentChecked">
                <p class="text-[14px] font-medium text-[#1A1A1A]">위 내용을 확인하였으며, 청구에 동의합니다</p>
                <p class="text-[12px] text-[#6B7280] mt-1">
                  {{ batchStore.selectedEntries.map(e => e.company.company_name).join(', ') }} 보험금 청구
                </p>
              </div>
            </label>
          </div>
        </div>
      </template>
    </div>

    <!-- 하단 CTA -->
    <div v-if="batchStore.allFormsLoaded"
      class="fixed bottom-0 left-0 right-0 bg-white z-20 pt-3 px-5"
      style="padding-bottom: max(env(safe-area-inset-bottom, 8px), 8px);">
      <div class="max-w-[402px] mx-auto">
        <button @click="handleCTA" :disabled="!canProceed || batchStore.loading"
          class="w-full h-[56px] rounded-[28px] text-[16px] font-bold transition-colors"
          :class="canProceed && !batchStore.loading
            ? 'bg-[#FF7B22] text-white active:bg-[#E86D1A]'
            : 'bg-[#FFD4B3] text-white'">
          <span v-if="batchStore.loading" class="flex items-center justify-center gap-2">
            <span class="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></span>
            처리 중...
          </span>
          <span v-else>{{ ctaText }}</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@shared/api'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import type { UnifiedField } from '../../stores/agentBatchClaimStore'
import type { FormField } from '@shared/types'
import { useKeyboardSafe } from '../../composables/useKeyboardSafe'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'

const router = useRouter()
const route = useRoute()
const batchStore = useAgentBatchClaimStore()
const { handleFocusIn, mainStyle } = useKeyboardSafe()

// ===== Step Definitions =====
const currentStep = ref(1)

const STEP_TITLES: Record<number, string> = {
  1: '약관 동의',
  2: '진단 정보',
  3: '사고·청구 내용',
  4: '계약자 정보',
  5: '피보험자·수익자 정보',
  6: '계좌 정보',
  7: '증빙 서류',
  8: '청구 내용 확인',
  9: '서명',
  10: '최종 확인',
}

const STEP_SUBTITLES: Record<number, string> = {
  2: '진단명과 사고 유형을 입력해주세요',
  3: '사고 일시와 청구 사유를 입력해주세요',
  4: '계약자(청구인)의 정보를 입력해주세요',
  5: '피보험자와 수익자 정보를 입력해주세요',
  6: '보험금을 수령할 계좌를 입력해주세요',
}

// ===== Field → Step Mapping =====
const DIAGNOSIS_CODES = new Set([
  'ACCIDENT_TYPE', 'ACCIDENT_DETAIL_TYPE',
  'DISEASE_NAME', 'DISEASE_CODE',
  'HOSPITALIZATION_YN', 'SURGERY_YN',
])

function getFieldWizardStep(field: UnifiedField): number {
  if (field.category === 2) {
    if (field.standardCode && DIAGNOSIS_CODES.has(field.standardCode)) return 2
    const name = field.key.toLowerCase()
    if (name.includes('disease') || name.includes('hospital_yn') || name.includes('surgery_yn')) return 2
    return 3
  }
  if (field.category === 3) return 4
  if (field.category === 4) return 5
  if (field.category === 5) return 6
  return 3
}

const fieldsByStep = computed(() => {
  const map: Record<number, UnifiedField[]> = { 2: [], 3: [], 4: [], 5: [], 6: [] }
  for (const f of batchStore.unifiedFields) {
    const step = getFieldWizardStep(f)
    const arr = map[step]
    if (arr) arr.push(f)
  }
  return map
})

// ===== Active Steps (skip empty) =====
const activeSteps = computed(() => {
  const steps: number[] = [1]
  for (const s of [2, 3, 4, 5, 6] as const) {
    const fields = fieldsByStep.value[s]
    if (fields && fields.length > 0) steps.push(s)
  }
  steps.push(7, 8, 9, 10)
  return steps
})

const activeStepIndex = computed(() => {
  const idx = activeSteps.value.indexOf(currentStep.value)
  return idx >= 0 ? idx : 0
})

// ===== Step Field Accessors =====
function commonFieldsForStep(step: number): UnifiedField[] {
  return (fieldsByStep.value[step] || []).filter(f => !f.isCompanySpecific)
}

function specificFieldsForStep(step: number, entryIndex: number): UnifiedField[] {
  return (fieldsByStep.value[step] || []).filter(f =>
    f.isCompanySpecific && f.entries.some(e => e.entryIndex === entryIndex)
  )
}

const insuredFields = computed(() =>
  commonFieldsForStep(5).filter(f => {
    const code = f.standardCode || ''
    const name = f.key.toLowerCase()
    return code.startsWith('INSURED_') || (name.startsWith('insured_') && !code.startsWith('BENEFICIARY_'))
  })
)

const beneficiaryFields = computed(() =>
  commonFieldsForStep(5).filter(f => {
    const code = f.standardCode || ''
    const name = f.key.toLowerCase()
    return code.startsWith('BENEFICIARY_') || name.startsWith('beneficiary_')
  })
)

const otherStep5Fields = computed(() =>
  commonFieldsForStep(5).filter(f => {
    const code = f.standardCode || ''
    const name = f.key.toLowerCase()
    return !code.startsWith('INSURED_') && !code.startsWith('BENEFICIARY_') &&
      !name.startsWith('insured_') && !name.startsWith('beneficiary_')
  })
)

const ACCOUNT_HIDE_CODES = new Set(['BANK_NAME', 'ACCOUNT_NUMBER', 'ACCOUNT_HOLDER', 'ACCOUNT_HOLDER_RRN', 'AUTO_TRANSFER_ACCOUNT'])

const hasAutoTransferField = computed(() => {
  return batchStore.selectedEntries.some(entry => {
    if (!entry.claimForm) return false
    return batchStore.getFormFields(entry.claimForm).some(f => f.standard_field_code === 'AUTO_TRANSFER_ACCOUNT')
  })
})

const allHaveAutoTransfer = computed(() => {
  return batchStore.selectedEntries.every(entry => {
    if (!entry.claimForm) return false
    return batchStore.getFormFields(entry.claimForm).some(f => f.standard_field_code === 'AUTO_TRANSFER_ACCOUNT')
  })
})

const visibleAccountFields = computed(() => {
  const allFields = commonFieldsForStep(6)
  if (autoTransferAccount.value && allHaveAutoTransfer.value) {
    return allFields.filter(f => !f.standardCode || !ACCOUNT_HIDE_CODES.has(f.standardCode))
  }
  if (autoTransferAccount.value) {
    return allFields.filter(f => f.standardCode !== 'AUTO_TRANSFER_ACCOUNT')
  }
  return allFields
})

const currentStepCommonFields = computed((): UnifiedField[] => {
  const step = currentStep.value
  if (step === 5) {
    return [...insuredFields.value, ...otherStep5Fields.value]
  }
  if (step === 6) return visibleAccountFields.value
  return commonFieldsForStep(step)
})

// ===== Consent (Step 1) =====
const CONSENT_ITEMS = [
  { id: 'privacy', title: '개인정보 수집·이용 동의' },
  { id: 'identification', title: '고유식별정보 처리 동의' },
  { id: 'sensitive', title: '민감정보 처리 동의' },
]

const consentState = ref<Record<string, boolean>>({
  privacy: false,
  identification: false,
  sensitive: false,
})

const allConsentsChecked = computed(() =>
  CONSENT_ITEMS.every(item => consentState.value[item.id])
)

function toggleAllConsents() {
  const newVal = !allConsentsChecked.value
  for (const item of CONSENT_ITEMS) {
    consentState.value[item.id] = newVal
  }
}

function toggleConsent(id: string) {
  consentState.value[id] = !consentState.value[id]
}

// ===== Auto-fill =====
const autoFillContractor = ref(false)
const autoFillInsured = ref(false)
const autoTransferAccount = ref(false)
const finalConsentChecked = ref(false)

function handleAutoFillContractor() {
  if (!batchStore.selectedCustomer) return
  for (let i = 0; i < batchStore.selectedEntries.length; i++) {
    const entry = batchStore.selectedEntries[i]
    if (!entry?.claimForm) continue
    const fields = batchStore.getFormFields(entry.claimForm).filter(f =>
      batchStore.getFieldCategory(f) === 3
    )
    batchStore.autoFillStepFromCustomer(i, fields, autoFillContractor.value)
  }
}

function handleAutoFillInsured() {
  const CODE_MAP: Record<string, string[]> = {
    CONTRACTOR_NAME: ['INSURED_NAME', 'BENEFICIARY_NAME'],
    CONTRACTOR_RRN: ['INSURED_RRN', 'BENEFICIARY_RRN'],
    CONTRACTOR_RRN_FRONT: ['INSURED_RRN_FRONT', 'BENEFICIARY_RRN_FRONT'],
    CONTRACTOR_RRN_BACK: ['INSURED_RRN_BACK', 'BENEFICIARY_RRN_BACK'],
    CONTRACTOR_PHONE: ['INSURED_PHONE', 'BENEFICIARY_PHONE'],
    CONTRACTOR_ADDRESS: ['INSURED_ADDRESS', 'BENEFICIARY_ADDRESS'],
    CONTRACTOR_EMAIL: ['INSURED_EMAIL', 'BENEFICIARY_EMAIL'],
  }

  for (const field of batchStore.unifiedFields) {
    if (!field.standardCode) continue
    const targets = CODE_MAP[field.standardCode]
    if (!targets) continue
    const sourceVal = batchStore.getUnifiedValue(field)

    for (const targetCode of targets) {
      const targetField = batchStore.unifiedFields.find(f => f.standardCode === targetCode)
      if (targetField) {
        batchStore.setUnifiedValue(targetField, autoFillInsured.value ? sourceVal : '')
      }
    }
  }
}

watch(autoTransferAccount, (useAuto) => {
  for (const entry of batchStore.selectedEntries) {
    if (!entry.claimForm) continue
    for (const f of batchStore.getFormFields(entry.claimForm)) {
      if (f.standard_field_code === 'AUTO_TRANSFER_ACCOUNT') {
        entry.fieldValues[f.form_field_id] = useAuto ? '확인' : ''
      }
    }
  }
})

// ===== File Upload (Step 7) =====
const filePreviewUrls = ref<Record<string, string>>({})

function handleFileUpload(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (let i = 0; i < input.files.length; i++) {
    const file = input.files[i]
    if (file) {
      batchStore.addCommonDocument(file)
      if (file.type.startsWith('image/')) {
        const lastDoc = batchStore.commonDocuments[batchStore.commonDocuments.length - 1]
        if (lastDoc) {
          filePreviewUrls.value[lastDoc.id] = URL.createObjectURL(file)
        }
      }
    }
  }
  input.value = ''
}

function isImageFile(name: string): boolean {
  return /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(name)
}

function getFilePreview(file: File): string {
  const doc = batchStore.commonDocuments.find(d => d.file === file)
  if (doc && filePreviewUrls.value[doc.id]) return filePreviewUrls.value[doc.id]!
  const url = URL.createObjectURL(file)
  if (doc) filePreviewUrls.value[doc.id] = url
  return url
}

// ===== Signature (Step 9) =====
const signatureCanvasRef = ref<HTMLCanvasElement | null>(null)
const isDrawing = ref(false)
const hasDrawn = ref(false)
const signatureDataUrl = ref('')

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
  if (!canvas || !hasDrawn.value) return
  signatureDataUrl.value = canvas.toDataURL('image/png')
  batchStore.applySignatureToAll(signatureDataUrl.value)
}

function resetSignature() {
  signatureDataUrl.value = ''
  batchStore.applySignatureToAll('')
  nextTick(() => nextTick(() => initCanvas()))
}

// ===== Summary (Step 8) =====
function getSummaryForEntry(entryIndex: number) {
  const entry = batchStore.selectedEntries[entryIndex]
  if (!entry?.claimForm) return []
  const fields = batchStore.getFormFields(entry.claimForm)
  return fields
    .filter(f => f.field_type !== 'consent' && f.field_type !== 'signature')
    .map(f => ({
      label: f.field_label,
      value: entry.fieldValues[f.form_field_id] || '',
    }))
}

function displayValue(val: string): string {
  if (val.startsWith('data:image/')) return '(서명)'
  if (val.startsWith('[')) {
    try {
      const arr = JSON.parse(val)
      if (Array.isArray(arr)) return arr.join(', ')
    } catch { /* ignore */ }
  }
  return val
}

function progressPercent(entryIndex: number): number {
  const p = batchStore.getCompanyProgress(entryIndex)
  return p.total === 0 ? 100 : Math.round((p.filled / p.total) * 100)
}

// ===== Navigation =====
const canProceed = computed(() => {
  switch (currentStep.value) {
    case 1: return allConsentsChecked.value
    case 9: return signatureDataUrl.value !== ''
    case 10: return finalConsentChecked.value
    default: return true
  }
})

const ctaText = computed(() => {
  if (currentStep.value === 10) {
    return `${batchStore.selectedEntries.length}건 일괄 청구 제출`
  }
  return '다음'
})

function handleCTA() {
  if (currentStep.value === 10) {
    handleSubmit()
    return
  }
  nextStep()
}

function nextStep() {
  const idx = activeSteps.value.indexOf(currentStep.value)
  const nextIdx = idx + 1
  const next = activeSteps.value[nextIdx]
  if (next !== undefined) {
    currentStep.value = next
    window.scrollTo(0, 0)
  }
}

function handleBack() {
  const idx = activeSteps.value.indexOf(currentStep.value)
  if (idx > 0) {
    const prev = activeSteps.value[idx - 1]
    if (prev !== undefined) {
      currentStep.value = prev
      window.scrollTo(0, 0)
    }
  } else {
    router.back()
  }
}

function goToFirstIncompleteStep() {
  for (const s of [2, 3, 4, 5, 6] as const) {
    if (!activeSteps.value.includes(s)) continue
    const fields = fieldsByStep.value[s]
    if (!fields || fields.length === 0) continue
    const hasEmpty = fields.some(f => {
      if (!f.isRequired) return false
      const val = batchStore.getUnifiedValue(f)
      return !val
    })
    if (hasEmpty) {
      currentStep.value = s
      window.scrollTo(0, 0)
      return
    }
  }
  currentStep.value = 2
  window.scrollTo(0, 0)
}

// ===== Field Helpers =====
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

// ===== Draft & Submit =====
async function handleSaveDraft() {
  if (batchStore.currentBatch) {
    await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
  } else {
    await batchStore.saveDraft()
  }
  if (!batchStore.error) alert('임시저장되었습니다.')
}

async function handleSubmit() {
  if (!canProceed.value) return

  if (batchStore.currentBatch) {
    const batch = await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
    if (batch && !batchStore.error) {
      const result = await batchStore.submitDraft(batch.batch_claim_id)
      if (result) {
        router.replace(`/batch-claims/${batch.batch_claim_id}`)
      }
    }
  } else {
    // createBatch()는 STATUS_PENDING으로 생성 + PDF까지 완료하므로 submitDraft 불필요
    const batch = await batchStore.createBatch()
    if (batch && !batchStore.error) {
      router.replace(`/batch-claims/${batch.batch_claim_id}`)
    }
  }
  if (batchStore.error) alert(batchStore.error)
}

// ===== Lifecycle =====
onMounted(async () => {
  if (batchStore.selectedEntries.length === 0) {
    router.replace('/claims/new')
    return
  }
  batchStore.autoFillFromCustomer()

  // 청구배정 파일 자동 첨부
  const requestId = route.query.requestId as string | undefined
  if (requestId) {
    try {
      const assignRes = await api.get<{ data: Array<{ request_id: number; files?: Array<{ file_id: number; file_name: string }> }> }>('/agent/claim-assignments')
      const assignment = assignRes.data.data.find(a => a.request_id === Number(requestId))
      if (assignment?.files && assignment.files.length > 0) {
        const downloaded = await Promise.all(
          assignment.files.map(async (file) => {
            try {
              const res = await api.get(`/agent/claim-request-files/${file.file_id}/download`, { responseType: 'blob' })
              const ext = file.file_name.split('.').pop()?.toLowerCase() ?? ''
              const mimeTypes: Record<string, string> = {
                jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png',
                gif: 'image/gif', webp: 'image/webp', pdf: 'application/pdf',
              }
              const mime = mimeTypes[ext] ?? 'application/octet-stream'
              const blob = new Blob([res.data as BlobPart], { type: mime })
              return new File([blob], file.file_name, { type: mime })
            } catch {
              return null
            }
          })
        )
        const validFiles = downloaded.filter((f): f is File => f !== null)
        for (const file of validFiles) {
          batchStore.addCommonDocument(file)
          if (file.type.startsWith('image/')) {
            const lastDoc = batchStore.commonDocuments[batchStore.commonDocuments.length - 1]
            if (lastDoc) {
              filePreviewUrls.value[lastDoc.id] = URL.createObjectURL(file)
            }
          }
        }
      }
    } catch { /* 파일 자동 첨부 실패 시 무시 */ }
  }
})

watch(currentStep, (step) => {
  if (step === 9) nextTick(() => initCanvas())
})

watch(signatureCanvasRef, (el) => {
  if (el) nextTick(() => initCanvas())
})
</script>
