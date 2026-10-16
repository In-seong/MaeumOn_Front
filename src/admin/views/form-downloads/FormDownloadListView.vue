<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchFormDownloads,
  createFormDownload,
  updateFormDownload,
  deleteFormDownload,
  getFormDownloadUrl,
} from '../../services/adminApi'
import type { FormDownloadItem } from '../../types'

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
  if (!confirm(`"${item.company_name}" 양식을 삭제하시겠습니까?`)) return
  await deleteFormDownload(item.id)
  await loadItems()
}

async function download(item: FormDownloadItem, type: 'claim' | 'dental') {
  const res = await getFormDownloadUrl(item.id, type)
  const { url } = res.data.data
  window.open(url, '_blank')
}

onMounted(loadItems)
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[20px] font-bold text-[#333]">양식 다운로드 관리</h1>
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
                <th class="text-center px-4 py-3 text-[#777] font-medium w-40">청구서</th>
                <th class="text-center px-4 py-3 text-[#777] font-medium w-40">치과확인서</th>
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
                  <button class="text-[#FF7B22] hover:underline text-[13px] mr-3" @click="openEditModal(item)">수정</button>
                  <button class="text-[#EF4444] hover:underline text-[13px]" @click="remove(item)">삭제</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 등록/수정 모달 -->
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
  </div>
</template>
