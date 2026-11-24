<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  fetchFormDownloads, getFormDownloadUrl,
  fetchAwardPlans,
} from '../../services/agentApi'
import type { FormDownloadItem, AwardPlanItem } from '../../services/agentApi'

// ===== 탭 =====
const activeTab = ref<'award' | 'form'>('award')

// ===== 시상안 =====
const awardItems = ref<AwardPlanItem[]>([])
const awardLoading = ref(false)
const previewItem = ref<AwardPlanItem | null>(null)
const previewAllItems = ref<AwardPlanItem[]>([])
const previewIndex = ref(0)

function openGroupPreview(group: AwardGroup) {
  previewAllItems.value = [...group.items]
  previewIndex.value = 0
  const first = group.items[0]
  previewItem.value = first ?? null
}

function prevPreview() {
  if (previewIndex.value > 0) {
    previewIndex.value--
    const item = previewAllItems.value[previewIndex.value]
    if (item) previewItem.value = item
  }
}

function nextPreview() {
  if (previewIndex.value < previewAllItems.value.length - 1) {
    previewIndex.value++
    const item = previewAllItems.value[previewIndex.value]
    if (item) previewItem.value = item
  }
}

function closePreview() {
  previewItem.value = null
  previewAllItems.value = []
  previewIndex.value = 0
}

const awardCategory = ref<string | null>(null)

const awardCategoryTabs = [
  { key: null, label: '전체', color: '#FF6B2D' },
  { key: 'non-life', label: '손해보험', color: '#3B82F6' },
  { key: 'life', label: '생명보험', color: '#8B5CF6' },
  { key: 'cooperative', label: '공제조합', color: '#10B981' },
] as const

const filteredAwardItems = computed(() =>
  awardCategory.value
    ? awardItems.value.filter(i => i.category === awardCategory.value)
    : awardItems.value
)

interface AwardGroup {
  key: string
  company_name: string
  category?: string
  thumbnail: AwardPlanItem
  items: AwardPlanItem[]
}

const allAwardGroups = computed<AwardGroup[]>(() => {
  const map = new Map<string, AwardGroup>()
  for (const item of awardItems.value) {
    const key = item.company_name ?? item.title
    const existing = map.get(key)
    if (existing) {
      existing.items.push(item)
    } else {
      map.set(key, {
        key,
        company_name: item.company_name ?? item.title,
        category: item.category,
        thumbnail: item,
        items: [item],
      })
    }
  }
  return Array.from(map.values())
})

const awardGroups = computed<AwardGroup[]>(() => {
  const map = new Map<string, AwardGroup>()
  for (const item of filteredAwardItems.value) {
    const key = item.company_name ?? item.title
    const existing = map.get(key)
    if (existing) {
      existing.items.push(item)
    } else {
      map.set(key, {
        key,
        company_name: item.company_name ?? item.title,
        category: item.category,
        thumbnail: item,
        items: [item],
      })
    }
  }
  return Array.from(map.values())
})

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

// ===== 청구서 =====
const formItems = ref<FormDownloadItem[]>([])
const formLoading = ref(false)
const activeCategory = ref<string>('non-life')
const downloading = ref<number | null>(null)

const categoryTabs = [
  { key: 'non-life', label: '손해보험', color: '#3B82F6' },
  { key: 'life', label: '생명보험', color: '#10B981' },
  { key: 'cooperative', label: '공제조합', color: '#8B5CF6' },
] as const

