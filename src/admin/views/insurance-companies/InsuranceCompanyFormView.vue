<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/insurance-companies" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ isEdit ? '보험사 수정' : '보험사 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              보험사명 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.company_name"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 삼성화재"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              보험사 코드
            </label>
            <input
              v-model="form.company_code"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: SAMSUNG"
            />
            <p class="mt-1 text-[12px] text-[#999]">영문 대문자로 입력해주세요.</p>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              사업자등록번호
            </label>
            <input
              v-model="form.business_number"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 123-45-67890"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              대표자 성명
            </label>
            <input
              v-model="form.representative_name"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              주소
            </label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 서울특별시 중구 세종대로 55"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              대표 전화번호
            </label>
            <input
              v-model="form.contact_phone"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 02-1234-5678"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              팩스번호 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.fax_number"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 1588-5114"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              로고 이미지
            </label>
            <input
              v-model="form.logo_path"
              type="text"
              disabled
              class="w-full px-4 py-2.5 bg-[#F0F0F0] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#999] cursor-not-allowed"
              placeholder="이미지 업로드 기능 준비 중"
            />
            <p class="mt-1 text-[12px] text-[#999]">이미지 첨부 기능은 추후 지원 예정입니다.</p>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              홈페이지 주소
            </label>
            <input
              v-model="form.website_url"
              type="url"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: https://www.samsungfire.com"
            />
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
            to="/insurance-companies"
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
  company_name: '',
  company_code: '',
  business_number: '',
  representative_name: '',
  address: '',
  contact_phone: '',
  fax_number: '',
  logo_path: '',
  website_url: '',
  is_active: true,
})

async function loadData() {
  if (!isEdit.value) return

  loading.value = true
  try {
    const company = await store.fetchCompany(Number(route.params.id))
    if (company) {
      form.value = {
        company_name: company.company_name,
        company_code: company.company_code || '',
        business_number: company.business_number || '',
        representative_name: company.representative_name || '',
        address: company.address || '',
        contact_phone: company.contact_phone || '',
        fax_number: company.fax_number || '',
        logo_path: company.logo_path || '',
        website_url: company.website_url || '',
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
