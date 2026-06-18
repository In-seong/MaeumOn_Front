<template>
  <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4">
    <div class="flex items-start justify-between mb-2">
      <div class="flex-1">
        <p class="text-[15px] font-semibold text-[#333]">{{ assignment.name }}</p>
        <p class="text-[13px] text-[#888] mt-0.5">{{ assignment.phone }}</p>
      </div>
      <span class="text-[12px] text-white bg-[#FF7B22] px-2 py-0.5 rounded-full font-medium">
        청구배정
      </span>
    </div>

    <div v-if="assignment.hospital?.hospital_name" class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 21h18" />
        <path d="M5 21V7l8-4v18" />
        <path d="M19 21V11l-6-4" />
        <path d="M9 9h1" /><path d="M9 13h1" /><path d="M9 17h1" />
      </svg>
      <span>{{ assignment.hospital.hospital_name }}</span>
    </div>

    <div class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span>{{ assignment.created_at }}</span>
    </div>

    <p v-if="assignment.memo" class="text-[12px] text-[#666] mt-2 line-clamp-2">{{ assignment.memo }}</p>

    <!-- 첨부파일 -->
    <div v-if="assignment.files && assignment.files.length > 0" class="mt-3 pt-3 border-t border-[#F0F0F0]">
      <p class="text-[12px] text-[#888] mb-2">첨부파일 ({{ assignment.files.length }})</p>
      <div class="flex flex-col gap-2">
        <a
          v-for="file in assignment.files"
          :key="file.file_id"
          :href="file.file_download_url ?? undefined"
          target="_blank"
          class="flex items-center gap-2 px-3 py-2 bg-[#F9F9F9] rounded-[10px] active:bg-[#F0F0F0] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48" />
          </svg>
          <span class="text-[12px] text-[#555] truncate flex-1">{{ file.file_name }}</span>
          <span class="text-[11px] text-[#BBB] flex-shrink-0">{{ formatFileSize(file.file_size) }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ClaimAssignment } from '../../types'

defineProps<{
  assignment: ClaimAssignment
}>()

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}
</script>
