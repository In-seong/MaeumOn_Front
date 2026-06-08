<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue'
import Cropper from 'cropperjs'
import 'cropperjs/dist/cropper.css'
import { fetchBanners, createBanner, updateBanner, deleteBanner } from '../../services/adminApi'
import type { BannerItem } from '../../services/adminApi'

const CROP_WIDTH = 720
const CROP_HEIGHT = 320
const ASPECT = CROP_WIDTH / CROP_HEIGHT

const banners = ref<BannerItem[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  title: '',
  link_url: '',
  sort_order: 0,
  is_active: true,
})
const croppedFile = ref<File | null>(null)
const croppedPreview = ref<string | null>(null)
const existingPreview = ref<string | null>(null)
const saving = ref(false)

// 크롭 관련
const showCropper = ref(false)
const cropImgRef = ref<HTMLImageElement>()
const rawImageUrl = ref('')
let cropperInstance: Cropper | null = null

onMounted(() => loadBanners())

async function loadBanners() {
  loading.value = true
  try {
    const res = await fetchBanners()
    banners.value = res.data.data
  } catch {
    banners.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { title: '', link_url: '', sort_order: 0, is_active: true }
  croppedFile.value = null
  croppedPreview.value = null
  existingPreview.value = null
  showForm.value = true
}

function openEdit(b: BannerItem) {
  editingId.value = b.banner_id
  form.value = {
    title: b.title,
    link_url: b.link_url ?? '',
    sort_order: b.sort_order,
    is_active: b.is_active,
  }
  croppedFile.value = null
  croppedPreview.value = null
  existingPreview.value = b.image_url
  showForm.value = true
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  rawImageUrl.value = URL.createObjectURL(file)
  showCropper.value = true
  nextTick(() => initCropper())
}

function initCropper() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  if (!cropImgRef.value) return
  cropperInstance = new Cropper(cropImgRef.value, {
    aspectRatio: ASPECT,
    viewMode: 1,
    dragMode: 'move',
    autoCropArea: 1,
    cropBoxResizable: true,
    cropBoxMovable: true,
    background: true,
    guides: true,
  })
}

function applyCrop() {
  if (!cropperInstance) return
  const canvas = cropperInstance.getCroppedCanvas({
    width: CROP_WIDTH,
    height: CROP_HEIGHT,
    imageSmoothingQuality: 'high',
  })
  canvas.toBlob((blob) => {
    if (!blob) return
    croppedFile.value = new File([blob], 'banner.jpg', { type: 'image/jpeg' })
    croppedPreview.value = canvas.toDataURL('image/jpeg', 0.9)
    closeCropper()
  }, 'image/jpeg', 0.9)
}

function closeCropper() {
  if (cropperInstance) {
    cropperInstance.destroy()
    cropperInstance = null
  }
  showCropper.value = false
  if (rawImageUrl.value) {
    URL.revokeObjectURL(rawImageUrl.value)
    rawImageUrl.value = ''
  }
}

