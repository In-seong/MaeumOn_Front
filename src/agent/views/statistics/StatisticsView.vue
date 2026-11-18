<template>
  <div class="min-h-screen bg-[#E8E9EB] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-[#F4F5F7]">
      <header class="flex items-center h-[56px] px-5">
        <span class="text-[18px] font-bold text-[#1c1c1c]">양식</span>
      </header>

      <main class="overflow-y-auto pb-24" style="height: calc(100dvh - 56px);">
        <!-- 탭 -->
        <div class="flex gap-2 px-4 py-3 sticky top-0 z-10">
          <button
            :class="[
              'px-5 py-2 rounded-full text-[14px] font-medium transition-colors',
              activeTab === 'award'
                ? 'bg-[#FF6B2D] text-white'
                : 'bg-white text-[#999] border border-[#E8E8E8]',
            ]"
            @click="activeTab = 'award'"
          >
            시상안
          </button>
          <button
            :class="[
              'px-5 py-2 rounded-full text-[14px] font-medium transition-colors',
              activeTab === 'form'
                ? 'bg-[#FF6B2D] text-white'
                : 'bg-white text-[#999] border border-[#E8E8E8]',
            ]"
            @click="activeTab = 'form'"
          >
            청구서
          </button>
        </div>

        <!-- 시상안 탭 -->
        <div v-if="activeTab === 'award'" class="px-4 py-3">
          <!-- 월 네비게이션 -->
          <div class="flex items-center justify-between mb-4">
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F0F0F0]"
              @click="prevMonth"
            >
              <span class="material-symbols-outlined text-[20px] text-[#666]">chevron_left</span>
            </button>
            <div class="text-center">
              <span class="text-[15px] font-bold text-[#333]">
                {{ selectedYear }}년 {{ selectedMonth }}월
              </span>
              <span class="text-[12px] text-[#999] ml-1">({{ filteredAwardItems.length }}건)</span>
            </div>
            <button
              class="w-8 h-8 flex items-center justify-center rounded-full active:bg-[#F0F0F0]"
              @click="nextMonth"
            >
              <span class="material-symbols-outlined text-[20px] text-[#666]">chevron_right</span>
            </button>
          </div>

          <button
            class="w-full mb-4 py-2 text-[12px] text-[#666] bg-[#F5F5F5] active:bg-[#EBEBEB] rounded-lg text-center"
            @click="jump13MonthsBack"
          >
            13개월 전
          </button>

          <!-- 카테고리 필터 -->
          <div class="flex gap-2 mb-3 overflow-x-auto">
            <button
              v-for="tab in awardCategoryTabs"
              :key="tab.key ?? 'all'"
              :class="[
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border whitespace-nowrap',
                awardCategory === tab.key
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#555] border-[#E0E0E0]',
              ]"
              :style="awardCategory === tab.key ? { backgroundColor: tab.color } : {}"
              @click="awardCategory = tab.key"
            >
              {{ tab.label }}
              <span class="ml-0.5 text-[11px] opacity-80">({{ tab.key ? awardItems.filter(i => i.category === tab.key).length : awardItems.length }})</span>
            </button>
          </div>

          <!-- 로딩 -->
          <div v-if="awardLoading" class="py-16 text-center text-[#999] text-[14px]">
            불러오는 중...
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="!filteredAwardItems.length" class="py-16 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FFF0E5] flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px] text-[#FF6B2D]">emoji_events</span>
            </div>
            <p class="text-[14px] text-[#999]">해당 월에 등록된 시상안이 없습니다.</p>
          </div>

          <!-- 카드 그리드 (2열) -->
          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="item in filteredAwardItems"
              :key="item.id"
              class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden active:scale-[0.98] transition-transform"
              @click="openPreview(item)"
            >
              <div class="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center overflow-hidden">
                <img
                  v-if="item.thumbnail_url"
                  :src="item.thumbnail_url"
                  :alt="item.title"
                  class="w-full h-full object-cover"
                />
                <span v-else class="material-symbols-outlined text-[36px] text-[#CCC]">description</span>
              </div>
              <div class="p-2.5">
                <p class="text-[12px] font-medium text-[#333] truncate">{{ item.title }}</p>
                <p v-if="item.company_name" class="text-[11px] text-[#FF6B2D] truncate">{{ item.company_name }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- 청구서 탭 -->
        <div v-if="activeTab === 'form'" class="px-4 py-3">
          <!-- 카테고리 필터 -->
          <div class="flex gap-2 mb-3 overflow-x-auto">
            <button
              v-for="tab in categoryTabs"
              :key="tab.key"
              :class="[
                'px-3 py-1.5 rounded-lg text-[13px] font-medium transition-colors border whitespace-nowrap',
                formCategory === tab.key
                  ? 'text-white border-transparent'
                  : 'bg-white text-[#555] border-[#E0E0E0]',
              ]"
              :style="formCategory === tab.key ? { backgroundColor: tab.color } : {}"
              @click="formCategory = tab.key"
            >
              {{ tab.label }}
              <span class="ml-0.5 text-[11px] opacity-80">({{ formItems.filter(i => i.category === tab.key).length }})</span>
            </button>
          </div>

          <!-- 로딩 -->
          <div v-if="formLoading" class="bg-white rounded-xl border border-[#E8E8E8] p-10 text-center text-[13px] text-[#999]">
            불러오는 중...
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="!filteredFormItems.length" class="bg-white rounded-xl border border-[#E8E8E8] p-10 text-center">
            <span class="material-symbols-outlined text-[28px] text-[#CCC] mb-2">description</span>
            <p class="text-[13px] text-[#999]">등록된 양식이 없습니다.</p>
          </div>

          <!-- 목록 -->
          <div v-else class="space-y-2">
            <div
              v-for="item in filteredFormItems"
              :key="item.id"
              class="bg-white rounded-xl border border-[#E8E8E8] px-4 py-3"
            >
              <div class="text-[14px] font-medium text-[#333] mb-2">{{ item.company_name }}</div>
              <div class="flex gap-2">
                <button
                  v-if="item.claim_form_path"
                  class="flex-1 flex items-center justify-center gap-1 py-2 bg-[#EFF6FF] text-[#3B82F6] rounded-lg text-[13px] font-medium active:bg-[#DBEAFE]"
                  :disabled="downloading === item.id"
                  @click="downloadForm(item, 'claim')"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  청구서
                </button>
                <button
                  v-if="item.dental_confirm_path"
                  class="flex-1 flex items-center justify-center gap-1 py-2 bg-[#F0FDF4] text-[#10B981] rounded-lg text-[13px] font-medium active:bg-[#DCFCE7]"
                  :disabled="downloading === item.id"
                  @click="downloadForm(item, 'dental')"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  치과확인서
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>

  <!-- 시상안 미리보기 모달 (전체 화면) -->
  <Teleport to="body">
    <div
      v-if="previewItem"
      class="fixed inset-0 bg-black z-[100] flex flex-col"
    >
      <!-- 헤더 -->
      <div class="flex items-center justify-between px-4 py-3 bg-black/90">
        <div class="flex-1 min-w-0">
          <p class="text-white text-[14px] font-medium truncate">{{ previewItem.title }}</p>
          <p v-if="previewAllItems.length > 1" class="text-white/60 text-[12px]">
            {{ previewIndex + 1 }} / {{ previewAllItems.length }}
          </p>
        </div>
        <button
          class="ml-3 w-8 h-8 flex items-center justify-center"
          @click="closePreview"
        >
          <span class="material-symbols-outlined text-[24px] text-white">close</span>
        </button>
      </div>

      <!-- 콘텐츠 영역 -->
      <div class="flex-1 overflow-hidden relative">
        <transition :name="'slide-' + slideDirection" mode="out-in">
          <div :key="previewIndex" class="absolute inset-0">
            <!-- PDF -->
            <iframe
              v-if="previewItem.file_url && isPdf(previewItem)"
              :src="previewItem.file_url"
              class="w-full h-full bg-white"
            />
            <!-- 이미지 (핀치 줌 + 패닝) -->
            <div
              v-else-if="previewItem.file_url"
              ref="imgContainerRef"
              class="w-full h-full overflow-hidden touch-none"
              @touchstart.prevent="onPinchStart"
              @touchmove.prevent="onPinchMove"
              @touchend.prevent="onPinchEnd"
              @dblclick="toggleZoom"
            >
              <img
                ref="imgRef"
                :src="previewItem.file_url"
                :alt="previewItem.title"
                class="w-full h-auto select-none pointer-events-none"
                :class="isAnimating ? 'transition-transform duration-200 ease-out' : ''"
                :style="{ transform: `translate(${panX}px, ${panY}px) scale(${zoomLevel})`, transformOrigin: '0 0' }"
                @load="onImageLoad"
              />
            </div>
          </div>
        </transition>
      </div>

      <!-- 하단 컨트롤 -->
      <div v-if="previewAllItems.length > 1" class="flex items-center justify-between px-4 py-3 bg-black/90">
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full"
          :class="previewIndex > 0 ? 'active:bg-white/20 text-white' : 'text-white/30'"
          :disabled="previewIndex === 0"
          @click="prevPreview"
        >
          <span class="material-symbols-outlined text-[24px]">chevron_left</span>
        </button>
        <div class="flex gap-1">
          <div
            v-for="(_, idx) in previewAllItems"
            :key="idx"
            class="w-1.5 h-1.5 rounded-full transition-colors"
            :class="idx === previewIndex ? 'bg-[#FF6B2D]' : 'bg-white/30'"
          />
        </div>
        <button
          class="w-10 h-10 flex items-center justify-center rounded-full"
          :class="previewIndex < previewAllItems.length - 1 ? 'active:bg-white/20 text-white' : 'text-white/30'"
          :disabled="previewIndex >= previewAllItems.length - 1"
          @click="nextPreview"
        >
          <span class="material-symbols-outlined text-[24px]">chevron_right</span>
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import { fetchAwardPlans, fetchAwardPlanMonths, fetchFormDownloads, getFormDownloadUrl } from '../../services/agentApi'
import type { AwardPlanItem, FormDownloadItem } from '../../services/agentApi'

