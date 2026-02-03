<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-[#555]">{{ label }}</label>
    <textarea
      :value="modelValue"
      :placeholder="placeholder"
      :rows="rows"
      class="bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] resize-none"
      @input="$emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string
  placeholder?: string
  rows?: number
}

withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  placeholder: '',
  rows: 4
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
