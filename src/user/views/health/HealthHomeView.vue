<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내 건강 정보" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <div v-if="loading" class="text-center py-20">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-[#FF7B22] border-t-transparent"></div>
          <p class="text-[13px] text-[#888] mt-3">불러오는 중...</p>
        </div>

        <template v-else>
          <!-- Hero: 종합 위험도 -->
          <CardSection class="mb-4">
            <div class="flex items-center gap-4">
              <div :class="['w-[56px] h-[56px] rounded-full flex items-center justify-center flex-shrink-0', heroCircleClass]">
                <span class="text-[24px] font-bold text-white">{{ heroEmoji }}</span>
              </div>
              <div class="flex-1">
                <p class="text-[12px] text-[#999]">최근 검진 종합 평가</p>
                <p class="text-[18px] font-bold text-[#222]">{{ heroLabel }}</p>
                <p class="text-[12px] text-[#888]">
                  주의 {{ summary?.checkup?.risk_summary?.counts?.caution ?? 0 }} · 이상 {{ summary?.checkup?.risk_summary?.counts?.danger ?? 0 }}
                </p>
              </div>
            </div>
          </CardSection>

          <!-- 메뉴 그리드 -->
          <div class="grid grid-cols-2 gap-3 mb-4">
            <button
              class="bg-white rounded-[14px] p-4 shadow-sm border border-[#F5F5F5] text-left active:scale-[0.98] transition-transform"
              @click="router.push('/health-checkup')"
            >
              <div class="text-[20px] mb-1">📋</div>
              <p class="text-[14px] font-semibold text-[#222]">건강검진 결과</p>
              <p class="text-[11px] text-[#999] mt-0.5">{{ summary?.consent?.health_checkup ? '동의 완료' : '동의 필요' }}</p>
            </button>
            <button
              class="bg-white rounded-[14px] p-4 shadow-sm border border-[#F5F5F5] text-left active:scale-[0.98] transition-transform"
              @click="router.push('/medical-info')"
            >
              <div class="text-[20px] mb-1">🏥</div>
              <p class="text-[14px] font-semibold text-[#222]">진료내역</p>
              <p class="text-[11px] text-[#999] mt-0.5">{{ summary?.medical?.count ?? 0 }}건 조회됨</p>
            </button>
            <button
              class="bg-white rounded-[14px] p-4 shadow-sm border border-[#F5F5F5] text-left active:scale-[0.98] transition-transform"
              @click="router.push('/health-examination')"
            >
              <div class="text-[20px] mb-1">📅</div>
              <p class="text-[14px] font-semibold text-[#222]">검진대상 여부</p>
              <p class="text-[11px] text-[#999] mt-0.5">올해 일반/암검진</p>
            </button>
            <button
              class="bg-white rounded-[14px] p-4 shadow-sm border border-[#F5F5F5] text-left active:scale-[0.98] transition-transform"
              @click="router.push('/health-age')"
            >
              <div class="text-[20px] mb-1">⏳</div>
              <p class="text-[14px] font-semibold text-[#222]">건강나이</p>
              <p class="text-[11px] text-[#999] mt-0.5">
                {{ summary?.predictions?.health_age?.health_age ? `${summary.predictions.health_age.health_age}세` : '미조회' }}
              </p>
            </button>
          </div>

          <!-- 예측 5종 -->
          <CardSection class="mb-4">
            <p class="text-[14px] font-semibold text-[#222] mb-3">3년 내 질환 예측</p>
            <div class="flex flex-col gap-2">
              <button
                v-for="p in predictionTypes"
                :key="p.type"
                class="flex items-center justify-between py-3 px-3 rounded-[10px] hover:bg-[#FAFAFA] transition-colors text-left"
                @click="router.push(`/health-prediction/${p.type}`)"
              >
                <div class="flex items-center gap-3">
                  <span class="text-[18px]">{{ p.icon }}</span>
                  <div>
                    <p class="text-[13px] font-medium text-[#333]">{{ p.label }}</p>
                    <p class="text-[11px] text-[#999]">
                      {{ getPredictionLabel(p.type) }}
                    </p>
                  </div>
                </div>
                <div :class="['px-2 py-0.5 rounded-full text-[11px] font-semibold', getGradeClass(p.type)]">
                  {{ getGradeLabel(p.type) }}
                </div>
              </button>
            </div>
          </CardSection>

          <!-- 마지막 동기화 -->
          <CardSection class="!bg-[#F8F8F8]">
            <p class="text-[12px] text-[#999] mb-2">동기화 정보</p>
            <div class="grid grid-cols-2 gap-2 text-[11px] text-[#666]">
              <div>
                <p>건강검진</p>
                <p class="text-[#222] font-medium">{{ formatSync(summary?.sync?.last_checkup_sync_at) }}</p>
              </div>
              <div>
                <p>진료내역</p>
                <p class="text-[#222] font-medium">{{ formatSync(summary?.sync?.last_medical_info_sync_at) }}</p>
              </div>
            </div>
          </CardSection>
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
import { healthApi, type PredictionType } from '@user/services/healthApi'
import type { HealthSummary } from '@shared/types/health'

