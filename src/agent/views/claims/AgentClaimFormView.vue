<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="isEditMode ? '청구서 수정' : '대리 청구서 작성'" />
      <main class="px-5 py-4 pb-8 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          <p class="ml-3 text-[13px] text-[#999]">{{ isEditMode ? '청구 정보를 불러오는 중...' : '양식 정보를 불러오는 중...' }}</p>
        </div>

        <!-- 고객 미지정 오류 -->
        <div v-else-if="!isEditMode && !customerId" class="text-center py-20">
          <p class="text-[15px] text-[#888]">고객이 지정되지 않았습니다.</p>
          <button
            @click="goBack"
            class="mt-4 bg-[#FF7B22] text-white rounded-[12px] px-6 py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            양식 선택으로 돌아가기
          </button>
        </div>

        <!-- 위저드 폼 -->
        <div v-else-if="claimStore.selectedClaimForm">
          <!-- 양식 정보 -->
          <CardSection class="mb-4">
            <div>
              <span class="text-[13px] text-[#888]">{{ claimStore.selectedClaimForm.insurance_company?.company_name }}</span>
              <p class="text-[18px] font-bold text-[#222] mt-0.5">
                {{ claimStore.selectedClaimForm.form_name }}
              </p>
              <!-- 대리 작성 고객 표시 -->
              <p v-if="customerStore.selectedCustomer" class="text-[12px] text-[#FF7B22] mt-1">
                고객: {{ customerStore.selectedCustomer.name }} 님 대리 작성
              </p>
            </div>
          </CardSection>

          <!-- 위저드 스텝 바 -->
          <div class="mb-4">
            <WizardStepBar
              :current-step="currentStep"
              :active-steps="activeSteps"
              :step-labels="STEP_LABELS"
            />
          </div>

          <!-- 스텝 제목 -->
          <p class="text-[16px] font-bold text-[#222] mb-4 px-1">
            {{ STEP_TITLES[currentStep] || '' }}
          </p>

          <form @submit.prevent="handleSubmit">
            <!-- ===== Step 1: 약관 동의 ===== -->
            <div v-if="currentStep === 1">
              <CardSection class="mb-4">
                <!-- 전체동의 -->
                <label
                  class="flex items-center gap-2 p-3 bg-[#FFF3ED] rounded-[12px] mb-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    :checked="allConsentsAgreed"
                    @change="toggleAllConsents"
                    class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
                  />
                  <span class="text-[15px] text-[#333] font-semibold">전체 동의</span>
                </label>

                <!-- 동의 항목 리스트 -->
                <div class="flex flex-col gap-2">
                  <div
                    v-for="item in CONSENT_ITEMS"
                    :key="item.id"
                    class="flex items-center gap-3 p-3 bg-white border border-[#E8E8E8] rounded-[12px] cursor-pointer"
                    @click="openConsentOverlay(item)"
                  >
                    <input
                      type="checkbox"
                      :checked="consentAgreed[item.id]"
                      @click.stop
                      @change="toggleConsentItem(item.id)"
                      class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22] flex-shrink-0"
                    />
                    <span class="flex-1 text-[14px] text-[#333]">
                      <span class="text-[#FF0000] font-medium">[필수]</span>
                      {{ item.title }}
                    </span>
                    <span class="flex-shrink-0 text-[#999]">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M9 5l7 7-7 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                  </div>
                </div>
              </CardSection>
            </div>

            <!-- ===== Step 4: 피보험자/수익자 ===== -->
            <div v-else-if="currentStep === 4">
              <!-- insured_/beneficiary_ 접두어로 서브섹션 분리된 경우 -->
              <template v-if="insuredStepFields.length > 0 || beneficiaryStepFields.length > 0">
                <!-- 피보험자 섹션 -->
                <CardSection v-if="insuredStepFields.length > 0" class="mb-4">
                  <p class="text-[15px] font-semibold text-[#222] mb-3">피보험자 정보</p>
                  <label class="flex items-center gap-2 p-3 bg-[#FFF3ED] rounded-[12px] mb-4 cursor-pointer">
                    <input type="checkbox" v-model="autoFillInsuredFromContractor" @change="handleAutoFillInsured" class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]" />
                    <span class="text-[14px] text-[#333] font-medium">계약자와 동일</span>
                  </label>
                  <div class="flex flex-col gap-4">
                    <template v-for="field in insuredStepFields" :key="field.form_field_id">
                      <div v-if="field.field_type === 'signature'">
                        <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                          {{ field.field_label }}
                          <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                        </label>
                        <div v-if="!claimStore.fieldValues[field.form_field_id]?.startsWith('data:image/')">
                          <canvas
                            :ref="(el: any) => setSignatureCanvasRef(field.form_field_id, el)"
                            class="w-full h-32 border border-[#E8E8E8] rounded-[12px] bg-white touch-none"
                            @mousedown="startSignatureDraw(field.form_field_id, $event)"
                            @mousemove="drawSignature($event)"
                            @mouseup="endSignatureDraw"
                            @mouseleave="endSignatureDraw"
                            @touchstart="startSignatureDraw(field.form_field_id, $event)"
                            @touchmove="drawSignature($event)"
                            @touchend="endSignatureDraw"
                          ></canvas>
                          <button type="button" @click="completeSignature(field.form_field_id)" class="mt-2 w-full py-2 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-transform">서명 완료</button>
                        </div>
                        <div v-else class="text-center">
                          <img :src="claimStore.fieldValues[field.form_field_id]" alt="서명" class="h-24 mx-auto border border-[#E8E8E8] rounded-[8px] bg-white" />
                          <button type="button" @click="resetSignature(field.form_field_id)" class="mt-2 text-[13px] text-[#FF7B22] underline">다시 서명</button>
                        </div>
                      </div>
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="claimStore.setFieldValue(field.form_field_id, $event)" @format-input="formatFieldInput" />
                    </template>
                  </div>
                </CardSection>

                <!-- 수익자 섹션 -->
                <CardSection v-if="beneficiaryStepFields.length > 0" class="mb-4">
                  <p class="text-[15px] font-semibold text-[#222] mb-3">보험 수익자 정보</p>
                  <label class="flex items-center gap-2 p-3 bg-[#FFF3ED] rounded-[12px] mb-4 cursor-pointer">
                    <input type="checkbox" v-model="autoFillBeneficiaryFromContractor" @change="handleAutoFillBeneficiary" class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]" />
                    <span class="text-[14px] text-[#333] font-medium">계약자와 동일</span>
                  </label>
                  <div class="flex flex-col gap-4">
                    <template v-for="field in beneficiaryStepFields" :key="field.form_field_id">
                      <div v-if="field.field_type === 'signature'">
                        <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                          {{ field.field_label }}
                          <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                        </label>
                        <div v-if="!claimStore.fieldValues[field.form_field_id]?.startsWith('data:image/')">
                          <canvas
                            :ref="(el: any) => setSignatureCanvasRef(field.form_field_id, el)"
                            class="w-full h-32 border border-[#E8E8E8] rounded-[12px] bg-white touch-none"
                            @mousedown="startSignatureDraw(field.form_field_id, $event)"
                            @mousemove="drawSignature($event)"
                            @mouseup="endSignatureDraw"
                            @mouseleave="endSignatureDraw"
                            @touchstart="startSignatureDraw(field.form_field_id, $event)"
                            @touchmove="drawSignature($event)"
                            @touchend="endSignatureDraw"
                          ></canvas>
                          <button type="button" @click="completeSignature(field.form_field_id)" class="mt-2 w-full py-2 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-transform">서명 완료</button>
                        </div>
                        <div v-else class="text-center">
                          <img :src="claimStore.fieldValues[field.form_field_id]" alt="서명" class="h-24 mx-auto border border-[#E8E8E8] rounded-[8px] bg-white" />
                          <button type="button" @click="resetSignature(field.form_field_id)" class="mt-2 text-[13px] text-[#FF7B22] underline">다시 서명</button>
                        </div>
                      </div>
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="claimStore.setFieldValue(field.form_field_id, $event)" @format-input="formatFieldInput" />
                    </template>
                  </div>
                </CardSection>

                <!-- 기타 Step 4 필드 (접두어 없는 필드) -->
                <CardSection v-if="otherStep4Fields.length > 0" class="mb-4">
                  <div class="flex flex-col gap-4">
                    <template v-for="field in otherStep4Fields" :key="field.form_field_id">
                      <div v-if="field.field_type === 'signature'">
                        <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                          {{ field.field_label }}
                          <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                        </label>
                        <div v-if="!claimStore.fieldValues[field.form_field_id]?.startsWith('data:image/')">
                          <canvas
                            :ref="(el: any) => setSignatureCanvasRef(field.form_field_id, el)"
                            class="w-full h-32 border border-[#E8E8E8] rounded-[12px] bg-white touch-none"
                            @mousedown="startSignatureDraw(field.form_field_id, $event)"
                            @mousemove="drawSignature($event)"
                            @mouseup="endSignatureDraw"
                            @mouseleave="endSignatureDraw"
                            @touchstart="startSignatureDraw(field.form_field_id, $event)"
                            @touchmove="drawSignature($event)"
                            @touchend="endSignatureDraw"
                          ></canvas>
                          <button type="button" @click="completeSignature(field.form_field_id)" class="mt-2 w-full py-2 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-transform">서명 완료</button>
                        </div>
                        <div v-else class="text-center">
                          <img :src="claimStore.fieldValues[field.form_field_id]" alt="서명" class="h-24 mx-auto border border-[#E8E8E8] rounded-[8px] bg-white" />
                          <button type="button" @click="resetSignature(field.form_field_id)" class="mt-2 text-[13px] text-[#FF7B22] underline">다시 서명</button>
                        </div>
                      </div>
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="claimStore.setFieldValue(field.form_field_id, $event)" @format-input="formatFieldInput" />
                    </template>
                  </div>
                </CardSection>
              </template>

              <!-- 접두어 없이 wizard_step=4로만 지정된 경우 -->
              <CardSection v-else class="mb-4">
                <label class="flex items-center gap-2 p-3 bg-[#FFF3ED] rounded-[12px] mb-4 cursor-pointer">
                  <input type="checkbox" v-model="autoFillInsuredFromContractor" @change="handleAutoFillStep4" class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]" />
                  <span class="text-[14px] text-[#333] font-medium">계약자와 동일</span>
                </label>
                <div class="flex flex-col gap-4">
                  <template v-for="field in currentStepFields" :key="field.form_field_id">
                    <div v-if="field.field_type === 'signature'">
                      <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                        {{ field.field_label }}
                        <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                      </label>
                      <div v-if="!claimStore.fieldValues[field.form_field_id]?.startsWith('data:image/')">
                        <canvas
                          :ref="(el: any) => setSignatureCanvasRef(field.form_field_id, el)"
                          class="w-full h-32 border border-[#E8E8E8] rounded-[12px] bg-white touch-none"
                          @mousedown="startSignatureDraw(field.form_field_id, $event)"
                          @mousemove="drawSignature($event)"
                          @mouseup="endSignatureDraw"
                          @mouseleave="endSignatureDraw"
                          @touchstart="startSignatureDraw(field.form_field_id, $event)"
                          @touchmove="drawSignature($event)"
                          @touchend="endSignatureDraw"
                        ></canvas>
                        <button type="button" @click="completeSignature(field.form_field_id)" class="mt-2 w-full py-2 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-transform">서명 완료</button>
                      </div>
                      <div v-else class="text-center">
                        <img :src="claimStore.fieldValues[field.form_field_id]" alt="서명" class="h-24 mx-auto border border-[#E8E8E8] rounded-[8px] bg-white" />
                        <button type="button" @click="resetSignature(field.form_field_id)" class="mt-2 text-[13px] text-[#FF7B22] underline">다시 서명</button>
                      </div>
                    </div>
                    <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="claimStore.setFieldValue(field.form_field_id, $event)" @format-input="formatFieldInput" />
                  </template>
                </div>
              </CardSection>
            </div>

            <!-- ===== Step 2, 3, 5: 일반 필드 ===== -->
            <div v-else>
              <CardSection class="mb-4">
                <!-- 자동채움: Step 3 "고객 정보와 동일" -->
                <label
                  v-if="currentStep === 3"
                  class="flex items-center gap-2 p-3 bg-[#FFF3ED] rounded-[12px] mb-4 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    v-model="autoFillFromCustomer"
                    @change="handleAutoFillFromCustomer"
                    class="w-5 h-5 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
                  />
                  <span class="text-[14px] text-[#333] font-medium">고객 정보와 동일</span>
                </label>

                <!-- 필드 렌더링 -->
                <div class="flex flex-col gap-4">
                  <template v-for="field in currentStepFields" :key="field.form_field_id">
                    <!-- 서명 필드: 인라인 렌더링 -->
                    <div v-if="field.field_type === 'signature'">
                      <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                        {{ field.field_label }}
                        <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                      </label>
                      <div v-if="!claimStore.fieldValues[field.form_field_id]?.startsWith('data:image/')">
                        <canvas
                          :ref="(el: any) => setSignatureCanvasRef(field.form_field_id, el)"
                          class="w-full h-32 border border-[#E8E8E8] rounded-[12px] bg-white touch-none"
                          @mousedown="startSignatureDraw(field.form_field_id, $event)"
                          @mousemove="drawSignature($event)"
                          @mouseup="endSignatureDraw"
                          @mouseleave="endSignatureDraw"
                          @touchstart="startSignatureDraw(field.form_field_id, $event)"
                          @touchmove="drawSignature($event)"
                          @touchend="endSignatureDraw"
                        ></canvas>
                        <button
                          type="button"
                          @click="completeSignature(field.form_field_id)"
                          class="mt-2 w-full py-2 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium active:scale-[0.98] transition-transform"
                        >서명 완료</button>
                      </div>
                      <div v-else class="text-center">
                        <img
                          :src="claimStore.fieldValues[field.form_field_id]"
                          alt="서명"
                          class="h-24 mx-auto border border-[#E8E8E8] rounded-[8px] bg-white"
                        />
                        <button
                          type="button"
                          @click="resetSignature(field.form_field_id)"
                          class="mt-2 text-[13px] text-[#FF7B22] underline"
                        >다시 서명</button>
                      </div>
                    </div>

                    <!-- 일반 필드: ClaimFieldInput 컴포넌트 -->
                    <ClaimFieldInput
                      v-else
                      :field="field"
                      :model-value="claimStore.fieldValues[field.form_field_id] || ''"
                      @update:model-value="claimStore.setFieldValue(field.form_field_id, $event)"
                      @format-input="formatFieldInput"
                    />
                  </template>
                </div>
              </CardSection>
            </div>

            <!-- 첨부파일 (마지막 활성 스텝에서만) -->
            <CardSection v-if="isLastStep" class="mb-4">
              <p class="text-[15px] font-semibold text-[#222] mb-3">첨부파일</p>

              <div
                v-for="(file, i) in attachedFiles"
                :key="i"
                class="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[8px] mb-2"
              >
                <svg class="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-[13px] text-[#555] flex-1 truncate">{{ file.name }}</span>
                <span class="text-[12px] text-[#999] flex-shrink-0">{{ formatFileSize(file.size) }}</span>
                <button
                  type="button"
                  @click="removeFile(i)"
                  class="text-[#FF4444] text-[16px] font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center"
                >
                  &times;
                </button>
              </div>

              <button
                type="button"
                @click="fileInput?.click()"
                class="w-full border-2 border-dashed border-[#DDD] rounded-[12px] py-4 text-[14px] text-[#999] active:bg-[#F8F8F8] transition-colors"
              >
                + 첨부파일 추가 (사진, 서류)
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*,application/pdf"
                multiple
                @change="handleFileSelect"
                class="hidden"
              />
              <p class="text-[11px] text-[#B0B0B0] mt-1">JPG, PNG, PDF / 파일당 최대 10MB</p>
            </CardSection>

            <!-- 에러 메시지 -->
            <div v-if="claimStore.error" class="mb-4 p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
              {{ claimStore.error }}
            </div>

            <!-- 네비게이션 버튼 -->
            <div class="flex gap-3">
              <button
                v-if="!isFirstStep"
                type="button"
                @click="goPrevStep"
                class="flex-1 border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              >이전</button>

              <button
                v-if="!isLastStep"
                type="button"
                @click="goNextStep"
                :disabled="!isCurrentStepValid"
                class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
              >{{ nextButtonText }}</button>

              <button
                v-if="isLastStep"
                type="submit"
                :disabled="!isFormValid || submitting"
                class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
              >
                {{ submitting ? '처리 중...' : submitButtonText }}
              </button>
            </div>
          </form>
        </div>

        <!-- 템플릿 없음 -->
        <div v-else class="text-center py-20">
          <p class="text-[15px] text-[#888]">양식 정보를 찾을 수 없습니다.</p>
          <button
            @click="goBack"
            class="mt-4 bg-[#FF7B22] text-white rounded-[12px] px-6 py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            양식 선택으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  </div>

  <!-- 동의서 오버레이 -->
  <ConsentOverlay
    :visible="consentOverlayVisible"
    :title="consentOverlayTitle"
    :consent-text="consentOverlayText"
    @agree="handleConsentAgree"
    @disagree="handleConsentDisagree"
    @close="consentOverlayVisible = false"
  />
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import { useCustomerStore } from '../../stores/customerStore'
import type { FormPage, FormField, Customer } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import WizardStepBar from '@shared/components/claim/WizardStepBar.vue'
import ConsentOverlay from '@shared/components/claim/ConsentOverlay.vue'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'

