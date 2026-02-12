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
                  v-model="form.customer_name"
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
                  v-model="form.customer_phone"
                  type="tel"
                  placeholder="010-0000-0000"
                  required
                  class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
                />
              </div>

              <FormSelect
                v-model="form.telecom"
                label="통신사"
                :options="telecomOptions"
              />

              <FormInput
                v-model="form.resident_number"
                label="주민등록번호"
                placeholder="000000-0000000"
              />
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
                v-model="form.occupation"
                label="직업"
                placeholder="직업을 입력하세요"
              />

              <FormSelect
                v-model="form.acquisition_source"
                label="고객정보 취득경로"
                :options="acquisitionOptions"
              />

              <FormSelect
                v-model="form.customer_tag"
                label="고객 태그"
                :options="tagOptions"
              />
            </div>
          </CardSection>

          <!-- Memo Section -->
          <CardSection>
            <FormTextarea
              v-model="form.memo"
              label="메모"
              placeholder="고객에 대한 메모를 입력하세요"
              :rows="3"
            />
          </CardSection>

          <!-- Submit Button -->
          <div class="mt-1 mb-6">
            <ActionButton full large @click="handleSubmit">
              고객 등록
            </ActionButton>
          </div>
        </form>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useCustomerStore } from '../../stores/customerStore'

const router = useRouter()
const store = useCustomerStore()

const telecomOptions = ['SKT', 'KT', 'LG U+', '알뜰폰']
const acquisitionOptions = ['병원', '소개', '기타']
const tagOptions = ['VIP', '신규', '관심', '일반']

interface CustomerForm {
  customer_name: string
  customer_phone: string
  telecom: string
  resident_number: string
  address: string
  occupation: string
  acquisition_source: string
  customer_tag: string
  memo: string
}

const form = reactive<CustomerForm>({
  customer_name: '',
  customer_phone: '',
  telecom: 'SKT',
  resident_number: '',
  address: '',
  occupation: '',
  acquisition_source: '병원',
  customer_tag: '신규',
  memo: '',
})

function handleSubmit(): void {
  if (!form.customer_name.trim() || !form.customer_phone.trim()) {
    return
  }

  const now = new Date().toISOString().slice(0, 10)

  const newCustomer = store.addCustomer({
    agent_id: 'AGT00001',
    customer_name: form.customer_name.trim(),
    customer_phone: form.customer_phone.trim(),
    telecom: form.telecom,
    resident_number: form.resident_number || undefined,
    address: form.address || undefined,
    occupation: form.occupation || undefined,
    acquisition_source: form.acquisition_source || undefined,
    customer_tag: form.customer_tag as 'VIP' | '신규' | '관심' | '일반',
    last_contact_date: now,
    registered_at: now,
  })

  // Add initial memo if provided
  if (form.memo.trim()) {
    store.addMemo(newCustomer.customer_id, form.memo.trim(), now)
  }

  router.push({ name: 'customer-list' })
}
</script>
