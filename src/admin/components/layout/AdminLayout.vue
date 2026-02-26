<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import AdminSidebar from './AdminSidebar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const sidebarOpen = ref(false)

// 라우트 변경 시 사이드바 닫기
watch(() => route.path, () => {
  sidebarOpen.value = false
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8F8F8]">
    <!-- 사이드바 (lg에서 static → 자연스럽게 flex에 참여) -->
    <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <!-- 메인 영역 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 상단 헤더 -->
      <header class="h-14 lg:h-16 bg-white border-b border-[#E8E8E8] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
        <!-- 모바일 햄버거 -->
        <button
          class="lg:hidden text-[#555] hover:text-[#FF7B22] transition-colors"
          @click="sidebarOpen = true"
        >
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <!-- 모바일 로고 -->
        <div class="lg:hidden flex items-center gap-1.5">
          <img src="/icons/LogoIcon.svg" alt="마음ON" class="w-6 h-6" />
          <span class="text-[16px] font-bold text-[#FF7B22]">보험청구ON</span>
        </div>

        <!-- 데스크탑 빈 공간 -->
        <div class="hidden lg:block" />

        <!-- 우측 -->
        <div class="flex items-center gap-3 lg:gap-4">
          <span class="text-[12px] lg:text-[13px] text-[#999]">
            {{ authStore.user?.username || '관리자' }}
          </span>
          <button
            @click="handleLogout"
            class="text-[12px] lg:text-[13px] text-[#999] hover:text-red-500 transition-colors"
          >
            로그아웃
          </button>
        </div>
      </header>

      <!-- 콘텐츠 -->
      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
