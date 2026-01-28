<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import type { TemplatePage, TemplateField } from '@shared/types'

const router = useRouter()
const route = useRoute()
const claimStore = useClaimStore()

const templateId = computed(() => Number(route.params.templateId))
const submitting = ref(false)
const showPreview = ref(false)
const currentPreviewPage = ref(0) // 현재 미리보기 페이지 인덱스

// 정렬된 페이지 목록
const sortedPages = computed<TemplatePage[]>(() => {
  if (!claimStore.selectedTemplate?.template_pages) return []
  return [...claimStore.selectedTemplate.template_pages].sort((a, b) => a.page_number - b.page_number)
})

// 전체 필드 (페이지별 그룹화된 형태로)
const allFieldsGroupedByPage = computed(() => {
  if (!sortedPages.value.length) {
    // 페이지가 없으면 기존 방식 (직접 필드 목록 사용)
    const fields = claimStore.selectedTemplate?.template_fields || []
    return [{ page: null, fields: [...fields].sort((a, b) => a.sort_order - b.sort_order) }]
  }

  return sortedPages.value.map(page => ({
    page,
    fields: (page.template_fields || []).sort((a: TemplateField, b: TemplateField) => a.sort_order - b.sort_order)
  }))
})

// 전체 필드 플랫 목록 (유효성 검사용)
const allFields = computed<TemplateField[]>(() => {
  if (!sortedPages.value.length) {
    return claimStore.selectedTemplate?.template_fields || []
  }
  return sortedPages.value.flatMap(page => page.template_fields || [])
})

// 현재 미리보기 페이지 데이터
const currentPageData = computed(() => {
  if (!sortedPages.value.length) return null
  return sortedPages.value[currentPreviewPage.value] || sortedPages.value[0]
})

// 현재 미리보기 페이지의 필드들
const currentPageFields = computed<TemplateField[]>(() => {
  if (!currentPageData.value) {
    // 단일 페이지 (레거시)
    return claimStore.selectedTemplate?.template_fields || []
  }
  return (currentPageData.value.template_fields || []).sort((a: TemplateField, b: TemplateField) => a.sort_order - b.sort_order)
})

// 폼 유효성 검사
const isFormValid = computed(() => {
  const requiredFields = allFields.value.filter(f => f.is_required)
  return requiredFields.every(field => {
    const value = claimStore.fieldValues[field.id]
    return value && value.trim().length > 0
  })
})

// 단일 페이지 템플릿인지 (레거시 호환)
const isSinglePageTemplate = computed(() => {
  return !sortedPages.value.length && claimStore.selectedTemplate?.template_image_url
})

// 미리보기용 이미지 URL
const previewImageUrl = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedTemplate?.template_image_url
  }
  return currentPageData.value?.page_image_url
})

// 미리보기용 이미지 크기
const previewImageWidth = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedTemplate?.image_width || 1
  }
  return currentPageData.value?.image_width || 1
})

const previewImageHeight = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedTemplate?.image_height || 1
  }
  return currentPageData.value?.image_height || 1
})

onMounted(async () => {
  await claimStore.fetchTemplateDetail(templateId.value)
})

onUnmounted(() => {
  // 컴포넌트 해제 시 상태 초기화하지 않음 (뒤로가기 시 데이터 유지)
})

function formatFieldInput(fieldId: number, fieldType: string, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value

  // 필드 타입별 포맷팅
  switch (fieldType) {
    case 'phone':
      // 전화번호 포맷: 010-1234-5678
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3)
      } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
      }
      break
    case 'resident_number':
      // 주민등록번호 포맷: 123456-1234567
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 6) {
        value = value.slice(0, 6) + '-' + value.slice(6, 13)
      }
      break
    case 'number':
      value = value.replace(/[^0-9]/g, '')
      break
  }

  claimStore.setFieldValue(fieldId, value)
}

async function handleSubmit() {
  if (!isFormValid.value) return

  submitting.value = true
  try {
    const claim = await claimStore.createClaim()
    if (claim) {
      router.push(`/claims/${claim.id}`)
    }
  } finally {
    submitting.value = false
  }
}

function goBack() {
  claimStore.resetClaimForm()
  router.push('/claims/new')
}

function prevPage() {
  if (currentPreviewPage.value > 0) {
    currentPreviewPage.value--
  }
}

