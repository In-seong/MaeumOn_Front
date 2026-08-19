<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.push('/assignments')"
        class="p-1.5 rounded-[8px] hover:bg-[#F0F0F0] transition-colors"
      >
        <span class="material-symbols-outlined text-[20px] text-[#999]">arrow_back</span>
      </button>
      <h1 class="text-[22px] font-bold text-[#333]">DB 배분 등록</h1>
    </div>

    <!-- 에러 표시 -->
    <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px] mb-4">
      {{ store.error }}
    </div>

    <!-- 2-Panel Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Left Panel: 미배정 고객 / 청구 신청 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <div class="px-4 lg:px-6 py-4 border-b border-[#E8E8E8]">
          <!-- 탭 전환 -->
          <div class="flex gap-1 mb-3 bg-[#F5F5F5] rounded-[10px] p-1">
            <button
              @click="activeTab = 'customers'"
              :class="[
                'flex-1 py-2 px-3 rounded-[8px] text-[13px] font-medium transition-colors',
                activeTab === 'customers'
                  ? 'bg-white text-[#333] shadow-sm'
                  : 'text-[#999] hover:text-[#666]'
              ]"
            >
              미배정 고객
            </button>
            <button
              @click="activeTab = 'claims'"
              :class="[
                'flex-1 py-2 px-3 rounded-[8px] text-[13px] font-medium transition-colors',
                activeTab === 'claims'
                  ? 'bg-white text-[#333] shadow-sm'
                  : 'text-[#999] hover:text-[#666]'
              ]"
            >
              청구 신청
            </button>
          </div>

          <input
            v-model="searchQuery"
            type="text"
            :placeholder="activeTab === 'customers' ? '고객 이름으로 검색' : '신청자 이름/전화번호 검색'"
            class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            @input="debouncedSearch"
          />
        </div>

        <!-- 신규 고객 등록 토글 (미배정 고객 탭) -->
        <div v-if="activeTab === 'customers'" class="px-4 lg:px-6 py-3 border-b border-[#F0F0F0]">
          <button
            @click="showNewCustomerForm = !showNewCustomerForm"
            class="flex items-center gap-1.5 text-[13px] font-medium text-[#FF7B22] hover:text-[#E56D1E] transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">{{ showNewCustomerForm ? 'close' : 'person_add' }}</span>
            {{ showNewCustomerForm ? '닫기' : '신규 고객 등록' }}
          </button>

          <div v-if="showNewCustomerForm" class="mt-3 p-4 bg-[#FAFAFA] rounded-[12px] border border-[#E8E8E8]">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">이름 *</label>
                <input
                  v-model="newCustomer.name"
                  type="text"
                  placeholder="고객 이름"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">전화번호 *</label>
                <input
                  v-model="newCustomer.phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
            </div>
            <div class="flex justify-end mt-3">
              <button
                @click="handleCreateCustomer"
                :disabled="!newCustomer.name || !newCustomer.phone || creatingCustomer"
                :class="[
                  'px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors',
                  newCustomer.name && newCustomer.phone && !creatingCustomer
                    ? 'bg-[#FF7B22] text-white hover:bg-[#E56D1E]'
                    : 'bg-[#E8E8E8] text-[#999] cursor-not-allowed'
                ]"
              >
                {{ creatingCustomer ? '등록 중...' : '등록' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 신규 청구 등록 토글 (청구 신청 탭) -->
        <div v-if="activeTab === 'claims'" class="px-4 lg:px-6 py-3 border-b border-[#F0F0F0]">
          <button
            @click="showNewClaimForm = !showNewClaimForm"
            class="flex items-center gap-1.5 text-[13px] font-medium text-[#FF7B22] hover:text-[#E56D1E] transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">{{ showNewClaimForm ? 'close' : 'note_add' }}</span>
            {{ showNewClaimForm ? '닫기' : '신규 청구 등록' }}
          </button>

          <div v-if="showNewClaimForm" class="mt-3 p-4 bg-[#FAFAFA] rounded-[12px] border border-[#E8E8E8]">
            <div class="flex items-center gap-4 mb-3">
              <label class="text-[12px] font-medium text-[#666]">DB 구분</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="newClaim.source_type" value="resident" class="accent-[#FF7B22]" />
                  <span class="text-[13px] text-[#333]">상주DB</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="newClaim.source_type" value="distribution" class="accent-[#FF7B22]" />
                  <span class="text-[13px] text-[#333]">배분DB</span>
                </label>
              </div>
            </div>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">이름 *</label>
                <input
                  v-model="newClaim.name"
                  type="text"
                  placeholder="환자 이름"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">전화번호 *</label>
                <input
                  v-model="newClaim.phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">병원</label>
                <select
                  v-model="newClaim.hospital_id"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">선택 안 함</option>
                  <option
                    v-for="h in hospitalOptions"
                    :key="h.hospital_id"
                    :value="h.hospital_id"
                  >
                    {{ h.hospital_name }}
                  </option>
                </select>
              </div>
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">설계사 배정</label>
                <select
                  v-model="newClaim.agent_id"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">미배정</option>
                  <option
                    v-for="agent in store.agentOptions"
                    :key="agent.agent_id"
                    :value="agent.agent_id"
                  >
                    {{ agent.name }}
                  </option>
                </select>
              </div>
            </div>
            <div class="mt-3">
              <label class="block text-[12px] font-medium text-[#666] mb-1">메모</label>
              <textarea
                v-model="newClaim.memo"
                rows="2"
                placeholder="카톡 내용 등 메모"
                class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22] resize-none"
              ></textarea>
            </div>
            <div class="mt-3">
              <label class="block text-[12px] font-medium text-[#666] mb-1">
                첨부파일 (최대 10개, 각 10MB)
              </label>
              <input
                ref="claimFileInput"
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.hwp"
                class="w-full text-[13px] text-[#333] file:mr-3 file:py-1.5 file:px-3 file:rounded-[8px] file:border-0 file:text-[12px] file:font-medium file:bg-[#FF7B22] file:text-white hover:file:bg-[#E56D1E] file:cursor-pointer"
                @change="handleClaimFileChange"
              />
              <div v-if="newClaimFiles.length > 0" class="mt-2 flex flex-wrap gap-2">
                <div
                  v-for="(file, idx) in newClaimFiles"
                  :key="idx"
                  class="flex items-center gap-1 bg-white border border-[#E8E8E8] rounded-[6px] px-2 py-1 text-[12px] text-[#666]"
                >
                  <span class="truncate max-w-[120px]">{{ file.name }}</span>
                  <button
                    @click="removeClaimFile(idx)"
                    class="text-[#999] hover:text-[#FF4444] transition-colors"
                  >&times;</button>
                </div>
              </div>
            </div>
            <div class="flex justify-end mt-3">
              <button
                @click="handleCreateClaim"
                :disabled="!newClaim.name || !newClaim.phone || creatingClaim"
                :class="[
                  'px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors',
                  newClaim.name && newClaim.phone && !creatingClaim
                    ? 'bg-[#FF7B22] text-white hover:bg-[#E56D1E]'
                    : 'bg-[#E8E8E8] text-[#999] cursor-not-allowed'
                ]"
              >
                {{ creatingClaim ? '등록 중...' : '등록' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 전체 선택 -->
        <div v-if="currentList.length > 0" class="px-4 lg:px-6 py-2 border-b border-[#F0F0F0] flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartialSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
          />
          <span class="text-[13px] text-[#999]">
            전체 선택 ({{ selectedIds.size }}/{{ currentList.length }})
          </span>
        </div>

        <!-- 로딩 -->
        <div v-if="listLoading" class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          <p class="mt-2 text-[13px] text-[#999]">로딩 중...</p>
        </div>

        <!-- 고객 목록 (미배정 고객 탭) -->
        <div v-else-if="activeTab === 'customers'" class="max-h-[400px] overflow-y-auto">
          <div
            v-for="customer in filteredCustomers"
            :key="customer.customer_id"
            class="flex items-center gap-3 px-4 lg:px-6 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer border-b border-[#F5F5F5] last:border-b-0"
            @click="toggleItem(customer.customer_id)"
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(customer.customer_id)"
              class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22] pointer-events-none"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-medium text-[#333]">{{ customer.name }}</p>
              <p class="text-[12px] text-[#999]">{{ formatPhone(customer.phone) }}</p>
            </div>
            <button
              @click.stop="showCustomerDetail(customer)"
              class="p-1.5 rounded-[8px] hover:bg-[#F0F0F0] transition-colors shrink-0"
              title="상세보기"
            >
              <span class="material-symbols-outlined text-[18px] text-[#999]">info</span>
            </button>
          </div>
          <div v-if="filteredCustomers.length === 0" class="px-4 lg:px-6 py-10 text-center text-[#999] text-[14px]">
            미배정 고객이 없습니다.
          </div>
        </div>

        <!-- 청구 신청 목록 (청구 신청 탭) -->
        <div v-else class="max-h-[400px] overflow-y-auto">
          <div
            v-for="claim in filteredClaims"
            :key="claim.request_id"
            class="flex items-center gap-3 px-4 lg:px-6 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer border-b border-[#F5F5F5] last:border-b-0"
            @click="toggleItem(String(claim.request_id))"
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(String(claim.request_id))"
              class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22] pointer-events-none"
            />
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <p class="text-[14px] font-medium text-[#333]">{{ claim.name }}</p>
                <span class="px-1.5 py-0.5 text-[11px] bg-[#FFF3ED] text-[#FF7B22] rounded-[4px] font-medium">청구</span>
              </div>
              <p class="text-[12px] text-[#999]">{{ formatPhone(claim.phone) }}</p>
              <p v-if="claim.memo" class="text-[11px] text-[#BBB] mt-0.5 truncate">{{ claim.memo }}</p>
            </div>
            <button
              @click.stop="showClaimDetail(claim.request_id)"
              class="p-1.5 rounded-[8px] hover:bg-[#F0F0F0] transition-colors shrink-0"
              title="상세보기"
            >
              <span class="material-symbols-outlined text-[18px] text-[#999]">info</span>
            </button>
            <div class="text-[11px] text-[#BBB] shrink-0">
              {{ formatDate(claim.created_at) }}
            </div>
          </div>
          <div v-if="filteredClaims.length === 0" class="px-4 lg:px-6 py-10 text-center text-[#999] text-[14px]">
            미배정 청구 신청이 없습니다.
          </div>
        </div>
      </div>

      <!-- Right Panel: 배분 대상 설계사 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <div class="px-4 lg:px-6 py-4 border-b border-[#E8E8E8]">
          <h2 class="text-[16px] font-bold text-[#333] mb-3">배분 대상 설계사</h2>
          <select
            v-model="selectedAgentId"
            class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
          >
            <option value="">설계사를 선택하세요</option>
            <option
              v-for="agent in store.agentOptions"
              :key="agent.agent_id"
              :value="agent.agent_id"
            >
              {{ agent.name }} ({{ agent.agent_id }})
            </option>
          </select>
        </div>

        <!-- 선택된 설계사 정보 -->
        <div v-if="selectedAgent" class="px-4 lg:px-6 py-5">
          <div class="bg-[#FFF8F3] rounded-[12px] p-4 border border-[#FFE4D0]">
            <div class="flex items-center gap-3 mb-3">
              <div class="w-10 h-10 rounded-full bg-[#FF7B22] flex items-center justify-center">
                <span class="material-symbols-outlined text-white text-[20px]">person</span>
              </div>
              <div>
                <p class="text-[15px] font-bold text-[#333]">{{ selectedAgent.name }}</p>
                <p class="text-[13px] text-[#999]">{{ selectedAgent.agent_id }}</p>
              </div>
            </div>
            <div class="space-y-1.5 text-[13px]">
              <div class="flex justify-between">
                <span class="text-[#999]">전화번호</span>
                <span class="text-[#333]">{{ formatPhone(selectedAgent.phone) }}</span>
              </div>
              <div v-if="selectedAgent.email" class="flex justify-between">
                <span class="text-[#999]">이메일</span>
                <span class="text-[#333]">{{ selectedAgent.email }}</span>
              </div>
              <div v-if="selectedAgent.office_location" class="flex justify-between">
                <span class="text-[#999]">소속</span>
                <span class="text-[#333]">{{ selectedAgent.office_location }}</span>
              </div>
              <div v-if="selectedAgent.specialization" class="flex justify-between">
                <span class="text-[#999]">전문분야</span>
                <span class="text-[#333]">{{ selectedAgent.specialization }}</span>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="px-4 lg:px-6 py-10 text-center text-[#999] text-[14px]">
          설계사를 선택하면 정보가 표시됩니다.
        </div>

        <!-- 배분 요약 -->
        <div v-if="selectedIds.size > 0 && selectedAgentId" class="px-4 lg:px-6 py-4 border-t border-[#E8E8E8]">
          <div class="bg-[#F0F7FF] rounded-[12px] p-3 text-[13px] text-[#336]">
            <span class="font-medium">{{ selectedIds.size }}{{ activeTab === 'customers' ? '명의 고객' : '건의 청구신청' }}</span>을
            <span class="font-medium">{{ selectedAgent?.name }}</span> 설계사에게 배분합니다.
          </div>
        </div>
      </div>
    </div>

    <!-- 비고 및 제출 -->
    <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
      <label v-if="activeTab === 'customers'" class="block text-[14px] font-medium text-[#333] mb-2">비고 (선택)</label>
      <textarea
        v-if="activeTab === 'customers'"
        v-model="notes"
        rows="3"
        placeholder="배분 관련 메모를 입력하세요"
        class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] resize-none"
      ></textarea>

      <div class="flex justify-end gap-3" :class="activeTab === 'customers' ? 'mt-4' : ''">
        <button
          @click="router.push('/assignments')"
          class="px-5 py-2.5 bg-[#F8F8F8] text-[#555] rounded-[12px] hover:bg-[#EFEFEF] transition-colors text-[14px] font-medium"
        >
          취소
        </button>
        <button
          @click="handleSubmit"
          :disabled="!canSubmit || store.loading"
          :class="[
            'px-5 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors',
            canSubmit && !store.loading
              ? 'bg-[#FF7B22] text-white hover:bg-[#E56D1E]'
              : 'bg-[#E8E8E8] text-[#999] cursor-not-allowed'
          ]"
        >
          <span v-if="store.loading">처리 중...</span>
          <span v-else>{{ activeTab === 'customers' ? '대량 배분' : '청구 배정' }}</span>
        </button>
      </div>
    </div>

    <!-- 고객 상세보기 모달 -->
    <div v-if="detailCustomer" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="detailCustomer = null">
      <div class="bg-white rounded-[16px] w-full max-w-[420px] max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <h3 class="text-[16px] font-bold text-[#333]">고객 상세 정보</h3>
          <button @click="detailCustomer = null" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div class="px-5 py-4 space-y-3">
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">이름</span>
            <span class="text-[#333] font-medium">{{ detailCustomer.name }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">전화번호</span>
            <span class="text-[#333]">{{ formatPhone(detailCustomer.phone) }}</span>
          </div>
          <div v-if="detailCustomer.gender" class="flex justify-between text-[13px]">
            <span class="text-[#999]">성별</span>
            <span class="text-[#333]">{{ detailCustomer.gender === 'M' ? '남성' : detailCustomer.gender === 'F' ? '여성' : detailCustomer.gender }}</span>
          </div>
          <div v-if="detailCustomer.birth_date" class="flex justify-between text-[13px]">
            <span class="text-[#999]">생년월일</span>
            <span class="text-[#333]">{{ detailCustomer.birth_date }}</span>
          </div>
          <div v-if="detailCustomer.address" class="flex justify-between text-[13px]">
            <span class="text-[#999]">주소</span>
            <span class="text-[#333] text-right max-w-[60%]">{{ detailCustomer.address }}{{ detailCustomer.detailed_address ? ' ' + detailCustomer.detailed_address : '' }}</span>
          </div>
          <div v-if="detailCustomer.job" class="flex justify-between text-[13px]">
            <span class="text-[#999]">직업</span>
            <span class="text-[#333]">{{ detailCustomer.job }}</span>
          </div>
          <div v-if="detailCustomer.email" class="flex justify-between text-[13px]">
            <span class="text-[#999]">이메일</span>
            <span class="text-[#333]">{{ detailCustomer.email }}</span>
          </div>
          <div v-if="detailCustomer.created_at" class="flex justify-between text-[13px]">
            <span class="text-[#999]">등록일</span>
            <span class="text-[#333]">{{ detailCustomer.created_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 청구 신청 상세보기 모달 -->
    <div v-if="detailClaim" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="detailClaim = null">
      <div class="bg-white rounded-[16px] w-full max-w-[420px] max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <h3 class="text-[16px] font-bold text-[#333]">청구 신청 상세</h3>
          <button @click="detailClaim = null" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div v-if="detailLoading" class="px-5 py-10 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          <p class="mt-2 text-[13px] text-[#999]">로딩 중...</p>
        </div>
        <div v-else class="px-5 py-4 space-y-3">
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">신청자</span>
            <span class="text-[#333] font-medium">{{ detailClaim.name }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">전화번호</span>
            <span class="text-[#333]">{{ formatPhone(detailClaim.phone) }}</span>
          </div>
          <div v-if="detailClaim.hospital" class="flex justify-between text-[13px]">
            <span class="text-[#999]">병원</span>
            <span class="text-[#333]">{{ detailClaim.hospital.hospital_name }}</span>
          </div>
          <div v-if="detailClaim.agent_name" class="flex justify-between text-[13px]">
            <span class="text-[#999]">담당 설계사</span>
            <span class="text-[#333]">{{ detailClaim.agent_name }}</span>
          </div>
          <div v-if="detailClaim.matched_agent" class="flex justify-between text-[13px]">
            <span class="text-[#999]">예상 담당 설계사</span>
            <span class="text-[#333]">{{ detailClaim.matched_agent.name }}</span>
          </div>
          <div v-if="detailClaim.memo" class="text-[13px]">
            <p class="text-[#999] mb-1">메모</p>
            <p class="text-[#333] bg-[#F8F8F8] rounded-[8px] px-3 py-2 whitespace-pre-wrap">{{ detailClaim.memo }}</p>
          </div>
          <div v-if="detailClaim.created_at" class="flex justify-between text-[13px]">
            <span class="text-[#999]">신청일</span>
            <span class="text-[#333]">{{ detailClaim.created_at?.slice(0, 10) }}</span>
          </div>
          <div v-if="detailClaim.files && detailClaim.files.length > 0" class="text-[13px]">
            <p class="text-[#999] mb-2">첨부파일 ({{ detailClaim.files.length }}건)</p>
            <div class="grid grid-cols-2 gap-2">
              <div v-for="file in detailClaim.files" :key="file.file_id" class="relative">
                <a :href="file.file_download_url || ''" target="_blank" class="block">
                  <img
                    v-if="isImageFile(file.file_name)"
                    :src="file.file_download_url || ''"
                    :alt="file.file_name || '첨부파일'"
                    class="w-full h-24 object-cover rounded-[8px] border border-[#E8E8E8]"
                  />
                  <div v-else class="w-full h-24 bg-[#F8F8F8] rounded-[8px] border border-[#E8E8E8] flex flex-col items-center justify-center">
                    <span class="material-symbols-outlined text-[24px] text-[#999]">description</span>
                    <p class="text-[11px] text-[#999] mt-1 truncate max-w-full px-2">{{ file.file_name || '파일' }}</p>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAssignmentStore } from '../../stores/assignmentStore'
import { createCustomer, fetchAdminClaimRequest, fetchAdminHospitals } from '../../services/adminApi'
import type { AdminCustomer, AdminClaimRequest, AdminHospital } from '../../types'

const router = useRouter()
const store = useAssignmentStore()

const activeTab = ref<'customers' | 'claims'>('customers')
const searchQuery = ref('')
const selectedIds = ref<Set<string>>(new Set())
const selectedAgentId = ref('')
const notes = ref('')
const customersLoading = ref(false)

const showNewCustomerForm = ref(false)
const creatingCustomer = ref(false)
const newCustomer = ref({ name: '', phone: '' })

const showNewClaimForm = ref(false)
const creatingClaim = ref(false)
const newClaim = ref({ name: '', phone: '', hospital_id: '', agent_id: '', memo: '', source_type: 'resident' })
const newClaimFiles = ref<File[]>([])
const claimFileInput = ref<HTMLInputElement | null>(null)
const hospitalOptions = ref<AdminHospital[]>([])

const detailCustomer = ref<AdminCustomer | null>(null)
const detailClaim = ref<AdminClaimRequest | null>(null)
const detailLoading = ref(false)

let searchTimeout: ReturnType<typeof setTimeout>

watch(activeTab, () => {
  selectedIds.value = new Set()
  searchQuery.value = ''
  if (activeTab.value === 'claims' && store.unassignedClaimRequests.length === 0) {
    loadClaimRequests()
  }
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return store.unassignedCustomers
  const q = searchQuery.value.toLowerCase()
  return store.unassignedCustomers.filter(
    c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
  )
})

const filteredClaims = computed(() => {
  if (!searchQuery.value) return store.unassignedClaimRequests
  const q = searchQuery.value.toLowerCase()
  return store.unassignedClaimRequests.filter(
    c => c.name.toLowerCase().includes(q) || c.phone.includes(q)
  )
})

const currentList = computed(() => {
  if (activeTab.value === 'customers') {
    return filteredCustomers.value.map(c => ({ id: c.customer_id }))
  }
  return filteredClaims.value.map(c => ({ id: String(c.request_id) }))
})

const listLoading = computed(() => {
  return activeTab.value === 'customers' ? customersLoading.value : store.claimRequestsLoading
})

const selectedAgent = computed(() => {
  if (!selectedAgentId.value) return null
  return store.agentOptions.find(a => a.agent_id === selectedAgentId.value) || null
})

const isAllSelected = computed(() => {
  return currentList.value.length > 0 &&
    currentList.value.every(item => selectedIds.value.has(item.id))
})

const isPartialSelected = computed(() => {
  if (isAllSelected.value) return false
  return currentList.value.some(item => selectedIds.value.has(item.id))
})

const canSubmit = computed(() => {
  return selectedIds.value.size > 0 && selectedAgentId.value !== ''
})

function toggleItem(id: string) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  selectedIds.value = newSet
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    const newSet = new Set(selectedIds.value)
    currentList.value.forEach(item => newSet.delete(item.id))
    selectedIds.value = newSet
  } else {
    const newSet = new Set(selectedIds.value)
    currentList.value.forEach(item => newSet.add(item.id))
    selectedIds.value = newSet
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    if (activeTab.value === 'customers') {
      loadUnassigned()
    } else {
      loadClaimRequests()
    }
  }, 300)
}

async function loadUnassigned() {
  customersLoading.value = true
  try {
    await store.loadUnassignedCustomers({
      search: searchQuery.value || undefined,
    })
  } finally {
    customersLoading.value = false
  }
}

async function loadClaimRequests() {
  await store.loadUnassignedClaimRequests({
    search: searchQuery.value || undefined,
  })
}

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
}

function showCustomerDetail(customer: AdminCustomer) {
  detailCustomer.value = customer
}

async function showClaimDetail(requestId: number) {
  detailLoading.value = true
  detailClaim.value = {} as AdminClaimRequest
  try {
    const res = await fetchAdminClaimRequest(requestId)
    detailClaim.value = res.data.data
  } catch {
    detailClaim.value = null
  } finally {
    detailLoading.value = false
  }
}

function isImageFile(fileName?: string): boolean {
  if (!fileName) return false
  return /\.(jpg|jpeg|png|gif|webp|bmp|heic)$/i.test(fileName)
}

async function handleCreateCustomer() {
  if (!newCustomer.value.name || !newCustomer.value.phone) return
  creatingCustomer.value = true
  try {
    await createCustomer({
      name: newCustomer.value.name,
      phone: newCustomer.value.phone,
    })
    newCustomer.value = { name: '', phone: '' }
    showNewCustomerForm.value = false
    await loadUnassigned()
    alert('고객이 등록되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '고객 등록에 실패했습니다.')
  } finally {
    creatingCustomer.value = false
  }
}

function handleClaimFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (!target.files) return
  const files = Array.from(target.files)
  const total = newClaimFiles.value.length + files.length
  if (total > 10) {
    alert('첨부파일은 최대 10개까지 가능합니다.')
    return
  }
  newClaimFiles.value.push(...files)
  if (claimFileInput.value) claimFileInput.value.value = ''
}

function removeClaimFile(idx: number) {
  newClaimFiles.value.splice(idx, 1)
}

async function handleCreateClaim() {
  if (!newClaim.value.name || !newClaim.value.phone) return
  creatingClaim.value = true
  try {
    const formData = new FormData()
    formData.append('name', newClaim.value.name)
    formData.append('phone', newClaim.value.phone)
    if (newClaim.value.hospital_id) formData.append('hospital_id', newClaim.value.hospital_id)
    if (newClaim.value.agent_id) formData.append('agent_id', newClaim.value.agent_id)
    if (newClaim.value.memo) formData.append('memo', newClaim.value.memo)
    if (newClaim.value.source_type) formData.append('source_type', newClaim.value.source_type)
    newClaimFiles.value.forEach(file => formData.append('files[]', file))

    await store.createClaimRequest(formData)
    newClaim.value = { name: '', phone: '', hospital_id: '', agent_id: '', memo: '', source_type: 'resident' }
    newClaimFiles.value = []
    showNewClaimForm.value = false
    await loadClaimRequests()
    alert('청구 신청이 등록되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '청구 신청 등록에 실패했습니다.')
  } finally {
    creatingClaim.value = false
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  try {
    if (activeTab.value === 'customers') {
      const assignments = Array.from(selectedIds.value).map(customerId => ({
        customer_id: customerId,
        agent_id: selectedAgentId.value,
      }))

      const result = await store.bulkAssignment({
        assignments,
        notes: notes.value || undefined,
      })

      alert(`${result.created_count}건의 DB 배분이 등록되었습니다.`)
    } else {
      const requestIds = Array.from(selectedIds.value).map(id => Number(id))

      const result = await store.bulkAssignClaimRequests({
        request_ids: requestIds,
        agent_id: selectedAgentId.value,
      })

      alert(`${result.assigned_count}건의 청구신청이 배정되었습니다.`)
    }

    router.push('/assignments')
  } catch (e: any) {
    alert(e.response?.data?.message || '배분 등록에 실패했습니다.')
  }
}

async function loadHospitals() {
  try {
    const res = await fetchAdminHospitals({ per_page: 200, is_active: true })
    hospitalOptions.value = res.data.data.data
  } catch {
    // 병원 목록 실패 시 무시
  }
}

onMounted(async () => {
  customersLoading.value = true
  try {
    await Promise.all([
      store.loadUnassignedCustomers(),
      store.loadAgentOptions(),
      loadHospitals(),
    ])
  } finally {
    customersLoading.value = false
  }
})
</script>