const router = useRouter()
const route = useRoute()
const claimStore = useAgentClaimStore()
const customerStore = useCustomerStore()

const isEditMode = computed(() => !!route.params.claimId)
const claimId = computed(() => Number(route.params.claimId))
const templateId = computed(() => Number(route.params.templateId))
const customerId = computed(() => (route.query.customerId as string) || '')
const submitting = ref(false)
const loading = ref(false)
const attachedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)

// ===== 위저드 상태 =====
const currentStep = ref(1)
const STEP_LABELS = ['약관 동의', '청구 내용', '계약자', '피보험자', '계좌 정보']

const STEP_TITLES: Record<number, string> = {
  1: '보험금 청구를 위해 약관 동의를 해주세요',
  2: '청구하실 내용을 입력해주세요',
  3: '계약자 정보를 입력해 주세요',
  4: '피보험자 정보를 확인해주세요',
  5: '보험금을 지급받을 계좌 정보를 입력해주세요',
}

const STEP_NEXT_TEXT: Record<number, string> = {
  1: '다음',
  2: '청구내용 입력하기',
  3: '계약자 정보 입력하기',
  4: '피보험자 정보 입력하기',
  5: '계좌정보 입력하기',
}

// ===== 앱 고정 동의 항목 =====
interface ConsentItem {
  id: string
  title: string
  text: string
}

