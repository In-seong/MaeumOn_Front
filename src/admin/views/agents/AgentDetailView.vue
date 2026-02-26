<template>
  <div class="p-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <router-link to="/agents" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ agent?.name || '설계사 상세' }}
        </h1>
        <span
          v-if="agent"
          :class="agent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
          class="ml-3 px-2.5 py-1 text-[12px] font-medium rounded-full"
        >
          {{ agent.is_active ? '활성화' : '비활성화' }}
        </span>
      </div>
      <router-link
        v-if="agent"
        :to="`/agents/${agent.agent_id}/edit`"
        class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
      >
        수정
      </router-link>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 콘텐츠 -->
    <div v-else-if="agent">
      <!-- 요약 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-[#FFF3ED] rounded-[12px] flex items-center justify-center mr-4">
              <span class="material-symbols-outlined text-[20px] text-[#FF7B22]">group</span>
            </div>
            <div>
              <p class="text-[12px] text-[#999]">담당 고객 수</p>
              <p class="text-[22px] font-bold text-[#333]">{{ agent.customers_count ?? 0 }}</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5">
          <div class="flex items-center">
            <div class="w-10 h-10 bg-[#FFF3ED] rounded-[12px] flex items-center justify-center mr-4">
              <span class="material-symbols-outlined text-[20px] text-[#FF7B22]">description</span>
            </div>
            <div>
              <p class="text-[12px] text-[#999]">계약 건수</p>
              <p class="text-[22px] font-bold text-[#333]">{{ agent.contracts_count ?? 0 }}</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 기본정보 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-6">
        <h2 class="text-[15px] font-medium text-[#333] mb-4">기본 정보</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p class="text-[12px] text-[#999] mb-1">설계사 ID</p>
            <p class="text-[14px] text-[#333]">{{ agent.agent_id }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">사번</p>
            <p class="text-[14px] text-[#333]">{{ agent.employee_number || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">이름</p>
            <p class="text-[14px] text-[#333] font-medium">{{ agent.name }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">전화번호</p>
            <p class="text-[14px] text-[#333]">{{ formatPhone(agent.phone) }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">이메일</p>
            <p class="text-[14px] text-[#333]">{{ agent.email || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">근무지</p>
            <p class="text-[14px] text-[#333]">{{ agent.office_location || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">전문분야</p>
            <p class="text-[14px] text-[#333]">{{ agent.specialization || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">입사일</p>
            <p class="text-[14px] text-[#333]">{{ agent.hire_date || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">계정 아이디</p>
            <p class="text-[14px] text-[#333]">{{ agent.account?.username || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">등록일</p>
            <p class="text-[14px] text-[#333]">{{ formatDate(agent.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- 최근 실적 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <h2 class="text-[15px] font-medium text-[#333] mb-4">최근 실적 현황</h2>
        <div v-if="performances.length > 0" class="overflow-hidden">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">기간</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">DB배분</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">계약 건수</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">계약 금액</th>
                <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상담 건수</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-[#F0F0F0]">
              <tr v-for="perf in performances" :key="`${perf.year}-${perf.month}`" class="hover:bg-[#FAFAFA] transition-colors">
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ perf.year }}년 {{ perf.month }}월</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ perf.db_assigned_count ?? 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ perf.contract_count ?? 0 }}</td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
                  {{ perf.contract_amount ? Number(perf.contract_amount).toLocaleString() + '원' : '-' }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ perf.consultation_count ?? 0 }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else class="px-6 py-10 text-center text-[#999] text-[14px]">
          등록된 실적 정보가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAgentStore } from '../../stores/agentStore'

const route = useRoute()
const store = useAgentStore()

const loading = ref(false)

const agent = computed(() => store.selectedAgent)

const performances = computed(() => {
  const a = agent.value as any
  return a?.performances || []
})

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
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function loadData() {
  loading.value = true
  try {
    await store.loadAgent(route.params.id as string)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
