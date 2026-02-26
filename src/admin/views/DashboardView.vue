<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useAuthStore } from '../stores/authStore'
import { fetchDashboardSummary } from '../services/adminApi'
import type { DashboardSummary } from '../types'

const authStore = useAuthStore()
const summary = ref<DashboardSummary | null>(null)
const loading = ref(false)

const statCards = [
  { key: 'total_customers', label: '전체 고객', icon: 'people', color: 'bg-blue-50 text-blue-600', to: '/customers' },
  { key: 'total_agents', label: '전체 설계사', icon: 'badge', color: 'bg-green-50 text-green-600', to: '/agents' },
  { key: 'total_claims', label: '전체 청구', icon: 'receipt_long', color: 'bg-orange-50 text-[#FF7B22]', to: '/claims' },
  { key: 'pending_claims', label: '대기중 청구', icon: 'pending_actions', color: 'bg-yellow-50 text-yellow-600', to: '/claims' },
  { key: 'total_assignments', label: 'DB 배분', icon: 'swap_horiz', color: 'bg-purple-50 text-purple-600', to: '/assignments' },
]

async function loadDashboard() {
  loading.value = true
  try {
    const res = await fetchDashboardSummary()
    summary.value = res.data.data
  } catch {
    // Dashboard summary is optional - show zeros if fails
    summary.value = {
      total_customers: 0,
      total_agents: 0,
      total_claims: 0,
      pending_claims: 0,
      total_assignments: 0,
      recent_notices: [],
    }
  } finally {
    loading.value = false
  }
}

function getStatValue(key: string): number {
  if (!summary.value) return 0
  return (summary.value as any)[key] ?? 0
}

onMounted(async () => {
  await authStore.fetchUser()
  await loadDashboard()
})
</script>

<template>
  <div class="p-4 lg:p-6">
    <h2 class="text-[20px] lg:text-[22px] font-bold text-[#333] mb-6">대시보드</h2>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <template v-else>
      <!-- 요약 통계 카드 -->
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        <router-link
          v-for="card in statCards"
          :key="card.key"
          :to="card.to"
          class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center gap-3">
            <div :class="['p-2.5 rounded-full', card.color]">
              <span class="material-symbols-outlined text-[22px]">{{ card.icon }}</span>
            </div>
            <div>
              <p class="text-[24px] font-bold text-[#333]">{{ getStatValue(card.key).toLocaleString() }}</p>
              <p class="text-[13px] text-[#999]">{{ card.label }}</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 퀵 메뉴 -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <router-link
          to="/customers"
          class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center gap-3">
            <div class="p-3 bg-[#FFF3ED] rounded-full">
              <span class="material-symbols-outlined text-[24px] text-[#FF7B22]">people</span>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">고객 관리</h3>
              <p class="text-[13px] text-[#999]">고객 등록 및 조회</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/agents"
          class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center gap-3">
            <div class="p-3 bg-[#FFF3ED] rounded-full">
              <span class="material-symbols-outlined text-[24px] text-[#FF7B22]">badge</span>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">설계사 관리</h3>
              <p class="text-[13px] text-[#999]">설계사 등록 및 관리</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/insurance-companies"
          class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center gap-3">
            <div class="p-3 bg-[#FFF3ED] rounded-full">
              <span class="material-symbols-outlined text-[24px] text-[#FF7B22]">business</span>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">보험사 관리</h3>
              <p class="text-[13px] text-[#999]">보험사 등록 및 관리</p>
            </div>
          </div>
        </router-link>

        <router-link
          to="/templates"
          class="bg-white p-5 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] hover:shadow-[0_0_15px_rgba(0,0,0,0.1)] transition"
        >
          <div class="flex items-center gap-3">
            <div class="p-3 bg-[#FFF3ED] rounded-full">
              <span class="material-symbols-outlined text-[24px] text-[#FF7B22]">description</span>
            </div>
            <div>
              <h3 class="text-[15px] font-semibold text-[#333]">양식 관리</h3>
              <p class="text-[13px] text-[#999]">청구서 양식 템플릿</p>
            </div>
          </div>
        </router-link>
      </div>

      <!-- 최근 공지사항 -->
      <div class="bg-white p-6 rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)]">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-[16px] font-semibold text-[#333]">최근 공지사항</h3>
          <router-link to="/notices" class="text-[13px] text-[#FF7B22] hover:underline">전체보기</router-link>
        </div>
        <div v-if="summary?.recent_notices && summary.recent_notices.length > 0">
          <ul class="space-y-2">
            <li
              v-for="notice in summary.recent_notices"
              :key="notice.notice_id"
              class="flex items-center justify-between py-2 border-b border-[#F0F0F0] last:border-0"
            >
              <router-link :to="`/notices/${notice.notice_id}`" class="text-[14px] text-[#333] hover:text-[#FF7B22]">
                <span v-if="notice.is_pinned" class="text-[#FF7B22] mr-1">[고정]</span>
                {{ notice.title }}
              </router-link>
              <span class="text-[12px] text-[#999]">{{ notice.created_at?.slice(0, 10) }}</span>
            </li>
          </ul>
        </div>
        <p v-else class="text-[14px] text-[#999]">등록된 공지사항이 없습니다.</p>
      </div>
    </template>
  </div>
</template>
