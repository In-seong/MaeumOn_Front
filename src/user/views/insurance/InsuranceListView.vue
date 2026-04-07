<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내 보험" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- 로딩 -->
        <div v-if="store.loading && !isRefreshing" class="flex flex-col items-center justify-center py-20">
          <svg class="animate-spin h-8 w-8 text-[#FF7B22] mb-3" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" fill="none"/>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
          </svg>
          <p class="text-[14px] text-[#999]">보험정보를 불러오는 중...</p>
        </div>

        <!-- 데이터 있음 -->
        <template v-else-if="hasAnyContracts">
          <div class="flex items-center justify-between mb-4">
            <span class="text-[12px] text-[#999]">{{ syncDateLabel }}</span>
            <button
              class="flex items-center gap-1 text-[12px] text-[#FF7B22] font-medium disabled:opacity-50"
              :disabled="isRefreshing"
              @click="onRefresh"
            >
              <svg
                width="14" height="14" viewBox="0 0 24 24" fill="none"
                :class="{ 'animate-spin': isRefreshing }"
              >
                <path d="M23 4v6h-6M1 20v-6h6" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              {{ isRefreshing ? '동기화 중...' : '새로고침' }}
            </button>
          </div>

          <!-- 요약 -->
          <CardSection class="mb-4">
            <div class="flex items-center justify-between">
              <div>
                <p class="text-[12px] text-[#999]">총 보험 수</p>
                <p class="text-[20px] font-bold text-[#222]">{{ displayedContracts.length }}건</p>
              </div>
              <div class="text-right">
                <p class="text-[12px] text-[#999]">월 납입료</p>
                <p class="text-[20px] font-bold text-[#FF7B22]">{{ formattedTotalPremium }}</p>
              </div>
            </div>
          </CardSection>

          <!-- 빈 목록 안내 (토글로 인해 표시할 항목이 없을 때) -->
          <!-- 보험 목록 -->
          <div class="flex flex-col gap-3 mb-5">
            <router-link
              v-for="item in displayedContracts"
              :key="item.insurance_id"
              :to="'/insurance/' + item.insurance_id"
              class="block"
            >
              <CardSection>
                <div class="flex items-start justify-between mb-2">
                  <span class="text-[13px] font-medium text-[#888]">
                    {{ item.insurance_company?.company_name || '보험사' }}
                  </span>
                  <div v-if="getContractBadge(item)" class="flex gap-1">
                    <StatusBadge :label="getContractBadge(item)!.label" :variant="getContractBadge(item)!.variant" />
                  </div>
                </div>
                <p class="text-[15px] font-semibold text-[#222] mb-1">
                  {{ item.product_name || '보험상품' }}
                </p>
                <div class="flex items-center gap-1.5">
                  <span v-if="item.premium_amount" class="text-[14px] font-bold text-[#FF7B22]">
                    월 {{ formatAmount(item.premium_amount) }}
                  </span>
                  <span class="text-[12px] text-[#B0B0B0]">
                    {{ getContractPeriod(item) }}
                  </span>
                </div>
              </CardSection>
            </router-link>
          </div>

          <button
            class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
            @click="router.push('/coverage-analysis')"
          >
            전체 보장 분석 보기
          </button>
        </template>

        <!-- 데이터 없음 -->
        <template v-else>
          <div class="flex flex-col items-center justify-center py-16">
            <div class="w-[64px] h-[64px] mb-4 bg-[#FFF0E5] rounded-full flex items-center justify-center">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <p class="text-[16px] font-semibold text-[#222] mb-2">보험정보가 없습니다</p>
            <p class="text-[13px] text-[#999] text-center mb-6 leading-relaxed">
              내보험다보여 서비스를 통해<br/>가입 보험정보를 조회해보세요.
            </p>
            <button
              class="bg-[#FF7B22] text-white rounded-[12px] px-8 py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              @click="goToConsent"
            >
              보험정보 조회하기
            </button>
          </div>
        </template>

        <!-- 에러 -->
        <div v-if="store.error && !store.loading" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mt-4">
          <p class="text-[13px] text-red-600">{{ store.error }}</p>
        </div>

        <!-- 새로고침 로딩 안내 -->
        <LoadingNotice v-if="isRefreshing" />
      </main>
      <BottomNav />

      <!-- 새로고침 시 2-Way 모달 -->
      <Credit4u2WayModal
        :visible="store.twoWayPending"
        @close="store.reset2Way()"
        @confirmed="onRefreshConfirmed"
      />

      <!-- 새로고침 로그인 모달 -->
      <Teleport to="body">
        <div v-if="showRefreshLogin" class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <div class="absolute inset-0 bg-black/50" @click="showRefreshLogin = false" />
          <div class="relative w-full max-w-[402px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 pb-8">
            <h3 class="text-[17px] font-bold text-[#222] mb-4">보험정보 새로고침</h3>
            <p class="text-[13px] text-[#888] mb-4">
              최신 보험정보를 불러오려면 내보험다보여 계정으로 다시 로그인해주세요.
            </p>
            <div class="flex flex-col gap-3 mb-4">
              <FormInput v-model="refreshLoginId" label="아이디" placeholder="내보험다보여 아이디" />
              <FormInput v-model="refreshPassword" label="비밀번호" type="password" placeholder="비밀번호" />
            </div>
            <button
              class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold disabled:opacity-50"
              :disabled="!refreshLoginId || !refreshPassword || store.loading"
              @click="doRefresh"
            >
              조회하기
            </button>
          </div>
        </div>
      </Teleport>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import FormInput from '@user/components/form/FormInput.vue'
