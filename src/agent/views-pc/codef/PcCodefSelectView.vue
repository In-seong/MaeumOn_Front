<template>
  <div class="p-6">
    <h1 class="text-[22px] font-bold text-[#333] mb-6">보험·건강 조회</h1>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-[800px]">
      <!-- 고객 선택 후 조회 -->
      <button
        class="bg-white rounded-[16px] border border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-left hover:border-[#FF7B22] hover:shadow-md transition-all"
        @click="$router.push({ name: 'codef-customers' })"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#FFF0E5] flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px] text-[#FF7B22]">person_search</span>
          </div>
          <div>
            <p class="text-[16px] font-semibold text-[#222]">고객 선택 후 조회</p>
            <p class="text-[13px] text-[#999] mt-1">내 고객 목록에서 선택하여 조회합니다</p>
          </div>
        </div>
      </button>

      <!-- 바로 조회 -->
      <button
        class="bg-white rounded-[16px] border border-[#E8E8E8] shadow-[0_2px_12px_rgba(0,0,0,0.06)] p-6 text-left hover:border-[#4CAF50] hover:shadow-md transition-all"
        @click="showDirectModal = true"
      >
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 rounded-full bg-[#E8F5E9] flex items-center justify-center shrink-0">
            <span class="material-symbols-outlined text-[24px] text-[#4CAF50]">edit_note</span>
          </div>
          <div>
            <p class="text-[16px] font-semibold text-[#222]">바로 조회</p>
            <p class="text-[13px] text-[#999] mt-1">고객 정보를 직접 입력하여 조회합니다</p>
          </div>
        </div>
      </button>
    </div>

    <!-- 바로 조회 모달 -->
    <Teleport to="body">
      <Transition name="modal">
        <div v-if="showDirectModal" class="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div class="absolute inset-0 bg-black/40" @click="showDirectModal = false"></div>
          <div class="relative bg-white rounded-[20px] shadow-2xl w-full max-w-[460px]">
            <div class="flex items-center justify-between px-6 py-5 border-b border-[#F0F0F0]">
              <h2 class="text-[18px] font-bold text-[#333]">고객 정보 입력</h2>
              <button @click="showDirectModal = false" class="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#F0F0F0] transition-colors">
                <span class="material-symbols-outlined text-[22px] text-[#999]">close</span>
              </button>
            </div>
            <div class="px-6 py-5 space-y-4">
              <div>
                <label class="text-[13px] font-medium text-[#555] mb-1.5 block">이름 <span class="text-red-500">*</span></label>
                <input v-model="form.name" type="text" placeholder="홍길동"
                  class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]" />
              </div>
              <div>
                <label class="text-[13px] font-medium text-[#555] mb-1.5 block">주민등록번호 <span class="text-red-500">*</span></label>
                <input v-model="form.resident_number" type="text" placeholder="000000-0000000" maxlength="14"
                  class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]"
                  @input="formatResidentNumber" />
              </div>
              <div>
                <label class="text-[13px] font-medium text-[#555] mb-1.5 block">휴대폰 번호 <span class="text-red-500">*</span></label>
                <input v-model="form.phone" type="tel" placeholder="01012345678" maxlength="11"
                  class="w-full px-4 py-3 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] text-[14px] text-[#333] placeholder-[#BBB] outline-none focus:border-[#FF7B22]" />
              </div>
              <p v-if="errorMsg" class="text-[13px] text-red-500">{{ errorMsg }}</p>
            </div>
            <div class="px-6 pb-6">
              <button
                :disabled="!canSubmit || submitting"
                class="w-full py-3.5 rounded-[12px] text-[15px] font-semibold transition-all"
                :class="canSubmit && !submitting ? 'bg-[#FF7B22] text-white hover:bg-[#E66A1A]' : 'bg-[#E8E8E8] text-[#BBB] cursor-not-allowed'"
                @click="handleDirectSearch"
              >
                <span v-if="submitting" class="flex items-center justify-center gap-2">
                  <span class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
                  처리 중...
                </span>
                <span v-else>조회하기</span>
              </button>
              <p class="text-[12px] text-[#AAA] mt-3 text-center">입력한 고객 정보는 내 고객 목록에 자동 등록됩니다</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import api from '@shared/api'

const router = useRouter()

const showDirectModal = ref(false)
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
    showDirectModal.value = false
    router.push({ name: 'codef-dashboard', params: { customerId } })
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    errorMsg.value = err.response?.data?.message || '고객 등록에 실패했습니다'
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.modal-enter-active, .modal-leave-active { transition: opacity 0.2s ease; }
.modal-enter-active > div:last-child, .modal-leave-active > div:last-child { transition: transform 0.2s ease; }
.modal-enter-from, .modal-leave-to { opacity: 0; }
.modal-enter-from > div:last-child { transform: scale(0.95); }
.modal-leave-to > div:last-child { transform: scale(0.95); }
</style>
