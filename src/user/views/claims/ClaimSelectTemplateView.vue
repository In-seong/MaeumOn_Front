<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'

const router = useRouter()
const claimStore = useClaimStore()

const selectedCompanyId = ref<number | null>(null)

onMounted(async () => {
  await claimStore.fetchInsuranceCompanies()
})

watch(selectedCompanyId, async (newId) => {
  if (newId) {
    await claimStore.fetchTemplates(newId)
  } else {
    claimStore.templates = []
  }
})

function selectTemplate(templateId: number) {
  router.push(`/claims/new/${templateId}`)
}
</script>

<template>
  <div class="min-h-screen bg-gray-100 dark:bg-gray-900">
    <div class="container mx-auto px-4 py-8">
      <div class="mb-6">
        <router-link to="/" class="text-purple-600 hover:text-purple-700 flex items-center">
          <svg class="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          홈으로
        </router-link>
      </div>

      <h1 class="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        보험 청구서 작성
      </h1>

      <!-- Step 1: 보험사 선택 -->
      <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          1. 보험사 선택
        </h2>

        <div v-if="claimStore.loadingCompanies" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        <div v-else class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          <button
            v-for="company in claimStore.insuranceCompanies"
            :key="company.id"
            @click="selectedCompanyId = company.id"
            :class="[
              'p-4 rounded-lg border-2 transition-all text-left',
              selectedCompanyId === company.id
                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
            ]"
          >
            <div class="font-medium text-gray-900 dark:text-white">{{ company.name }}</div>
            <div class="text-sm text-gray-500 dark:text-gray-400">{{ company.code }}</div>
            <div v-if="company.claim_form_templates_count" class="text-xs text-gray-400 mt-1">
              양식 {{ company.claim_form_templates_count }}개
            </div>
          </button>
        </div>

        <div v-if="claimStore.insuranceCompanies.length === 0 && !claimStore.loadingCompanies" class="text-center py-8 text-gray-500">
          등록된 보험사가 없습니다.
        </div>
      </div>

      <!-- Step 2: 양식 선택 -->
      <div
        v-if="selectedCompanyId"
        class="bg-white dark:bg-gray-800 rounded-lg shadow p-6"
      >
        <h2 class="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          2. 청구서 양식 선택
        </h2>

        <div v-if="claimStore.loadingTemplates" class="text-center py-8">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>

        <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="template in claimStore.templates"
            :key="template.id"
            @click="selectTemplate(template.id)"
            class="p-4 rounded-lg border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 transition-all text-left group"
          >
            <div v-if="template.template_image_url" class="mb-3 aspect-[4/3] bg-gray-100 rounded overflow-hidden">
              <img
                :src="template.template_image_url"
                :alt="template.name"
                class="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div class="font-medium text-gray-900 dark:text-white">{{ template.name }}</div>
            <div v-if="template.description" class="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {{ template.description }}
            </div>
            <div v-if="template.template_fields_count" class="text-xs text-purple-600 mt-2">
              입력 필드 {{ template.template_fields_count }}개
            </div>
          </button>
        </div>

        <div v-if="claimStore.templates.length === 0 && !claimStore.loadingTemplates" class="text-center py-8 text-gray-500">
          이 보험사에 등록된 양식이 없습니다.
        </div>
      </div>

      <!-- 에러 메시지 -->
      <div v-if="claimStore.error" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
        {{ claimStore.error }}
      </div>
    </div>
  </div>
</template>
