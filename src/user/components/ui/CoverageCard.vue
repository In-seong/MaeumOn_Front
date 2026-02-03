<template>
  <div class="w-full bg-white rounded-[12px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 flex flex-col gap-[14px]">
    <div
      v-for="item in coverageItems"
      :key="item.label"
      class="flex items-center justify-between"
    >
      <span class="text-[14px] font-normal text-black">{{ item.label }}</span>
      <span
        class="text-[14px] font-semibold"
        :class="getTextClass(item.level)"
      >
        {{ item.status }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface CoverageItem {
  label: string
  status: string
  level: string
}

const coverageItems: CoverageItem[] = [
  { label: '암 보장', status: '충분', level: 'high' },
  { label: '뇌혈관 보장', status: '보통', level: 'medium' },
  { label: '심혈관 보장', status: '부족', level: 'low' }
]

const getTextClass = (level: string): string => {
  const classes: Record<string, string> = {
    high: 'text-[#1FBD53]',
    medium: 'text-[#F3940E]',
    low: 'text-[#FF0000]'
  }
  return classes[level] || ''
}
</script>
