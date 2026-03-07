<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="isDraftMode ? '다중 청구 이어쓰기' : '다중 보험 청구'" :custom-back="true" @back="handleHeaderBack" />

      <main class="px-5 py-4 pb-28 overflow-y-auto" style="height: calc(100vh - 56px);">

        <!-- 로딩 -->
        <div v-if="batchStore.loading && !initialLoaded" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          <p class="ml-3 text-[13px] text-[#999]">불러오는 중...</p>
        </div>

        <template v-else>
          <!-- ===== 스텝 표시 바 ===== -->
          <div class="flex items-center gap-2 mb-5">
            <button
              v-for="s in STEPS"
              :key="s.step"
              type="button"
              class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
              :class="
                currentStep === s.step
                  ? 'bg-[#FF7B22] text-white'
                  : currentStep > s.step
                    ? 'bg-[#FFF0E5] text-[#FF7B22]'
                    : 'bg-[#F0F0F0] text-[#999]'
              "
              @click="currentStep > s.step ? (currentStep = s.step) : undefined"
            >
              <span class="w-5 h-5 rounded-full flex items-center justify-center text-[11px]"
                :class="currentStep > s.step ? 'bg-[#FF7B22] text-white' : ''"
              >
                <template v-if="currentStep > s.step">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                    <path d="M5 12l5 5L20 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </template>
                <template v-else>{{ s.step }}</template>
              </span>
              {{ s.label }}
            </button>
          </div>

          <!-- ===== Step 1: 고객 선택 ===== -->
          <div v-if="currentStep === 1">
            <p class="text-[16px] font-bold text-[#222] mb-4">고객을 선택하세요</p>

            <!-- 선택된 고객 표시 -->
            <div v-if="batchStore.selectedCustomer" class="rounded-[16px] bg-[#FFF0E5] border-[1.5px] border-[#FF7B22] p-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#FF7B22] text-white flex items-center justify-center text-[15px] font-bold shrink-0">
                  {{ batchStore.selectedCustomer.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[15px] font-semibold text-[#222]">{{ batchStore.selectedCustomer.name }}</p>
                  <p class="text-[12px] text-[#888]">{{ batchStore.selectedCustomer.phone }}</p>
                </div>
                <button type="button" @click="clearCustomer" class="text-[12px] text-[#FF7B22] font-medium">변경</button>
              </div>
            </div>

            <!-- 고객 검색 -->
            <template v-if="!batchStore.selectedCustomer">
              <div class="relative mb-3">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle cx="11" cy="11" r="7" stroke="#AAAAAA" stroke-width="2"/>
                    <path d="M16 16L20 20" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <input
                  v-model="customerSearch"
                  type="text"
                  placeholder="고객명 또는 연락처 검색"
                  class="w-full bg-white rounded-[12px] pl-10 pr-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] shadow-[0_0_6px_rgba(0,0,0,0.05)]"
                  @input="handleCustomerSearch"
                />
              </div>

              <!-- 로딩 -->
              <div v-if="batchStore.loadingCustomers" class="flex items-center justify-center py-6">
                <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
              </div>

              <!-- 고객 리스트 -->
              <div v-else-if="batchStore.customerSearchResults.length > 0" class="flex flex-col gap-2 max-h-[320px] overflow-y-auto rounded-[12px]">
                <button
                  v-for="customer in batchStore.customerSearchResults"
                  :key="customer.customer_id"
                  type="button"
                  class="flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all active:scale-[0.98] bg-white border-[1.5px] border-transparent shadow-[0_0_6px_rgba(0,0,0,0.04)]"
                  @click="handleSelectCustomer(customer)"
                >
                  <div class="w-9 h-9 rounded-full bg-[#F0F0F0] text-[#999] flex items-center justify-center shrink-0 text-[13px] font-bold">
                    {{ customer.name.charAt(0) }}
                  </div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[14px] font-semibold text-[#222] truncate">{{ customer.name }}</p>
                    <p class="text-[12px] text-[#999] truncate">{{ customer.phone }}</p>
                  </div>
                </button>
              </div>

              <!-- 빈 상태 -->
              <div v-else class="flex flex-col items-center justify-center py-10">
                <div class="w-[48px] h-[48px] rounded-full bg-[#F5F5F5] flex items-center justify-center mb-2">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#CCCCCC" stroke-width="2"/>
                  </svg>
                </div>
                <p class="text-[13px] text-[#AAAAAA]">
                  {{ customerSearch ? '검색 결과가 없습니다' : '고객명으로 검색해주세요' }}
                </p>
              </div>
            </template>
          </div>

          <!-- ===== Step 2: 보험사 & 양식 선택 ===== -->
          <div v-else-if="currentStep === 2">
            <p class="text-[16px] font-bold text-[#222] mb-1">보험사를 선택하세요</p>
            <p class="text-[12px] text-[#999] mb-4">최대 5개 보험사까지 선택 가능합니다</p>

            <!-- 보험사 로딩 -->
            <div v-if="batchStore.loadingCompanies" class="flex items-center justify-center py-10">
              <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
            </div>

            <template v-else>
              <!-- 보험사 목록 (체크박스) -->
              <div class="flex flex-col gap-2 mb-4">
                <button
                  v-for="company in batchStore.insuranceCompanies"
                  :key="company.company_id"
                  type="button"
                  class="w-full text-left rounded-[12px] px-4 py-3 transition-all active:scale-[0.98]"
                  :class="
                    batchStore.isCompanySelected(company.company_id)
                      ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                      : 'bg-white border-[1.5px] border-transparent shadow-[0_0_6px_rgba(0,0,0,0.04)]'
                  "
                  @click="batchStore.toggleCompany(company)"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-5 h-5 rounded border-[1.5px] flex items-center justify-center shrink-0 transition-all"
                      :class="batchStore.isCompanySelected(company.company_id)
                        ? 'bg-[#FF7B22] border-[#FF7B22]'
                        : 'bg-white border-[#CCCCCC]'
                      "
                    >
                      <svg v-if="batchStore.isCompanySelected(company.company_id)" width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M5 12l5 5L20 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <span class="text-[14px] font-semibold text-[#222]">{{ company.company_name }}</span>
                  </div>

                  <!-- 양식 선택 (체크된 보험사만) -->
                  <div v-if="batchStore.isCompanySelected(company.company_id)" class="mt-3 ml-8">
                    <div v-if="getEntryForCompany(company.company_id)?.loadingForm" class="flex items-center gap-2 py-1">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF7B22]"></div>
                      <span class="text-[12px] text-[#999]">양식 로딩 중...</span>
                    </div>
                    <template v-else>
                      <div v-if="getEntryForCompany(company.company_id)?.availableForms.length === 1" class="text-[12px] text-[#FF7B22] font-medium">
                        양식: {{ getEntryForCompany(company.company_id)?.claimForm?.form_name }}
                      </div>
                      <select
                        v-else-if="(getEntryForCompany(company.company_id)?.availableForms.length ?? 0) > 1"
                        class="w-full text-[13px] border border-[#E8E8E8] rounded-[8px] px-3 py-2 outline-none focus:border-[#FF7B22] bg-white"
                        :value="getEntryForCompany(company.company_id)?.claimForm?.claim_form_id ?? ''"
                        @change="handleFormSelect(company.company_id, Number(($event.target as HTMLSelectElement).value))"
                      >
                        <option value="" disabled>양식을 선택하세요</option>
                        <option
                          v-for="form in getEntryForCompany(company.company_id)?.availableForms"
                          :key="form.claim_form_id"
                          :value="form.claim_form_id"
                        >{{ form.form_name }}</option>
                      </select>
                      <div v-else class="text-[12px] text-[#999]">등록된 양식이 없습니다</div>
                    </template>
                  </div>
                </button>
              </div>

              <!-- 선택 요약 -->
              <div v-if="batchStore.selectedEntries.length > 0" class="rounded-[12px] bg-[#F8F8F8] px-4 py-3 text-[13px] text-[#666]">
                선택: {{ batchStore.selectedEntries.length }}개 보험사,
                {{ batchStore.selectedEntries.filter(e => e.claimForm).length }}개 양식
              </div>
            </template>
          </div>

          <!-- ===== Step 3: 양식별 필드 입력 (탭 전환) ===== -->
          <div v-else-if="currentStep === 3">
            <!-- 보험사 탭 -->
            <div class="flex gap-1 mb-4 overflow-x-auto -mx-1 px-1 pb-1">
              <button
                v-for="(entry, idx) in batchStore.selectedEntries"
                :key="entry.company.company_id"
                type="button"
                class="shrink-0 px-3 py-2 rounded-[10px] text-[12px] font-semibold transition-all whitespace-nowrap"
                :class="
                  batchStore.activeTabIndex === idx
                    ? 'bg-[#FF7B22] text-white'
                    : 'bg-white text-[#666] border border-[#E8E8E8]'
                "
                @click="batchStore.activeTabIndex = idx"
              >
                {{ entry.company.company_name }}
                <template v-if="entry.claimForm">
                  <span v-if="getFilledCount(idx) === getTotalFieldCount(idx) && getTotalFieldCount(idx) > 0" class="ml-1">✅</span>
                  <span v-else-if="getFilledCount(idx) > 0" class="ml-1 opacity-70">🔄 {{ getFilledCount(idx) }}/{{ getTotalFieldCount(idx) }}</span>
                  <span v-else class="ml-1 opacity-50">⏳ 0/{{ getTotalFieldCount(idx) }}</span>
                </template>
              </button>
            </div>

            <!-- 자동 복사 안내 (첫 번째 탭이 아닐 때) -->
            <div v-if="batchStore.activeTabIndex > 0 && hasAutoFilledFields" class="mb-3 px-3 py-2 rounded-[10px] bg-[#EFF6FF] text-[12px] text-[#3B82F6] flex items-center gap-1.5">
              <span>🔗</span>
              <span>{{ batchStore.selectedEntries[0]?.company.company_name }}에서 입력한 공통 값이 자동으로 채워졌습니다.</span>
            </div>

            <!-- 현재 탭의 양식 정보 -->
            <template v-if="currentEntry?.claimForm">
              <div class="rounded-[12px] bg-white border border-[#E8E8E8] p-4 mb-4">
                <p class="text-[13px] text-[#888]">{{ currentEntry.company.company_name }}</p>
                <p class="text-[16px] font-bold text-[#222] mt-0.5">{{ currentEntry.claimForm.form_name }}</p>
              </div>

              <!-- 위저드 스텝 바 (단건과 동일한 5스텝) -->
              <div class="mb-4">
                <WizardStepBar
                  :current-step="innerStep"
                  :active-steps="activeInnerSteps"
                  :step-labels="INNER_STEP_LABELS"
                />
              </div>

              <p class="text-[15px] font-bold text-[#222] mb-4 px-1">
                {{ INNER_STEP_TITLES[innerStep] || '' }}
              </p>

              <!-- 필드 렌더링 -->
              <CardSection class="mb-4">
                <!-- Step 1: 약관 동의 -->
                <template v-if="innerStep === 1">
                  <div class="flex flex-col items-center justify-center py-6 text-center">
                    <div class="w-12 h-12 rounded-full bg-[#FFF0E5] flex items-center justify-center mb-3">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                        <path d="M9 11l3 3L22 4" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                        <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </div>
                    <p class="text-[14px] text-[#666]">약관 동의는 최종 제출 시 일괄 처리됩니다</p>
                    <p class="text-[12px] text-[#999] mt-1">다음 단계로 이동하여 필드를 입력해주세요</p>
                  </div>
                </template>

                <!-- Step 2~5: 일반 필드 -->
                <template v-else>
                  <div v-if="currentInnerStepFields.length === 0" class="py-6 text-center">
                    <p class="text-[13px] text-[#999]">이 단계에 해당하는 필드가 없습니다</p>
                  </div>
                  <div v-else class="flex flex-col gap-4">
                    <template v-for="field in currentInnerStepFields" :key="field.form_field_id">
                      <div class="relative">
                        <!-- 자동 채움 표시 배경 -->
                        <div
                          v-if="batchStore.isFieldAutoFilled(batchStore.activeTabIndex, field.form_field_id)"
                          class="absolute -left-2 -right-2 -top-1 -bottom-1 rounded-[10px] bg-[#EFF6FF]/50 pointer-events-none"
                        ></div>
                        <div class="relative">
                          <!-- 자동 채움 뱃지 -->
                          <div
                            v-if="batchStore.isFieldAutoFilled(batchStore.activeTabIndex, field.form_field_id)"
                            class="flex items-center gap-1 mb-1"
                          >
                            <span class="text-[11px] text-[#3B82F6]">🔗 자동 입력</span>
                          </div>
                          <ClaimFieldInput
                            :field="field"
                            :model-value="currentEntry.fieldValues[field.form_field_id] || ''"
                            @update:model-value="batchStore.setActiveFieldValue(field.form_field_id, $event)"
                            @format-input="formatFieldInput"
                          />
                        </div>
                      </div>
                    </template>
                  </div>
                </template>
              </CardSection>

              <!-- 내부 스텝 네비게이션 -->
              <div class="flex gap-3">
                <button
                  v-if="innerStep > 1"
                  type="button"
                  class="flex-1 py-3 rounded-[12px] border border-[#E8E8E8] text-[14px] font-semibold text-[#666] bg-white active:scale-[0.98] transition-transform"
                  @click="innerStep--"
                >이전</button>
                <button
                  v-if="innerStep < maxInnerStep"
                  type="button"
                  class="flex-1 py-3 rounded-[12px] bg-[#FF7B22] text-white text-[14px] font-semibold shadow-[0_4px_16px_rgba(255,123,34,0.3)] active:scale-[0.98] transition-transform"
                  @click="innerStep++"
                >다음</button>
              </div>
            </template>

            <!-- 양식이 로드되지 않은 경우 -->
            <div v-else class="flex items-center justify-center py-10">
              <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
              <p class="ml-2 text-[13px] text-[#999]">양식 로딩 중...</p>
            </div>
          </div>

          <!-- ===== Step 4: 첨부파일 ===== -->
          <div v-else-if="currentStep === 4">
            <p class="text-[16px] font-bold text-[#222] mb-4">서류 첨부</p>

            <!-- 공통 서류 -->
            <div class="rounded-[16px] bg-white border border-[#E8E8E8] p-4 mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-1">공통 서류</p>
              <p class="text-[12px] text-[#999] mb-3">전체 보험사에 동일하게 첨부됩니다</p>

              <div v-if="batchStore.commonDocuments.length > 0" class="flex flex-col gap-2 mb-3">
                <div
                  v-for="doc in batchStore.commonDocuments"
                  :key="doc.id"
                  class="flex items-center gap-3 px-3 py-2.5 rounded-[10px] bg-[#F8F8F8]"
                >
                  <span class="text-[16px]">📄</span>
                  <div class="flex-1 min-w-0">
                    <p class="text-[13px] text-[#333] truncate">{{ doc.name }}</p>
                    <p class="text-[11px] text-[#999]">{{ formatFileSize(doc.size) }}</p>
                  </div>
                  <button type="button" @click="batchStore.removeCommonDocument(doc.id)" class="text-[12px] text-[#FF4444] font-medium shrink-0">삭제</button>
                </div>
              </div>

              <div class="flex gap-2">
                <label class="flex-1 flex items-center justify-center gap-1.5 py-3 rounded-[10px] border border-dashed border-[#CCCCCC] text-[13px] text-[#888] cursor-pointer hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                  서류 선택
                  <input type="file" class="hidden" multiple accept="image/*,.pdf,.doc,.docx" @change="handleCommonFileSelect" />
                </label>
                <label class="flex items-center justify-center gap-1.5 py-3 px-4 rounded-[10px] border border-dashed border-[#CCCCCC] text-[13px] text-[#888] cursor-pointer hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
                  촬영
                  <input type="file" class="hidden" accept="image/*" capture="environment" @change="handleCommonFileSelect" />
                </label>
              </div>
            </div>

            <!-- 개별 서류 -->
            <div class="rounded-[16px] bg-white border border-[#E8E8E8] p-4">
              <p class="text-[14px] font-semibold text-[#222] mb-1">개별 서류</p>
              <p class="text-[12px] text-[#999] mb-3">특정 보험사에만 첨부할 서류입니다</p>

              <div class="flex flex-col gap-3">
                <div v-for="(entry, idx) in batchStore.selectedEntries" :key="entry.company.company_id" class="rounded-[10px] bg-[#F8F8F8] p-3">
                  <p class="text-[13px] font-semibold text-[#333] mb-2">{{ entry.company.company_name }}</p>

                  <div v-if="getPerClaimDocs(idx).length > 0" class="flex flex-col gap-1.5 mb-2">
                    <div
                      v-for="doc in getPerClaimDocs(idx)"
                      :key="doc.id"
                      class="flex items-center gap-2 px-2 py-1.5 rounded-[8px] bg-white"
                    >
                      <span class="text-[14px]">📄</span>
                      <span class="flex-1 text-[12px] text-[#333] truncate">{{ doc.name }}</span>
                      <button type="button" @click="batchStore.removePerClaimDocument(idx, doc.id)" class="text-[11px] text-[#FF4444]">삭제</button>
                    </div>
                  </div>

                  <div class="flex gap-1.5">
                    <label class="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-[8px] border border-dashed border-[#CCCCCC] text-[12px] text-[#888] cursor-pointer hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M21 19V5a2 2 0 00-2-2H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2z" stroke="currentColor" stroke-width="1.5"/><circle cx="8.5" cy="8.5" r="1.5" stroke="currentColor" stroke-width="1.5"/><path d="M21 15l-5-5L5 21" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
                      선택
                      <input type="file" class="hidden" multiple accept="image/*,.pdf,.doc,.docx" @change="(e) => handlePerClaimFileSelect(e, idx)" />
                    </label>
                    <label class="flex items-center justify-center gap-1.5 py-2 px-3 rounded-[8px] border border-dashed border-[#CCCCCC] text-[12px] text-[#888] cursor-pointer hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" stroke="currentColor" stroke-width="1.5"/><circle cx="12" cy="13" r="4" stroke="currentColor" stroke-width="1.5"/></svg>
                      촬영
                      <input type="file" class="hidden" accept="image/*" capture="environment" @change="(e) => handlePerClaimFileSelect(e, idx)" />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== Step 5: 최종 확인 ===== -->
          <div v-else-if="currentStep === 5">
            <p class="text-[16px] font-bold text-[#222] mb-4">최종 확인</p>

            <!-- 고객 정보 -->
            <div class="rounded-[12px] bg-[#F8F8F8] px-4 py-3 mb-4 text-[13px] text-[#666]">
              <div class="flex items-center gap-2">
                <span class="font-semibold text-[#333]">고객:</span>
                <span>{{ batchStore.selectedCustomer?.name }}</span>
              </div>
              <div class="flex items-center gap-2 mt-1">
                <span class="font-semibold text-[#333]">청구 건수:</span>
                <span>{{ batchStore.selectedEntries.length }}건</span>
              </div>
              <div v-if="batchStore.commonDocuments.length > 0" class="flex items-center gap-2 mt-1">
                <span class="font-semibold text-[#333]">공통 서류:</span>
                <span>{{ batchStore.commonDocuments.length }}건</span>
              </div>
            </div>

            <!-- 보험사별 요약 -->
            <div class="flex flex-col gap-3">
              <div
                v-for="(entry, idx) in batchStore.selectedEntries"
                :key="entry.company.company_id"
                class="rounded-[16px] bg-white border border-[#E8E8E8] p-4"
              >
                <div class="flex items-center gap-2 mb-2">
                  <span class="text-[14px] font-bold text-[#222]">{{ idx + 1 }}. {{ entry.company.company_name }}</span>
                  <span v-if="entry.claimForm" class="text-[12px] text-[#888]">- {{ entry.claimForm.form_name }}</span>
                </div>

                <!-- 입력 완료율 -->
                <div class="flex items-center gap-2 mb-1.5">
                  <span class="text-[13px]">
                    필드 {{ getFilledCount(idx) }}/{{ getTotalFieldCount(idx) }}
                  </span>
                  <span v-if="getFilledCount(idx) === getTotalFieldCount(idx) && getTotalFieldCount(idx) > 0"
                    class="text-[12px] text-green-600 font-medium">✅ 입력 완료</span>
                  <span v-else-if="getRequiredUnfilledCount(idx) > 0"
                    class="text-[12px] text-[#FF4444] font-medium">⚠️ 필수 미입력 {{ getRequiredUnfilledCount(idx) }}건</span>
                </div>

                <!-- 미입력 필수 필드 경고 시 바로가기 -->
                <button
                  v-if="getRequiredUnfilledCount(idx) > 0"
                  type="button"
                  class="text-[12px] text-[#FF7B22] font-medium"
                  @click="goToEntryInput(idx)"
                >→ 입력하러 가기</button>

                <!-- 서류 요약 -->
                <div class="text-[12px] text-[#888] mt-1.5">
                  서류: 공통 {{ batchStore.commonDocuments.length }}건
                  <template v-if="getPerClaimDocs(idx).length > 0"> + 개별 {{ getPerClaimDocs(idx).length }}건</template>
                </div>
              </div>
            </div>

            <!-- 경고 메시지 -->
            <div v-if="totalRequiredUnfilled > 0" class="mt-4 p-3 rounded-[10px] bg-[#FFF3CD] text-[13px] text-[#856404]">
              ⚠️ 미입력 필수 필드가 {{ totalRequiredUnfilled }}건 있습니다. 모두 입력해야 제출할 수 있습니다.
            </div>
          </div>

          <!-- 에러 -->
          <div v-if="batchStore.error" class="p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000] mb-4 mt-4">
            {{ batchStore.error }}
          </div>
        </template>
      </main>

      <!-- 하단 버튼 영역 -->
      <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <div class="flex gap-3">
          <!-- 임시저장 (Step 2~4에서 표시) -->
          <button
            v-if="currentStep >= 2 && currentStep <= 4"
            type="button"
            :disabled="batchStore.loading"
            class="py-3.5 px-5 rounded-[12px] text-[14px] font-semibold border-[1.5px] border-[#FF7B22] text-[#FF7B22] bg-white active:scale-[0.98] transition-all"
            @click="handleSaveDraft"
          >
            {{ batchStore.loading ? '저장 중...' : '임시저장' }}
          </button>

          <!-- 메인 버튼 -->
          <button
            type="button"
            :disabled="!canProceedMain"
            class="flex-1 py-3.5 rounded-[12px] text-[15px] font-semibold transition-all active:scale-[0.98]"
            :class="
              canProceedMain
                ? 'bg-[#FF7B22] text-white shadow-[0_4px_16px_rgba(255,123,34,0.3)]'
                : 'bg-[#E0E0E0] text-[#AAAAAA] cursor-not-allowed'
            "
            @click="handleMainAction"
          >
            {{ mainButtonLabel }}
          </button>
        </div>
      </div>
      <!-- Toast -->
      <Transition name="fade">
        <div
          v-if="toast.visible.value"
          class="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap"
          :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'"
        >
          {{ toast.message.value }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import WizardStepBar from '@shared/components/claim/WizardStepBar.vue'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import type { Customer } from '../../types'
import type { FormField, FormPage } from '@shared/types'
import { useToast } from '../../composables/useToast'

const toast = useToast()

const router = useRouter()
const route = useRoute()
const batchStore = useAgentBatchClaimStore()

// ===== 상수 =====
const STEPS = [
  { step: 1, label: '고객' },
  { step: 2, label: '보험사' },
  { step: 3, label: '입력' },
  { step: 4, label: '서류' },
  { step: 5, label: '확인' },
] as const

const INNER_STEP_LABELS = ['약관', '청구', '계약자', '피보험자', '계좌']
const INNER_STEP_TITLES: Record<number, string> = {
  1: '약관 동의',
  2: '청구 내용',
  3: '계약자 정보',
  4: '피보험자 정보',
  5: '계좌 정보',
}

// ===== 상태 =====
const currentStep = ref(1)
const innerStep = ref(1)
const customerSearch = ref('')
const initialLoaded = ref(false)
let searchTimeout: ReturnType<typeof setTimeout> | null = null

// draft 편집 모드
const batchId = computed(() => {
  const id = route.params.batchId
  return id ? Number(id) : null
})
const isDraftMode = ref(false)

// ===== Computed =====
const currentEntry = computed(() => batchStore.activeEntry)

const activeInnerSteps = computed(() => {
  if (!currentEntry.value?.claimForm) return [1]
  const fields = getAllFieldsForEntry(currentEntry.value)
  const steps = new Set<number>()
  steps.add(1) // 약관은 항상 표시
  for (const f of fields) {
    const step = getFieldWizardStep(f)
    steps.add(step)
  }
  return Array.from(steps).sort((a, b) => a - b)
})

const maxInnerStep = computed(() => {
  const steps = activeInnerSteps.value
  const last = steps[steps.length - 1]
  return last ?? 5
})

const currentInnerStepFields = computed(() => {
  if (!currentEntry.value?.claimForm) return []
  const fields = getAllFieldsForEntry(currentEntry.value)
  return fields.filter((f) => getFieldWizardStep(f) === innerStep.value)
})

const canProceedMain = computed(() => {
  if (batchStore.loading) return false
  if (currentStep.value === 1) return !!batchStore.selectedCustomer
  if (currentStep.value === 2) return batchStore.allFormsLoaded && batchStore.selectedEntries.length > 0
  if (currentStep.value === 3) return batchStore.allFormsLoaded && batchStore.selectedEntries.length > 0
  if (currentStep.value === 4) return true // 서류 첨부는 선택 사항
  if (currentStep.value === 5) return totalRequiredUnfilled.value === 0
  return false
})

const mainButtonLabel = computed(() => {
  if (batchStore.loading) return '처리 중...'
  if (currentStep.value === 1) return '다음: 보험사 선택'
  if (currentStep.value === 2) return '다음: 필드 입력'
  if (currentStep.value === 3) return '다음: 서류 첨부'
  if (currentStep.value === 4) return '다음: 최종 확인'
  if (currentStep.value === 5) {
    if (isDraftMode.value) return '제출하기'
    return '일괄 제출'
  }
  return '다음'
})

// ===== 라이프사이클 =====
onMounted(async () => {
  batchStore.resetBatchForm()

  // 보험사 목록 + 초기 고객 목록 로드
  await Promise.all([
    batchStore.loadInsuranceCompanies(),
    batchStore.searchCustomers(''),
  ])

  // draft 편집 모드
  if (batchId.value) {
    const batch = await batchStore.loadBatchClaim(batchId.value)
    if (batch && batch.batch_status === 'draft') {
      isDraftMode.value = true
      batchStore.currentBatch = batch
      await restoreDraft(batch)
    }
  }

  initialLoaded.value = true
})

onUnmounted(() => {
  if (searchTimeout) clearTimeout(searchTimeout)
})

// 탭 전환 시 내부 스텝 초기화 + 2차 자동 복사
watch(() => batchStore.activeTabIndex, (newIdx) => {
  innerStep.value = 1
  // 2차 채움: 첫 번째 양식의 표준 필드 값을 현재 탭에 복사
  batchStore.autoCopyStandardFields(newIdx)
})

// ===== 핸들러 =====
function handleHeaderBack(): void {
  if (currentStep.value > 1) {
    currentStep.value--
  } else {
    router.back()
  }
}

function handleCustomerSearch(): void {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    batchStore.searchCustomers(customerSearch.value)
  }, 400)
}

function handleSelectCustomer(customer: Customer): void {
  batchStore.selectCustomer(customer)
}

function clearCustomer(): void {
  batchStore.selectedCustomer = null
  customerSearch.value = ''
}

function getEntryForCompany(companyId: number) {
  return batchStore.selectedEntries.find((e) => e.company.company_id === companyId)
}

function handleFormSelect(companyId: number, formId: number): void {
  if (!formId) return
  const entry = getEntryForCompany(companyId)
  if (entry) {
    batchStore.selectFormForEntry(entry, formId)
  }
}

function handleMainAction(): void {
  if (!canProceedMain.value) return

  if (currentStep.value === 1) {
    currentStep.value = 2
  } else if (currentStep.value === 2) {
    currentStep.value = 3
    innerStep.value = 1
    batchStore.activeTabIndex = 0
  } else if (currentStep.value === 3) {
    currentStep.value = 4
  } else if (currentStep.value === 4) {
    currentStep.value = 5
  } else if (currentStep.value === 5) {
    handleSubmitBatch()
  }
}

async function handleSaveDraft(): Promise<void> {
  if (isDraftMode.value && batchStore.currentBatch) {
    const result = await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
    if (result) {
      toast.showToast('임시저장이 갱신되었습니다.')
    }
  } else {
    const result = await batchStore.saveDraft()
    if (result) {
      isDraftMode.value = true
      batchStore.currentBatch = result
      toast.showToast('임시저장되었습니다.')
      // URL 갱신 (새 draft → 편집 모드)
      router.replace({ name: 'agent-batch-claim-edit', params: { batchId: result.batch_claim_id } })
    }
  }
}

async function handleSubmitBatch(): Promise<void> {
  if (!confirm(`${batchStore.selectedEntries.length}건의 청구서를 일괄 제출하시겠습니까?`)) return

  let result
  if (isDraftMode.value && batchStore.currentBatch) {
    // draft → submit
    result = await batchStore.submitDraft(batchStore.currentBatch.batch_claim_id)
  } else {
    // 새 배치 생성 + 제출
    result = await batchStore.createBatch()
  }

  if (result) {
    toast.showToast('일괄 제출이 완료되었습니다.')
    router.push({ name: 'agent-batch-claim-detail', params: { id: result.batch_claim_id } })
  }
}

// ===== Draft 복원 =====
async function restoreDraft(batch: import('../../types').BatchClaim): Promise<void> {
  // 고객 복원
  if (batch.customer) {
    batchStore.selectedCustomer = batch.customer as Customer
  }

  // claims에서 보험사 + 양식 + 필드 복원
  if (batch.claims && batch.claims.length > 0) {
    for (const claim of batch.claims) {
      const companyId = claim.claim_form?.company_id || claim.company_id
      if (!companyId) continue

      const company = batchStore.insuranceCompanies.find((c) => c.company_id === companyId)
      if (!company) continue

      // 보험사 토글 (이미 체크되어 있지 않으면)
      if (!batchStore.isCompanySelected(company.company_id)) {
        batchStore.toggleCompany(company)
      }

      // 양식 선택 대기 후 필드값 복원
      const claimFormId = claim.claim_form?.claim_form_id || claim.claim_form_id
      if (claimFormId) {
        const entry = batchStore.selectedEntries.find((e) => e.company.company_id === company.company_id)
        if (entry) {
          await batchStore.selectFormForEntry(entry, claimFormId)
          // fieldValues 복원 (claim의 field_values가 있으면)
          const claimWithValues = claim as unknown as { field_values?: Array<{ form_field_id: number; field_value: string }> }
          if (claimWithValues.field_values) {
            for (const fv of claimWithValues.field_values) {
              entry.fieldValues[fv.form_field_id] = fv.field_value
            }
          }
        }
      }
    }
    currentStep.value = 3
  }
}

// ===== Step 5: 확인 화면용 Computed =====
const hasAutoFilledFields = computed(() => {
  const entry = currentEntry.value
  if (!entry) return false
  return Object.keys(entry.autoFilledFieldIds).length > 0
})

function getRequiredUnfilledCount(entryIdx: number): number {
  const entry = batchStore.selectedEntries[entryIdx]
  if (!entry) return 0
  const fields = getAllFieldsForEntry(entry)
  return fields.filter((f) => {
    if (!f.is_required) return false
    const val = entry.fieldValues[f.form_field_id]
    return !val || val.trim() === ''
  }).length
}

const totalRequiredUnfilled = computed(() => {
  let count = 0
  for (let i = 0; i < batchStore.selectedEntries.length; i++) {
    count += getRequiredUnfilledCount(i)
  }
  return count
})

function goToEntryInput(entryIdx: number): void {
  currentStep.value = 3
  batchStore.activeTabIndex = entryIdx
  innerStep.value = 1
}

function getPerClaimDocs(entryIdx: number): import('../../stores/agentBatchClaimStore').LocalAttachment[] {
  return batchStore.perClaimDocuments[entryIdx] || []
}

// ===== 첨부파일 핸들러 =====
function handleCommonFileSelect(event: Event): void {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    batchStore.addCommonDocument(file)
  }
  input.value = '' // 같은 파일 다시 선택 가능하도록 초기화
}

function handlePerClaimFileSelect(event: Event, entryIdx: number): void {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  for (const file of Array.from(input.files)) {
    batchStore.addPerClaimDocument(entryIdx, file)
  }
  input.value = ''
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

// ===== 유틸 =====
function getAllFieldsForEntry(entry: { claimForm: import('@shared/types').ClaimForm | null }): FormField[] {
  if (!entry.claimForm) return []
  const form = entry.claimForm
  const fields: FormField[] = []
  if (form.form_pages && form.form_pages.length > 0) {
    form.form_pages.forEach((page: FormPage) => {
      if (page.form_fields) {
        fields.push(...page.form_fields)
      }
    })
  } else if (form.form_fields) {
    fields.push(...form.form_fields)
  }
  return fields.sort((a, b) => a.field_order - b.field_order)
}

function getFieldWizardStep(field: FormField): number {
  // 명시적 wizard_step 지정 시 사용
  if (field.field_options?.wizard_step) return field.field_options.wizard_step

  // field_name prefix 기반 추론
  const name = field.field_name.toLowerCase()
  if (name.startsWith('consent_') || field.field_type === 'consent') return 1
  if (name.startsWith('claim_') || name.startsWith('accident_') || name.startsWith('disease_')) return 2
  if (name.startsWith('contractor_') || name.startsWith('applicant_')) return 3
  if (name.startsWith('insured_') || name.startsWith('beneficiary_')) return 4
  if (name.startsWith('bank_') || name.startsWith('account_')) return 5

  return 3 // 기본값
}

function getFilledCount(entryIdx: number): number {
  const entry = batchStore.selectedEntries[entryIdx]
  if (!entry) return 0
  const fields = getAllFieldsForEntry(entry)
  return fields.filter((f) => {
    const val = entry.fieldValues[f.form_field_id]
    return val !== undefined && val !== ''
  }).length
}

function getTotalFieldCount(entryIdx: number): number {
  const entry = batchStore.selectedEntries[entryIdx]
  if (!entry) return 0
  return getAllFieldsForEntry(entry).length
}

function formatFieldInput(fieldId: number, fieldType: string, event: Event): void {
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
      target.value = value
      break
    case 'resident_number':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 6) {
        value = value.slice(0, 6) + '-' + value.slice(6, 13)
      }
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

  batchStore.setActiveFieldValue(fieldId, value)
}
</script>
