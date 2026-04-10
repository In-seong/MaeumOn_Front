<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="건강검진 결과" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- 로딩 -->
        <div v-if="initialLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FF7B22] border-t-transparent"></div>
          <p class="text-[13px] text-[#888] mt-3">불러오는 중...</p>
        </div>

        <template v-else>
          <!-- ① + ② 검진결과 없음 → 동의 + 인증 폼 -->
          <template v-if="!latestCheckup">
            <!-- 동의 -->
            <CardSection class="mb-4">
              <div class="flex items-start gap-3">
                <button
                  class="mt-0.5 flex-shrink-0 w-[22px] h-[22px] rounded-[6px] border-2 flex items-center justify-center transition-colors"
                  :class="consentAgreed
                    ? 'bg-[#FF7B22] border-[#FF7B22]'
                    : 'bg-white border-[#CCC]'"
                  @click="toggleConsent"
                  :disabled="busy"
                >
                  <svg v-if="consentAgreed" width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M20 6L9 17l-5-5" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
                <div>
                  <p class="text-[13px] font-semibold text-[#222] mb-1">건강검진정보 조회 동의</p>
                  <p class="text-[11px] text-[#888] leading-relaxed">
                    국민건강보험공단(NHIS)이 제공하는 건강검진 결과(혈압, 혈당, 콜레스테롤 등 신체계측 및 검사 수치), 검진 소견 및 문진 정보를 조회/저장/이용하는 것에 동의합니다.
                    동의를 거부할 권리가 있으며, 거부 시 건강 관련 서비스 이용이 제한됩니다.
                  </p>
                </div>
              </div>
            </CardSection>

            <!-- 인증 폼 (동의 후 표시) -->
            <CardSection v-if="consentAgreed" class="mb-4">
              <div class="py-2">
                <p class="text-[14px] text-[#222] font-semibold mb-1 text-center">본인 인증 정보 입력</p>
                <p class="text-[12px] text-[#999] mb-4 text-center">간편인증으로 NHIS에서 검진결과를 조회합니다.</p>

                <HealthAuthForm v-model="authForm" class="mb-4" />

                <div class="bg-[#FEE500] bg-opacity-20 rounded-[10px] px-4 py-3 mb-4 flex items-center gap-2">
                  <span class="text-[18px]">💬</span>
                  <p class="text-[12px] text-[#333] leading-relaxed">
                    <span class="font-semibold">카카오톡</span>으로 간편인증합니다.<br/>
                    <span class="text-[#888]">인증 완료 후 자동으로 결과가 조회됩니다.</span>
                  </p>
                </div>

                <button
                  class="w-full bg-[#FF7B22] text-white rounded-[10px] py-3 text-[14px] font-semibold disabled:opacity-50"
                  :disabled="!canSubmit"
                  @click="onFetchCheckup"
                >
                  <span v-if="busy">조회 중... (최대 5분)</span>
                  <span v-else>카카오톡으로 인증하고 조회</span>
                </button>
              </div>
            </CardSection>
          </template>

          <!-- ③ 검진결과 표시 -->
          <template v-else>
            <CardSection class="mb-4">
              <div class="flex items-center gap-4">
                <div class="w-[48px] h-[48px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2z" stroke="#FF7B22" stroke-width="1.5"/>
                    <path d="M12 8v4M12 16h.01" stroke="#FF7B22" stroke-width="2" stroke-linecap="round"/>
                  </svg>
                </div>
                <div class="flex-1">
                  <p class="text-[12px] text-[#999]">최근 검진일</p>
                  <p class="text-[18px] font-bold text-[#222]">{{ formatDate(latestCheckup.checkup_date) }}</p>
                  <p class="text-[12px] text-[#888]">{{ latestCheckup.organization_name || latestCheckup.hospital_name || '국민건강보험공단' }}</p>
                </div>
                <button class="text-[12px] text-[#FF7B22] underline" @click="onRefreshClick" :disabled="busy">
                  새로고침
                </button>
              </div>
            </CardSection>

            <div :class="['border rounded-[16px] p-4 mb-4', overallStyleClass]">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[14px] font-semibold" :class="overallTextClass">{{ overallLabel }}</span>
              </div>
              <p class="text-[12px] text-[#888]">{{ latestCheckup.opinion || latestCheckup.judgement || '판정 정보 없음' }}</p>
            </div>

            <CardSection class="mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-3">검진 항목</p>
              <div class="flex flex-col gap-3">
                <div
                  v-for="item in checkupItems"
                  :key="item.name"
                  class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0"
                >
                  <div>
                    <p class="text-[14px] font-medium text-[#333]">{{ item.name }}</p>
                    <p class="text-[12px] text-[#999]">{{ item.detail }}</p>
                  </div>
                  <StatusBadge :label="item.status" :variant="item.variant" />
                </div>
              </div>
            </CardSection>

            <CardSection v-if="latestCheckup.opinion" class="mb-5">
              <p class="text-[14px] font-semibold text-[#222] mb-3">검진 소견</p>
              <p class="text-[13px] text-[#555] leading-relaxed whitespace-pre-line">{{ latestCheckup.opinion }}</p>
            </CardSection>

            <button
              class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
              @click="router.push('/hospital')"
            >
              주변 병원 찾기
            </button>
          </template>

          <!-- 에러 -->
          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mt-4">
            <p class="text-[13px] text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- 2-Way 인증 모달 -->
          <div
            v-if="twoWayPending"
            class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            @click.self="twoWayPending = false"
          >
            <div class="w-full max-w-[402px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 pb-8">
              <h3 class="text-[16px] font-bold text-[#222] mb-3">추가인증이 필요합니다</h3>
              <p class="text-[13px] text-[#666] mb-4">
                카카오톡 앱에서 인증 요청을 확인하고, 완료 후 아래 버튼을 눌러주세요.
              </p>
              <button
                class="w-full bg-[#FF7B22] text-white rounded-[10px] py-3 text-[14px] font-semibold disabled:opacity-50"
                :disabled="busy"
                @click="onConfirmTwoWay"
              >
                <span v-if="busy">확인 중...</span>
                <span v-else>인증 완료</span>
              </button>
              <button class="w-full mt-2 text-[13px] text-[#888] py-2" @click="twoWayPending = false">
                취소
              </button>
            </div>
          </div>
        </template>
      </main>

      <BottomNav />
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
import HealthAuthForm from '@user/components/health/HealthAuthForm.vue'
import { EMPTY_AUTH_FORM, isNhisFormValid, toNhisPayload, type HealthAuthFormValue } from '@user/components/health/healthAuthForm'
import { healthApi } from '@user/services/healthApi'
import type { HealthCheckup, HealthConsentStatus } from '@shared/types/health'

