<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/templates" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ isEdit ? '양식 수정' : '양식 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              보험사 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.company_id"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option value="">선택해주세요</option>
              <option v-for="company in insuranceStore.companies" :key="company.company_id" :value="company.company_id">
                {{ company.company_name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              양식명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.form_name"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 실손보험 청구서"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              설명
            </label>
            <textarea
              v-model="form.form_description"
              rows="3"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="양식에 대한 설명을 입력하세요"
            ></textarea>
          </div>

          <!-- 페이지 이미지 업로드 (생성/수정 모두 가능) -->
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              페이지 이미지 <span class="text-[#999]">(선택)</span>
            </label>

            <!-- 수정 모드: 기존 이미지 표시 -->
            <div v-if="isEdit && store.currentTemplate?.template_image_url" class="mb-4">
              <img
                :src="store.currentTemplate.template_image_url"
                alt="현재 이미지"
                class="max-w-full h-48 object-contain border border-[#E8E8E8] rounded-[12px]"
              />
              <p class="mt-1 text-[12px] text-[#999]">
                {{ store.currentTemplate.image_width }} x {{ store.currentTemplate.image_height }} px
              </p>
              <p class="mt-1 text-[12px] text-[#FF7B22]">페이지 이미지 관리는 에디터에서 진행해주세요.</p>
            </div>

            <!-- 생성 모드: 다중 이미지/PDF 업로드 -->
            <div v-if="!isEdit">
              <!-- 파일 미리보기 -->
              <div v-if="imagePreviews.length > 0" class="mb-4 flex flex-wrap gap-2">
                <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                  <!-- 이미지 미리보기 -->
                  <img v-if="preview.type === 'image'" :src="preview.url" class="w-24 h-32 object-cover border border-[#E8E8E8] rounded-[8px]" />
                  <!-- PDF 표시 -->
                  <div v-else class="w-24 h-32 border border-[#E8E8E8] rounded-[8px] flex flex-col items-center justify-center bg-red-50">
                    <svg class="w-8 h-8 text-red-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 1.5L18.5 9H13V3.5zM6 20V4h5v7h7v9H6z"/>
                      <text x="7" y="18" font-size="5" font-weight="bold" fill="currentColor">PDF</text>
                    </svg>
                    <span class="text-[11px] text-[#999] mt-1 truncate w-full text-center px-1">{{ preview.name }}</span>
                  </div>
                  <span class="absolute bottom-0 left-0 bg-black/60 text-white text-[10px] px-1 rounded-br">{{ preview.type === 'pdf' ? 'PDF' : (index + 1) + '페이지' }}</span>
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-[11px] flex items-center justify-center hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg,application/pdf"
                multiple
                @change="handleImagesSelect"
                class="block w-full text-[13px] text-[#999] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-[#FFF3ED] file:text-[#FF7B22] hover:file:bg-[#FFE8D6]"
              />
              <p class="mt-1 text-[12px] text-[#999]">JPG, PNG, PDF 형식 (최대 20MB) - PDF는 페이지별로 자동 분리됩니다</p>
            </div>

            <!-- 수정 모드: 기존 단일 이미지 업로드 (레거시 호환) -->
            <div v-if="isEdit && !store.currentTemplate?.template_image_url">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                @change="handleImageUpload"
                class="block w-full text-[13px] text-[#999] file:mr-4 file:py-2 file:px-4 file:rounded-[8px] file:border-0 file:text-[13px] file:font-medium file:bg-[#FFF3ED] file:text-[#FF7B22] hover:file:bg-[#FFE8D6]"
              />
              <p class="mt-1 text-[12px] text-[#999]">JPG, PNG 형식 (최대 10MB)</p>

              <div v-if="uploading" class="mt-2 text-[#FF7B22] text-[13px]">
                이미지 업로드 중...
              </div>
            </div>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="w-4 h-4 text-[#FF7B22] border-[#E8E8E8] rounded focus:ring-[#FF7B22]"
              />
              <span class="ml-2 text-[14px] text-[#555]">활성화</span>
            </label>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <router-link
            to="/templates"
            class="px-4 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] transition-colors text-[14px]"
          >
            취소
          </router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors text-[14px] font-medium"
          >
            {{ submitting ? '저장 중...' : '저장' }}
          </button>
        </div>

        <!-- 수정 모드에서 필드 편집 링크 (이미지 없어도 에디터 접근 가능) -->
        <div v-if="isEdit" class="mt-6 pt-6 border-t border-[#F0F0F0]">
          <router-link
            :to="`/templates/${route.params.id}/editor`"
            class="inline-flex items-center px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
          >
            <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            필드 배치 편집기 열기
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTemplateStore } from '../../stores/templateStore'
import { useInsuranceStore } from '../../stores/insuranceStore'

const route = useRoute()
const router = useRouter()
const store = useTemplateStore()
const insuranceStore = useInsuranceStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitting = ref(false)
const uploading = ref(false)

const form = ref({
  company_id: '' as string | number,
  form_name: '',
  form_description: '',
  is_active: true,
})

// 생성 시 다중 이미지/PDF 업로드를 위한 상태
const imageFiles = ref<File[]>([])
const imagePreviews = ref<{ url: string; name: string; type: 'image' | 'pdf' }[]>([])

function handleImagesSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  files.forEach(file => {
    const isPdf = file.type === 'application/pdf'
    imageFiles.value.push(file)
    imagePreviews.value.push({
      url: isPdf ? '' : URL.createObjectURL(file),
      name: file.name,
      type: isPdf ? 'pdf' : 'image',
    })
  })

  // 입력 필드 초기화 (같은 파일 다시 선택 가능하게)
  target.value = ''
}