const CONSENT_ITEMS: ConsentItem[] = [
  {
    id: 'privacy',
    title: '개인(신용)정보 처리 동의',
    text: `보험금청구 개인정보 수집/이용 동의

(주)뱅크다이어리는 개인정보보호법, 신용정보법, 정보통신망법 등 관련 법령에 따라 이용자의 개인(신용)정보 및 권익을 보호하고 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같이 동의절차를 준수하고 있습니다. 귀하는 수집된 개인(신용)정보의 처리(열람,정정,삭제 등)을 개인정보보호 책임자에게 요구할 수 있습니다.

처리목적:
보험금청구 서비스 제공
청구서 서류를 해당 보험회사로 전송 및 청구요청
각 보험회사에 전송한 청구내용 확인

처리항목:
이름(계약자, 피보험자, 보험수익자)
휴대전화번호, 이메일 주소, 은행명, 계좌번호, 예금주명

이용 및 보유기간: 목적 달성 후 3개월 이내 파기

귀하는 개인정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만 거부할 경우 뱅크다이어리 보험금청구서비스 이용을 할 수 없습니다.`,
  },
  {
    id: 'sensitive',
    title: '민감정보 및 고유식별정보 처리 동의',
    text: `보험금청구 고유식별정보 수집/이용동의

(주)뱅크다이어리는 개인정보보호법, 신용정보법, 정보통신망법 등 관련 법령에 따라 이용자의 개인(신용)정보 및 권익을 보호하고 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같이 동의절차를 준수하고 있습니다. 귀하는 수집된 개인(신용)정보의 처리(열람,정정,삭제 등)을 개인정보보호 책임자에게 요구할 수 있습니다.

처리목적:
보험금청구 서비스 제공
사용자가 입력한 주민등록번호 혹은 외국인등록번호를 통한 보험금청구 서비스 제공

처리항목:
고객이 입력한 주민등록번호 혹은 외국인등록번호
주민등록번호 뒷자리를 보험사로 전달만 하며 별도로 저장하거나 처리하지 않습니다.

이용 및 보유기간: 저장하지 않음

귀하는 고유식별정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만 거부할 경우 뱅크다이어리 보험금청구서비스 이용을 할 수 없습니다.

─────────────────────────────

보험금청구 민감정보 수집/이용 동의

(주)뱅크다이어리는 개인정보보호법, 신용정보법, 정보통신망법 등 관련 법령에 따라 이용자의 개인(신용)정보 및 권익을 보호하고 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같이 동의절차를 준수하고 있습니다. 귀하는 수집된 개인(신용)정보의 처리(열람,정정,삭제 등)을 개인정보보호 책임자에게 요구할 수 있습니다.

처리목적:
보험금청구 서비스 제공
청구서 서류를 해당 보험회사로 전송 및 청구요청
각 보험회사에 전송한 청구내용 확인

처리항목:
사고유형(질병,상해,교통사고 등)
진단내용, 병명, 진료기록부, 수술확인서, 입퇴원확인서, 진료비영수증, 약제비영수증, 진료비 세부내역서

이용 및 보유기간: 목적 달성 후 3개월 이내 파기

귀하는 민감정보 수집 및 이용에 대한 동의를 거부할 권리가 있습니다. 다만 거부할 경우 뱅크다이어리 보험금청구서비스 이용을 할 수 없습니다.`,
  },
]

