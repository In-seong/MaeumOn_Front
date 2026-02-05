<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="청구서 작성" />
      <main class="px-5 py-4 pb-8 overflow-y-auto" style="height: calc(100vh - 56px);">
        <!-- 로딩 -->
        <div v-if="claimStore.loadingTemplates" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
          <p class="ml-3 text-[13px] text-[#999]">양식 정보를 불러오는 중...</p>
        </div>

        <!-- 폼 -->
        <div v-else-if="claimStore.selectedTemplate">
          <!-- 양식 정보 -->
          <CardSection class="mb-4">
            <div>
              <span class="text-[13px] text-[#888]">{{ claimStore.selectedTemplate.insurance_company?.name }}</span>
              <p class="text-[18px] font-bold text-[#222] mt-0.5">
                {{ claimStore.selectedTemplate.name }}
              </p>
              <p v-if="sortedPages.length > 1" class="text-[12px] text-[#FF7B22] mt-1">
                {{ sortedPages.length }}페이지
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
                v-if="previewImageUrl"
                class="relative bg-[#F8F8F8] rounded-[8px] overflow-hidden"
                :style="{ aspectRatio: `${previewImageWidth} / ${previewImageHeight}` }"
              >
                <img :src="previewImageUrl" :alt="claimStore.selectedTemplate.name" class="w-full h-full object-contain" />
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

              <div v-if="sortedPages.length > 1" class="flex justify-center gap-1.5 mt-3">
                <button
                  v-for="(page, idx) in sortedPages"
                  :key="page.id"
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
            <div
              v-for="(group, groupIndex) in allFieldsGroupedByPage"
              :key="groupIndex"
              class="mb-4"
            >
              <p v-if="group.page && sortedPages.length > 1" class="text-[13px] font-semibold text-[#FF7B22] mb-2">
                {{ group.page.page_number }}페이지
              </p>

              <CardSection>
                <div class="flex flex-col gap-4">
                  <div v-for="field in group.fields" :key="field.id">
                    <label class="block text-[13px] font-medium text-[#888] mb-1.5">
                      {{ field.field_label }}
                      <span v-if="field.is_required" class="text-[#FF0000]">*</span>
                    </label>

                    <input
                      v-if="field.field_type === 'text'"
                      type="text"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      :placeholder="field.placeholder"
                      :required="field.is_required"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                    />

                    <input
                      v-else-if="field.field_type === 'date'"
                      type="date"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      :required="field.is_required"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors"
                    />

                    <input
                      v-else-if="field.field_type === 'number'"
                      type="text"
                      inputmode="numeric"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      :placeholder="field.placeholder"
                      :required="field.is_required"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                    />

                    <input
                      v-else-if="field.field_type === 'phone'"
                      type="tel"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      placeholder="010-1234-5678"
                      :required="field.is_required"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                    />

                    <input
                      v-else-if="field.field_type === 'resident_number'"
                      type="text"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      placeholder="123456-1234567"
                      :required="field.is_required"
                      maxlength="14"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors placeholder-[#B0B0B0]"
                    />

                    <textarea
                      v-else-if="field.field_type === 'textarea'"
                      :value="claimStore.fieldValues[field.id]"
                      @input="formatFieldInput(field.id, field.field_type, $event)"
                      :placeholder="field.placeholder"
                      :required="field.is_required"
                      rows="3"
                      class="w-full px-4 py-3 bg-[#F8F8F8] rounded-[12px] text-[14px] text-[#333] outline-none border border-[#E8E8E8] focus:border-[#FF7B22] transition-colors resize-none placeholder-[#B0B0B0]"
                    ></textarea>
                  </div>

                  <div v-if="group.fields.length === 0" class="text-[13px] text-[#999] py-2 text-center">
                    이 페이지에는 입력 필드가 없습니다.
                  </div>
                </div>
              </CardSection>
            </div>

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
              {{ submitting ? '처리 중...' : '청구서 생성' }}
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import type { TemplatePage, TemplateField } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'

const router = useRouter()
const route = useRoute()
const claimStore = useClaimStore()

const templateId = computed(() => Number(route.params.templateId))
const submitting = ref(false)
const showPreview = ref(false)
const currentPreviewPage = ref(0)

const sortedPages = computed<TemplatePage[]>(() => {
  if (!claimStore.selectedTemplate?.template_pages) return []
  return [...claimStore.selectedTemplate.template_pages].sort((a, b) => a.page_number - b.page_number)
})

const allFieldsGroupedByPage = computed(() => {
  if (!sortedPages.value.length) {
    const fields = claimStore.selectedTemplate?.template_fields || []
    return [{ page: null, fields: [...fields].sort((a, b) => a.sort_order - b.sort_order) }]
  }

  return sortedPages.value.map(page => ({
    page,
    fields: (page.template_fields || []).sort((a: TemplateField, b: TemplateField) => a.sort_order - b.sort_order)
  }))
})

const allFields = computed<TemplateField[]>(() => {
  if (!sortedPages.value.length) {
    return claimStore.selectedTemplate?.template_fields || []
  }
  return sortedPages.value.flatMap(page => page.template_fields || [])
})

const currentPageData = computed(() => {
  if (!sortedPages.value.length) return null
  return sortedPages.value[currentPreviewPage.value] || sortedPages.value[0]
})

const currentPageFields = computed<TemplateField[]>(() => {
  if (!currentPageData.value) {
    return claimStore.selectedTemplate?.template_fields || []
  }
  return (currentPageData.value.template_fields || []).sort((a: TemplateField, b: TemplateField) => a.sort_order - b.sort_order)
})

const isFormValid = computed(() => {
  const requiredFields = allFields.value.filter(f => f.is_required)
  return requiredFields.every(field => {
    const value = claimStore.fieldValues[field.id]
    return value && value.trim().length > 0
  })
})

const isSinglePageTemplate = computed(() => {
  return !sortedPages.value.length && claimStore.selectedTemplate?.template_image_url
})

const previewImageUrl = computed(() => {
  if (isSinglePageTemplate.value) {
    return claimStore.selectedTemplate?.template_image_url
  }
  return currentPageData.value?.page_image_url
})

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
