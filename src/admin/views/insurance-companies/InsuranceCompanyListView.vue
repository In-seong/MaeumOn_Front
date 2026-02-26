<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">보험사 관리</h1>
      <router-link
        to="/insurance-companies/create"
        class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium whitespace-nowrap"
      >
        보험사 등록
      </router-link>
    </div>

    <!-- 검색 및 필터 -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="보험사명 또는 코드로 검색"
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
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">보험사명</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">코드</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden lg:table-cell">팩스번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">양식 수</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr v-for="company in store.companies" :key="company.company_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ company.company_id }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ company.company_name }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">{{ company.company_code }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden lg:table-cell">{{ company.fax_number || '-' }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">{{ company.claim_forms_count || 0 }}</td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap">
              <span
                :class="company.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ company.is_active ? '활성화' : '비활성화' }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium">
              <router-link
                :to="`/insurance-companies/${company.company_id}/edit`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                수정
              </router-link>
              <button
                @click="handleDelete(company)"
                class="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="store.companies.length === 0">
            <td colspan="7" class="px-4 lg:px-6 py-10 text-center text-[#999]">
              등록된 보험사가 없습니다.
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
import { useInsuranceStore } from '../../stores/insuranceStore'
import type { InsuranceCompany } from '@shared/types'

const store = useInsuranceStore()

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
  await store.fetchCompanies({
    search: searchQuery.value || undefined,
    is_active: activeFilter.value ? activeFilter.value === 'true' : undefined,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
}

async function handleDelete(company: InsuranceCompany) {
  if (!confirm(`"${company.company_name}" 보험사를 삭제하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteCompany(company.company_id)
    alert('삭제되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(() => {
  fetchData()
})
</script>
