import { ref, readonly } from 'vue'

export type DialogType = 'success' | 'error' | 'info' | 'confirm'

export interface DialogState {
  visible: boolean
  type: DialogType
  title: string
  message: string
  confirmText: string
  cancelText: string
  resolve: ((value: boolean) => void) | null
}

const state = ref<DialogState>({
  visible: false,
  type: 'info',
  title: '',
  message: '',
  confirmText: '확인',
  cancelText: '취소',
  resolve: null,
})

function show(opts: {
  type: DialogType
  message: string
  title?: string
  confirmText?: string
  cancelText?: string
}): Promise<boolean> {
  return new Promise((resolve) => {
    state.value = {
      visible: true,
      type: opts.type,
      title: opts.title ?? '',
      message: opts.message,
      confirmText: opts.confirmText ?? '확인',
      cancelText: opts.cancelText ?? '취소',
      resolve,
    }
  })
}

function close(result: boolean): void {
  const r = state.value.resolve
  state.value.visible = false
  state.value.resolve = null
  r?.(result)
}

export function useDialog() {
  return {
    state: readonly(state),

    alert(message: string, type: 'success' | 'error' | 'info' = 'info', title?: string) {
      return show({ type, message, title })
    },

    success(message: string, title?: string) {
      return show({ type: 'success', message, title })
    },

    error(message: string, title?: string) {
      return show({ type: 'error', message, title })
    },

    info(message: string, title?: string) {
      return show({ type: 'info', message, title })
    },

    confirm(message: string, opts?: { title?: string; confirmText?: string; cancelText?: string }) {
      return show({ type: 'confirm', message, ...opts })
    },

    close,
  }
}
