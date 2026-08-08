<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center gap-3 mb-6">
      <button
        @click="router.push('/assignments')"
        class="p-1.5 rounded-[8px] hover:bg-[#F0F0F0] transition-colors"
      >
        <span class="material-symbols-outlined text-[20px] text-[#999]">arrow_back</span>
      </button>
      <h1 class="text-[22px] font-bold text-[#333]">기업용 배분 등록</h1>
    </div>

    <!-- 에러 표시 -->
    <div v-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px] mb-4">
      {{ store.error }}
    </div>

    <!-- 2-Panel Layout -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      <!-- Left Panel: 미배분 기업 문의 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <div class="px-4 lg:px-6 py-4 border-b border-[#E8E8E8]">
          <h2 class="text-[16px] font-bold text-[#333] mb-3">미배분 기업 문의</h2>
          <input
            v-model="inquirySearch"
            type="text"
            placeholder="업체명, 대표자명으로 검색"
            class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            @input="debouncedSearch"
          />
        </div>

        <!-- 신규 기업 고객 등록 토글 -->
        <div class="px-4 lg:px-6 py-3 border-b border-[#F0F0F0]">
          <button
            @click="showNewForm = !showNewForm"
            class="flex items-center gap-1.5 text-[13px] font-medium text-[#FF7B22] hover:text-[#E56D1E] transition-colors"
          >
            <span class="material-symbols-outlined text-[18px]">{{ showNewForm ? 'close' : 'domain_add' }}</span>
            {{ showNewForm ? '닫기' : '신규 기업 고객 등록' }}
          </button>

          <!-- 인라인 등록 폼 -->
          <div v-if="showNewForm" class="mt-3 p-4 bg-[#FAFAFA] rounded-[12px] border border-[#E8E8E8]">
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <!-- 1. 업체명 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">업체명 *</label>
                <input
                  v-model="newInquiry.company_name"
                  type="text"
                  placeholder="업체명"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <!-- 2. 지역(시/도/군) -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">지역 (시/도/군)</label>
                <input
                  v-model="newInquiry.address"
                  type="text"
                  placeholder="예: 서울시 강남구"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <!-- 3. 대표자명 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">대표자명 *</label>
                <input
                  v-model="newInquiry.ceo_name"
                  type="text"
                  placeholder="대표자명"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <!-- 4. 휴대폰번호 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">휴대폰번호 *</label>
                <input
                  v-model="newInquiry.phone"
                  type="tel"
                  placeholder="010-1234-5678"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] placeholder-[#BBB] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>
              <!-- 5. 업태 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">업태</label>
                <select
                  v-model="newInquiry.industry"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">선택</option>
                  <option value="제조업">제조업</option>
                  <option value="도소매업">도소매업</option>
                  <option value="서비스업">서비스업</option>
                  <option value="음식점업">음식점업</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <!-- 6. 연매출 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">연매출</label>
                <select
                  v-model="newInquiry.annual_revenue"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">선택</option>
                  <option value="4억미만">4억미만</option>
                  <option value="4~10억">4~10억</option>
                  <option value="10~30억">10~30억</option>
                  <option value="30억이상">30억이상</option>
                </select>
              </div>
              <!-- 7. 상담목적 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">상담목적</label>
                <select
                  v-model="newInquiry.consultation_field"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">선택</option>
                  <option value="운영자금">운영자금</option>
                  <option value="시설자금">시설자금</option>
                  <option value="특허및인증">특허및인증</option>
                  <option value="증여/상속/가업승계">증여/상속/가업승계</option>
                  <option value="기타">기타</option>
                </select>
              </div>
              <!-- 8. 담당설계사 -->
              <div>
                <label class="block text-[12px] font-medium text-[#666] mb-1">담당설계사</label>
                <select
                  v-model="newInquiry.agent_id"
                  class="w-full px-3 py-2 bg-white border border-[#E8E8E8] rounded-[8px] text-[13px] text-[#333] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option value="">미배정</option>
                  <option
                    v-for="agent in store.agentOptions"
                    :key="agent.agent_id"
                    :value="agent.agent_id"
                  >
                    {{ agent.name }} ({{ agent.agent_id }})
                  </option>
                </select>
              </div>
            </div>
            <div class="flex justify-end mt-3">
              <button
                @click="handleCreateInquiry"
                :disabled="!canCreateInquiry || creatingInquiry"
                :class="[
                  'px-4 py-2 rounded-[8px] text-[13px] font-medium transition-colors',
                  canCreateInquiry && !creatingInquiry
                    ? 'bg-[#FF7B22] text-white hover:bg-[#E56D1E]'
                    : 'bg-[#E8E8E8] text-[#999] cursor-not-allowed'
                ]"
              >
                {{ creatingInquiry ? '등록 중...' : '등록' }}
              </button>
            </div>
          </div>
        </div>

        <!-- 전체 선택 -->
        <div v-if="filteredInquiries.length > 0" class="px-4 lg:px-6 py-2 border-b border-[#F0F0F0] flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartialSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
          />
          <span class="text-[13px] text-[#999]">
            전체 선택 ({{ selectedIds.size }}/{{ filteredInquiries.length }})
          </span>
        </div>

        <!-- 로딩 -->
        <div v-if="inquiriesLoading" class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          <p class="mt-2 text-[13px] text-[#999]">로딩 중...</p>
        </div>

        <!-- 문의 목록 -->
        <div v-else class="max-h-[400px] overflow-y-auto">
          <div
            v-for="inquiry in filteredInquiries"
            :key="inquiry.id"
            class="flex items-center gap-3 px-4 lg:px-6 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer border-b border-[#F5F5F5] last:border-b-0"
            @click="toggleInquiry(inquiry.id)"
          >
            <input
              type="checkbox"
              :checked="selectedIds.has(inquiry.id)"
              class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22] pointer-events-none"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-medium text-[#333]">{{ inquiry.company_name }}</p>
              <p class="text-[12px] text-[#999]">{{ inquiry.ceo_name }} · {{ inquiry.phone }}</p>
              <p v-if="inquiry.industry || inquiry.consultation_field" class="text-[11px] text-[#BBB] mt-0.5">
                {{ [inquiry.industry, inquiry.consultation_field].filter(Boolean).join(' · ') }}
              </p>
            </div>
            <button
              @click.stop="showInquiryDetail(inquiry)"
              class="p-1.5 rounded-[8px] hover:bg-[#F0F0F0] transition-colors shrink-0"
              title="상세보기"
            >
              <span class="material-symbols-outlined text-[18px] text-[#999]">info</span>
            </button>
          </div>
          <div v-if="filteredInquiries.length === 0" class="px-4 lg:px-6 py-10 text-center text-[#999] text-[14px]">
            미배분 기업 문의가 없습니다.
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
            <span class="font-medium">{{ selectedIds.size }}건</span>의 기업 문의를
            <span class="font-medium">{{ selectedAgent?.name }}</span> 설계사에게 배분합니다.
          </div>
        </div>
      </div>
    </div>

    <!-- 비고 및 제출 -->
    <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
      <label class="block text-[14px] font-medium text-[#333] mb-2">비고 (선택)</label>
      <textarea
        v-model="notes"
        rows="3"
        placeholder="배분 관련 메모를 입력하세요"
        class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] resize-none"
      ></textarea>

      <div class="flex justify-end gap-3 mt-4">
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
          <span v-else>대량 배분</span>
        </button>
      </div>
    </div>

    <!-- 기업 문의 상세보기 모달 -->
    <div v-if="detailInquiry" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="detailInquiry = null">
      <div class="bg-white rounded-[16px] w-full max-w-[420px] max-h-[80vh] overflow-y-auto">
        <div class="flex items-center justify-between px-5 py-4 border-b border-[#E8E8E8]">
          <h3 class="text-[16px] font-bold text-[#333]">기업 문의 상세</h3>
          <button @click="detailInquiry = null" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div class="px-5 py-4 space-y-3">
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">업체명</span>
            <span class="text-[#333] font-medium">{{ detailInquiry.company_name }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">대표자명</span>
            <span class="text-[#333]">{{ detailInquiry.ceo_name }}</span>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">전화번호</span>
            <span class="text-[#333]">{{ formatPhone(detailInquiry.phone) }}</span>
          </div>
          <div v-if="detailInquiry.address" class="flex justify-between text-[13px]">
            <span class="text-[#999]">지역</span>
            <span class="text-[#333]">{{ detailInquiry.address }}</span>
          </div>
          <div v-if="detailInquiry.industry" class="flex justify-between text-[13px]">
            <span class="text-[#999]">업태</span>
            <span class="text-[#333]">{{ detailInquiry.industry }}</span>
          </div>
          <div v-if="detailInquiry.annual_revenue" class="flex justify-between text-[13px]">
            <span class="text-[#999]">연매출</span>
            <span class="text-[#333]">{{ detailInquiry.annual_revenue }}</span>
          </div>
          <div v-if="detailInquiry.consultation_field" class="flex justify-between text-[13px]">
            <span class="text-[#999]">상담목적</span>
            <span class="text-[#333]">{{ detailInquiry.consultation_field }}</span>
          </div>
          <div v-if="detailInquiry.notes" class="text-[13px]">
            <p class="text-[#999] mb-1">메모</p>
            <p class="text-[#333] bg-[#F8F8F8] rounded-[8px] px-3 py-2 whitespace-pre-wrap">{{ detailInquiry.notes }}</p>
          </div>
          <div class="flex justify-between text-[13px]">
            <span class="text-[#999]">등록일</span>
            <span class="text-[#333]">{{ detailInquiry.created_at?.slice(0, 10) }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useCorporateInquiryStore } from '../../stores/corporateInquiryStore'
import { createCorporateInquiry, type CorporateInquiry } from '../../services/adminApi'

const router = useRouter()
const store = useCorporateInquiryStore()

const inquirySearch = ref('')
const selectedIds = ref<Set<number>>(new Set())
const selectedAgentId = ref('')
const notes = ref('')
const inquiriesLoading = ref(false)
const detailInquiry = ref<CorporateInquiry | null>(null)

const showNewForm = ref(false)
const creatingInquiry = ref(false)
const newInquiry = ref({
  company_name: '',
  address: '',
  ceo_name: '',
  phone: '',
  industry: '',
  annual_revenue: '',
  consultation_field: '',
  agent_id: '',
})

const canCreateInquiry = computed(() =>
  newInquiry.value.company_name && newInquiry.value.ceo_name && newInquiry.value.phone
)

let searchTimeout: ReturnType<typeof setTimeout>

const filteredInquiries = computed(() => {
  if (!inquirySearch.value) return store.unassignedInquiries
  const q = inquirySearch.value.toLowerCase()
  return store.unassignedInquiries.filter(
    i => i.company_name.toLowerCase().includes(q) ||
      i.ceo_name.toLowerCase().includes(q) ||
      (i.phone && i.phone.includes(q))
  )
})

const selectedAgent = computed(() => {
  if (!selectedAgentId.value) return null
  return store.agentOptions.find(a => a.agent_id === selectedAgentId.value) || null
})

const isAllSelected = computed(() => {
  return filteredInquiries.value.length > 0 &&
    filteredInquiries.value.every(i => selectedIds.value.has(i.id))
})

const isPartialSelected = computed(() => {
  if (isAllSelected.value) return false
  return filteredInquiries.value.some(i => selectedIds.value.has(i.id))
})

const canSubmit = computed(() => {
  return selectedIds.value.size > 0 && selectedAgentId.value !== ''
})

function toggleInquiry(id: number) {
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
    filteredInquiries.value.forEach(i => newSet.delete(i.id))
    selectedIds.value = newSet
  } else {
    const newSet = new Set(selectedIds.value)
    filteredInquiries.value.forEach(i => newSet.add(i.id))
    selectedIds.value = newSet
  }
}

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    loadUnassigned()
  }, 300)
}

