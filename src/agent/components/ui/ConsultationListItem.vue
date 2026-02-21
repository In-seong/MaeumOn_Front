<template>
  <div
    class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-200"
  >
    <!-- Clickable Summary Row -->
    <button
      type="button"
      class="w-full text-left p-4 focus:outline-none focus:ring-2 focus:ring-[#FF7B22] focus:ring-inset rounded-[16px]"
      :aria-expanded="isExpanded"
      :aria-controls="`consultation-detail-${consultation.consultation_id}`"
      @click="toggleExpand"
    >
      <!-- Top: Name + Status -->
      <div class="flex items-center justify-between mb-2">
        <span class="text-[15px] font-semibold text-[#222]">{{ consultation.customer?.name ?? consultation.customer_name ?? '-' }}</span>
        <StatusBadge :label="statusLabel" :variant="statusVariant" />
      </div>

      <!-- Consultation Type -->
      <div class="mb-1.5">
        <span class="text-[12px] font-medium text-[#FF7B22] bg-[#FFF3ED] px-2 py-0.5 rounded-full">
          {{ consultation.consultation_type }}
        </span>
      </div>

      <!-- Content Preview -->
      <p class="text-[13px] text-[#666] line-clamp-2 mb-2 leading-[1.5]">
        {{ consultation.consultation_content }}
      </p>

      <!-- Date -->
      <div class="flex items-center justify-between">
        <span class="text-[11px] text-[#AAA]">{{ consultation.created_at }}</span>
        <svg
          class="w-4 h-4 text-[#CCC] transition-transform duration-200"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </button>

    <!-- Expanded Detail -->
    <div
      v-if="isExpanded"
      :id="`consultation-detail-${consultation.consultation_id}`"
      class="border-t border-[#F0F0F0] p-4"
    >
      <!-- Full Content -->
      <div class="mb-4">
        <h4 class="text-[13px] font-semibold text-[#555] mb-1.5">상담 내용</h4>
        <p class="text-[13px] text-[#333] leading-[1.6] whitespace-pre-wrap">{{ consultation.consultation_content }}</p>
      </div>

      <!-- Contact Info -->
      <div class="mb-4">
        <InfoRow label="연락처" :value="consultation.customer?.phone ?? consultation.customer_phone ?? '-'" />
        <InfoRow label="요청일시" :value="consultation.created_at" />

      </div>

      <!-- Existing Response -->
      <!-- Response Form (for pending / in_progress) -->
      <div v-if="consultation.consultation_status !== 'completed'">
        <FormTextarea
          v-model="responseText"
          :label="consultation.consultation_status === 'pending' ? '상태 변경' : '완료 처리'"
          placeholder="고객에게 전달할 답변을 작성해주세요"
          :rows="4"
        />
        <div class="mt-3">
          <ActionButton full large @click="submitResponse">
            {{ consultation.consultation_status === 'pending' ? '상담 진행' : '상담 완료' }}
          </ActionButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import type { Consultation } from '../../types'

interface Props {
  consultation: Consultation
}

const props = defineProps<Props>()

const emit = defineEmits<{
  respond: [id: number, answer: string]
}>()

const isExpanded = ref(false)
const responseText = ref('')

const statusLabel = computed(() => {
  const map: Record<string, string> = {
    pending: '대기중',
    in_progress: '진행중',
    completed: '완료',
  }
  return map[props.consultation.consultation_status] ?? props.consultation.consultation_status
})

const statusVariant = computed<'warning' | 'info' | 'success'>(() => {
  const map: Record<string, 'warning' | 'info' | 'success'> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  }
  return map[props.consultation.consultation_status] ?? 'warning'
})

function toggleExpand(): void {
  isExpanded.value = !isExpanded.value
}

function submitResponse(): void {
  if (!responseText.value.trim()) return
  emit('respond', props.consultation.consultation_id, responseText.value.trim())
  isExpanded.value = false
}
</script>
