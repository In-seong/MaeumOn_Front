<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'

const router = useRouter()
const claimStore = useClaimStore()

const statusFilter = ref('')

onMounted(async () => {
  await claimStore.fetchMyClaims()
})

async function handleFilterChange() {
  await claimStore.fetchMyClaims({ status: statusFilter.value || undefined })
}

async function handlePageChange(page: number) {
  await claimStore.fetchMyClaims({
    status: statusFilter.value || undefined,
    page
  })
}

function getStatusClass(status: string) {
  switch (status) {
    case 'pending': return 'bg-yellow-100 text-yellow-800'
    case 'processing': return 'bg-blue-100 text-blue-800'
    case 'completed': return 'bg-green-100 text-green-800'
    case 'rejected': return 'bg-red-100 text-red-800'
    default: return 'bg-gray-100 text-gray-800'
  }
}

function getStatusLabel(status: string) {
  const option = CLAIM_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function viewDetail(claimId: number) {
  router.push(`/claims/${claimId}`)
}

function createNewClaim() {
  claimStore.resetClaimForm()
  router.push('/claims/new')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 헤더 -->
      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          내 청구 내역
        </h1>
        <button
          @click="createNewClaim"
          class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors flex items-center"
        >
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          새 청구서 작성
        </button>
      </div>

      <!-- 필터 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
        <div class="flex items-center gap-4">
          <label class="text-sm text-gray-700 dark:text-gray-300">상태:</label>
          <select
            v-model="statusFilter"
            @change="handleFilterChange"
            class="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          >
            <option value="">전체</option>
            <option v-for="opt in CLAIM_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>
      </div>

      <!-- 로딩 -->
      <div v-if="claimStore.loadingClaims" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
      </div>

      <!-- 청구 목록 -->
      <div v-else>
        <!-- 모바일 카드 뷰 -->
        <div class="space-y-4 md:hidden">
          <div
            v-for="claim in claimStore.myClaims"
            :key="claim.id"
            @click="viewDetail(claim.id)"
            class="bg-white dark:bg-gray-800 rounded-lg shadow p-4 cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div class="flex justify-between items-start mb-2">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ claim.claim_form_template?.insurance_company?.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ claim.claim_form_template?.name }}
                </div>
              </div>
              <span :class="['px-2 py-1 text-xs font-medium rounded', getStatusClass(claim.status)]">
                {{ getStatusLabel(claim.status) }}
              </span>
            </div>
            <div class="text-xs text-gray-400">
              {{ formatDate(claim.created_at) }}
            </div>
          </div>
        </div>

        <!-- 데스크톱 테이블 뷰 -->
        <div class="hidden md:block bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead class="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  보험사 / 양식
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  상태
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  팩스 상태
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  청구일
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  관리
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200 dark:divide-gray-700">
              <tr
                v-for="claim in claimStore.myClaims"
                :key="claim.id"
                class="hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                @click="viewDetail(claim.id)"
              >
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="text-sm font-medium text-gray-900 dark:text-white">
                    {{ claim.claim_form_template?.insurance_company?.name }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400">
                    {{ claim.claim_form_template?.name }}
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="['px-2 py-1 text-xs font-medium rounded', getStatusClass(claim.status)]">
                    {{ getStatusLabel(claim.status) }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm">
                  <span v-if="claim.fax_status === 'sent'" class="text-green-600">발송완료</span>
                  <span v-else-if="claim.fax_status === 'failed'" class="text-red-600">발송실패</span>
                  <span v-else class="text-gray-400">-</span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                  {{ formatDate(claim.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-right text-sm">
                  <button
                    @click.stop="viewDetail(claim.id)"
                    class="text-purple-600 hover:text-purple-900 dark:text-purple-400"
                  >
                    상세보기
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <!-- 빈 상태 -->
          <div v-if="claimStore.myClaims.length === 0" class="text-center py-12">
            <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 class="mt-2 text-sm font-medium text-gray-900 dark:text-white">청구 내역 없음</h3>
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">새 청구서를 작성해보세요.</p>
            <div class="mt-6">
              <button
                @click="createNewClaim"
                class="px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
              >
                청구서 작성하기
              </button>
            </div>
          </div>
        </div>

        <!-- 페이지네이션 -->
        <div
          v-if="claimStore.claimsPagination && claimStore.claimsPagination.last_page > 1"
          class="mt-6 flex justify-center gap-2"
        >
          <button
            v-for="page in claimStore.claimsPagination.last_page"
            :key="page"
            @click="handlePageChange(page)"
            :class="[
              'px-3 py-1 rounded',
              page === claimStore.claimsPagination.current_page
                ? 'bg-purple-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-100'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