const activeTab = ref<'award' | 'form'>('award')

// ===== 시상안 카테고리 필터 =====
const awardCategory = ref<string | null>(null)

const awardCategoryTabs = [
  { key: null, label: '전체', color: '#FF6B2D' },
  { key: 'non-life', label: '손보', color: '#3B82F6' },
  { key: 'life', label: '생보', color: '#8B5CF6' },
  { key: 'cooperative', label: '공제', color: '#10B981' },
] as const

const filteredAwardItems = computed(() =>
  awardCategory.value
    ? awardItems.value.filter(i => i.category === awardCategory.value)
    : awardItems.value
)

// ===== 청구서 양식 =====
const formItems = ref<FormDownloadItem[]>([])
const formLoading = ref(false)
const formCategory = ref<'non-life' | 'life' | 'cooperative'>('non-life')
const downloading = ref<number | null>(null)

const categoryTabs = [
  { key: 'non-life' as const, label: '손보', color: '#3B82F6' },
  { key: 'life' as const, label: '생보', color: '#8B5CF6' },
  { key: 'cooperative' as const, label: '공제', color: '#10B981' },
]

const filteredFormItems = computed(() =>
  formItems.value.filter(i => i.category === formCategory.value)
)

async function loadFormItems() {
  formLoading.value = true
  try {
    const res = await fetchFormDownloads()
    formItems.value = res.data.data
  } finally {
    formLoading.value = false
  }
}

