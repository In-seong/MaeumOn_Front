<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import { useClaimStore } from '../stores/claimStore'

const router = useRouter()
const authStore = useAuthStore()
const claimStore = useClaimStore()

onMounted(async () => {
  await authStore.fetchUser()
  await claimStore.fetchMyClaims({ per_page: 5 })
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

function goToClaims() {
  router.push('/claims')
}

function goToNewClaim() {
  claimStore.resetClaimForm()
  router.push('/claims/new')
}

function viewClaim(claimId: number) {
  router.push(`/claims/${claimId}`)
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
  switch (status) {
    case 'pending': return '대기중'
    case 'processing': return '처리중'
    case 'completed': return '완료'
    case 'rejected': return '거절'
    default: return status
  }
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- 헤더 -->
    <header class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <h1 class="text-xl font-bold text-purple-600">보험ON</h1>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ authStore.user?.name || '사용자' }}님
            </span>
            <button
              @click="handleLogout"
              class="text-sm text-red-600 hover:text-red-700"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- 메인 콘텐츠 -->
    <div class="container mx-auto px-4 py-8">
      <!-- 환영 메시지 -->
      <div class="bg-gradient-to-r from-purple-500 to-purple-700 rounded-lg shadow-lg p-6 mb-8 text-white">
        <h2 class="text-2xl font-bold mb-2">
          안녕하세요, {{ authStore.user?.name || '고객' }}님!
        </h2>
        <p class="opacity-90">
          보험ON에서 간편하게 보험 청구서를 작성하고 발송하세요.
        </p>
      </div>

      <!-- 빠른 액션 -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <button
          @click="goToNewClaim"
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition text-left group"
        >
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4 group-hover:bg-purple-200 transition">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">새 청구서 작성</h3>
              <p class="text-gray-600 dark:text-gray-400">보험 청구서를 작성합니다</p>
            </div>
          </div>
        </button>

        <button
          @click="goToClaims"
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition text-left group"
        >
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4 group-hover:bg-blue-200 transition">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">청구 내역 보기</h3>
              <p class="text-gray-600 dark:text-gray-400">내 청구 내역을 확인합니다</p>
            </div>
          </div>
        </button>
      </div>

      <!-- 최근 청구 내역 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div class="p-6 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">최근 청구 내역</h3>
          <button
            @click="goToClaims"
            class="text-sm text-purple-600 hover:text-purple-700"
          >
            전체보기
          </button>
        </div>

        <div v-if="claimStore.loadingClaims" class="p-8 text-center">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        <div v-else-if="claimStore.myClaims.length === 0" class="p-8 text-center">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p class="mt-2 text-gray-500 dark:text-gray-400">청구 내역이 없습니다.</p>
          <button
            @click="goToNewClaim"
            class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
          >
            첫 청구서 작성하기
          </button>
        </div>

        <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
          <div
            v-for="claim in claimStore.myClaims"
            :key="claim.id"
            @click="viewClaim(claim.id)"
            class="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition"
          >
            <div class="flex justify-between items-start">
              <div>
                <div class="font-medium text-gray-900 dark:text-white">
                  {{ claim.claim_form_template?.insurance_company?.name }}
                </div>
                <div class="text-sm text-gray-500 dark:text-gray-400">
                  {{ claim.claim_form_template?.name }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  {{ formatDate(claim.created_at) }}
                </div>
              </div>
              <span :class="['px-2 py-1 text-xs font-medium rounded', getStatusClass(claim.status)]">
                {{ getStatusLabel(claim.status) }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
