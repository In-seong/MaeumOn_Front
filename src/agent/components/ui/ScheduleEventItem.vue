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
            : 'border-[#D0D0D0] active:border-[#FF7B22]'
        "
        :aria-label="schedule.is_completed ? '완료 취소' : '완료 처리'"
        @click="emit('toggle', schedule.event_id)"
      >
        <svg
          v-if="schedule.is_completed"
          width="12" height="12" viewBox="0 0 24 24" fill="none"
          stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"
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

        <!-- Time (수동 일정만) -->
        <p v-if="schedule.start_time" class="text-[12px] text-[#999] mb-1">
          {{ schedule.start_time?.slice(0, 5) }}
          <template v-if="schedule.end_time"> ~ {{ schedule.end_time?.slice(0, 5) }}</template>
        </p>

        <!-- Customer Name -->
        <p v-if="schedule.customer" class="text-[12px] text-[#666]">
          <span class="text-[#999]">고객:</span> {{ schedule.customer.name }}
        </p>

        <!-- Source badge (시스템 자동 생성) -->
        <span
          v-if="schedule.source === 'system'"
          class="inline-block text-[10px] text-[#999] bg-[#F5F5F5] rounded-full px-2 py-0.5 mt-1"
        >
          자동 생성
        </span>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-1 shrink-0">
        <button
          v-if="schedule.source === 'manual'"
          class="p-1.5 text-[#AAAAAA] active:text-[#FF7B22]"
          @click="emit('edit', schedule.event_id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        </button>
        <button
          class="p-1.5 text-[#AAAAAA] active:text-[#FF4444]"
          @click="emit('delete', schedule.event_id)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import type { CalendarEvent, CalendarEventType } from '../../types'

interface Props {
  schedule: CalendarEvent
}

const props = defineProps<Props>()

const emit = defineEmits<{
  toggle: [id: number]
  edit: [id: number]
  delete: [id: number]
}>()

const typeConfig: Record<CalendarEventType, { label: string; variant: 'primary' | 'info' | 'success' | 'default' | 'danger' | 'warning'; bar: string }> = {
  manual: { label: '일정', variant: 'primary', bar: 'bg-[#FF7B22]' },
  birthday: { label: '생일', variant: 'info', bar: 'bg-[#E91E63]' },
  contract_expiry: { label: '만기', variant: 'danger', bar: 'bg-[#F44336]' },
  insurance_expiry: { label: '보험만기', variant: 'warning', bar: 'bg-[#FF9800]' },
}

const config = computed(() => typeConfig[props.schedule.event_type] ?? typeConfig.manual)
const typeLabel = computed(() => config.value.label)
const typeVariant = computed(() => config.value.variant)
const barColor = computed(() => config.value.bar)
</script>
