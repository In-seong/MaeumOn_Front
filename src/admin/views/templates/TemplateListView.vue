<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">양식 템플릿 관리</h1>
      <router-link
        to="/templates/create"
        class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
      >
        양식 등록
      </router-link>
    </div>

    <!-- 검색 및 필터 -->
    <div class="mb-4 flex gap-3">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="양식명으로 검색"
        class="flex-1 px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch"
      />
      <select
        v-model="companyFilter"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 보험사</option>
        <option v-for="company in insuranceStore.companies" :key="company.company_id" :value="company.company_id">
          {{ company.company_name }}
        </option>
      </select>
      <select
        v-model="activeFilter"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 상태</option>
        <option value="true">활성화</option>
        <option value="false">비활성화</option>
      </select>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 카드 그리드 -->
    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="template in store.templates"
        :key="template.claim_form_id"
        class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden"
      >
        <!-- 썸네일 -->
        <div class="h-40 bg-[#FAFAFA] flex items-center justify-center overflow-hidden">
          <img
            v-if="template.template_image_url"
            :src="template.template_image_url"
            :alt="template.form_name"
            class="max-w-full max-h-full object-contain"
          />
          <span v-else class="text-[#999] text-[14px]">이미지 없음</span>
        </div>

        <!-- 정보 -->
        <div class="p-4">
          <div class="flex justify-between items-start mb-2">
            <h3 class="text-[15px] font-semibold text-[#333]">{{ template.form_name }}</h3>
            <span
              :class="template.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
              class="px-2.5 py-1 text-[11px] font-medium rounded-full"
            >
              {{ template.is_active ? '활성화' : '비활성화' }}
            </span>
          </div>

          <p class="text-[13px] text-[#999] mb-2">
            {{ template.insurance_company?.company_name || '-' }}
          </p>

          <p class="text-[13px] text-[#555] line-clamp-2 mb-3">
            {{ template.form_description || '설명 없음' }}
          </p>

          <div class="flex justify-between items-center text-[12px] text-[#999]">
            <span>필드 {{ template.form_fields_count || 0 }}개</span>
            <span>{{ formatDate(template.created_at ?? '') }}</span>
          </div>
        </div>

        <!-- 액션 -->
        <div class="px-4 py-3 bg-[#FAFAFA] flex justify-end gap-2">
          <router-link
            :to="`/templates/${template.claim_form_id}/editor`"
            class="px-3 py-1.5 text-[13px] bg-[#FF7B22] text-white rounded-[8px] hover:bg-[#E56D1E] transition-colors"
            title="이미지 및 필드 배치 관리"
          >
            에디터
          </router-link>
          <router-link
            :to="`/templates/${template.claim_form_id}/edit`"
            class="px-3 py-1.5 text-[13px] bg-white border border-[#E0E0E0] text-[#555] rounded-[8px] hover:bg-[#F8F8F8] transition-colors"
            title="보험사, 양식명, 설명 수정"
          >
            정보 수정
          </router-link>
          <button
            @click="handleDelete(template)"
            class="px-3 py-1.5 text-[13px] bg-white border border-red-200 text-red-500 rounded-[8px] hover:bg-red-50 transition-colors"
          >
            삭제
          </button>
        </div>
      </div>

      <div v-if="store.templates.length === 0" class="col-span-full text-center py-10 text-[#999]">
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
            'px-3 py-1 rounded-[8px] text-[14px]',
            page === store.pagination.current_page
              ? 'bg-[#FF7B22] text-white'
              : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
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
import type { ClaimForm } from '@shared/types'

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
    company_id: companyFilter.value ? Number(companyFilter.value) : undefined,
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

async function handleDelete(template: ClaimForm) {
  if (!confirm(`"${template.form_name}" 양식을 삭제하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteTemplate(template.claim_form_id)
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
