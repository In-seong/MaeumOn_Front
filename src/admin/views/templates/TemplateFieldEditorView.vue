<template>
  <div class="h-screen flex flex-col bg-gray-100 dark:bg-gray-900">
    <!-- 헤더 -->
    <div class="bg-white dark:bg-gray-800 shadow px-4 py-3 flex justify-between items-center">
      <div class="flex items-center">
        <router-link to="/templates" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-xl font-bold text-gray-900 dark:text-white">
          {{ store.currentTemplate?.name || '필드 편집기' }}
        </h1>
      </div>

      <div class="flex items-center gap-2">
        <button
          @click="handleAddField"
          :disabled="!store.currentPage"
          class="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          필드 추가
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {{ saving ? '저장 중...' : '저장' }}
        </button>
      </div>
    </div>

    <!-- 페이지 탭 바 -->
    <div class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
      <div class="flex items-center gap-2 overflow-x-auto">
        <span class="text-sm text-gray-500 dark:text-gray-400 mr-2">페이지:</span>

        <!-- 페이지 탭들 -->
        <button
          v-for="page in store.sortedPages"
          :key="page.id"
          @click="selectPage(page)"
          class="px-4 py-2 text-sm rounded-lg transition-colors whitespace-nowrap flex items-center gap-2"
          :class="store.currentPage?.id === page.id
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'"
        >
          <span>{{ page.page_number }}페이지</span>
          <span v-if="!page.page_image_url" class="text-xs opacity-70">(이미지 없음)</span>
          <!-- 페이지 삭제 버튼 -->
          <button
            v-if="store.sortedPages.length > 1"
            @click.stop="handleDeletePage(page.id)"
            class="ml-1 w-4 h-4 rounded-full hover:bg-red-500 hover:text-white text-xs flex items-center justify-center"
          >
            ×
          </button>
        </button>

        <!-- 페이지 추가 버튼 -->
        <button
          @click="handleAddPage"
          class="px-3 py-2 text-sm bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 flex items-center gap-1"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          페이지 추가
        </button>
      </div>
    </div>

    <div v-if="store.loading" class="flex-1 flex items-center justify-center">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
    </div>

    <!-- 페이지가 없는 경우 -->
    <div v-else-if="store.sortedPages.length === 0" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-4">페이지가 없습니다.</p>
        <button
          @click="handleAddPage"
          class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          첫 페이지 추가하기
        </button>
      </div>
    </div>

    <!-- 현재 페이지에 이미지가 없는 경우 -->
    <div v-else-if="store.currentPage && !store.currentPage.page_image_url" class="flex-1 flex items-center justify-center">
      <div class="text-center">
        <p class="text-gray-500 dark:text-gray-400 mb-4">{{ store.currentPage.page_number }}페이지에 이미지가 없습니다.</p>
        <label class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer inline-block">
          이미지 업로드
          <input
            type="file"
            accept="image/*"
            class="hidden"
            @change="handlePageImageUpload"
          />
        </label>
      </div>
    </div>

    <div v-else-if="store.currentPage" class="flex-1 flex overflow-hidden">
      <!-- 캔버스 영역 -->
      <div class="flex-1 overflow-auto p-4">
        <div
          ref="canvasRef"
          class="relative bg-white shadow-lg mx-auto"
          :style="{
            width: (store.currentPage.image_width || 800) + 'px',
            height: (store.currentPage.image_height || 1000) + 'px',
          }"
          @click.self="handleCanvasClick"
        >
          <!-- 배경 이미지 -->
          <img
            :src="store.currentPage.page_image_url"
            :alt="`${store.currentTemplate?.name} - ${store.currentPage.page_number}페이지`"
            class="absolute inset-0 w-full h-full object-contain pointer-events-none"
          />

          <!-- 드래그 가능한 필드들 (현재 페이지 필드만 표시) -->
          <div
            v-for="field in store.currentPageFields"
            :key="field.id"
            class="absolute cursor-move border-2 rounded transition-colors"
            :class="[
              store.selectedField?.id === field.id
                ? 'border-blue-500 bg-blue-100/50'
                : 'border-purple-400 bg-purple-100/30 hover:border-purple-500'
            ]"
            :style="{
              left: field.x_position + 'px',
              top: field.y_position + 'px',
              width: field.width + 'px',
              height: field.height + 'px',
              fontSize: field.font_size + 'px',
              color: field.font_color,
            }"
            @mousedown="startDrag($event, field)"
            @click.stop="selectField(field)"
          >
            <div class="px-1 truncate">{{ field.field_label }}</div>

            <!-- 리사이즈 핸들 -->
            <div
              v-if="store.selectedField?.id === field.id"
              class="absolute bottom-0 right-0 w-3 h-3 bg-blue-500 cursor-se-resize"
              @mousedown.stop="startResize($event, field)"
            ></div>

            <!-- 삭제 버튼 -->
            <button
              v-if="store.selectedField?.id === field.id"
              class="absolute -top-3 -right-3 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
              @click.stop="handleDeleteField(field.id)"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      <!-- 속성 패널 -->
      <div class="w-80 bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 overflow-y-auto">
        <div class="p-4">
          <!-- 페이지 정보 -->
          <div class="mb-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              현재 페이지: {{ store.currentPage.page_number }} / {{ store.sortedPages.length }}
            </h3>
            <label class="block">
              <span class="text-xs text-gray-500 dark:text-gray-400">페이지 이미지 변경</span>
              <input
                type="file"
                accept="image/*"
                class="mt-1 block w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                @change="handlePageImageUpload"
              />
            </label>
          </div>

          <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            {{ store.selectedField ? '필드 속성' : '필드를 선택하세요' }}
          </h2>

          <div v-if="store.selectedField" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">필드명</label>
              <input
                v-model="editForm.field_name"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">라벨</label>
              <input
                v-model="editForm.field_label"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">타입</label>
              <select
                v-model="editForm.field_type"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              >
                <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">
                  {{ opt.label }}
                </option>
              </select>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">X</label>
                <input
                  v-model.number="editForm.x_position"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Y</label>
                <input
                  v-model.number="editForm.y_position"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">너비</label>
                <input
                  v-model.number="editForm.width"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">높이</label>
                <input
                  v-model.number="editForm.height"
                  type="number"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
            </div>

            <div class="grid grid-cols-2 gap-2">
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">글꼴 크기</label>
                <input
                  v-model.number="editForm.font_size"
                  type="number"
                  min="8"
                  max="72"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                />
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">색상</label>
                <input
                  v-model="editForm.font_color"
                  type="color"
                  class="w-full h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">플레이스홀더</label>
              <input
                v-model="editForm.placeholder"
                type="text"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
              />
            </div>

            <div>
              <label class="flex items-center">
                <input
                  v-model="editForm.is_required"
                  type="checkbox"
                  class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">필수 입력</span>
              </label>
            </div>

            <button
              @click="applyFieldChanges"
              class="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              속성 적용
            </button>
          </div>

          <!-- 필드 목록 -->
          <div class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 class="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              현재 페이지 필드 ({{ store.currentPageFields.length }}개)
            </h3>
            <ul class="space-y-1">
              <li
                v-for="field in store.currentPageFields"
                :key="field.id"
                class="px-2 py-1 text-sm rounded cursor-pointer"
                :class="store.selectedField?.id === field.id ? 'bg-blue-100 dark:bg-blue-900' : 'hover:bg-gray-100 dark:hover:bg-gray-700'"
                @click="selectField(field)"
              >
                <span class="font-medium">{{ field.field_label }}</span>
                <span class="text-gray-500 text-xs ml-2">({{ field.field_name }})</span>
                <span v-if="field.is_required" class="text-red-500 text-xs ml-1">*</span>
              </li>
              <li v-if="store.currentPageFields.length === 0" class="text-gray-500 text-sm">
                이 페이지에 필드가 없습니다.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 필드 추가 모달 -->
    <div v-if="showAddModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-96 p-6">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">새 필드 추가</h3>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">필드명 *</label>
            <input
              v-model="newField.field_name"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="예: patient_name"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">라벨 *</label>
            <input
              v-model="newField.field_label"
              type="text"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="예: 환자명"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">타입</label>
            <select
              v-model="newField.field_type"
              class="w-full px-3 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option v-for="opt in fieldTypeOptions" :key="opt.value" :value="opt.value">
                {{ opt.label }}
              </option>
            </select>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="newField.is_required"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">필수 입력</span>
            </label>
          </div>
        </div>

        <div class="mt-6 flex justify-end gap-3">
          <button
            @click="showAddModal = false"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300"
          >
            취소
          </button>
          <button
            @click="submitNewField"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            추가
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useTemplateStore } from '../../stores/templateStore'
import { FIELD_TYPE_OPTIONS } from '@shared/types'
import type { TemplateField, TemplatePage } from '@shared/types'

