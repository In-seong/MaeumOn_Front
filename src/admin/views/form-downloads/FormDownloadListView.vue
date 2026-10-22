<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchFormDownloads,
  createFormDownload,
  updateFormDownload,
  deleteFormDownload,
  getFormDownloadUrl,
  fetchAwardPlans,
  createAwardPlan,
  deleteAwardPlan,
} from '../../services/adminApi'
import type { FormDownloadItem, AwardPlanItem } from '../../types'

// ===== 보험사 목록 =====
const items = ref<FormDownloadItem[]>([])
const loading = ref(false)
const showModal = ref(false)
const editingItem = ref<FormDownloadItem | null>(null)

const categoryLabels: Record<string, string> = {
  'non-life': '손해보험',
  'life': '생명보험',
  'cooperative': '공제조합',
}

const categoryOrder = ['non-life', 'life', 'cooperative'] as const

const groupedItems = computed(() => {
  const groups: Record<string, FormDownloadItem[]> = {}
  for (const cat of categoryOrder) {
    groups[cat] = items.value.filter(i => i.category === cat)
  }
  return groups
})

const form = ref({
  company_name: '',
  category: '' as string,
  sort_order: 0,
  claim_form: null as File | null,
  dental_confirm: null as File | null,
  remove_claim_form: false,
  remove_dental_confirm: false,
})

async function loadItems() {
  loading.value = true
  try {
    const res = await fetchFormDownloads()
    items.value = res.data.data
  } finally {
    loading.value = false
  }
}

function openCreateModal() {
  editingItem.value = null
  form.value = {
    company_name: '',
    category: 'non-life',
    sort_order: 0,
    claim_form: null,
    dental_confirm: null,
    remove_claim_form: false,
    remove_dental_confirm: false,
  }
  showModal.value = true
}

function openEditModal(item: FormDownloadItem) {
  editingItem.value = item
  form.value = {
    company_name: item.company_name,
    category: item.category,
    sort_order: item.sort_order,
    claim_form: null,
    dental_confirm: null,
    remove_claim_form: false,
    remove_dental_confirm: false,
  }
  showModal.value = true
}

function onFileChange(e: Event, field: 'claim_form' | 'dental_confirm') {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    form.value[field] = file
    if (field === 'claim_form') form.value.remove_claim_form = false
    if (field === 'dental_confirm') form.value.remove_dental_confirm = false
  }
}

const saving = ref(false)

async function save() {
  if (!form.value.company_name || !form.value.category) return
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('company_name', form.value.company_name)
    fd.append('category', form.value.category)
    fd.append('sort_order', String(form.value.sort_order))
    if (form.value.claim_form) fd.append('claim_form', form.value.claim_form)
    if (form.value.dental_confirm) fd.append('dental_confirm', form.value.dental_confirm)

    if (editingItem.value) {
      if (form.value.remove_claim_form) fd.append('remove_claim_form', '1')
      if (form.value.remove_dental_confirm) fd.append('remove_dental_confirm', '1')
      fd.append('_method', 'POST')
      await updateFormDownload(editingItem.value.id, fd)
    } else {
      await createFormDownload(fd)
    }
    showModal.value = false
    await loadItems()
  } finally {
    saving.value = false
  }
}

async function remove(item: FormDownloadItem) {
  if (!confirm(`"${item.company_name}" 보험사와 연결된 모든 시상안도 함께 삭제됩니다. 삭제하시겠습니까?`)) return
  await deleteFormDownload(item.id)
  await loadItems()
}

async function download(item: FormDownloadItem, type: 'claim' | 'dental') {
  const res = await getFormDownloadUrl(item.id, type)
  const { url } = res.data.data
  window.open(url, '_blank')
}

// ===== 시상안 관리 (보험사별) =====
const showAwardModal = ref(false)
const awardCompany = ref<FormDownloadItem | null>(null)
const awardItems = ref<AwardPlanItem[]>([])
const awardLoading = ref(false)

