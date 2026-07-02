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

            <button
              type="button"
              class="w-full text-left rounded-[12px] border border-[#E8E8E8] p-5 hover:border-[#FF7B22] hover:bg-[#FFF3ED] transition-all"
              @click="goToBatchClaim"
            >
              <div class="flex items-center gap-3.5">
                <div class="w-11 h-11 rounded-full bg-[#F0FFF0] flex items-center justify-center shrink-0">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                    <rect x="2" y="3" width="8" height="11" rx="1" stroke="#3DAA5C" stroke-width="2"/>
                    <rect x="14" y="3" width="8" height="11" rx="1" stroke="#3DAA5C" stroke-width="2"/>
                    <path d="M6 18v2M18 18v2M6 20h12" stroke="#3DAA5C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-[15px] font-semibold text-[#222]">다중 청구 (여러 보험사)</p>
                  <p class="text-[12px] text-[#999] mt-0.5">한 고객의 여러 보험사에 동시 청구합니다</p>
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

        <!-- ===== 보험사 선택 ===== -->
        <div v-if="showCompanySection" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-2 mb-4">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedCompanyId ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '2' : '1' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">보험사 선택</h2>
            <span v-if="selectedCompanyName" class="ml-auto text-[13px] text-[#FF7B22] font-medium">
              {{ selectedCompanyName }}
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
              class="flex flex-col items-center justify-center rounded-[12px] p-2 transition-all hover:shadow-sm"
              :class="
                selectedCompanyId === company.company_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-[#FAFAFA] border-[1.5px] border-transparent hover:border-[#E8E8E8]'
              "
              @click="selectCompany(company.company_id)"
            >
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

        <!-- ===== 양식 선택 ===== -->
        <div v-if="selectedCompanyId" class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <div class="flex items-center gap-2 mb-4">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedFormId ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '3' : '2' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">양식 선택</h2>
          </div>

          <div v-if="claimStore.loadingClaimForms" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
          </div>

          <!-- 양식 1개: 자동 선택 완료 표시 -->
          <div v-else-if="claimStore.claimForms.length === 1 && selectedFormId" class="p-4 bg-[#FFF0E5] border-[1.5px] border-[#FF7B22] rounded-[12px]">
            <p class="text-[14px] font-semibold text-[#222]">{{ claimStore.claimForms[0]?.form_name }}</p>
            <p class="text-[12px] text-[#FF7B22] mt-1">양식이 자동 선택되었습니다</p>
          </div>

          <!-- 양식 2개 이상: 선택 리스트 -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
            <button
              v-for="form in claimStore.claimForms"
              :key="form.claim_form_id"
              type="button"
              class="block w-full text-left transition-all rounded-[12px] p-4 hover:shadow-sm"
              :class="
                selectedFormId === form.claim_form_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-[#FAFAFA] border-[1.5px] border-transparent hover:border-[#E8E8E8]'
              "
              @click="selectedFormId = form.claim_form_id"
            >
              <div v-if="form.template_image_url" class="mb-3 aspect-[4/3] bg-[#F8F8F8] rounded-[8px] overflow-hidden">
                <img :src="form.template_image_url" :alt="form.form_name" class="w-full h-full object-cover" />
              </div>
              <p class="text-[14px] font-semibold text-[#222]">{{ form.form_name }}</p>
              <p v-if="form.form_description" class="text-[12px] text-[#999] mt-1">{{ form.form_description }}</p>
              <p v-if="form.form_fields_count" class="text-[11px] text-[#FF7B22] mt-2">입력 필드 {{ form.form_fields_count }}개</p>
            </button>
          </div>

          <div
            v-if="claimStore.claimForms.length === 0 && !claimStore.loadingClaimForms"
            class="text-center py-6"
          >
            <p class="text-[13px] text-[#999]">이 보험사에 등록된 양식이 없습니다.</p>
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
import type { InsuranceCategory } from '@shared/types'
import { useRouter, useRoute } from 'vue-router'
import { useCustomerStore } from '../../stores/customerStore'
import { useAgentClaimStore } from '../../stores/agentClaimStore'
import { useAgentBatchClaimStore } from '../../stores/agentBatchClaimStore'

const router = useRouter()
const route = useRoute()
const customerStore = useCustomerStore()
const claimStore = useAgentClaimStore()
const batchClaimStore = useAgentBatchClaimStore()

// ===== 상태 =====
const claimMode = ref<'customer' | 'direct' | null>(null)
const customerSearch = ref('')
const selectedCustomerId = ref<string | null>(null)
const selectedCompanyId = ref<number | null>(null)
const selectedFormId = ref<number | null>(null)
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

const selectedCompanyName = computed(() => {
  if (!selectedCompanyId.value) return null
  const company = claimStore.insuranceCompanies.find(c => c.company_id === selectedCompanyId.value)
  return company?.company_name ?? null
})

// 보험사 섹션 표시 조건: 바로 청구이거나 고객이 선택된 경우
const showCompanySection = computed(() => {
  if (claimMode.value === 'direct') return true
  if (claimMode.value === 'customer' && selectedCustomerId.value) return true
  return false
})

const canProceed = computed(() => {
  if (claimMode.value === 'customer') {
    return selectedCustomerId.value !== null
      && selectedCompanyId.value !== null
      && selectedFormId.value !== null
  }
  if (claimMode.value === 'direct') {
    return selectedCompanyId.value !== null
      && selectedFormId.value !== null
  }
  return false
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

  // 고객 상세에서 넘어온 경우 자동 선택
  if (preselectedCustomerId) {
    claimMode.value = 'customer'
    selectedCustomerId.value = preselectedCustomerId
  }
})

// 보험사 선택 시 양식 로드 + 1개면 자동 선택
watch(selectedCompanyId, async (newId) => {
  selectedFormId.value = null
  if (newId != null) {
    await claimStore.fetchClaimForms(newId)
    if (claimStore.claimForms.length === 1) {
      const form = claimStore.claimForms[0]
      if (form) selectedFormId.value = form.claim_form_id
    }
  } else {
    claimStore.claimForms = []
  }
})

// 모드 변경 시 선택 초기화 (query param으로 자동 선택된 경우 제외)
watch(claimMode, () => {
  if (preselectedCustomerId && selectedCustomerId.value === preselectedCustomerId) return
  selectedCustomerId.value = null
  selectedCompanyId.value = null
  selectedFormId.value = null
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
    selectedCompanyId.value = null
    selectedFormId.value = null
  } else {
    selectedCustomerId.value = customerId
  }
}

function selectCompany(companyId: number): void {
  if (selectedCompanyId.value === companyId) {
    selectedCompanyId.value = null
  } else {
    selectedCompanyId.value = companyId
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

  if (claimMode.value === 'customer') {
    router.push(`/claims/new/${selectedFormId.value}?customerId=${selectedCustomerId.value}`)
  } else {
    // 바로 청구: customerId 없이 이동
    router.push(`/claims/new/${selectedFormId.value}`)
  }
}

function goToBatchClaim(): void {
  router.push({ name: 'agent-batch-claim-new' })
}

function resumeBatchDraft(batchId: number): void {
  router.push({ name: 'agent-batch-claim-edit', params: { batchId } })
}

async function handleDeleteBatchDraft(batchId: number): Promise<void> {
  if (!confirm('임시저장된 다중 청구를 삭제하시겠습니까?')) return
  await batchClaimStore.deleteDraft(batchId)
}
</script>
