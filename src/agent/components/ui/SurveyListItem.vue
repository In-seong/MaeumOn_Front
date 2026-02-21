<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-start justify-between mb-2">
      <p class="text-[15px] font-semibold text-[#333]">{{ survey.customer?.name ?? '-' }}</p>
      <StatusBadge :label="statusLabel" :variant="statusVariant" />
    </div>

    <!-- Star Rating -->
    <div v-if="survey.survey_status === 'responded' && survey.rating" class="flex items-center gap-1 mt-2">
      <svg
        v-for="star in 5"
        :key="star"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        :fill="star <= (survey.rating ?? 0) ? '#FF7B22' : 'none'"
        :stroke="star <= (survey.rating ?? 0) ? '#FF7B22' : '#DDD'"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
      <span class="text-[13px] font-semibold text-[#FF7B22] ml-1">{{ survey.rating }}.0</span>
    </div>

    <!-- Feedback Preview -->
    <p
      v-if="survey.survey_status === 'responded' && survey.feedback"
      class="mt-2 text-[13px] text-[#666] bg-[#F8F8F8] rounded-[8px] px-3 py-2 line-clamp-2"
    >
      {{ survey.feedback }}
    </p>

    <!-- Sent Date -->
    <div class="flex items-center gap-1 mt-3 text-[12px] text-[#999]">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
      <span>발송: {{ survey.sent_at }}</span>
      <template v-if="survey.responded_at">
        <span class="text-[#DDD] mx-1">|</span>
        <span>응답: {{ survey.responded_at }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { SatisfactionSurvey } from '../../types'

interface Props {
  survey: SatisfactionSurvey
}

const props = defineProps<Props>()

const statusLabel = computed(() => {
  return props.survey.survey_status === 'responded' ? '응답완료' : '발송됨'
})

const statusVariant = computed<'success' | 'info'>(() => {
  return props.survey.survey_status === 'responded' ? 'success' : 'info'
})
</script>
