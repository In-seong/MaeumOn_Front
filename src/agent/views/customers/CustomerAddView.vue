<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="고객 등록" />

      <main class="px-5 overflow-y-auto pb-20" style="height: calc(100vh - 56px);">
        <form class="mt-3 flex flex-col gap-4" @submit.prevent="handleSubmit">
          <!-- Required Fields Section -->
          <CardSection>
            <h3 class="text-[14px] font-semibold text-[#333] mb-4">기본 정보</h3>

            <div class="flex flex-col gap-3.5">
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
                  class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
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
                  class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
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
                  class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                  @input="handleResidentNumberInput"
                />
              </div>
            </div>
          </CardSection>

          <!-- Additional Info Section -->
          <CardSection>
            <h3 class="text-[14px] font-semibold text-[#333] mb-4">추가 정보</h3>

            <div class="flex flex-col gap-3.5">
              <FormInput
                v-model="form.address"
                label="주소"
                placeholder="주소를 입력하세요"
              />

              <FormInput
                v-model="form.job"
                label="직업"
                placeholder="직업을 입력하세요"
              />
            </div>
          </CardSection>

          <!-- Submit Button -->
          <div class="mt-1 mb-6">
            <ActionButton full large :disabled="submitting" @click="handleSubmit">
              {{ submitting ? '등록 중...' : '고객 등록' }}
            </ActionButton>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormInput from '@user/components/form/FormInput.vue'

import { useCustomerStore } from '../../stores/customerStore'

const router = useRouter()
const store = useCustomerStore()

const submitting = ref(false)

interface CustomerForm {
  name: string
  phone: string
  resident_number: string
  address: string
  job: string
}

const form = reactive<CustomerForm>({
  name: '',
  phone: '',
  resident_number: '',
  address: '',
  job: '',
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
      address: form.address || undefined,
      job: form.job || undefined,
    })

    router.push({ name: 'customer-list' })
  } catch {
    // Error is handled in store
  } finally {
    submitting.value = false
  }
}
</script>
