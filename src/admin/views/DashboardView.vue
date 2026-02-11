<script setup lang="ts">
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}

onMounted(async () => {
  await authStore.fetchUser()
})
</script>

<template>
  <div class="min-h-screen bg-[#F8F8F8]">
    <!-- 네비게이션 -->
    <nav class="bg-white shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
      <div class="container mx-auto px-4">
        <div class="flex justify-between items-center h-16">
          <div class="flex items-center space-x-8">
            <h1 class="text-xl font-bold text-[#FF7B22]">마음ON 관리자</h1>
            <div class="flex space-x-1">
              <router-link
                to="/"
                class="text-[#555] hover:text-[#FF7B22] hover:bg-[#FFF3ED] px-3 py-2 rounded-[8px] transition-colors text-[14px]"
              >
                대시보드
              </router-link>
              <router-link
                to="/insurance-companies"
                class="text-[#555] hover:text-[#FF7B22] hover:bg-[#FFF3ED] px-3 py-2 rounded-[8px] transition-colors text-[14px]"
              >
                보험사 관리
              </router-link>
              <router-link
                to="/templates"
                class="text-[#555] hover:text-[#FF7B22] hover:bg-[#FFF3ED] px-3 py-2 rounded-[8px] transition-colors text-[14px]"
              >
                양식 관리
              </router-link>
              <router-link
                to="/claims"
                class="text-[#555] hover:text-[#FF7B22] hover:bg-[#FFF3ED] px-3 py-2 rounded-[8px] transition-colors text-[14px]"
              >
                청구 관리
              </router-link>
            </div>
          </div>
          <div class="flex items-center space-x-4">
            <span class="text-[13px] text-[#999]">
              {{ authStore.user?.customer?.name || authStore.user?.username || '관리자' }}
            </span>
            <button
              @click="handleLogout"
              class="text-[13px] text-[#999] hover:text-red-500 transition-colors"
            >
              로그아웃
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 메인 콘텐츠 -->
    <div class="container mx-auto px-4 py-8">
      <h2 class="text-[22px] font-bold text-[#333] mb-6">
        대시보드
      </h2>

      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <router-link
          to="/insurance-companies"
          class="bg-white p-6 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-[#FFF3ED] rounded-full mr-4">
              <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-[#333]">보험사 관리</h3>
              <p class="text-[13px] text-[#999]">보험사 등록 및 관리</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/templates"
          class="bg-white p-6 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-[#FFF3ED] rounded-full mr-4">
              <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-[#333]">양식 관리</h3>
              <p class="text-[13px] text-[#999]">청구서 양식 템플릿</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/claims"
          class="bg-white p-6 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center">
            <div class="p-3 bg-[#FFF3ED] rounded-full mr-4">
              <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <div>
              <h3 class="text-[16px] font-semibold text-[#333]">청구 관리</h3>
              <p class="text-[13px] text-[#999]">청구 내역 확인</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 사용 가이드 -->
      <div class="bg-white p-6 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <h3 class="text-[16px] font-semibold text-[#333] mb-4">사용 가이드</h3>
        <ol class="list-decimal list-inside space-y-2 text-[14px] text-[#555]">
          <li><strong class="text-[#333]">보험사 등록</strong>: 보험사 정보와 기본 팩스번호를 등록합니다.</li>
          <li><strong class="text-[#333]">양식 등록</strong>: 보험사별 청구서 양식 이미지를 업로드합니다.</li>
          <li><strong class="text-[#333]">필드 배치</strong>: 드래그앤드롭으로 입력 필드 위치를 설정합니다.</li>
          <li><strong class="text-[#333]">청구 관리</strong>: 고객이 작성한 청구서를 확인하고 상태를 관리합니다.</li>
        </ol>
      </div>
    </div>
  </div>
</template>
