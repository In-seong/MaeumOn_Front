<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { fetchFormDownloads, getFormDownloadUrl } from '../../services/agentApi'
import type { FormDownloadItem } from '../../services/agentApi'

const items = ref<FormDownloadItem[]>([])
const loading = ref(false)
const activeCategory = ref<string>('non-life')

const categoryTabs = [
  { key: 'non-life', label: '손해보험', color: '#3B82F6' },
  { key: 'life', label: '생명보험', color: '#10B981' },
  { key: 'cooperative', label: '공제조합', color: '#8B5CF6' },
] as const

const filteredItems = computed(() =>
  items.value.filter(i => i.category === activeCategory.value)
)

async function loadItems() {
  loading.value = true
  try {
    const res = await fetchFormDownloads()
    items.value = res.data.data
  } finally {
    loading.value = false
  }
}

const downloading = ref<number | null>(null)

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

onMounted(loadItems)
</script>

<template>
  <div class="p-6">
    <h1 class="text-[20px] font-bold text-[#333] mb-6">양식 다운로드</h1>

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
        <span class="ml-1 text-[12px] opacity-80">({{ items.filter(i => i.category === tab.key).length }})</span>
      </button>
    </div>

    <!-- 로딩 -->
    <div v-if="loading" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center text-[#999]">
      불러오는 중...
    </div>

    <!-- 빈 상태 -->
    <div v-else-if="!filteredItems.length" class="bg-white rounded-xl border border-[#E8E8E8] p-20 text-center">
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
            v-for="item in filteredItems"
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
</template>
