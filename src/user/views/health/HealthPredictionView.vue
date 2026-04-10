<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="typeLabel" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FF7B22] border-t-transparent"></div>
        </div>

        <template v-else>
          <CardSection v-if="!data" class="mb-4">
            <div class="py-2">
              <p class="text-[14px] text-[#222] font-semibold mb-1 text-center">3년 내 {{ typeLabel }}</p>
              <p class="text-[12px] text-[#999] mb-4 text-center">간편인증으로 조회</p>

              <HealthAuthForm v-model="authForm" class="mb-4" />

              <div class="bg-[#FEE500] bg-opacity-20 rounded-[10px] px-4 py-3 mb-4 flex items-center gap-2">
                <span class="text-[18px]">💬</span>
                <p class="text-[12px] text-[#333]">
                  <span class="font-semibold">카카오톡</span>으로 간편인증합니다.
                </p>
              </div>

              <button
                class="w-full bg-[#FF7B22] text-white rounded-[10px] py-3 text-[14px] font-semibold disabled:opacity-50"
                :disabled="!canSubmit"
                @click="onFetch"
              >
                <span v-if="busy">조회 중...</span>
                <span v-else>카카오톡으로 인증하고 조회</span>
              </button>
            </div>
          </CardSection>

          <template v-else>
            <!-- 위험등급 헤로 -->
            <CardSection class="mb-4">
              <div class="text-center py-3">
                <div :class="['w-[64px] h-[64px] mx-auto mb-3 rounded-full flex items-center justify-center', heroCircleClass]">
                  <span class="text-[28px] font-bold text-white">{{ data.risk_grade || '?' }}</span>
                </div>
                <p class="text-[16px] font-bold text-[#222]">{{ data.risk_grade_label || '미평가' }}</p>
                <p class="text-[12px] text-[#888] mt-1">3년 내 발생 확률 {{ data.risk_ratio || '-' }}%</p>
                <p class="text-[12px] text-[#888]">유사집단 내 위치: {{ data.average_ratio || '-' }}</p>
              </div>
            </CardSection>

            <CardSection v-if="detailList.length > 0" class="mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-3">위험요인 분석</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(d, idx) in detailList"
                  :key="idx"
                  class="py-2 border-b border-[#F5F5F5] last:border-b-0"
                >
                  <p class="text-[13px] font-medium text-[#333]">{{ d.resType || d.resRiskFactor || '-' }}</p>
                  <p v-if="d.resState" class="text-[12px] text-[#666] mt-0.5">상태: {{ d.resState }}</p>
                  <p v-if="d.resRecommendValue" class="text-[12px] text-[#FF7B22]">권장: {{ d.resRecommendValue }}</p>
                </div>
              </div>
            </CardSection>

            <CardSection v-if="subDetailList.length > 0" class="mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-3">처방 메시지</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(s, idx) in subDetailList"
                  :key="idx"
                  class="py-2"
                >
                  <p class="text-[12px] text-[#666]">{{ s.resType || '-' }}</p>
                </div>
              </div>
            </CardSection>

            <button
              class="w-full bg-[#FF7B22] text-white rounded-[10px] py-2.5 text-[14px] font-semibold disabled:opacity-50"
              :disabled="busy"
              @click="onFetch"
            >
              새로 조회하기
            </button>
          </template>

          <div v-if="errorMessage" class="bg-red-50 border border-red-200 rounded-[10px] px-4 py-3 mt-4">
            <p class="text-[13px] text-red-600">{{ errorMessage }}</p>
          </div>

          <div
            v-if="twoWayPending"
            class="fixed inset-0 z-50 bg-black/50 flex items-end sm:items-center justify-center"
            @click.self="twoWayPending = false"
          >
            <div class="w-full max-w-[402px] bg-white rounded-t-[20px] sm:rounded-[20px] p-6 pb-8">
              <h3 class="text-[16px] font-bold text-[#222] mb-3">추가인증이 필요합니다</h3>
              <button
                class="w-full bg-[#FF7B22] text-white rounded-[10px] py-3 text-[14px] font-semibold disabled:opacity-50"
                :disabled="busy"
                @click="onConfirm"
              >
                인증 완료
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
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import HealthAuthForm from '@user/components/health/HealthAuthForm.vue'
import { EMPTY_AUTH_FORM, isNhisFormValid, toNhisPayload, type HealthAuthFormValue } from '@user/components/health/healthAuthForm'
import { healthApi, type PredictionType } from '@user/services/healthApi'
import type { HealthPredictionRow } from '@shared/types/health'

const KAKAO_LOGIN_TYPE_LEVEL = '1'

const route = useRoute()
const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const twoWayPending = ref(false)
const data = ref<HealthPredictionRow | null>(null)
const authForm = ref<HealthAuthFormValue>({ ...EMPTY_AUTH_FORM })

const canSubmit = computed(() => !busy.value && isNhisFormValid(authForm.value))

const predictionType = computed<PredictionType>(() => (route.params.type as PredictionType) || 'cardio')

const typeLabel = computed(() => {
  const labels: Record<PredictionType, string> = {
    cardio: '심뇌혈관 예측',
    stroke: '뇌졸중 예측',
    diabetes: '당뇨병 예측',
    kidney: '만성신장질환 예측',
    mi: '심근경색 예측',
  }
  return labels[predictionType.value] || '예측'
})

const detailList = computed(() => {
  return (data.value?.detail_list ?? []) as Array<Record<string, string>>
})

const subDetailList = computed(() => {
  return (data.value?.sub_detail_list ?? []) as Array<Record<string, string>>
})

const heroCircleClass = computed(() => {
  const grade = parseInt(data.value?.risk_grade ?? '0', 10)
  if (grade >= 5) return 'bg-red-500'
  if (grade >= 4) return 'bg-orange-500'
  if (grade >= 3) return 'bg-yellow-500'
  if (grade >= 1) return 'bg-green-500'
  return 'bg-gray-400'
})

watch(predictionType, () => loadData(), { immediate: false })

onMounted(loadData)

async function loadData() {
  loading.value = true
  try {
    const res = await healthApi.getPrediction(predictionType.value)
    data.value = res.data.data ?? null
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function onFetch() {
  if (!canSubmit.value) {
    errorMessage.value = '인증정보를 모두 입력해주세요.'
    return
  }
  busy.value = true
  errorMessage.value = ''
  try {
    const res = await healthApi.requestPrediction(predictionType.value, {
      loginTypeLevel: KAKAO_LOGIN_TYPE_LEVEL,
      ...toNhisPayload(authForm.value),
    })
    const body = res.data
    if (body.two_way) {
      twoWayPending.value = true
      return
    }
    if (body.success) {
      data.value = body.data ?? null
      return
    }
    errorMessage.value = body.message || '조회 실패'
  } catch (e: unknown) {
    errorMessage.value = extractError(e)
  } finally {
    busy.value = false
  }
}

async function onConfirm() {
  busy.value = true
  errorMessage.value = ''
  try {
    const res = await healthApi.confirmPrediction(predictionType.value, { simpleAuth: '1' })
    const body = res.data
    if (body.success) {
      twoWayPending.value = false
      data.value = body.data ?? null
      return
    }
    errorMessage.value = body.message || '인증 확인 실패'
  } catch (e: unknown) {
    errorMessage.value = extractError(e)
  } finally {
    busy.value = false
  }
}

function extractError(e: unknown): string {
  const err = e as { response?: { data?: { message?: string } } }
  return err?.response?.data?.message || '오류가 발생했습니다.'
}
</script>
