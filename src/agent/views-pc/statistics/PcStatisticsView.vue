<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  fetchFormDownloads, getFormDownloadUrl,
  fetchAwardPlans, fetchAwardPlanMonths,
} from '../../services/agentApi'
import type { FormDownloadItem, AwardPlanItem, AwardPlanMonth } from '../../services/agentApi'

// ===== 탭 =====
const activeTab = ref<'award' | 'form'>('award')

// ===== 시상안 =====
const awardItems = ref<AwardPlanItem[]>([])
const awardMonths = ref<AwardPlanMonth[]>([])
const awardLoading = ref(false)
const previewItem = ref<AwardPlanItem | null>(null)

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

async function loadAwardMonths() {
  const res = await fetchAwardPlanMonths()
  awardMonths.value = res.data.data
}

function getMonthCount(year: number, month: number): number {
  const found = awardMonths.value.find(m => m.target_year === year && m.target_month === month)
  return found?.count ?? 0
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
  await Promise.all([loadAwardItems(), loadAwardMonths(), loadFormItems()])
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
            ? 'text-[#FF7B22] border-[#FF7B22]'
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
            ? 'text-[#FF7B22] border-[#FF7B22]'
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
          ({{ getMonthCount(selectedYear, selectedMonth) }}건)
        </span>
        <button
          class="ml-auto px-3 py-1.5 text-[12px] text-[#666] bg-[#F5F5F5] hover:bg-[#EBEBEB] rounded-lg transition-colors"
          @click="jump13MonthsBack"
        >
          13개월 전
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="awardLoading" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center text-[#999]">
        불러오는 중...
      </div>

      <!-- 빈 상태 -->
      <div v-else-if="!awardItems.length" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center">
        <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#F5F5F5] flex items-center justify-center">
          <span class="material-symbols-outlined text-[28px] text-[#CCC]">emoji_events</span>
        </div>
        <p class="text-[15px] text-[#999]">해당 월에 등록된 시상안이 없습니다.</p>
      </div>

      <!-- 카드 그리드 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="item in awardItems"
          :key="item.id"
          class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden cursor-pointer hover:shadow-md transition-shadow group"
          @click="previewItem = item"
        >
          <div class="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center relative overflow-hidden">
            <img
              v-if="item.thumbnail_url"
              :src="item.thumbnail_url"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-[48px] text-[#CCC]">description</span>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md">
                visibility
              </span>
            </div>
          </div>
          <div class="p-3">
            <p class="text-[13px] font-medium text-[#333] truncate">{{ item.title }}</p>
            <p v-if="item.company_name" class="text-[11px] text-[#FF7B22] mt-0.5 truncate">{{ item.company_name }}</p>
            <p class="text-[11px] text-[#999] mt-0.5">{{ item.file_name }}</p>
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
        @click.self="previewItem = null"
      >
        <div class="relative max-w-[90vw] max-h-[90vh] flex flex-col items-center">
          <div class="flex items-center justify-between w-full mb-3">
            <h3 class="text-white text-[16px] font-medium truncate max-w-[60vw]">{{ previewItem.title }}</h3>
            <button
              class="text-white hover:text-[#FF7B22] transition-colors ml-4"
              @click="previewItem = null"
            >
              <span class="material-symbols-outlined text-[28px]">close</span>
            </button>
          </div>
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
        </div>
      </div>
    </Teleport>
  </div>
</template>
