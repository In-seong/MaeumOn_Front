<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchAwardPlans,
  fetchAwardPlanMonths,
  createAwardPlan,
  updateAwardPlan,
  deleteAwardPlan,
} from '../../services/adminApi'
import type { AwardPlanItem, AwardPlanMonth } from '../../types'

const items = ref<AwardPlanItem[]>([])
const months = ref<AwardPlanMonth[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref<AwardPlanItem | null>(null)
const previewUrl = ref<string | null>(null)

const now = new Date()
const selectedYear = ref(now.getFullYear())
const selectedMonth = ref(now.getMonth() + 1)

const filteredItems = computed(() => items.value)

const form = ref({
  title: '',
  target_year: now.getFullYear(),
  target_month: now.getMonth() + 1,
  sort_order: 0,
  files: [] as File[],
  file: null as File | null,
})

async function loadMonths() {
  const res = await fetchAwardPlanMonths()
  months.value = res.data.data
}

async function loadItems() {
  loading.value = true
  try {
    const res = await fetchAwardPlans({
      year: selectedYear.value,
      month: selectedMonth.value,
    })
    items.value = res.data.data
  } finally {
    loading.value = false
  }
}

function prevMonth() {
  if (selectedMonth.value === 1) {
    selectedYear.value--
    selectedMonth.value = 12
  } else {
    selectedMonth.value--
  }
  loadItems()
}

function nextMonth() {
  if (selectedMonth.value === 12) {
    selectedYear.value++
    selectedMonth.value = 1
  } else {
    selectedMonth.value++
  }
  loadItems()
}

function openCreateModal() {
  editingItem.value = null
  form.value = {
    title: '',
    target_year: selectedYear.value,
    target_month: selectedMonth.value,
    sort_order: 0,
    files: [],
    file: null,
  }
  showModal.value = true
}

function openEditModal(item: AwardPlanItem) {
  editingItem.value = item
  form.value = {
    title: item.title,
    target_year: item.target_year,
    target_month: item.target_month,
    sort_order: item.sort_order,
    files: [],
    file: null,
  }
  showModal.value = true
}

function onFilesChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    form.value.files = Array.from(target.files)
  }
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    form.value.file = file
  }
}

const saving = ref(false)

async function save() {
  if (!form.value.title) return
  saving.value = true
  try {
    if (editingItem.value) {
      const fd = new FormData()
      fd.append('title', form.value.title)
      fd.append('target_year', String(form.value.target_year))
      fd.append('target_month', String(form.value.target_month))
      fd.append('sort_order', String(form.value.sort_order))
      if (form.value.file) fd.append('file', form.value.file)
      await updateAwardPlan(editingItem.value.id, fd)
    } else {
      if (form.value.files.length === 0) return
      const fd = new FormData()
      fd.append('title', form.value.title)
      fd.append('target_year', String(form.value.target_year))
      fd.append('target_month', String(form.value.target_month))
      fd.append('sort_order', String(form.value.sort_order))
      for (const file of form.value.files) {
        fd.append('files[]', file)
      }
      await createAwardPlan(fd)
    }
    showModal.value = false
    await Promise.all([loadItems(), loadMonths()])
  } finally {
    saving.value = false
  }
}

async function remove(item: AwardPlanItem) {
  if (!confirm(`"${item.title}" 시상안을 삭제하시겠습니까?`)) return
  await deleteAwardPlan(item.id)
  await Promise.all([loadItems(), loadMonths()])
}

function getMonthCount(year: number, month: number): number {
  const found = months.value.find(m => m.target_year === year && m.target_month === month)
  return found?.count ?? 0
}