const filteredFormItems = computed(() =>
  formItems.value.filter(i => i.category === activeCategory.value)
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

async function download(item: FormDownloadItem, type: 'claim' | 'dental') {
  downloading.value = item.id
  try {
    const res = await getFormDownloadUrl(item.id, type)
    const { url } = res.data.data
    window.open(url, '_blank')
  } finally {
    downloading.value = null
  }
}

// 미리보기 모달 내 PDF 페이지 처리는 iframe 사용
function isPdf(item: AwardPlanItem): boolean {
  return item.file_name.toLowerCase().endsWith('.pdf')
}

onMounted(async () => {
  await Promise.all([loadAwardItems(), loadFormItems()])
})
</script>

<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">양식</h1>

    <!-- 상단 탭 -->
    <div class="flex gap-1 mb-6 border-b border-[#E8E8E8]">
      <button
        :class="[
          'px-5 py-3 text-[15px] font-medium transition-colors border-b-2 -mb-px',
          activeTab === 'award'
            ? 'text-[#FF6B2D] border-[#FF6B2D]'
            : 'text-[#999] border-transparent hover:text-[#555]',
        ]"
        @click="activeTab = 'award'"
      >
        시상안
      </button>
      <button
        :class="[
          'px-5 py-3 text-[15px] font-medium transition-colors border-b-2 -mb-px',
          activeTab === 'form'
            ? 'text-[#FF6B2D] border-[#FF6B2D]'
            : 'text-[#999] border-transparent hover:text-[#555]',
        ]"
        @click="activeTab = 'form'"
      >
        청구서
      </button>
    </div>

    <!-- 시상안 탭 -->
    <div v-if="activeTab === 'award'">
      <!-- 월 네비게이션 -->
      <div class="flex items-center gap-3 mb-5">
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
          @click="prevMonth"
        >
          <span class="material-symbols-outlined text-[20px] text-[#666]">chevron_left</span>
        </button>
        <span class="text-[16px] font-bold text-[#333] min-w-[120px] text-center">
          {{ selectedYear }}년 {{ selectedMonth }}월
        </span>
        <button
          class="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#F5F5F5] transition-colors"
          @click="nextMonth"
        >
          <span class="material-symbols-outlined text-[20px] text-[#666]">chevron_right</span>
        </button>
        <span class="text-[13px] text-[#999]">
          ({{ awardGroups.length }}건)
        </span>
        <button
          class="ml-auto px-3 py-1.5 text-[12px] text-[#666] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-lg transition-colors"
          @click="jump13MonthsBack"
        >
          13개월 전
        </button>
      </div>

      <!-- 카테고리 필터 -->
      <div class="flex gap-2 mb-5">
        <button
          v-for="tab in awardCategoryTabs"
          :key="tab.key ?? 'all'"
          :class="[
            'px-4 py-2 rounded-lg text-[14px] font-medium transition-colors border',
            awardCategory === tab.key
              ? 'text-white border-transparent'
              : 'bg-white text-[#555] border-[#E0E0E0] hover:bg-[#F5F5F5]',
          ]"
          :style="awardCategory === tab.key ? { backgroundColor: tab.color } : {}"
          @click="awardCategory = tab.key"
        >
          {{ tab.label }}
          <span class="ml-1 text-[12px] opacity-80">({{ tab.key ? allAwardGroups.filter(g => g.category === tab.key).length : allAwardGroups.length }})</span>
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="awardLoading" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center text-[#999]">
        불러오는 중...
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!awardGroups.length" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px] text-[#CCC]">emoji_events</span>
        </div>
        <p class="text-[15px] text-[#999]">해당 월에 등록된 시상안이 없습니다.</p>
      </div>

      <!-- 회사별 카드 그리드 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="group in awardGroups"
          :key="group.key"
          class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          @click="openGroupPreview(group)"
        >
          <div class="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
            <img
              v-if="group.thumbnail.thumbnail_url"
              :src="group.thumbnail.thumbnail_url"
              :alt="group.company_name"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-[48px] text-[#CCC]">description</span>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                visibility
              </span>
            </div>
            <span
              v-if="group.items.length > 1"
              class="absolute top-2 right-2 bg-black/60 text-white text-[11px] font-bold px-2 py-0.5 rounded-md"
            >{{ group.items.length }}p</span>
          </div>
          <div class="p-3">
            <p class="text-[13px] font-medium text-[#333] truncate">{{ group.company_name }}</p>
            <p v-if="group.items.length > 1" class="text-[11px] text-[#999] mt-0.5">{{ group.items.length }}장</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 청구서 탭 -->
    <div v-if="activeTab === 'form'">
      <!-- 카테고리 탭 -->
      <div class="flex gap-2 mb-5">
        <button
          v-for="tab in categoryTabs"
          :key="tab.key"
          :class="[
            'px-4 py-2 rounded-lg text-[14px] font-medium transition-colors border',
            activeCategory === tab.key
              ? 'text-white border-transparent'
              : 'bg-white text-[#555] border-[#E0E0E0] hover:bg-[#F5F5F5]',
          ]"
          :style="activeCategory === tab.key ? { backgroundColor: tab.color } : {}"
          @click="activeCategory = tab.key"
        >
          {{ tab.label }}
          <span class="ml-1 text-[12px] opacity-80">({{ formItems.filter(i => i.category === tab.key).length }})</span>
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="formLoading" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center text-[#999]">
        불러오는 중...
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!filteredFormItems.length" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px] text-[#CCC]">description</span>
        </div>
        <p class="text-[15px] text-[#999]">등록된 양식이 없습니다.</p>
      </div>

      <!-- 목록 -->
      <div v-else class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
        <table class="w-full text-[14px]">
          <thead>
            <tr class="bg-[#F9F9F9] border-b border-[#E8E8E8]">
              <th class="text-left px-5 py-3 text-[#777] font-medium">보험사</th>
              <th class="text-center px-5 py-3 text-[#777] font-medium w-44">청구서</th>
              <th class="text-center px-5 py-3 text-[#777] font-medium w-44">치과확인서</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="item in filteredFormItems"
              :key="item.id"
              class="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]"
            >
              <td class="px-5 py-3.5 font-medium text-[#333]">{{ item.company_name }}</td>
              <td class="px-5 py-3.5 text-center">
                <button
                  v-if="item.claim_form_path"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EFF6FF] text-[#3B82F6] rounded-lg text-[13px] font-medium hover:bg-[#DBEAFE] transition-colors"
                  :disabled="downloading === item.id"
                  @click="download(item, 'claim')"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  다운로드
                </button>
                <span v-else class="text-[#CCC]">-</span>
              </td>
              <td class="px-5 py-3.5 text-center">
                <button
                  v-if="item.dental_confirm_path"
                  class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#F0FDF4] text-[#10B981] rounded-lg text-[13px] font-medium hover:bg-[#DCFCE7] transition-colors"
                  :disabled="downloading === item.id"
                  @click="download(item, 'dental')"
                >
                  <span class="material-symbols-outlined text-[16px]">download</span>
                  다운로드
                </button>
                <span v-else class="text-[#CCC]">-</span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 시상안 미리보기 모달 -->
    <Teleport to="body">
      <div
        v-if="previewItem"
        class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        @click.self="closePreview"
      >
        <div class="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
          <div class="flex items-center justify-between w-full mb-3">
            <div class="flex-1 min-w-0">
              <h3 class="text-white text-[16px] font-medium truncate">{{ previewItem.title }}</h3>
              <p v-if="previewAllItems.length > 1" class="text-white/60 text-[13px]">
                {{ previewIndex + 1 }} / {{ previewAllItems.length }}
              </p>
            </div>
            <button
              class="text-white hover:text-[#FF6B2D] transition-colors ml-4"
              @click="closePreview"
            >
              <span class="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>
          <div class="relative flex items-center gap-3">
            <button
              v-if="previewAllItems.length > 1"
              class="w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0"
              :class="previewIndex > 0 ? 'hover:bg-white/20 text-white' : 'text-white/20 cursor-default'"
              :disabled="previewIndex === 0"
              @click.stop="prevPreview"
            >
              <span class="material-symbols-outlined text-[28px]">chevron_left</span>
            </button>
            <iframe
              v-if="previewItem.file_url && isPdf(previewItem)"
              :src="previewItem.file_url"
              class="w-[80vw] h-[80vh] rounded-lg bg-white"
            />
            <img
              v-else-if="previewItem.file_url"
              :src="previewItem.file_url"
              :alt="previewItem.title"
              class="max-w-full max-h-[80vh] object-contain rounded-lg"
            />
            <button
              v-if="previewAllItems.length > 1"
              class="w-10 h-10 flex items-center justify-center rounded-full transition-colors shrink-0"
              :class="previewIndex < previewAllItems.length - 1 ? 'hover:bg-white/20 text-white' : 'text-white/20 cursor-default'"
              :disabled="previewIndex >= previewAllItems.length - 1"
              @click.stop="nextPreview"
            >
              <span class="material-symbols-outlined text-[28px]">chevron_right</span>
            </button>
          </div>
          <div v-if="previewAllItems.length > 1" class="flex gap-1.5 mt-3">
            <div
              v-for="(_, idx) in previewAllItems"
              :key="idx"
              class="w-2 h-2 rounded-full transition-colors"
              :class="idx === previewIndex ? 'bg-[#FF6B2D]' : 'bg-white/30'"
            />
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
