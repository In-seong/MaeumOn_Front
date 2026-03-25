<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="isDraftMode ? '청구서 이어쓰기' : (isEditMode ? '청구서 수정' : (customerId ? '대리 청구서 작성' : '청구서 작성'))" :custom-back="true" @back="handleHeaderBack" />
      <main class="px-5 py-4 pb-8 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          <p class="ml-3 text-[13px] text-[#999]">{{ isEditMode ? '청구 정보를 불러오는 중...' : '양식 정보를 불러오는 중...' }}</p>
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
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="setFieldValueWithSync(field, $event)" @format-input="formatFieldInput" />
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
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="setFieldValueWithSync(field, $event)" @format-input="formatFieldInput" />
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
                      <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="setFieldValueWithSync(field, $event)" @format-input="formatFieldInput" />
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
                    <ClaimFieldInput v-else :field="field" :model-value="claimStore.fieldValues[field.form_field_id] || ''" @update:model-value="setFieldValueWithSync(field, $event)" @format-input="formatFieldInput" />
                  </template>
                </div>
              </CardSection>
            </div>

            <!-- ===== Step 2, 3, 5: 일반 필드 ===== -->
            <div v-else>
              <CardSection class="mb-4">
                <!-- 자동채움: Step 3 "고객 정보와 동일" (고객 선택 청구 시만 표시) -->
                <label
                  v-if="currentStep === 3 && customerId"
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
                      @update:model-value="setFieldValueWithSync(field, $event)"
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

              <div class="flex gap-2">
                <button
                  type="button"
                  @click="fileInput?.click()"
                  class="flex-1 border-2 border-dashed border-[#DDD] rounded-[12px] py-4 text-[14px] text-[#999] active:bg-[#F8F8F8] transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  사진/서류 선택
                </button>
                <button
                  type="button"
                  @click="cameraInput?.click()"
                  class="border-2 border-dashed border-[#DDD] rounded-[12px] py-4 px-5 text-[14px] text-[#999] active:bg-[#F8F8F8] transition-colors flex items-center justify-center gap-1.5"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
                  촬영
                </button>
              </div>
              <input
                ref="fileInput"
                type="file"
                accept="image/*,application/pdf"
                multiple
                @change="handleFileSelect"
                class="hidden"
              />
              <input
                ref="cameraInput"
                type="file"
                accept="image/*"
                capture="environment"
                @change="handleFileSelect"
                class="hidden"
              />
              <p class="text-[11px] text-[#B0B0B0] mt-1">JPG, PNG, PDF / 최대 20장, 파일당 20MB / 이미지 자동 압축</p>
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
                class="border border-[#E0E0E0] text-[#555] rounded-[12px] py-3.5 px-4 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              >이전</button>

              <!-- 임시저장 버튼: 신규 작성 또는 draft 모드에서만 표시 (pending 수정 모드에서는 숨김) -->
              <button
                v-if="showDraftButton"
                type="button"
                :disabled="savingDraft"
                @click="handleSaveDraft"
                class="border-[1.5px] border-[#FF7B22] text-[#FF7B22] bg-white rounded-[12px] py-3.5 px-4 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
              >{{ savingDraft ? '저장 중...' : '임시저장' }}</button>

              <button
                v-if="!isLastStep"
                type="button"
                @click="goNextStep"
                :disabled="!isCurrentStepValid"
                class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
              >{{ nextButtonText }}</button>

              <!-- 마지막 스텝: draft 모드 → "제출하기", 일반 → "청구서 생성/수정" -->
              <button
                v-if="isLastStep && isDraftMode"
                type="button"
                :disabled="!isFormValid || submitting"
                @click="handleSubmitDraft"
                class="flex-1 bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
              >
                {{ submitting ? '처리 중...' : '제출하기' }}
              </button>
              <button
                v-if="isLastStep && !isDraftMode"
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
import { ref, computed, watch, onMounted, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import { useCustomerStore } from '../../stores/customerStore'
import type { FormPage, FormField, Customer, InsuranceClaim } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import WizardStepBar from '@shared/components/claim/WizardStepBar.vue'
import ConsentOverlay from '@shared/components/claim/ConsentOverlay.vue'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'
import { compressImages } from '@shared/utils/compressImage'
import { consentApi } from '@shared/services/insuranceApi'
import type { ConsentTemplate } from '@shared/services/insuranceApi'

const router = useRouter()
const route = useRoute()
const claimStore = useAgentClaimStore()
const customerStore = useCustomerStore()

const isEditMode = computed(() => !!route.params.claimId)
const isDraftMode = computed(() => claimStore.currentClaim?.claim_status === 'draft')
const claimId = computed(() => Number(route.params.claimId))
const templateId = computed(() => Number(route.params.templateId || route.query.templateId))
const customerId = computed(() => (route.query.customerId as string) || '')
const submitting = ref(false)
const savingDraft = ref(false)
// 임시저장 버튼 표시 조건: 신규 작성 또는 draft 모드 (pending 수정 모드에서는 숨김)
const showDraftButton = computed(() => {
  if (isEditMode.value && !isDraftMode.value) return false
  return true
})
const loading = ref(false)
const attachedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const cameraInput = ref<HTMLInputElement | null>(null)

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

// ===== 동의서 (API에서 가져오기) =====
const consentTemplates = ref<ConsentTemplate[]>([])

interface ConsentItem {
  id: string
  title: string
  text: string
}

const CONSENT_ITEMS = computed<ConsentItem[]>(() =>
  consentTemplates.value.map(t => ({
    id: t.consent_type,
    title: t.title,
    text: t.content,
  }))
)

// 로컬 동의 상태 (폼 필드와 분리)
const consentAgreed = ref<Record<string, boolean>>({})

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

// 자동동의 필드 (CONSENT_AUTO) — UI에 표시하지 않고 자동으로 'agree' 처리
const autoConsentFields = computed(() =>
  templateConsentFields.value.filter(f => f.standard_field_code === 'CONSENT_AUTO')
)

// 카테고리별 consent 필드 분류 (standard_field_code 또는 field_name 기반)
const privacyConsentFields = computed(() =>
  templateConsentFields.value.filter(f =>
    f.standard_field_code === 'CONSENT_CREDIT' || f.field_name.startsWith('consent_privacy') || f.field_name.startsWith('consent_credit')
  )
)
const sensitiveConsentFields = computed(() =>
  templateConsentFields.value.filter(f =>
    f.standard_field_code === 'CONSENT_SENSITIVE' || f.standard_field_code === 'CONSENT_UNIQUE_ID' ||
    f.field_name.startsWith('consent_sensitive') || f.field_name.startsWith('consent_unique_id')
  )
)
// 기존 레거시 (카테고리 미지정) consent 필드
const legacyConsentFields = computed(() =>
  templateConsentFields.value.filter(f =>
    !f.standard_field_code?.startsWith('CONSENT_') &&
    !f.field_name.startsWith('consent_privacy') && !f.field_name.startsWith('consent_sensitive') &&
    !f.field_name.startsWith('consent_credit') && !f.field_name.startsWith('consent_unique_id')
  )
)

// consent 제외 + 같은 standard_field_code 중복 제거 (첫 번째만 표시)
const wizardDisplayFields = computed(() => {
  const seen = new Set<string>()
  return allFieldsSorted.value.filter(f => {
    if (f.field_type === 'consent') return false
    if (f.standard_field_code) {
      if (seen.has(f.standard_field_code)) return false
      seen.add(f.standard_field_code)
    }
    return true
  })
})

// 표준 필드 값 동기화: 같은 standard_field_code를 가진 모든 필드에 동일 값 세팅
function setFieldValueWithSync(field: FormField, value: string) {
  claimStore.setFieldValue(field.form_field_id, value)
  // 서명은 각 위치마다 다를 수 있으므로 동기화하지 않음
  if (field.standard_field_code && field.field_type !== 'signature') {
    for (const f of allFieldsSorted.value) {
      if (f.form_field_id !== field.form_field_id && f.standard_field_code === field.standard_field_code) {
        claimStore.setFieldValue(f.form_field_id, value)
      }
    }
  }
}

// 모든 표준 필드 중복값 동기화 (자동채움 후 호출)
function syncDuplicateStandardFields() {
  const codeToValue = new Map<string, string>()
  // 값이 있는 첫 번째 필드를 기준으로
  for (const f of allFieldsSorted.value) {
    if (f.standard_field_code && f.field_type !== 'signature' && !codeToValue.has(f.standard_field_code)) {
      const val = claimStore.fieldValues[f.form_field_id]
      if (val) codeToValue.set(f.standard_field_code, val)
    }
  }
  // 나머지 동일 코드 필드에 동기화
  for (const f of allFieldsSorted.value) {
    if (f.standard_field_code && f.field_type !== 'signature' && codeToValue.has(f.standard_field_code)) {
      const val = codeToValue.get(f.standard_field_code)!
      claimStore.setFieldValue(f.form_field_id, val)
    }
  }
}

// ===== 필드 -> 위저드 스텝 매핑 =====
function getFieldWizardStep(field: FormField): number {
  // 서명 필드는 DB에 저장된 wizard_step 무시하고 항상 마지막 스텝
  if (field.field_type === 'signature') return 5
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
  CONSENT_ITEMS.value.length > 0 && CONSENT_ITEMS.value.every(item => consentAgreed.value[item.id])
)

// 동의 상태 변경 시 -> 카테고리별로 consent 필드 동기화
watch(consentAgreed, (agreed) => {
  // credit(개인신용정보) → consent_privacy 필드
  const privacyValue = agreed.credit ? 'agree' : ''
  privacyConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, privacyValue)
  })

  // sensitive(민감정보) + unique_id(고유식별정보) → consent_sensitive 필드
  const sensitiveValue = (agreed.sensitive && agreed.unique_id) ? 'agree' : ''
  sensitiveConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, sensitiveValue)
  })

  // 레거시 consent 필드 → 전체 동의 시
  const allAgreed = agreed.credit && agreed.sensitive && agreed.unique_id
  const legacyValue = allAgreed ? 'agree' : ''
  legacyConsentFields.value.forEach(f => {
    claimStore.setFieldValue(f.form_field_id, legacyValue)
  })
}, { deep: true })

