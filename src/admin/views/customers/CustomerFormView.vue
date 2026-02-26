<template>
  <div class="p-4 lg:p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/customers" class="text-[#999] hover:text-[#FF7B22] mr-3 lg:mr-4 transition-colors">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ isEdit ? '고객 수정' : '고객 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              이름 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.name"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 홍길동"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              전화번호 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.phone"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 010-1234-5678"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              이메일
            </label>
            <input
              v-model="form.email"
              type="email"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: example@email.com"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              주민등록번호
            </label>
            <input
              v-model="form.resident_number"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 900101-1234567"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              생년월일
            </label>
            <input
              v-model="form.birth_date"
              type="date"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              성별
            </label>
            <select
              v-model="form.gender"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option value="">선택</option>
              <option value="M">남성</option>
              <option value="F">여성</option>
              <option value="OTHER">기타</option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              주소
            </label>
            <input
              v-model="form.address"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 서울특별시 강남구 역삼동"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              상세 주소
            </label>
            <input
              v-model="form.detailed_address"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 101동 1001호"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              직업
            </label>
            <input
              v-model="form.job"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 회사원"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              통신사
            </label>
            <select
              v-model="form.telecom"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option value="">선택</option>
              <option value="SKT">SKT</option>
              <option value="KT">KT</option>
              <option value="LGU+">LGU+</option>
              <option value="SKT 알뜰폰">SKT 알뜰폰</option>
              <option value="KT 알뜰폰">KT 알뜰폰</option>
              <option value="LGU+ 알뜰폰">LGU+ 알뜰폰</option>
            </select>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              고객 취득 경로
            </label>
            <input
              v-model="form.acquisition_channel"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 병원, 지인소개, 온라인"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              담당 설계사 ID
            </label>
            <input
              v-model="form.agent_id"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: A0000001 (선택사항)"
            />
            <p class="mt-1 text-[12px] text-[#999]">설계사 ID를 입력하면 해당 설계사에게 배정됩니다.</p>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <router-link
            to="/customers"
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
import { useCustomerStore } from '../../stores/customerStore'

const route = useRoute()
const router = useRouter()
const store = useCustomerStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  name: '',
  phone: '',
  email: '',
  resident_number: '',
  birth_date: '',
  gender: '',
  address: '',
  detailed_address: '',
  job: '',
  telecom: '',
  acquisition_channel: '',
  agent_id: '',
})

async function loadData() {
  if (!isEdit.value) return

  loading.value = true
  try {
    const customer = await store.loadCustomer(route.params.id as string)
    if (customer) {
      const c = customer as any
      form.value = {
        name: customer.name || '',
        phone: customer.phone || '',
        email: customer.email || '',
        resident_number: customer.resident_number || '',
        birth_date: customer.birth_date || '',
        gender: customer.gender || '',
        address: customer.address || '',
        detailed_address: customer.detailed_address || '',
        job: customer.job || '',
        telecom: c.telecom || '',
        acquisition_channel: c.acquisition_channel || '',
        agent_id: (customer.agent_id as any) || '',
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true

  // Build payload, omitting empty optional fields
  const payload: Record<string, unknown> = {
    name: form.value.name,
    phone: form.value.phone,
  }
  if (form.value.email) payload.email = form.value.email
  if (form.value.resident_number) payload.resident_number = form.value.resident_number
  if (form.value.birth_date) payload.birth_date = form.value.birth_date
  if (form.value.gender) payload.gender = form.value.gender
  if (form.value.address) payload.address = form.value.address
  if (form.value.detailed_address) payload.detailed_address = form.value.detailed_address
  if (form.value.job) payload.job = form.value.job
  if (form.value.telecom) payload.telecom = form.value.telecom
  if (form.value.acquisition_channel) payload.acquisition_channel = form.value.acquisition_channel
  if (form.value.agent_id) payload.agent_id = form.value.agent_id

  try {
    if (isEdit.value) {
      const updated = await store.updateCustomer(route.params.id as string, payload)
      alert('수정되었습니다.')
      router.push(`/customers/${updated.customer_id}`)
    } else {
      const created = await store.createCustomer(payload)
      alert('등록되었습니다.')
      router.push(`/customers/${created.customer_id}`)
    }
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