const router = useRouter()
const loading = ref(true)
const summary = ref<HealthSummary | null>(null)

const predictionTypes: { type: PredictionType; label: string; icon: string }[] = [
  { type: 'cardio', label: '심뇌혈관', icon: '❤️' },
  { type: 'stroke', label: '뇌졸중', icon: '🧠' },
  { type: 'diabetes', label: '당뇨병', icon: '🩸' },
  { type: 'kidney', label: '만성신장', icon: '🫘' },
  { type: 'mi', label: '심근경색', icon: '💔' },
]

onMounted(async () => {
  try {
    const res = await healthApi.getSummary()
    summary.value = res.data.data ?? null
  } catch (e) {
    console.error('건강 요약 조회 실패', e)
  } finally {
    loading.value = false
  }
})

const heroLabel = computed(() => {
  const overall = summary.value?.checkup?.risk_summary?.overall
  switch (overall) {
    case 'danger': return '관리 필요'
    case 'caution': return '주의 필요'
    case 'normal': return '양호'
    default: return '검진 필요'
  }
})

const heroEmoji = computed(() => {
  const overall = summary.value?.checkup?.risk_summary?.overall
  switch (overall) {
    case 'danger': return '⚠'
    case 'caution': return '!'
    case 'normal': return '✓'
    default: return '?'
  }
})

const heroCircleClass = computed(() => {
  const overall = summary.value?.checkup?.risk_summary?.overall
  if (overall === 'danger') return 'bg-red-500'
  if (overall === 'caution') return 'bg-orange-500'
  if (overall === 'normal') return 'bg-green-500'
  return 'bg-gray-400'
})

function getPredictionLabel(type: PredictionType): string {
  const p = summary.value?.predictions?.[type]
  if (!p) return '미조회'
  return p.risk_ratio ? `3년 내 ${p.risk_ratio}% · 위치 ${p.average_ratio ?? '-'}` : '데이터 없음'
}

function getGradeLabel(type: PredictionType): string {
  const p = summary.value?.predictions?.[type]
  if (!p?.risk_grade) return '-'
  return p.risk_grade_label || `등급 ${p.risk_grade}`
}

function getGradeClass(type: PredictionType): string {
  const grade = parseInt(summary.value?.predictions?.[type]?.risk_grade ?? '0', 10)
  if (grade >= 5) return 'bg-red-100 text-red-700'
  if (grade >= 4) return 'bg-orange-100 text-orange-700'
  if (grade >= 3) return 'bg-yellow-100 text-yellow-700'
  if (grade >= 1) return 'bg-green-100 text-green-700'
  return 'bg-gray-100 text-gray-500'
}

function formatSync(value: string | null | undefined): string {
  if (!value) return '미동기화'
  const datePart = value.split('T')[0] ?? value
  return datePart.replace(/-/g, '.')
}
</script>