import LoadingNotice from '@user/components/ui/LoadingNotice.vue'
import Credit4u2WayModal from '@user/components/Credit4u2WayModal.vue'
import { useCredit4uStore } from '@user/stores/credit4uStore'
import type { InsuranceContract } from '@shared/types/credit4u'

const router = useRouter()
const store = useCredit4uStore()

const isRefreshing = ref(false)
const showRefreshLogin = ref(false)
const refreshLoginId = ref('')
const refreshPassword = ref('')

// 만기 제외 계약만 표시 (메인 페이지와 동일)
const displayedContracts = computed(() => store.activeContracts)
const hasAnyContracts = computed(() => displayedContracts.value.length > 0)

const syncDateLabel = computed(() => {
  if (store.lastSyncedAt) {
    const date = new Date(store.lastSyncedAt)
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일 기준`
  }
  return ''
})

const formattedTotalPremium = computed(() => {
  // 화면에 표시되는 보험 기준으로 합산 (만기 토글 상태 반영)
  const total = displayedContracts.value.reduce(
    (sum, c) => sum + (Number(c.premium_amount) || 0),
    0,
  )
  return formatAmount(total)
})

function formatAmount(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') return '0원'
  const num = Math.round(Number(amount))
  if (isNaN(num)) return '0원'
  return num.toLocaleString('ko-KR') + '원'
}

type BadgeVariant = 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default'

function getContractBadge(contract: InsuranceContract): { label: string; variant: BadgeVariant } | null {
  if (contract.contract_status === 'expired' || contract.contract_status === '만기') {
    return { label: '만기', variant: 'default' }
  }
  if (contract.contract_type === 'actual_loss') {
    return { label: '실손', variant: 'primary' }
  }
  if (contract.expiration_date) {
    const expDate = new Date(contract.expiration_date)
    const now = new Date()
    const diffDays = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= 30 && diffDays > 0) {
      return { label: '갱신예정', variant: 'warning' }
    }
  }
  return null
}

function getContractPeriod(contract: InsuranceContract): string {
  if (contract.expiration_date) {
    const date = new Date(contract.expiration_date)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 만기`
  }
  if (contract.end_date) {
    const date = new Date(contract.end_date)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')} 만기`
  }
  return contract.payment_period || ''
}

function goToConsent(): void {
  if (store.hasCredit4uAccount) {
    router.push('/insurance/credit4u/login')
  } else {
    router.push('/insurance/consent')
  }
}

function onRefresh(): void {
  showRefreshLogin.value = true
}

async function doRefresh(): Promise<void> {
  showRefreshLogin.value = false
  isRefreshing.value = true

  const success = await store.refreshContracts({
    id: refreshLoginId.value,
    password: refreshPassword.value,
  })

  if (success) {
    isRefreshing.value = false
    refreshLoginId.value = ''
    refreshPassword.value = ''
  } else if (!store.twoWayPending) {
    isRefreshing.value = false
  }
}

function onRefreshConfirmed(): void {
  isRefreshing.value = false
  refreshLoginId.value = ''
  refreshPassword.value = ''
}

onMounted(async () => {
  store.clearError()
  const hasData = await store.checkContracts()

  if (!hasData && !store.hasCredit4uAccount) {
    // 데이터 없고 Credit4U 계정도 없으면 빈 상태 표시 (위 template에서 처리)
  }
})
</script>
