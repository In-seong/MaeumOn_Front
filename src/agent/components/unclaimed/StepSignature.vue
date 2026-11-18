<template>
  <div class="space-y-4">
    <h3 class="text-[16px] font-bold text-[#222]">전자서명</h3>
    <p class="text-[13px] text-[#888]">아래 서명란에 고객의 서명을 받아주세요.</p>

    <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <div class="relative border border-[#E0E0E0] rounded-[10px] overflow-hidden bg-white">
        <canvas
          ref="canvasRef"
          class="w-full touch-none"
          :style="{ height: '200px' }"
          @pointerdown="startDraw"
          @pointermove="draw"
          @pointerup="endDraw"
          @pointerleave="endDraw"
        />
        <div v-if="!hasDrawn" class="absolute inset-0 flex items-center justify-center pointer-events-none">
          <p class="text-[14px] text-[#DDD]">여기에 서명해주세요</p>
        </div>
      </div>

      <div class="flex gap-2 mt-3">
        <button
          class="flex-1 py-2.5 border border-[#E0E0E0] text-[#888] text-[13px] font-medium rounded-[10px]"
          @click="clearCanvas"
        >
          초기화
        </button>
        <button
          class="flex-1 py-2.5 bg-[#FF6B2D] text-white text-[13px] font-bold rounded-[10px] disabled:opacity-40"
          :disabled="!hasDrawn || uploading"
          @click="submit"
        >
          {{ uploading ? '저장 중...' : '서명 완료' }}
        </button>
      </div>
    </div>

    <div v-if="uploaded" class="bg-green-50 rounded-[12px] p-3 flex items-center gap-2">
      <svg class="w-4 h-4 text-green-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
      <p class="text-[12px] text-green-700">전자서명이 저장되었습니다.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { uploadUnclaimedSignature } from '../../services/agentApi'

const props = defineProps<{
  sessionId: number
}>()

const emit = defineEmits<{
  'uploaded': []
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
const hasDrawn = ref(false)
const uploading = ref(false)
const uploaded = ref(false)
let ctx: CanvasRenderingContext2D | null = null
let isDrawing = false

onMounted(() => {
  initCanvas()
  window.addEventListener('resize', initCanvas)
})

onUnmounted(() => {
  window.removeEventListener('resize', initCanvas)
})

function initCanvas() {
  const canvas = canvasRef.value
  if (!canvas) return

  const rect = canvas.getBoundingClientRect()
  canvas.width = rect.width * 2
  canvas.height = 200 * 2

  ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.scale(2, 2)
  ctx.strokeStyle = '#222'
  ctx.lineWidth = 2.5
  ctx.lineCap = 'round'
  ctx.lineJoin = 'round'
}

function getPos(e: PointerEvent) {
  const canvas = canvasRef.value
  if (!canvas) return { x: 0, y: 0 }
  const rect = canvas.getBoundingClientRect()
  return {
    x: e.clientX - rect.left,
    y: e.clientY - rect.top,
  }
}

function startDraw(e: PointerEvent) {
  isDrawing = true
  hasDrawn.value = true
  uploaded.value = false
  const pos = getPos(e)
  ctx?.beginPath()
  ctx?.moveTo(pos.x, pos.y)
}

function draw(e: PointerEvent) {
  if (!isDrawing || !ctx) return
  e.preventDefault()
  const pos = getPos(e)
  ctx.lineTo(pos.x, pos.y)
  ctx.stroke()
}

function endDraw() {
  isDrawing = false
}

function clearCanvas() {
  const canvas = canvasRef.value
  if (!canvas || !ctx) return
  ctx.clearRect(0, 0, canvas.width / 2, canvas.height / 2)
  hasDrawn.value = false
  uploaded.value = false
}

async function submit() {
  const canvas = canvasRef.value
  if (!canvas) return

  uploading.value = true
  try {
    const blob = await new Promise<Blob | null>((resolve) => {
      canvas.toBlob(resolve, 'image/png')
    })
    if (!blob) return

    await uploadUnclaimedSignature(props.sessionId, blob)
    uploaded.value = true
    emit('uploaded')
  } catch {
    // 에러는 상위에서 처리
  } finally {
    uploading.value = false
  }
}
</script>
