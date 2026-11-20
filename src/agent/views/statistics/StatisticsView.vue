<template>
  <div class="min-h-screen bg-[#E8E9EB] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-[#F4F5F7]">
      <header class="flex items-center h-[56px] px-5">
        <button class="mr-2" @click="router.back()">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#333" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>
        <span class="text-[18px] font-bold text-[#1c1c1c]">통계</span>
      </header>

      <main class="overflow-y-auto pb-24 px-4" style="height: calc(100dvh - 56px);">
        <!-- 상태바 -->
        <section class="mb-4">
          <div class="flex items-center bg-[#FF6B2D] rounded-xl px-5 py-[16px]">
            <div class="flex items-center gap-1 text-white text-[14px] font-bold">
              <span>상주</span>
              <span>{{ statusCounts.assigned }}건</span>
              <span class="mx-2 opacity-70 font-extrabold">|</span>
              <span>배분</span>
              <span>{{ statusCounts.distributed }}건</span>
              <span class="mx-2 opacity-70 font-extrabold">|</span>
              <span>반려</span>
              <span>{{ statusCounts.rejected }}건</span>
            </div>
          </div>
        </section>

        <!-- 퀵 메뉴 -->
        <section class="mb-4">
          <AgentQuickMenu />
        </section>

        <!-- 숨은 보험금 배너 -->
        <section class="mb-4">
          <button
            class="w-full relative overflow-hidden bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 px-4 py-[22px] text-left active:scale-[0.98] transition-transform"
            @click="router.push('/unclaimed')"
          >
            <span class="block text-[15px] font-bold text-[#333]">숨은 보험금</span>
            <span class="block text-[12px] text-[#888] mt-0.5">미청구 의료비 찾기</span>
            <img
              :src="`${baseUrl}icons/3d/07_find_insurance_money.png`"
              alt="숨은 보험금"
              class="absolute -bottom-[40px] right-1 w-[175px] h-[175px] object-contain pointer-events-none"
              loading="lazy"
            />
          </button>
        </section>

        <!-- DB 배분 고객 -->
        <section v-if="dbDistributions.length > 0" class="mb-4">
          <div class="bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-4">
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[16px] font-bold text-[#333]">DB 배분 고객</h3>
              <span class="text-[16px] font-bold text-[#FF6B2D]">{{ dbDistributions.length }}명</span>
            </div>
            <div class="flex flex-col divide-y divide-[#F0F0F0]">
              <button
                v-for="item in dbDistributions.slice(0, 10)"
                :key="item.assignment_id"
                class="flex items-center gap-3 py-3 first:pt-0 last:pb-0 text-left active:bg-[#FAFAFA] transition-colors"
                @click="goToCustomer(item.customer_id)"
              >
                <div class="w-10 h-10 flex items-center justify-center flex-shrink-0">
                  <img :src="`${baseUrl}icons/nav/message.svg`" alt="" class="w-7 h-7" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] font-bold text-[#333] truncate">
                    {{ item.customer_name }}
                    <span class="text-[14px] text-[#333] font-bold ml-1">청구 신청 배정</span>
                  </p>
                  <p class="text-[12px] text-[#999] mt-0.5">
                    {{ formatDate(item.assignment_date) }} · {{ formatPhone(item.customer_phone) }}
                  </p>
                </div>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
                  <path d="M9 6l6 6-6 6" stroke="#CCC" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AgentQuickMenu from '../../components/ui/AgentQuickMenu.vue'
import { fetchDashboardFull } from '../../services/agentApi'
import type { DashboardFullData } from '../../services/agentApi'

const router = useRouter()
const baseUrl = import.meta.env.BASE_URL

const statusCounts = ref({ assigned: 0, distributed: 0, rejected: 0 })
const dbDistributions = ref<DashboardFullData['db_distributions']>([])

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const parts = dateStr.split('-')
  const m = parts[1]
  const d = parts[2]
  if (!m || !d) return '-'
  return `${parseInt(m)}/${parseInt(d)}`
}

function formatPhone(phone: string): string {
  if (!phone) return '-'
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`
  }
  return phone
}

function goToCustomer(customerId: string) {
  router.push(`/customers/${customerId}`)
}

onMounted(async () => {
  try {
    const res = await fetchDashboardFull()
    const data = res.data?.data
    if (data) {
      statusCounts.value = {
        assigned: data.checklist.unregistered_db,
        distributed: data.checklist.unconfirmed_assignments,
        rejected: data.checklist.incomplete_claims,
      }
      dbDistributions.value = data.db_distributions
    }
  } catch { /* silent */ }
})
</script>
