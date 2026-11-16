<template>
  <div class="space-y-4">
    <h3 class="text-[16px] font-bold text-[#222]">고객 정보 입력</h3>
    <p class="text-[13px] text-[#888]">숨은 보험금을 조회할 고객의 정보를 입력해주세요.</p>

    <!-- 기존 고객 검색 -->
    <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-4">
      <label class="block text-[12px] text-[#888] mb-2">기존 고객 검색</label>
      <div class="relative">
        <input
          v-model="searchQuery"
          type="text"
          placeholder="이름 또는 전화번호로 검색"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] pr-10"
          @input="onSearch"
        />
        <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#BBB]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
      </div>
      <div v-if="searchResults.length > 0" class="mt-2 border border-[#E8E8E8] rounded-[10px] max-h-[200px] overflow-y-auto">
        <button
          v-for="c in searchResults"
          :key="c.customer_id"
          class="w-full text-left px-3 py-2.5 border-b border-[#F0F0F0] last:border-b-0 hover:bg-[#FFF8F3] transition-colors"
          @click="selectCustomer(c)"
        >
          <span class="text-[14px] text-[#333] font-medium">{{ c.name }}</span>
          <span class="text-[12px] text-[#999] ml-2">{{ c.phone }}</span>
        </button>
      </div>
    </div>

    <!-- 구분선 -->
    <div class="flex items-center gap-3">
      <div class="flex-1 h-px bg-[#E8E8E8]" />
      <span class="text-[12px] text-[#BBB]">또는 직접 입력</span>
      <div class="flex-1 h-px bg-[#E8E8E8]" />
    </div>

    <!-- 직접 입력 폼 -->
    <div class="bg-white rounded-[14px] border border-[#E8E8E8] p-4 space-y-3">
      <div>
        <label class="block text-[12px] text-[#888] mb-1">이름 <span class="text-red-400">*</span></label>
        <input
          v-model="form.customer_name"
          type="text"
          placeholder="홍길동"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
        />
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">전화번호 <span class="text-red-400">*</span></label>
        <input
          v-model="form.customer_phone"
          type="tel"
          placeholder="010-0000-0000"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
        />
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">생년월일 <span class="text-red-400">*</span></label>
        <input
          v-model="form.customer_birth_date"
          type="date"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
        />
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">성별</label>
        <div class="flex gap-2">
          <button
            v-for="g in genderOptions"
            :key="g.value"
            :class="[
              'flex-1 py-2.5 rounded-[10px] text-[13px] font-medium border transition-colors',
              form.customer_gender === g.value ? 'border-[#FF7B22] bg-[#FFF8F3] text-[#FF7B22]' : 'border-[#E0E0E0] text-[#888]'
            ]"
            @click="form.customer_gender = g.value"
          >
            {{ g.label }}
          </button>
        </div>
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">통신사</label>
        <select
          v-model="form.customer_telecom"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] bg-white"
        >
          <option value="">선택</option>
          <option v-for="t in telecomOptions" :key="t" :value="t">{{ t }}</option>
        </select>
      </div>

      <div>
        <label class="block text-[12px] text-[#888] mb-1">주소</label>
        <input
          v-model="form.customer_address"
          type="text"
          placeholder="주소"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] mb-2"
        />
        <input
          v-model="form.customer_detailed_address"
          type="text"
          placeholder="상세주소"
          class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import type { Customer } from '../../types'
import { fetchCustomers } from '../../services/agentApi'

interface CustomerForm {
  customer_id?: string
  customer_name: string
  customer_phone: string
  customer_birth_date: string
  customer_gender: string
  customer_telecom: string
  customer_address: string
  customer_detailed_address: string
}

const props = defineProps<{
  modelValue: CustomerForm
}>()

const emit = defineEmits<{
  'update:modelValue': [value: CustomerForm]
}>()

const form = reactive<CustomerForm>({ ...props.modelValue })

watch(form, (val) => {
  emit('update:modelValue', { ...val })
}, { deep: true })

watch(() => props.modelValue, (val) => {
  Object.assign(form, val)
}, { deep: true })

const searchQuery = ref('')
const searchResults = ref<Customer[]>([])
let searchTimer: ReturnType<typeof setTimeout> | null = null

const genderOptions = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
]

const telecomOptions = ['SKT', 'KT', 'LGU+', 'SKT알뜰폰', 'KT알뜰폰', 'LGU+알뜰폰']

function onSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  if (!searchQuery.value || searchQuery.value.length < 2) {
    searchResults.value = []
    return
  }
  searchTimer = setTimeout(async () => {
    try {
      const res = await fetchCustomers({ search: searchQuery.value, per_page: 10 })
      searchResults.value = res.data.data.data
    } catch {
      searchResults.value = []
    }
  }, 300)
}

function selectCustomer(c: Customer) {
  form.customer_id = c.customer_id
  form.customer_name = c.name
  form.customer_phone = c.phone
  form.customer_birth_date = c.birth_date ?? ''
  form.customer_gender = c.gender ?? ''
  form.customer_telecom = c.telecom ?? ''
  form.customer_address = c.address ?? ''
  form.customer_detailed_address = c.detailed_address ?? ''
  searchQuery.value = ''
  searchResults.value = []
}
</script>
