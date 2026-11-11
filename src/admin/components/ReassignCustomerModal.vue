<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 z-50 flex items-center justify-center"
      @click.self="$emit('close')"
    >
      <div class="absolute inset-0 bg-black/40" />
      <div class="relative bg-white rounded-[16px] shadow-xl w-full max-w-[720px] mx-4 h-[80vh] flex flex-col overflow-hidden">
        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-[#F0F0F0]">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-[16px] font-bold text-[#333]">{{ deleteMode ? '설계사 삭제 — 고객 이관' : '고객 재배분' }}</h2>
              <p class="text-[13px] text-[#999] mt-0.5">{{ deleteMode ? `${agentName}의 모든 고객을 이관 후 삭제합니다` : `${agentName} → 다른 설계사` }}</p>
            </div>
            <button
              @click="$emit('close')"
              class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors"
            >
              <span class="material-symbols-outlined text-[20px] text-[#999]">close</span>
            </button>
          </div>
          <!-- 스텝 인디케이터 -->
          <div class="flex items-center gap-2 mt-3">
            <template v-for="s in (deleteMode ? [2, 3] : [1, 2, 3])" :key="s">
              <div v-if="s > (deleteMode ? 2 : 1)" class="w-6 h-px bg-[#E0E0E0]" />
              <div class="flex items-center gap-1.5">
                <div
                  class="w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-semibold"
                  :class="step === s ? 'bg-[#FF7B22] text-white' : step > s ? 'bg-[#FF7B22]/20 text-[#FF7B22]' : 'bg-[#F0F0F0] text-[#999]'"
                >{{ s }}</div>
                <span class="text-[12px]" :class="step === s ? 'text-[#333] font-medium' : 'text-[#999]'">
                  {{ s === 1 ? '고객 선택' : s === 2 ? '대상 설계사' : '확인' }}
                </span>
              </div>
            </template>
          </div>
        </div>

        <!-- Step 1: 고객 선택 -->
        <template v-if="step === 1">
          <div class="px-6 py-3 border-b border-[#F0F0F0] flex items-center gap-3">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="이름, 연락처로 검색"
              class="flex-1 px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              @input="debouncedSearch"
            />
            <label class="flex items-center gap-1.5 text-[13px] text-[#666] cursor-pointer select-none whitespace-nowrap">
              <input
                type="checkbox"
                :checked="isAllSelected"
                :indeterminate="isPartialSelected"
                class="w-4 h-4 accent-[#FF7B22] cursor-pointer"
                @change="toggleSelectAll"
              />
              전체 ({{ totalCount }})
            </label>
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto">
            <div v-if="loading" class="flex items-center justify-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
            </div>
            <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
              <thead class="bg-[#FAFAFA] sticky top-0 z-[1]">
                <tr>
                  <th class="px-4 py-3 w-[44px]"></th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">이름</th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">연락처</th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">등록일</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-[#F0F0F0]">
                <tr
                  v-for="customer in customers"
                  :key="customer.customer_id"
                  class="hover:bg-[#FAFAFA] cursor-pointer"
                  :class="selectedIds.has(customer.customer_id) ? 'bg-[#FFF8F3]' : ''"
                  @click="toggleCustomer(customer.customer_id)"
                >
                  <td class="px-4 py-3 text-center">
                    <input
                      type="checkbox"
                      :checked="selectedIds.has(customer.customer_id)"
                      class="w-4 h-4 accent-[#FF7B22] cursor-pointer"
                      @click.stop
                      @change="toggleCustomer(customer.customer_id)"
                    />
                  </td>
                  <td class="px-4 py-3 text-[14px] font-medium text-[#333]">{{ customer.name }}</td>
                  <td class="px-4 py-3 text-[14px] text-[#999]">{{ formatPhone(customer.phone) }}</td>
                  <td class="px-4 py-3 text-[14px] text-[#999] hidden sm:table-cell">{{ formatDate(customer.created_at) }}</td>
                </tr>
                <tr v-if="customers.length === 0 && !loading">
                  <td colspan="4" class="px-6 py-10 text-center text-[#999] text-[14px]">
                    {{ searchQuery ? '검색 결과가 없습니다.' : '담당 고객이 없습니다.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <Pagination
            v-if="pagination && pagination.last_page > 1"
            :current-page="pagination.current_page"
            :last-page="pagination.last_page"
            @change="fetchCustomerList"
          />

          <div class="px-6 py-4 border-t border-[#F0F0F0] flex items-center justify-between">
            <p class="text-[13px] text-[#666]">
              <span class="font-semibold text-[#FF7B22]">{{ selectedIds.size }}명</span> 선택됨
            </p>
            <button
              :disabled="selectedIds.size === 0"
              class="px-5 py-2.5 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:bg-[#E0E0E0] disabled:text-[#999] transition-colors"
              @click="step = 2"
            >다음</button>
          </div>
        </template>

        <!-- Step 2: 대상 설계사 선택 -->
        <template v-if="step === 2">
          <div class="px-6 py-3 border-b border-[#F0F0F0]">
            <input
              v-model="agentSearchQuery"
              type="text"
              placeholder="설계사 이름, 사번으로 검색"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              @input="debouncedAgentSearch"
            />
          </div>

          <div class="flex-1 min-h-0 overflow-y-auto">
            <div v-if="agentLoading" class="flex items-center justify-center h-full">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
            </div>
            <table v-else class="min-w-full divide-y divide-[#E8E8E8]">
              <thead class="bg-[#FAFAFA] sticky top-0 z-[1]">
                <tr>
                  <th class="px-4 py-3 w-[44px]"></th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">이름</th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">사번</th>
                  <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase">담당고객수</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-[#F0F0F0]">
                <tr
                  v-for="agent in targetAgents"
                  :key="agent.agent_id"
                  class="hover:bg-[#FAFAFA] cursor-pointer"
                  :class="targetAgentId === agent.agent_id ? 'bg-[#FFF8F3]' : ''"
                  @click="targetAgentId = agent.agent_id"
                >
                  <td class="px-4 py-3 text-center">
                    <input
                      type="radio"
                      :checked="targetAgentId === agent.agent_id"
                      class="w-4 h-4 accent-[#FF7B22] cursor-pointer"
                      @click.stop
                      @change="targetAgentId = agent.agent_id"
                    />
                  </td>
                  <td class="px-4 py-3 text-[14px] font-medium text-[#333]">{{ agent.name }}</td>
                  <td class="px-4 py-3 text-[14px] text-[#999] hidden sm:table-cell">{{ agent.employee_number || '-' }}</td>
                  <td class="px-4 py-3 text-[14px] text-[#999]">{{ agent.customers_count ?? 0 }}명</td>
                </tr>
                <tr v-if="targetAgents.length === 0 && !agentLoading">
                  <td colspan="4" class="px-6 py-10 text-center text-[#999] text-[14px]">
                    {{ agentSearchQuery ? '검색 결과가 없습니다.' : '이관 가능한 설계사가 없습니다.' }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="px-6 py-4 border-t border-[#F0F0F0] flex items-center justify-between">
            <button
              v-if="!deleteMode"
              class="px-4 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[10px] text-[14px] font-medium transition-colors hover:bg-[#F8F8F8]"
              @click="step = 1"
            >이전</button>
            <span v-else />
            <button
              :disabled="!targetAgentId || previewLoading"
              class="px-5 py-2.5 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:bg-[#E0E0E0] disabled:text-[#999] transition-colors"
              @click="goToStep3"
            >{{ previewLoading ? '확인 중...' : '다음' }}</button>
          </div>
        </template>

        <!-- Step 3: 확인 -->
        <template v-if="step === 3">
          <div class="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <div class="bg-[#FFF8F3] rounded-[12px] p-5 mb-5">
              <p class="text-[15px] font-semibold text-[#333] mb-3">재배분 요약</p>
              <div class="space-y-2 text-[14px]">
                <div class="flex justify-between">
                  <span class="text-[#999]">원래 설계사</span>
                  <span class="font-medium text-[#333]">{{ agentName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#999]">대상 설계사</span>
                  <span class="font-medium text-[#FF7B22]">{{ targetAgentName }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-[#999]">이관 고객 수</span>
                  <span class="font-medium text-[#333]">{{ selectedIds.size }}명</span>
                </div>
              </div>
            </div>

            <div class="bg-[#F8F8F8] rounded-[12px] p-4">
              <p class="text-[13px] font-medium text-[#666] mb-2">이관 대상 고객</p>
              <div class="flex flex-wrap gap-2">
                <span
                  v-for="name in selectedCustomerNames"
                  :key="name"
                  class="px-2.5 py-1 bg-white border border-[#E8E8E8] rounded-full text-[13px] text-[#333]"
                >{{ name }}</span>
              </div>
            </div>

            <div class="mt-4 bg-white border border-[#E8E8E8] rounded-[12px] p-4">
              <p class="text-[13px] font-medium text-[#666] mb-3">함께 이관되는 데이터</p>
              <div class="flex flex-wrap gap-2">
                <span v-for="item in previewItems" :key="item.key"
                  class="px-3 py-1.5 rounded-full text-[13px]"
                  :class="item.count > 0
                    ? 'bg-[#FFF3ED] text-[#FF7B22] font-medium'
                    : 'bg-[#F5F5F5] text-[#BBB]'"
                >{{ item.label }} {{ item.count }}건</span>
              </div>
            </div>
          </div>

          <div class="px-6 py-4 border-t border-[#F0F0F0] flex items-center justify-between">
            <button
              class="px-4 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[10px] text-[14px] font-medium transition-colors hover:bg-[#F8F8F8]"
              @click="step = 2"
            >이전</button>
            <button
              :disabled="submitting"
              class="px-6 py-2.5 text-white rounded-[10px] text-[14px] font-semibold disabled:opacity-50 transition-colors"
              :class="deleteMode ? 'bg-red-500 hover:bg-red-600' : 'bg-[#FF7B22] hover:bg-[#E56D1E]'"
              @click="handleReassign"
            >{{ submitting ? '처리 중...' : (deleteMode ? '이관 후 삭제' : '재배분 실행') }}</button>
          </div>
        </template>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { fetchCustomers as apiFetchCustomers, fetchAgents as apiFetchAgents, reassignCustomers, reassignPreview } from '../services/adminApi'
import type { AdminCustomer, AdminAgent } from '../types'
import Pagination from './Pagination.vue'

const props = defineProps<{
  visible: boolean
  agentId: string
  agentName: string
  deleteMode?: boolean
}>()

const emit = defineEmits<{
  close: []
  done: []
  delete: []
}>()

const step = ref(1)
const loading = ref(false)
const submitting = ref(false)
const searchQuery = ref('')
const totalCount = ref(0)
const customers = ref<AdminCustomer[]>([])
const allCustomerIds = ref<string[]>([])
const selectedIds = ref<Set<string>>(new Set())
const selectedCustomerNames = ref<string[]>([])
const pagination = ref<{ current_page: number; last_page: number } | null>(null)

const agentLoading = ref(false)
const agentSearchQuery = ref('')
const targetAgents = ref<AdminAgent[]>([])
const targetAgentId = ref<string | null>(null)

const previewLoading = ref(false)
const previewCounts = ref<Record<string, number>>({})

const PREVIEW_LABELS: Record<string, string> = {
  claims: '보험 청구',
  batch_claims: '배치 청구',
  contracts: '계약',
  consultations: '상담',
  calendar_events: '일정',
  claim_requests: '청구 신청',
  corporate_inquiries: '기업문의',
  complaints: '불만접수',
}

const previewItems = computed(() =>
  Object.entries(PREVIEW_LABELS).map(([key, label]) => ({
    key,
    label,
    count: previewCounts.value[key] ?? 0,
  }))
)

let searchTimeout: ReturnType<typeof setTimeout>
let agentSearchTimeout: ReturnType<typeof setTimeout>

const isAllSelected = computed(() =>
  allCustomerIds.value.length > 0 && allCustomerIds.value.every(id => selectedIds.value.has(id))
)

const isPartialSelected = computed(() =>
  !isAllSelected.value && allCustomerIds.value.some(id => selectedIds.value.has(id))
)

const targetAgentName = computed(() =>
  targetAgents.value.find(a => a.agent_id === targetAgentId.value)?.name ?? ''
)

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => fetchCustomerList(1), 300)
}

function debouncedAgentSearch() {
  clearTimeout(agentSearchTimeout)
  agentSearchTimeout = setTimeout(() => fetchAgentList(), 300)
}

function toggleCustomer(customerId: string) {
  const newSet = new Set(selectedIds.value)
  if (newSet.has(customerId)) {
    newSet.delete(customerId)
  } else {
    newSet.add(customerId)
  }
  selectedIds.value = newSet
  updateSelectedNames()
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    allCustomerIds.value.forEach(id => selectedIds.value.delete(id))
  } else {
    allCustomerIds.value.forEach(id => selectedIds.value.add(id))
  }
  selectedIds.value = new Set(selectedIds.value)
  updateSelectedNames()
}

function updateSelectedNames() {
  const nameMap = new Map(customers.value.map(c => [c.customer_id, c.name]))
  selectedCustomerNames.value = [...selectedIds.value]
    .map(id => nameMap.get(id))
    .filter((n): n is string => !!n)
}

async function fetchCustomerList(page = 1) {
  loading.value = true
  try {
    const res = await apiFetchCustomers({
      agent_id: props.agentId,
      search: searchQuery.value || undefined,
      page,
      per_page: 20,
    })
    const data = res.data.data
    customers.value = data.data
    totalCount.value = data.total
    allCustomerIds.value = data.data.map((c: AdminCustomer) => c.customer_id)
    pagination.value = { current_page: data.current_page, last_page: data.last_page }
  } catch {
    customers.value = []
    totalCount.value = 0
    allCustomerIds.value = []
    pagination.value = null
  } finally {
    loading.value = false
  }
}

async function fetchAgentList() {
  agentLoading.value = true
  try {
    const res = await apiFetchAgents({
      search: agentSearchQuery.value || undefined,
      is_active: 'true',
      per_page: 'all',
    })
    targetAgents.value = (res.data.data.data as AdminAgent[]).filter(a => a.agent_id !== props.agentId)
  } catch {
    targetAgents.value = []
  } finally {
    agentLoading.value = false
  }
}

async function goToStep3() {
  if (!targetAgentId.value || selectedIds.value.size === 0) return
  previewLoading.value = true
  try {
    const res = await reassignPreview(props.agentId, [...selectedIds.value])
    previewCounts.value = res.data.data ?? {}
  } catch {
    previewCounts.value = {}
  } finally {
    previewLoading.value = false
  }
  step.value = 3
}

async function handleReassign() {
  if (!targetAgentId.value || selectedIds.value.size === 0) return
  submitting.value = true
  try {
    const res = await reassignCustomers(props.agentId, {
      to_agent_id: targetAgentId.value,
      customer_ids: [...selectedIds.value],
    })
    if (props.deleteMode) {
      emit('delete')
    } else {
      alert(res.data.message || '재배분이 완료되었습니다.')
      emit('done')
      emit('close')
    }
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '재배분 중 오류가 발생했습니다.')
  } finally {
    submitting.value = false
  }
}

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return phone
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

watch(() => props.visible, async (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    agentSearchQuery.value = ''
    selectedIds.value = new Set()
    selectedCustomerNames.value = []
    targetAgentId.value = null
    targetAgents.value = []
    previewCounts.value = {}

    if (props.deleteMode) {
      loading.value = true
      try {
        const res = await apiFetchCustomers({
          agent_id: props.agentId,
          per_page: 9999,
        })
        const data = res.data.data
        customers.value = data.data
        totalCount.value = data.total
        allCustomerIds.value = data.data.map((c: AdminCustomer) => c.customer_id)
        selectedIds.value = new Set(allCustomerIds.value)
        updateSelectedNames()
      } catch {
        customers.value = []
        totalCount.value = 0
        allCustomerIds.value = []
      } finally {
        loading.value = false
      }
      step.value = 2
      fetchAgentList()
    } else {
      step.value = 1
      fetchCustomerList(1)
    }
  }
})

watch(step, (newStep) => {
  if (newStep === 2 && targetAgents.value.length === 0) {
    fetchAgentList()
  }
  if (newStep === 3) {
    updateSelectedNames()
  }
})
</script>
