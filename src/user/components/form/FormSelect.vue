<template>
  <div class="flex flex-col gap-1.5">
    <label v-if="label" class="text-[13px] font-medium text-[#555]">{{ label }}</label>
    <select
      :value="modelValue"
      class="bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none bg-no-repeat bg-[right_12px_center] bg-[length:16px]"
      style="background-image: url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2216%22 height=%2216%22 viewBox=%220 0 24 24%22 fill=%22none%22 stroke=%22%23999%22 stroke-width=%222%22 stroke-linecap=%22round%22 stroke-linejoin=%22round%22><path d=%22M6 9l6 6 6-6%22/></svg>')"
      @change="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-for="opt in options" :key="opt" :value="opt">{{ opt }}</option>
    </select>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label?: string
  modelValue?: string
  options?: string[]
}

withDefaults(defineProps<Props>(), {
  label: '',
  modelValue: '',
  options: () => []
})

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
