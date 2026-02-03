<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="상담 요청" />

      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- Agent Profile Card -->
        <CardSection class="mb-4">
          <div class="flex items-center gap-3">
            <div class="w-[48px] h-[48px] rounded-full bg-[#FF7B22] flex items-center justify-center flex-shrink-0">
              <span class="text-white text-[18px] font-bold">김</span>
            </div>
            <div>
              <p class="text-[16px] font-bold text-[#222]">김설계</p>
              <p class="text-[12px] text-[#888]">글로벌금융 OSK 온마음지사</p>
              <p class="text-[12px] text-[#999]">010-1234-5678</p>
            </div>
          </div>
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
            <FormInput label="이름" v-model="name" readonly />
            <FormInput label="연락처" v-model="phone" readonly />
            <FormInput label="생년월일" v-model="birthdate" readonly />
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
          :class="!consent ? 'opacity-50 cursor-not-allowed' : ''"
          :disabled="!consent"
        >
          상담 요청하기
        </button>
      </main>

      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '@user/components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import FormInput from '@user/components/form/FormInput.vue'
import FormSelect from '@user/components/form/FormSelect.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'

const selectedType = ref(0)
const consultTypes = [
  { label: '보험 상담', desc: '신규 가입 보장 분석' },
  { label: '보험금 청구', desc: '청구 대행 요청' },
  { label: '병원 예약', desc: '제휴 병원 예약 지원' },
  { label: '기타 문의', desc: '계약 변경 해지 등' },
]

const name = ref('홍길동')
const phone = ref('010-1234-5678')
const birthdate = ref('1985.03.15')
const region = ref('서울')
const content = ref('')
const selectedTime = ref('오전 9-12시')
const consent = ref(false)

const timeSlots = ['오전 9-12시', '오후 12-18시', '저녁 18-21시', '언제든']
</script>
