<template>
  <div>
    <label
      class="block border-2 border-dashed border-[#E0E0E0] rounded-[16px] p-6 text-center cursor-pointer hover:border-[#FF7B22] transition-colors active:scale-[0.98]"
      @click="triggerFileInput"
    >
      <div class="w-14 h-14 mx-auto rounded-full bg-[#FFF3ED] flex items-center justify-center mb-3">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
          <path d="M23 19C23 19.5304 22.7893 20.0391 22.4142 20.4142C22.0391 20.7893 21.5304 21 21 21H3C2.46957 21 1.96086 20.7893 1.58579 20.4142C1.21071 20.0391 1 19.5304 1 19V8C1 7.46957 1.21071 6.96086 1.58579 6.58579C1.96086 6.21071 2.46957 6 3 6H7L9 3H15L17 6H21C21.5304 6 22.0391 6.21071 22.4142 6.58579C22.7893 6.96086 23 7.46957 23 8V19Z" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="12" cy="13" r="4" stroke="#FF7B22" stroke-width="2"/>
        </svg>
      </div>
      <p class="text-[16px] font-semibold text-[#555]">사진/서류 첨부</p>
      <p class="text-[13px] text-[#999] mt-1">탭하여 파일을 선택하세요</p>
    </label>
    <input
      ref="fileInputRef"
      type="file"
      multiple
      accept="image/*,.pdf,.doc,.docx"
      class="hidden"
      @change="handleFileSelect"
    />
    <!-- 선택된 파일 목록 -->
    <div v-if="files.length > 0" class="mt-3 space-y-2">
      <div
        v-for="(file, index) in files"
        :key="index"
        class="flex items-center justify-between bg-[#F8F8F8] rounded-[12px] px-4 py-3"
      >
        <div class="flex-1 min-w-0">
          <p class="text-[13px] text-[#333] truncate">{{ file.name }}</p>
          <p class="text-[11px] text-[#999]">{{ formatFileSize(file.size) }}</p>
        </div>
        <button
          type="button"
          class="ml-2 w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#E0E0E0]"
          @click="removeFile(index)"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6L18 18" stroke="#999" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>
    <!-- 압축 중 표시 -->
    <p v-if="compressing" class="mt-2 text-[12px] text-[#FF7B22] text-center">이미지 최적화 중...</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const MAX_DIMENSION = 2560
const JPEG_QUALITY = 0.85

const emit = defineEmits<{
  'update:files': [files: File[]]
}>()

const fileInputRef = ref<HTMLInputElement>()
const files = ref<File[]>([])
const compressing = ref(false)

function triggerFileInput() {
  fileInputRef.value?.click()
}

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

function compressImage(file: File): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image()
    const url = URL.createObjectURL(file)
    img.onload = () => {
      URL.revokeObjectURL(url)

      let { width, height } = img
      // 이미 작으면 원본 반환
      if (width <= MAX_DIMENSION && height <= MAX_DIMENSION && file.size <= 2 * 1024 * 1024) {
        resolve(file)
        return
      }

      // 비율 유지하며 축소
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        const ratio = Math.min(MAX_DIMENSION / width, MAX_DIMENSION / height)
        width = Math.round(width * ratio)
        height = Math.round(height * ratio)
      }

      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const ctx = canvas.getContext('2d')
      if (!ctx) { resolve(file); return }

      ctx.drawImage(img, 0, 0, width, height)
      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return }
          // 원본 파일명 유지하되 확장자는 jpg로
          const baseName = file.name.replace(/\.[^.]+$/, '')
          const compressed = new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
          resolve(compressed)
        },
        'image/jpeg',
        JPEG_QUALITY,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      resolve(file)
    }
    img.src = url
  })
}

async function handleFileSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const selectedFiles = target.files
  if (!selectedFiles) return

  compressing.value = true
  try {
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i]
      if (!file) continue

      if (isImageFile(file)) {
        const compressed = await compressImage(file)
        files.value.push(compressed)
      } else {
        files.value.push(file)
      }
    }
    emit('update:files', files.value)
  } finally {
    compressing.value = false
  }

  // input 초기화 (같은 파일 재선택 가능하도록)
  target.value = ''
}

function removeFile(index: number) {
  files.value.splice(index, 1)
  emit('update:files', files.value)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
