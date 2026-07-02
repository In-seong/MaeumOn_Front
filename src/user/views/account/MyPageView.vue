<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-white flex flex-col">
      <BackHeader title="마이페이지" />
      <main class="flex-1 px-6 py-4 pb-20 overflow-y-auto">
        <!-- Profile Section -->
        <div class="flex items-center gap-4 mb-6 p-4 bg-[#FFF3ED] rounded-2xl">
          <div class="w-[56px] h-[56px] bg-[#FF7B22] rounded-full flex items-center justify-center">
            <span class="text-white text-[20px] font-bold">{{ userInitial }}</span>
          </div>
          <div>
            <p class="text-[16px] font-bold text-[#333]">{{ userName }}</p>
            <p class="text-[13px] text-[#888]">{{ userPhone }}</p>
          </div>
        </div>

        <!-- Menu Items -->
        <div class="space-y-2">
          <button v-for="item in menuItems" :key="item.label"
            class="w-full flex items-center justify-between p-4 bg-[#F8F8F8] rounded-xl active:bg-[#F0F0F0] transition-colors"
            @click="item.action">
            <span class="text-[14px] text-[#333]">{{ item.label }}</span>
            <ChevronRightIcon class="w-4 h-4 text-[#CCC]" />
          </button>
        </div>

        <!-- Notifications Toggle -->
        <div class="mt-6">
          <CardSection title="알림 설정">
            <div class="space-y-3">
              <div v-for="noti in notifications" :key="noti.id"
                class="flex items-center justify-between">
                <span class="text-[14px] text-[#333]">{{ noti.label }}</span>
                <ToggleSwitch v-model="noti.value" />
              </div>
            </div>
          </CardSection>
        </div>

        <!-- Logout -->
        <button class="w-full mt-6 py-3 text-[14px] text-[#999] text-center" @click="handleLogout">
          로그아웃
        </button>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'
import BackHeader from '../../components/layout/BackHeader.vue'
import CardSection from '../../components/ui/CardSection.vue'
import ToggleSwitch from '../../components/ui/ToggleSwitch.vue'
import ChevronRightIcon from '../../components/icons/ChevronRightIcon.vue'
import BottomNav from '../../components/layout/BottomNav.vue'

const router = useRouter()
const authStore = useAuthStore()

const userName = computed(() => authStore.user?.customer?.name || authStore.user?.username || '사용자')
const userPhone = computed(() => authStore.user?.customer?.phone || '010-****-****')
const userInitial = computed(() => userName.value.charAt(0))

const menuItems = [
  { label: '내 보험 관리', action: () => router.push('/insurance') },
  { label: '청구 내역', action: () => router.push('/claims') },
  { label: '알림', action: () => router.push('/notifications') },
  { label: '상담 내역', action: () => router.push('/consultation') },
]

const notifications = ref([
  { id: 1, label: '보험 만기 알림', value: true },
  { id: 2, label: '건강검진 알림', value: true },
  { id: 3, label: '상담 알림', value: false },
  { id: 4, label: '마케팅 알림', value: false },
])

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>
