<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="isEditMode ? '청구서 수정' : '청구서 작성'" />
      <main class="px-5 py-4 pb-8 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="loading" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          <p class="ml-3 text-[13px] text-[#999]">{{ isEditMode ? '청구 정보를 불러오는 중...' : '양식 정보를 불러오는 중...' }}</p>
        </div>

        <!-- 폼 -->
        <div v-else-if="claimStore.selectedClaimForm">
          <!-- 양식 정보 -->
          <CardSection class="mb-4">
            <div>
              <span class="text-[13px] text-[#888]">{{ claimStore.selectedClaimForm.insurance_company?.company_name }}</span>
              <p class="text-[18px] font-bold text-[#222] mt-0.5">
                {{ claimStore.selectedClaimForm.form_name }}
              </p>
              <p v-if="allFields.length > 0" class="text-[12px] text-[#999] mt-1">
                입력항목 {{ allFields.length }}개
              </p>
            </div>
          </CardSection>

          <!-- 미리보기 토글 (모바일) -->
          <button
            @click="showPreview = !showPreview"
            class="w-full bg-white border border-[#E0E0E0] text-[#555] rounded-[12px] py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform mb-4 lg:hidden"
          >
            {{ showPreview ? '입력으로 돌아가기' : '미리보기 보기' }}
          </button>

          <!-- 미리보기 (모바일에서 토글, 데스크톱에서는 항상 숨김) -->
          <div v-if="showPreview" class="mb-4 lg:hidden">
            <CardSection>
              <div class="flex justify-between items-center mb-3">
                <p class="text-[15px] font-semibold text-[#222]">미리보기</p>
                <div v-if="sortedPages.length > 1" class="flex items-center gap-2">
                  <button
                    @click="prevPage"
                    :disabled="currentPreviewPage === 0"
                    class="w-7 h-7 rounded-full bg-[#F8F8F8] flex items-center justify-center disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M15 19l-7-7 7-7" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                  <span class="text-[12px] text-[#888]">{{ currentPreviewPage + 1 }} / {{ sortedPages.length }}</span>
                  <button
                    @click="nextPage"
                    :disabled="currentPreviewPage >= sortedPages.length - 1"
                    class="w-7 h-7 rounded-full bg-[#F8F8F8] flex items-center justify-center disabled:opacity-30"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M9 5l7 7-7 7" stroke="#555" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div
                ref="previewContainerRef"
                v-if="previewImageUrl"
                class="relative bg-[#F8F8F8] rounded-[8px] overflow-hidden"
                :style="{ aspectRatio: `${previewImageWidth} / ${previewImageHeight}` }"
              >
                <img :src="previewImageUrl" :alt="claimStore.selectedClaimForm.form_name" class="w-full h-full object-contain" />
                <div
                  v-for="field in currentPageFields"
                  :key="field.form_field_id"
                  class="absolute overflow-hidden whitespace-nowrap"
                  :style="{
                    left: `${(field.x_position / previewImageWidth) * 100}%`,
                    top: `${(field.y_position / previewImageHeight) * 100}%`,
                    width: `${(field.width / previewImageWidth) * 100}%`,
                    height: `${(field.height / previewImageHeight) * 100}%`,
                    fontSize: `${Math.max(6, field.font_size * previewScale)}px`,
                    color: field.font_color,
                    lineHeight: '1.2',
                  }"
                >
                  {{ claimStore.fieldValues[field.form_field_id] || field.placeholder || field.field_label }}
                </div>
              </div>

              <div v-if="sortedPages.length > 1" class="flex justify-center gap-1.5 mt-3">
                <button
                  v-for="(page, idx) in sortedPages"
                  :key="page.form_page_id"
                  @click="currentPreviewPage = idx"
                  class="w-2 h-2 rounded-full transition-colors"
                  :class="currentPreviewPage === idx ? 'bg-[#FF7B22]' : 'bg-[#E0E0E0]'"
                ></button>
              </div>

              <p class="text-[11px] text-[#B0B0B0] mt-3 text-center">* 실제 생성되는 청구서와 다를 수 있습니다.</p>
            </CardSection>
          </div>

          <!-- 입력 폼 -->
          <form @submit.prevent="handleSubmit">
            <CardSection class="mb-4">
              <div class="flex flex-col gap-4">
                <div v-for="field in allFieldsSorted" :key="field.form_field_id">
                  <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                    {{ field.field_label }}
                    <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                  </label>

                  <input
                    v-if="field.field_type === 'text'"
                    type="text"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    :placeholder="field.placeholder"
                    :required="field.is_required"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                  />

                  <input
                    v-else-if="field.field_type === 'date'"
                    type="date"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    :required="field.is_required"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
                  />

                  <input
                    v-else-if="field.field_type === 'number'"
                    type="text"
                    inputmode="numeric"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    :placeholder="field.placeholder"
                    :required="field.is_required"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                  />

                  <input
                    v-else-if="field.field_type === 'phone'"
                    type="tel"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    placeholder="010-1234-5678"
                    :required="field.is_required"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                  />

                  <input
                    v-else-if="field.field_type === 'resident_number'"
                    type="text"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    placeholder="123456-1234567"
                    :required="field.is_required"
                    maxlength="14"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                  />

                  <textarea
                    v-else-if="field.field_type === 'textarea'"
                    :value="claimStore.fieldValues[field.form_field_id]"
                    @input="formatFieldInput(field.form_field_id, field.field_type, $event)"
                    :placeholder="field.placeholder"
                    :required="field.is_required"
                    rows="3"
                    class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors resize-none placeholder-[#B0B0B0]"
                  ></textarea>
                </div>
              </div>
            </CardSection>

            <!-- 첨부파일 -->
            <CardSection class="mb-4">
              <p class="text-[15px] font-semibold text-[#222] mb-3">첨부파일</p>

              <!-- 파일 목록 -->
              <div
                v-for="(file, i) in attachedFiles"
                :key="i"
                class="flex items-center gap-2 p-3 bg-[#F8F8F8] rounded-[8px] mb-2"
              >
                <svg class="flex-shrink-0" width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                  <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" stroke="#888" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                <span class="text-[13px] text-[#555] flex-1 truncate">{{ file.name }}</span>
                <span class="text-[12px] text-[#999] flex-shrink-0">{{ formatFileSize(file.size) }}</span>
                <button
                  type="button"
                  @click="removeFile(i)"
                  class="text-[#FF4444] text-[16px] font-bold flex-shrink-0 w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </div>

              <!-- 추가 버튼 -->
              <button
                type="button"
                @click="fileInput?.click()"
                class="w-full border-2 border-dashed border-[#DDD] rounded-[12px] py-4 text-[14px] text-[#999] active:bg-[#F8F8F8] transition-colors"
              >
                + 첨부파일 추가 (사진, 서류)
              </button>
              <input
                ref="fileInput"
                type="file"
                accept="image/*,.pdf"
                multiple
                @change="handleFileSelect"
                class="hidden"
              />
              <p class="text-[11px] text-[#B0B0B0] mt-1">JPG, PNG, PDF / 파일당 최대 10MB</p>
            </CardSection>

            <!-- 에러 메시지 -->
            <div v-if="claimStore.error" class="mb-4 p-3 bg-[#FFE5E5] rounded-[8px] text-[13px] text-[#FF0000]">
              {{ claimStore.error }}
            </div>

            <!-- 제출 버튼 -->
            <button
              type="submit"
              :disabled="!isFormValid || submitting"
              class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:bg-[#E0E0E0] disabled:text-[#999]"
            >
              {{ submitting ? '처리 중...' : (isEditMode ? '청구서 수정' : '청구서 생성') }}
            </button>
          </form>
        </div>

        <!-- 템플릿 없음 -->
        <div v-else class="text-center py-20">
          <p class="text-[15px] text-[#888]">양식 정보를 찾을 수 없습니다.</p>
          <button
            @click="goBack"
            class="mt-4 bg-[#FF7B22] text-white rounded-[12px] px-6 py-3 text-[14px] font-semibold active:scale-[0.98] transition-transform"
          >
            양식 선택으로 돌아가기
          </button>
        </div>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import type { FormPage, FormField } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'

const router = useRouter()
const route = useRoute()
const claimStore = useClaimStore()

const isEditMode = computed(() => !!route.params.claimId)
const claimId = computed(() => Number(route.params.claimId))
const templateId = computed(() => Number(route.params.templateId))
const submitting = ref(false)
const loading = ref(false)
const showPreview = ref(false)
const attachedFiles = ref<File[]>([])
const fileInput = ref<HTMLInputElement | null>(null)
const currentPreviewPage = ref(0)
const previewContainerRef = ref<HTMLDivElement>()
const previewContainerWidth = ref(0)

// 미리보기 스케일: 컨테이너 실제 너비 / 원본 이미지 너비
const previewScale = computed(() => {
  if (!previewContainerWidth.value || !previewImageWidth.value) return 0.15
  return previewContainerWidth.value / previewImageWidth.value
})

// 컨테이너 크기 추적
let resizeObserver: ResizeObserver | null = null

watch(previewContainerRef, (el) => {
  resizeObserver?.disconnect()
  if (el) {
    resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        previewContainerWidth.value = entry.contentRect.width
      }
    })
    resizeObserver.observe(el)
  }
})