onMounted(async () => {
  await Promise.all([loadItems(), loadMonths()])
})
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">시상안 관리</h1>
      <button
        class="px-4 py-2 bg-[#FF7B22] text-white rounded-lg text-[14px] font-medium hover:bg-[#E56A10] transition-colors"
        @click="openCreateModal"
      >
        + 시상안 등록
      </button>
    </div>

    <!-- 월 선택 -->
    <div class="flex items-center gap-4 mb-6">
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
    </div>

    <div v-if="loading" class="text-center py-20 text-[#999]">불러오는 중...</div>

    <template v-else>
      <div v-if="filteredItems.length === 0" class="text-center py-20 text-[#999]">
        해당 월에 등록된 시상안이 없습니다.
      </div>

      <!-- 카드 그리드 -->
      <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        <div
          v-for="item in filteredItems"
          :key="item.id"
          class="bg-white rounded-xl border border-[#E5E5E5] overflow-hidden hover:shadow-md transition-shadow group"
        >
          <!-- 썸네일 -->
          <div
            class="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center cursor-pointer relative overflow-hidden"
            @click="previewUrl = item.file_url"
          >
            <img
              v-if="item.thumbnail_url"
              :src="item.thumbnail_url"
              :alt="item.title"
              class="w-full h-full object-cover"
            />
            <span v-else class="material-symbols-outlined text-[48px] text-[#CCC]">description</span>
            <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
              <span class="material-symbols-outlined text-white text-[32px] opacity-0 group-hover:opacity-100 transition-opacity">
                visibility
              </span>
            </div>
          </div>

          <!-- 정보 -->
          <div class="p-3">
            <p class="text-[13px] font-medium text-[#333] truncate">{{ item.title }}</p>
            <p class="text-[11px] text-[#999] mt-1">{{ item.file_name }}</p>
            <div class="flex items-center gap-2 mt-2">
              <button
                class="text-[12px] text-[#3B82F6] hover:underline"
                @click="openEditModal(item)"
              >수정</button>
              <span class="text-[#DDD]">|</span>
              <button
                class="text-[12px] text-[#EF4444] hover:underline"
                @click="remove(item)"
              >삭제</button>
            </div>
          </div>
        </div>
      </div>
    </template>

    <!-- 등록/수정 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" @click.self="showModal = false">
        <div class="bg-white rounded-2xl w-full max-w-[500px] max-h-[90vh] overflow-y-auto">
          <div class="p-6">
            <h2 class="text-[18px] font-bold text-[#333] mb-6">
              {{ editingItem ? '시상안 수정' : '시상안 등록' }}
            </h2>

            <div class="space-y-4">
              <div>
                <label class="block text-[13px] font-medium text-[#555] mb-1">제목 *</label>
                <input
                  v-model="form.title"
                  type="text"
                  class="w-full px-3 py-2 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
                  placeholder="시상안 제목"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">대상 연도 *</label>
                  <input
                    v-model.number="form.target_year"
                    type="number"
                    min="2020"
                    max="2099"
                    class="w-full px-3 py-2 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
                  />
                </div>
                <div>
                  <label class="block text-[13px] font-medium text-[#555] mb-1">대상 월 *</label>
                  <select
                    v-model.number="form.target_month"
                    class="w-full px-3 py-2 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
                  >
                    <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
                  </select>
                </div>
              </div>

              <div>
                <label class="block text-[13px] font-medium text-[#555] mb-1">정렬 순서</label>
                <input
                  v-model.number="form.sort_order"
                  type="number"
                  min="0"
                  class="w-full px-3 py-2 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
                />
              </div>

              <div v-if="!editingItem">
                <label class="block text-[13px] font-medium text-[#555] mb-1">파일 (이미지/PDF, 여러 개 선택 가능) *</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  class="w-full text-[14px]"
                  @change="onFilesChange"
                />
                <p class="text-[11px] text-[#999] mt-1">여러 파일 선택 시 각각 별도 항목으로 등록됩니다.</p>
              </div>

              <div v-else>
                <label class="block text-[13px] font-medium text-[#555] mb-1">파일 교체 (선택)</label>
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  class="w-full text-[14px]"
                  @change="onFileChange"
                />
                <p class="text-[11px] text-[#999] mt-1">
                  현재: {{ editingItem.file_name }}
                </p>
              </div>
            </div>

            <div class="flex justify-end gap-3 mt-6">
              <button
                class="px-4 py-2 text-[14px] text-[#666] hover:text-[#333] transition-colors"
                @click="showModal = false"
              >취소</button>
              <button
                class="px-4 py-2 bg-[#FF7B22] text-white rounded-lg text-[14px] font-medium hover:bg-[#E56A10] transition-colors disabled:opacity-50"
                :disabled="saving"
                @click="save"
              >
                {{ saving ? '저장 중...' : (editingItem ? '수정' : '등록') }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 미리보기 모달 -->
    <Teleport to="body">
      <div
        v-if="previewUrl"
        class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
        @click.self="previewUrl = null"
      >
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <button
            class="absolute -top-10 right-0 text-white hover:text-[#FF7B22] transition-colors"
            @click="previewUrl = null"
          >
            <span class="material-symbols-outlined text-[28px]">close</span>
          </button>
          <img
            v-if="previewUrl && !previewUrl.includes('.pdf')"
            :src="previewUrl"
            class="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <iframe
            v-else-if="previewUrl"
            :src="previewUrl"
            class="w-[80vw] h-[85vh] rounded-lg bg-white"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
