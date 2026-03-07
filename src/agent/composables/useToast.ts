import { ref } from 'vue'

const visible = ref(false)
const message = ref('')
const variant = ref<'success' | 'error'>('success')
let timer: ReturnType<typeof setTimeout> | null = null

export function useToast() {
  function showToast(msg: string, type: 'success' | 'error' = 'success', duration = 2000): void {
    if (timer) clearTimeout(timer)
    message.value = msg
    variant.value = type
    visible.value = true
    timer = setTimeout(() => {
      visible.value = false
    }, duration)
  }

  return { visible, message, variant, showToast }
}
