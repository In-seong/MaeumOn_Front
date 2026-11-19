<template>
  <div class="p-6 bg-[#F4F5F7] min-h-full">
    <!-- 인사말 -->
    <div class="mb-5">
      <h1 class="text-[22px] font-bold text-[#1c1c1c]">안녕하세요! {{ agentName }}님</h1>
      <p class="text-[13px] text-[#888] mt-1">오늘도 건강하고 행복한 하루 되세요!</p>
    </div>

    <!-- 상태바 -->
    <div class="mb-6">
      <div class="flex items-center bg-[#FF6B2D] rounded-xl px-6 py-[16px] max-w-[480px]">
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
    </div>

    <!-- 퀵메뉴 2행 3열 -->
    <div class="grid grid-cols-3 gap-4 mb-6">
      <router-link
        v-for="item in quickMenuItems"
        :key="item.path"
        :to="item.path"
        class="bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-5 flex items-center gap-4 hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-shadow"
      >
        <img
          :src="`${baseUrl}icons/3d/${item.image}`"
          :alt="item.label"
          class="w-[52px] h-[52px] object-contain shrink-0"
          loading="lazy"
        />
        <div>
          <p class="text-[14px] font-semibold text-[#333]">{{ item.label }}</p>
          <p class="text-[12px] text-[#999]">{{ item.sub }}</p>
        </div>
      </router-link>
    </div>

    <div class="grid grid-cols-3 gap-6">
      <!-- 숨은 보험금 배너 -->
      <button
        class="col-span-1 relative overflow-hidden bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 px-5 py-6 text-left hover:shadow-[0_6px_24px_rgba(0,0,0,0.12)] transition-shadow min-h-[120px]"
        @click="router.push('/unclaimed')"
      >
        <span class="block text-[16px] font-bold text-[#333]">숨은 보험금</span>
        <span class="block text-[13px] text-[#888] mt-1">미청구 의료비 찾기</span>
        <img
          :src="`${baseUrl}icons/3d/07_find_insurance_money.png`"
          alt="숨은 보험금"
          class="absolute -bottom-[30px] right-1 w-[140px] h-[140px] object-contain pointer-events-none"
          loading="lazy"
        />
      </button>

      <!-- DB 배분 고객 -->
      <div class="col-span-2 bg-white rounded-[14px] shadow-[0_4px_16px_rgba(0,0,0,0.08),0_1px_3px_rgba(0,0,0,0.06)] border border-white/80 p-5">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[16px] font-semibold text-[#333]">DB 배분 고객</h2>
          <span v-if="dbDistributions.length > 0" class="text-[16px] font-bold text-[#FF6B2D]">{{ dbDistributions.length }}명</span>
        </div>
        <div v-if="dbDistributions.length === 0" class="text-[13px] text-[#999] py-6 text-center">
          배분된 고객이 없습니다
        </div>
        <div v-else class="flex flex-col divide-y divide-[#F0F0F0]">
          <button
            v-for="item in dbDistributions.slice(0, 10)"
            :key="item.assignment_id"
            class="flex items-center gap-3 py-3 first:pt-0 last:pb-0 text-left hover:bg-[#FAFAFA] transition-colors rounded-lg px-2 -mx-2"
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
    </div>

    <!-- 팝업 공지 모달 -->
    <div
      v-if="currentPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      @click.self="dismissPopup(false)"
    >
      <div class="relative w-full max-w-[480px]">
        <button
          class="absolute -top-10 right-0 w-8 h-8 flex items-center justify-center"
          @click="dismissPopup(false)"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="white" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <img
          v-if="currentPopup.image_url"
          :src="currentPopup.image_url"
          :alt="currentPopup.title"
          class="w-full rounded-2xl cursor-pointer"
          @click="openPopupLink"
        />
        <button
          class="w-full mt-3 py-2.5 text-[13px] text-white/80 bg-black/30 rounded-xl backdrop-blur-sm"
          @click="dismissPopup(true)"
        >
          오늘 하루 안보기
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../stores/agentAuthStore'
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboardFull, fetchActivePopupNotices } from '../services/agentApi'
import type { DashboardFullData, PopupNoticeItem } from '../services/agentApi'

const router = useRouter()
const baseUrl = import.meta.env.BASE_URL
const authStore = useAgentAuthStore()
const notificationStore = useNotificationStore()
const agentName = computed(() => authStore.agentName)

const isReviewAccount = computed(() => authStore.agent?.employee_number === 'TEST001')

const statusCounts = ref({ assigned: 0, distributed: 0, rejected: 0 })
const dbDistributions = ref<DashboardFullData['db_distributions']>([])

const allQuickMenuItems = [
  { image: '01_customer_management.png', label: '고객관리', sub: '고객 목록 관리', path: '/customers', review: true },
  { image: '02_claim_management.png', label: '청구관리', sub: '청구 현황 보기', path: '/claims', review: false },
  { image: '03_new_claim.png', label: '새 청구', sub: '보험금 청구하기', path: '/claims/new', review: false },
  { image: '04_messages.png', label: '메시지', sub: '안내 메시지 발송', path: '/messages/send', review: true },
  { image: '05_db_distribution.png', label: 'DB배분', sub: '신규 고객 배분', path: '/db-distribution', review: true },
  { image: '06_insurance_health.png', label: '보험·건강', sub: '보험 건강정보 조회', path: '/codef', review: false },
]

const quickMenuItems = computed(() =>
  isReviewAccount.value ? allQuickMenuItems.filter(i => i.review) : allQuickMenuItems
)

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

// 팝업 공지
const popupNotices = ref<PopupNoticeItem[]>([])
const popupIndex = ref(0)
const currentPopup = computed(() => {
  const item = popupNotices.value[popupIndex.value]
  return item ?? null
})

function isDismissedToday(id: number): boolean {
  try {
    const today = new Date().toISOString().slice(0, 10)
    return localStorage.getItem(`popup_dismissed_${id}_${today}`) === '1'
  } catch {
    return false
  }
}

function dismissPopup(hideToday: boolean) {
  const popup = currentPopup.value
  if (popup && hideToday) {
    try {
      const today = new Date().toISOString().slice(0, 10)
      localStorage.setItem(`popup_dismissed_${popup.popup_notice_id}_${today}`, '1')
    } catch { /* silent */ }
  }
  popupIndex.value++
}

function openPopupLink() {
  const popup = currentPopup.value
  if (popup?.link_url) {
    window.open(popup.link_url, '_blank', 'noopener')
  }
}

async function loadPopupNotices() {
  try {
    const res = await fetchActivePopupNotices()
    const all: PopupNoticeItem[] = res.data?.data ?? []
    popupNotices.value = all.filter(p => !isDismissedToday(p.popup_notice_id))
    popupIndex.value = 0
  } catch { /* silent */ }
}

onMounted(async () => {
  await Promise.all([
    notificationStore.refreshUnreadCount(),
    fetchDashboardFull().then(res => {
      const data = res.data?.data
      if (data) {
        statusCounts.value = {
          assigned: data.checklist.unregistered_db,
          distributed: data.checklist.unconfirmed_assignments,
          rejected: data.checklist.incomplete_claims,
        }
        dbDistributions.value = data.db_distributions
      }
    }).catch(() => { /* silent */ }),
    loadPopupNotices(),
  ])
})
</script>
