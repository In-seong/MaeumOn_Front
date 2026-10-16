<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <main class="px-6 pb-20 overflow-y-auto flex flex-col items-center justify-center" style="height: calc(100dvh - 66px - 60px);">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF0E5] flex items-center justify-center">
            <span class="material-symbols-outlined text-[32px] text-[#FF7B22]">download</span>
          </div>
          <h3 class="text-[18px] font-bold text-[#333] mb-2">양식 다운로드</h3>
          <p class="text-[14px] text-[#999] leading-relaxed">
            양식 다운로드는 PC에서 이용 가능합니다.
          </p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import AgentAppHeader from '../../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
</script>
