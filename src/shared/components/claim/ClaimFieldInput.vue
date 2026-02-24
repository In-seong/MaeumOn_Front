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
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <input
      v-else-if="field.field_type === 'date'"
      type="date"
      :value="modelValue"
      @input="emitInput"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
    />

    <input
      v-else-if="field.field_type === 'number'"
      type="text"
      inputmode="numeric"
      :value="modelValue"
      @input="emitInput"
      :placeholder="field.placeholder"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <input
      v-else-if="field.field_type === 'phone'"
      type="tel"
      :value="modelValue"
      @input="emitInput"
      placeholder="010-1234-5678"
      :required="field.is_required"
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <input
      v-else-if="field.field_type === 'resident_number'"
      type="text"
      :value="modelValue"
      @input="emitInput"
      placeholder="123456-1234567"
      :required="field.is_required"
      maxlength="14"
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
    />

    <textarea
      v-else-if="field.field_type === 'textarea'"
      :value="modelValue"
      @input="emitInput"
      :placeholder="field.placeholder"
      :required="field.is_required"
      rows="3"
      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors resize-none placeholder-[#B0B0B0]"
    ></textarea>

    <!-- 체크박스 (다중선택) -->
    <div v-else-if="field.field_type === 'checkbox' && field.field_options?.choices" class="flex flex-wrap gap-3">
      <label
        v-for="choice in field.field_options.choices"
        :key="choice.value || choice.label"
        class="flex items-center gap-2 cursor-pointer"
      >
        <input
          type="checkbox"
          :checked="isChoiceSelected(choice.value || choice.label)"
          @change="toggleCheckboxChoice(choice.value || choice.label)"
          class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
        />
        <span class="text-[14px] text-[#333]">{{ choice.label }}</span>
      </label>
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
import type { FormField } from '@shared/types'

const props = defineProps<{
  field: FormField
  modelValue: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
  'format-input': [fieldId: number, fieldType: string, event: Event]
}>()

function emitInput(event: Event) {
  emit('format-input', props.field.form_field_id, props.field.field_type, event)
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