const KAKAO_LOGIN_TYPE_LEVEL = '1'

const router = useRouter()
const initialLoading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const twoWayPending = ref(false)

const consentStatus = ref<HealthConsentStatus | null>(null)
const latestCheckup = ref<HealthCheckup | null>(null)
const authForm = ref<HealthAuthFormValue>({ ...EMPTY_AUTH_FORM })
const consentAgreed = ref(false)

const canSubmit = computed(() => !busy.value && consentAgreed.value && isNhisFormValid(authForm.value))

onMounted(async () => {
  await Promise.all([loadConsentStatus(), loadLatestCheckup()])
  // 이미 동의한 상태면 체크박스 미리 체크
  if (consentStatus.value?.health_checkup_consented) {
    consentAgreed.value = true
  }
  initialLoading.value = false
})

async function loadConsentStatus() {
  try {
    const res = await healthApi.getConsentStatus()
    consentStatus.value = res.data.data ?? null
  } catch (e) {
    console.error('동의 상태 조회 실패', e)
  }
}

async function loadLatestCheckup() {
  try {
    const res = await healthApi.getLatestCheckup()
    latestCheckup.value = res.data.data ?? null
  } catch (e) {
    console.error('검진결과 조회 실패', e)
  }
}

async function toggleConsent() {
  if (consentAgreed.value) {
    consentAgreed.value = false
    return
  }

  // 동의 API 호출 (서버에 동의 시각 저장)
  busy.value = true
  errorMessage.value = ''
  try {
    await healthApi.agreeConsent('health_checkup')
    await loadConsentStatus()
    consentAgreed.value = true
  } catch (e: unknown) {
    errorMessage.value = extractError(e, '동의 저장에 실패했습니다.')
  } finally {
    busy.value = false
  }
}

function onRefreshClick() {
  latestCheckup.value = null
}

async function onFetchCheckup() {
  if (!canSubmit.value) {
    errorMessage.value = '인증정보를 모두 입력해주세요.'
    return
  }
  busy.value = true
  errorMessage.value = ''

  try {
    const res = await healthApi.requestCheckup({
      loginTypeLevel: KAKAO_LOGIN_TYPE_LEVEL,
      ...toNhisPayload(authForm.value),
    })
    const body = res.data

    if (body.two_way) {
      twoWayPending.value = true
      return
    }

    if (body.success) {
      if (body.code === 'NO_RECORDS' || body.data?.count === 0) {
        errorMessage.value = body.message || '최근 10년 내 건강검진 이력이 없습니다.'
        return
      }
      await loadLatestCheckup()
      return
    }

    errorMessage.value = body.message || '조회에 실패했습니다.'
  } catch (e: unknown) {
    errorMessage.value = extractError(e, '조회 중 오류가 발생했습니다.')
  } finally {
    busy.value = false
  }
}

