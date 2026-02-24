<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[430px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험금 청구" />

      <main class="px-5 py-4 pb-28 overflow-y-auto" style="height: calc(100vh - 56px);">

        <!-- 청구 유형 선택 (첫 화면) -->
        <section v-if="!claimMode" class="mt-2">
          <p class="text-[16px] font-bold text-[#222] mb-4">청구 방식을 선택하세요</p>

          <div class="flex flex-col gap-3">
            <button
              type="button"
              class="w-full text-left rounded-[16px] bg-white border-[1.5px] border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 active:scale-[0.98] transition-all"
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
              class="w-full text-left rounded-[16px] bg-white border-[1.5px] border-transparent shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 active:scale-[0.98] transition-all"
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
          </div>
        </section>

        <!-- ===== 고객 선택 모드 ===== -->
        <template v-if="claimMode === 'customer'">
          <!-- 1단계: 고객 선택 -->
          <section class="mb-5">
            <div class="flex items-center gap-2 mb-3">
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
                class="w-full bg-white rounded-[12px] pl-10 pr-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] shadow-[0_0_6px_rgba(0,0,0,0.05)]"
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
              class="flex flex-col gap-2 max-h-[240px] overflow-y-auto rounded-[12px]"
            >
              <button
                v-for="customer in customerStore.customers"
                :key="customer.customer_id"
                type="button"
                class="flex items-center gap-3 px-4 py-3 rounded-[12px] text-left transition-all active:scale-[0.98]"
                :class="
                  selectedCustomerId === customer.customer_id
                    ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                    : 'bg-white border-[1.5px] border-transparent shadow-[0_0_6px_rgba(0,0,0,0.04)]'
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
          </section>
        </template>

        <!-- ===== 보험사 선택 (고객 모드: 고객 선택 후 / 바로 모드: 바로 표시) ===== -->
        <section v-if="showCompanySection" class="mb-5">
          <div class="flex items-center gap-2 mb-3">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedCompanyId ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '2' : '1' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">보험사 선택</h2>
            <span v-if="selectedCompanyName" class="ml-auto text-[13px] text-[#FF7B22] font-medium">
              {{ selectedCompanyName }}
            </span>
          </div>

          <div v-if="claimStore.loadingCompanies" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="grid grid-cols-2 gap-2">
            <button
              v-for="company in claimStore.insuranceCompanies"
              :key="company.company_id"
              type="button"
              class="rounded-[12px] px-3 py-3 text-left transition-all active:scale-[0.98]"
              :class="
                selectedCompanyId === company.company_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-white border-[1.5px] border-transparent shadow-[0_0_6px_rgba(0,0,0,0.04)]'
              "
              @click="selectCompany(company.company_id)"
            >
              <p class="text-[13px] font-semibold text-[#222]">{{ company.company_name }}</p>
            </button>
          </div>

          <div
            v-if="claimStore.insuranceCompanies.length === 0 && !claimStore.loadingCompanies"
            class="text-center py-6"
          >
            <p class="text-[13px] text-[#999]">등록된 보험사가 없습니다.</p>
          </div>
        </section>

        <!-- ===== 양식 선택 ===== -->
        <section v-if="selectedCompanyId" class="mb-5">
          <div class="flex items-center gap-2 mb-3">
            <span
              class="w-6 h-6 rounded-full text-[12px] font-bold flex items-center justify-center shrink-0"
              :class="selectedFormId ? 'bg-[#FF7B22] text-white' : 'bg-[#FF7B22]/20 text-[#FF7B22]'"
            >{{ claimMode === 'customer' ? '3' : '2' }}</span>
            <h2 class="text-[15px] font-semibold text-[#222]">양식 선택</h2>
          </div>

          <div v-if="claimStore.loadingClaimForms" class="flex items-center justify-center py-6">
            <div class="animate-spin rounded-full h-7 w-7 border-b-2 border-[#FF7B22]"></div>
          </div>

          <div v-else class="flex flex-col gap-3">
            <button
              v-for="form in claimStore.claimForms"
              :key="form.claim_form_id"
              type="button"
              class="block w-full text-left active:scale-[0.98] transition-all rounded-[12px] p-4"
              :class="
                selectedFormId === form.claim_form_id
                  ? 'bg-[#FFF0E5] border-[1.5px] border-[#FF7B22]'
                  : 'bg-white border-[1.5px] border-transparent shadow-[0_0_6px_rgba(0,0,0,0.04)]'
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
        </section>

        <!-- 에러 -->
        <div v-if="claimStore.error" class="p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000] mb-4">
          {{ claimStore.error }}
        </div>
      </main>

      <!-- 하단 버튼 -->
      <div class="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-white via-white to-transparent pt-8">
        <!-- 모드 선택 전에는 버튼 숨김 -->
        <button
          v-if="claimMode"
          type="button"
          :disabled="!canProceed"
          class="w-full py-3.5 rounded-[12px] text-[15px] font-semibold transition-all active:scale-[0.98]"
          :class="
            canProceed
              ? 'bg-[#FF7B22] text-white shadow-[0_4px_16px_rgba(255,123,34,0.3)]'
              : 'bg-[#E0E0E0] text-[#AAAAAA] cursor-not-allowed'
          "
          @click="goNext"
        >
          다음 단계
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import { useCustomerStore } from '../../stores/customerStore'
import { useAgentClaimStore } from '../../stores/agentClaimStore'

const router = useRouter()
const customerStore = useCustomerStore()
const claimStore = useAgentClaimStore()

// ===== 상태 =====
const claimMode = ref<'customer' | 'direct' | null>(null)
const customerSearch = ref('')
const selectedCustomerId = ref<string | null>(null)
const selectedCompanyId = ref<number | null>(null)
const selectedFormId = ref<number | null>(null)

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
onMounted(async () => {
  await Promise.all([
    customerStore.loadCustomers(),
    claimStore.fetchInsuranceCompanies(),
  ])
})

// 보험사 선택 시 양식 로드
watch(selectedCompanyId, async (newId) => {
  selectedFormId.value = null
  if (newId != null) {
    await claimStore.fetchClaimForms(newId)
  } else {
    claimStore.claimForms = []
  }
})

// 모드 변경 시 선택 초기화
watch(claimMode, () => {
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

function goNext(): void {
  if (!canProceed.value) return

  if (claimMode.value === 'customer') {
    router.push(`/claims/new/${selectedFormId.value}?customerId=${selectedCustomerId.value}`)
  } else {
    // 바로 청구: customerId 없이 이동
    router.push(`/claims/new/${selectedFormId.value}`)
  }
}
</script>
