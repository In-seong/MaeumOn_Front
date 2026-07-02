<template>
  <button
    type="button"
    class="relative w-[44px] h-[24px] rounded-full transition-colors duration-200 flex-shrink-0 overflow-hidden"
    :class="modelValue ? 'bg-[#FF7B22]' : 'bg-[#D9D9D9]'"
    @click="$emit('update:modelValue', !modelValue)"
  >
    <span
      class="absolute top-[2px] left-[2px] w-[20px] h-[20px] bg-white rounded-full shadow-sm transition-all duration-200"
      :style="{ transform: modelValue ? 'translateX(20px)' : 'translateX(0)' }"
    />
  </button>
</template>

<script setup lang="ts">
interface Props {
  modelValue?: boolean
}

withDefaults(defineProps<Props>(), {
  modelValue: false
})

defineEmits<{
  'update:modelValue': [value: boolean]
}>()
</script>
