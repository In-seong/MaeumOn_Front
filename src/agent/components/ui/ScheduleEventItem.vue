<template>
  <div class="bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] flex overflow-hidden">
    <!-- Left Color Bar -->
    <div class="w-1 shrink-0" :class="barColor" />

    <div class="flex-1 p-4 flex items-start gap-3">
      <!-- Completion Checkbox -->
      <button
        class="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-colors"
        :class="
          schedule.is_completed
            ? 'bg-[#1FBD53] border-[#1FBD53]'
            : 'border-[#D0D0D0] hover:border-[#FF7B22]'
        "
        :aria-label="schedule.is_completed ? '완료 취소' : '완료 처리'"
        @click="emit('toggle', schedule.schedule_id)"
      >
        <svg
          v-if="schedule.is_completed"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          stroke-width="3"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </button>

      <!-- Content -->
      <div class="flex-1 min-w-0">
        <div class="flex items-center justify-between gap-2 mb-1">
          <h4
            class="text-[14px] font-semibold truncate"
            :class="schedule.is_completed ? 'text-[#B0B0B0] line-through' : 'text-[#333]'"
          >
            {{ schedule.title }}
          </h4>
          <StatusBadge :label="typeLabel" :variant="typeVariant" />
        </div>

        <!-- Time -->
        <p class="text-[12px] text-[#999] mb-1">
          {{ schedule.start_time }}
          <template v-if="schedule.end_time"> ~ {{ schedule.end_time }}</template>
        </p>

        <!-- Customer Name -->
        <p v-if="schedule.customer_name" class="text-[12px] text-[#666]">
          <span class="text-[#999]">고객:</span> {{ schedule.customer_name }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { Schedule } from '../../types'

interface Props {
  schedule: Schedule
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
}>()

const typeConfig: Record<Schedule['schedule_type'], { label: string; variant: 'primary' | 'info' | 'success' | 'default'; bar: string }> = {
  meeting: { label: '미팅', variant: 'primary', bar: 'bg-[#FF7B22]' },
  call: { label: '전화', variant: 'info', bar: 'bg-[#4285F4]' },
  visit: { label: '방문', variant: 'success', bar: 'bg-[#1FBD53]' },
  other: { label: '기타', variant: 'default', bar: 'bg-[#B0B0B0]' },
}

const typeLabel = computed(() => typeConfig[props.schedule.schedule_type].label)
const typeVariant = computed(() => typeConfig[props.schedule.schedule_type].variant)
const barColor = computed(() => typeConfig[props.schedule.schedule_type].bar)
</script>
