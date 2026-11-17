<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchPopupNotices, createPopupNotice, updatePopupNotice, deletePopupNotice } from '../../services/adminApi'
import type { PopupNoticeItem } from '../../services/adminApi'

const notices = ref<PopupNoticeItem[]>([])
const loading = ref(false)
const showForm = ref(false)
const editingId = ref<number | null>(null)

const form = ref({
  title: '',
  link_url: '',
  start_date: '',
  end_date: '',
  sort_order: 0,
  is_active: true,
})
const imageFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)
const existingPreview = ref<string | null>(null)
const saving = ref(false)

onMounted(() => loadNotices())

async function loadNotices() {
  loading.value = true
  try {
    const res = await fetchPopupNotices()
    notices.value = res.data.data
  } catch {
    notices.value = []
  } finally {
    loading.value = false
  }
}

function openAdd() {
  editingId.value = null
  form.value = { title: '', link_url: '', start_date: '', end_date: '', sort_order: 0, is_active: true }
  imageFile.value = null
  imagePreview.value = null
  existingPreview.value = null
  showForm.value = true
}

function openEdit(n: PopupNoticeItem) {
  editingId.value = n.popup_notice_id
  form.value = {
    title: n.title,
    link_url: n.link_url ?? '',
    start_date: n.start_date,
    end_date: n.end_date,
    sort_order: n.sort_order,
    is_active: n.is_active,
  }
  imageFile.value = null
  imagePreview.value = null
  existingPreview.value = n.image_url
  showForm.value = true
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return
  imageFile.value = file
  imagePreview.value = URL.createObjectURL(file)
}

function formatDate(d: string): string {
  if (!d) return '-'
  return d.slice(0, 10)
}

function isActive(n: PopupNoticeItem): boolean {
  if (!n.is_active) return false
  const today = new Date().toISOString().slice(0, 10)
  return n.start_date <= today && today <= n.end_date
}

async function save() {
  if (!form.value.title.trim()) return alert('제목을 입력하세요.')
  if (!form.value.start_date || !form.value.end_date) return alert('시작일/종료일을 입력하세요.')
  if (!editingId.value && !imageFile.value) return alert('이미지를 선택하세요.')

  saving.value = true
  try {
    const fd = new FormData()
    fd.append('title', form.value.title)
    fd.append('start_date', form.value.start_date)
    fd.append('end_date', form.value.end_date)
    fd.append('sort_order', String(form.value.sort_order))
    fd.append('is_active', form.value.is_active ? '1' : '0')
    if (form.value.link_url) fd.append('link_url', form.value.link_url)
    if (imageFile.value) fd.append('image', imageFile.value)

    if (editingId.value) {
      await updatePopupNotice(editingId.value, fd)
    } else {
      await createPopupNotice(fd)
    }

    showForm.value = false
    await loadNotices()
  } catch {
    alert('저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function remove(id: number) {
  if (!confirm('이 팝업 공지를 삭제하시겠습니까?')) return
  try {
    await deletePopupNotice(id)
    await loadNotices()
  } catch {
    alert('삭제에 실패했습니다.')
  }
}
</script>

<template>
  <div class="p-6">
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-xl font-bold">팝업 공지 관리</h1>
        <p class="text-xs text-gray-400 mt-1">설계사 앱 메인 화면에 노출되는 이미지 팝업</p>
      </div>
      <button
        class="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
        @click="openAdd"
      >
        + 팝업 추가
      </button>
    </div>

    <div v-if="loading" class="text-center py-10 text-gray-400">불러오는 중...</div>
    <div v-else-if="notices.length === 0" class="text-center py-10 text-gray-400">등록된 팝업 공지가 없습니다.</div>

    <table v-else class="w-full text-sm">
      <thead>
        <tr class="border-b text-left text-gray-500">
          <th class="py-3 px-3 w-16">순서</th>
          <th class="py-3 px-3">제목</th>
          <th class="py-3 px-3 w-24">미리보기</th>
          <th class="py-3 px-3 w-28">시작일</th>
          <th class="py-3 px-3 w-28">종료일</th>
          <th class="py-3 px-3 w-20 text-center">상태</th>
          <th class="py-3 px-3 w-28 text-center">관리</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="n in notices" :key="n.popup_notice_id" class="border-b hover:bg-gray-50">
          <td class="py-3 px-3 text-gray-500">{{ n.sort_order }}</td>
          <td class="py-3 px-3 font-medium">{{ n.title }}</td>
          <td class="py-3 px-3">
            <img v-if="n.image_url" :src="n.image_url" class="w-16 h-16 object-cover rounded-lg" />
            <span v-else class="text-gray-300">-</span>
          </td>
          <td class="py-3 px-3 text-gray-500">{{ formatDate(n.start_date) }}</td>
          <td class="py-3 px-3 text-gray-500">{{ formatDate(n.end_date) }}</td>
          <td class="py-3 px-3 text-center">
            <span
              class="text-[11px] px-2 py-0.5 rounded-full"
              :class="isActive(n) ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'"
            >
              {{ isActive(n) ? '노출중' : n.is_active ? '대기' : '비활성' }}
            </span>
          </td>
          <td class="py-3 px-3 text-center">
            <button class="text-blue-600 hover:underline mr-3" @click="openEdit(n)">수정</button>
            <button class="text-red-500 hover:underline" @click="remove(n.popup_notice_id)">삭제</button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- 추가/수정 모달 -->
    <div v-if="showForm" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50" @click.self="showForm = false">
      <div class="bg-white rounded-2xl w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <h2 class="text-lg font-bold mb-4">{{ editingId ? '팝업 공지 수정' : '팝업 공지 추가' }}</h2>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">제목</label>
            <input v-model="form.title" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="팝업 제목" />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">이미지</label>
            <input type="file" accept="image/*" class="w-full text-sm" @change="onFileChange" />
          </div>

          <div v-if="imagePreview || existingPreview">
            <label class="block text-sm font-medium text-gray-600 mb-1">미리보기</label>
            <div class="border-2 border-dashed border-gray-200 rounded-xl overflow-hidden bg-gray-50 mx-auto" style="max-width:300px;">
              <img :src="imagePreview || existingPreview || ''" class="w-full object-contain" />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 mb-1">링크 URL (선택)</label>
            <input v-model="form.link_url" class="w-full border rounded-lg px-3 py-2 text-sm" placeholder="https://..." />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">시작일</label>
              <input v-model="form.start_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-1">종료일</label>
              <input v-model="form.end_date" type="date" class="w-full border rounded-lg px-3 py-2 text-sm" />
            </div>
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
  </div>
</template>
