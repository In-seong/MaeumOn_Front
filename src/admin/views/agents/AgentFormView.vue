<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/agents" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ isEdit ? '설계사 수정' : '설계사 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-5">
          <!-- 계정 정보 (등록 시에만) -->
          <template v-if="!isEdit">
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-2">
                계정 아이디 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.username"
                type="text"
                required
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
                placeholder="로그인에 사용할 아이디"
              />
            </div>

            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-2">
                비밀번호 <span class="text-red-500">*</span>
              </label>
              <input
                v-model="form.password"
                type="password"
                required
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
                placeholder="6자 이상"
              />
            </div>
          </template>

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
              사번
            </label>
            <input
              v-model="form.employee_number"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: EMP001"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              전화번호
            </label>
            <input
              v-model="form.phone"
              type="text"
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
              placeholder="예: agent@example.com"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              근무지
            </label>
            <input
              v-model="form.office_location"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 서울 강남지사"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              전문분야
            </label>
            <input
              v-model="form.specialization"
              type="text"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="예: 생명보험, 손해보험"
            />
          </div>

          <div v-if="!isEdit">
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              입사일
            </label>
            <input
              v-model="form.hire_date"
              type="date"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            />
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <router-link
            to="/agents"
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
import { useAgentStore } from '../../stores/agentStore'

const route = useRoute()
const router = useRouter()
const store = useAgentStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  username: '',
  password: '',
  name: '',
  employee_number: '',
  phone: '',
  email: '',
  office_location: '',
  specialization: '',
  hire_date: '',
})

async function loadData() {
  if (!isEdit.value) return

  loading.value = true
  try {
    const agent = await store.loadAgent(route.params.id as string)
    if (agent) {
      form.value = {
        username: '',
        password: '',
        name: agent.name || '',
        employee_number: agent.employee_number || '',
        phone: agent.phone || '',
        email: agent.email || '',
        office_location: agent.office_location || '',
        specialization: agent.specialization || '',
        hire_date: agent.hire_date || '',
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true

  const payload: Record<string, unknown> = {
    name: form.value.name,
  }

  // 등록 시에만 계정 정보 포함
  if (!isEdit.value) {
    payload.username = form.value.username
    payload.password = form.value.password
    if (form.value.hire_date) payload.hire_date = form.value.hire_date
  }

  if (form.value.employee_number) payload.employee_number = form.value.employee_number
  if (form.value.phone) payload.phone = form.value.phone
  if (form.value.email) payload.email = form.value.email
  if (form.value.office_location) payload.office_location = form.value.office_location
  if (form.value.specialization) payload.specialization = form.value.specialization

  try {
    if (isEdit.value) {
      const updated = await store.updateAgent(route.params.id as string, payload)
      alert('수정되었습니다.')
      router.push(`/agents/${updated.agent_id}`)
    } else {
      const created = await store.createAgent(payload)
      alert('등록되었습니다.')
      router.push(`/agents/${created.agent_id}`)
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
