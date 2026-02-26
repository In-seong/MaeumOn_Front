<script setup lang="ts">
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import AdminSidebar from './AdminSidebar.vue'

const router = useRouter()
const authStore = useAuthStore()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8F8F8]">
    <!-- 사이드바 -->
    <AdminSidebar />

    <!-- 메인 영역 -->
    <div class="flex-1 flex flex-col min-w-0">
      <!-- 상단 헤더 -->
      <header class="h-16 bg-white border-b border-[#E8E8E8] flex items-center justify-end px-6 shrink-0">
        <div class="flex items-center gap-4">
          <span class="text-[13px] text-[#999]">
            {{ authStore.user?.username || '관리자' }}
          </span>
          <button
            @click="handleLogout"
            class="text-[13px] text-[#999] hover:text-red-500 transition-colors"
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