async function downloadForm(item: FormDownloadItem, type: 'claim' | 'dental') {
  downloading.value = item.id
  try {
    const res = await getFormDownloadUrl(item.id, type)
    const { url } = res.data.data
    window.open(url, '_blank')
  } finally {
    downloading.value = null
  }
}

// ===== 시상안 =====
const awardItems = ref<AwardPlanItem[]>([])
const awardLoading = ref(false)

const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)

function prevMonth() {
  if (selectedMonth.value === 1) {
    selectedYear.value--
    selectedMonth.value = 12
  } else {
    selectedMonth.value--
  }
}

function nextMonth() {
  if (selectedMonth.value === 12) {
    selectedYear.value++
    selectedMonth.value = 1
  } else {
    selectedMonth.value++
  }
}

function jump13MonthsBack() {
  const d = new Date(selectedYear.value, selectedMonth.value - 1)
  d.setMonth(d.getMonth() - 13)
  selectedYear.value = d.getFullYear()
  selectedMonth.value = d.getMonth() + 1
}

async function loadAwardItems() {
  awardLoading.value = true
  try {
    const res = await fetchAwardPlans({
      year: selectedYear.value,
      month: selectedMonth.value,
    })
    awardItems.value = res.data.data
  } finally {
    awardLoading.value = false
  }
}