const sortedPages = computed<FormPage[]>(() => {
  if (!claimStore.selectedClaimForm?.form_pages) return []
  return [...claimStore.selectedClaimForm.form_pages].sort((a, b) => a.page_number - b.page_number)
})

const allFields = computed<FormField[]>(() => {
  if (!sortedPages.value.length) {
    return claimStore.selectedClaimForm?.form_fields || []
  }
  return sortedPages.value.flatMap(page => page.form_fields || [])
})

// 페이지 순서 → 필드 순서로 정렬된 flat 배열 (입력 폼용)
const allFieldsSorted = computed<FormField[]>(() => {
  if (!sortedPages.value.length) {
    return [...(claimStore.selectedClaimForm?.form_fields || [])].sort((a, b) => a.field_order - b.field_order)
  }
  return sortedPages.value.flatMap(page =>
    [...(page.form_fields || [])].sort((a: FormField, b: FormField) => a.field_order - b.field_order)
  )
})

const currentPageData = computed(() => {
  if (!sortedPages.value.length) return null
  return sortedPages.value[currentPreviewPage.value] || sortedPages.value[0]
})

const currentPageFields = computed<FormField[]>(() => {
  if (!currentPageData.value) {
    return claimStore.selectedClaimForm?.form_fields || []
  }
  return (currentPageData.value.form_fields || []).sort((a: FormField, b: FormField) => a.field_order - b.field_order)
})

