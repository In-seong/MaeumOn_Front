<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <!-- 업데이트 진행중 안내 -->
      <main class="px-6 pb-20 overflow-y-auto flex flex-col items-center justify-center" style="height: calc(100vh - 66px - 60px);">
        <div class="text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#FFF0E5] flex items-center justify-center">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
            </svg>
          </div>
          <h3 class="text-[18px] font-bold text-[#333] mb-2">업데이트 진행중</h3>
          <p class="text-[14px] text-[#999] leading-relaxed">
            통계 기능을 개선하고 있습니다.<br />
            빠른 시일 내에 업데이트될 예정입니다.
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
