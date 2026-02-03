<template>
  <div class="flex gap-[14px] w-full" style="height: 192px;">
    <div class="flex-1 flex flex-col justify-between bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 cursor-pointer" @click="router.push('/insurance')">
      <div>
        <h3 class="text-[15px] font-medium text-[#FF7B22] mb-3">내 보험 현황</h3>
        <p class="text-[13px] font-semibold text-[#555555] mb-0.5">월 납입료</p>
        <p class="text-[17px] font-semibold text-black">385,000원</p>
      </div>
      <div class="flex justify-end">
        <span class="text-[28px] font-bold text-[#FF7B22]" style="text-decoration: underline; text-decoration-color: #FF7B22; text-underline-offset: 6px; text-decoration-thickness: 2px;">5건</span>
      </div>
    </div>
    <div class="flex-1 flex flex-col justify-between bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-5 cursor-pointer" @click="showModal = true">
      <div>
        <h3 class="text-[15px] font-medium text-[#FF7B22] mb-3">보험금 청구</h3>
        <p class="text-[13px] font-normal text-[#555555] leading-[1.6]">간편하게<br>보험금 청구하세요</p>
      </div>
      <div class="flex justify-end">
        <svg width="8" height="14" viewBox="0 0 8 14" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1 1L7 7L1 13" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
    </div>
  </div>

  <!-- Claim Modal -->
  <Teleport to="body">
    <div v-if="showModal" class="fixed inset-0 z-[100] flex items-center justify-center">
      <div class="absolute inset-0 bg-black/40" @click="showModal = false" />
      <div class="relative w-[320px] bg-white rounded-[20px] p-6 shadow-xl">
        <p class="text-[16px] font-bold text-[#222] text-center mb-5">청구 방식 선택</p>
        <div class="flex flex-col gap-3">
          <button
            class="w-full py-3.5 bg-[#FF7B22] text-white rounded-[12px] text-[15px] font-semibold active:scale-[0.98] transition-transform"
            @click="handleClaim('direct')"
          >
            직접 청구하기
          </button>
          <button
            class="w-full py-3.5 bg-white border border-[#FF7B22] text-[#FF7B22] rounded-[12px] text-[15px] font-semibold active:scale-[0.98] transition-transform"
            @click="handleClaim('agent')"
          >
            대리 청구 요청하기
          </button>
        </div>
        <button class="w-full mt-3 py-2 text-[13px] text-[#999]" @click="showModal = false">
          닫기
        </button>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const showModal = ref(false)

function handleClaim(type: 'direct' | 'agent'): void {
  showModal.value = false
  if (type === 'direct') {
    router.push('/claims/new')
  } else {
    router.push('/consultation')
  }
}
</script>
