<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험금 청구 신청" />

      <!-- 완료 화면 -->
      <main v-if="submitted" class="px-5 pt-12 text-center">
        <div class="w-20 h-20 mx-auto rounded-full bg-[#E8F5E9] flex items-center justify-center mb-6">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
            <path d="M20 6L9 17L4 12" stroke="#4CAF50" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        <h2 class="text-[20px] font-bold text-[#222] mb-3">접수되었습니다</h2>
        <p class="text-[15px] text-[#666] leading-relaxed">
          설계사가 확인 후<br />연락드리겠습니다.
        </p>
        <button
          class="mt-8 w-full py-4 bg-[#FF7B22] text-white rounded-[12px] text-[16px] font-semibold active:scale-[0.98]"
          @click="$router.push('/')"
        >
          홈으로 돌아가기
        </button>
      </main>

      <!-- 입력 폼 -->
      <main v-else class="px-5 overflow-y-auto pb-28" style="height: calc(100vh - 56px);">
        <div class="py-5 space-y-5">
          <FormInput
            label="이름"
            v-model="form.name"
            placeholder="이름을 입력하세요"
          />

          <FormInput
            label="전화번호"
            v-model="form.phone"
            type="tel"
            inputmode="tel"
            placeholder="010-0000-0000"
            @update:model-value="formatPhone"
          />

          <FormTextarea
            label="메모 (선택)"
            v-model="form.memo"
            placeholder="청구 관련 메모를 입력하세요"
            :rows="3"
          />

          <div>
            <p class="text-[13px] font-medium text-[#555] mb-2">첨부파일 (선택)</p>
            <FileUploadSimple @update:files="onFilesChange" />
          </div>
        </div>

        <!-- 신청 버튼 -->
        <button
          class="w-full py-4 rounded-[12px] text-[16px] font-semibold transition-all active:scale-[0.98] mt-4"
          :class="isValid ? 'bg-[#FF7B22] text-white' : 'bg-[#E0E0E0] text-[#999] cursor-not-allowed'"
          :disabled="!isValid || loading"
          @click="submitRequest"
        >
          {{ loading ? '접수 중...' : '신청하기' }}
        </button>
      </main>

      <SeniorBottomNav v-if="!submitted" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import FileUploadSimple from '@user/components/FileUploadSimple.vue'
import SeniorBottomNav from '@user/components/SeniorBottomNav.vue'
import { submitClaimRequest } from '@user/services/publicApi'

const form = ref({
  name: '',
  phone: '',
  memo: '',
})

const files = ref<File[]>([])
const loading = ref(false)
const submitted = ref(false)

const isValid = computed(() => {
  return form.value.name.trim().length > 0 && form.value.phone.trim().length >= 10
})

function formatPhone(value: string) {
  const numbers = value.replace(/[^0-9]/g, '')
  if (numbers.length <= 3) {
    form.value.phone = numbers
  } else if (numbers.length <= 7) {
    form.value.phone = `${numbers.slice(0, 3)}-${numbers.slice(3)}`
  } else {
    form.value.phone = `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`
  }
}

function onFilesChange(newFiles: File[]) {
  files.value = newFiles
}

async function submitRequest() {
  if (!isValid.value || loading.value) return

  loading.value = true
  try {
    const formData = new FormData()
    formData.append('name', form.value.name)
    formData.append('phone', form.value.phone)
    if (form.value.memo) {
      formData.append('memo', form.value.memo)
    }
    files.value.forEach((file) => {
      formData.append('files[]', file)
    })

    await submitClaimRequest(formData)
    submitted.value = true
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '신청에 실패했습니다. 다시 시도해주세요.')
  } finally {
    loading.value = false
  }
}
</script>
