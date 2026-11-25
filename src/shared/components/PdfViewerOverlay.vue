<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from 'vue'
import { pdfUrlToObjectUrls } from '@shared/utils/pdfToImages'

const props = withDefaults(defineProps<{
  open: boolean
  url: string
  title?: string
}>(), {
  title: 'PDF 보기',
})

const emit = defineEmits<{
  close: []
}>()

const pageUrls = ref<string[]>([])
const loading = ref(false)
const error = ref('')
const scale = ref(1)

function cleanup() {
  pageUrls.value.forEach((u) => URL.revokeObjectURL(u))
  pageUrls.value = []
  error.value = ''
  scale.value = 1
}

function openInNewTab() {
  if (props.url) window.open(props.url, '_blank')
}

watch(
  () => props.open,
  async (isOpen) => {
    if (isOpen && props.url) {
      loading.value = true
      error.value = ''
      try {
        const urls = await pdfUrlToObjectUrls(props.url)
        if (!props.open) {
          urls.forEach((u) => URL.revokeObjectURL(u))
          return
        }
        if (urls.length === 0) {
          error.value = 'PDF 페이지를 렌더링할 수 없습니다'
        } else {
          pageUrls.value = urls
        }
      } catch (e) {
        error.value = 'PDF를 불러올 수 없습니다'
        console.error('PDF viewer error:', e)
      } finally {
        loading.value = false
      }
    } else if (!isOpen) {
      cleanup()
    }
  },
)

function close() {
  cleanup()
  emit('close')
}

function zoom(delta: number) {
  const next = Math.round((scale.value + delta) * 100) / 100
  if (next >= 0.5 && next <= 3) scale.value = next
}

onBeforeUnmount(cleanup)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="fixed inset-0 z-[60] bg-black/90 flex flex-col">
      <div class="flex items-center justify-between px-3 py-2.5 bg-black/60 shrink-0">
        <div class="flex items-center gap-2">
          <span class="text-white text-[14px] font-medium">{{ title }}</span>
          <span v-if="pageUrls.length" class="text-white/50 text-[12px]">{{ pageUrls.length }}p</span>
        </div>
        <div class="flex items-center gap-1.5">
          <button
            @click="zoom(-0.25)"
            class="w-7 h-7 flex items-center justify-center bg-white/15 rounded-full text-white text-[15px] font-bold active:bg-white/25"
          >
            -
          </button>
          <span class="text-white/60 text-[11px] min-w-[36px] text-center">
            {{ Math.round(scale * 100) }}%
          </span>
          <button
            @click="zoom(0.25)"
            class="w-7 h-7 flex items-center justify-center bg-white/15 rounded-full text-white text-[15px] font-bold active:bg-white/25"
          >
            +
          </button>
          <button
            @click="close"
            class="ml-1.5 px-3.5 py-1.5 bg-white/20 rounded-full text-white text-[13px] font-medium active:bg-white/30"
          >
            닫기
          </button>
        </div>
      </div>

      <div class="flex-1 overflow-auto">
        <div v-if="loading" class="flex items-center justify-center h-full">
          <span class="text-white/70 text-[14px]">PDF 로딩 중...</span>
        </div>
        <div v-else-if="error" class="flex flex-col items-center justify-center h-full gap-4">
          <span class="text-red-400 text-[14px]">{{ error }}</span>
          <button
            @click="openInNewTab"
            class="px-5 py-2.5 bg-white/20 rounded-full text-white text-[13px] font-medium active:bg-white/30"
          >
            새 탭에서 열기
          </button>
        </div>
        <div v-else class="flex flex-col items-center gap-1 py-2">
          <img
            v-for="(pageUrl, i) in pageUrls"
            :key="i"
            :src="pageUrl"
            :style="{ width: `${scale * 100}%` }"
            class="bg-white block"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>
