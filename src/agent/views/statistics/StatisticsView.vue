<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <AgentAppHeader />

      <main class="overflow-y-auto" style="height: calc(100dvh - 66px - 60px);">
        <!-- 탭 -->
        <div class="flex border-b border-[#E8E8E8] bg-white sticky top-0 z-10">
          <button
            :class="[
              'flex-1 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'award'
                ? 'text-[#FF7B22] border-[#FF7B22]'
                : 'text-[#999] border-transparent',
            ]"
            @click="activeTab = 'award'"
          >
            시상안
          </button>
          <button
            :class="[
              'flex-1 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-px',
              activeTab === 'form'
                ? 'text-[#FF7B22] border-[#FF7B22]'
                : 'text-[#999] border-transparent',
            ]"
            @click="activeTab = 'form'"
          >
            청구서
          </button>
        </div>

        <!-- 시상안 탭 -->
        <div v-if="activeTab === 'award'" class="px-4 py-4">
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
              <span class="text-[12px] text-[#999] ml-1">({{ awardItems.length }}건)</span>
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

          <!-- 로딩 -->
          <div v-if="awardLoading" class="py-16 text-center text-[#999] text-[14px]">
            불러오는 중...
          </div>

          <!-- 빈 상태 -->
          <div v-else-if="!awardItems.length" class="py-16 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FFF0E5] flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px] text-[#FF7B22]">emoji_events</span>
            </div>
            <p class="text-[14px] text-[#999]">해당 월에 등록된 시상안이 없습니다.</p>
          </div>

          <!-- 카드 그리드 (2열) -->
          <div v-else class="grid grid-cols-2 gap-3">
            <div
              v-for="item in awardItems"
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
              </div>
            </div>
          </div>
        </div>

        <!-- 청구서 탭 -->
        <div v-if="activeTab === 'form'" class="px-4 py-4">
          <div class="bg-white rounded-xl border border-[#E8E8E8] p-5 text-center">
            <div class="w-14 h-14 mx-auto mb-3 rounded-full bg-[#FFF0E5] flex items-center justify-center">
              <span class="material-symbols-outlined text-[28px] text-[#FF7B22]">download</span>
            </div>
            <h3 class="text-[16px] font-bold text-[#333] mb-1">양식 다운로드</h3>
            <p class="text-[13px] text-[#999] leading-relaxed">
              양식 다운로드는 PC에서 이용 가능합니다.
            </p>
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
      <div
        class="flex-1 overflow-hidden relative"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      >
        <!-- PDF -->
        <iframe
          v-if="previewItem.file_url && isPdf(previewItem)"
          :src="previewItem.file_url"
          class="w-full h-full bg-white"
        />
        <!-- 이미지 (확대/축소 지원) -->
        <div
          v-else-if="previewItem.file_url"
          class="w-full h-full flex items-center justify-center overflow-auto"
        >
          <img
            :src="previewItem.file_url"
            :alt="previewItem.title"
            class="max-w-none transition-transform duration-200"
            :style="{ transform: `scale(${zoomLevel})` }"
            @dblclick="toggleZoom"
          />
        </div>
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
            :class="idx === previewIndex ? 'bg-[#FF7B22]' : 'bg-white/30'"
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
import { ref, watch, onMounted } from 'vue'
import AgentAppHeader from '../../components/layout/AgentAppHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import { fetchAwardPlans, fetchAwardPlanMonths } from '../../services/agentApi'
import type { AwardPlanItem } from '../../services/agentApi'

const activeTab = ref<'award' | 'form'>('award')

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

function openPreview(item: AwardPlanItem) {
  previewAllItems.value = [...awardItems.value]
  previewIndex.value = previewAllItems.value.findIndex(i => i.id === item.id)
  previewItem.value = item
  zoomLevel.value = 1
}

function closePreview() {
  previewItem.value = null
  zoomLevel.value = 1
}

function prevPreview() {
  if (previewIndex.value > 0) {
    previewIndex.value--
    const item = previewAllItems.value[previewIndex.value]
    if (item) {
      previewItem.value = item
      zoomLevel.value = 1
    }
  }
}

function nextPreview() {
  if (previewIndex.value < previewAllItems.value.length - 1) {
    previewIndex.value++
    const item = previewAllItems.value[previewIndex.value]
    if (item) {
      previewItem.value = item
      zoomLevel.value = 1
    }
  }
}

function toggleZoom() {
  zoomLevel.value = zoomLevel.value === 1 ? 2.5 : 1
}

// 스와이프 제스처
let touchStartX = 0
let touchStartY = 0

function onTouchStart(e: TouchEvent) {
  const touch = e.touches[0]
  if (!touch) return
  touchStartX = touch.clientX
  touchStartY = touch.clientY
}

function onTouchMove(e: TouchEvent) {
  if (zoomLevel.value > 1) return
  e.preventDefault()
}

function onTouchEnd(e: TouchEvent) {
  if (zoomLevel.value > 1) return
  const touch = e.changedTouches[0]
  if (!touch) return
  const dx = touch.clientX - touchStartX
  const dy = touch.clientY - touchStartY
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 50) {
    if (dx < 0) {
      nextPreview()
    } else {
      prevPreview()
    }
  }
}

onMounted(() => {
  loadAwardItems()
  fetchAwardPlanMonths()
})
</script>