// 로컬 동의 상태 (폼 필드와 분리)
const consentAgreed = ref<Record<string, boolean>>({
  privacy: false,
  sensitive: false,
})

// ===== 자동채움 상태 =====
const autoFillFromCustomer = ref(false)
const autoFillInsuredFromContractor = ref(false)
const autoFillBeneficiaryFromContractor = ref(false)

// ===== 동의서 오버레이 상태 =====
const consentOverlayVisible = ref(false)
const consentOverlayTitle = ref('')
const consentOverlayText = ref('')
const activeConsentItemId = ref<string | null>(null)

// ===== 서명 캔버스 관련 =====
const signatureCanvasRefs = ref<Record<number, HTMLCanvasElement>>({})
const isDrawing = ref(false)
const activeSignatureFieldId = ref<number | null>(null)

// ===== 필드 정렬/매핑 =====
const sortedPages = computed<FormPage[]>(() => {
  if (!claimStore.selectedClaimForm?.form_pages) return []
  return [...claimStore.selectedClaimForm.form_pages].sort((a, b) => a.page_number - b.page_number)
})

const allFieldsSorted = computed<FormField[]>(() => {
  if (!sortedPages.value.length) {
    return [...(claimStore.selectedClaimForm?.form_fields || [])].sort((a, b) => a.field_order - b.field_order)
  }
  return sortedPages.value.flatMap(page =>
    [...(page.form_fields || [])].sort((a: FormField, b: FormField) => a.field_order - b.field_order)
  )
})

