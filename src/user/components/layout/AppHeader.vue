<template>
  <header class="flex justify-between items-center h-[66px] px-6 py-3">
    <div class="flex items-center gap-2">
      <div class="flex items-center justify-center w-10 h-10">
        <div class="w-10 h-10 bg-gradient-to-br from-[#F68A1E] to-[#FEC00E] rounded-xl"></div>
      </div>
      <span class="text-xl font-jalnan text-black">보험 ON</span>
    </div>
    <div class="flex items-center gap-4">
      <button class="p-1">
        <SearchIcon />
      </button>
      <button class="p-1" @click="router.push('/notifications')">
        <NoticeIcon />
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import SearchIcon from '@user/components/icons/SearchIcon.vue'
import NoticeIcon from '@user/components/icons/NoticeIcon.vue'

const router = useRouter()
</script>