const route = useRoute()
const store = useTemplateStore()

const canvasRef = ref<HTMLElement | null>(null)
const saving = ref(false)
const showAddModal = ref(false)

const fieldTypeOptions = FIELD_TYPE_OPTIONS

// 드래그 상태
const isDragging = ref(false)
const isResizing = ref(false)
const dragTarget = ref<TemplateField | null>(null)
const dragOffset = { x: 0, y: 0 }
const resizeStart = { width: 0, height: 0, x: 0, y: 0 }

// 새 필드 폼
const newField = reactive({
  field_name: '',
  field_label: '',
  field_type: 'text' as const,
  is_required: false,
})

// 편집 폼
const editForm = reactive({
  field_name: '',
  field_label: '',
  field_type: 'text' as const,
  x_position: 0,
  y_position: 0,
  width: 200,
  height: 30,
  font_size: 12,
  font_color: '#000000',
  placeholder: '',
  is_required: false,
})

// 선택된 필드 변경 감지
watch(() => store.selectedField, (field) => {
  if (field) {
    editForm.field_name = field.field_name
    editForm.field_label = field.field_label
    editForm.field_type = field.field_type
    editForm.x_position = field.x_position
    editForm.y_position = field.y_position
    editForm.width = field.width
    editForm.height = field.height
    editForm.font_size = field.font_size
    editForm.font_color = field.font_color
    editForm.placeholder = field.placeholder || ''
    editForm.is_required = field.is_required
  }
}, { immediate: true })