// 템플릿의 consent 필드 (값 동기화용, UI에 표시하지 않음)
const templateConsentFields = computed(() =>
  allFieldsSorted.value.filter(f => f.field_type === 'consent')
)

// 카테고리별 consent 필드 분류
const privacyConsentFields = computed(() =>
  templateConsentFields.value.filter(f => f.field_name.startsWith('consent_privacy'))
)
const sensitiveConsentFields = computed(() =>
  templateConsentFields.value.filter(f => f.field_name.startsWith('consent_sensitive'))
)
// 기존 레거시 (카테고리 미지정) consent 필드
const legacyConsentFields = computed(() =>
  templateConsentFields.value.filter(f =>
    !f.field_name.startsWith('consent_privacy') && !f.field_name.startsWith('consent_sensitive')
  )
)

// consent 제외한 일반 필드 (위저드 UI 표시용)
const wizardDisplayFields = computed(() =>
  allFieldsSorted.value.filter(f => f.field_type !== 'consent')
)

// ===== 필드 -> 위저드 스텝 매핑 =====
function getFieldWizardStep(field: FormField): number {
  if (field.field_options?.wizard_step) return field.field_options.wizard_step
  const name = field.field_name.toLowerCase()
  if (name.startsWith('contractor_')) return 3
  if (name.startsWith('insured_') || name.startsWith('beneficiary_')) return 4
  if (name.startsWith('account_') || name.startsWith('bank_')) return 5
  return 2
}

// Step 1은 항상 포함 (고정 약관), 나머지는 일반 필드 기반
const activeSteps = computed(() => {
  const steps = new Set<number>([1])
  wizardDisplayFields.value.forEach(f => steps.add(getFieldWizardStep(f)))
  return [...steps].sort((a, b) => a - b)
})

// 현재 스텝 필드 (consent 제외)
const currentStepFields = computed(() =>
  wizardDisplayFields.value.filter(f => getFieldWizardStep(f) === currentStep.value)
)

