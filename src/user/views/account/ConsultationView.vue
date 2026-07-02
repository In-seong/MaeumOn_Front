<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="상담 요청" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Assignee notice -->
        <CardSection class="mb-4">
          <p class="text-[13px] text-[#555] leading-relaxed">
            <template v-if="hasAssignedAgent">
              요청 접수 시 <span class="font-semibold text-[#FF7B22]">담당 설계사</span>가 곧 연락드립니다.
            </template>
            <template v-else>
              담당 설계사 미배정 상태입니다. <span class="font-semibold text-[#FF7B22]">관리자</span>가 배정 후 연락드립니다.
            </template>
          </p>
        </CardSection>

        <!-- Consultation Type -->
        <CardSection class="mb-4">
          <p class="text-[14px] font-semibold text-[#222] mb-3">상담 유형</p>
          <div class="flex flex-col gap-2">
            <label
              v-for="(type, idx) in consultTypes"
              :key="type.label"
              class="flex items-start gap-3 p-3 rounded-[12px] border cursor-pointer transition-colors"
              :class="selectedType === idx ? 'border-[#FF7B22] bg-[#FFF7F0]' : 'border-[#E8E8E8] bg-white'"
            >
              <input
                type="radio"
                name="consultType"
                :value="idx"
                v-model="selectedType"
                class="mt-1 accent-[#FF7B22]"
              />
              <div>
                <p class="text-[14px] font-medium" :class="selectedType === idx ? 'text-[#FF7B22]' : 'text-[#333]'">{{ type.label }}</p>
                <p class="text-[11px] text-[#999]">{{ type.desc }}</p>
              </div>
            </label>
          </div>
        </CardSection>

        <!-- Customer Info -->
        <CardSection class="mb-4">
          <p class="text-[14px] font-semibold text-[#222] mb-3">고객 정보</p>
          <div class="flex flex-col gap-3">
            <FormInput label="이름" :model-value="customerName" readonly />
            <FormInput label="연락처" :model-value="customerPhone" readonly />
            <FormInput label="생년월일" :model-value="customerBirth" readonly />
            <FormSelect label="지역" v-model="region" :options="['서울', '경기', '인천', '기타']" />
          </div>
        </CardSection>

        <!-- Consultation Content -->
        <CardSection class="mb-4">
          <FormTextarea label="상담 내용" v-model="content" placeholder="상담받고 싶은 내용을 자유롭게 작성해주세요." :rows="5" />
        </CardSection>

        <!-- Preferred Time -->
        <CardSection class="mb-4">
          <p class="text-[14px] font-semibold text-[#222] mb-3">희망 연락 시간</p>
          <div class="flex flex-wrap gap-2">
            <button
              v-for="time in timeSlots"
              :key="time"
              class="px-3 py-2 rounded-[10px] text-[13px] font-medium border transition-colors"
              :class="selectedTime === time ? 'bg-[#FF7B22] text-white border-[#FF7B22]' : 'bg-white text-[#555] border-[#E0E0E0]'"
              @click="selectedTime = time"
            >
              {{ time }}
            </button>
          </div>
        </CardSection>

        <!-- Consent -->
        <div class="flex items-start gap-2.5 mb-5 px-1">
          <input type="checkbox" v-model="consent" class="mt-1 accent-[#FF7B22] w-4 h-4" />
          <p class="text-[12px] text-[#888] leading-relaxed">상담 요청을 위해 개인정보(이름, 연락처, 생년월일)를 담당 설계사에게 제공하는 것에 동의합니다.</p>
        </div>

        <!-- Submit Button -->
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
          :class="!canSubmit ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="!canSubmit"
          @click="submit"
        >
          {{ submitting ? '요청 중…' : '상담 요청하기' }}
        </button>
      </main>

      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useDialog } from '@user/composables/useDialog'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useAuthStore } from '@user/stores/authStore'
import { createConsultation } from '@user/services/consultationApi'

const router = useRouter()
const dialog = useDialog()
const authStore = useAuthStore()

const consultTypes = [
  { label: '보험 상담', desc: '신규 가입 보장 분석' },
  { label: '보험금 청구', desc: '청구 대행 요청' },
  { label: '병원 예약', desc: '제휴 병원 예약 지원' },
  { label: '기타 문의', desc: '계약 변경 해지 등' },
]
const timeSlots = ['오전 9-12시', '오후 12-18시', '저녁 18-21시', '언제든']

const selectedType = ref(0)
const region = ref('서울')
const content = ref('')
const selectedTime = ref('오전 9-12시')
const consent = ref(false)
const submitting = ref(false)

const customer = computed(() => authStore.user?.customer ?? null)
const customerName = computed(() => customer.value?.name ?? '')
const customerPhone = computed(() => customer.value?.phone ?? '')
const customerBirth = computed(() => customer.value?.birth_date ?? '')
const hasAssignedAgent = computed(() => Boolean(customer.value?.agent_id))

const canSubmit = computed(
  () => consent.value && content.value.trim().length > 0 && !submitting.value,
)

async function submit() {
  if (!canSubmit.value) return

  submitting.value = true
  try {
    const composed = `[지역: ${region.value} / 희망연락: ${selectedTime.value}]\n\n${content.value.trim()}`
    await createConsultation({
      consultation_type: consultTypes[selectedType.value]?.label ?? '기타 문의',
      consultation_content: composed,
    })
    await dialog.success('상담 요청이 접수되었습니다. 곧 연락드리겠습니다.')
    router.back()
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    await dialog.error(msg || '상담 요청에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}
</script>
