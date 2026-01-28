<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const stats = ref({
  companies: 0,
  templates: 0,
  claims: 0,
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <!-- 네비게이션 -->
    <nav class="bg-white dark:bg-gray-800 shadow">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-purple-600">보험ON 관리자</h1>
            <div class="flex space-x-4">
              <router-link
                to="/"
                class="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2"
              >
                대시보드
              </router-link>
              <router-link
                to="/insurance-companies"
                class="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2"
              >
                보험사 관리
              </router-link>
              <router-link
                to="/templates"
                class="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2"
              >
                양식 관리
              </router-link>
              <router-link
                to="/claims"
                class="text-gray-700 dark:text-gray-300 hover:text-purple-600 px-3 py-2"
              >
                청구 관리
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-sm text-gray-600 dark:text-gray-400">
              {{ authStore.user?.name || '관리자' }}
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
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        대시보드
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <router-link
          to="/insurance-companies"
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-blue-100 dark:bg-blue-900 rounded-full mr-4">
              <svg class="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">보험사 관리</h3>
              <p class="text-gray-600 dark:text-gray-400">보험사 등록 및 관리</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/templates"
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-purple-100 dark:bg-purple-900 rounded-full mr-4">
              <svg class="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">양식 관리</h3>
              <p class="text-gray-600 dark:text-gray-400">청구서 양식 템플릿</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/claims"
          class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow hover:shadow-lg transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-green-100 dark:bg-green-900 rounded-full mr-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 class="text-lg font-semibold text-gray-900 dark:text-white">청구 관리</h3>
              <p class="text-gray-600 dark:text-gray-400">청구 내역 확인</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 사용 가이드 -->
      <div class="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">사용 가이드</h3>
        <ol class="list-decimal list-inside space-y-2 text-gray-600 dark:text-gray-400">
          <li><strong>보험사 등록</strong>: 보험사 정보와 기본 팩스번호를 등록합니다.</li>
          <li><strong>양식 등록</strong>: 보험사별 청구서 양식 이미지를 업로드합니다.</li>
          <li><strong>필드 배치</strong>: 드래그앤드롭으로 입력 필드 위치를 설정합니다.</li>
          <li><strong>청구 관리</strong>: 고객이 작성한 청구서를 확인하고 상태를 관리합니다.</li>
        </ol>
      </div>
    </div>
  </div>
</template>