async function loadUnassigned() {
  inquiriesLoading.value = true
  try {
    await store.loadUnassigned({
      search: inquirySearch.value || undefined,
    })
  } finally {
    inquiriesLoading.value = false
  }
}

function showInquiryDetail(inquiry: CorporateInquiry) {
  detailInquiry.value = inquiry
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

async function handleCreateInquiry() {
  if (!canCreateInquiry.value) return
  creatingInquiry.value = true
  try {
    const data: Record<string, unknown> = {
      company_name: newInquiry.value.company_name,
      ceo_name: newInquiry.value.ceo_name,
      phone: newInquiry.value.phone,
    }
    if (newInquiry.value.address) data.address = newInquiry.value.address
    if (newInquiry.value.industry) data.industry = newInquiry.value.industry
    if (newInquiry.value.annual_revenue) data.annual_revenue = newInquiry.value.annual_revenue
    if (newInquiry.value.consultation_field) data.consultation_field = newInquiry.value.consultation_field
    if (newInquiry.value.agent_id) data.agent_id = newInquiry.value.agent_id

    await createCorporateInquiry(data)
    newInquiry.value = {
      company_name: '', address: '', ceo_name: '', phone: '',
      industry: '', annual_revenue: '', consultation_field: '', agent_id: '',
    }
    showNewForm.value = false
    await loadUnassigned()
    alert('기업 고객이 등록되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '기업 고객 등록에 실패했습니다.')
  } finally {
    creatingInquiry.value = false
  }
}

async function handleSubmit() {
  if (!canSubmit.value) return

  try {
    await store.assignInquiries({
      inquiry_ids: Array.from(selectedIds.value),
      agent_id: selectedAgentId.value,
      notes: notes.value || undefined,
    })

    alert(`${selectedIds.value.size}건의 기업 문의가 배분되었습니다.`)
    router.push('/assignments')
  } catch (e: any) {
    alert(e.response?.data?.message || '배분 등록에 실패했습니다.')
  }
}

onMounted(async () => {
  inquiriesLoading.value = true
  try {
    await Promise.all([
      store.loadUnassigned(),
      store.loadAgentOptions(),
    ])
  } finally {
    inquiriesLoading.value = false
  }
})
</script>