// Step 4 서브섹션 분리
const insuredStepFields = computed(() =>
  currentStepFields.value.filter(f => f.field_name.toLowerCase().startsWith('insured_'))
)

const beneficiaryStepFields = computed(() =>
  currentStepFields.value.filter(f => f.field_name.toLowerCase().startsWith('beneficiary_'))
)

const otherStep4Fields = computed(() =>
  currentStepFields.value.filter(f => {
    const name = f.field_name.toLowerCase()
    return !name.startsWith('insured_') && !name.startsWith('beneficiary_')
  })
)

// ===== 동의 -> 템플릿 consent 필드 값 동기화 =====
const allConsentsAgreed = computed(() =>
  CONSENT_ITEMS.every(item => consentAgreed.value[item.id])
)

// 동의 상태 변경 시 -> 카테고리별로 consent 필드 동기화
watch(consentAgreed, (agreed) => {
  const privacyValue = agreed.privacy ? 'agree' : ''
  privacyConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, privacyValue)
  })

  const sensitiveValue = agreed.sensitive ? 'agree' : ''
  sensitiveConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, sensitiveValue)
  })

  const legacyValue = (agreed.privacy && agreed.sensitive) ? 'agree' : ''
  legacyConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, legacyValue)
  })
}, { deep: true })

function toggleAllConsents() {
  const newValue = !allConsentsAgreed.value
  CONSENT_ITEMS.forEach(item => {
    consentAgreed.value[item.id] = newValue
  })
}

function toggleConsentItem(itemId: string) {
  consentAgreed.value[itemId] = !consentAgreed.value[itemId]
}

function openConsentOverlay(item: ConsentItem) {
  consentOverlayTitle.value = item.title
  consentOverlayText.value = item.text
  activeConsentItemId.value = item.id
  consentOverlayVisible.value = true
}

function handleConsentAgree() {
  if (activeConsentItemId.value) {
    consentAgreed.value[activeConsentItemId.value] = true
  }
  consentOverlayVisible.value = false
}

function handleConsentDisagree() {
  if (activeConsentItemId.value) {
    consentAgreed.value[activeConsentItemId.value] = false
  }
  consentOverlayVisible.value = false
}

// ===== 스텝 유효성 검사 =====
function isFieldValid(field: FormField): boolean {
  const value = claimStore.fieldValues[field.form_field_id]
  switch (field.field_type) {
    case 'checkbox': {
      if (!value) return false
      try {
        const arr = JSON.parse(value)
        return Array.isArray(arr) && arr.length > 0
      } catch { return false }
    }
    case 'consent':
      return value === 'agree'
    case 'signature':
      return !!value && value.startsWith('data:image/')
    default:
      return !!value && value.trim().length > 0
  }
}

const isCurrentStepValid = computed(() => {
  if (currentStep.value === 1) return allConsentsAgreed.value
  return currentStepFields.value
    .filter(f => f.is_required)
    .every(f => isFieldValid(f))
})

const isFormValid = computed(() =>
  allConsentsAgreed.value &&
  wizardDisplayFields.value
    .filter(f => f.is_required)
    .every(f => isFieldValid(f))
)

// ===== 네비게이션 =====
const isFirstStep = computed(() => currentStep.value === activeSteps.value[0])
const isLastStep = computed(() => currentStep.value === activeSteps.value[activeSteps.value.length - 1])

const nextButtonText = computed(() => {
  const currentIdx = activeSteps.value.indexOf(currentStep.value)
  const nextStepNum = activeSteps.value[currentIdx + 1]
  if (nextStepNum !== undefined && STEP_NEXT_TEXT[nextStepNum]) {
    return STEP_NEXT_TEXT[nextStepNum]
  }
  return '다음'
})

const submitButtonText = computed(() => {
  if (isEditMode.value) return '청구서 수정'
  return STEP_NEXT_TEXT[currentStep.value] || '청구서 생성'
})

function goNextStep() {
  if (!isCurrentStepValid.value) return
  const currentIdx = activeSteps.value.indexOf(currentStep.value)
  if (currentIdx < activeSteps.value.length - 1) {
    const nextStep = activeSteps.value[currentIdx + 1]
    if (nextStep !== undefined) {
      currentStep.value = nextStep
      scrollToTop()
    }
  }
}

function goPrevStep() {
  const currentIdx = activeSteps.value.indexOf(currentStep.value)
  if (currentIdx > 0) {
    const prevStep = activeSteps.value[currentIdx - 1]
    if (prevStep !== undefined) {
      currentStep.value = prevStep
      scrollToTop()
    }
  }
}

function scrollToTop() {
  const mainEl = document.querySelector('main')
  if (mainEl) mainEl.scrollTop = 0
}

// ===== 자동채움: Step 3 (고객 정보와 동일) =====
// 자동채움 매핑 타입: customer 필드 키 + 분할 처리를 위한 특수 키
type AutoFillKey = 'name' | 'phone' | 'email' | 'resident_front' | 'resident_back' | 'resident_full' | null

