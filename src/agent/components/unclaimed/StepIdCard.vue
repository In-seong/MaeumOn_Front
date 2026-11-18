<template>
  <div class="space-y-4">
    <h3 class="text-[16px] font-bold text-[#222]">신분증 촬영</h3>
    <p class="text-[13px] text-[#888]">고객의 신분증 앞면을 촬영하거나 갤러리에서 선택해주세요.</p>

    <div class="bg-amber-50 rounded-[12px] p-3 flex items-start gap-2">
      <svg class="w-4 h-4 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
      <p class="text-[12px] text-amber-700">주민등록번호 뒷자리가 보이지 않도록 앞면만 촬영해주세요.</p>
    </div>

    <!-- 업로드 영역 -->
    <div
      v-if="!previewUrl"
      class="bg-white rounded-[14px] border-2 border-dashed border-[#DDD] p-8 text-center cursor-pointer active:bg-[#FAFAFA]"
      @click="triggerInput"
    >
      <svg class="w-16 h-16 text-[#CCC] mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
      <p class="text-[14px] text-[#888] font-medium">신분증 촬영하기</p>
      <p class="text-[12px] text-[#BBB] mt-1">또는 갤러리에서 선택</p>
    </div>

    <!-- 미리보기 -->
    <div v-else class="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <img :src="previewUrl" alt="신분증" class="w-full rounded-[10px] object-contain max-h-[300px]" />
      <div class="flex gap-2 mt-3">
        <button
          class="flex-1 py-2.5 border border-[#E0E0E0] text-[#888] text-[13px] font-medium rounded-[10px]"
          @click="resetImage"
        >
          다시 촬영
        </button>
        <button
          class="flex-1 py-2.5 bg-[#FF6B2D] text-white text-[13px] font-bold rounded-[10px] disabled:opacity-40"
          :disabled="uploading"
          @click="upload"
        >
          {{ uploading ? '업로드 중...' : '확인' }}
        </button>
      </div>
    </div>

    <!-- 업로드 완료 -->
    <div v-if="uploaded" class="bg-green-50 rounded-[12px] p-3 flex items-center gap-2">
      <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <p class="text-[12px] text-green-700">신분증이 업로드되었습니다.</p>
    </div>

    <input
      ref="fileInput"
      type="file"
      accept="image/*"
      capture="environment"
      class="hidden"
      @change="onFileChange"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { uploadUnclaimedIdCard } from '../../services/agentApi'

const props = defineProps<{
  sessionId: number
}>()

const emit = defineEmits<{
  'uploaded': []
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const selectedFile = ref<File | null>(null)
const previewUrl = ref<string | null>(null)
const uploading = ref(false)
const uploaded = ref(false)

function triggerInput() {
  fileInput.value?.click()
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  selectedFile.value = file
  previewUrl.value = URL.createObjectURL(file)
  uploaded.value = false
}

function resetImage() {
  selectedFile.value = null
  if (previewUrl.value) {
    URL.revokeObjectURL(previewUrl.value)
  }
  previewUrl.value = null
  uploaded.value = false
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

async function upload() {
  if (!selectedFile.value) return
  uploading.value = true
  try {
    await uploadUnclaimedIdCard(props.sessionId, selectedFile.value)
    uploaded.value = true
    emit('uploaded')
  } catch {
    // 에러 처리는 상위에서
  } finally {
    uploading.value = false
  }
}
</script>