function removeImage(index: number) {
  const preview = imagePreviews.value[index]
  if (preview && preview.type === 'image' && preview.url) {
    URL.revokeObjectURL(preview.url)
  }
  imageFiles.value.splice(index, 1)
  imagePreviews.value.splice(index, 1)
}

async function loadData() {
  await insuranceStore.fetchCompanies({ per_page: 100 })

  if (!isEdit.value) return

  loading.value = true
  try {
    const template = await store.fetchTemplate(Number(route.params.id))
    if (template) {
      form.value = {
        company_id: template.company_id,
        form_name: template.form_name,
        form_description: template.form_description || '',
        is_active: template.is_active,
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  try {
    if (isEdit.value) {
      // 수정 모드: 기존 방식 유지
      const data = {
        ...form.value,
        company_id: Number(form.value.company_id),
      }
      await store.updateTemplate(Number(route.params.id), data)
      alert('수정되었습니다.')
      router.push('/templates')
    } else {
      // 생성 모드: FormData로 이미지 포함 전송
      const formData = new FormData()
      formData.append('company_id', String(form.value.company_id))
      formData.append('form_name', form.value.form_name)
      formData.append('form_description', form.value.form_description || '')
      formData.append('is_active', form.value.is_active ? '1' : '0')

      // 이미지 파일들 추가 (Laravel 배열 형식)
      imageFiles.value.forEach((file) => {
        formData.append('images[]', file)
      })

      const newTemplate = await store.createTemplateWithImages(formData)

      // 미리보기 URL 정리
      imagePreviews.value.forEach(preview => {
        if (preview.type === 'image' && preview.url) URL.revokeObjectURL(preview.url)
      })

      // 에디터로 바로 이동
      router.push(`/templates/${newTemplate.claim_form_id}/editor`)
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

async function handleImageUpload(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  uploading.value = true
  try {
    await store.uploadImage(Number(route.params.id), file)
    alert('이미지가 업로드되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '이미지 업로드에 실패했습니다.')
  } finally {
    uploading.value = false
    target.value = ''
  }
}

onMounted(() => {
  loadData()
})
</script>
