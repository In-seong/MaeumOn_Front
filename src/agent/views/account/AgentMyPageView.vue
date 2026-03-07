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
          </div>
        </div>

        <!-- Info Section -->
        <div class="mb-5">
          <CardSection>
            <div class="flex items-center justify-between mb-3">
              <h3 class="text-[15px] font-semibold text-[#333]">기본 정보</h3>
              <button
                v-if="!isEditing"
                class="text-[12px] text-[#FF7B22] font-medium"
                @click="startEdit"
              >
                수정
              </button>
            </div>

            <!-- 읽기 모드 -->
            <template v-if="!isEditing">
              <InfoRow label="연락처" :value="agentPhone" />
              <InfoRow label="이메일" :value="agentEmail" />
              <InfoRow label="소속" :value="agencyName" />
              <InfoRow label="사원번호" :value="agentEmployeeNo" />
              <InfoRow label="입사일" :value="hireDate" />
              <InfoRow label="등록일" :value="registeredAt" />
            </template>

            <!-- 수정 모드 -->
            <template v-else>
              <div class="flex flex-col gap-3">
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">연락처</label>
                  <input
                    v-model="editForm.phone"
                    type="tel"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">이메일</label>
                  <input
                    v-model="editForm.email"
                    type="email"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">소속</label>
                  <input
                    v-model="editForm.office_location"
                    type="text"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
              </div>
              <div class="flex gap-2 mt-4">
                <button
                  class="flex-1 py-2.5 rounded-[10px] border border-[#E0E0E0] text-[13px] text-[#666] font-medium active:bg-[#F5F5F5]"
                  @click="cancelEdit"
                >
                  취소
                </button>
                <button
                  :disabled="editSaving"
                  class="flex-1 py-2.5 rounded-[10px] bg-[#FF7B22] text-white text-[13px] font-medium active:bg-[#E56A1A] disabled:opacity-50"
                  @click="handleSaveProfile"
                >
                  {{ editSaving ? '저장 중...' : '저장' }}
                </button>
              </div>
            </template>
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
        <p class="text-center text-[12px] text-[#CCC] mt-4">마음온 에이전트 {{ appVersion }}</p>
      </main>

      <AgentBottomNav />

      <!-- 비밀번호 변경 모달 -->
      <Teleport to="body">
        <Transition name="slide-up">
          <div
            v-if="showPwModal"
            class="fixed inset-0 z-[100] flex items-end justify-center px-3 pb-[68px]"
            @click.self="closePwModal"
          >
            <div class="absolute inset-0 bg-black/40" @click="closePwModal" />

            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 z-10">
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-[17px] font-bold text-[#333]">비밀번호 변경</h3>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F5F5F5]"
                  @click="closePwModal"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="flex flex-col gap-3">
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">현재 비밀번호</label>
                  <input
                    v-model="pwForm.current_password"
                    type="password"
                    placeholder="현재 비밀번호를 입력하세요"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">새 비밀번호</label>
                  <input
                    v-model="pwForm.new_password"
                    type="password"
                    placeholder="6자 이상"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
                <div>
                  <label class="text-[12px] text-[#888] mb-1 block">새 비밀번호 확인</label>
                  <input
                    v-model="pwForm.new_password_confirmation"
                    type="password"
                    placeholder="새 비밀번호를 한번 더 입력하세요"
                    class="w-full bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  />
                </div>
              </div>

              <button
                :disabled="pwSaving"
                class="w-full mt-5 py-3 rounded-[12px] bg-[#FF7B22] text-white text-[14px] font-semibold active:bg-[#E56A1A] disabled:opacity-50"
                @click="handleChangePassword"
              >
                {{ pwSaving ? '변경 중...' : '비밀번호 변경' }}
              </button>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- 앱 정보 모달 -->
      <Teleport to="body">
        <Transition name="slide-up">
          <div
            v-if="showAppInfoModal"
            class="fixed inset-0 z-[100] flex items-end justify-center px-3 pb-[68px]"
            @click.self="showAppInfoModal = false"
          >
            <div class="absolute inset-0 bg-black/40" @click="showAppInfoModal = false" />

            <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 z-10">
              <div class="flex items-center justify-between mb-5">
                <h3 class="text-[17px] font-bold text-[#333]">앱 정보</h3>
                <button
                  class="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F5F5F5]"
                  @click="showAppInfoModal = false"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#666" stroke-width="2" stroke-linecap="round"><path d="M18 6L6 18"/><path d="M6 6l12 12"/></svg>
                </button>
              </div>

              <div class="flex flex-col gap-3">
                <div class="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
                  <span class="text-[13px] text-[#888]">앱 이름</span>
                  <span class="text-[13px] text-[#333] font-medium">보험청구ON (설계사)</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
                  <span class="text-[13px] text-[#888]">앱 버전</span>
                  <span class="text-[13px] text-[#333] font-medium">{{ nativeAppVersion || '-' }}</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
                  <span class="text-[13px] text-[#888]">웹 버전</span>
                  <span class="text-[13px] text-[#333] font-medium">1.0.0</span>
                </div>
                <div class="flex items-center justify-between py-2 border-b border-[#F5F5F5]">
                  <span class="text-[13px] text-[#888]">디바이스</span>
                  <span class="text-[13px] text-[#333] font-medium">{{ deviceLabel }}</span>
                </div>
                <div class="flex items-center justify-between py-2">
                  <span class="text-[13px] text-[#888]">문의</span>
                  <span class="text-[13px] text-[#333] font-medium">support@podo-life.co.kr</span>
                </div>
              </div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <!-- Toast -->
      <Transition name="fade">
        <div
          v-if="toast.visible.value"
          class="fixed bottom-24 left-1/2 -translate-x-1/2 text-white text-[13px] px-5 py-2.5 rounded-full shadow-lg z-50 whitespace-nowrap"
          :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'"
        >
          {{ toast.message.value }}
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAgentAuthStore } from '../../stores/agentAuthStore'
import { useToast } from '../../composables/useToast'
import { changePassword as apiChangePassword } from '../../services/agentApi'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'

