<template>
  <div class="p-6">
    <!-- 뒤로가기 + 타이틀 + 액션 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button
          class="text-[14px] text-[#888] hover:text-[#FF7B22] transition-colors"
          @click="router.push({ name: 'customer-list' })"
        >
          &larr; 고객 목록
        </button>
        <h1 class="text-[20px] font-bold text-[#333]">{{ customer?.name ?? '고객 상세' }}</h1>
      </div>
      <div v-if="customer" class="flex items-center gap-2">
        <button
          class="px-4 py-2 text-[13px] text-[#555] border border-[#E0E0E0] rounded-[10px] hover:bg-[#F5F5F5] transition-colors"
          @click="handleStartEdit"
        >
          정보 수정
        </button>
        <button
          class="px-4 py-2 text-[13px] text-[#FF4444] border border-[#FFCCCC] rounded-[10px] hover:bg-[#FFF0F0] transition-colors"
          @click="handleDelete"
        >
          고객 삭제
        </button>
      </div>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading" class="flex items-center justify-center py-20">
      <p class="text-[14px] text-[#BBB]">불러오는 중...</p>
    </div>

    <!-- Not Found -->
    <div v-else-if="!customer" class="flex items-center justify-center py-20">
      <p class="text-[14px] text-[#AAAAAA]">고객 정보를 찾을 수 없습니다</p>
    </div>

    <!-- 메인 콘텐츠 -->
    <div v-else>
      <!-- 프로필 카드 + CTA -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- 프로필 카드 -->
        <div class="lg:col-span-2 bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-4">
            <div class="w-[56px] h-[56px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <span class="text-[22px] font-bold text-[#FF7B22]">
                {{ customer.name.charAt(0) }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-3 mb-1">
                <span class="text-[18px] font-bold text-[#222]">{{ customer.name }}</span>
              </div>
              <div class="flex items-center gap-3">
                <p class="text-[14px] text-[#888]">{{ customer.phone }}</p>
                <a
                  :href="'tel:' + customer.phone"
                  class="w-8 h-8 rounded-full bg-[#E8F5E9] flex items-center justify-center hover:bg-[#C8E6C9] transition-colors"
                  title="전화걸기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                </a>
                <a
                  :href="'sms:' + customer.phone"
                  class="w-8 h-8 rounded-full bg-[#E3F2FD] flex items-center justify-center hover:bg-[#BBDEFB] transition-colors"
                  title="문자보내기"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2196F3" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
                </a>
              </div>
              <p class="text-[12px] text-[#AAAAAA] mt-1">등록일 {{ formatDateTime(customer.created_at) }}</p>
            </div>
          </div>
        </div>

        <!-- 보험금 청구하기 CTA -->
        <div class="bg-white rounded-xl border border-[#E8E8E8] p-5 flex flex-col justify-center">
          <button
            class="w-full py-3.5 rounded-[12px] bg-[#FF7B22] text-white text-[14px] font-semibold hover:bg-[#E56D1E] transition-colors flex items-center justify-center gap-2"
            @click="goToClaim"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M14 2v6h6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M12 18v-6M9 15h6" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            보험금 청구하기
          </button>
          <p class="text-[12px] text-[#AAAAAA] text-center mt-2">새로운 보험금 청구를 등록합니다</p>
        </div>
      </div>

      <!-- 탭 바 -->
      <div class="flex mb-6 bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          class="flex-1 py-3 text-[14px] font-medium transition-all relative hover:bg-[#FAFAFA]"
          :class="activeTab === tab.key ? 'text-[#FF7B22]' : 'text-[#AAAAAA]'"
          @click="activeTab = tab.key"
        >
          {{ tab.label }}
          <div
            v-if="activeTab === tab.key"
            class="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-[2px] bg-[#FF7B22] rounded-full"
          />
        </button>
      </div>

      <!-- ==================== 기본정보 탭 ==================== -->
      <div v-if="activeTab === 'info'">
        <!-- 수정 모드 -->
        <div v-if="isEditing" class="bg-white rounded-xl border border-[#E8E8E8] p-5 max-w-[900px]">
          <h4 class="text-[15px] font-semibold text-[#FF7B22] mb-5">정보 수정</h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">이름 *</label>
              <input
                v-model="editForm.name"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">연락처 *</label>
              <input
                :value="editForm.phone"
                type="tel"
                inputmode="numeric"
                maxlength="13"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                @input="handleEditPhoneInput"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">주민등록번호</label>
              <input
                :value="editForm.resident_number"
                type="tel"
                inputmode="numeric"
                maxlength="14"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                @input="handleEditRrnInput"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">성별</label>
              <div class="flex gap-2">
                <button
                  v-for="g in genderOptions"
                  :key="g.value"
                  type="button"
                  class="flex-1 py-2.5 rounded-[10px] text-[13px] font-medium border transition-all hover:opacity-80"
                  :class="editForm.gender === g.value ? 'bg-[#FFF0E5] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                  @click="editForm.gender = editForm.gender === g.value ? '' : g.value"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">생년월일</label>
              <input
                v-model="editForm.birth_date"
                type="date"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">이메일</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">주소</label>
              <input
                v-model="editForm.address"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">상세주소</label>
              <input
                v-model="editForm.detailed_address"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">직업</label>
              <input
                v-model="editForm.job"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">통신사</label>
              <select
                v-model="editForm.telecom"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option value="">선택안함</option>
                <option v-for="t in telecomOptions" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">가입경로</label>
              <select
                v-model="editForm.acquisition_channel"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option value="">선택안함</option>
                <option v-for="ch in channelOptions" :key="ch" :value="ch">{{ ch }}</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <button
              class="px-5 py-2.5 rounded-[10px] border border-[#E0E0E0] text-[13px] text-[#666] font-medium hover:bg-[#F5F5F5] transition-colors"
              @click="cancelEdit"
            >
              취소
            </button>
            <button
              :disabled="editSaving"
              class="px-5 py-2.5 rounded-[10px] bg-[#FF7B22] text-white text-[13px] font-medium hover:bg-[#E56D1E] disabled:opacity-50 transition-colors"
              @click="handleSaveEdit"
            >
              {{ editSaving ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>

        <!-- 읽기 모드: 2컬럼 그리드 -->
        <div v-else class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
            <h4 class="text-[14px] font-semibold text-[#333] mb-3">개인 정보</h4>
            <InfoRow label="연락처" :value="customer.phone" />
            <div class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-0">
              <span class="text-[13px] text-[#888]">주민등록번호</span>
              <div class="flex items-center gap-2">
                <span class="text-[13px] text-[#333]">{{ showRrn && fullRrnData ? fullRrn : maskedRrn }}</span>
                <button
                  v-if="customer.resident_number_masked"
                  type="button"
                  class="p-1 text-[#AAAAAA] hover:text-[#FF7B22] transition-colors"
                  :disabled="rrnLoading"
                  @click="toggleRrn"
                >
                  <svg v-if="!showRrn" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 01-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                </button>
              </div>
            </div>
            <InfoRow label="성별" :value="genderLabel(customer.gender)" />
            <InfoRow label="생년월일" :value="customer.birth_date ? formatDate(customer.birth_date) : '-'" />
            <InfoRow label="이메일" :value="customer.email ?? '-'" />
          </div>
          <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
            <h4 class="text-[14px] font-semibold text-[#333] mb-3">추가 정보</h4>
            <InfoRow label="주소" :value="customer.address ?? '-'" />
            <InfoRow label="상세주소" :value="customer.detailed_address ?? '-'" />
            <InfoRow label="직업" :value="customer.job ?? '-'" />
            <InfoRow label="통신사" :value="customer.telecom ?? '-'" />
            <InfoRow label="가입경로" :value="customer.acquisition_channel ?? '-'" />
            <InfoRow label="등록일" :value="formatDateTime(customer.created_at)" />
          </div>
        </div>
      </div>

      <!-- ==================== 가입보험 탭 ==================== -->
      <div v-if="activeTab === 'contracts'">
        <!-- 계약 추가 버튼 -->
        <div class="flex justify-end mb-4">
          <button
            v-if="!showContractForm"
            class="px-4 py-2.5 border-2 border-dashed border-[#E0E0E0] text-[13px] text-[#888] font-medium rounded-[12px] hover:border-[#FF7B22] hover:text-[#FF7B22] transition-colors flex items-center gap-1.5"
            @click="startContractAdd"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            보험 계약 추가
          </button>
        </div>

        <!-- 계약 추가/수정 폼 -->
        <div v-if="showContractForm" class="bg-white rounded-xl border border-[#E8E8E8] p-5 mb-6 max-w-[900px]">
          <h4 class="text-[15px] font-semibold text-[#FF7B22] mb-5">
            {{ editingContractId ? '계약 수정' : '계약 등록' }}
          </h4>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">보험사 *</label>
              <select
                v-model="contractForm.company_id"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option value="">선택해주세요</option>
                <option v-for="c in insuranceCompanies" :key="c.company_id" :value="c.company_id">
                  {{ c.company_name }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">보험상품명 *</label>
              <input
                v-model="contractForm.insurance_product"
                type="text"
                placeholder="예: 무배당 건강보험"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">증권번호</label>
              <input
                v-model="contractForm.contract_number"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">계약금액</label>
              <input
                v-model="contractForm.contract_amount"
                type="number"
                inputmode="numeric"
                placeholder="원"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">체결일</label>
              <input
                v-model="contractForm.contract_date"
                type="date"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">만기일</label>
              <input
                v-model="contractForm.expiration_date"
                type="date"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">계약상태</label>
              <select
                v-model="contractForm.contract_status"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option v-for="s in contractStatusOptions" :key="s.value" :value="s.value">
                  {{ s.label }}
                </option>
              </select>
            </div>
            <div>
              <label class="text-[13px] text-[#888] mb-1 block">납입방법</label>
              <input
                v-model="contractForm.payment_method"
                type="text"
                placeholder="예: 월납"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <div class="md:col-span-2">
              <label class="text-[13px] text-[#888] mb-1 block">비고</label>
              <input
                v-model="contractForm.notes"
                type="text"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
          </div>
          <div class="flex justify-end gap-2 mt-5">
            <button
              class="px-5 py-2.5 rounded-[10px] border border-[#E0E0E0] text-[13px] text-[#666] font-medium hover:bg-[#F5F5F5] transition-colors"
              @click="resetContractForm"
            >
              취소
            </button>
            <button
              :disabled="contractSaving"
              class="px-5 py-2.5 rounded-[10px] bg-[#FF7B22] text-white text-[13px] font-medium hover:bg-[#E56D1E] disabled:opacity-50 transition-colors"
              @click="handleSaveContract"
            >
              {{ contractSaving ? '저장 중...' : (editingContractId ? '수정' : '등록') }}
            </button>
          </div>
        </div>

        <!-- 계약 목록 테이블 -->
        <div v-if="store.contracts.length > 0" class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">보험상품</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">보험사</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">증권번호</th>
                <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">계약금액</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden lg:table-cell">체결일</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden lg:table-cell">만기일</th>
                <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999] uppercase">상태</th>
                <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999] uppercase">관리</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F0F0F0]">
              <tr
                v-for="contract in store.contracts"
                :key="contract.contract_id"
                class="hover:bg-[#FAFAFA] transition-colors"
              >
                <td class="px-5 py-3.5 text-[13px] font-medium text-[#333]">{{ contract.insurance_product ?? '-' }}</td>
                <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ contract.insurance_company?.company_name ?? '-' }}</td>
                <td class="px-5 py-3.5 text-[13px] text-[#666] hidden md:table-cell">{{ contract.contract_number ?? '-' }}</td>
                <td class="px-5 py-3.5 text-[13px] font-semibold text-[#333] text-right">{{ contract.contract_amount ? formatCurrency(contract.contract_amount) + '원' : '-' }}</td>
                <td class="px-5 py-3.5 text-[13px] text-[#666] hidden lg:table-cell">{{ contract.contract_date ?? '-' }}</td>
                <td class="px-5 py-3.5 text-[13px] text-[#666] hidden lg:table-cell">{{ contract.expiration_date ?? '-' }}</td>
                <td class="px-5 py-3.5 text-center">
                  <StatusBadge
                    v-if="contract.contract_status"
                    :label="contractStatusLabel(contract.contract_status)"
                    :variant="contractStatusVariant(contract.contract_status)"
                  />
                </td>
                <td class="px-5 py-3.5 text-center">
                  <div class="flex items-center justify-center gap-1">
                    <button
                      class="p-1.5 text-[#AAAAAA] hover:text-[#FF7B22] transition-colors"
                      title="수정"
                      @click="startContractEdit(contract)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button
                      class="p-1.5 text-[#AAAAAA] hover:text-[#FF4444] transition-colors"
                      title="삭제"
                      @click="handleDeleteContract(contract.contract_id)"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="store.contracts.length === 0 && !showContractForm"
          class="flex flex-col items-center py-16"
        >
          <p class="text-[14px] text-[#AAAAAA]">가입된 보험이 없습니다</p>
        </div>
      </div>

      <!-- ==================== 청구이력 탭 ==================== -->
      <div v-if="activeTab === 'claims'">
        <div v-if="store.claims.length > 0" class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">No.</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">보험사 / 청구서</th>
                <th class="px-5 py-3 text-left text-[12px] font-medium text-[#999] uppercase">청구일</th>
                <th class="px-5 py-3 text-right text-[12px] font-medium text-[#999] uppercase">청구금액</th>
                <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999] uppercase">청구상태</th>
                <th class="px-5 py-3 text-center text-[12px] font-medium text-[#999] uppercase">팩스</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F0F0F0]">
              <tr
                v-for="claim in store.claims"
                :key="claim.claim_id"
                class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
                @click="goToClaimDetail(claim.claim_id)"
              >
                <td class="px-5 py-3.5 text-[13px] text-[#999]">#{{ claim.claim_id }}</td>
                <td class="px-5 py-3.5">
                  <p class="text-[13px] font-medium text-[#333]">
                    {{ claim.claim_form?.insurance_company?.company_name ?? claim.claim_form?.form_name ?? '-' }}
                  </p>
                </td>
                <td class="px-5 py-3.5 text-[13px] text-[#666]">{{ formatDate(claim.claim_date ?? claim.created_at) }}</td>
                <td class="px-5 py-3.5 text-[13px] font-semibold text-[#333] text-right">{{ claim.claim_amount ? formatCurrency(claim.claim_amount) + '원' : '-' }}</td>
                <td class="px-5 py-3.5 text-center">
                  <StatusBadge
                    :label="claimStatusLabel(claim.claim_status)"
                    :variant="claimStatusVariant(claim.claim_status)"
                  />
                </td>
                <td class="px-5 py-3.5 text-center">
                  <span :class="faxStatusColor(claim.fax_status)" class="text-[12px]">{{ faxStatusLabel(claim.fax_status) }}</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div
          v-if="store.claims.length === 0"
          class="flex flex-col items-center py-16"
        >
          <p class="text-[14px] text-[#AAAAAA]">청구 이력이 없습니다</p>
        </div>
      </div>

      <!-- ==================== 메모 탭 ==================== -->
      <div v-if="activeTab === 'memos'">
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 메모 목록 (2컬럼) -->
          <div class="lg:col-span-2">
            <!-- 정렬 토글 -->
            <div v-if="store.memos.length > 0" class="flex items-center justify-between mb-4">
              <span class="text-[13px] text-[#888]">총 <span class="font-semibold text-[#FF7B22]">{{ store.memos.length }}</span>건</span>
              <button
                class="flex items-center gap-1 text-[12px] text-[#888] bg-white border border-[#E0E0E0] rounded-full px-3 py-1.5 hover:bg-[#F5F5F5] transition-colors"
                @click="toggleMemoSort"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="memoSortOrder === 'desc'" d="M12 5v14M19 12l-7 7-7-7" />
                  <path v-else d="M12 19V5M5 12l7-7 7 7" />
                </svg>
                {{ memoSortOrder === 'desc' ? '최신순' : '오래된순' }}
              </button>
            </div>

            <!-- 메모 리스트 -->
            <div class="flex flex-col gap-3">
              <div
                v-for="memo in sortedMemos"
                :key="memo.memo_id"
                class="bg-white rounded-xl border border-[#E8E8E8] p-5"
              >
                <!-- 수정 모드 -->
                <div v-if="editingMemoId === memo.memo_id">
                  <input
                    v-model="editMemoTitle"
                    type="text"
                    placeholder="제목 (선택)"
                    class="w-full bg-[#F8F8F8] rounded-[8px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] mb-2 text-[#333]"
                  />
                  <textarea
                    v-model="editMemoContent"
                    rows="3"
                    class="w-full bg-[#F8F8F8] rounded-[8px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] resize-none text-[#333]"
                  />
                  <div class="flex justify-end gap-2 mt-3">
                    <button
                      class="px-4 py-2 rounded-[8px] border border-[#E0E0E0] text-[12px] text-[#666] hover:bg-[#F5F5F5] transition-colors"
                      @click="cancelMemoEdit"
                    >
                      취소
                    </button>
                    <button
                      class="px-4 py-2 rounded-[8px] bg-[#FF7B22] text-white text-[12px] hover:bg-[#E56D1E] transition-colors"
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
                      <p class="text-[13px] text-[#333] leading-[1.6] whitespace-pre-line">{{ memo.content }}</p>
                      <p class="text-[11px] text-[#AAAAAA] mt-2">{{ formatDate(memo.memo_date) }}</p>
                    </div>
                    <div class="flex items-center gap-1 flex-shrink-0 ml-3">
                      <button
                        class="p-1.5 text-[#AAAAAA] hover:text-[#FF7B22] transition-colors"
                        title="수정"
                        @click="startMemoEdit(memo)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button
                        class="p-1.5 text-[#AAAAAA] hover:text-[#FF4444] transition-colors"
                        title="삭제"
                        @click="handleDeleteMemo(memo.memo_id)"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div
                v-if="store.memos.length === 0"
                class="flex flex-col items-center py-12"
              >
                <p class="text-[14px] text-[#AAAAAA]">작성된 메모가 없습니다</p>
              </div>
            </div>
          </div>

          <!-- 메모 추가 폼 (우측 사이드) -->
          <div class="bg-white rounded-xl border border-[#E8E8E8] p-5 h-fit sticky top-6">
            <h4 class="text-[14px] font-semibold text-[#333] mb-4">메모 추가</h4>
            <input
              v-model="newMemoTitle"
              type="text"
              placeholder="제목 (선택)"
              class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] mb-3"
            />
            <FormTextarea
              v-model="newMemoContent"
              placeholder="메모를 입력하세요"
              :rows="4"
            />
            <div class="mt-3">
              <label class="text-[12px] text-[#888] mb-1 block">날짜</label>
              <input
                v-model="newMemoDate"
                type="date"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
            <button
              class="w-full mt-4 py-2.5 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[10px] hover:bg-[#E56D1E] transition-colors"
              @click="handleAddMemo"
            >
              저장
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast.visible.value"
        class="fixed bottom-6 right-6 text-white text-[13px] px-5 py-2.5 rounded-[12px] shadow-lg z-50 whitespace-nowrap"
        :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'"
      >
        {{ toast.message.value }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useCustomerStore } from '../../stores/customerStore'