function toggleAllConsents() {
  const newValue = !allConsentsAgreed.value
  CONSENT_ITEMS.value.forEach(item => {
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

  // 주민번호 관련: field_name에 jumin, resident, rrn 포함 (생년월일이 아닌 것)
  if (name.includes('jumin') || name.includes('rrn') || (name.includes('resident') && !name.includes('birth'))) {
    // label로 뒷자리 판별
    if (label.includes('뒷') || label.includes('후')) return 'resident_back'
    // field_type으로 분리 입력 판별
    if (type === 'resident_number_back') return 'resident_back'
    if (type === 'resident_number_front') return 'resident_front'
    // field_type이 resident_number면 전체 주민번호
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
  // 자동채움 후 중복 표준필드 동기화
  syncDuplicateStandardFields()
}

// ===== 자동채움: Step 4 (계약자와 동일) =====
// Step 3 필드에서 같은 AutoFillKey 값을 찾아 복사, 없으면 고객 정보 fallback
function getStep3ValueByKey(key: AutoFillKey): string {
  if (!key) return ''
  const step3Fields = wizardDisplayFields.value.filter(f => getFieldWizardStep(f) === 3)
  const match = step3Fields.find(f => matchAutoFillKey(f) === key)
  if (match) {
    const val = claimStore.fieldValues[match.form_field_id] || ''
    if (val) return val
  }
  // Step 3에 없으면 고객 정보에서 fallback
  const customer = customerStore.selectedCustomer
  if (customer) {
    return getCustomerValueByKey(customer, key)
  }
  return ''
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
  // 자동채움 후 중복 표준필드 동기화
  syncDuplicateStandardFields()
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
    nextTick(() => {
      setTimeout(() => initSignatureCanvas(fieldId), 50)
    })
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

  // 같은 standard_field_code 서명 필드에도 동기화
  const thisField = allFieldsSorted.value.find(f => f.form_field_id === fieldId)
  if (thisField?.standard_field_code) {
    for (const f of allFieldsSorted.value) {
      if (f.form_field_id !== fieldId && f.standard_field_code === thisField.standard_field_code) {
        claimStore.setFieldValue(f.form_field_id, dataUrl)
      }
    }
  }
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
    case 'resident_number_front':
      value = value.replace(/[^0-9]/g, '').slice(0, 6)
      break
    case 'resident_number_back':
      value = value.replace(/[^0-9]/g, '').slice(0, 7)
      break
    case 'number':
      value = value.replace(/[^0-9]/g, '')
      break
  }

  const matchedField = allFieldsSorted.value.find(f => f.form_field_id === fieldId)
  if (matchedField) {
    setFieldValueWithSync(matchedField, value)
  } else {
    claimStore.setFieldValue(fieldId, value)
  }
}

// ===== 파일 관리 =====
const MAX_FILE_COUNT = 20
const MAX_FILE_SIZE_MB = 20

async function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)

    // 장수 제한
    if (attachedFiles.value.length + files.length > MAX_FILE_COUNT) {
      alert(`첨부파일은 최대 ${MAX_FILE_COUNT}장까지 가능합니다.`)
      input.value = ''
      return
    }

    // 개별 파일 크기 제한
    const oversized = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
    if (oversized) {
      alert(`파일당 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다.`)
      input.value = ''
      return
    }

    const compressed = await compressImages(files)
    for (const file of compressed) {
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

// ===== 임시저장 =====
async function handleSaveDraft() {
  savingDraft.value = true
  try {
    if (isDraftMode.value && claimStore.currentClaim) {
      // 기존 draft 갱신
      const result = await claimStore.updateDraftClaim(claimStore.currentClaim.claim_id)
      if (result) {
        alert('임시저장되었습니다.')
      }
    } else {
      // 새 draft 생성
      const draft = await claimStore.saveDraftClaim(customerId.value || undefined)
      if (draft) {
        alert('임시저장되었습니다.')
        router.replace(`/claims/${draft.claim_id}/edit?templateId=${draft.claim_form_id}`)
      }
    }
  } finally {
    savingDraft.value = false
  }
}

// ===== Draft 제출 (draft → pending) =====
async function handleSubmitDraft() {
  if (!isFormValid.value || !claimStore.currentClaim) return

  submitting.value = true
  try {
    const result = await claimStore.submitDraftClaim(
      claimStore.currentClaim.claim_id,
      customerId.value || undefined,
    )
    if (result) {
      // 첨부파일 업로드
      const failedFiles: string[] = []
      for (const file of attachedFiles.value) {
        const doc = await claimStore.uploadDocument(result.claim_id, file)
        if (!doc) failedFiles.push(file.name)
      }
      if (failedFiles.length > 0) {
        alert(`다음 파일 업로드에 실패했습니다:\n${failedFiles.join('\n')}\n\n청구 상세에서 다시 첨부해주세요.`)
      }
      router.push(`/claims/${result.claim_id}`)
    }
  } finally {
    submitting.value = false
  }
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
      claim = await claimStore.createClaim(customerId.value || undefined)
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

function handleHeaderBack() {
  if (!isFirstStep.value) {
    goPrevStep()
  } else {
    router.back()
  }
}

// ===== 초기화 =====
onMounted(async () => {
  loading.value = true
  try {
    // 동의서 템플릿 로드
    try {
      const res = await consentApi.getAll()
      consentTemplates.value = res.data.data
      // 동의 상태 초기화
      consentTemplates.value.forEach(t => {
        consentAgreed.value[t.consent_type] = false
      })
    } catch { /* 동의서 로드 실패 시 빈 배열 유지 */ }

    // 고객 정보 로드 (대리 작성 시 필요)
    if (customerId.value) {
      await customerStore.loadCustomer(customerId.value)
    }

    if (isEditMode.value) {
      // 수정/draft 모드: 기존 청구 상세 불러오기
      await claimStore.loadClaim(claimId.value)
      const claim = claimStore.selectedClaim
      if (claim) {
        // draft 모드에서 currentClaim 설정 (isDraftMode computed 활성화)
        claimStore.currentClaim = claim as unknown as InsuranceClaim

        const formId = claim.claim_form?.claim_form_id || templateId.value
        if (formId) {
          await claimStore.fetchClaimFormDetail(formId)
        }

        // 필드 값 복원 (selectedClaim.field_values 또는 currentClaim.field_values)
        const fieldVals = (claim as unknown as { field_values?: Array<{ form_field_id: number; field_value: string }> }).field_values
        if (fieldVals) {
          fieldVals.forEach((fv) => {
            if (fv.form_field_id) {
              claimStore.setFieldValue(fv.form_field_id, fv.field_value || '')
            }
          })
        }

        // 카테고리별 consent 필드 상태 복원
        if (privacyConsentFields.value.length > 0 &&
          privacyConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.credit = true
        }
        if (sensitiveConsentFields.value.length > 0 &&
          sensitiveConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.sensitive = true
          consentAgreed.value.unique_id = true
        }
        // 레거시 필드만 있는 경우
        if (privacyConsentFields.value.length === 0 && sensitiveConsentFields.value.length === 0 &&
          legacyConsentFields.value.length > 0 &&
          legacyConsentFields.value.every(f => claimStore.fieldValues[f.form_field_id] === 'agree')) {
          consentAgreed.value.credit = true
          consentAgreed.value.sensitive = true
          consentAgreed.value.unique_id = true
        }
      }
    } else {
      await claimStore.fetchClaimFormDetail(templateId.value)
    }

    // CONSENT_AUTO 필드 자동 동의 처리
    autoConsentFields.value.forEach(f => {
      claimStore.setFieldValue(f.form_field_id, 'agree')
    })

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