function selectField(field: TemplateField) {
  store.selectField(field)
}

function selectPage(page: TemplatePage) {
  store.selectPage(page)
}

function handleCanvasClick() {
  store.selectField(null)
}

function handleAddField() {
  newField.field_name = ''
  newField.field_label = ''
  newField.field_type = 'text'
  newField.is_required = false
  showAddModal.value = true
}

async function submitNewField() {
  if (!newField.field_name || !newField.field_label) {
    alert('필드명과 라벨은 필수입니다.')
    return
  }

  if (!store.currentPage) {
    alert('페이지를 먼저 선택해주세요.')
    return
  }

  try {
    await store.createField(Number(route.params.id), {
      ...newField,
      template_page_id: store.currentPage.id,
      x_position: 50,
      y_position: 50,
      width: 200,
      height: 30,
      font_size: 12,
      font_color: '#000000',
    })
    showAddModal.value = false
  } catch (e: any) {
    alert(e.response?.data?.message || '필드 추가에 실패했습니다.')
  }
}

async function handleDeleteField(id: number) {
  if (!confirm('이 필드를 삭제하시겠습니까?')) return

  try {
    await store.deleteField(id)
  } catch (e: any) {
    alert(e.response?.data?.message || '필드 삭제에 실패했습니다.')
  }
}

async function applyFieldChanges() {
  if (!store.selectedField) return

  try {
    await store.updateField(store.selectedField.id, editForm)
  } catch (e: any) {
    alert(e.response?.data?.message || '속성 적용에 실패했습니다.')
  }
}

