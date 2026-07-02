<template>
  <Teleport to="body">
    <Transition name="dialog-fade">
      <div v-if="dialog.state.value.visible" class="fixed inset-0 z-[9999] flex items-center justify-center px-6" @click.self="onBackdrop">
        <div class="absolute inset-0 bg-black/40" />

        <div class="relative bg-white rounded-2xl w-full max-w-[320px] overflow-hidden shadow-xl">
          <div class="flex flex-col items-center pt-7 pb-2 px-6">
            <!-- 아이콘 -->
            <div class="w-14 h-14 rounded-full flex items-center justify-center mb-4" :class="iconBgClass">
              <!-- 성공 -->
              <svg v-if="type === 'success'" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 에러 -->
              <svg v-else-if="type === 'error'" class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 안내 -->
              <svg v-else-if="type === 'info'" class="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M12 7v5m0 4h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <!-- 확인 -->
              <svg v-else class="w-7 h-7 text-white" viewBox="0 0 24 24" fill="none">
                <path d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>

            <!-- 제목 -->
            <p v-if="dialog.state.value.title" class="text-[16px] font-bold text-[#222] mb-1.5 text-center">
              {{ dialog.state.value.title }}
            </p>

            <!-- 메시지 -->
            <p class="text-[14px] text-[#555] text-center leading-[1.6] whitespace-pre-line">
              {{ dialog.state.value.message }}
            </p>
          </div>

          <!-- 버튼 -->
          <div class="flex gap-2.5 px-5 pb-5 pt-4">
            <template v-if="type === 'confirm'">
              <button
                class="flex-1 h-[44px] rounded-xl text-[14px] font-medium bg-[#F2F3F5] text-[#666] active:bg-[#E5E6E8] transition-colors"
                @click="dialog.close(false)"
              >
                {{ dialog.state.value.cancelText }}
              </button>
              <button
                class="flex-1 h-[44px] rounded-xl text-[14px] font-semibold bg-[#FF7B22] text-white active:bg-[#02b350] transition-colors"
                @click="dialog.close(true)"
              >
                {{ dialog.state.value.confirmText }}
              </button>
            </template>
            <template v-else>
              <button
                class="flex-1 h-[44px] rounded-xl text-[14px] font-semibold text-white active:opacity-90 transition-colors"
                :class="buttonClass"
                @click="dialog.close(true)"
              >
                {{ dialog.state.value.confirmText }}
              </button>
            </template>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useDialog } from '@user/composables/useDialog'

const dialog = useDialog()

const type = computed(() => dialog.state.value.type)

const iconBgClass = computed(() => {
  switch (type.value) {
    case 'success': return 'bg-[#FF7B22]'
    case 'error': return 'bg-[#FF4B4B]'
    case 'info': return 'bg-[#FF7B22]'
    case 'confirm': return 'bg-[#F59E0B]'
    default: return 'bg-[#FF7B22]'
  }
})

const buttonClass = computed(() => {
  switch (type.value) {
    case 'success': return 'bg-[#FF7B22] active:bg-[#02b350]'
    case 'error': return 'bg-[#FF4B4B] active:bg-[#e04444]'
    default: return 'bg-[#FF7B22] active:bg-[#02b350]'
  }
})

function onBackdrop(): void {
  if (type.value !== 'confirm') {
    dialog.close(true)
  }
}
</script>

<style scoped>
.dialog-fade-enter-active,
.dialog-fade-leave-active {
  transition: opacity 0.2s ease;
}
.dialog-fade-enter-active .relative,
.dialog-fade-leave-active .relative {
  transition: transform 0.2s ease;
}
.dialog-fade-enter-from,
.dialog-fade-leave-to {
  opacity: 0;
}
.dialog-fade-enter-from .relative {
  transform: scale(0.95);
}
.dialog-fade-leave-to .relative {
  transform: scale(0.95);
}
</style>
