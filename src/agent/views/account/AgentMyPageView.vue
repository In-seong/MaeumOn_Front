<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="마이페이지" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Profile Card -->
        <div class="flex items-center gap-4 mb-6 p-5 bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)]">
          <div class="w-[60px] h-[60px] bg-[#FF7B22] rounded-full flex items-center justify-center flex-shrink-0">
            <span class="text-white text-[22px] font-bold">{{ agentInitial }}</span>
          </div>
          <div>
            <p class="text-[17px] font-bold text-[#333]">{{ agentName }}</p>
            <p class="text-[13px] text-[#888] mt-0.5">{{ agencyName }}</p>
            <p class="text-[12px] text-[#BBB] mt-0.5">{{ agentPosition }}</p>
          </div>
        </div>

        <!-- Info Section -->
        <div class="mb-5">
          <CardSection>
            <h3 class="text-[15px] font-semibold text-[#333] mb-3">기본 정보</h3>
            <InfoRow label="연락처" :value="agentPhone" />
            <InfoRow label="이메일" :value="agentEmail" />
            <InfoRow label="자격번호" :value="licenseNumber" />
            <InfoRow label="등록일" :value="registeredAt" />
          </CardSection>
        </div>

        <!-- Menu List -->
        <div class="mb-5">
          <CardSection>
            <div class="flex flex-col">
              <button
                v-for="item in menuItems"
                :key="item.label"
                class="flex items-center justify-between py-3.5 border-b border-[#F5F5F5] last:border-b-0 active:bg-[#FAFAFA] transition-colors -mx-1 px-1 rounded"
                @click="item.action"
              >
                <span class="text-[14px] text-[#333]">{{ item.label }}</span>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </CardSection>
        </div>

        <!-- Logout Button -->
        <ActionButton variant="outline" full @click="handleLogout">로그아웃</ActionButton>

        <!-- App Version -->
        <p class="text-center text-[12px] text-[#CCC] mt-4">마음온 에이전트 v1.0.0</p>

        <!-- Toast -->
        <Transition name="fade">
          <div
            v-if="showToast"
            class="fixed bottom-24 left-1/2 -translate-x-1/2 bg-[#333] text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap"
          >
            {{ toastMessage }}
          </div>
        </Transition>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../../stores/agentAuthStore'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'

const router = useRouter()
const authStore = useAgentAuthStore()

const agentName = computed(() => authStore.agent?.name ?? '설계사')
const agencyName = computed(() => authStore.agent?.affiliation ?? '소속 없음')
const agentPosition = computed(() => authStore.agent?.position ?? '')
const agentPhone = computed(() => authStore.agent?.phone ?? '-')
const agentEmail = computed(() => authStore.agent?.email ?? '-')
const licenseNumber = computed(() => authStore.agent?.license_number ?? '-')
const registeredAt = computed(() => authStore.agent?.created_at ?? '-')
const agentInitial = computed(() => agentName.value.charAt(0))

const showToast = ref(false)
const toastMessage = ref('')

function showFeatureToast(label: string): void {
  toastMessage.value = `${label} 기능은 준비 중입니다.`
  showToast.value = true
  setTimeout(() => { showToast.value = false }, 2000)
}

const menuItems = [
  { label: '알림 설정', action: () => showFeatureToast('알림 설정') },
  { label: '비밀번호 변경', action: () => showFeatureToast('비밀번호 변경') },
  { label: '개인정보 수정', action: () => showFeatureToast('개인정보 수정') },
  { label: '앱 정보', action: () => showFeatureToast('앱 정보') },
]

function handleLogout(): void {
  authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>