function matchAutoFillKey(field: FormField): AutoFillKey {
  const name = field.field_name.toLowerCase()
  const label = (field.field_label || '').toLowerCase()
  const type = field.field_type

  // 주민번호 뒷자리: field_name에 jumin 포함 (생년월일이 아닌 것)
  if (name.includes('jumin') || (name.includes('resident') && !name.includes('birth'))) {
    // label로 뒷자리 판별
    if (label.includes('뒷') || label.includes('후')) return 'resident_back'
    // field_type이 resident_number면 전체 주민번호일 수 있음
    if (type === 'resident_number') return 'resident_full'
    // 기본: 뒷자리로 간주 (birth 필드가 따로 있으므로)
    return 'resident_back'
  }
  // 생년월일 (주민번호 앞 6자리): birth 키워드
  if (name.includes('birth') || label.includes('생년') || label.includes('생일')) {
    return 'resident_front'
  }
  // 전화번호
  if (type === 'phone' || name.includes('phone') || name.includes('tel') || label.includes('휴대') || label.includes('전화') || label.includes('연락')) {
    return 'phone'
  }
  // 이메일
  if (name.includes('email') || name.includes('mail') || label.includes('이메일')) {
    return 'email'
  }
  // 이름
  if (name.includes('name') || label.includes('이름') || label.includes('성명')) {
    return 'name'
  }
  return null
}

function getCustomerValueByKey(customer: Pick<Customer, 'name' | 'phone' | 'email' | 'resident_number'>, key: AutoFillKey): string {
  if (!key) return ''
  const residentRaw = customer.resident_number || '' // DB에 숫자만 13자리 저장

  switch (key) {
    case 'name':
      return customer.name || ''
    case 'phone': {
      const p = customer.phone || ''
      // 숫자만 저장된 경우 하이픈 포맷팅
      if (/^\d{10,11}$/.test(p)) {
        return p.length === 11
          ? `${p.slice(0, 3)}-${p.slice(3, 7)}-${p.slice(7)}`
          : `${p.slice(0, 3)}-${p.slice(3, 6)}-${p.slice(6)}`
      }
      return p
    }
    case 'email':
      return customer.email || ''
    case 'resident_front':
      // 주민번호 앞 6자리 (생년월일)
      return residentRaw.replace(/\D/g, '').slice(0, 6)
    case 'resident_back':
      // 주민번호 뒷 7자리
      return residentRaw.replace(/\D/g, '').slice(6, 13)
    case 'resident_full':
      // 전체 주민번호 (하이픈 포함)
      {
        const digits = residentRaw.replace(/\D/g, '')
        return digits.length === 13 ? `${digits.slice(0, 6)}-${digits.slice(6)}` : residentRaw
      }
    default:
      return ''
  }
}

function handleAutoFillFromCustomer() {
  const customer = customerStore.selectedCustomer
  if (autoFillFromCustomer.value && customer) {
    currentStepFields.value.forEach(field => {
      const key = matchAutoFillKey(field)
      if (key) {
        const val = getCustomerValueByKey(customer, key)
        if (val) claimStore.setFieldValue(field.form_field_id, val)
      }
    })
  } else {
    currentStepFields.value.forEach(field => {
      if (matchAutoFillKey(field)) {
        claimStore.setFieldValue(field.form_field_id, '')
      }
    })
  }
}

// ===== 자동채움: Step 4 (계약자와 동일) =====
// Step 3 필드에서 같은 AutoFillKey 값을 찾아 복사
function getStep3ValueByKey(key: AutoFillKey): string {
  if (!key) return ''
  const step3Fields = wizardDisplayFields.value.filter(f => getFieldWizardStep(f) === 3)
  const match = step3Fields.find(f => matchAutoFillKey(f) === key)
  if (!match) return ''
  return claimStore.fieldValues[match.form_field_id] || ''
}

function autoFillFieldsFromStep3(fields: FormField[], fill: boolean) {
  if (fill) {
    fields.forEach(field => {
      const key = matchAutoFillKey(field)
      if (key) {
        const val = getStep3ValueByKey(key)
        if (val) claimStore.setFieldValue(field.form_field_id, val)
      }
    })
  } else {
    fields.forEach(field => {
      if (matchAutoFillKey(field)) {
        claimStore.setFieldValue(field.form_field_id, '')
      }
    })
  }
}

function handleAutoFillInsured() {
  autoFillFieldsFromStep3(insuredStepFields.value, autoFillInsuredFromContractor.value)
}

function handleAutoFillBeneficiary() {
  autoFillFieldsFromStep3(beneficiaryStepFields.value, autoFillBeneficiaryFromContractor.value)
}

// ===== 자동채움: Step 4 일반 (접두어 없이 wizard_step=4인 경우) =====
function handleAutoFillStep4() {
  autoFillFieldsFromStep3(currentStepFields.value, autoFillInsuredFromContractor.value)
}

// ===== 서명 헬퍼 =====
function setSignatureCanvasRef(fieldId: number, el: unknown) {
  if (el) {
    signatureCanvasRefs.value[fieldId] = el as HTMLCanvasElement
    initSignatureCanvas(fieldId)
  }
}

