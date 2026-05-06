<template>
  <div>
    <label class="block text-[13px] font-medium text-[#888] mb-1.5">
      {{ field.field_label }}
      <span v-if="field.is_required" class="text-[#FF0000]">*</span>
    </label>

    <input
      v-if="field.field_type === 'text'"
      type="text"
      :value="modelValue"
      @input="emitInput"
      :placeholder="field.placeholder"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <input
      v-else-if="field.field_type === 'date'"
      type="date"
      :value="modelValue"
      @input="emitInput"
      @click="($event.target as HTMLInputElement).showPicker?.()"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors cursor-pointer"
    />

    <input
      v-else-if="field.field_type === 'number'"
      type="text"
      inputmode="numeric"
      :value="modelValue"
      @input="emitInput"
      :placeholder="field.placeholder"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <input
      v-else-if="field.field_type === 'phone'"
      type="tel"
      :value="modelValue"
      @input="emitInput"
      placeholder="010-1234-5678"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <div v-else-if="field.field_type === 'resident_number'" class="flex items-center gap-2 w-full min-w-0">
      <input
        type="text"
        inputmode="numeric"
        :value="residentFront"
        @input="handleResidentFront"
        placeholder="생년월일"
        :required="field.is_required"
        maxlength="6"
        ref="residentFrontRef"
        class="flex-1 min-w-0 px-4 py-3 bg-white rounded-none border-0 border-b border-[#E0E0E0] text-[14px] text-[#333] text-center outline-none focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
      />
      <span class="text-[18px] text-[#999] font-bold shrink-0">-</span>
      <div class="flex-1 min-w-0 relative">
        <input
          :type="showResidentBack ? 'text' : 'password'"
          inputmode="numeric"
          :value="residentBack"
          @input="handleResidentBack"
          placeholder="뒷자리"
          :required="field.is_required"
          maxlength="7"
          ref="residentBackRef"
          class="w-full px-4 py-3 pr-10 bg-white rounded-none border-0 border-b border-[#E0E0E0] text-[14px] text-[#333] text-center outline-none focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
        />
        <button
          type="button"
          class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666] transition-colors"
          @click="showResidentBack = !showResidentBack"
        >
          <svg v-if="showResidentBack" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
          </svg>
          <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
            <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
          </svg>
        </button>
      </div>
    </div>

    <input
      v-else-if="field.field_type === 'resident_number_front'"
      type="text"
      inputmode="numeric"
      :value="modelValue"
      @input="emitInput"
      placeholder="생년월일 6자리"
      :required="field.is_required"
      maxlength="6"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <div v-else-if="field.field_type === 'resident_number_back'" class="relative">
      <input
        :type="showResidentBack ? 'text' : 'password'"
        inputmode="numeric"
        :value="modelValue"
        @input="emitInput"
        placeholder="뒷자리 7자리"
        :required="field.is_required"
        maxlength="7"
        class="w-full px-4 py-3 pr-10 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
      />
      <button
        type="button"
        class="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-[#999] hover:text-[#666] transition-colors"
        @click="showResidentBack = !showResidentBack"
      >
        <svg v-if="showResidentBack" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
          <circle cx="12" cy="12" r="3"/>
        </svg>
        <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24"/>
          <line x1="1" y1="1" x2="23" y2="23"/>
        </svg>
      </button>
    </div>

    <textarea
      v-else-if="field.field_type === 'textarea'"
      :value="modelValue"
      @input="emitInput"
      :placeholder="field.placeholder"
      :required="field.is_required"
      rows="3"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors resize-none placeholder-[#B0B0B0]"
    ></textarea>

    <!-- 셀렉트 (검색 가능 드롭다운) -->
    <div v-else-if="field.field_type === 'select' && field.field_options?.choices" class="relative" ref="selectWrapperRef">
      <button
        type="button"
        class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] outline-none border transition-colors text-left bg-no-repeat"
        :class="selectOpen ? 'border-[#FF7B22]' : 'border-[#E8E8E8]'"
        :style="selectArrowStyle"
        @click="selectOpen = !selectOpen"
      >
        <span :class="modelValue ? 'text-[#333]' : 'text-[#B0B0B0]'">
          {{ selectedLabel || '선택해주세요' }}
        </span>
      </button>
      <div
        v-if="selectOpen"
        class="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#E8E8E8] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
      >
        <div class="p-2 border-b border-[#F0F0F0]">
          <input
            ref="selectSearchRef"
            type="text"
            v-model="selectSearch"
            placeholder="검색..."
            class="w-full px-3 py-2 bg-[#F8F8F8] rounded-[8px] text-[13px] text-[#333] outline-none placeholder-[#B0B0B0]"
          />
        </div>
        <ul class="max-h-[200px] overflow-y-auto">
          <li
            v-for="choice in filteredChoices"
            :key="choice.value || choice.label"
            class="px-4 py-2.5 text-[14px] cursor-pointer transition-colors"
            :class="modelValue === (choice.value || choice.label) ? 'bg-[#FFF0E5] text-[#FF7B22] font-medium' : 'text-[#333] active:bg-[#F8F8F8]'"
            @click="selectChoice(choice.value || choice.label)"
          >{{ choice.label }}</li>
          <li v-if="filteredChoices.length === 0" class="px-4 py-3 text-[13px] text-[#999] text-center">
            검색 결과가 없습니다
          </li>
        </ul>
      </div>
    </div>

    <!-- 체크박스 (다중선택 - 버튼 토글) -->
    <div v-else-if="field.field_type === 'checkbox' && field.field_options?.choices" class="flex flex-wrap gap-2">
      <button
        v-for="choice in field.field_options.choices"
        :key="choice.value || choice.label"
        type="button"
        class="px-4 py-2.5 rounded-[10px] text-[14px] font-medium border transition-all active:scale-[0.97]"
        :class="isChoiceSelected(choice.value || choice.label)
          ? 'bg-[#FF7B22] text-white border-[#FF7B22]'
          : 'bg-white text-[#666] border-[#E0E0E0]'"
        @click="toggleCheckboxChoice(choice.value || choice.label)"
      >{{ choice.label }}</button>
    </div>

    <!-- 라디오 (단일선택) -->
    <div v-else-if="field.field_type === 'radio' && field.field_options?.choices" class="flex flex-wrap gap-3">
      <label
        v-for="choice in field.field_options.choices"
        :key="choice.value || choice.label"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="radio"
          :name="'radio_' + field.form_field_id"
          :value="choice.value || choice.label"
          :checked="modelValue === (choice.value || choice.label)"
          @change="$emit('update:modelValue', choice.value || choice.label)"
          class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] focus:ring-[#FF7B22]"
        />
        <span class="text-[14px] text-[#333]">{{ choice.label }}</span>
      </label>
    </div>

    <!-- 서명 -->
    <div v-else-if="field.field_type === 'signature'">
      <slot name="signature" :field="field"></slot>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch, nextTick, onMounted, onUnmounted } from 'vue'