const isFormValid = computed(() => {
  const requiredFields = allFields.value.filter(f => f.is_required)
  return requiredFields.every(field => {
    const value = claimStore.fieldValues[field.form_field_id]
    return value && value.trim().length > 0
  })
})

const isSinglePageTemplate = computed(() => {
  return !sortedPages.value.length && claimStore.selectedClaimForm?.template_image_url
})

const previewImageUrl = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedClaimForm?.template_image_url
  }
  return currentPageData.value?.page_image_url
})

const previewImageWidth = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedClaimForm?.image_width || 1
  }
  return currentPageData.value?.image_width || 1
})

const previewImageHeight = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedClaimForm?.image_height || 1
  }
  return currentPageData.value?.image_height || 1
})

onMounted(async () => {
  loading.value = true
  try {
    if (isEditMode.value) {
      // 수정 모드: 청구 상세 조회 → 템플릿 로드 → 필드값 프리필
      await claimStore.fetchClaimDetail(claimId.value)
      const claim = claimStore.currentClaim
      if (claim?.claim_form) {
        await claimStore.fetchClaimFormDetail(claim.claim_form.claim_form_id)
        // 기존 필드값으로 프리필
        if (claim.field_values) {
          claim.field_values.forEach((fv: any) => {
            if (fv.form_field_id) {
              claimStore.setFieldValue(fv.form_field_id, fv.field_value || '')
            }
          })
        }
      }
    } else {
      // 생성 모드: 양식 상세 조회
      await claimStore.fetchClaimFormDetail(templateId.value)
    }
  } finally {
    loading.value = false
  }
})

onUnmounted(() => {
  resizeObserver?.disconnect()
})

function formatFieldInput(fieldId: number, fieldType: string, event: Event) {
  const target = event.target as HTMLInputElement
  let value = target.value

  switch (fieldType) {
    case 'phone':
      value = value.replace(/[^0-9]/g, '')
      if (value.length > 3 && value.length <= 7) {
        value = value.slice(0, 3) + '-' + value.slice(3)
      } else if (value.length > 7) {
        value = value.slice(0, 3) + '-' + value.slice(3, 7) + '-' + value.slice(7, 11)
      }
      break
    case 'resident_number':
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

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name}은(는) 10MB를 초과합니다.`)
        continue
      }
      attachedFiles.value.push(file)
    }
    input.value = ''
  }
}

function removeFile(index: number) {
  attachedFiles.value.splice(index, 1)
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / (1024 * 1024)).toFixed(1) + 'MB'
}

async function handleSubmit() {
  if (!isFormValid.value) return

  submitting.value = true
  try {
    let claim
    if (isEditMode.value) {
      claim = await claimStore.updateClaim(claimId.value)
    } else {
      claim = await claimStore.createClaim()
    }
    if (claim) {
      // 첨부파일 업로드
      for (const file of attachedFiles.value) {
        await claimStore.uploadDocument(claim.claim_id, file)
      }
      router.push(`/claims/${claim.claim_id}`)
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
