<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <!-- Header -->
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <p class="text-[15px] font-semibold text-[#333]">{{ assignment.name }}</p>
        <p class="text-[13px] text-[#888] mt-0.5">{{ assignment.phone }}</p>
      </div>
      <span class="text-[12px] text-white bg-[#FF7B22] px-2 py-0.5 rounded-full font-medium">
        청구배정
      </span>
    </div>

    <!-- Hospital -->
    <div v-if="assignment.hospital?.hospital_name" class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18" /><path d="M5 21V7l8-4v18" /><path d="M19 21V11l-6-4" />
        <path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" />
      </svg>
      <span>{{ assignment.hospital.hospital_name }}</span>
    </div>

    <!-- Date -->
    <div class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span>{{ assignment.created_at }}</span>
    </div>

    <!-- Memo -->
    <p v-if="assignment.memo" class="text-[12px] text-[#666] mt-2 line-clamp-2">{{ assignment.memo }}</p>

    <!-- Collapsible Files Section -->
    <div v-if="assignment.files && assignment.files.length > 0" class="mt-3">
      <button
        class="w-full flex items-center justify-between py-2.5 border-t border-[#F0F0F0]"
        @click="filesOpen = !filesOpen"
      >
        <span class="text-[13px] text-[#555] font-medium flex items-center gap-1.5">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          첨부파일 ({{ assignment.files.length }})
        </span>
        <svg
          :class="filesOpen ? 'rotate-180' : ''"
          class="transition-transform duration-200"
          width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      <div v-if="filesOpen">
        <!-- Image Slider -->
        <div
          v-if="imageFiles.length > 0"
          class="relative overflow-hidden rounded-[12px] bg-[#F5F5F5] mb-3"
        >
          <div
            ref="sliderRef"
            class="relative overflow-hidden"
            style="aspect-ratio: 4/3;"
            @touchstart="onTouchStart"
            @touchmove="onTouchMove"
            @touchend="onTouchEnd"
          >
            <div
              class="flex h-full transition-transform duration-300 ease-out"
              :style="{ transform: `translateX(calc(-${currentSlide * 100}% + ${swipeOffset}px))` }"
            >
              <div
                v-for="img in imageFiles"
                :key="img.file_id"
                class="w-full h-full flex-shrink-0 flex items-center justify-center"
              >
                <img
                  :src="img.file_download_url ?? ''"
                  :alt="img.file_name"
                  class="max-w-full max-h-full object-contain"
                />
              </div>
            </div>
          </div>

          <!-- Slide indicators + counter -->
          <div v-if="imageFiles.length > 1" class="flex items-center justify-center gap-1.5 py-2">
            <button
              v-for="(_, i) in imageFiles"
              :key="i"
              :class="i === currentSlide ? 'bg-[#FF7B22] w-4' : 'bg-[#DDD] w-1.5'"
              class="h-1.5 rounded-full transition-all duration-200"
              @click="currentSlide = i"
            />
          </div>

          <!-- File name overlay -->
          <div class="px-3 pb-2 flex items-center justify-between">
            <span class="text-[11px] text-[#999] truncate flex-1">
              {{ imageFiles[currentSlide]?.file_name }}
            </span>
            <button
              class="ml-2 p-1.5 rounded-full bg-[#FF7B22] active:bg-[#E56A15] transition-colors"
              @click="downloadFile(imageFiles[currentSlide])"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Non-image file list -->
        <div v-if="nonImageFiles.length > 0" class="flex flex-col gap-2 mb-3">
          <div
            v-for="file in nonImageFiles"
            :key="file.file_id"
            class="flex items-center gap-2 px-3 py-2.5 bg-[#F9F9F9] rounded-[10px]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span class="text-[12px] text-[#555] truncate flex-1">{{ file.file_name }}</span>
            <span class="text-[11px] text-[#BBB] flex-shrink-0">{{ formatFileSize(file.file_size) }}</span>
            <button
              class="p-1 rounded-full active:bg-[#EEE] transition-colors"
              @click="downloadFile(file)"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FF7B22" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
              </svg>
            </button>
          </div>
        </div>

        <!-- Bulk download -->
        <button
          v-if="assignment.files.length > 1"
          class="w-full py-2.5 bg-[#FFF3ED] text-[#FF7B22] text-[13px] font-medium rounded-[10px] active:bg-[#FFE8D9] transition-colors disabled:opacity-50"
          :disabled="downloading"
          @click="downloadAll"
        >
          {{ downloading ? '다운로드 중...' : `전체 다운로드 (${assignment.files.length}개)` }}
        </button>
      </div>
    </div>

    <!-- Register as Customer -->
    <button
      v-if="!registered"
      class="mt-3 w-full py-2.5 text-[13px] font-semibold rounded-[12px] active:scale-[0.98] transition-transform"
      :class="registering ? 'bg-[#FFB380] text-white' : 'bg-[#FF7B22] text-white'"
      :disabled="registering"
      @click="registerCustomer"
    >
      {{ registering ? '등록 중...' : '내 고객으로 등록하기' }}
    </button>
    <div
      v-else
      class="mt-3 w-full py-2.5 bg-[#F0F7F0] text-[#2E7D32] text-[13px] font-semibold rounded-[12px] text-center flex items-center justify-center gap-1.5"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2E7D32" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
      고객 등록 완료
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import api from '@shared/api'
import type { ClaimAssignment, ClaimRequestFile } from '../../types'
import { createCustomer, createMemo } from '../../services/agentApi'

const props = defineProps<{
  assignment: ClaimAssignment
}>()

const emit = defineEmits<{
  customerRegistered: [requestId: number]
}>()

const IMAGE_EXTS = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg']

function isImage(file: ClaimRequestFile): boolean {
  const ext = file.file_name.split('.').pop()?.toLowerCase() ?? ''
  return IMAGE_EXTS.includes(ext)
}

const imageFiles = computed(() => props.assignment.files?.filter(isImage) ?? [])
const nonImageFiles = computed(() => props.assignment.files?.filter(f => !isImage(f)) ?? [])

const filesOpen = ref(false)
const currentSlide = ref(0)
const registered = ref(props.assignment.is_registered ?? false)
const registering = ref(false)

// Touch swipe
const touchStartX = ref(0)
const swipeOffset = ref(0)
const isSwiping = ref(false)

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  touchStartX.value = touch.clientX
  swipeOffset.value = 0
  isSwiping.value = true
}