async function save() {
  if (!form.value.title.trim()) return alert('제목을 입력하세요.')
  if (!editingId.value && !croppedFile.value) return alert('이미지를 선택하고 크롭하세요.')

  saving.value = true
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('sort_order', String(form.value.sort_order))
    fd.append('is_active', form.value.is_active ? '1' : '0')
    if (form.value.link_url) fd.append('link_url', form.value.link_url)
    if (croppedFile.value) fd.append('image', croppedFile.value)

    if (editingId.value) {
      await updateBanner(editingId.value, fd)
    } else {
      await createBanner(fd)
    }

    showForm.value = false
    await loadBanners()
  } catch {
    alert('저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('이 배너를 삭제하시겠습니까?')) return
  try {
    await deleteBanner(id)
    await loadBanners()
  } catch {
    alert('삭제에 실패했습니다.')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold">배너 관리</h1>
        <p class="text-xs text-gray-400 mt-1">이미지 업로드 시 720x320 비율로 크롭됩니다</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        @click="openAdd"
      >
        + 배너 추가
      </button>
    </div>

    <!-- 배너 목록 -->
    <div v-if="loading" class="text-center py-10 text-gray-400">불러오는 중...</div>
    <div v-else-if="banners.length === 0" class="text-center py-10 text-gray-400">등록된 배너가 없습니다.</div>
    <div v-else class="space-y-4">
      <div
        v-for="b in banners"
        :key="b.banner_id"
        class="border rounded-xl overflow-hidden bg-white shadow-sm"
      >
        <div class="relative bg-gray-100" style="aspect-ratio: 720/320;">
          <img
            v-if="b.image_url"
            :src="b.image_url"
            :alt="b.title"
            class="w-full h-full object-cover"
          />
          <div class="absolute top-2 right-2">
            <span
              class="text-[11px] px-2 py-0.5 rounded-full backdrop-blur-sm"
              :class="b.is_active ? 'bg-green-500/80 text-white' : 'bg-gray-500/80 text-white'"
            >
              {{ b.is_active ? '활성' : '비활성' }}
            </span>
          </div>
        </div>
        <div class="p-3 flex items-center justify-between">
          <div>
            <h3 class="font-semibold text-sm">{{ b.title }}</h3>
            <p class="text-xs text-gray-400">순서: {{ b.sort_order }}</p>
          </div>
          <div class="flex gap-3">
            <button class="text-sm text-blue-600 hover:underline" @click="openEdit(b)">수정</button>
            <button class="text-sm text-red-500 hover:underline" @click="remove(b.banner_id)">삭제</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 추가/수정 모달 -->
    <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showForm = false">
      <div class="bg-white rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editingId ? '배너 수정' : '배너 추가' }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">제목</label>
            <input v-model="form.title" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="배너 제목" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">이미지</label>
            <input type="file" accept="image/*" class="w-full text-sm" @change="onFileChange" />
          </div>

          <!-- 크롭 완료 미리보기 -->
          <div v-if="croppedPreview || existingPreview">
            <label class="block text-sm font-medium text-gray-600 mb-1">미리보기 (사용자 앱 기준)</label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 mx-auto" style="max-width:362px;">
              <div style="aspect-ratio: 720/320;">
                <img :src="croppedPreview || existingPreview || ''" class="w-full h-full object-cover" />
              </div>
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">링크 URL (선택)</label>
            <input v-model="form.link_url" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
          </div>

          <div class="flex gap-4">
            <div class="flex-1">
              <label class="block text-sm font-medium text-gray-600 mb-1">순서</label>
              <input v-model.number="form.sort_order" type="number" class="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-2 text-sm">
                <input v-model="form.is_active" type="checkbox" class="rounded" />
                활성
              </label>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-2 mt-6">
          <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700" @click="showForm = false">취소</button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            :disabled="saving"
            @click="save"
          >
            {{ saving ? '저장 중...' : '저장' }}
          </button>
        </div>
      </div>
    </div>

    <!-- 크롭 모달 -->
    <div v-if="showCropper" class="fixed inset-0 bg-black/70 flex items-center justify-center z-[60]">
      <div class="bg-white rounded-2xl w-full max-w-2xl mx-4 p-5">
        <h3 class="text-base font-bold mb-3">이미지 크롭</h3>
        <p class="text-xs text-gray-400 mb-3">원하는 영역을 드래그해서 선택하세요 (720x320 비율 고정)</p>
        <div class="bg-gray-100 rounded-lg overflow-hidden" style="max-height: 400px;">
          <img ref="cropImgRef" :src="rawImageUrl" class="block max-w-full" />
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <button class="px-4 py-2 text-sm text-gray-500 hover:text-gray-700" @click="closeCropper">취소</button>
          <button
            class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
            @click="applyCrop"
          >
            크롭 적용
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