function initSignatureCanvas(fieldId: number) {
  const canvas = signatureCanvasRefs.value[fieldId]
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

function getSignaturePos(canvas: HTMLCanvasElement, e: MouseEvent | TouchEvent) {
  const rect = canvas.getBoundingClientRect()
  if ('touches' in e) {
    const touch = e.touches[0]
    if (!touch) return { x: 0, y: 0 }
    return { x: touch.clientX - rect.left, y: touch.clientY - rect.top }
  }
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function startSignatureDraw(fieldId: number, e: MouseEvent | TouchEvent) {
  const canvas = signatureCanvasRefs.value[fieldId]
  if (!canvas) return
  isDrawing.value = true
  activeSignatureFieldId.value = fieldId
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const pos = getSignaturePos(canvas, e)
  ctx.beginPath()
  ctx.moveTo(pos.x, pos.y)
  e.preventDefault()
}

function drawSignature(e: MouseEvent | TouchEvent) {
  if (!isDrawing.value || activeSignatureFieldId.value === null) return
  const canvas = signatureCanvasRefs.value[activeSignatureFieldId.value]
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  const pos = getSignaturePos(canvas, e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
  e.preventDefault()
}

function endSignatureDraw() {
  isDrawing.value = false
  activeSignatureFieldId.value = null
}

function completeSignature(fieldId: number) {
  const canvas = signatureCanvasRefs.value[fieldId]
  if (!canvas) return
  const dataUrl = canvas.toDataURL('image/png')
  claimStore.setFieldValue(fieldId, dataUrl)
}

function resetSignature(fieldId: number) {
  claimStore.setFieldValue(fieldId, '')
  const canvas = signatureCanvasRefs.value[fieldId]
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

// ===== 포맷팅 =====
function formatFieldInput(fieldId: number, fieldType: string, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value

  switch (fieldType) {
    case 'phone':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3)
      } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
      }
      break
    case 'resident_number':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 6) {
        value = value.slice(0, 6) + '-' + value.slice(6, 13)
      }
      break
    case 'number':
      value = value.replace(/[^0-9]/g, '')
      break
  }

  claimStore.setFieldValue(fieldId, value)
}

// ===== 파일 관리 =====
function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 10MB를 초과합니다.`)
        continue
      }
      attachedFiles.value.push(file)
    }
    input.value = ''
  }
}

function removeFile(index: number) {
  attachedFiles.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

// ===== 제출 =====
async function handleSubmit() {
  if (!isFormValid.value) return

  submitting.value = true
  try {
    let claim
    if (isEditMode.value) {
      claim = await claimStore.updateClaim(claimId.value)
    } else {
      claim = await claimStore.createClaim(customerId.value)
    }
    if (claim) {
      // 첨부파일 업로드 (실패 시 사용자에게 알림)
      const failedFiles: string[] = []
      for (const file of attachedFiles.value) {
        const result = await claimStore.uploadDocument(claim.claim_id, file)
        if (!result) {
          failedFiles.push(file.name)
        }
      }
      if (failedFiles.length > 0) {
        alert(`다음 파일 업로드에 실패했습니다:\n${failedFiles.join('\n')}\n\n청구 상세에서 다시 첨부해주세요.`)
      }
      router.push(`/claims/${claim.claim_id}`)
    }
  } finally {
    submitting.value = false
  }
}

function goBack() {
  claimStore.resetClaimForm()
  router.push('/claims/new')
}

// ===== 초기화 =====
onMounted(async () => {
  loading.value = true
  try {
    // 고객 정보 로드 (대리 작성 시 필요)
    if (customerId.value) {
      await customerStore.loadCustomer(customerId.value)
    }

    if (isEditMode.value) {
      // 수정 모드: 기존 청구 상세 불러오기
      await claimStore.loadClaim(claimId.value)
      const claim = claimStore.selectedClaim
      if (claim?.claim_form) {
        await claimStore.fetchClaimFormDetail(claim.claim_form.claim_form_id)
        // 기존 필드 값 복원 - selectedClaim에서 field_values 가져오기
        // agentClaimStore의 selectedClaim은 AgentClaim 타입 (field_values 없음)
        // loadClaim으로 받아온 데이터에서 직접 복원 필요
        // 수정 모드에서는 별도의 claim detail API가 필요할 수 있음
        // 여기서는 claimStore.currentClaim이 있으면 거기서 복원
        const currentClaim = claimStore.currentClaim
        if (currentClaim?.field_values) {
          currentClaim.field_values.forEach((fv) => {
            if (fv.form_field_id) {
              claimStore.setFieldValue(fv.form_field_id, fv.field_value || '')
            }
          })
        }

        // 수정 모드: 카테고리별 consent 필드 상태 복원
        if (privacyConsentFields.value.length > 0 &&
          privacyConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.privacy = true
        }
        if (sensitiveConsentFields.value.length > 0 &&
          sensitiveConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.sensitive = true
        }
        // 레거시 필드만 있는 경우
        if (privacyConsentFields.value.length === 0 && sensitiveConsentFields.value.length === 0 &&
          legacyConsentFields.value.length > 0 &&
          legacyConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.privacy = true
          consentAgreed.value.sensitive = true
        }
      }
    } else {
      await claimStore.fetchClaimFormDetail(templateId.value)
    }

    // 첫 번째 활성 스텝으로 이동
    if (activeSteps.value.length > 0) {
      const firstStep = activeSteps.value[0]
      if (firstStep !== undefined) {
        currentStep.value = firstStep
      }
    }
  } finally {
    loading.value = false
  }
})
</script>
