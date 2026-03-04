<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">설계사 관리</h1>
      <router-link
        to="/agents/create"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        설계사 등록
      </router-link>
    </div>

    <!-- 검색 및 필터 -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="이름, 사번, 전화번호로 검색"
        class="flex-1 px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="activeFilter"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체</option>
        <option value="true">활성화</option>
        <option value="false">비활성화</option>
      </select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">사번</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">이름</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">전화번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">이메일</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">담당고객수</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="agent in store.agents"
            :key="agent.agent_id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="goToDetail(agent.agent_id)"
          >
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#333] hidden md:table-cell">{{ agent.employee_number || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ agent.name }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatPhone(agent.phone) }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">{{ agent.email || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ agent.customers_count ?? 0 }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="agent.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ agent.is_active ? '활성화' : '비활성화' }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium" @click.stop>
              <router-link
                :to="`/agents/${agent.agent_id}`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                상세
              </router-link>
              <router-link
                :to="`/agents/${agent.agent_id}/edit`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                수정
              </router-link>
              <button
                @click="handleDelete(agent)"
                class="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="store.agents.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-[#999]">
              등록된 설계사가 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="store.pagination && store.pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button
            v-for="page in store.pagination.last_page"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-[8px] text-[14px]',
              page === store.pagination.current_page
                ? 'bg-[#FF7B22] text-white'
                : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentStore } from '../../stores/agentStore'
import type { AdminAgent } from '../../types'

const router = useRouter()
const store = useAgentStore()

const searchQuery = ref('')
const activeFilter = ref('')

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
}

async function fetchData(page = 1) {
  await store.loadAgents({
    search: searchQuery.value || undefined,
    is_active: activeFilter.value ? activeFilter.value === 'true' : undefined,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
}

function goToDetail(agentId: string) {
  router.push(`/agents/${agentId}`)
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

async function handleDelete(agent: AdminAgent) {
  if (!confirm(`"${agent.name}" 설계사를 비활성화하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteAgent(agent.agent_id)
    alert('비활성화되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '처리에 실패했습니다.')
  }
}

onMounted(() => {
  fetchData()
})
</script>
