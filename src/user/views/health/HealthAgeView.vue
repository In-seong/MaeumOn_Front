<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="건강나이" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FF7B22] border-t-transparent"></div>
        </div>

        <template v-else>
          <CardSection v-if="!data" class="mb-4">
            <div class="py-2">
              <p class="text-[14px] text-[#222] font-semibold mb-1 text-center">건강나이 알아보기</p>
              <p class="text-[12px] text-[#999] mb-4 text-center">건강iN 서비스 연동이 필요합니다.</p>

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
            <CardSection class="mb-4">
              <div class="text-center py-3">
                <p class="text-[12px] text-[#999] mb-1">나의 건강나이</p>
                <p class="text-[40px] font-bold text-[#FF7B22]">{{ data.health_age || '-' }}<span class="text-[18px] text-[#888]">세</span></p>
                <p class="text-[12px] text-[#888] mt-1">실제 나이: {{ data.chronological_age || '-' }}세</p>
              </div>
              <p v-if="data.change_after_text" class="text-[13px] text-[#555] mt-3 leading-relaxed text-center">
                {{ data.change_after_text }}
              </p>
            </CardSection>

            <CardSection v-if="detailList.length > 0" class="mb-4">
              <p class="text-[14px] font-semibold text-[#222] mb-3">위험요인 분석</p>
              <div class="flex flex-col gap-2">
                <div
                  v-for="(d, idx) in detailList"
                  :key="idx"
                  class="py-2 border-b border-[#F5F5F5] last:border-b-0"
                >
                  <p class="text-[13px] font-medium text-[#333]">{{ d.resType || '-' }}</p>
                  <p class="text-[12px] text-[#666] mt-0.5">상태: {{ d.resState || '-' }}</p>
                  <p class="text-[12px] text-[#FF7B22]">권장: {{ d.resRecommendValue || '-' }}</p>
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
import { ref, computed, onMounted } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import HealthAuthForm from '@user/components/health/HealthAuthForm.vue'
import { EMPTY_AUTH_FORM, isNhisFormValid, toNhisPayload, type HealthAuthFormValue } from '@user/components/health/healthAuthForm'
import { healthApi } from '@user/services/healthApi'
import type { HealthPredictionRow } from '@shared/types/health'

const KAKAO_LOGIN_TYPE_LEVEL = '1'

const loading = ref(true)
const busy = ref(false)
const errorMessage = ref('')
const twoWayPending = ref(false)
const data = ref<HealthPredictionRow | null>(null)
const authForm = ref<HealthAuthFormValue>({ ...EMPTY_AUTH_FORM })

const canSubmit = computed(() => !busy.value && isNhisFormValid(authForm.value))
const detailList = computed(() => {
  return (data.value?.detail_list ?? []) as Array<Record<string, string>>
})

onMounted(async () => {
  try {
    const res = await healthApi.getHealthAge()
    data.value = res.data.data ?? null
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
})

async function onFetch() {
  if (!canSubmit.value) {
    errorMessage.value = '인증정보를 모두 입력해주세요.'
    return
  }
  busy.value = true
  errorMessage.value = ''
  try {
    const res = await healthApi.requestHealthAge({
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
    const res = await healthApi.confirmHealthAge({ simpleAuth: '1' })
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
