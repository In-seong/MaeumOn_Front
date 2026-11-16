<template>
  <div class="space-y-6 text-center py-8">
    <div class="animate-spin rounded-full h-16 w-16 border-4 border-[#FFE0C4] border-t-[#FF7B22] mx-auto" />

    <div>
      <h3 class="text-[16px] font-bold text-[#222]">{{ statusText }}</h3>
      <p class="text-[13px] text-[#888] mt-2">잠시만 기다려주세요. 최대 2~3분 소요될 수 있습니다.</p>
    </div>

    <!-- 진행 단계 표시 -->
    <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 text-left mx-4">
      <div
        v-for="(step, idx) in steps"
        :key="idx"
        class="flex items-center gap-3 py-2"
      >
        <div
          :class="[
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0',
            idx < currentStepIdx ? 'bg-green-100' : idx === currentStepIdx ? 'bg-[#FFF0E0]' : 'bg-[#F5F5F5]'
          ]"
        >
          <svg v-if="idx < currentStepIdx" class="w-3.5 h-3.5 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
          <div v-else-if="idx === currentStepIdx" class="w-2 h-2 rounded-full bg-[#FF7B22] animate-pulse" />
          <div v-else class="w-2 h-2 rounded-full bg-[#DDD]" />
        </div>
        <span
          :class="[
            'text-[13px]',
            idx < currentStepIdx ? 'text-green-600' : idx === currentStepIdx ? 'text-[#FF7B22] font-medium' : 'text-[#BBB]'
          ]"
        >{{ step }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { analyzeUnclaimed } from '../../services/agentApi'

const props = defineProps<{
  sessionId: number
}>()

const emit = defineEmits<{
  'completed': []
  'failed': [msg: string]
}>()

const steps = [
  '심평원 진료내역 수신 중...',
  '보험계약 정보 수신 중...',
  '미청구 보험금 분석 중...',
  '결과 정리 중...',
]

const currentStepIdx = ref(0)
let stepTimer: ReturnType<typeof setInterval> | null = null

const statusText = computed(() => {
  const step = steps[currentStepIdx.value]
  return step ?? '처리 중...'
})

onMounted(() => {
  stepTimer = setInterval(() => {
    if (currentStepIdx.value < steps.length - 1) {
      currentStepIdx.value++
    }
  }, 3000)

  runAnalysis()
})

onUnmounted(() => {
  if (stepTimer) clearInterval(stepTimer)
})

async function runAnalysis() {
  try {
    await analyzeUnclaimed(props.sessionId)
    currentStepIdx.value = steps.length
    if (stepTimer) clearInterval(stepTimer)
    emit('completed')
  } catch (e: unknown) {
    if (stepTimer) clearInterval(stepTimer)
    const err = e as { response?: { data?: { message?: string } } }
    emit('failed', err.response?.data?.message ?? '분석에 실패했습니다.')
  }
}
</script>