function onTouchMove(e: TouchEvent) {
  if (!isSwiping.value) return
  const touch = e.touches[0]
  if (!touch) return
  const diff = touch.clientX - touchStartX.value
  const atStart = currentSlide.value === 0 && diff > 0
  const atEnd = currentSlide.value === imageFiles.value.length - 1 && diff < 0
  swipeOffset.value = (atStart || atEnd) ? diff * 0.3 : diff
}

function onTouchEnd() {
  if (!isSwiping.value) return
  isSwiping.value = false
  const threshold = 50
  if (swipeOffset.value < -threshold && currentSlide.value < imageFiles.value.length - 1) {
    currentSlide.value++
  } else if (swipeOffset.value > threshold && currentSlide.value > 0) {
    currentSlide.value--
  }
  swipeOffset.value = 0
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

const downloading = ref(false)

async function downloadFile(file: ClaimRequestFile | undefined) {
  if (!file) return
  try {
    const res = await api.get(`/agent/claim-request-files/${file.file_id}/download`, {
      responseType: 'blob',
    })
    const blob = new Blob([res.data as BlobPart])
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = file.file_name
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch {
    if (file.file_download_url) {
      window.open(file.file_download_url, '_blank')
    }
  }
}

async function downloadAll() {
  const files = props.assignment.files
  if (!files || downloading.value) return
  downloading.value = true
  for (const file of files) {
    await downloadFile(file)
    await new Promise(r => setTimeout(r, 300))
  }
  downloading.value = false
}

function buildMemoContent(): string {
  const a = props.assignment
  const date = a.created_at.split('T')[0] ?? a.created_at.slice(0, 10)
  const parts: string[] = []

  parts.push(`[청구 배정 DB배분]`)
  parts.push(`- 배정일: ${date}`)

  if (a.hospital?.hospital_name) {
    parts.push(`- 병원: ${a.hospital.hospital_name}`)
  }

  if (a.memo) {
    parts.push(`- 고객 메모: ${a.memo}`)
  }

  const fileCount = a.files?.length ?? 0
  if (fileCount > 0) {
    const names = a.files?.map(f => f.file_name).join(', ') ?? ''
    parts.push(`- 첨부파일: ${fileCount}장 (${names})`)
  }

  return parts.join('\n')
}

async function registerCustomer() {
  registering.value = true
  try {
    const res = await createCustomer({
      name: props.assignment.name,
      phone: props.assignment.phone,
      acquisition_channel: '청구배정',
    })
    const customerId = res.data.data.customer_id

    const today = new Date().toISOString().split('T')[0] ?? ''
    await createMemo(customerId, {
      title: '청구 배정 DB배분 내역',
      content: buildMemoContent(),
      memo_date: today,
    })

    registered.value = true
    emit('customerRegistered', props.assignment.request_id)
  } catch {
    // 에러 시 등록 버튼 다시 활성화
  } finally {
    registering.value = false
  }
}
</script>