import type { FormField } from '@shared/types'

const props = defineProps<{
  field: FormField
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'format-input': [fieldId: number, fieldType: string, event: Event]
}>()

// ===== 검색 가능 셀렉트 =====
const selectOpen = ref(false)
const selectSearch = ref('')
const selectWrapperRef = ref<HTMLElement | null>(null)
const selectSearchRef = ref<HTMLInputElement | null>(null)

const selectedLabel = computed(() => {
  if (!props.modelValue || !props.field.field_options?.choices) return ''
  const found = props.field.field_options.choices.find(
    c => (c.value || c.label) === props.modelValue
  )
  return found?.label || props.modelValue
})

const filteredChoices = computed(() => {
  const choices = props.field.field_options?.choices || []
  if (!selectSearch.value) return choices
  const q = selectSearch.value.toLowerCase()
  return choices.filter(c => c.label.toLowerCase().includes(q) || (c.value || '').toLowerCase().includes(q))
})

function selectChoice(value: string) {
  emit('update:modelValue', value)
  selectOpen.value = false
  selectSearch.value = ''
}

watch(selectOpen, (open) => {
  if (open) {
    nextTick(() => selectSearchRef.value?.focus())
  } else {
    selectSearch.value = ''
  }
})

function handleClickOutside(e: MouseEvent) {
  if (selectWrapperRef.value && !selectWrapperRef.value.contains(e.target as Node)) {
    selectOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))

const selectArrowStyle = {
  backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23999' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E\")",
  backgroundPosition: 'right 16px center',
}

function emitInput(event: Event) {
  emit('format-input', props.field.form_field_id, props.field.field_type, event)
}

// ===== 주민번호 분리 입력 =====
// @ts-ignore template ref used in template
const residentFrontRef = ref<HTMLInputElement | null>(null)
const residentBackRef = ref<HTMLInputElement | null>(null)
const showResidentBack = ref(false)

const residentFront = computed(() => {
  const raw = (props.modelValue || '').replace(/-/g, '')
  return raw.slice(0, 6)
})

const residentBack = computed(() => {
  const raw = (props.modelValue || '').replace(/-/g, '')
  return raw.length > 6 ? raw.slice(6, 13) : ''
})

function emitResidentValue(front: string, back: string): void {
  const f = front.replace(/[^0-9]/g, '').slice(0, 6)
  const b = back.replace(/[^0-9]/g, '').slice(0, 7)
  const combined = b ? `${f}-${b}` : f
  emit('update:modelValue', combined)
}

function handleResidentFront(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '').slice(0, 6)
  target.value = value
  emitResidentValue(value, residentBack.value)
  if (value.length === 6) {
    residentBackRef.value?.focus()
  }
}

function handleResidentBack(event: Event): void {
  const target = event.target as HTMLInputElement
  const value = target.value.replace(/[^0-9]/g, '').slice(0, 7)
  target.value = value
  emitResidentValue(residentFront.value, value)
}

function isChoiceSelected(value: string): boolean {
  try {
    const arr = JSON.parse(props.modelValue || '[]')
    return Array.isArray(arr) && arr.includes(value)
  } catch { return false }
}

function toggleCheckboxChoice(value: string) {
  let arr: string[] = []
  try { arr = JSON.parse(props.modelValue || '[]') } catch { arr = [] }
  if (!Array.isArray(arr)) arr = []
  const idx = arr.indexOf(value)
  if (idx >= 0) {
    arr.splice(idx, 1)
  } else {
    arr.push(value)
  }
  emit('update:modelValue', JSON.stringify(arr))
}
</script>