const now = new Date()
const awardYear = ref(now.getFullYear())
const awardMonth = ref(now.getMonth() + 1)

const awardForm = ref({
  title: '',
  target_year: now.getFullYear(),
  target_month: now.getMonth() + 1,
  files: [] as File[],
})

const awardSaving = ref(false)
const awardPreviewUrl = ref<string | null>(null)

async function openAwardModal(item: FormDownloadItem) {
  awardCompany.value = item
  awardYear.value = now.getFullYear()
  awardMonth.value = now.getMonth() + 1
  awardForm.value = {
    title: '',
    target_year: now.getFullYear(),
    target_month: now.getMonth() + 1,
    files: [],
  }
  showAwardModal.value = true
  await loadAwardItems()
}

async function loadAwardItems() {
  if (!awardCompany.value) return
  awardLoading.value = true
  try {
    const res = await fetchAwardPlans({
      form_download_id: awardCompany.value.id,
      year: awardYear.value,
      month: awardMonth.value,
    })
    awardItems.value = res.data.data
  } finally {
    awardLoading.value = false
  }
}

function awardPrevMonth() {
  if (awardMonth.value === 1) {
    awardYear.value--
    awardMonth.value = 12
  } else {
    awardMonth.value--
  }
  loadAwardItems()
}

function awardNextMonth() {
  if (awardMonth.value === 12) {
    awardYear.value++
    awardMonth.value = 1
  } else {
    awardMonth.value++
  }
  loadAwardItems()
}

function onAwardFilesChange(e: Event) {
  const target = e.target as HTMLInputElement
  if (target.files) {
    awardForm.value.files = Array.from(target.files)
  }
}

async function saveAward() {
  if (!awardCompany.value || !awardForm.value.title || awardForm.value.files.length === 0) return
  awardSaving.value = true
  try {
    const fd = new FormData()
    fd.append('form_download_id', String(awardCompany.value.id))
    fd.append('title', awardForm.value.title)
    fd.append('target_year', String(awardForm.value.target_year))
    fd.append('target_month', String(awardForm.value.target_month))
    for (const file of awardForm.value.files) {
      fd.append('files[]', file)
    }
    await createAwardPlan(fd)
    awardForm.value = {
      title: '',
      target_year: awardYear.value,
      target_month: awardMonth.value,
      files: [],
    }
    await Promise.all([loadAwardItems(), loadItems()])
  } finally {
    awardSaving.value = false
  }
}

async function removeAward(ap: AwardPlanItem) {
  if (!confirm(`"${ap.title}" 시상안을 삭제하시겠습니까?`)) return
  await deleteAwardPlan(ap.id)
  await Promise.all([loadAwardItems(), loadItems()])
}

