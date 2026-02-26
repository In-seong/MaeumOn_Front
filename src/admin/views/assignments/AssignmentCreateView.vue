<template>
  <div class="p-6">
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
      <!-- Left Panel: 미배정 고객 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E8E8E8]">
          <h2 class="text-[16px] font-bold text-[#333] mb-3">미배정 고객</h2>
          <input
            v-model="customerSearch"
            type="text"
            placeholder="고객 이름으로 검색"
            class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            @input="debouncedCustomerSearch"
          />
        </div>

        <!-- 전체 선택 -->
        <div v-if="filteredCustomers.length > 0" class="px-6 py-2 border-b border-[#F0F0F0] flex items-center gap-2">
          <input
            type="checkbox"
            :checked="isAllSelected"
            :indeterminate="isPartialSelected"
            @change="toggleSelectAll"
            class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
          />
          <span class="text-[13px] text-[#999]">
            전체 선택 ({{ selectedCustomerIds.size }}/{{ filteredCustomers.length }})
          </span>
        </div>

        <!-- 로딩 -->
        <div v-if="customersLoading" class="text-center py-10">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22] mx-auto"></div>
          <p class="mt-2 text-[13px] text-[#999]">로딩 중...</p>
        </div>

        <!-- 고객 목록 -->
        <div v-else class="max-h-[400px] overflow-y-auto">
          <div
            v-for="customer in filteredCustomers"
            :key="customer.customer_id"
            class="flex items-center gap-3 px-6 py-3 hover:bg-[#FAFAFA] transition-colors cursor-pointer border-b border-[#F5F5F5] last:border-b-0"
            @click="toggleCustomer(customer.customer_id)"
          >
            <input
              type="checkbox"
              :checked="selectedCustomerIds.has(customer.customer_id)"
              class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22] pointer-events-none"
            />
            <div class="flex-1 min-w-0">
              <p class="text-[14px] font-medium text-[#333]">{{ customer.name }}</p>
              <p class="text-[12px] text-[#999]">{{ formatPhone(customer.phone) }}</p>
            </div>
          </div>
          <div v-if="filteredCustomers.length === 0" class="px-6 py-10 text-center text-[#999] text-[14px]">
            미배정 고객이 없습니다.
          </div>
        </div>
      </div>

      <!-- Right Panel: 배분 대상 설계사 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden">
        <div class="px-6 py-4 border-b border-[#E8E8E8]">
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
        <div v-if="selectedAgent" class="px-6 py-5">
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
        <div v-else class="px-6 py-10 text-center text-[#999] text-[14px]">
          설계사를 선택하면 정보가 표시됩니다.
        </div>

        <!-- 배분 요약 -->
        <div v-if="selectedCustomerIds.size > 0 && selectedAgentId" class="px-6 py-4 border-t border-[#E8E8E8]">
          <div class="bg-[#F0F7FF] rounded-[12px] p-3 text-[13px] text-[#336]">
            <span class="font-medium">{{ selectedCustomerIds.size }}명</span>의 고객을
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAssignmentStore } from '../../stores/assignmentStore'

const router = useRouter()
const store = useAssignmentStore()

const customerSearch = ref('')
const selectedCustomerIds = ref<Set<string>>(new Set())
const selectedAgentId = ref('')
const notes = ref('')
const customersLoading = ref(false)

let customerSearchTimeout: ReturnType<typeof setTimeout>

const filteredCustomers = computed(() => {
  if (!customerSearch.value) return store.unassignedCustomers
  const q = customerSearch.value.toLowerCase()
  return store.unassignedCustomers.filter(
    c => c.name.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
  )
})

const selectedAgent = computed(() => {
  if (!selectedAgentId.value) return null
  return store.agentOptions.find(a => a.agent_id === selectedAgentId.value) || null
})

const isAllSelected = computed(() => {
  return filteredCustomers.value.length > 0 &&
    filteredCustomers.value.every(c => selectedCustomerIds.value.has(c.customer_id))
})

const isPartialSelected = computed(() => {
  if (isAllSelected.value) return false
  return filteredCustomers.value.some(c => selectedCustomerIds.value.has(c.customer_id))
})

const canSubmit = computed(() => {
  return selectedCustomerIds.value.size > 0 && selectedAgentId.value !== ''
})

function toggleCustomer(customerId: string) {
  const newSet = new Set(selectedCustomerIds.value)
  if (newSet.has(customerId)) {
    newSet.delete(customerId)
  } else {
    newSet.add(customerId)
  }
  selectedCustomerIds.value = newSet
}

function toggleSelectAll() {
  if (isAllSelected.value) {
    // Deselect all currently filtered
    const newSet = new Set(selectedCustomerIds.value)
    filteredCustomers.value.forEach(c => newSet.delete(c.customer_id))
    selectedCustomerIds.value = newSet
  } else {
    // Select all currently filtered
    const newSet = new Set(selectedCustomerIds.value)
    filteredCustomers.value.forEach(c => newSet.add(c.customer_id))
    selectedCustomerIds.value = newSet
  }
}

function debouncedCustomerSearch() {
  clearTimeout(customerSearchTimeout)
  customerSearchTimeout = setTimeout(() => {
    loadUnassigned()
  }, 300)
}

async function loadUnassigned() {
  customersLoading.value = true
  try {
    await store.loadUnassignedCustomers({
      search: customerSearch.value || undefined,
    })
  } finally {
    customersLoading.value = false
  }
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

async function handleSubmit() {
  if (!canSubmit.value) return

  const assignments = Array.from(selectedCustomerIds.value).map(customerId => ({
    customer_id: customerId,
    agent_id: selectedAgentId.value,
  }))

  try {
    const result = await store.bulkAssignment({
      assignments,
      notes: notes.value || undefined,
    })

    alert(`${result.created_count}건의 DB 배분이 등록되었습니다.`)
    router.push('/assignments')
  } catch (e: any) {
    alert(e.response?.data?.message || '배분 등록에 실패했습니다.')
  }
}

onMounted(async () => {
  customersLoading.value = true
  try {
    await Promise.all([
      store.loadUnassignedCustomers(),
      store.loadAgentOptions(),
    ])
  } finally {
    customersLoading.value = false
  }
})
</script>
