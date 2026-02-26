<template>
  <div class="p-6">
    <div class="mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">추가계약 발굴</h1>
      <p class="text-[13px] text-[#999] mt-1">계약 가능성이 높은 고객을 유형별로 조회합니다.</p>
    </div>

    <!-- 탭 필터 -->
    <div class="flex border-b border-[#E8E8E8] mb-4">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        @click="changeTab(tab.value)"
        :class="[
          'px-5 py-3 text-[14px] font-medium border-b-2 transition-colors -mb-[1px]',
          store.activeType === tab.value
            ? 'border-[#FF7B22] text-[#FF7B22]'
            : 'border-transparent text-[#999] hover:text-[#333]'
        ]"
      >
        {{ tab.label }}
      </button>
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
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">고객명</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">전화번호</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">담당 설계사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">발굴 사유</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">상세</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="item in store.results"
            :key="item.customer_id"
            class="hover:bg-[#FAFAFA] transition-colors"
          >
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ item.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ formatPhone(item.phone) }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ item.agent_name || '-' }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span class="inline-flex items-center px-2.5 py-1 text-[12px] font-medium rounded-full bg-[#FFF3ED] text-[#FF7B22]">
                {{ item.reason }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium">
              <router-link
                :to="`/customers/${item.customer_id}`"
                class="text-[#FF7B22] hover:text-[#E56D1E]"
              >
                상세보기
              </router-link>
            </td>
          </tr>
          <tr v-if="store.results.length === 0">
            <td colspan="5" class="px-6 py-10 text-center text-[#999]">
              해당 조건의 고객이 없습니다.
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
import { onMounted } from 'vue'
import { useAdditionalContractStore } from '../../stores/additionalContractStore'

const store = useAdditionalContractStore()

const tabs = [
  { label: '미청구', value: 'unclaimed' },
  { label: '갱신대상', value: 'renewal' },
  { label: '보장부족', value: 'undercovered' },
  { label: '검진이상', value: 'abnormal' },
]

function changeTab(type: string) {
  store.activeType = type
  fetchData()
}

async function fetchData(page = 1) {
  await store.loadResults({
    type: store.activeType,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
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

onMounted(() => {
  fetchData()
})
</script>
