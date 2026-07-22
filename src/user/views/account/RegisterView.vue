<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex flex-col">
      <!-- Header -->
      <div class="pt-12 pb-6 text-center">
        <h1 class="text-[22px] font-bold text-[#333]">회원가입</h1>
        <p class="text-[14px] text-[#888] mt-2">가입 정보를 입력해주세요</p>
      </div>

      <!-- Form -->
      <div class="px-6 flex flex-col gap-4 flex-1">
        <!-- 이름 -->
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">이름</label>
          <input
            v-model="form.name"
            placeholder="이름 입력"
            class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
          />
        </div>

        <!-- 주민등록번호 -->
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">주민등록번호</label>
          <div class="flex items-center gap-2">
            <input
              v-model="rrnFront"
              placeholder="앞 6자리"
              maxlength="6"
              inputmode="numeric"
              class="flex-1 bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] text-center"
            />
            <span class="text-[#999] text-[18px]">-</span>
            <div class="flex-1 flex items-center gap-1">
              <input
                v-model="rrnBack"
                placeholder="뒤 7자리"
                maxlength="7"
                inputmode="numeric"
                type="password"
                class="flex-1 bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] text-center"
              />
            </div>
          </div>
        </div>

        <!-- 통신사 -->
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">통신사</label>
          <select
            v-model="form.telecom"
            class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333] appearance-none"
          >
            <option value="" disabled>통신사 선택</option>
            <option value="SKT">SKT</option>
            <option value="KT">KT</option>
            <option value="LGU+">LG U+</option>
            <option value="SKT알뜰">SKT 알뜰폰</option>
            <option value="KT알뜰">KT 알뜰폰</option>
            <option value="LGU+알뜰">LG U+ 알뜰폰</option>
          </select>
        </div>

        <!-- 주소 -->
        <div>
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">주소</label>
          <input
            v-model="form.address"
            placeholder="주소 입력"
            class="w-full bg-[#F8F8F8] rounded-[12px] px-4 py-3.5 text-[15px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
          />
        </div>

        <!-- Error -->
        <div v-if="authStore.error" class="p-3 bg-red-100 border border-red-400 text-red-700 rounded-[12px] text-sm">
          {{ authStore.error }}
        </div>
      </div>

      <!-- Submit Button -->
      <div class="px-6 pb-8 pt-4">
        <button
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform disabled:opacity-50"
          :disabled="!isFormValid || authStore.loading"
          @click="handleRegister"
        >
          {{ authStore.loading ? '가입 중...' : '가입하기' }}
        </button>

        <div class="text-center mt-4">
          <button
            class="text-[13px] text-[#999] underline"
            @click="goBack"
          >
            휴대폰 인증으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  name: '',
  telecom: '',
  address: '',
})
const rrnFront = ref('')
const rrnBack = ref('')

const isFormValid = computed(() => {
  return (
    form.value.name.trim().length > 0 &&
    rrnFront.value.length === 6 &&
    rrnBack.value.length === 7 &&
    form.value.telecom !== '' &&
    form.value.address.trim().length > 0
  )
})

async function handleRegister(): Promise<void> {
  const residentNumber = `${rrnFront.value}-${rrnBack.value}`
  const success = await authStore.register({
    name: form.value.name.trim(),
    resident_number: residentNumber,
    telecom: form.value.telecom,
    address: form.value.address.trim(),
  })
  if (success) {
    router.push('/')
  }
}

function goBack(): void {
  authStore.resetAuth()
  router.push('/login')
}
</script>
