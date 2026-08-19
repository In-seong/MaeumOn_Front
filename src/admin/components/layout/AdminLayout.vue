<script setup lang="ts">
import { ref, watch, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import { useBranchStore } from '../../stores/branchStore'
import AdminSidebar from './AdminSidebar.vue'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const branchStore = useBranchStore()
const sidebarOpen = ref(false)

const isSuperAdmin = computed(() => authStore.user?.admin?.admin_role === 'SUPER')
const branchName = computed(() => authStore.user?.admin?.branch?.branch_name ?? '')

watch(() => route.path, () => {
  sidebarOpen.value = false
})

onMounted(async () => {
  if (isSuperAdmin.value) {
    await branchStore.loadBranches()
    branchStore.restoreSelection()
  }
})

function onBranchChange(e: Event) {
  const target = e.target as HTMLSelectElement
  const val = target.value
  branchStore.selectBranch(val === '' ? null : Number(val))
}

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen bg-[#F8F8F8]">
    <AdminSidebar :open="sidebarOpen" @close="sidebarOpen = false" />

    <div class="flex-1 flex flex-col min-w-0">
      <header class="h-14 lg:h-16 bg-white border-b border-[#E8E8E8] flex items-center justify-between px-4 lg:px-6 shrink-0 sticky top-0 z-30">
        <button
          class="lg:hidden text-[#555] hover:text-[#FF7B22] transition-colors"
          @click="sidebarOpen = true"
        >
          <span class="material-symbols-outlined text-[24px]">menu</span>
        </button>

        <div class="lg:hidden flex items-center gap-1.5">
          <img src="/icons/LogoIcon.svg" alt="마음ON" class="w-6 h-6" />
          <span class="text-[16px] font-bold text-[#FF7B22]">보험청구ON</span>
        </div>

        <div class="hidden lg:block" />

        <div class="flex items-center gap-3 lg:gap-4">
          <!-- 슈퍼 관리자: 지사 드롭다운 -->
          <select
            v-if="isSuperAdmin"
            :value="branchStore.selectedBranchId ?? ''"
            @change="onBranchChange"
            class="text-[13px] border border-[#E0E0E0] rounded-[8px] px-2.5 py-1.5 bg-white text-[#333] focus:outline-none focus:border-[#FF7B22] cursor-pointer"
          >
            <option value="">전체 지사</option>
            <option
              v-for="b in branchStore.branches"
              :key="b.branch_id"
              :value="b.branch_id"
            >{{ b.branch_name }}</option>
          </select>

          <!-- 지사 관리자: 고정 뱃지 -->
          <span
            v-else-if="branchName"
            class="text-[12px] lg:text-[13px] px-2.5 py-1 bg-[#FFF3ED] text-[#FF7B22] rounded-full font-medium"
          >{{ branchName }}</span>

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

      <main class="flex-1 overflow-auto">
        <slot />
      </main>
    </div>
  </div>
</template>
