<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-[#555]">{{ label }}</label>
    <div class="relative">
      <input
        :type="inputType"
        :inputmode="inputmode"
        :value="modelValue"
        :placeholder="placeholder"
        :readonly="readonly"
        class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors no-spinner"
        :class="[
          readonly ? 'text-[#999] cursor-default' : 'text-[#333]',
          showToggle ? 'pr-12' : '',
        ]"
        @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
      <button
        v-if="showToggle"
        type="button"
        class="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[#888] hover:text-[#555]"
        :aria-label="isVisible ? '숨기기' : '표시'"
        @click="isVisible = !isVisible"
      >
        <!-- 눈 아이콘 (표시 상태) -->
        <svg v-if="isVisible" width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2" />
        </svg>
        <!-- 눈 감김 아이콘 (숨김 상태) -->
        <svg v-else width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
          <line x1="1" y1="1" x2="23" y2="23" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  label?: string
  modelValue?: string
  type?: string
  inputmode?: 'text' | 'numeric' | 'tel' | 'email' | 'search' | 'url' | 'none' | 'decimal'
  placeholder?: string
  readonly?: boolean
  showToggle?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  type: 'text',
  inputmode: undefined,
  placeholder: '',
  readonly: false,
  showToggle: false,
})

defineEmits<{
  'update:modelValue': [value: string]
}>()

const isVisible = ref(false)

const inputType = computed(() => {
  if (props.showToggle && props.type === 'password') {
    return isVisible.value ? 'text' : 'password'
  }
  return props.type
})
</script>

<style scoped>
/* 숫자 입력 필드의 위/아래 화살표(spinner) 제거 */
.no-spinner::-webkit-outer-spin-button,
.no-spinner::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.no-spinner {
  -moz-appearance: textfield;
}
</style>
