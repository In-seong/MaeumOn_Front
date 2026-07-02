<template>
  <div class="p-6">
    <!-- 뒤로가기 + 타이틀 -->
    <div class="flex items-center gap-3 mb-6">
      <button
        class="text-[14px] text-[#888] hover:text-[#FF7B22] transition-colors"
        @click="router.push({ name: 'customer-list' })"
      >
        &larr; 고객 목록
      </button>
      <h1 class="text-[20px] font-bold text-[#333]">고객 등록</h1>
    </div>

    <form class="max-w-[900px]" @submit.prevent="handleSubmit">
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- 기본 정보 카드 -->
        <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h3 class="text-[15px] font-semibold text-[#333] mb-5">기본 정보</h3>

          <div class="flex flex-col gap-4">
            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="text-[13px] font-medium text-[#555]">이름</label>
                <span class="text-[#FF7B22] text-[12px]">*</span>
              </div>
              <input
                v-model="form.name"
                type="text"
                placeholder="고객 이름을 입력하세요"
                required
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>

            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="text-[13px] font-medium text-[#555]">연락처</label>
                <span class="text-[#FF7B22] text-[12px]">*</span>
              </div>
              <input
                :value="form.phone"
                type="tel"
                inputmode="numeric"
                placeholder="010-0000-0000"
                required
                maxlength="13"
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                @input="handlePhoneInput"
              />
            </div>

            <div>
              <div class="flex items-center gap-1 mb-1.5">
                <label class="text-[13px] font-medium text-[#555]">주민등록번호</label>
              </div>
              <input
                :value="form.resident_number"
                type="tel"
                inputmode="numeric"
                placeholder="000000-0000000"
                maxlength="14"
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                @input="handleResidentNumberInput"
              />
            </div>

            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">성별</label>
              <div class="flex gap-2">
                <button
                  v-for="g in genderOptions"
                  :key="g.value"
                  type="button"
                  class="flex-1 py-2.5 rounded-[12px] text-[14px] font-medium border transition-all hover:opacity-80"
                  :class="form.gender === g.value ? 'bg-[#FFF0E5] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                  @click="form.gender = form.gender === g.value ? '' : g.value"
                >
                  {{ g.label }}
                </button>
              </div>
            </div>

            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">생년월일</label>
              <input
                v-model="form.birth_date"
                type="date"
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
            </div>
          </div>
        </div>

        <!-- 추가 정보 카드 -->
        <div class="bg-white rounded-xl border border-[#E8E8E8] p-5">
          <h3 class="text-[15px] font-semibold text-[#333] mb-5">추가 정보</h3>

          <div class="flex flex-col gap-4">
            <FormInput
              v-model="form.email"
              label="이메일"
              type="email"
              placeholder="이메일을 입력하세요"
            />

            <FormInput
              v-model="form.address"
              label="주소"
              placeholder="주소를 입력하세요"
            />

            <FormInput
              v-model="form.detailed_address"
              label="상세주소"
              placeholder="상세주소를 입력하세요"
            />

            <FormInput
              v-model="form.job"
              label="직업"
              placeholder="직업을 입력하세요"
            />

            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">통신사</label>
              <select
                v-model="form.telecom"
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option value="">선택안함</option>
                <option v-for="t in telecomOptions" :key="t" :value="t">{{ t }}</option>
              </select>
            </div>

            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1.5 block">가입경로</label>
              <select
                v-model="form.acquisition_channel"
                class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
              >
                <option value="">선택안함</option>
                <option v-for="ch in channelOptions" :key="ch" :value="ch">{{ ch }}</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <!-- 등록 버튼 -->
      <div class="mt-6 flex justify-end">
        <button
          type="button"
          class="px-6 py-2.5 mr-3 border border-[#E0E0E0] text-[14px] text-[#666] font-medium rounded-[12px] hover:bg-[#F5F5F5] transition-colors"
          @click="router.push({ name: 'customer-list' })"
        >
          취소
        </button>
        <button
          type="submit"
          :disabled="submitting"
          class="px-8 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors"
        >
          {{ submitting ? '등록 중...' : '고객 등록' }}
        </button>
      </div>
    </form>

    <!-- Toast -->
    <Transition name="fade">
      <div
        v-if="toast.visible.value"
        class="fixed bottom-6 right-6 text-white text-[13px] px-5 py-2.5 rounded-[12px] shadow-lg z-50 whitespace-nowrap"
        :class="toast.variant.value === 'error' ? 'bg-[#FF4444]' : 'bg-[#333]'"
      >
        {{ toast.message.value }}
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import FormInput from '@user/components/form/FormInput.vue'

import { useCustomerStore } from '../../stores/customerStore'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const store = useCustomerStore()
const toast = useToast()

const submitting = ref(false)

interface CustomerForm {
  name: string
  phone: string
  resident_number: string
  gender: string
  birth_date: string
  email: string
  address: string
  detailed_address: string
  job: string
  telecom: string
  acquisition_channel: string
}

const genderOptions = [
  { value: 'M', label: '남성' },
  { value: 'F', label: '여성' },
] as const

const telecomOptions = ['SKT', 'KT', 'LGU+', 'SKT 알뜰', 'KT 알뜰', 'LGU+ 알뜰'] as const
const channelOptions = ['DB배분', '지인소개', '온라인', '텔레마케팅', '방문상담', '기타'] as const

const form = reactive<CustomerForm>({
  name: '',
  phone: '',
  resident_number: '',
  gender: '',
  birth_date: '',
  email: '',
  address: '',
  detailed_address: '',
  job: '',
  telecom: '',
  acquisition_channel: '',
})

// 전화번호 자동 하이픈: 숫자만 입력 → 010-1234-5678 형태
function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 7) return `${digits.slice(0, 3)}-${digits.slice(3)}`
  return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`
}

function handlePhoneInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const formatted = formatPhone(input.value)
  form.phone = formatted
  input.value = formatted
}

// 주민등록번호 자동 하이픈: 숫자만 입력 → 000000-0000000 형태
function formatResidentNumber(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 6)}-${digits.slice(6)}`
}

function handleResidentNumberInput(e: Event): void {
  const input = e.target as HTMLInputElement
  const formatted = formatResidentNumber(input.value)
  form.resident_number = formatted
  input.value = formatted
}

async function handleSubmit(): Promise<void> {
  if (!form.name.trim() || !form.phone.trim()) {
    return
  }

  submitting.value = true
  try {
    await store.addCustomer({
      name: form.name.trim(),
      phone: form.phone.trim(),
      resident_number: form.resident_number || undefined,
      gender: (form.gender || undefined) as 'M' | 'F' | 'OTHER' | undefined,
      birth_date: form.birth_date || undefined,
      email: form.email || undefined,
      address: form.address || undefined,
      detailed_address: form.detailed_address || undefined,
      job: form.job || undefined,
      telecom: form.telecom || undefined,
      acquisition_channel: form.acquisition_channel || undefined,
    })

    toast.showToast('고객이 등록되었습니다.')
    setTimeout(() => router.push({ name: 'customer-list' }), 500)
  } catch {
    toast.showToast(store.error ?? '고객 등록에 실패했습니다.', 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
