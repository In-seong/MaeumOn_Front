<template>
  <div class="p-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center gap-3">
        <button
          class="text-[14px] text-[#888] hover:text-[#FF7B22] transition-colors"
          @click="router.push('/claims')"
        >
          &larr; 목록으로
        </button>
        <h1 class="text-[20px] font-bold text-[#333]">보험금 청구</h1>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 좌측: 임시저장 목록 + 청구 방식 선택 -->
      <div class="lg:col-span-1 space-y-6">
        <!-- 배치 임시저장 목록 -->
        <div
          v-if="!claimMode && batchClaimStore.batchDrafts.length > 0"
          class="bg-white rounded-xl border border-[#E8E8E8] p-5"
        >
          <p class="text-[16px] font-bold text-[#222] mb-3">임시저장된 다중 청구</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="draft in batchClaimStore.batchDrafts"
              :key="draft.batch_claim_id"
              class="rounded-[12px] bg-[#FAFAFA] border border-[#E8E8E8] p-4"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-[#F0FFF0] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="8" height="11" rx="1" stroke="#3DAA5C" stroke-width="2"/>
                    <rect x="14" y="3" width="8" height="11" rx="1" stroke="#3DAA5C" stroke-width="2"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] font-semibold text-[#222] truncate">
                    {{ getBatchDraftLabel(draft) }}
                  </p>
                  <p class="text-[12px] text-[#999] mt-0.5">
                    {{ draft.customer?.name || '고객 미지정' }}
                    · {{ draft.created_at ? new Date(draft.created_at).toLocaleDateString('ko-KR') : '' }} 저장
                  </p>
                </div>
              </div>
              <div class="flex gap-2 mt-3">
                <button
                  type="button"
                  class="flex-1 py-2 rounded-[8px] bg-[#FF7B22] text-white text-[13px] font-semibold hover:bg-[#E56D1E] transition-colors"
                  @click="resumeBatchDraft(draft.batch_claim_id)"
                >이어쓰기</button>
                <button
                  type="button"
                  class="py-2 px-4 rounded-[8px] border border-[#E0E0E0] text-[#999] text-[13px] font-semibold hover:bg-[#F5F5F5] transition-colors"
                  @click="handleDeleteBatchDraft(draft.batch_claim_id)"
                >삭제</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 임시저장 목록 -->
        <div
          v-if="!claimMode && claimStore.drafts.length > 0"
          class="bg-white rounded-xl border border-[#E8E8E8] p-5"
        >
          <p class="text-[16px] font-bold text-[#222] mb-3">임시저장된 청구서</p>
          <div class="flex flex-col gap-2">
            <div
              v-for="draft in claimStore.drafts"
              :key="draft.claim_id"
              class="rounded-[12px] bg-[#FAFAFA] border border-[#E8E8E8] p-4"
            >
              <div class="flex items-center gap-3">
                <div class="w-9 h-9 rounded-full bg-[#F5F5F5] flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] font-semibold text-[#222] truncate">
                    {{ draft.claim_form?.form_name || '청구서' }}
                  </p>
                  <p class="text-[12px] text-[#999] mt-0.5">
                    {{ draft.created_at ? new Date(draft.created_at).toLocaleDateString('ko-KR') : '' }} 저장
                  </p>
                </div>
              </div>
              <div class="flex gap-2 mt-3">
                <button
                  type="button"
                  class="flex-1 py-2 rounded-[8px] bg-[#FF7B22] text-white text-[13px] font-semibold hover:bg-[#E56D1E] transition-colors"
                  @click="resumeDraft(draft)"
                >이어쓰기</button>
                <button
                  type="button"
                  class="py-2 px-4 rounded-[8px] border border-[#E0E0E0] text-[#999] text-[13px] font-semibold hover:bg-[#F5F5F5] transition-colors"
                  @click="handleDeleteDraft(draft.claim_id)"
                >삭제</button>
              </div>
            </div>
          </div>
        </div>

        <!-- 청구 방식 선택 (첫 화면) -->
        <div v-if="!claimMode" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <p class="text-[16px] font-bold text-[#222] mb-4">청구 방식을 선택하세요</p>
          <div class="flex flex-col gap-3">
            <button
              type="button"
              class="w-full text-left rounded-[12px] border border-[#E8E8E8] p-5 hover:border-[#FF7B22] hover:bg-[#FFF3ED] transition-all"
              @click="claimMode = 'direct'"
            >
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-full bg-[#F0F4FF] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#5B7FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M14 2v6h6" stroke="#5B7FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <path d="M12 18v-6M9 15h6" stroke="#5B7FFF" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-[15px] font-semibold text-[#222]">바로 청구</p>
                  <p class="text-[12px] text-[#999] mt-0.5">고객 정보를 직접 입력하여 청구합니다</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0">
                  <path d="M9 5l7 7-7 7" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>

            <button
              type="button"
              class="w-full text-left rounded-[12px] border border-[#E8E8E8] p-5 hover:border-[#FF7B22] hover:bg-[#FFF3ED] transition-all"
              @click="claimMode = 'customer'"
            >
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-full bg-[#FFF0E5] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    <circle cx="9" cy="7" r="4" stroke="#FF7B22" stroke-width="2"/>
                    <path d="M22 21v-2a4 4 0 00-3-3.87" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-[15px] font-semibold text-[#222]">고객 선택 후 청구</p>
                  <p class="text-[12px] text-[#999] mt-0.5">등록된 고객을 선택하여 청구합니다</p>
                </div>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0">
                  <path d="M9 5l7 7-7 7" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </button>
          </div>
        </div>

        <!-- 뒤로가기 (모드 선택 후) -->
        <div v-if="claimMode" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <button
            type="button"
            class="text-[14px] text-[#888] hover:text-[#FF7B22] transition-colors mb-3"
            @click="claimMode = null"
          >
            &larr; 청구 방식 다시 선택
          </button>
          <p class="text-[16px] font-bold text-[#222]">
            {{ claimMode === 'customer' ? '고객 선택 후 청구' : '바로 청구' }}
          </p>
        </div>
      </div>

      <!-- 우측: 단계별 선택 영역 -->
      <div v-if="claimMode" class="lg:col-span-2 space-y-6">
        <!-- ===== 고객 선택 모드 ===== -->
        <div v-if="claimMode === 'customer'" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-2 mb-4">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedCustomerId ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >1</span>
            <h2 class="text-[15px] font-semibold text-[#222]">고객 선택</h2>
            <span v-if="selectedCustomer" class="ml-auto text-[13px] text-[#FF7B22] font-medium">
              {{ selectedCustomer.name }}
            </span>
          </div>

          <!-- 검색 입력 -->
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
              class="w-full max-w-[400px] bg-[#F8F8F8] rounded-[12px] pl-10 pr-4 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              @input="handleCustomerSearch"
            />
          </div>

          <!-- 고객 목록 로딩 -->
          <div v-if="customerStore.loading" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
          </div>

          <!-- 고객 리스트 -->
          <div
            v-else-if="customerStore.customers.length > 0"
            class="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-[300px] overflow-y-auto"
          >
            <button
              v-for="customer in customerStore.customers"
              :key="customer.customer_id"
              type="button"
              class="flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all hover:shadow-sm"
              :class="
                selectedCustomerId === customer.customer_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-[#FAFAFA] border-[1.5px] border-transparent hover:border-[#E8E8E8]'
              "
              @click="selectCustomer(customer.customer_id)"
            >
              <div
                class="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-[13px] font-bold"
                :class="
                  selectedCustomerId === customer.customer_id
                    ? 'bg-[#FF7B22] text-white'
                    : 'bg-[#F0F0F0] text-[#999]'
                "
              >
                {{ customer.name.charAt(0) }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-[14px] font-semibold text-[#222] truncate">{{ customer.name }}</p>
                <p class="text-[12px] text-[#999] truncate">{{ customer.phone }}</p>
              </div>
              <svg
                v-if="selectedCustomerId === customer.customer_id"
                width="20" height="20" viewBox="0 0 24 24" fill="none" class="shrink-0"
              >
                <circle cx="12" cy="12" r="10" fill="#FF7B22"/>
                <path d="M8 12L11 15L16 9" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- 빈 상태 -->
          <div v-else class="flex flex-col items-center justify-center py-8">
            <div class="w-[48px] h-[48px] rounded-full bg-[#F5F5F5] flex items-center justify-center mb-2">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" stroke="#CCCCCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <circle cx="9" cy="7" r="4" stroke="#CCCCCC" stroke-width="2"/>
              </svg>
            </div>
            <p class="text-[13px] text-[#AAAAAA]">
              {{ customerSearch ? '검색 결과가 없습니다' : '담당 고객이 없습니다' }}
            </p>
          </div>
        </div>

        <!-- ===== 보험사 선택 (다중) ===== -->
        <div v-if="showCompanySection" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-2 mb-4">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedCompanies.length > 0 ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '2' : '1' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">보험사 선택</h2>
            <span v-if="selectedCompanies.length > 0" class="ml-auto text-[13px] text-[#FF7B22] font-medium">
              {{ selectedCompanies.length }}개 선택
            </span>
          </div>

          <!-- 선택된 보험사 칩 -->
          <div v-if="selectedCompanies.length > 0" class="flex flex-wrap gap-1.5 mb-4">
            <span
              v-for="entry in selectedCompanies"
              :key="entry.company.company_id"
              class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FFF0E5] text-[12px] font-semibold text-[#FF7B22] border border-[#FFD4B0]"
            >
              {{ entry.company.company_name }}
              <button
                type="button"
                class="w-4 h-4 rounded-full flex items-center justify-center text-[#FF7B22] hover:bg-[#FF7B22] hover:text-white transition-colors"
                @click.stop="toggleCompany(entry.company)"
              >
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="3" stroke-linecap="round"/>
                </svg>
              </button>
            </span>
          </div>

          <!-- 카테고리 탭 -->
          <div class="flex gap-1.5 mb-4 bg-[#F5F5F5] rounded-[10px] p-1 max-w-[360px]">
            <button
              v-for="tab in categoryTabs"
              :key="tab.value"
              type="button"
              class="flex-1 py-2 rounded-[8px] text-[13px] font-semibold transition-all"
              :class="
                activeCategory === tab.value
                  ? 'bg-white text-[#FF7B22] shadow-[0_1px_4px_rgba(0,0,0,0.08)]'
                  : 'text-[#999] hover:text-[#666]'
              "
              @click="activeCategory = tab.value"
            >{{ tab.label }}</button>
          </div>

          <div v-if="claimStore.loadingCompanies" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
            <button
              v-for="company in filteredCompanies"
              :key="company.company_id"
              type="button"
              class="relative flex flex-col items-center justify-center rounded-[12px] p-2 transition-all hover:shadow-sm"
              :class="
                isCompanySelected(company.company_id)
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-[#FAFAFA] border-[1.5px] border-transparent hover:border-[#E8E8E8]'
              "
              @click="toggleCompany(company)"
            >
              <!-- 체크 표시 -->
              <div
                v-if="isCompanySelected(company.company_id)"
                class="absolute top-1 right-1 w-5 h-5 rounded-full bg-[#FF7B22] flex items-center justify-center"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                  <path d="M5 12l5 5L20 7" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <div class="w-full h-[60px] flex items-center justify-center">
                <img
                  v-if="company.logo_url"
                  :src="company.logo_url"
                  :alt="company.company_name"
                  class="max-w-[90px] max-h-[56px] object-contain"
                />
                <div v-else class="w-[48px] h-[48px] rounded-full bg-[#F0F0F0] flex items-center justify-center">
                  <span class="text-[16px] font-bold text-[#999]">{{ company.company_name.charAt(0) }}</span>
                </div>
              </div>
            </button>
          </div>

          <div
            v-if="filteredCompanies.length === 0 && !claimStore.loadingCompanies"
            class="text-center py-6"
          >
            <p class="text-[13px] text-[#999]">등록된 보험사가 없습니다.</p>
          </div>
        </div>

        <!-- ===== 양식 선택 (보험사별) ===== -->
        <div v-if="selectedCompanies.length > 0" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-2 mb-4">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="allFormsSelected ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '3' : '2' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">양식 선택</h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div
              v-for="entry in selectedCompanies"
              :key="entry.company.company_id"
              class="rounded-[12px] bg-[#FAFAFA] border border-[#E8E8E8] p-4"
            >
              <p class="text-[14px] font-semibold text-[#222] mb-2">{{ entry.company.company_name }}</p>

              <!-- 로딩 중 -->
              <div v-if="entry.loadingForms" class="flex items-center justify-center py-3">
                <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-[#FF7B22]"></div>
              </div>

              <!-- 양식 1개: 자동 선택 -->
              <div v-else-if="entry.forms.length === 1 && entry.formId" class="px-3 py-2 bg-[#FFF0E5] rounded-[8px]">
                <p class="text-[13px] text-[#222]">{{ entry.forms[0]?.form_name }}</p>
                <p class="text-[11px] text-[#FF7B22] mt-0.5">자동 선택</p>
              </div>

              <!-- 양식 2개 이상: 선택 버튼 -->
              <div v-else-if="entry.forms.length > 1" class="flex flex-col gap-1.5">
                <button
                  v-for="form in entry.forms"
                  :key="form.claim_form_id"
                  type="button"
                  class="text-left px-3 py-2 rounded-[8px] text-[13px] transition-all hover:shadow-sm"
                  :class="
                    entry.formId === form.claim_form_id
                      ? 'bg-[#FFF0E5] border border-[#FF7B22] font-semibold text-[#222]'
                      : 'bg-white border border-[#E8E8E8] text-[#666] hover:border-[#FF7B22]'
                  "
                  @click="selectFormForCompany(entry.company.company_id, form.claim_form_id)"
                >
                  {{ form.form_name }}
                </button>
              </div>

              <!-- 양식 없음 -->
              <p v-else-if="entry.forms.length === 0 && !entry.loadingForms" class="text-[12px] text-[#999] py-2">
                등록된 양식이 없습니다
              </p>
            </div>
          </div>
        </div>

        <!-- 에러 -->
        <div v-if="claimStore.error" class="p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
          {{ claimStore.error }}
        </div>

        <!-- 다음 단계 버튼 -->
        <div v-if="claimMode" class="flex justify-end">
          <button
            type="button"
            :disabled="!canProceed"
            class="px-8 py-3 rounded-[12px] text-[15px] font-semibold transition-colors"
            :class="
              canProceed
                ? 'bg-[#FF7B22] text-white hover:bg-[#E56D1E]'
                : 'bg-[#E0E0E0] text-[#AAAAAA] cursor-not-allowed'
            "
            @click="goNext"
          >
            다음 단계
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import type { AgentClaim, BatchClaim } from '../../types'
import type { InsuranceCategory, InsuranceCompany, ClaimForm } from '@shared/types'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerStore } from '../../stores/customerStore'
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'
import { fetchClaimForms as apiFetchClaimForms } from '../../services/agentApi'

const router = useRouter()
const route = useRoute()
const customerStore = useCustomerStore()
const claimStore = useAgentClaimStore()
const batchClaimStore = useAgentBatchClaimStore()

// ===== 보험사별 양식 선택 타입 =====
interface SelectedCompanyEntry {
  company: InsuranceCompany
  formId: number | null
  forms: ClaimForm[]
  loadingForms: boolean
}

// ===== 상태 =====
const claimMode = ref<'customer' | 'direct' | null>(null)
const customerSearch = ref('')
const selectedCustomerId = ref<string | null>(null)
const selectedCompanies = ref<SelectedCompanyEntry[]>([])
const activeCategory = ref<InsuranceCategory>('non-life')

const categoryTabs: { value: InsuranceCategory; label: string }[] = [
  { value: 'non-life', label: '손해보험' },
  { value: 'life', label: '생명보험' },
  { value: 'cooperative', label: '공제조합' },
]

const filteredCompanies = computed(() =>
  claimStore.insuranceCompanies.filter(c => c.category === activeCategory.value)
)

let searchTimeout: ReturnType<typeof setTimeout> | null = null

// ===== Computed =====
const selectedCustomer = computed(() => {
  if (!selectedCustomerId.value) return null
  return customerStore.customers.find(c => c.customer_id === selectedCustomerId.value) ?? null
})

const showCompanySection = computed(() => {
  if (claimMode.value === 'direct') return true
  if (claimMode.value === 'customer' && selectedCustomerId.value) return true
  return false
})

const allFormsSelected = computed(() =>
  selectedCompanies.value.length > 0 &&
  selectedCompanies.value.every(e => e.formId !== null)
)

const canProceed = computed(() => {
  if (selectedCompanies.value.length === 0) return false
  if (!allFormsSelected.value) return false
  if (claimMode.value === 'customer' && !selectedCustomerId.value) return false
  return true
})

// ===== 라이프사이클 =====
const preselectedCustomerId = (route.query.customerId as string) || null

onMounted(async () => {
  await Promise.all([
    customerStore.loadCustomers(),
    claimStore.fetchInsuranceCompanies(),
    claimStore.loadDrafts(),
    batchClaimStore.loadBatchDrafts(),
  ])

  if (preselectedCustomerId) {
    claimMode.value = 'customer'
    selectedCustomerId.value = preselectedCustomerId
  }
})

watch(claimMode, () => {
  if (preselectedCustomerId && selectedCustomerId.value === preselectedCustomerId) return
  selectedCustomerId.value = null
  selectedCompanies.value = []
})

// ===== 핸들러 =====
function handleCustomerSearch(): void {
  if (searchTimeout) clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    customerStore.searchQuery = customerSearch.value
    customerStore.currentPage = 1
    customerStore.loadCustomers()
  }, 400)
}

function selectCustomer(customerId: string): void {
  if (selectedCustomerId.value === customerId) {
    selectedCustomerId.value = null
    selectedCompanies.value = []
  } else {
    selectedCustomerId.value = customerId
  }
}

function isCompanySelected(companyId: number): boolean {
  return selectedCompanies.value.some(e => e.company.company_id === companyId)
}

async function toggleCompany(company: InsuranceCompany): Promise<void> {
  const idx = selectedCompanies.value.findIndex(e => e.company.company_id === company.company_id)
  if (idx >= 0) {
    selectedCompanies.value.splice(idx, 1)
  } else {
    selectedCompanies.value.push({
      company,
      formId: null,
      forms: [],
      loadingForms: true,
    })
    const reactiveEntry = selectedCompanies.value[selectedCompanies.value.length - 1]!

    try {
      const res = await apiFetchClaimForms({ company_id: company.company_id })
      if (res.data.success) {
        reactiveEntry.forms = res.data.data
        if (reactiveEntry.forms.length === 1) {
          const form = reactiveEntry.forms[0]
          if (form) reactiveEntry.formId = form.claim_form_id
        }
      }
    } catch {
      reactiveEntry.forms = []
    } finally {
      reactiveEntry.loadingForms = false
    }
  }
}

function selectFormForCompany(companyId: number, formId: number): void {
  const entry = selectedCompanies.value.find(e => e.company.company_id === companyId)
  if (entry) {
    entry.formId = entry.formId === formId ? null : formId
  }
}

function getBatchDraftLabel(draft: BatchClaim): string {
  if (draft.claims && draft.claims.length > 0) {
    const first = draft.claims[0]
    const companyName = first?.claim_form?.insurance_company?.company_name
    if (companyName) {
      if (draft.claims.length > 1) return `${companyName} 외 ${draft.claims.length - 1}건`
      return companyName
    }
  }
  return `다중 청구 ${draft.total_count}건`
}

function resumeDraft(draft: AgentClaim): void {
  const formId = draft.claim_form?.claim_form_id || draft.claim_form_id
  router.push(`/claims/${draft.claim_id}/edit?templateId=${formId}`)
}

async function handleDeleteDraft(claimId: number): Promise<void> {
  if (!confirm('임시저장된 청구서를 삭제하시겠습니까?')) return
  await claimStore.deleteDraftClaim(claimId)
}

function goNext(): void {
  if (!canProceed.value) return

  if (selectedCompanies.value.length === 1) {
    const entry = selectedCompanies.value[0]!
    if (claimMode.value === 'customer') {
      router.push(`/claims/new/${entry.formId}?customerId=${selectedCustomerId.value}`)
    } else {
      router.push(`/claims/new/${entry.formId}`)
    }
  } else {
    batchClaimStore.resetBatchForm()

    if (claimMode.value === 'customer' && selectedCustomer.value) {
      batchClaimStore.selectCustomer(selectedCustomer.value)
    }

    for (const entry of selectedCompanies.value) {
      batchClaimStore.toggleCompany(entry.company)
    }

    router.push({
      name: 'agent-batch-claim-new',
      query: { fromSelect: 'true' },
    })
  }
}

function resumeBatchDraft(batchId: number): void {
  router.push({ name: 'agent-batch-claim-edit', params: { batchId } })
}

async function handleDeleteBatchDraft(batchId: number): Promise<void> {
  if (!confirm('임시저장된 다중 청구를 삭제하시겠습니까?')) return
  await batchClaimStore.deleteDraft(batchId)
}
</script>
