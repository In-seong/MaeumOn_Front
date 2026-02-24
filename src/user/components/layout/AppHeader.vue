<template>
  <header class="flex justify-between items-center h-[66px] px-6 py-3">
    <div class="flex items-center gap-2">
      <img src="/icons/LogoIcon.svg" alt="보험청구ON" class="w-10 h-10" />
      <span class="text-[22px] font-jalnan font-bold text-black">보험청구ON</span>
    </div>
    <div class="flex items-center gap-4">
      <button class="p-1">
        <SearchIcon />
      </button>
      <button class="p-1">
        <NoticeIcon />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import SearchIcon from '@user/components/icons/SearchIcon.vue'
import NoticeIcon from '@user/components/icons/NoticeIcon.vue'

</script>
