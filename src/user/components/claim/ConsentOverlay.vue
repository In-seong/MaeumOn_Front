<template>
  <Teleport to="body">
    <Transition name="consent-overlay">
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex justify-center bg-black/40"
        @click.self="$emit('close')"
      >
        <div class="w-full max-w-[402px] h-full bg-white flex flex-col">
          <!-- 헤더 -->
          <div class="flex items-center justify-between px-5 py-4 border-b border-[#F0F0F0]">
            <h2 class="text-[16px] font-bold text-[#222]">{{ title }}</h2>
            <button
              type="button"
              @click="$emit('close')"
              class="w-8 h-8 flex items-center justify-center text-[#999]"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </button>
          </div>

          <!-- 본문 스크롤 영역 -->
          <div class="flex-1 overflow-y-auto px-5 py-4">
            <div class="text-[13px] text-[#555] leading-relaxed whitespace-pre-wrap">{{ consentText }}</div>
          </div>

          <!-- 하단 버튼 -->
          <div class="flex gap-3 px-5 py-4 border-t border-[#F0F0F0] bg-white">
            <button
              type="button"
              @click="$emit('disagree')"
              class="flex-1 py-3 rounded-[12px] border border-[#E0E0E0] text-[14px] font-semibold text-[#666] active:scale-[0.98] transition-transform"
            >미동의</button>
            <button
              type="button"
              @click="$emit('agree')"
              class="flex-1 py-3 rounded-[12px] bg-[#FF7B22] text-[14px] font-semibold text-white active:scale-[0.98] transition-transform"
            >동의</button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  title: string
  consentText: string
}>()

defineEmits<{
  agree: []
  disagree: []
  close: []
}>()
</script>
