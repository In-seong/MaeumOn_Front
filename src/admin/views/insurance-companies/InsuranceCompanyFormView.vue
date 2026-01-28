<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/insurance-companies" class="text-gray-500 hover:text-gray-700 dark:text-gray-400 mr-4">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEdit ? '보험사 수정' : '보험사 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div class="space-y-6">
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              보험사명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="예: 삼성화재"
            />
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              보험사 코드 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.code"
              type="text"
              required
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="예: SAMSUNG"
            />
            <p class="mt-1 text-sm text-gray-500 dark:text-gray-400">영문 대문자로 입력해주세요.</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              팩스번호
            </label>
            <input
              v-model="form.fax_number"
              type="text"
              class="w-full px-4 py-2 border border-gray-300 rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="예: 1588-5114"
            />
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
            to="/insurance-companies"
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
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useInsuranceStore } from '../../stores/insuranceStore'

const route = useRoute()
const router = useRouter()
const store = useInsuranceStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  code: '',
  fax_number: '',
  is_active: true,
})

async function loadData() {
  if (!isEdit.value) return

  loading.value = true
  try {
    const company = await store.fetchCompany(Number(route.params.id))
    if (company) {
      form.value = {
        name: company.name,
        code: company.code,
        fax_number: company.fax_number || '',
        is_active: company.is_active,
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
      await store.updateCompany(Number(route.params.id), form.value)
      alert('수정되었습니다.')
    } else {
      await store.createCompany(form.value)
      alert('등록되었습니다.')
    }
    router.push('/insurance-companies')
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
