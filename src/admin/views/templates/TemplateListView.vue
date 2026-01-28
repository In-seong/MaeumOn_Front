<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">양식 템플릿 관리</h1>
      <router-link
        to="/templates/create"
        class="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        양식 등록
      </router-link>
    </div>

    <!-- 검색 및 필터 -->
    <div class="mb-4 flex gap-4">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="양식명으로 검색"
        class="flex-1 px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @input="debouncedSearch"
      />
      <select
        v-model="companyFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @change="fetchData"
      >
        <option value="">전체 보험사</option>
        <option v-for="company in insuranceStore.companies" :key="company.id" :value="company.id">
          {{ company.name }}
        </option>
      </select>
      <select
        v-model="activeFilter"
        class="px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        @change="fetchData"
      >
        <option value="">전체 상태</option>
        <option value="true">활성화</option>
        <option value="false">비활성화</option>
      </select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2 text-gray-600 dark:text-gray-400">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
      {{ store.error }}
    </div>

    <!-- 카드 그리드 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in store.templates"
        :key="template.id"
        class="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden"
      >
        <!-- 썸네일 -->
        <div class="h-40 bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img
            v-if="template.template_image_url"
            :src="template.template_image_url"
            :alt="template.name"
            class="max-w-full max-h-full object-contain"
          />
          <span v-else class="text-gray-400">이미지 없음</span>
        </div>

        <!-- 정보 -->
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-lg font-semibold text-gray-900 dark:text-white">{{ template.name }}</h3>
            <span
              :class="template.is_active ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'"
              class="px-2 py-1 text-xs font-medium rounded-full"
            >
              {{ template.is_active ? '활성화' : '비활성화' }}
            </span>
          </div>

          <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {{ template.insurance_company?.name || '-' }}
          </p>

          <p class="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
            {{ template.description || '설명 없음' }}
          </p>

          <div class="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
            <span>필드 {{ template.template_fields_count || 0 }}개</span>
            <span>{{ formatDate(template.created_at) }}</span>
          </div>
        </div>

        <!-- 액션 -->
        <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 flex justify-end gap-2">
          <router-link
            :to="`/templates/${template.id}/editor`"
            class="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
            title="이미지 및 필드 배치 관리"
          >
            에디터
          </router-link>
          <router-link
            :to="`/templates/${template.id}/edit`"
            class="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            title="보험사, 양식명, 설명 수정"
          >
            정보 수정
          </router-link>
          <button
            @click="handleDelete(template)"
            class="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
          >
            삭제
          </button>
        </div>
      </div>

      <div v-if="store.templates.length === 0" class="col-span-full text-center py-10 text-gray-500 dark:text-gray-400">
        등록된 양식 템플릿이 없습니다.
      </div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="store.pagination && store.pagination.last_page > 1" class="mt-6">
      <div class="flex justify-center gap-2">
        <button
          v-for="page in store.pagination.last_page"
          :key="page"
          @click="goToPage(page)"
          :class="[
            'px-3 py-1 rounded',
            page === store.pagination.current_page
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600'
          ]"
        >
          {{ page }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTemplateStore } from '../../stores/templateStore'
import { useInsuranceStore } from '../../stores/insuranceStore'
import type { ClaimFormTemplate } from '@shared/types'

const store = useTemplateStore()
const insuranceStore = useInsuranceStore()

const searchQuery = ref('')
const companyFilter = ref('')
const activeFilter = ref('')

let searchTimeout: ReturnType<typeof setTimeout>

function debouncedSearch() {
  clearTimeout(searchTimeout)
  searchTimeout = setTimeout(() => {
    fetchData()
  }, 300)
}

async function fetchData(page = 1) {
  await store.fetchTemplates({
    search: searchQuery.value || undefined,
    insurance_company_id: companyFilter.value ? Number(companyFilter.value) : undefined,
    is_active: activeFilter.value ? activeFilter.value === 'true' : undefined,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR')
}

async function handleDelete(template: ClaimFormTemplate) {
  if (!confirm(`"${template.name}" 양식을 삭제하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteTemplate(template.id)
    alert('삭제되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(async () => {
  await insuranceStore.fetchCompanies({ per_page: 100 })
  await fetchData()
})
</script>