async function onConfirmTwoWay() {
  busy.value = true
  errorMessage.value = ''
  try {
    const res = await healthApi.confirmCheckup({
      simpleAuth: '1',
    })
    const body = res.data

    if (body.success) {
      twoWayPending.value = false

      if (body.code === 'NO_RECORDS' || body.data?.count === 0) {
        errorMessage.value = body.message || '최근 10년 내 건강검진 이력이 없습니다.'
        return
      }

      await loadLatestCheckup()
      return
    }

    if (body.two_way) {
      errorMessage.value = '추가 인증 단계가 필요합니다. 다시 시도해주세요.'
      return
    }

    errorMessage.value = body.message || '인증 확인에 실패했습니다.'
  } catch (e: unknown) {
    errorMessage.value = extractError(e, '인증 확인 중 오류가 발생했습니다.')
  } finally {
    busy.value = false
  }
}

function extractError(e: unknown, fallback: string): string {
  const err = e as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || fallback
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return '-'
  const datePart = dateStr.split('T')[0] ?? dateStr
  return datePart.replace(/-/g, '.')
}

// 위험지표 → 화면 항목 변환
const checkupItems = computed(() => {
  const c = latestCheckup.value
  if (!c) return []

  const items: { name: string; detail: string; status: string; variant: 'success' | 'warning' | 'danger' }[] = []

  if (c.blood_pressure) {
    items.push({ name: '혈압', detail: `${c.blood_pressure} mmHg`, ...mapVariant(c.risk_summary?.items?.blood_pressure) })
  }
  if (c.fasting_blood_sugar) {
    items.push({ name: '공복혈당', detail: `${c.fasting_blood_sugar} mg/dL`, ...mapVariant(c.risk_summary?.items?.fasting_blood_sugar) })
  }
  if (c.total_cholesterol) {
    items.push({ name: '총 콜레스테롤', detail: `${c.total_cholesterol} mg/dL`, ...mapVariant(c.risk_summary?.items?.total_cholesterol) })
  }
  if (c.hdl_cholesterol || c.ldl_cholesterol) {
    items.push({ name: 'HDL/LDL', detail: `HDL ${c.hdl_cholesterol ?? '-'} / LDL ${c.ldl_cholesterol ?? '-'} mg/dL`, ...mapVariant(c.risk_summary?.items?.hdl_cholesterol || c.risk_summary?.items?.ldl_cholesterol) })
  }
  if (c.triglyceride) {
    items.push({ name: '중성지방', detail: `${c.triglyceride} mg/dL`, ...mapVariant(c.risk_summary?.items?.triglyceride) })
  }
  if (c.bmi) {
    items.push({ name: 'BMI', detail: `${c.bmi} kg/m²`, ...mapVariant(c.risk_summary?.items?.bmi) })
  }
  if (c.ast || c.alt) {
    items.push({ name: '간기능', detail: `AST ${c.ast ?? '-'} / ALT ${c.alt ?? '-'}`, ...mapVariant(c.risk_summary?.items?.ast || c.risk_summary?.items?.alt) })
  }
  if (c.gfr) {
    items.push({ name: '신장기능', detail: `GFR ${c.gfr} mL/min`, ...mapVariant(c.risk_summary?.items?.gfr) })
  }

  return items
})

function mapVariant(level: 'normal' | 'caution' | 'danger' | undefined): { status: string; variant: 'success' | 'warning' | 'danger' } {
  switch (level) {
    case 'danger': return { status: '이상', variant: 'danger' }
    case 'caution': return { status: '주의', variant: 'warning' }
    case 'normal': return { status: '정상', variant: 'success' }
    default: return { status: '미평가', variant: 'success' }
  }
}

const overallLabel = computed(() => {
  switch (latestCheckup.value?.risk_summary?.overall) {
    case 'danger': return '관리 필요'
    case 'caution': return '주의 필요'
    case 'normal': return '정상'
    default: return '판정 대기'
  }
})

const overallStyleClass = computed(() => {
  const o = latestCheckup.value?.risk_summary?.overall
  if (o === 'danger') return 'bg-red-50 border-red-200'
  if (o === 'caution') return 'bg-[#FFF7F0] border-[#FFE0C5]'
  return 'bg-green-50 border-green-200'
})

const overallTextClass = computed(() => {
  const o = latestCheckup.value?.risk_summary?.overall
  if (o === 'danger') return 'text-red-600'
  if (o === 'caution') return 'text-[#F3940E]'
  return 'text-green-600'
})
</script>
