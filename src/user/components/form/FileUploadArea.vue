<template>
  <div class="border-2 border-dashed border-[#E0E0E0] rounded-[12px] p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-[#FF7B22] transition-colors">
    <div class="w-10 h-10 rounded-full bg-[#FFF0E5] flex items-center justify-center">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M21 15V19C21 20.1046 20.1046 21 19 21H5C3.89543 21 3 20.1046 3 19V15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M17 8L12 3L7 8" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M12 3V15" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    </div>
    <p class="text-[13px] font-medium text-[#555]">{{ title }}</p>
    <p class="text-[11px] text-[#999]">{{ description }}</p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  title?: string
  description?: string
}

withDefaults(defineProps<Props>(), {
  title: '파일 첨부',
  description: '클릭하여 파일을 선택하세요'
})
</script>
