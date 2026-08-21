<template>
  <div class="p-6">
    <!-- 상단 네비게이션 -->
    <div class="flex items-center gap-3 mb-6">
      <button type="button" class="text-[14px] text-[#888] hover:text-[#FF7B22] transition-colors" @click="handleHeaderBack">
        &larr; 목록으로
      </button>
      <span class="text-[#E0E0E0]">|</span>
      <h1 class="text-[20px] font-bold text-[#333]">
        {{ isDraftMode ? '다중 청구 이어쓰기' : '다중 보험 청구' }}
      </h1>
    </div>

    <div class="max-w-3xl mx-auto">
      <!-- 로딩 -->
      <div v-if="batchStore.loading && !initialLoaded" class="flex items-center justify-center py-20">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
        <p class="ml-3 text-[13px] text-[#999]">불러오는 중...</p>
      </div>

      <template v-else>
        <!-- ==================== Setup Phase: 고객 + 보험사 선택 ==================== -->
        <template v-if="!wizardPhase">
          <!-- Step 1: 고객 선택 -->
          <div v-if="setupStep === 1" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <p class="text-[18px] font-bold text-[#222] mb-4">고객을 선택하세요</p>

            <div v-if="batchStore.selectedCustomer" class="rounded-xl bg-[#FFF3ED] border-[1.5px] border-[#FF7B22] p-4 mb-4">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-[#FF7B22] text-white flex items-center justify-center text-[15px] font-bold shrink-0">
                  {{ batchStore.selectedCustomer.name.charAt(0) }}
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[15px] font-semibold text-[#222]">{{ batchStore.selectedCustomer.name }}</p>
                  <p class="text-[12px] text-[#888]">{{ batchStore.selectedCustomer.phone }}</p>
                </div>
                <button type="button" @click="clearCustomer" class="text-[13px] text-[#FF7B22] font-medium hover:underline">변경</button>
              </div>
            </div>

            <template v-if="!batchStore.selectedCustomer">
              <div class="relative mb-3">
                <div class="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="11" cy="11" r="7" stroke="#AAAAAA" stroke-width="2"/><path d="M16 16L20 20" stroke="#AAAAAA" stroke-width="2" stroke-linecap="round"/></svg>
                </div>
                <input v-model="customerSearch" type="text" placeholder="고객명 또는 연락처 검색"
                  class="w-full bg-white rounded-xl pl-10 pr-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors"
                  @input="handleCustomerSearch" />
              </div>
              <div v-if="batchStore.loadingCustomers" class="flex items-center justify-center py-6">
                <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
              </div>
              <div v-else-if="batchStore.customerSearchResults.length > 0" class="flex flex-col gap-2 max-h-[400px] overflow-y-auto rounded-xl">
                <button v-for="customer in batchStore.customerSearchResults" :key="customer.customer_id" type="button"
                  class="flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all hover:bg-[#FFF8F3] bg-white border-[1.5px] border-transparent hover:border-[#FF7B22]"
                  @click="handleSelectCustomer(customer)">
                  <div class="w-9 h-9 rounded-full bg-[#F0F0F0] text-[#999] flex items-center justify-center shrink-0 text-[13px] font-bold">{{ customer.name.charAt(0) }}</div>
                  <div class="flex-1 min-w-0">
                    <p class="text-[14px] font-semibold text-[#222] truncate">{{ customer.name }}</p>
                    <p class="text-[12px] text-[#999] truncate">{{ customer.phone }}</p>
                  </div>
                </button>
              </div>
              <div v-else class="flex flex-col items-center justify-center py-10">
                <p class="text-[13px] text-[#AAAAAA]">{{ customerSearch ? '검색 결과가 없습니다' : '고객명으로 검색해주세요' }}</p>
              </div>
            </template>

            <div class="mt-4 flex justify-end">
              <button type="button" :disabled="!batchStore.selectedCustomer"
                class="px-8 py-3 rounded-[28px] text-[15px] font-bold transition-colors"
                :class="batchStore.selectedCustomer ? 'bg-[#FF7B22] text-white hover:bg-[#E86D1A]' : 'bg-[#FFD4B3] text-white cursor-not-allowed'"
                @click="setupStep = 2">다음: 보험사 선택</button>
            </div>
          </div>

          <!-- Step 2: 보험사 선택 -->
          <div v-else-if="setupStep === 2" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <p class="text-[18px] font-bold text-[#222] mb-1">보험사를 선택하세요</p>
            <p class="text-[13px] text-[#999] mb-4">청구할 보험사를 선택하세요</p>

            <div v-if="batchStore.loadingCompanies" class="flex items-center justify-center py-10">
              <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
            </div>
            <template v-else>
              <div class="grid grid-cols-2 gap-3 mb-4">
                <button v-for="company in batchStore.insuranceCompanies" :key="company.company_id" type="button"
                  class="w-full text-left rounded-xl px-4 py-3 transition-all hover:shadow-md"
                  :class="batchStore.isCompanySelected(company.company_id) ? 'bg-[#FFF3ED] border-[1.5px] border-[#FF7B22]' : 'bg-white border-[1.5px] border-[#E8E8E8] hover:border-[#FF7B22]'"
                  @click="batchStore.toggleCompany(company)">
                  <div class="flex items-center gap-3">
                    <span class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                      :class="batchStore.isCompanySelected(company.company_id) ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                      <svg v-if="batchStore.isCompanySelected(company.company_id)" width="10" height="8" viewBox="0 0 12 10" fill="none">
                        <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                      </svg>
                    </span>
                    <span class="text-[14px] font-semibold text-[#222]">{{ company.company_name }}</span>
                  </div>
                  <div v-if="batchStore.isCompanySelected(company.company_id)" class="mt-2 ml-8">
                    <div v-if="getEntryForCompany(company.company_id)?.loadingForm" class="flex items-center gap-2 py-1">
                      <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-[#FF7B22]"></div>
                      <span class="text-[12px] text-[#999]">양식 로딩 중...</span>
                    </div>
                    <template v-else>
                      <div v-if="getEntryForCompany(company.company_id)?.availableForms.length === 1" class="text-[12px] text-[#FF7B22] font-medium">
                        양식: {{ getEntryForCompany(company.company_id)?.claimForm?.form_name }}
                      </div>
                      <select v-else-if="(getEntryForCompany(company.company_id)?.availableForms.length ?? 0) > 1"
                        class="w-full text-[13px] border border-[#E8E8E8] rounded-lg px-3 py-2 outline-none focus:border-[#FF7B22] bg-white"
                        :value="getEntryForCompany(company.company_id)?.claimForm?.claim_form_id ?? ''"
                        @change="handleFormSelect(company.company_id, Number(($event.target as HTMLSelectElement).value))">
                        <option value="" disabled>양식을 선택하세요</option>
                        <option v-for="form in getEntryForCompany(company.company_id)?.availableForms" :key="form.claim_form_id" :value="form.claim_form_id">{{ form.form_name }}</option>
                      </select>
                      <div v-else class="text-[12px] text-[#999]">등록된 양식이 없습니다</div>
                    </template>
                  </div>
                </button>
              </div>

              <div v-if="batchStore.selectedEntries.length > 0" class="rounded-xl bg-[#F8F8F8] px-4 py-3 text-[13px] text-[#666] mb-4">
                선택: {{ batchStore.selectedEntries.length }}개 보험사, {{ batchStore.selectedEntries.filter(e => e.claimForm).length }}개 양식
              </div>
            </template>

            <div class="flex gap-3 justify-end mt-4">
              <button type="button" class="px-6 py-3 rounded-[28px] text-[14px] font-semibold border border-[#E5E5E5] text-[#666] hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors"
                @click="setupStep = 1">이전</button>
              <button type="button" :disabled="!batchStore.allFormsLoaded || batchStore.selectedEntries.length === 0"
                class="px-8 py-3 rounded-[28px] text-[15px] font-bold transition-colors"
                :class="batchStore.allFormsLoaded && batchStore.selectedEntries.length > 0 ? 'bg-[#FF7B22] text-white hover:bg-[#E86D1A]' : 'bg-[#FFD4B3] text-white cursor-not-allowed'"
                @click="enterWizard">양식 입력 시작</button>
            </div>
          </div>
        </template>

        <!-- ==================== Wizard Phase: 10스텝 BankDiary 위저드 ==================== -->
        <template v-else>
          <!-- 프로그레스 바 -->
          <div class="mb-6">
            <div class="h-[3px] bg-[#F0F0F0] rounded-full">
              <div class="h-full bg-[#FF7B22] rounded-full transition-all duration-300"
                :style="{ width: `${(activeStepIndex + 1) / activeSteps.length * 100}%` }"></div>
            </div>
            <div class="flex gap-2 mt-3 flex-wrap">
              <button v-for="(s, i) in activeSteps" :key="s" type="button"
                class="px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all"
                :class="currentStep === s ? 'bg-[#FF7B22] text-white'
                  : i < activeStepIndex ? 'bg-[#FFF3ED] text-[#FF7B22] hover:bg-[#FFE4CC] cursor-pointer'
                  : 'bg-[#F0F0F0] text-[#999]'"
                @click="i < activeStepIndex ? (currentStep = s) : undefined">
                {{ STEP_TITLES[s] || '' }}
              </button>
            </div>
          </div>

          <!-- ===== Step 1: 약관 동의 ===== -->
          <div v-if="currentStep === 1" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">약관 동의</p>
            <p class="text-[13px] text-[#6B7280] mb-5">보험금 청구를 위한 약관에 동의해주세요</p>

            <button type="button" @click="toggleAllConsents"
              class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-4 transition-colors"
              :class="allConsentsChecked ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
              <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="allConsentsChecked ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                <svg v-if="allConsentsChecked" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="text-[16px] font-bold text-[#1A1A1A]">전체 동의</span>
            </button>

            <div class="flex flex-col gap-2">
              <button v-for="item in CONSENT_ITEMS" :key="item.id" type="button" @click="toggleConsent(item.id)"
                class="w-full flex items-center gap-3 bg-white border rounded-[14px] p-4 transition-colors text-left hover:shadow-sm"
                :class="consentState[item.id] ? 'border-[#FF7B22]' : 'border-[#E5E5E5]'">
                <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  :class="consentState[item.id] ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                  <svg v-if="consentState[item.id]" width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <span class="flex-1 text-[14px] text-[#1A1A1A]">
                  <span class="text-[#FF3B30] font-medium">[필수]</span> {{ item.title }}
                </span>
              </button>
            </div>
          </div>

          <!-- ===== Steps 2-6: 필드 입력 ===== -->
          <div v-else-if="currentStep >= 2 && currentStep <= 6" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">{{ STEP_TITLES[currentStep] }}</p>
            <p class="text-[13px] text-[#6B7280] mb-5">{{ STEP_SUBTITLES[currentStep] || '' }}</p>

            <!-- Step 4: 고객 정보와 동일 -->
            <button v-if="currentStep === 4 && batchStore.selectedCustomer" type="button"
              @click="autoFillContractor = !autoFillContractor; handleAutoFillContractor()"
              class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-5 transition-colors hover:shadow-sm"
              :class="autoFillContractor ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
              <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="autoFillContractor ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                <svg v-if="autoFillContractor" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="text-[14px] font-medium text-[#1A1A1A]">고객 정보와 동일</span>
            </button>

            <!-- Step 5: 계약자와 동일 -->
            <button v-if="currentStep === 5" type="button"
              @click="autoFillInsured = !autoFillInsured; handleAutoFillInsured()"
              class="w-full flex items-center gap-3 rounded-[14px] p-4 mb-5 transition-colors hover:shadow-sm"
              :class="autoFillInsured ? 'bg-[#FFF3ED]' : 'bg-[#F0F0F5]'">
              <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                :class="autoFillInsured ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'">
                <svg v-if="autoFillInsured" width="12" height="10" viewBox="0 0 12 10" fill="none">
                  <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </span>
              <span class="text-[14px] font-medium text-[#1A1A1A]">계약자와 동일</span>
            </button>

            <!-- Step 6: 자동이체 계좌 -->
            <div v-if="currentStep === 6 && hasAutoTransferField" class="mb-5">
              <p class="text-[13px] font-medium text-[#6B7280] mb-3">보험료 자동이체 계좌로 수령하시겠습니까?</p>
              <div class="flex gap-3">
                <button type="button" @click="autoTransferAccount = true"
                  class="flex-1 h-[52px] rounded-[12px] text-[15px] font-medium border-[1.5px] transition-colors hover:shadow-sm"
                  :class="autoTransferAccount ? 'border-[#FF7B22] bg-[#FFF3ED] text-[#FF7B22]' : 'border-[#E5E5E5] bg-white text-[#6B7280]'">네</button>
                <button type="button" @click="autoTransferAccount = false"
                  class="flex-1 h-[52px] rounded-[12px] text-[15px] font-medium border-[1.5px] transition-colors hover:shadow-sm"
                  :class="!autoTransferAccount ? 'border-[#FF7B22] bg-[#FFF3ED] text-[#FF7B22]' : 'border-[#E5E5E5] bg-white text-[#6B7280]'">아니오</button>
              </div>
              <p v-if="autoTransferAccount && !allHaveAutoTransfer" class="mt-2 text-[12px] text-[#F59E0B]">
                ※ 일부 보험사는 자동이체 계좌 수령을 지원하지 않아, 해당 보험사는 계좌 정보를 직접 입력해야 합니다.
              </p>
            </div>

            <!-- Step 5: 피보험자 섹션 헤더 -->
            <p v-if="currentStep === 5 && insuredFields.length > 0" class="text-[15px] font-semibold text-[#1A1A1A] mb-3">피보험자 정보</p>

            <!-- 공통 필드 -->
            <div class="grid grid-cols-1 gap-5">
              <template v-for="field in currentStepCommonFields" :key="field.key">
                <div>
                  <div v-if="field.entries.length > 1" class="flex flex-wrap gap-1 mb-1">
                    <span v-for="e in field.entries" :key="e.formFieldId"
                      class="text-[10px] px-1.5 py-0.5 bg-[#FFF3ED] text-[#FF7B22] rounded-full">{{ e.companyName }}</span>
                  </div>
                  <ClaimFieldInput :field="fieldToFormField(field)" :model-value="batchStore.getUnifiedValue(field)"
                    @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                    @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                    variant="underline" />
                </div>
              </template>
            </div>

            <!-- Step 5: 수익자 섹션 -->
            <template v-if="currentStep === 5 && beneficiaryFields.length > 0">
              <div class="mt-8 mb-3 pt-6 border-t border-[#F0F0F0]">
                <p class="text-[15px] font-semibold text-[#1A1A1A]">수익자 정보</p>
              </div>
              <div class="grid grid-cols-1 gap-5">
                <template v-for="field in beneficiaryFields" :key="field.key">
                  <div>
                    <ClaimFieldInput :field="fieldToFormField(field)" :model-value="batchStore.getUnifiedValue(field)"
                      @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                      @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                      variant="underline" />
                  </div>
                </template>
              </div>
            </template>

            <!-- 보험사별 전용 필드 -->
            <template v-for="(entry, idx) in batchStore.selectedEntries" :key="'spec-' + idx">
              <template v-if="specificFieldsForStep(currentStep, idx).length > 0">
                <div class="mt-6 mb-3 flex items-center gap-2">
                  <span class="w-[6px] h-[6px] rounded-full bg-[#FF7B22]"></span>
                  <p class="text-[13px] font-semibold text-[#FF7B22]">{{ entry.company.company_name }}</p>
                </div>
                <div class="grid grid-cols-1 gap-5">
                  <template v-for="field in specificFieldsForStep(currentStep, idx)" :key="field.key">
                    <div>
                      <ClaimFieldInput :field="fieldToFormField(field)" :model-value="batchStore.getUnifiedValue(field)"
                        @update:model-value="(val: string) => batchStore.setUnifiedValue(field, val)"
                        @format-input="(_fid: number, ft: string, ev: Event) => handleFormatInput(field, ft, ev)"
                        variant="underline" />
                    </div>
                  </template>
                </div>
              </template>
            </template>
          </div>

          <!-- ===== Step 7: 증빙 서류 ===== -->
          <div v-else-if="currentStep === 7" class="space-y-4">
            <div class="bg-white rounded-xl border border-[#E8E8E8] p-6">
              <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">공통 서류</p>
              <p class="text-[13px] text-[#6B7280] mb-4">전체 보험사에 동일하게 첨부됩니다 (최대 20장, 파일당 20MB)</p>

              <label class="flex items-center justify-center gap-2 h-[52px] border-2 border-dashed border-[#E5E5E5] rounded-[12px] cursor-pointer hover:border-[#FF7B22] transition-colors mb-4">
                <span class="material-symbols-outlined text-[20px] text-[#6B7280]">add_photo_alternate</span>
                <span class="text-[14px] text-[#6B7280] font-medium">사진/서류 추가</span>
                <input type="file" class="hidden" multiple accept="image/*,.pdf,.doc,.docx" @change="handleCommonFileSelect" />
              </label>

              <div v-if="batchStore.commonDocuments.length > 0" class="grid grid-cols-5 gap-3">
                <div v-for="doc in batchStore.commonDocuments" :key="doc.id"
                  class="relative w-full aspect-square rounded-[12px] overflow-hidden bg-[#F5F5F5]">
                  <img v-if="isImageFile(doc.name)" :src="getFilePreview(doc.file)" :alt="doc.name" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center">
                    <span class="material-symbols-outlined text-[24px] text-[#C4C4C4]">description</span>
                    <span class="text-[9px] text-[#C4C4C4] mt-0.5 truncate max-w-[60px]">{{ doc.name.split('.').pop() }}</span>
                  </div>
                  <button @click="batchStore.removeCommonDocument(doc.id)" type="button"
                    class="absolute -top-1 -right-1 w-[22px] h-[22px] bg-[#FF3B30] rounded-full flex items-center justify-center shadow-sm hover:bg-[#E02020]">
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M1 1L9 9M9 1L1 9" stroke="white" stroke-width="1.5" stroke-linecap="round"/></svg>
                  </button>
                </div>
              </div>
              <p v-else class="text-center text-[13px] text-[#C4C4C4] mt-4">아직 첨부된 서류가 없습니다</p>
            </div>

            <!-- 개별 서류 -->
            <div class="bg-white rounded-xl border border-[#E8E8E8] p-6">
              <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">개별 서류</p>
              <p class="text-[13px] text-[#6B7280] mb-4">특정 보험사에만 첨부할 서류입니다</p>
              <div class="space-y-4">
                <div v-for="(entry, idx) in batchStore.selectedEntries" :key="entry.company.company_id" class="rounded-xl bg-[#F6F6F8] p-4">
                  <p class="text-[14px] font-semibold text-[#333] mb-3">{{ entry.company.company_name }}</p>
                  <div v-if="getPerClaimDocs(idx).length > 0" class="flex flex-col gap-2 mb-3">
                    <div v-for="doc in getPerClaimDocs(idx)" :key="doc.id" class="flex items-center gap-2 px-3 py-2 rounded-lg bg-white">
                      <span class="flex-1 text-[12px] text-[#333] truncate">{{ doc.name }}</span>
                      <button type="button" @click="batchStore.removePerClaimDocument(idx, doc.id)" class="text-[11px] text-[#FF4444] hover:underline">삭제</button>
                    </div>
                  </div>
                  <label class="flex items-center justify-center gap-2 py-2.5 rounded-lg border border-dashed border-[#CCCCCC] text-[12px] text-[#888] cursor-pointer hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">
                    서류 추가
                    <input type="file" class="hidden" multiple accept="image/*,.pdf,.doc,.docx" @change="(e) => handlePerClaimFileSelect(e, idx)" />
                  </label>
                </div>
              </div>
            </div>
          </div>

          <!-- ===== Step 8: 청구 내용 확인 ===== -->
          <div v-else-if="currentStep === 8" class="space-y-4">
            <div class="bg-white rounded-xl border border-[#E8E8E8] p-6">
              <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">청구 내용 확인</p>
              <p class="text-[13px] text-[#6B7280] mb-5">입력하신 내용을 확인해주세요</p>

              <div class="space-y-4">
                <div v-for="(entry, idx) in batchStore.selectedEntries" :key="'review-' + idx"
                  class="bg-[#F6F6F8] rounded-[14px] p-[18px_20px]">
                  <div class="flex items-center justify-between mb-3">
                    <p class="text-[15px] font-bold text-[#1A1A1A]">{{ entry.company.company_name }}</p>
                    <span class="text-[12px] font-medium px-2 py-0.5 rounded-full"
                      :class="progressPercent(idx) === 100 ? 'bg-[#E8F8EE] text-[#34C759]' : 'bg-[#FFF3ED] text-[#FF7B22]'">
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
                  <button v-if="progressPercent(idx) < 100" type="button" @click="goToFirstIncompleteStep()"
                    class="mt-3 text-[12px] text-[#FF7B22] font-medium hover:underline">미입력 항목 채우기 →</button>
                </div>
              </div>

              <div class="mt-4 bg-[#F6F6F8] rounded-[14px] p-[18px_20px]">
                <p class="text-[15px] font-bold text-[#1A1A1A] mb-2">첨부 서류</p>
                <p class="text-[13px] text-[#6B7280]">공통 {{ batchStore.commonDocuments.length }}개 파일</p>
              </div>
            </div>
          </div>

          <!-- ===== Step 9: 서명 ===== -->
          <div v-else-if="currentStep === 9" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <div class="flex items-center justify-between mb-1">
              <p class="text-[18px] font-bold text-[#1A1A1A]">서명</p>
              <button type="button" @click="resetSignature" class="flex items-center gap-1 text-[12px] text-[#999] hover:text-[#FF7B22] transition-colors">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 4v6h-6"/><path d="M20.49 15a9 9 0 11-5.07-11.36L23 10"/></svg>
                다시 쓰기
              </button>
            </div>
            <p class="text-[13px] text-[#6B7280] mb-5">아래 영역에 서명해주세요. 모든 보험사 청구서에 적용됩니다.</p>

            <div v-if="!signatureDataUrl">
              <div class="relative rounded-[14px] overflow-hidden bg-[#FAF0F0]" style="height: 200px;">
                <canvas ref="signatureCanvasRef"
                  class="absolute inset-0 w-full h-full cursor-crosshair"
                  @mousedown="startDraw" @mousemove="onDraw" @mouseup="endDraw" @mouseleave="endDraw"
                ></canvas>
                <p v-if="!hasDrawn" class="absolute inset-0 flex items-center justify-center text-[14px] text-[#C4C4C4] pointer-events-none">
                  여기에 서명해주세요</p>
              </div>
              <div class="flex gap-3 mt-3">
                <button type="button" @click="clearCanvas"
                  class="flex-1 h-[44px] rounded-[12px] text-[14px] font-medium text-[#6B7280] border border-[#E5E5E5] hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">지우기</button>
                <button type="button" @click="completeSignature"
                  class="flex-1 h-[44px] rounded-[12px] text-[14px] font-medium text-white bg-[#FF7B22] hover:bg-[#E86D1A] transition-colors">서명 완료</button>
              </div>
            </div>
            <div v-else class="text-center">
              <div class="rounded-[14px] overflow-hidden bg-[#FAF0F0] p-4 inline-block">
                <img :src="signatureDataUrl" alt="서명" class="max-h-[120px]" />
              </div>
              <div class="mt-3">
                <button type="button" @click="resetSignature" class="text-[13px] text-[#FF7B22] font-medium hover:underline">다시 서명</button>
              </div>
            </div>
          </div>

          <!-- ===== Step 10: 최종 확인 ===== -->
          <div v-else-if="currentStep === 10" class="bg-white rounded-xl border border-[#E8E8E8] p-6">
            <p class="text-[18px] font-bold text-[#1A1A1A] mb-1">최종 확인</p>
            <p class="text-[13px] text-[#6B7280] mb-5">{{ batchStore.selectedEntries.length }}개 보험사에 청구서를 제출합니다</p>

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

            <div v-if="signatureDataUrl" class="bg-[#F6F6F8] rounded-[14px] p-4 mb-6">
              <p class="text-[13px] text-[#6B7280] mb-2">서명</p>
              <img :src="signatureDataUrl" alt="서명" class="h-[60px]" />
            </div>

            <div class="bg-[#F6F6F8] rounded-[14px] p-4">
              <label class="flex items-start gap-3 cursor-pointer">
                <span class="w-[24px] h-[24px] rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
                  :class="finalConsentChecked ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D1D1D6] bg-white'"
                  @click="finalConsentChecked = !finalConsentChecked">
                  <svg v-if="finalConsentChecked" width="12" height="10" viewBox="0 0 12 10" fill="none">
                    <path d="M1 5L4.5 8.5L11 1.5" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
                </span>
                <div @click="finalConsentChecked = !finalConsentChecked">
                  <p class="text-[14px] font-medium text-[#1A1A1A]">위 내용을 확인하였으며, 청구에 동의합니다</p>
                  <p class="text-[12px] text-[#6B7280] mt-1">{{ batchStore.selectedEntries.map(e => e.company.company_name).join(', ') }}</p>
                </div>
              </label>
            </div>
          </div>

          <!-- 에러 -->
          <div v-if="batchStore.error" class="p-3 bg-[#FFE5E5] rounded-xl text-[13px] text-[#FF0000] mt-4">{{ batchStore.error }}</div>

          <!-- 하단 액션 바 -->
          <div class="flex gap-3 justify-between mt-6">
            <div class="flex gap-3">
              <button type="button" @click="handleWizardBack"
                class="px-6 py-3 rounded-[28px] text-[14px] font-semibold border border-[#E5E5E5] text-[#666] hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors">이전</button>
              <button v-if="currentStep <= 7" type="button" @click="handleSaveDraft" :disabled="batchStore.loading"
                class="px-6 py-3 rounded-[28px] text-[14px] font-semibold border-[1.5px] border-[#FF7B22] text-[#FF7B22] bg-white hover:bg-[#FFF8F3] transition-colors">
                {{ batchStore.loading ? '저장 중...' : '임시저장' }}
              </button>
            </div>
            <button type="button" @click="handleCTA" :disabled="!canProceed || batchStore.loading"
              class="px-8 py-3 rounded-[28px] text-[15px] font-bold transition-colors"
              :class="canProceed && !batchStore.loading ? 'bg-[#FF7B22] text-white hover:bg-[#E86D1A]' : 'bg-[#FFD4B3] text-white cursor-not-allowed'">
              <span v-if="batchStore.loading">처리 중...</span>
              <span v-else>{{ ctaText }}</span>
            </button>
          </div>
        </template>
      </template>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div v-if="toast.visible.value" class="fixed bottom-10 left-1/2 -translate-x-1/2 text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap"
        :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'">
        {{ toast.message.value }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import api from '@shared/api'
import ClaimFieldInput from '@shared/components/claim/ClaimFieldInput.vue'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import type { UnifiedField } from '../../stores/agentBatchClaimStore'
import type { Customer } from '../../types'
import type { FormField } from '@shared/types'
import { useToast } from '../../composables/useToast'
import { compressImages } from '@shared/utils/compressImage'

const toast = useToast()
const router = useRouter()
const route = useRoute()
const batchStore = useAgentBatchClaimStore()

// ===== Setup Phase =====
const setupStep = ref(1)
const initialLoaded = ref(false)
const customerSearch = ref('')
let searchTimeout: ReturnType<typeof setTimeout> | null = null

const fromSelect = computed(() => route.query.fromSelect === 'true')
const batchId = computed(() => { const id = route.params.batchId; return id ? Number(id) : null })
const isDraftMode = ref(false)

const wizardPhase = computed(() =>
  batchStore.allFormsLoaded && batchStore.selectedEntries.length > 0 && wizardEntered.value
)
const wizardEntered = ref(false)

function enterWizard() {
  batchStore.autoFillFromCustomer()
  wizardEntered.value = true
}

// ===== Wizard Step Definitions =====
const currentStep = ref(1)

const STEP_TITLES: Record<number, string> = {
  1: '약관 동의', 2: '진단 정보', 3: '사고·청구 내용', 4: '계약자 정보',
  5: '피보험자·수익자 정보', 6: '계좌 정보', 7: '증빙 서류',
  8: '청구 내용 확인', 9: '서명', 10: '최종 확인',
}

const STEP_SUBTITLES: Record<number, string> = {
  2: '진단명과 사고 유형을 입력해주세요', 3: '사고 일시와 청구 사유를 입력해주세요',
  4: '계약자(청구인)의 정보를 입력해주세요', 5: '피보험자와 수익자 정보를 입력해주세요',
  6: '보험금을 수령할 계좌를 입력해주세요',
}

// ===== Field → Step Mapping =====
const DIAGNOSIS_CODES = new Set([
  'ACCIDENT_TYPE', 'ACCIDENT_DETAIL_TYPE', 'DISEASE_NAME', 'DISEASE_CODE',
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
    const code = f.standardCode || ''; const name = f.key.toLowerCase()
    return code.startsWith('INSURED_') || (name.startsWith('insured_') && !code.startsWith('BENEFICIARY_'))
  })
)

const beneficiaryFields = computed(() =>
  commonFieldsForStep(5).filter(f => {
    const code = f.standardCode || ''; const name = f.key.toLowerCase()
    return code.startsWith('BENEFICIARY_') || name.startsWith('beneficiary_')
  })
)

const otherStep5Fields = computed(() =>
  commonFieldsForStep(5).filter(f => {
    const code = f.standardCode || ''; const name = f.key.toLowerCase()
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
  if (step === 5) return [...insuredFields.value, ...otherStep5Fields.value]
  if (step === 6) return visibleAccountFields.value
  return commonFieldsForStep(step)
})

// ===== Consent (Step 1) =====
const CONSENT_ITEMS = [
  { id: 'privacy', title: '개인정보 수집·이용 동의' },
  { id: 'identification', title: '고유식별정보 처리 동의' },
  { id: 'sensitive', title: '민감정보 처리 동의' },
]

const consentState = ref<Record<string, boolean>>({ privacy: false, identification: false, sensitive: false })
const allConsentsChecked = computed(() => CONSENT_ITEMS.every(item => consentState.value[item.id]))

function toggleAllConsents() {
  const newVal = !allConsentsChecked.value
  for (const item of CONSENT_ITEMS) consentState.value[item.id] = newVal
}

function toggleConsent(id: string) { consentState.value[id] = !consentState.value[id] }

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
    const fields = batchStore.getFormFields(entry.claimForm).filter(f => batchStore.getFieldCategory(f) === 3)
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
      if (targetField) batchStore.setUnifiedValue(targetField, autoFillInsured.value ? sourceVal : '')
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

// ===== File Upload =====
const MAX_FILE_COUNT = 20
const MAX_FILE_SIZE_MB = 20
const filePreviewUrls = ref<Record<string, string>>({})

async function handleCommonFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const rawFiles = Array.from(input.files)
  if (batchStore.commonDocuments.length + rawFiles.length > MAX_FILE_COUNT) {
    alert(`공통 서류는 최대 ${MAX_FILE_COUNT}장까지 가능합니다.`); input.value = ''; return
  }
  const files = await compressImages(rawFiles)
  const oversized = files.find(f => f.size > MAX_FILE_SIZE_MB * 1024 * 1024)
  if (oversized) { alert(`파일당 최대 ${MAX_FILE_SIZE_MB}MB까지 업로드 가능합니다.`); input.value = ''; return }
  for (const file of files) {
    batchStore.addCommonDocument(file)
    if (file.type.startsWith('image/')) {
      const lastDoc = batchStore.commonDocuments[batchStore.commonDocuments.length - 1]
      if (lastDoc) filePreviewUrls.value[lastDoc.id] = URL.createObjectURL(file)
    }
  }
  input.value = ''
}

async function handlePerClaimFileSelect(event: Event, entryIdx: number) {
  const input = event.target as HTMLInputElement
  if (!input.files) return
  const rawFiles = Array.from(input.files)
  const currentDocs = batchStore.perClaimDocuments[entryIdx] || []
  if (currentDocs.length + rawFiles.length > MAX_FILE_COUNT) {
    alert(`보험사별 서류는 최대 ${MAX_FILE_COUNT}장까지 가능합니다.`); input.value = ''; return
  }
  const files = await compressImages(rawFiles)
  for (const file of files) batchStore.addPerClaimDocument(entryIdx, file)
  input.value = ''
}

function isImageFile(name: string): boolean { return /\.(jpe?g|png|gif|webp|bmp|heic)$/i.test(name) }

function getFilePreview(file: File): string {
  const doc = batchStore.commonDocuments.find(d => d.file === file)
  if (doc && filePreviewUrls.value[doc.id]) return filePreviewUrls.value[doc.id]!
  const url = URL.createObjectURL(file)
  if (doc) filePreviewUrls.value[doc.id] = url
  return url
}

function getPerClaimDocs(entryIdx: number) { return batchStore.perClaimDocuments[entryIdx] || [] }

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
  canvas.width = rect.width * dpr; canvas.height = rect.height * dpr
  const ctx = canvas.getContext('2d')
  if (ctx) { ctx.scale(dpr, dpr); ctx.lineWidth = 2; ctx.lineCap = 'round'; ctx.strokeStyle = '#000000' }
}

function getPos(e: MouseEvent) {
  const canvas = signatureCanvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return { x: e.clientX - rect.left, y: e.clientY - rect.top }
}

function startDraw(e: MouseEvent) {
  isDrawing.value = true; hasDrawn.value = true
  const ctx = signatureCanvasRef.value?.getContext('2d')
  if (!ctx) return
  const pos = getPos(e); ctx.beginPath(); ctx.moveTo(pos.x, pos.y)
}

function onDraw(e: MouseEvent) {
  if (!isDrawing.value) return
  const ctx = signatureCanvasRef.value?.getContext('2d')
  if (!ctx) return
  const pos = getPos(e); ctx.lineTo(pos.x, pos.y); ctx.stroke()
}

function endDraw() { isDrawing.value = false }

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
  signatureDataUrl.value = ''; batchStore.applySignatureToAll('')
  nextTick(() => nextTick(() => initCanvas()))
}

// ===== Summary =====
function getSummaryForEntry(entryIndex: number) {
  const entry = batchStore.selectedEntries[entryIndex]
  if (!entry?.claimForm) return []
  const fields = batchStore.getFormFields(entry.claimForm)
  return fields.filter(f => f.field_type !== 'consent' && f.field_type !== 'signature')
    .map(f => ({ label: f.field_label, value: entry.fieldValues[f.form_field_id] || '' }))
}

function displayValue(val: string): string {
  if (val.startsWith('data:image/')) return '(서명)'
  if (val.startsWith('[')) { try { const arr = JSON.parse(val); if (Array.isArray(arr)) return arr.join(', ') } catch { /* */ } }
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
  if (currentStep.value === 10) return `${batchStore.selectedEntries.length}건 일괄 청구 제출`
  return '다음'
})

function handleCTA() {
  if (currentStep.value === 10) { handleSubmitBatch(); return }
  const idx = activeSteps.value.indexOf(currentStep.value)
  const next = activeSteps.value[idx + 1]
  if (next !== undefined) { currentStep.value = next; window.scrollTo(0, 0) }
}

function handleWizardBack() {
  const idx = activeSteps.value.indexOf(currentStep.value)
  if (idx > 0) {
    const prev = activeSteps.value[idx - 1]
    if (prev !== undefined) { currentStep.value = prev; window.scrollTo(0, 0) }
  } else {
    wizardEntered.value = false; setupStep.value = 2
  }
}

function handleHeaderBack() {
  if (wizardPhase.value) { handleWizardBack(); return }
  if (setupStep.value > 1) { setupStep.value--; return }
  router.back()
}

function goToFirstIncompleteStep() {
  for (const s of [2, 3, 4, 5, 6] as const) {
    if (!activeSteps.value.includes(s)) continue
    const fields = fieldsByStep.value[s]
    if (!fields || fields.length === 0) continue
    if (fields.some(f => f.isRequired && !batchStore.getUnifiedValue(f))) {
      currentStep.value = s; window.scrollTo(0, 0); return
    }
  }
  currentStep.value = 2; window.scrollTo(0, 0)
}

// ===== Field Helpers =====
function fieldToFormField(uf: UnifiedField): FormField {
  const first = uf.entries[0]
  return {
    form_field_id: first?.formFieldId ?? 0, claim_form_id: 0, field_name: uf.key,
    standard_field_code: uf.standardCode, field_label: uf.label, field_type: uf.fieldType,
    field_order: 0, is_required: uf.isRequired, field_options: uf.fieldOptions,
    x_position: 0, y_position: 0, width: 0, height: 0, font_size: 12, font_color: '#000',
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
      target.value = value; break
    case 'resident_number':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 6) value = value.slice(0, 6) + '-' + value.slice(6, 13)
      target.value = value; break
    case 'resident_number_front': value = value.replace(/[^0-9]/g, '').slice(0, 6); target.value = value; break
    case 'resident_number_back': value = value.replace(/[^0-9]/g, '').slice(0, 7); target.value = value; break
    case 'number': value = value.replace(/[^0-9]/g, ''); target.value = value; break
  }
  batchStore.setUnifiedValue(field, value)
}

// ===== Setup Phase Handlers =====
function handleCustomerSearch() {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => batchStore.searchCustomers(customerSearch.value), 400)
}

function handleSelectCustomer(customer: Customer) { batchStore.selectCustomer(customer) }
function clearCustomer() { batchStore.selectedCustomer = null; customerSearch.value = '' }

function getEntryForCompany(companyId: number) {
  return batchStore.selectedEntries.find(e => e.company.company_id === companyId)
}

function handleFormSelect(companyId: number, formId: number) {
  if (!formId) return
  const entry = getEntryForCompany(companyId)
  if (entry) batchStore.selectFormForEntry(entry, formId)
}

// ===== Draft & Submit =====
async function handleSaveDraft() {
  if (isDraftMode.value && batchStore.currentBatch) {
    const result = await batchStore.updateDraft(batchStore.currentBatch.batch_claim_id)
    if (result) toast.showToast('임시저장이 갱신되었습니다.')
  } else {
    const result = await batchStore.saveDraft()
    if (result) {
      isDraftMode.value = true; batchStore.currentBatch = result
      toast.showToast('임시저장되었습니다.')
      router.replace({ name: 'agent-batch-claim-edit', params: { batchId: result.batch_claim_id } })
    }
  }
}

async function handleSubmitBatch() {
  let result
  if (isDraftMode.value && batchStore.currentBatch) {
    result = await batchStore.submitDraft(batchStore.currentBatch.batch_claim_id)
  } else {
    result = await batchStore.createBatch()
  }

  if (result && result.claims && result.claims.length > 0) {
    const { uploadAgentClaimDocument } = await import('../../services/agentApi')
    for (let i = 0; i < batchStore.selectedEntries.length; i++) {
      const entry = batchStore.selectedEntries[i]
      if (!entry?.claimForm) continue
      const matchedClaim = result.claims.find((c: { claim_form_id?: number }) => c.claim_form_id === entry.claimForm!.claim_form_id)
      if (!matchedClaim) continue
      const claimId = matchedClaim.claim_id
      for (const doc of batchStore.commonDocuments) { try { await uploadAgentClaimDocument(claimId, doc.file) } catch { /* */ } }
      const perDocs = batchStore.perClaimDocuments[i] || []
      for (const doc of perDocs) { try { await uploadAgentClaimDocument(claimId, doc.file) } catch { /* */ } }
    }
    toast.showToast('일괄 제출이 완료되었습니다.')
    router.push({ name: 'agent-batch-claim-detail', params: { id: result.batch_claim_id } })
  } else if (result) {
    toast.showToast('일괄 제출이 완료되었습니다.')
    router.push({ name: 'agent-batch-claim-detail', params: { id: result.batch_claim_id } })
  }
}

// ===== Draft Restore =====
async function restoreDraft(batch: import('../../types').BatchClaim) {
  if (batch.customer) batchStore.selectedCustomer = batch.customer as Customer
  if (batch.claims && batch.claims.length > 0) {
    for (const claim of batch.claims) {
      const companyId = claim.claim_form?.company_id || claim.company_id
      if (!companyId) continue
      const company = batchStore.insuranceCompanies.find(c => c.company_id === companyId)
      if (!company) continue
      if (!batchStore.isCompanySelected(company.company_id)) batchStore.toggleCompany(company)
      const claimFormId = claim.claim_form?.claim_form_id || claim.claim_form_id
      if (claimFormId) {
        const entry = batchStore.selectedEntries.find(e => e.company.company_id === company.company_id)
        if (entry) {
          await batchStore.selectFormForEntry(entry, claimFormId)
          const claimWithValues = claim as unknown as { field_values?: Array<{ form_field_id: number; field_value: string }> }
          if (claimWithValues.field_values) {
            for (const fv of claimWithValues.field_values) entry.fieldValues[fv.form_field_id] = fv.field_value
          }
        }
      }
    }
    wizardEntered.value = true
  }
}

// ===== Lifecycle =====
async function autoAttachAssignmentFiles(): Promise<void> {
  const requestId = route.query.requestId as string | undefined
  if (!requestId) return
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

onMounted(async () => {
  if (fromSelect.value) {
    await batchStore.loadInsuranceCompanies()
    wizardEntered.value = true
    initialLoaded.value = true
    autoAttachAssignmentFiles()
    return
  }
  batchStore.resetBatchForm()
  await Promise.all([batchStore.loadInsuranceCompanies(), batchStore.searchCustomers('')])
  if (batchId.value) {
    const batch = await batchStore.loadBatchClaim(batchId.value)
    if (batch && batch.batch_status === 'draft') {
      isDraftMode.value = true; batchStore.currentBatch = batch
      await restoreDraft(batch)
    }
  }
  initialLoaded.value = true
})

onUnmounted(() => { if (searchTimeout) clearTimeout(searchTimeout) })

watch(currentStep, (step) => { if (step === 9) nextTick(() => initCanvas()) })
watch(signatureCanvasRef, (el) => { if (el) nextTick(() => initCanvas()) })
</script>
