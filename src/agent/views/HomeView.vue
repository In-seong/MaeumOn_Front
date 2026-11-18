<template>
  <div class="min-h-screen bg-[#E8E9EB] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-[#F4F5F7]">
      <AgentAppHeader :unread-count="unreadCount" />

      <main class="px-4 py-3 pb-24 overflow-y-auto" style="height: calc(100dvh - 56px);">
        <!-- 인사말 -->
        <section class="mb-3">
          <h2 class="text-[20px] font-bold text-[#1c1c1c]">안녕하세요! {{ agentName }}님</h2>
          <p class="text-[13px] text-[#888] mt-0.5">오늘도 건강하고 행복한 하루 되세요!</p>
        </section>

        <!-- 상태바: 미확인 건수 -->
        <section class="mb-4">
          <button
            class="w-full flex items-center justify-between bg-[#FF6B2D] rounded-xl px-5 py-[16px] active:opacity-90 transition-opacity"
            @click="router.push('/db-distribution')"
          >
            <div class="flex items-center gap-1 text-white text-[14px] font-bold">
              <span>미확인 배분</span>
              <span>{{ unconfirmedCount }}건</span>
            </div>
            <svg v-if="unconfirmedCount > 0" width="16" height="16" viewBox="0 0 24 24" fill="none" class="flex-shrink-0">
              <path d="M9 6l6 6-6 6" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
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

      <!-- 팝업 공지 모달 -->
      <div
        v-if="currentPopup"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
        @click.self="dismissPopup(false)"
      >
        <div class="relative w-[85vw] max-w-[360px]">
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
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AgentAppHeader from '../components/layout/AgentAppHeader.vue'
import AgentQuickMenu from '../components/ui/AgentQuickMenu.vue'
import { useAgentAuthStore } from '../stores/agentAuthStore'
import { useNotificationStore } from '../stores/notificationStore'
import { fetchDashboardFull, registerFcmToken, fetchActivePopupNotices } from '../services/agentApi'
import type { DashboardFullData, PopupNoticeItem } from '../services/agentApi'

const router = useRouter()
const baseUrl = import.meta.env.BASE_URL
const agentAuthStore = useAgentAuthStore()
const notificationStore = useNotificationStore()
const unreadCount = computed(() => notificationStore.unreadCount)
const agentName = computed(() => agentAuthStore.agentName)

const unconfirmedCount = ref(0)
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

function setupFcmTokenHandler() {
  const win = window as unknown as Record<string, unknown>
  win.__handleFCMToken__ = async (token: string) => {
    if (!token) return
    win.__fcmToken__ = token
    try {
      await registerFcmToken({ fcm_token: token })
    } catch { /* silent */ }
  }

  const android = (window as unknown as Record<string, { sendFCMToken?: () => void }>).Android
  if (android?.sendFCMToken) {
    android.sendFCMToken()
  }

  const savedToken = win.__fcmToken__ as string | undefined
  if (savedToken) {
    ;(win.__handleFCMToken__ as (token: string) => void)(savedToken)
  }
}

onMounted(async () => {
  setupFcmTokenHandler()

  await Promise.all([
    notificationStore.refreshUnreadCount(),
    fetchDashboardFull().then(res => {
      const data = res.data?.data
      if (data) {
        unconfirmedCount.value = data.checklist.unconfirmed_assignments
        dbDistributions.value = data.db_distributions
      }
    }).catch(() => { /* silent */ }),
    loadPopupNotices(),
  ])
})
</script>