watch([selectedYear, selectedMonth], () => {
  loadAwardItems()
})

function isPdf(item: AwardPlanItem): boolean {
  return item.file_name.toLowerCase().endsWith('.pdf')
}

// ===== 미리보기 모달 =====
const previewItem = ref<AwardPlanItem | null>(null)
const previewAllItems = ref<AwardPlanItem[]>([])
const previewIndex = ref(0)
const zoomLevel = ref(1)
const panX = ref(0)
const panY = ref(0)
const isAnimating = ref(false)
const imgContainerRef = ref<HTMLDivElement | null>(null)
const imgRef = ref<HTMLImageElement | null>(null)
const slideDirection = ref<'left' | 'right'>('left')

const MIN_ZOOM = 1
const MAX_ZOOM = 4

function resetTransform() {
  zoomLevel.value = 1
  panX.value = 0
  panY.value = 0
}

function openPreview(item: AwardPlanItem) {
  previewAllItems.value = [...awardItems.value]
  previewIndex.value = previewAllItems.value.findIndex(i => i.id === item.id)
  previewItem.value = item
  resetTransform()
}

function closePreview() {
  previewItem.value = null
  resetTransform()
}

function prevPreview() {
  if (previewIndex.value > 0) {
    slideDirection.value = 'right'
    previewIndex.value--
    const item = previewAllItems.value[previewIndex.value]
    if (item) {
      previewItem.value = item
      resetTransform()
    }
  }
}

function nextPreview() {
  if (previewIndex.value < previewAllItems.value.length - 1) {
    slideDirection.value = 'left'
    previewIndex.value++
    const item = previewAllItems.value[previewIndex.value]
    if (item) {
      previewItem.value = item
      resetTransform()
    }
  }
}

function onImageLoad() {
  resetTransform()
}

function toggleZoom(e: MouseEvent) {
  isAnimating.value = true
  if (zoomLevel.value > 1) {
    resetTransform()
  } else {
    const rect = imgContainerRef.value?.getBoundingClientRect()
    const tapX = e.clientX - (rect?.left ?? 0)
    const tapY = e.clientY - (rect?.top ?? 0)
    const focalX = tapX - panX.value
    const focalY = tapY - panY.value
    const newZoom = 2.5
    const scaleFactor = newZoom / zoomLevel.value
    panX.value = tapX - focalX * scaleFactor
    panY.value = tapY - focalY * scaleFactor
    zoomLevel.value = newZoom
    clampPan()
  }
  setTimeout(() => { isAnimating.value = false }, 220)
}

function clampPan() {
  const container = imgContainerRef.value
  const img = imgRef.value
  if (!container || !img) return
  const cw = container.clientWidth
  const ch = container.clientHeight
  const iw = img.naturalWidth
  const ih = img.naturalHeight
  const displayW = cw
  const displayH = (ih / iw) * cw
  const scaledW = displayW * zoomLevel.value
  const scaledH = displayH * zoomLevel.value

  if (scaledW <= cw) {
    panX.value = (cw - scaledW) / 2
  } else {
    panX.value = Math.min(0, Math.max(cw - scaledW, panX.value))
  }
  if (scaledH <= ch) {
    panY.value = (ch - scaledH) / 2
  } else {
    panY.value = Math.min(0, Math.max(ch - scaledH, panY.value))
  }
}

