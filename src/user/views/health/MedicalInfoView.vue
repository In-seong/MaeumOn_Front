<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내 진료내역" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <div v-if="initialLoading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FF7B22] border-t-transparent"></div>
          <p class="text-[13px] text-[#888] mt-3">불러오는 중...</p>
        </div>

        <template v-else>
          <!-- ① 동의 안내 -->
          <CardSection v-if="!consentStatus?.medical_info_consented" class="mb-4">
            <div class="text-center py-4">
              <div class="w-[56px] h-[56px] mx-auto mb-3 bg-[#FFF0E5] rounded-full flex items-center justify-center">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <p class="text-[15px] font-semibold text-[#222] mb-1">내진료정보열람 동의 필요</p>
              <p class="text-[12px] text-[#999] leading-relaxed mb-3">
                건강보험심사평가원(HIRA)에 등록된<br/>
                최근 5년 진료내역을 조회합니다.
              </p>
              <p class="text-[11px] text-[#FF7B22] mb-4 px-2">
                ※ 민감상병 정보(정신질환·감염질환 등)가 포함될 수 있습니다.
              </p>
              <button
                class="bg-[#FF7B22] text-white rounded-[10px] px-6 py-2.5 text-[14px] font-semibold disabled:opacity-50"
                :disabled="busy"
                @click="onAgreeConsent"
              >
                동의하고 조회 시작
              </button>
            </div>
          </CardSection>

          <!-- ② 동의 완료 → 조회 -->
          <CardSection v-else-if="medicalRecords.length === 0" class="mb-4">
            <div class="py-2">
              <p class="text-[14px] text-[#222] font-semibold mb-1 text-center">아직 가져온 진료내역이 없습니다.</p>
              <p class="text-[12px] text-[#999] mb-4 text-center">간편인증으로 HIRA에서 진료내역을 조회하세요.</p>

              <HealthAuthForm v-model="authForm" :require-rrn="true" class="mb-4" />

              <div class="bg-[#FEE500] bg-opacity-20 rounded-[10px] px-4 py-3 mb-4 flex items-center gap-2">
                <span class="text-[18px]">💬</span>
                <p class="text-[12px] text-[#333] leading-relaxed">
                  <span class="font-semibold">카카오톡</span>으로 간편인증합니다.
                </p>
              </div>

              <button
                class="w-full bg-[#FF7B22] text-white rounded-[10px] py-3 text-[14px] font-semibold disabled:opacity-50"
                :disabled="!canSubmit"
                @click="onFetchMedicalInfo"
              >
                <span v-if="busy">조회 중... (최대 5분)</span>
                <span v-else>카카오톡으로 인증하고 조회</span>
              </button>

              <p class="text-[11px] text-[#999] mt-2 text-center">
                * 24시간 이내 재조회는 제한됩니다.
              </p>
            </div>
          </CardSection>

          <template v-else>
            <!-- 요약 -->
            <CardSection class="mb-4">
              <div class="flex items-center justify-between mb-2">
                <p class="text-[14px] font-semibold text-[#222]">진료 요약</p>
                <button class="text-[12px] text-[#FF7B22] underline" @click="onFetchMedicalInfo" :disabled="busy">
                  새로고침
                </button>
              </div>
              <div class="grid grid-cols-3 gap-2 mt-2">
                <div class="bg-[#FFF7F0] rounded-[10px] p-3 text-center">
                  <p class="text-[20px] font-bold text-[#FF7B22]">{{ summary?.total_records ?? 0 }}</p>
                  <p class="text-[11px] text-[#888] mt-0.5">전체 진료</p>
                </div>
                <div class="bg-[#F0F4FF] rounded-[10px] p-3 text-center">
                  <p class="text-[20px] font-bold text-[#4A7CFF]">{{ Object.keys(summary?.by_disease ?? {}).length }}</p>
                  <p class="text-[11px] text-[#888] mt-0.5">주요 진단명</p>
                </div>
                <div class="bg-[#F0FFF4] rounded-[10px] p-3 text-center">
                  <p class="text-[20px] font-bold text-[#22C55E]">{{ Object.keys(summary?.by_department ?? {}).length }}</p>
                  <p class="text-[11px] text-[#888] mt-0.5">진료과</p>
                </div>
              </div>
            </CardSection>

            <!-- 진료내역 리스트 -->
            <CardSection class="mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-3">최근 진료내역</p>
              <div class="flex flex-col gap-3">
                <div
                  v-for="record in medicalRecords"
                  :key="record.record_id"
                  class="border-b border-[#F5F5F5] last:border-b-0 pb-3 last:pb-0"
                >
                  <div class="flex items-start justify-between mb-1">
                    <p class="text-[14px] font-medium text-[#333]">{{ record.diagnosis_name || '진단명 없음' }}</p>
                    <span class="text-[11px] text-[#999]">{{ formatDate(record.treatment_date) }}</span>
                  </div>
                  <p class="text-[12px] text-[#666]">{{ record.hospital_name || '-' }} · {{ record.department || '-' }}</p>
                  <div v-if="record.diagnosis_code" class="text-[11px] text-[#999] mt-1">
                    코드: {{ record.diagnosis_code }}
                  </div>
                  <div v-if="record.deductible_amt" class="text-[11px] text-[#999] mt-0.5">
                    본인부담: {{ formatMoney(record.deductible_amt) }}원
                  </div>
                </div>
              </div>
            </CardSection>
          </template>

          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mt-4">
            <p class="text-[13px] text-red-600">{{ errorMessage }}</p>
          </div>

          <!-- 2-Way 인증 -->
          <div
            v-if="twoWayPending"
            class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            @click.self="twoWayPending = false"
          >
            <div class="w-full max-w-[402px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 pb-8">
              <h3 class="text-[16px] font-bold text-[#222] mb-3">추가인증이 필요합니다</h3>
              <p class="text-[13px] text-[#666] mb-4">
                선택하신 간편인증 앱에서 인증 요청을 확인하고, 완료 후 아래 버튼을 눌러주세요.
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
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import HealthAuthForm from '@user/components/health/HealthAuthForm.vue'
import { EMPTY_AUTH_FORM, isHiraFormValid, toHiraPayload, type HealthAuthFormValue } from '@user/components/health/healthAuthForm'
import { healthApi } from '@user/services/healthApi'
import type { HealthConsentStatus, MedicalRecord, MedicalInfoSummary } from '@shared/types/health'