const router = useRouter()
const authStore = useAgentAuthStore()
const toast = useToast()

// ===== 프로필 표시 =====
const agentName = computed(() => authStore.agent?.name ?? '설계사')
const agencyName = computed(() => authStore.agent?.office_location ?? '소속 없음')
const agentEmployeeNo = computed(() => authStore.agent?.employee_number ?? '-')
const agentPhone = computed(() => authStore.agent?.phone ?? '-')
const agentEmail = computed(() => authStore.agent?.email ?? '-')
const hireDate = computed(() => authStore.agent?.hire_date ?? '-')
const registeredAt = computed(() => {
  const raw = authStore.agent?.created_at
  if (!raw) return '-'
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
})
const agentInitial = computed(() => agentName.value.charAt(0))

// ===== 개인정보 수정 =====
const isEditing = ref(false)
const editSaving = ref(false)
const editForm = ref({
  phone: '',
  email: '',
  office_location: '',
})

function startEdit(): void {
  editForm.value = {
    phone: authStore.agent?.phone ?? '',
    email: authStore.agent?.email ?? '',
    office_location: authStore.agent?.office_location ?? '',
  }
  isEditing.value = true
}

function cancelEdit(): void {
  isEditing.value = false
}

async function handleSaveProfile(): Promise<void> {
  editSaving.value = true
  try {
    await authStore.updateProfile({
      phone: editForm.value.phone,
      email: editForm.value.email,
      office_location: editForm.value.office_location,
    })
    isEditing.value = false
    toast.showToast('프로필이 수정되었습니다.')
  } catch {
    toast.showToast(authStore.error ?? '프로필 수정에 실패했습니다.', 'error')
  } finally {
    editSaving.value = false
  }
}

// ===== 비밀번호 변경 =====
const showPwModal = ref(false)
const pwSaving = ref(false)
const pwForm = ref({
  current_password: '',
  new_password: '',
  new_password_confirmation: '',
})

function openPwModal(): void {
  pwForm.value = { current_password: '', new_password: '', new_password_confirmation: '' }
  showPwModal.value = true
}

function closePwModal(): void {
  showPwModal.value = false
}

async function handleChangePassword(): Promise<void> {
  if (!pwForm.value.current_password) {
    toast.showToast('현재 비밀번호를 입력해주세요.', 'error')
    return
  }
  if (pwForm.value.new_password.length < 6) {
    toast.showToast('새 비밀번호는 6자 이상이어야 합니다.', 'error')
    return
  }
  if (pwForm.value.new_password !== pwForm.value.new_password_confirmation) {
    toast.showToast('새 비밀번호가 일치하지 않습니다.', 'error')
    return
  }
  pwSaving.value = true
  try {
    await apiChangePassword(pwForm.value)
    closePwModal()
    toast.showToast('비밀번호가 변경되었습니다.')
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    toast.showToast(msg || '비밀번호 변경에 실패했습니다.', 'error')
  } finally {
    pwSaving.value = false
  }
}

// ===== 앱 정보 =====
const showAppInfoModal = ref(false)
const nativeAppVersion = ref('')
const nativeDevice = ref(-1) // 0: Android, 1: iOS

const deviceLabel = computed(() => {
  if (nativeDevice.value === 0) return 'Android'
  if (nativeDevice.value === 1) return 'iOS'
  return '웹 브라우저'
})

const appVersion = computed(() => nativeAppVersion.value || 'v1.0.0')

onMounted(() => {
  // 네이티브 앱에서 전달하는 디바이스 정보 수신 핸들러
  (window as unknown as Record<string, unknown>).__handleType__ = (data: { app_version?: string; device?: number }) => {
    if (data.app_version) nativeAppVersion.value = data.app_version
    if (data.device !== undefined) nativeDevice.value = data.device
  }
})

// ===== 메뉴 =====
const menuItems = [
  { label: '비밀번호 변경', action: () => openPwModal() },
  { label: '앱 정보', action: () => { showAppInfoModal.value = true } },
]

// ===== 로그아웃 =====
async function handleLogout(): Promise<void> {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s ease; }
.fade-enter-from, .fade-leave-to { opacity: 0; }
</style>
