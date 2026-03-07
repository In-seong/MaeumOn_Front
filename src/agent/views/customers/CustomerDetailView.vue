<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="customer?.name ?? '고객 상세'">
        <template #right>
          <div v-if="customer" class="relative">
            <button
              class="p-2 text-[#888] active:text-[#555]"
              @click="showMenu = !showMenu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
              </svg>
            </button>
            <Transition name="fade">
              <div
                v-if="showMenu"
                class="absolute right-0 top-10 bg-white rounded-[12px] shadow-[0_4px_20px_rgba(0,0,0,0.12)] py-1.5 z-50 min-w-[120px]"
              >
                <button
                  class="w-full text-left px-4 py-2.5 text-[13px] text-[#333] active:bg-[#F5F5F5]"
                  @click="handleStartEdit"
                >
                  정보 수정
                </button>
                <button
                  class="w-full text-left px-4 py-2.5 text-[13px] text-[#FF4444] active:bg-[#F5F5F5]"
                  @click="handleDelete"
                >
                  고객 삭제
                </button>
              </div>
            </Transition>
          </div>
        </template>
      </BackHeader>

      <main
        v-if="customer"
        class="px-5 overflow-y-auto pb-20"
        style="height: calc(100vh - 56px);"
        @click="showMenu = false"
      >
        <!-- Profile Card -->
        <CardSection class="mt-3">
          <div class="flex items-center gap-3">
            <div class="w-[52px] h-[52px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <span class="text-[20px] font-bold text-[#FF7B22]">
                {{ customer.name.charAt(0) }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[17px] font-bold text-[#222]">{{ customer.name }}</span>
              </div>
              <div class="flex items-center gap-2">
                <p class="text-[14px] text-[#888]">{{ customer.phone }}</p>
                <a
                  :href="'tel:' + customer.phone"
                  class="w-7 h-7 rounded-full bg-[#E8F5E9] flex items-center justify-center"
                  @click.stop
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </a>
                <a
                  :href="'sms:' + customer.phone"
                  class="w-7 h-7 rounded-full bg-[#E3F2FD] flex items-center justify-center"
                  @click.stop
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </a>
              </div>
              <p class="text-[11px] text-[#AAAAAA] mt-0.5">등록일 {{ formatDateTime(customer.created_at) }}</p>
            </div>
          </div>
        </CardSection>

        <!-- CTA: 보험금 청구하기 -->
        <button
          class="w-full mt-3 py-3 rounded-[12px] bg-[#FF7B22] text-white text-[14px] font-semibold shadow-[0_2px_10px_rgba(255,123,34,0.3)] active:bg-[#E56A1A] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          @click="goToClaim"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M14 2v6h6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            <path d="M12 18v-6M9 15h6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          보험금 청구하기
        </button>

        <!-- Tab Bar -->
        <div class="flex mt-4 mb-3 bg-white rounded-[12px] shadow-[0_0_6px_rgba(0,0,0,0.06)] overflow-hidden">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex-1 py-2.5 text-[13px] font-medium transition-all relative"
            :class="
              activeTab === tab.key
                ? 'text-[#FF7B22]'
                : 'text-[#AAAAAA]'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#FF7B22] rounded-full"
            />
          </button>
        </div>

        <!-- Tab Content -->

        <!-- 기본정보 Tab -->
        <div v-if="activeTab === 'info'">
          <!-- 수정 모드 -->
          <CardSection v-if="isEditing">
            <h4 class="text-[13px] font-semibold text-[#FF7B22] mb-3">정보 수정</h4>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">이름 *</label>
                <input
                  v-model="editForm.name"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">연락처 *</label>
                <input
                  :value="editForm.phone"
                  type="tel"
                  inputmode="numeric"
                  maxlength="13"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  @input="handleEditPhoneInput"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">주민등록번호</label>
                <input
                  :value="editForm.resident_number"
                  type="tel"
                  inputmode="numeric"
                  maxlength="14"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  @input="handleEditRrnInput"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">성별</label>
                <div class="flex gap-2">
                  <button
                    v-for="g in genderOptions"
                    :key="g.value"
                    type="button"
                    class="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium border transition-all"
                    :class="editForm.gender === g.value ? 'bg-[#FFF0E5] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                    @click="editForm.gender = editForm.gender === g.value ? '' : g.value"
                  >
                    {{ g.label }}
                  </button>
                </div>
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">생년월일</label>
                <input
                  v-model="editForm.birth_date"
                  type="date"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">이메일</label>
                <input
                  v-model="editForm.email"
                  type="email"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">주소</label>
                <input
                  v-model="editForm.address"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">상세주소</label>
                <input
                  v-model="editForm.detailed_address"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">직업</label>
                <input
                  v-model="editForm.job"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">통신사</label>
                <select
                  v-model="editForm.telecom"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
                >
                  <option value="">선택안함</option>
                  <option v-for="t in telecomOptions" :key="t" :value="t">{{ t }}</option>
                </select>
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">가입경로</label>
                <select
                  v-model="editForm.acquisition_channel"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
                >
                  <option value="">선택안함</option>
                  <option v-for="ch in channelOptions" :key="ch" :value="ch">{{ ch }}</option>
                </select>
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <button
                class="flex-1 py-2.5 rounded-[10px] border border-[#E0E0E0] text-[13px] text-[#666] font-medium active:bg-[#F5F5F5]"
                @click="cancelEdit"
              >
                취소
              </button>
              <button
                :disabled="editSaving"
                class="flex-1 py-2.5 rounded-[10px] bg-[#FF7B22] text-white text-[13px] font-medium active:bg-[#E56A1A] disabled:opacity-50"
                @click="handleSaveEdit"
              >
                {{ editSaving ? '저장 중...' : '저장' }}
              </button>
            </div>
          </CardSection>

          <!-- 읽기 모드 -->
          <CardSection v-else>
            <InfoRow label="연락처" :value="customer.phone" />
            <div class="flex items-center justify-between py-2 border-b border-[#F5F5F5] last:border-0">
              <span class="text-[13px] text-[#888]">주민등록번호</span>
              <div class="flex items-center gap-1.5">
                <span class="text-[13px] text-[#333]">{{ showRrn ? fullRrn : maskedRrn }}</span>
                <button
                  v-if="customer.resident_number"
                  type="button"
                  class="p-1 text-[#AAAAAA] active:text-[#FF7B22]"
                  @click="showRrn = !showRrn"
                >
                  <svg v-if="!showRrn" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <InfoRow label="성별" :value="genderLabel(customer.gender)" />
            <InfoRow label="생년월일" :value="customer.birth_date ? formatDate(customer.birth_date) : '-'" />
            <InfoRow label="이메일" :value="customer.email ?? '-'" />
            <InfoRow label="주소" :value="customer.address ?? '-'" />
            <InfoRow label="상세주소" :value="customer.detailed_address ?? '-'" />
            <InfoRow label="직업" :value="customer.job ?? '-'" />
            <InfoRow label="통신사" :value="customer.telecom ?? '-'" />
            <InfoRow label="가입경로" :value="customer.acquisition_channel ?? '-'" />
            <InfoRow label="등록일" :value="formatDateTime(customer.created_at)" />
          </CardSection>
        </div>

        <!-- 가입보험 Tab -->
        <div v-if="activeTab === 'contracts'" class="flex flex-col gap-2.5">
          <!-- 계약 추가 버튼 -->
          <button
            v-if="!showContractForm"
            class="w-full py-2.5 rounded-[12px] border-2 border-dashed border-[#E0E0E0] text-[13px] text-[#888] font-medium active:bg-[#F8F8F8] transition-colors flex items-center justify-center gap-1.5"
            @click="startContractAdd"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            보험 계약 추가
          </button>

          <!-- 계약 추가/수정 폼 -->
          <CardSection v-if="showContractForm">
            <h4 class="text-[13px] font-semibold text-[#FF7B22] mb-3">
              {{ editingContractId ? '계약 수정' : '계약 등록' }}
            </h4>
            <div class="flex flex-col gap-3">
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">보험사 *</label>
                <select
                  v-model="contractForm.company_id"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
                >
                  <option value="">선택해주세요</option>
                  <option v-for="c in insuranceCompanies" :key="c.company_id" :value="c.company_id">
                    {{ c.company_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">보험상품명 *</label>
                <input
                  v-model="contractForm.insurance_product"
                  type="text"
                  placeholder="예: 무배당 건강보험"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">증권번호</label>
                <input
                  v-model="contractForm.contract_number"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="text-[12px] text-[#888] mb-1 block">계약금액</label>
                  <input
                    v-model="contractForm.contract_amount"
                    type="number"
                    inputmode="numeric"
                    placeholder="원"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
                <div class="flex-1">
                  <label class="text-[12px] text-[#888] mb-1 block">체결일</label>
                  <input
                    v-model="contractForm.contract_date"
                    type="date"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">만기일</label>
                <input
                  v-model="contractForm.expiration_date"
                  type="date"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
              <div class="flex gap-2">
                <div class="flex-1">
                  <label class="text-[12px] text-[#888] mb-1 block">계약상태</label>
                  <select
                    v-model="contractForm.contract_status"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
                  >
                    <option v-for="s in contractStatusOptions" :key="s.value" :value="s.value">
                      {{ s.label }}
                    </option>
                  </select>
                </div>
                <div class="flex-1">
                  <label class="text-[12px] text-[#888] mb-1 block">납입방법</label>
                  <input
                    v-model="contractForm.payment_method"
                    type="text"
                    placeholder="예: 월납"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
              </div>
              <div>
                <label class="text-[12px] text-[#888] mb-1 block">비고</label>
                <input
                  v-model="contractForm.notes"
                  type="text"
                  class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>
            </div>
            <div class="flex gap-2 mt-4">
              <button
                class="flex-1 py-2.5 rounded-[10px] border border-[#E0E0E0] text-[13px] text-[#666] font-medium active:bg-[#F5F5F5]"
                @click="resetContractForm"
              >
                취소
              </button>
              <button
                :disabled="contractSaving"
                class="flex-1 py-2.5 rounded-[10px] bg-[#FF7B22] text-white text-[13px] font-medium active:bg-[#E56A1A] disabled:opacity-50"
                @click="handleSaveContract"
              >
                {{ contractSaving ? '저장 중...' : (editingContractId ? '수정' : '등록') }}
              </button>
            </div>
          </CardSection>

          <!-- 계약 목록 -->
          <CardSection v-for="contract in store.contracts" :key="contract.contract_id">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-[14px] font-semibold text-[#333]">{{ contract.insurance_product ?? '-' }}</p>
                <p class="text-[12px] text-[#AAAAAA] mt-0.5">{{ contract.insurance_company?.company_name ?? '-' }}</p>
              </div>
              <div class="flex items-center gap-1.5">
                <StatusBadge
                  v-if="contract.contract_status"
                  :label="contractStatusLabel(contract.contract_status)"
                  :variant="contractStatusVariant(contract.contract_status)"
                />
                <button
                  class="p-1.5 text-[#AAAAAA] active:text-[#FF7B22]"
                  @click="startContractEdit(contract)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                </button>
                <button
                  class="p-1.5 text-[#AAAAAA] active:text-[#FF4444]"
                  @click="handleDeleteContract(contract.contract_id)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            </div>
            <div class="border-t border-[#F5F5F5] pt-2 mt-1">
              <div v-if="contract.contract_number" class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">증권번호</span>
                <span class="text-[#666]">{{ contract.contract_number }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">계약금액</span>
                <span class="font-semibold text-[#333]">{{ contract.contract_amount ? formatCurrency(contract.contract_amount) + '원' : '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-[#AAAAAA]">체결일</span>
                <span class="text-[#666]">{{ contract.contract_date ?? '-' }}</span>
              </div>
              <div v-if="contract.expiration_date" class="flex items-center justify-between text-[12px] mt-1">
                <span class="text-[#AAAAAA]">만기일</span>
                <span class="text-[#666]">{{ contract.expiration_date }}</span>
              </div>
              <div v-if="contract.payment_method" class="flex items-center justify-between text-[12px] mt-1">
                <span class="text-[#AAAAAA]">납입방법</span>
                <span class="text-[#666]">{{ contract.payment_method }}</span>
              </div>
              <div v-if="contract.notes" class="flex items-center justify-between text-[12px] mt-1">
                <span class="text-[#AAAAAA]">비고</span>
                <span class="text-[#666]">{{ contract.notes }}</span>
              </div>
            </div>
          </CardSection>

          <div
            v-if="store.contracts.length === 0 && !showContractForm"
            class="flex flex-col items-center py-12"
          >
            <p class="text-[14px] text-[#AAAAAA]">가입된 보험이 없습니다</p>
          </div>
        </div>

        <!-- 청구이력 Tab -->
        <div v-if="activeTab === 'claims'" class="flex flex-col gap-2.5">
          <CardSection
            v-for="claim in store.claims"
            :key="claim.claim_id"
            class="cursor-pointer active:bg-[#FAFAFA]"
            @click="goToClaimDetail(claim.claim_id)"
          >
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-[14px] font-semibold text-[#333]">
                  {{ claim.claim_form?.insurance_company?.company_name ?? claim.claim_form?.form_name ?? '-' }}
                </p>
                <p class="text-[12px] text-[#AAAAAA] mt-0.5">
                  #{{ claim.claim_id }} · {{ formatDate(claim.claim_date ?? claim.created_at) }}
                </p>
              </div>
              <StatusBadge
                :label="claimStatusLabel(claim.claim_status)"
                :variant="claimStatusVariant(claim.claim_status)"
              />
            </div>
            <div class="border-t border-[#F5F5F5] pt-2 mt-1">
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">청구금액</span>
                <span class="font-semibold text-[#333]">{{ claim.claim_amount ? formatCurrency(claim.claim_amount) + '원' : '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-[#AAAAAA]">팩스</span>
                <span :class="faxStatusColor(claim.fax_status)">{{ faxStatusLabel(claim.fax_status) }}</span>
              </div>
            </div>
          </CardSection>

          <div
            v-if="store.claims.length === 0"
            class="flex flex-col items-center py-12"
          >
            <p class="text-[14px] text-[#AAAAAA]">청구 이력이 없습니다</p>
          </div>
        </div>

        <!-- 메모 Tab -->
        <div v-if="activeTab === 'memos'">
          <!-- Sort Toggle -->
          <div v-if="store.memos.length > 0" class="flex items-center justify-between mb-3">
            <span class="text-[13px] text-[#888]">총 <span class="font-semibold text-[#FF7B22]">{{ store.memos.length }}</span>건</span>
            <button
              class="flex items-center gap-1 text-[12px] text-[#888] bg-white border border-[#E0E0E0] rounded-full px-3 py-1.5 active:bg-[#F5F5F5] transition-colors"
              @click="toggleMemoSort"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path v-if="memoSortOrder === 'desc'" d="M12 5v14M19 12l-7 7-7-7" />
                <path v-else d="M12 19V5M5 12l7-7 7 7" />
              </svg>
              {{ memoSortOrder === 'desc' ? '최신순' : '오래된순' }}
            </button>
          </div>

          <!-- Memo List -->
          <div class="flex flex-col gap-2.5 mb-4">
            <CardSection v-for="memo in sortedMemos" :key="memo.memo_id">
              <!-- 수정 모드 -->
              <div v-if="editingMemoId === memo.memo_id">
                <input
                  v-model="editMemoTitle"
                  type="text"
                  placeholder="제목 (선택)"
                  class="w-full bg-[#F8F8F8] rounded-[8px] px-3 py-2 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] mb-2 text-[#333]"
                />
                <textarea
                  v-model="editMemoContent"
                  rows="3"
                  class="w-full bg-[#F8F8F8] rounded-[8px] px-3 py-2 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] resize-none text-[#333]"
                />
                <div class="flex gap-2 mt-2">
                  <button
                    class="flex-1 py-2 rounded-[8px] border border-[#E0E0E0] text-[12px] text-[#666] active:bg-[#F5F5F5]"
                    @click="cancelMemoEdit"
                  >
                    취소
                  </button>
                  <button
                    class="flex-1 py-2 rounded-[8px] bg-[#FF7B22] text-white text-[12px] active:bg-[#E56A1A]"
                    @click="handleSaveMemoEdit(memo.memo_id)"
                  >
                    저장
                  </button>
                </div>
              </div>
              <!-- 읽기 모드 -->
              <div v-else>
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <p v-if="memo.title" class="text-[14px] font-semibold text-[#333] mb-1">{{ memo.title }}</p>
                    <p class="text-[13px] text-[#333] leading-[1.6]">{{ memo.content }}</p>
                    <p class="text-[11px] text-[#AAAAAA] mt-2">{{ formatDate(memo.memo_date) }}</p>
                  </div>
                  <div class="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      class="p-1.5 text-[#AAAAAA] active:text-[#FF7B22]"
                      @click="startMemoEdit(memo)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      class="p-1.5 text-[#AAAAAA] active:text-[#FF4444]"
                      @click="handleDeleteMemo(memo.memo_id)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </CardSection>

            <div
              v-if="store.memos.length === 0"
              class="flex flex-col items-center py-8"
            >
              <p class="text-[14px] text-[#AAAAAA]">작성된 메모가 없습니다</p>
            </div>
          </div>

          <!-- Add Memo Form -->
          <CardSection>
            <h4 class="text-[13px] font-semibold text-[#333] mb-3">메모 추가</h4>
            <input
              v-model="newMemoTitle"
              type="text"
              placeholder="제목 (선택)"
              class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] mb-2"
            />
            <FormTextarea
              v-model="newMemoContent"
              placeholder="메모를 입력하세요"
              :rows="3"
            />
            <div class="flex items-center gap-3 mt-3">
              <input
                v-model="newMemoDate"
                type="date"
                class="flex-1 bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
              <ActionButton @click="handleAddMemo">
                저장
              </ActionButton>
            </div>
          </CardSection>
        </div>
      </main>

      <!-- Loading / Not Found -->
      <div
        v-if="!customer && !store.loading"
        class="flex items-center justify-center"
        style="height: calc(100vh - 56px);"
      >
        <p class="text-[14px] text-[#AAAAAA]">고객 정보를 찾을 수 없습니다</p>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center" style="height: calc(100vh - 56px);">
        <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useCustomerStore } from '../../stores/customerStore'
import { useToast } from '../../composables/useToast'
import { fetchInsuranceCompanies } from '../../services/agentApi'
import type { Memo, Contract } from '../../types'
import type { InsuranceCompany } from '@shared/types'

type TabKey = 'info' | 'contracts' | 'claims' | 'memos'

interface Tab {
  key: TabKey
  label: string
}

const route = useRoute()
const router = useRouter()
const store = useCustomerStore()
const toast = useToast()

const activeTab = ref<TabKey>('info')
const showMenu = ref(false)
const showRrn = ref(false)
const memoSortOrder = ref<'desc' | 'asc'>('desc')

// ===== 메모 추가 =====
const newMemoTitle = ref('')
const newMemoContent = ref('')
const newMemoDate = ref(new Date().toISOString().slice(0, 10))

// ===== 메모 수정 =====
const editingMemoId = ref<number | null>(null)
const editMemoTitle = ref('')
const editMemoContent = ref('')

// ===== 계약 관련 =====
const insuranceCompanies = ref<InsuranceCompany[]>([])
const showContractForm = ref(false)
const editingContractId = ref<number | null>(null)
const contractSaving = ref(false)
const contractForm = ref({
  company_id: '' as string | number,
  insurance_product: '',
  contract_number: '',
  contract_amount: '',
  contract_date: '',
  expiration_date: '',
  contract_status: 'active',
  payment_method: '',
  notes: '',
})

const contractStatusOptions = [
  { value: 'active', label: '유지중' },
  { value: 'expired', label: '만기' },
  { value: 'cancelled', label: '해지' },
] as const

function resetContractForm(): void {
  contractForm.value = {
    company_id: '',
    insurance_product: '',
    contract_number: '',
    contract_amount: '',
    contract_date: '',
    expiration_date: '',
    contract_status: 'active',
    payment_method: '',
    notes: '',
  }
  editingContractId.value = null
  showContractForm.value = false
}

function startContractAdd(): void {
  resetContractForm()
  showContractForm.value = true
  editingContractId.value = null
}

function startContractEdit(contract: Contract): void {
  editingContractId.value = contract.contract_id
  contractForm.value = {
    company_id: contract.company_id ?? '',
    insurance_product: contract.insurance_product ?? '',
    contract_number: contract.contract_number ?? '',
    contract_amount: contract.contract_amount ?? '',
    contract_date: contract.contract_date ?? '',
    expiration_date: contract.expiration_date ?? '',
    contract_status: contract.contract_status ?? 'active',
    payment_method: contract.payment_method ?? '',
    notes: contract.notes ?? '',
  }
  showContractForm.value = true
}

async function handleSaveContract(): Promise<void> {
  if (!contractForm.value.insurance_product.trim()) {
    toast.showToast('보험상품명은 필수입니다.', 'error')
    return
  }
  if (!contractForm.value.company_id) {
    toast.showToast('보험사를 선택해주세요.', 'error')
    return
  }
  contractSaving.value = true
  try {
    const payload = {
      company_id: Number(contractForm.value.company_id),
      insurance_product: contractForm.value.insurance_product.trim(),
      contract_number: contractForm.value.contract_number.trim() || undefined,
      contract_amount: contractForm.value.contract_amount ? Number(contractForm.value.contract_amount) : undefined,
      contract_date: contractForm.value.contract_date || undefined,
      expiration_date: contractForm.value.expiration_date || undefined,
      contract_status: contractForm.value.contract_status,
      payment_method: contractForm.value.payment_method.trim() || undefined,
      notes: contractForm.value.notes.trim() || undefined,
    }
    if (editingContractId.value) {
      await store.editContract(customerId.value, editingContractId.value, payload)
      toast.showToast('계약이 수정되었습니다.')
    } else {
      await store.addContract(customerId.value, payload)
      toast.showToast('계약이 등록되었습니다.')
    }
    resetContractForm()
  } catch {
    toast.showToast(store.error ?? '계약 저장에 실패했습니다.', 'error')
  } finally {
    contractSaving.value = false
  }
}

async function handleDeleteContract(contractId: number): Promise<void> {
  if (!confirm('이 계약을 삭제하시겠습니까?')) return
  try {
    await store.removeContract(customerId.value, contractId)
    toast.showToast('계약이 삭제되었습니다.')
  } catch {
    toast.showToast(store.error ?? '계약 삭제에 실패했습니다.', 'error')
  }
}

// ===== 고객 정보 수정 =====
const isEditing = ref(false)
const editSaving = ref(false)
const editForm = ref({
  name: '',
  phone: '',
  resident_number: '',
  gender: '',
  birth_date: '',
  email: '',
  address: '',
  detailed_address: '',
  job: '',
  telecom: '',
  acquisition_channel: '',
})

const genderOptions = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
] as const

const telecomOptions = ['SKT', 'KT', 'LGU+', 'SKT 알뜰', 'KT 알뜰', 'LGU+ 알뜰'] as const
const channelOptions = ['DB배분', '지인소개', '온라인', '텔레마케팅', '방문상담', '기타'] as const

const tabs: Tab[] = [
  { key: 'info', label: '기본정보' },
  { key: 'contracts', label: '가입보험' },
  { key: 'claims', label: '청구이력' },
  { key: 'memos', label: '메모' },
]

const customerId = computed(() => String(route.params.id))
const customer = computed(() => store.selectedCustomer)

const maskedRrn = computed(() => {
  const rrn = customer.value?.resident_number
  if (!rrn) return '-'
  const raw = rrn.replace(/-/g, '')
  if (raw.length <= 6) return raw
  return `${raw.slice(0, 6)}-${raw.charAt(6)}******`
})

const fullRrn = computed(() => {
  const rrn = customer.value?.resident_number
  if (!rrn) return '-'
  const raw = rrn.replace(/-/g, '')
  if (raw.length <= 6) return raw
  return `${raw.slice(0, 6)}-${raw.slice(6)}`
})

const sortedMemos = computed(() => {
  const list = [...store.memos]
  list.sort((a, b) => {
    const dateA = a.memo_date ?? a.created_at ?? ''
    const dateB = b.memo_date ?? b.created_at ?? ''
    return memoSortOrder.value === 'desc'
      ? dateB.localeCompare(dateA)
      : dateA.localeCompare(dateB)
  })
  return list
})

function toggleMemoSort(): void {
  memoSortOrder.value = memoSortOrder.value === 'desc' ? 'asc' : 'desc'
}

onMounted(async () => {
  const [, companiesRes] = await Promise.all([
    store.loadCustomer(customerId.value),
    fetchInsuranceCompanies().catch(() => null),
  ])
  if (companiesRes) {
    insuranceCompanies.value = companiesRes.data.data
  }
})

watch(() => route.params.id, async (newId) => {
  if (newId) {
    activeTab.value = 'info'
    showRrn.value = false
    isEditing.value = false
    editingMemoId.value = null
    await store.loadCustomer(String(newId))
  }
})

// ===== 고객 정보 수정 =====
function handleStartEdit(): void {
  showMenu.value = false
  if (!customer.value) return
  editForm.value = {
    name: customer.value.name,
    phone: customer.value.phone ?? '',
    resident_number: customer.value.resident_number ?? '',
    gender: customer.value.gender ?? '',
    birth_date: customer.value.birth_date ?? '',
    email: customer.value.email ?? '',
    address: customer.value.address ?? '',
    detailed_address: customer.value.detailed_address ?? '',
    job: customer.value.job ?? '',
    telecom: customer.value.telecom ?? '',
    acquisition_channel: customer.value.acquisition_channel ?? '',
  }
  isEditing.value = true
  activeTab.value = 'info'
}

function cancelEdit(): void {
  isEditing.value = false
}

function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function formatResidentNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 6)}-${digits.slice(6)}`
}

function handleEditPhoneInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const formatted = formatPhone(input.value)
  editForm.value.phone = formatted
  input.value = formatted
}

function handleEditRrnInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const formatted = formatResidentNumber(input.value)
  editForm.value.resident_number = formatted
  input.value = formatted
}

async function handleSaveEdit(): Promise<void> {
  if (!editForm.value.name.trim() || !editForm.value.phone.trim()) {
    toast.showToast('이름과 연락처는 필수입니다.', 'error')
    return
  }
  editSaving.value = true
  try {
    await store.editCustomer(customerId.value, {
      name: editForm.value.name.trim(),
      phone: editForm.value.phone.trim(),
      resident_number: editForm.value.resident_number || undefined,
      gender: editForm.value.gender || undefined,
      birth_date: editForm.value.birth_date || undefined,
      email: editForm.value.email || undefined,
      address: editForm.value.address || undefined,
      detailed_address: editForm.value.detailed_address || undefined,
      job: editForm.value.job || undefined,
      telecom: editForm.value.telecom || undefined,
      acquisition_channel: editForm.value.acquisition_channel || undefined,
    })
    isEditing.value = false
    toast.showToast('고객 정보가 수정되었습니다.')
  } catch {
    toast.showToast(store.error ?? '수정에 실패했습니다.', 'error')
  } finally {
    editSaving.value = false
  }
}

// ===== 고객 삭제 =====
async function handleDelete(): Promise<void> {
  showMenu.value = false
  if (!confirm('이 고객을 삭제하시겠습니까?')) return
  try {
    await store.removeCustomer(customerId.value)
    toast.showToast('고객이 삭제되었습니다.')
    router.replace({ name: 'customer-list' })
  } catch {
    toast.showToast(store.error ?? '삭제에 실패했습니다.', 'error')
  }
}

// ===== 메모 추가 =====
async function handleAddMemo(): Promise<void> {
  if (!newMemoContent.value.trim()) return
  try {
    await store.addMemo(customerId.value, {
      title: newMemoTitle.value.trim() || undefined,
      content: newMemoContent.value.trim(),
      memo_date: newMemoDate.value,
    })
    newMemoTitle.value = ''
    newMemoContent.value = ''
    newMemoDate.value = new Date().toISOString().slice(0, 10)
    toast.showToast('메모가 추가되었습니다.')
  } catch {
    toast.showToast(store.error ?? '메모 추가에 실패했습니다.', 'error')
  }
}

// ===== 메모 수정 =====
function startMemoEdit(memo: Memo): void {
  editingMemoId.value = memo.memo_id
  editMemoTitle.value = memo.title ?? ''
  editMemoContent.value = memo.content
}

function cancelMemoEdit(): void {
  editingMemoId.value = null
}

async function handleSaveMemoEdit(memoId: number): Promise<void> {
  if (!editMemoContent.value.trim()) return
  try {
    await store.editMemo(memoId, {
      title: editMemoTitle.value.trim() || undefined,
      content: editMemoContent.value.trim(),
    })
    editingMemoId.value = null
    toast.showToast('메모가 수정되었습니다.')
  } catch {
    toast.showToast(store.error ?? '메모 수정에 실패했습니다.', 'error')
  }
}

// ===== 메모 삭제 =====
async function handleDeleteMemo(memoId: number): Promise<void> {
  if (!confirm('이 메모를 삭제하시겠습니까?')) return
  try {
    await store.removeMemo(memoId)
    toast.showToast('메모가 삭제되었습니다.')
  } catch {
    toast.showToast(store.error ?? '메모 삭제에 실패했습니다.', 'error')
  }
}

// ===== Helpers =====
function formatDate(value?: string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDateTime(value?: string): string {
  if (!value) return '-'
  const d = new Date(value)
  if (isNaN(d.getTime())) return value
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mi = String(d.getMinutes()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}`
}

function formatCurrency(value: string): string {
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('ko-KR')
}

function genderLabel(gender?: string | null): string {
  if (!gender) return '-'
  const map: Record<string, string> = { M: '남성', F: '여성', OTHER: '기타' }
  return map[gender] ?? '-'
}

function contractStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: '유지중',
    expired: '만기',
    cancelled: '해지',
  }
  return map[status] ?? status
}

function contractStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    active: 'success',
    expired: 'warning',
    cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

// ===== 청구이력 Helpers =====
function claimStatusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: '임시저장',
    pending: '접수 대기',
    processing: '처리중',
    approved: '승인',
    rejected: '거절',
    paid: '지급 완료',
  }
  return map[status] ?? status
}

function claimStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    draft: 'default',
    pending: 'warning',
    processing: 'warning',
    approved: 'success',
    rejected: 'danger',
    paid: 'success',
  }
  return map[status] ?? 'default'
}

function faxStatusLabel(status?: string | null): string {
  if (!status) return '미발송'
  const map: Record<string, string> = {
    pending: '대기중',
    sending: '발송중',
    sent: '발송 완료',
    failed: '발송 실패',
  }
  return map[status] ?? status
}

function faxStatusColor(status?: string | null): string {
  if (!status) return 'text-[#AAAAAA]'
  const map: Record<string, string> = {
    pending: 'text-[#AAAAAA]',
    sending: 'text-[#FF9800]',
    sent: 'text-[#4CAF50]',
    failed: 'text-[#FF4444]',
  }
  return map[status] ?? 'text-[#AAAAAA]'
}

function goToClaimDetail(claimId: number): void {
  router.push({ name: 'agent-claim-detail', params: { id: claimId } })
}

function goToClaim(): void {
  router.push({ name: 'agent-claim-select', query: { customerId: customerId.value } })
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