const KAKAO_LOGIN_TYPE_LEVEL = '1'

const initialLoading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const twoWayPending = ref(false)

const consentStatus = ref<HealthConsentStatus | null>(null)
const medicalRecords = ref<MedicalRecord[]>([])
const summary = ref<MedicalInfoSummary | null>(null)
const authForm = ref<HealthAuthFormValue>({ ...EMPTY_AUTH_FORM })

const canSubmit = computed(() => !busy.value && isHiraFormValid(authForm.value))

onMounted(async () => {
  await Promise.all([loadConsentStatus(), loadMedicalRecords()])
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

async function loadMedicalRecords() {
  try {
    const [recordsRes, summaryRes] = await Promise.all([
      healthApi.getMedicalRecords('codef_hira'),
      healthApi.getMedicalSummary(),
    ])
    medicalRecords.value = recordsRes.data.data ?? []
    summary.value = summaryRes.data.data ?? null
  } catch (e) {
    console.error('진료내역 조회 실패', e)
  }
}

async function onAgreeConsent() {
  busy.value = true
  errorMessage.value = ''
  try {
    await healthApi.agreeConsent('medical_info')
    await loadConsentStatus()
  } catch (e: unknown) {
    errorMessage.value = extractError(e, '동의 저장에 실패했습니다.')
  } finally {
    busy.value = false
  }
}

async function onFetchMedicalInfo() {
  if (!canSubmit.value) {
    errorMessage.value = '인증정보를 모두 입력해주세요.'
    return
  }
  busy.value = true
  errorMessage.value = ''

  try {
    const res = await healthApi.requestMedicalInfo({
      loginTypeLevel: KAKAO_LOGIN_TYPE_LEVEL,
      ...toHiraPayload(authForm.value),
      includeSensitive: true,
    })
    const body = res.data

    if (body.two_way) {
      twoWayPending.value = true
      return
    }

    if (body.success) {
      await loadMedicalRecords()
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
    const res = await healthApi.confirmMedicalInfo({ simpleAuth: '1' })
    const body = res.data

    if (body.success) {
      twoWayPending.value = false
      await loadMedicalRecords()
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

function formatMoney(value: string | null): string {
  if (!value) return '0'
  const num = parseFloat(value)
  return num.toLocaleString('ko-KR')
}
</script>