import { useToast } from '../../composables/useToast'
import { fetchInsuranceCompanies, unmaskResidentNumber } from '../../services/agentApi'
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
const showRrn = ref(false)
const fullRrnData = ref<string | null>(null)
const rrnLoading = ref(false)
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
      contract_amount: contractForm.value.contract_amount ? String(contractForm.value.contract_amount) : undefined,
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
  return customer.value?.resident_number_masked ?? '-'
})

const fullRrn = computed(() => {
  if (!fullRrnData.value) return '-'
  const raw = fullRrnData.value.replace(/-/g, '')
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

async function toggleRrn(): Promise<void> {
  if (showRrn.value) { showRrn.value = false; return }
  if (fullRrnData.value) { showRrn.value = true; return }
  rrnLoading.value = true
  try {
    const res = await unmaskResidentNumber(customerId.value)
    fullRrnData.value = res.data.data.resident_number
    showRrn.value = true
  } catch {
    toast.showToast('주민번호 조회에 실패했습니다.', 'error')
  } finally {
    rrnLoading.value = false
  }
}

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
    fullRrnData.value = null
    isEditing.value = false
    editingMemoId.value = null
    await store.loadCustomer(String(newId))
  }
})

// ===== 고객 정보 수정 =====
function handleStartEdit(): void {
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
      gender: (editForm.value.gender || undefined) as 'M' | 'F' | 'OTHER' | undefined,
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
