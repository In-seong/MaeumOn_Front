<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-[#555]">{{ label }}</label>
    <input
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :readonly="readonly"
      class="bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors"
      :class="readonly ? 'text-[#999] cursor-default' : 'text-[#333]'"
      @input="$emit('update:modelValue', ($event.target as HTMLInputElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string
  type?: string
  placeholder?: string
  readonly?: boolean
}

withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  type: 'text',
  placeholder: '',
  readonly: false
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