function nextPage() {
  if (currentPreviewPage.value < sortedPages.value.length - 1) {
    currentPreviewPage.value++
  }
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <!-- 헤더 -->
      <div class="mb-6">
        <button @click="goBack" class="text-purple-600 hover:text-purple-700 flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          양식 선택으로
        </button>
      </div>

      <!-- 로딩 -->
      <div v-if="claimStore.loadingTemplates" class="text-center py-20">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
        <p class="mt-4 text-gray-500">양식 정보를 불러오는 중...</p>
      </div>

      <!-- 폼 -->
      <div v-else-if="claimStore.selectedTemplate" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 입력 폼 -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div class="mb-4">
            <h1 class="text-xl font-bold text-gray-900 dark:text-white">
              {{ claimStore.selectedTemplate.name }}
            </h1>
            <p class="text-sm text-gray-500 dark:text-gray-400">
              {{ claimStore.selectedTemplate.insurance_company?.name }}
              <span v-if="sortedPages.length > 1" class="ml-2 text-purple-500">
                ({{ sortedPages.length }}페이지)
              </span>
            </p>
          </div>

          <form @submit.prevent="handleSubmit" class="space-y-6">
            <!-- 페이지별 필드 그룹 -->
            <div
              v-for="(group, groupIndex) in allFieldsGroupedByPage"
              :key="groupIndex"
              class="space-y-4"
            >
              <!-- 페이지 헤더 (다중 페이지인 경우) -->
              <div v-if="group.page && sortedPages.length > 1" class="border-b border-gray-200 dark:border-gray-700 pb-2 mb-4">
                <h3 class="text-sm font-semibold text-purple-600 dark:text-purple-400">
                  {{ group.page.page_number }}페이지
                </h3>
              </div>

              <!-- 필드 목록 -->
              <div v-for="field in group.fields" :key="field.id">
                <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  {{ field.field_label }}
                  <span v-if="field.is_required" class="text-red-500">*</span>
                </label>

                <!-- 텍스트 입력 -->
                <input
                  v-if="field.field_type === 'text'"
                  type="text"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  :placeholder="field.placeholder"
                  :required="field.is_required"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <!-- 날짜 입력 -->
                <input
                  v-else-if="field.field_type === 'date'"
                  type="date"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  :required="field.is_required"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <!-- 숫자 입력 -->
                <input
                  v-else-if="field.field_type === 'number'"
                  type="text"
                  inputmode="numeric"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  :placeholder="field.placeholder"
                  :required="field.is_required"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <!-- 전화번호 입력 -->
                <input
                  v-else-if="field.field_type === 'phone'"
                  type="tel"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  placeholder="010-1234-5678"
                  :required="field.is_required"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <!-- 주민등록번호 입력 -->
                <input
                  v-else-if="field.field_type === 'resident_number'"
                  type="text"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  placeholder="123456-1234567"
                  :required="field.is_required"
                  maxlength="14"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />

                <!-- 여러 줄 텍스트 -->
                <textarea
                  v-else-if="field.field_type === 'textarea'"
                  :value="claimStore.fieldValues[field.id]"
                  @input="formatFieldInput(field.id, field.field_type, $event)"
                  :placeholder="field.placeholder"
                  :required="field.is_required"
                  rows="3"
                  class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                ></textarea>
              </div>

              <div v-if="group.fields.length === 0" class="text-sm text-gray-400 py-2">
                이 페이지에는 입력 필드가 없습니다.
              </div>
            </div>

            <!-- 에러 메시지 -->
            <div v-if="claimStore.error" class="p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              {{ claimStore.error }}
            </div>

            <!-- 제출 버튼 -->
            <div class="flex gap-3 pt-4">
              <button
                type="button"
                @click="showPreview = !showPreview"
                class="flex-1 px-4 py-2 border border-purple-500 text-purple-600 rounded-md hover:bg-purple-50 transition-colors lg:hidden"
              >
                {{ showPreview ? '입력으로' : '미리보기' }}
              </button>
              <button
                type="submit"
                :disabled="!isFormValid || submitting"
                class="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                {{ submitting ? '처리 중...' : '청구서 생성' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 미리보기 -->
        <div
          :class="[
            'bg-white dark:bg-gray-800 rounded-lg shadow p-6',
            'lg:block',
            showPreview ? 'block' : 'hidden'
          ]"
        >
          <div class="flex justify-between items-center mb-4">
            <h2 class="text-lg font-semibold text-gray-900 dark:text-white">미리보기</h2>

            <!-- 페이지 네비게이션 (다중 페이지인 경우) -->
            <div v-if="sortedPages.length > 1" class="flex items-center gap-2">
              <button
                @click="prevPage"
                :disabled="currentPreviewPage === 0"
                class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span class="text-sm text-gray-600 dark:text-gray-400">
                {{ currentPreviewPage + 1 }} / {{ sortedPages.length }}
              </span>
              <button
                @click="nextPage"
                :disabled="currentPreviewPage >= sortedPages.length - 1"
                class="p-1 rounded hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          <div
            v-if="previewImageUrl"
            class="relative bg-gray-100 rounded overflow-hidden"
            :style="{
              aspectRatio: `${previewImageWidth} / ${previewImageHeight}`
            }"
          >
            <img
              :src="previewImageUrl"
              :alt="claimStore.selectedTemplate.name"
              class="w-full h-full object-contain"
            />

            <!-- 필드 값 오버레이 (현재 페이지의 필드만) -->
            <div
              v-for="field in currentPageFields"
              :key="field.id"
              class="absolute text-xs overflow-hidden whitespace-nowrap"
              :style="{
                left: `${(field.x_position / previewImageWidth) * 100}%`,
                top: `${(field.y_position / previewImageHeight) * 100}%`,
                width: `${(field.width / previewImageWidth) * 100}%`,
                height: `${(field.height / previewImageHeight) * 100}%`,
                fontSize: `${Math.max(8, field.font_size * 0.3)}px`,
                color: field.font_color,
              }"
            >
              {{ claimStore.fieldValues[field.id] || field.placeholder || field.field_label }}
            </div>
          </div>

          <p v-else class="text-gray-500 text-center py-8">
            양식 이미지가 없습니다.
          </p>

          <!-- 페이지 점 네비게이션 (다중 페이지인 경우) -->
          <div v-if="sortedPages.length > 1" class="flex justify-center gap-2 mt-4">
            <button
              v-for="(page, idx) in sortedPages"
              :key="page.id"
              @click="currentPreviewPage = idx"
              class="w-2 h-2 rounded-full transition-colors"
              :class="currentPreviewPage === idx ? 'bg-purple-500' : 'bg-gray-300 hover:bg-gray-400'"
            ></button>
          </div>

          <p class="text-xs text-gray-400 mt-4 text-center">
            * 실제 생성되는 청구서와 다를 수 있습니다.
          </p>
        </div>
      </div>

      <!-- 템플릿 없음 -->
      <div v-else class="text-center py-20">
        <p class="text-gray-500">양식 정보를 찾을 수 없습니다.</p>
        <button
          @click="goBack"
          class="mt-4 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600"
        >
          양식 선택으로 돌아가기
        </button>
      </div>
    </div>
  </div>
</template>
