<template>
  <div class="w-full flex items-center justify-between px-5 py-[14px] bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] cursor-pointer" @click="router.push('/notifications')">
    <p class="text-sm font-normal text-[#555555]">
      <span class="text-[#FF0000] font-normal">[공지]</span> 미청구 보험금이 있어요!
    </p>
    <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M1 1L7 7L1 13" stroke="#D7D7D7" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

const router = useRouter()
</script>