async function handleSave() {
  saving.value = true
  try {
    await store.saveFieldPositions(Number(route.params.id))
    alert('저장되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

// 페이지 관련 함수
async function handleAddPage() {
  try {
    const newPage = await store.createPage(Number(route.params.id))
    store.selectPage(newPage)
  } catch (e: any) {
    alert(e.response?.data?.message || '페이지 추가에 실패했습니다.')
  }
}

async function handleDeletePage(pageId: number) {
  if (!confirm('이 페이지와 모든 필드를 삭제하시겠습니까?')) return

  try {
    await store.deletePage(Number(route.params.id), pageId)
  } catch (e: any) {
    alert(e.response?.data?.message || '페이지 삭제에 실패했습니다.')
  }
}

async function handlePageImageUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (!file || !store.currentPage) return

  try {
    await store.uploadPageImage(Number(route.params.id), store.currentPage.id, file)
  } catch (e: any) {
    alert(e.response?.data?.message || '이미지 업로드에 실패했습니다.')
  }

  // input 초기화
  input.value = ''
}

// 드래그 시작
function startDrag(event: MouseEvent, field: TemplateField) {
  if (!canvasRef.value) return

  isDragging.value = true
  dragTarget.value = field

  const rect = canvasRef.value.getBoundingClientRect()
  dragOffset.x = event.clientX - rect.left - field.x_position
  dragOffset.y = event.clientY - rect.top - field.y_position

  store.selectField(field)
  event.preventDefault()
}

// 리사이즈 시작
function startResize(event: MouseEvent, field: TemplateField) {
  isResizing.value = true
  dragTarget.value = field
  resizeStart.width = field.width
  resizeStart.height = field.height
  resizeStart.x = event.clientX
  resizeStart.y = event.clientY
}

// 마우스 이동
function handleMouseMove(event: MouseEvent) {
  if (!dragTarget.value) return

  if (isDragging.value && canvasRef.value) {
    const rect = canvasRef.value.getBoundingClientRect()
    const x = event.clientX - rect.left - dragOffset.x
    const y = event.clientY - rect.top - dragOffset.y

    // 경계 체크
    const maxX = (store.currentPage?.image_width || 0) - dragTarget.value.width
    const maxY = (store.currentPage?.image_height || 0) - dragTarget.value.height

    const newX = Math.max(0, Math.min(maxX, x))
    const newY = Math.max(0, Math.min(maxY, y))

    store.updateFieldPosition(dragTarget.value.id, newX, newY)

    // 편집 폼도 업데이트
    if (store.selectedField?.id === dragTarget.value.id) {
      editForm.x_position = Math.round(newX)
      editForm.y_position = Math.round(newY)
    }
  }

  if (isResizing.value) {
    const deltaX = event.clientX - resizeStart.x
    const deltaY = event.clientY - resizeStart.y

    store.updateFieldSize(
      dragTarget.value.id,
      resizeStart.width + deltaX,
      resizeStart.height + deltaY
    )

    // 편집 폼도 업데이트
    if (store.selectedField?.id === dragTarget.value.id) {
      editForm.width = dragTarget.value.width
      editForm.height = dragTarget.value.height
    }
  }
}

// 마우스 릴리스
function handleMouseUp() {
  isDragging.value = false
  isResizing.value = false
  dragTarget.value = null
}

onMounted(async () => {
  const templateId = Number(route.params.id)
  await store.fetchTemplate(templateId)
  await store.fetchPages(templateId)

  // 전역 마우스 이벤트 리스너
  document.addEventListener('mousemove', handleMouseMove)
  document.addEventListener('mouseup', handleMouseUp)
})

onUnmounted(() => {
  document.removeEventListener('mousemove', handleMouseMove)
  document.removeEventListener('mouseup', handleMouseUp)
  store.selectField(null)
  store.selectPage(null)
})
</script>
