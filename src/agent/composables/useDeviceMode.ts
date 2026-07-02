import { ref, computed, readonly } from 'vue'

const PC_BREAKPOINT = '(min-width: 1024px)'
const mediaQuery = typeof window !== 'undefined'
  ? window.matchMedia(PC_BREAKPOINT)
  : null

export const isPC = ref(mediaQuery?.matches ?? false)

if (mediaQuery) {
  mediaQuery.addEventListener('change', (e) => {
    const wasPC = isPC.value
    isPC.value = e.matches
    if (wasPC !== isPC.value) {
      window.location.reload()
    }
  })
}

export function useDeviceMode() {
  return {
    isPC: readonly(isPC),
    isMobile: computed(() => !isPC.value),
  }
}