// 핀치 줌 + 패닝 (focal point 기준)
let pinchStartDist = 0
let pinchStartZoom = 1
let pinchStartPanX = 0
let pinchStartPanY = 0
let pinchMidX = 0
let pinchMidY = 0
let panStartX = 0
let panStartY = 0
let panStartPanX = 0
let panStartPanY = 0
let isPinching = false
let swipeStartX = 0
let swipeStartY = 0

function getDist(t1: Touch, t2: Touch): number {
  return Math.hypot(t2.clientX - t1.clientX, t2.clientY - t1.clientY)
}

function onPinchStart(e: TouchEvent) {
  const t0 = e.touches[0]
  if (!t0) return
  if (e.touches.length === 2) {
    const t1 = e.touches[1]
    if (!t1) return
    isPinching = true
    pinchStartDist = getDist(t0, t1)
    pinchStartZoom = zoomLevel.value
    pinchStartPanX = panX.value
    pinchStartPanY = panY.value
    const rect = imgContainerRef.value?.getBoundingClientRect()
    pinchMidX = (t0.clientX + t1.clientX) / 2 - (rect?.left ?? 0)
    pinchMidY = (t0.clientY + t1.clientY) / 2 - (rect?.top ?? 0)
  } else {
    isPinching = false
    panStartX = t0.clientX
    panStartY = t0.clientY
    panStartPanX = panX.value
    panStartPanY = panY.value
    swipeStartX = t0.clientX
    swipeStartY = t0.clientY
  }
  isAnimating.value = false
}

function onPinchMove(e: TouchEvent) {
  const t0 = e.touches[0]
  if (!t0) return
  if (e.touches.length === 2 && isPinching) {
    const t1 = e.touches[1]
    if (!t1) return
    const dist = getDist(t0, t1)
    const ratio = dist / pinchStartDist
    const newZoom = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, pinchStartZoom * ratio))
    const focalX = pinchMidX - pinchStartPanX
    const focalY = pinchMidY - pinchStartPanY
    const scaleFactor = newZoom / pinchStartZoom
    panX.value = pinchMidX - focalX * scaleFactor
    panY.value = pinchMidY - focalY * scaleFactor
    zoomLevel.value = newZoom
    clampPan()
  } else if (zoomLevel.value > 1 && !isPinching) {
    panX.value = panStartPanX + (t0.clientX - panStartX)
    panY.value = panStartPanY + (t0.clientY - panStartY)
  }
}

function onPinchEnd(e: TouchEvent) {
  if (isPinching && e.touches.length < 2) {
    isPinching = false
    isAnimating.value = true
    if (zoomLevel.value < MIN_ZOOM) zoomLevel.value = MIN_ZOOM
    clampPan()
    setTimeout(() => { isAnimating.value = false }, 220)
    return
  }

  if (zoomLevel.value <= 1) {
    const touch = e.changedTouches[0]
    if (!touch) return
    const dx = touch.clientX - swipeStartX
    const dy = touch.clientY - swipeStartY
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
      if (dx < 0) nextPreview()
      else prevPreview()
    }
  } else {
    isAnimating.value = true
    clampPan()
    setTimeout(() => { isAnimating.value = false }, 220)
  }
}

onMounted(() => {
  loadAwardItems()
  fetchAwardPlanMonths()
  loadFormItems()
})
</script>

<style scoped>
.slide-left-enter-active,
.slide-left-leave-active,
.slide-right-enter-active,
.slide-right-leave-active {
  transition: transform 0.2s ease-out, opacity 0.2s ease-out;
}
.slide-left-enter-from {
  transform: translateX(30%);
  opacity: 0;
}
.slide-left-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-enter-from {
  transform: translateX(-30%);
  opacity: 0;
}
.slide-right-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
</style>
