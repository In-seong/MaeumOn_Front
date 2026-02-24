<template>
  <div class="flex items-center justify-between px-2">
    <template v-for="(step, idx) in steps" :key="step.number">
      <!-- 스텝 아이콘 + 라벨 -->
      <div class="flex flex-col items-center" :class="{ 'flex-1': true }">
        <div
          class="w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-semibold transition-colors"
          :class="stepCircleClass(step.number)"
        >
          <!-- 완료 스텝: 체크 아이콘 -->
          <svg v-if="step.number < currentStep" width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17l-5-5" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          <!-- 현재/미완료 스텝: 숫자 -->
          <span v-else>{{ idx + 1 }}</span>
        </div>
        <span
          class="text-[11px] mt-1 text-center leading-tight whitespace-nowrap"
          :class="step.number === currentStep ? 'text-[#FF7B22] font-semibold' : step.number < currentStep ? 'text-[#FF7B22] opacity-70' : 'text-[#999]'"
        >{{ step.label }}</span>
      </div>

      <!-- 스텝 연결선 -->
      <div
        v-if="idx < steps.length - 1"
        class="flex-1 h-[2px] mx-1 mt-[-16px] transition-colors"
        :class="step.number < currentStep ? 'bg-[#FF7B22]' : 'bg-[#E0E0E0]'"
      ></div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = defineProps<{
  currentStep: number
  activeSteps: number[]
  stepLabels: string[]
}>()

const steps = computed(() =>
  props.activeSteps.map((stepNum) => ({
    number: stepNum,
    label: props.stepLabels[stepNum - 1] || `Step ${stepNum}`,
  }))
)

function stepCircleClass(stepNumber: number) {
  if (stepNumber === props.currentStep) {
    return 'bg-[#FF7B22] text-white'
  }
  if (stepNumber < props.currentStep) {
    return 'bg-[#FFF0E5] text-[#FF7B22]'
  }
  return 'bg-[#F0F0F0] text-[#999]'
}
</script>
