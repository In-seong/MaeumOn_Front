<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="보험·건강 조회" />

      <main class="px-5 py-4 pb-28 overflow-y-auto" style="height: calc(100dvh - 56px);">

        <!-- 모드 선택 -->
        <section v-if="!mode" class="mt-2">
          <p class="text-[16px] font-bold text-[#222] mb-4">조회 방법을 선택해주세요</p>
          <div class="flex flex-col gap-3">
            <button
              class="rounded-[16px] bg-white border-[1.5px] border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 text-left active:scale-[0.98] transition-transform"
              @click="$router.push({ name: 'codef-customers' })"
            >
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-full bg-[#FFF0E5] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px] text-[#FF7B22]">person_search</span>
                </div>
                <div>
                  <p class="text-[15px] font-semibold text-[#222]">고객 선택 후 조회</p>
                  <p class="text-[12px] text-[#999] mt-0.5">내 고객 목록에서 선택하여 조회합니다</p>
                </div>
              </div>
            </button>
            <button
              class="rounded-[16px] bg-white border-[1.5px] border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-5 text-left active:scale-[0.98] transition-transform"
              @click="mode = 'direct'"
            >
              <div class="flex items-center gap-4">
                <div class="w-11 h-11 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
                  <span class="material-symbols-outlined text-[22px] text-[#4CAF50]">edit_note</span>
                </div>
                <div>
                  <p class="text-[15px] font-semibold text-[#222]">바로 조회</p>
                  <p class="text-[12px] text-[#999] mt-0.5">고객 정보를 직접 입력하여 조회합니다</p>
                </div>
              </div>
            </button>
          </div>
        </section>

        <!-- 바로 조회: 정보 입력 -->
        <section v-if="mode === 'direct'" class="mt-2">
          <div class="flex items-center gap-2 mb-4">
            <button @click="mode = null" class="text-[#999]">
              <span class="material-symbols-outlined text-[20px]">arrow_back</span>
            </button>
            <p class="text-[16px] font-bold text-[#222]">고객 정보 입력</p>
          </div>

          <div class="space-y-3">
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">이름 <span class="text-red-500">*</span></label>
              <input v-model="form.name" type="text" placeholder="홍길동"
                class="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">주민등록번호 <span class="text-red-500">*</span></label>
              <input v-model="form.resident_number" type="text" placeholder="000000-0000000" maxlength="14"
                class="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]"
                @input="formatResidentNumber" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">휴대폰 번호 <span class="text-red-500">*</span></label>
              <input v-model="form.phone" type="tel" placeholder="01012345678" maxlength="11"
                class="w-full px-4 py-3 bg-white border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]" />
            </div>
          </div>

          <p v-if="errorMsg" class="text-[13px] text-red-500 mt-3">{{ errorMsg }}</p>

          <button
            :disabled="!canSubmit || submitting"
            class="w-full mt-6 py-3.5 rounded-[12px] text-[15px] font-semibold transition-all"
            :class="canSubmit && !submitting ? 'bg-[#FF7B22] text-white active:scale-[0.98]' : 'bg-[#E8E8E8] text-[#BBB]'"
            @click="handleDirectSearch"
          >
            <span v-if="submitting" class="flex items-center justify-center gap-2">
              <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
              처리 중...
            </span>
            <span v-else>조회하기</span>
          </button>

          <p class="text-[12px] text-[#AAA] mt-3 text-center">입력한 고객 정보는 내 고객 목록에 자동 등록됩니다</p>
        </section>

      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import api from '@shared/api'

const router = useRouter()

const mode = ref<'direct' | null>(null)
const submitting = ref(false)
const errorMsg = ref('')

const form = ref({
  name: '',
  resident_number: '',
  phone: '',
})

const canSubmit = computed(() => {
  const rn = form.value.resident_number.replace(/\D/g, '')
  return form.value.name.trim().length >= 2
    && rn.length === 13
    && form.value.phone.replace(/\D/g, '').length >= 10
})

function formatResidentNumber() {
  let digits = form.value.resident_number.replace(/\D/g, '')
  if (digits.length > 13) digits = digits.slice(0, 13)
  if (digits.length > 6) {
    form.value.resident_number = digits.slice(0, 6) + '-' + digits.slice(6)
  } else {
    form.value.resident_number = digits
  }
}

function deriveBirthDate(rn: string): string {
  const digits = rn.replace(/\D/g, '')
  if (digits.length < 7) return ''
  const yy = digits.slice(0, 2)
  const mm = digits.slice(2, 4)
  const dd = digits.slice(4, 6)
  const g = digits[6]
  const century = (g === '1' || g === '2' || g === '5' || g === '6') ? '19' : '20'
  return `${century}${yy}-${mm}-${dd}`
}

function deriveGender(rn: string): 'M' | 'F' {
  const g = rn.replace(/\D/g, '')[6]
  return (g === '1' || g === '3') ? 'M' : 'F'
}

async function handleDirectSearch() {
  errorMsg.value = ''
  submitting.value = true
  try {
    const res = await api.post('/agent/customers', {
      name: form.value.name.trim(),
      phone: form.value.phone.replace(/\D/g, ''),
      resident_number: form.value.resident_number.replace(/\D/g, ''),
      birth_date: deriveBirthDate(form.value.resident_number),
      gender: deriveGender(form.value.resident_number),
      acquisition_channel: 'codef_direct',
    })
    const customerId = res.data.data.customer_id
    router.push({ name: 'codef-dashboard', params: { customerId } })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || '고객 등록에 실패했습니다'
  } finally {
    submitting.value = false
  }
}
</script>
