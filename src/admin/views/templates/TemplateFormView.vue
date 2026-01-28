<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/templates" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEdit ? '양식 수정' : '양식 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              보험사 <span class="text-red-500">*</span>
            </label>
            <select
              v-model="form.insurance_company_id"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
            >
              <option value="">선택해주세요</option>
              <option v-for="company in insuranceStore.companies" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              양식명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="예: 실손보험 청구서"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              설명
            </label>
            <textarea
              v-model="form.description"
              rows="3"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="양식에 대한 설명을 입력하세요"
            ></textarea>
          </div>

          <!-- 페이지 이미지 업로드 (생성/수정 모두 가능) -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              페이지 이미지 <span class="text-gray-500">(선택)</span>
            </label>

            <!-- 수정 모드: 기존 이미지 표시 -->
            <div v-if="isEdit && store.currentTemplate?.template_image_url" class="mb-4">
              <img
                :src="store.currentTemplate.template_image_url"
                alt="현재 이미지"
                class="max-w-full h-48 object-contain border border-gray-300 rounded-lg"
              />
              <p class="mt-1 text-sm text-gray-500">
                {{ store.currentTemplate.image_width }} x {{ store.currentTemplate.image_height }} px
              </p>
              <p class="mt-1 text-sm text-blue-600">페이지 이미지 관리는 에디터에서 진행해주세요.</p>
            </div>

            <!-- 생성 모드: 다중 이미지 업로드 -->
            <div v-if="!isEdit">
              <!-- 이미지 미리보기 -->
              <div v-if="imagePreviews.length > 0" class="mb-4 flex flex-wrap gap-2">
                <div v-for="(preview, index) in imagePreviews" :key="index" class="relative">
                  <img :src="preview.url" class="w-24 h-32 object-cover border rounded" />
                  <span class="absolute bottom-0 left-0 bg-black/60 text-white text-xs px-1 rounded-br">{{ index + 1 }}페이지</span>
                  <button
                    type="button"
                    @click="removeImage(index)"
                    class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center hover:bg-red-600"
                  >
                    &times;
                  </button>
                </div>
              </div>

              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                multiple
                @change="handleImagesSelect"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p class="mt-1 text-sm text-gray-500">JPG, PNG 형식 (최대 10MB/장) - 여러 장 선택 가능, 순서대로 페이지가 생성됩니다</p>
            </div>

            <!-- 수정 모드: 기존 단일 이미지 업로드 (레거시 호환) -->
            <div v-if="isEdit && !store.currentTemplate?.template_image_url">
              <input
                type="file"
                accept="image/jpeg,image/png,image/jpg"
                @change="handleImageUpload"
                class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              <p class="mt-1 text-sm text-gray-500">JPG, PNG 형식 (최대 10MB)</p>

              <div v-if="uploading" class="mt-2 text-blue-600">
                이미지 업로드 중...
              </div>
            </div>
          </div>

          <div>
            <label class="flex items-center">
              <input
                v-model="form.is_active"
                type="checkbox"
                class="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span class="ml-2 text-sm text-gray-700 dark:text-gray-300">활성화</span>
            </label>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <router-link
            to="/templates"
            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            취소
          </router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {{ submitting ? '저장 중...' : '저장' }}
          </button>
        </div>

        <!-- 수정 모드에서 필드 편집 링크 (이미지 없어도 에디터 접근 가능) -->
        <div v-if="isEdit" class="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <router-link
            :to="`/templates/${route.params.id}/editor`"
            class="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
  insurance_company_id: '' as string | number,
  name: '',
  description: '',
  is_active: true,
})

// 생성 시 다중 이미지 업로드를 위한 상태
const imageFiles = ref<File[]>([])
const imagePreviews = ref<{ url: string; name: string }[]>([])

function handleImagesSelect(event: Event) {
  const target = event.target as HTMLInputElement
  const files = Array.from(target.files || [])

  files.forEach(file => {
    imageFiles.value.push(file)
    imagePreviews.value.push({
      url: URL.createObjectURL(file),
      name: file.name
    })
  })

  // 입력 필드 초기화 (같은 파일 다시 선택 가능하게)
  target.value = ''
}

function removeImage(index: number) {
  URL.revokeObjectURL(imagePreviews.value[index].url)
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
        insurance_company_id: template.insurance_company_id,
        name: template.name,
        description: template.description || '',
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
        insurance_company_id: Number(form.value.insurance_company_id),
      }
      await store.updateTemplate(Number(route.params.id), data)
      alert('수정되었습니다.')
      router.push('/templates')
    } else {
      // 생성 모드: FormData로 이미지 포함 전송
      const formData = new FormData()
      formData.append('insurance_company_id', String(form.value.insurance_company_id))
      formData.append('name', form.value.name)
      formData.append('description', form.value.description || '')
      formData.append('is_active', form.value.is_active ? '1' : '0')

      // 이미지 파일들 추가 (Laravel 배열 형식)
      imageFiles.value.forEach((file) => {
        formData.append('images[]', file)
      })

      const newTemplate = await store.createTemplateWithImages(formData)

      // 미리보기 URL 정리
      imagePreviews.value.forEach(preview => URL.revokeObjectURL(preview.url))

      // 에디터로 바로 이동
      router.push(`/templates/${newTemplate.id}/editor`)
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
