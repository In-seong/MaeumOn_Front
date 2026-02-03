<template>
  <div class="flex items-center justify-between py-2.5 border-b border-[#F5F5F5] last:border-b-0">
    <span class="text-[13px] text-[#888]">{{ label }}</span>
    <span class="text-[13px] font-medium text-[#333]">{{ value }}</span>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string
  value: string
}

defineProps<Props>()
</script>
