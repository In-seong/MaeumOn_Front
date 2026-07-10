import { ref, onMounted, onBeforeUnmount } from 'vue'

export function useKeyboardSafe() {
  const keyboardPadding = ref(0)

  function handleViewportResize() {
    const vv = window.visualViewport
    if (!vv) return
    const diff = window.innerHeight - vv.height
    keyboardPadding.value = diff > 50 ? diff : 0
  }

  function handleFocusIn(e: FocusEvent) {
    const target = e.target as HTMLElement
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
      setTimeout(() => {
        target.scrollIntoView({ block: 'center', behavior: 'smooth' })
      }, 400)
    }
  }

  function mainStyle(baseHeight: string, basePadding = 32) {
    return {
      height: baseHeight,
      paddingBottom: (keyboardPadding.value > 0 ? keyboardPadding.value + basePadding : basePadding) + 'px',
    }
  }

  onMounted(() => {
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportResize)
    }
  })

  onBeforeUnmount(() => {
    if (window.visualViewport) {
      window.visualViewport.removeEventListener('resize', handleViewportResize)
    }
  })

  return { keyboardPadding, handleFocusIn, mainStyle }
}