onMounted(loadItems)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">다운로드 파일관리</h1>
      <button
        class="px-4 py-2 bg-[#FF7B22] text-white rounded-lg text-[14px] font-medium hover:bg-[#E56A10] transition-colors"
        @click="openCreateModal"
      >
        + 보험사 추가
      </button>
    </div>

    <div v-if="loading" class="text-center py-20 text-[#999]">불러오는 중...</div>

    <template v-else>
      <div v-for="cat in categoryOrder" :key="cat" class="mb-8">
        <h2 class="text-[16px] font-bold text-[#555] mb-3 flex items-center gap-2">
          <span class="w-1 h-5 rounded-full" :class="{
            'bg-[#3B82F6]': cat === 'non-life',
            'bg-[#10B981]': cat === 'life',
            'bg-[#8B5CF6]': cat === 'cooperative',
          }" />
          {{ categoryLabels[cat] }}
          <span class="text-[13px] text-[#999] font-normal">({{ groupedItems[cat]?.length || 0 }})</span>
        </h2>

        <div v-if="!groupedItems[cat]?.length" class="bg-white rounded-xl border border-[#E8E8E8] p-6 text-center text-[14px] text-[#999]">
          등록된 보험사가 없습니다.
        </div>

        <div v-else class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden">
          <table class="w-full text-[14px]">
            <thead>
              <tr class="bg-[#F9F9F9] border-b border-[#E8E8E8]">
                <th class="text-left px-4 py-3 text-[#777] font-medium w-12">순서</th>
                <th class="text-left px-4 py-3 text-[#777] font-medium">보험사명</th>
                <th class="text-center px-4 py-3 text-[#777] font-medium w-36">청구서</th>
                <th class="text-center px-4 py-3 text-[#777] font-medium w-36">치과확인서</th>
                <th class="text-center px-4 py-3 text-[#777] font-medium w-28">시상안</th>
                <th class="text-center px-4 py-3 text-[#777] font-medium w-32">관리</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in groupedItems[cat]"
                :key="item.id"
                class="border-b border-[#F0F0F0] last:border-0 hover:bg-[#FAFAFA]"
              >
                <td class="px-4 py-3 text-[#999]">{{ item.sort_order }}</td>
                <td class="px-4 py-3 font-medium text-[#333]">{{ item.company_name }}</td>
                <td class="px-4 py-3 text-center">
                  <template v-if="item.claim_form_path">
                    <button
                      class="text-[#3B82F6] hover:underline text-[13px]"
                      @click="download(item, 'claim')"
                    >
                      {{ item.claim_form_name || '다운로드' }}
                    </button>
                  </template>
                  <span v-else class="text-[#CCC]">-</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <template v-if="item.dental_confirm_path">
                    <button
                      class="text-[#3B82F6] hover:underline text-[13px]"
                      @click="download(item, 'dental')"
                    >
                      {{ item.dental_confirm_name || '다운로드' }}
                    </button>
                  </template>
                  <span v-else class="text-[#CCC]">-</span>
                </td>
                <td class="px-4 py-3 text-center">
                  <button
                    class="inline-flex items-center gap-1 px-2.5 py-1 bg-[#FFF7ED] text-[#FF7B22] rounded-lg text-[13px] font-medium hover:bg-[#FFEDD5] transition-colors"
                    @click="openAwardModal(item)"
                  >
                    <span class="material-symbols-outlined text-[14px]">emoji_events</span>
                    {{ (item as any).award_plans_count || 0 }}건
                  </button>
                </td>
                <td class="px-4 py-3 text-center">
                  <button class="text-[#FF7B22] hover:underline text-[13px] mr-3" @click="openEditModal(item)">수정</button>
                  <button class="text-[#EF4444] hover:underline text-[13px]" @click="remove(item)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 보험사 등록/수정 모달 -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showModal = false" />
        <div class="relative bg-white rounded-2xl w-full max-w-[500px] mx-4 shadow-xl">
          <div class="px-6 py-5 border-b border-[#E8E8E8]">
            <h3 class="text-[18px] font-bold text-[#333]">
              {{ editingItem ? '양식 수정' : '보험사 추가' }}
            </h3>
          </div>
          <div class="px-6 py-5 space-y-4">
            <div>
              <label class="block text-[13px] text-[#777] mb-1">보험사명 *</label>
              <input
                v-model="form.company_name"
                type="text"
                class="w-full px-3 py-2.5 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
                placeholder="예: 삼성화재"
              />
            </div>
            <div>
              <label class="block text-[13px] text-[#777] mb-1">분류 *</label>
              <select
                v-model="form.category"
                class="w-full px-3 py-2.5 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
              >
                <option value="non-life">손해보험</option>
                <option value="life">생명보험</option>
                <option value="cooperative">공제조합</option>
              </select>
            </div>
            <div>
              <label class="block text-[13px] text-[#777] mb-1">정렬 순서</label>
              <input
                v-model.number="form.sort_order"
                type="number"
                min="0"
                class="w-full px-3 py-2.5 border border-[#DDD] rounded-lg text-[14px] focus:outline-none focus:border-[#FF7B22]"
              />
            </div>
            <div>
              <label class="block text-[13px] text-[#777] mb-1">청구서 파일 (PDF/JPG/PNG)</label>
              <div v-if="editingItem?.claim_form_name && !form.remove_claim_form && !form.claim_form" class="flex items-center gap-2 mb-2">
                <span class="text-[13px] text-[#555]">{{ editingItem.claim_form_name }}</span>
                <button class="text-[12px] text-[#EF4444] hover:underline" @click="form.remove_claim_form = true">삭제</button>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onFileChange($event, 'claim_form')" class="text-[13px]" />
            </div>
            <div>
              <label class="block text-[13px] text-[#777] mb-1">치과확인서 파일 (PDF/JPG/PNG)</label>
              <div v-if="editingItem?.dental_confirm_name && !form.remove_dental_confirm && !form.dental_confirm" class="flex items-center gap-2 mb-2">
                <span class="text-[13px] text-[#555]">{{ editingItem.dental_confirm_name }}</span>
                <button class="text-[12px] text-[#EF4444] hover:underline" @click="form.remove_dental_confirm = true">삭제</button>
              </div>
              <input type="file" accept=".pdf,.jpg,.jpeg,.png" @change="onFileChange($event, 'dental_confirm')" class="text-[13px]" />
            </div>
          </div>
          <div class="px-6 py-4 border-t border-[#E8E8E8] flex justify-end gap-3">
            <button
              class="px-4 py-2.5 border border-[#DDD] rounded-lg text-[14px] text-[#555] hover:bg-[#F5F5F5]"
              @click="showModal = false"
            >
              취소
            </button>
            <button
              class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-lg text-[14px] font-medium hover:bg-[#E56A10] disabled:opacity-50"
              :disabled="saving || !form.company_name || !form.category"
              @click="save"
            >
              {{ saving ? '저장 중...' : (editingItem ? '수정' : '등록') }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 시상안 관리 모달 (보험사별) -->
    <Teleport to="body">
      <div v-if="showAwardModal && awardCompany" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="showAwardModal = false" />
        <div class="relative bg-white rounded-2xl w-full max-w-[700px] mx-4 shadow-xl max-h-[90vh] flex flex-col">
          <div class="px-6 py-5 border-b border-[#E8E8E8] flex items-center justify-between shrink-0">
            <h3 class="text-[18px] font-bold text-[#333]">
              {{ awardCompany.company_name }} — 시상안 관리
            </h3>
            <button @click="showAwardModal = false" class="text-[#999] hover:text-[#333]">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>

          <div class="flex-1 overflow-y-auto">
            <!-- 등록 폼 -->
            <div class="px-6 py-4 bg-[#FAFAFA] border-b border-[#E8E8E8]">
              <h4 class="text-[14px] font-bold text-[#555] mb-3">시상안 등록</h4>
              <div class="grid grid-cols-[1fr_100px_100px] gap-3 mb-3">
                <input
                  v-model="awardForm.title"
                  type="text"
                  class="px-3 py-2 border border-[#DDD] rounded-lg text-[13px] focus:outline-none focus:border-[#FF7B22]"
                  placeholder="제목 (예: 2026년 10월 시상안)"
                />
                <select
                  v-model.number="awardForm.target_year"
                  class="px-2 py-2 border border-[#DDD] rounded-lg text-[13px] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option v-for="y in 10" :key="y" :value="2020 + y">{{ 2020 + y }}년</option>
                </select>
                <select
                  v-model.number="awardForm.target_month"
                  class="px-2 py-2 border border-[#DDD] rounded-lg text-[13px] focus:outline-none focus:border-[#FF7B22]"
                >
                  <option v-for="m in 12" :key="m" :value="m">{{ m }}월</option>
                </select>
              </div>
              <div class="flex items-center gap-3">
                <input
                  type="file"
                  accept=".jpg,.jpeg,.png,.pdf"
                  multiple
                  class="text-[13px] flex-1"
                  @change="onAwardFilesChange"
                />
                <button
                  class="px-4 py-2 bg-[#FF7B22] text-white rounded-lg text-[13px] font-medium hover:bg-[#E56A10] disabled:opacity-50 shrink-0"
                  :disabled="awardSaving || !awardForm.title || awardForm.files.length === 0"
                  @click="saveAward"
                >
                  {{ awardSaving ? '업로드 중...' : '등록' }}
                </button>
              </div>
            </div>

            <!-- 월 네비게이션 -->
            <div class="px-6 py-3 flex items-center gap-3 border-b border-[#E8E8E8]">
              <button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]" @click="awardPrevMonth">
                <span class="material-symbols-outlined text-[18px] text-[#666]">chevron_left</span>
              </button>
              <span class="text-[14px] font-bold text-[#333] min-w-[100px] text-center">
                {{ awardYear }}년 {{ awardMonth }}월
              </span>
              <button class="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#F5F5F5]" @click="awardNextMonth">
                <span class="material-symbols-outlined text-[18px] text-[#666]">chevron_right</span>
              </button>
              <span class="text-[12px] text-[#999]">({{ awardItems.length }}건)</span>
            </div>

            <!-- 시상안 목록 -->
            <div class="px-6 py-4">
              <div v-if="awardLoading" class="text-center py-10 text-[#999] text-[14px]">불러오는 중...</div>
              <div v-else-if="!awardItems.length" class="text-center py-10 text-[#999] text-[14px]">
                해당 월에 등록된 시상안이 없습니다.
              </div>
              <div v-else class="grid grid-cols-3 gap-3">
                <div
                  v-for="ap in awardItems"
                  :key="ap.id"
                  class="bg-white rounded-xl border border-[#E8E8E8] overflow-hidden group"
                >
                  <div
                    class="aspect-[3/4] bg-[#F5F5F5] flex items-center justify-center cursor-pointer relative overflow-hidden"
                    @click="awardPreviewUrl = ap.file_url"
                  >
                    <img
                      v-if="ap.thumbnail_url"
                      :src="ap.thumbnail_url"
                      :alt="ap.title"
                      class="w-full h-full object-cover"
                    />
                    <span v-else class="material-symbols-outlined text-[36px] text-[#CCC]">description</span>
                    <div class="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                  </div>
                  <div class="p-2.5 flex items-start justify-between gap-1">
                    <div class="min-w-0">
                      <p class="text-[12px] font-medium text-[#333] truncate">{{ ap.title }}</p>
                      <p class="text-[11px] text-[#999] truncate">{{ ap.file_name }}</p>
                    </div>
                    <button
                      class="text-[#EF4444] hover:underline text-[11px] shrink-0"
                      @click="removeAward(ap)"
                    >삭제</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 시상안 미리보기 -->
    <Teleport to="body">
      <div
        v-if="awardPreviewUrl"
        class="fixed inset-0 bg-black/80 z-[60] flex items-center justify-center p-4"
        @click.self="awardPreviewUrl = null"
      >
        <div class="relative max-w-[90vw] max-h-[90vh]">
          <button
            class="absolute -top-10 right-0 text-white hover:text-[#FF7B22] transition-colors"
            @click="awardPreviewUrl = null"
          >
            <span class="material-symbols-outlined text-[28px]">close</span>
          </button>
          <img
            v-if="awardPreviewUrl && !awardPreviewUrl.includes('.pdf')"
            :src="awardPreviewUrl"
            class="max-w-full max-h-[85vh] object-contain rounded-lg"
          />
          <iframe
            v-else-if="awardPreviewUrl"
            :src="awardPreviewUrl"
            class="w-[80vw] h-[85vh] rounded-lg bg-white"
          />
        </div>
      </div>
    </Teleport>
  </div>
</template>
