<template>
  <div class="flex flex-col gap-3">
    <!-- 이름 -->
    <div class="flex flex-col gap-1.5 text-left">
      <label class="text-[13px] font-medium text-[#555]">이름</label>
      <input
        :value="modelValue.userName"
        class="bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22]"
        placeholder="홍길동"
        @input="update('userName', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <!-- 생년월일 -->
    <div class="flex flex-col gap-1.5 text-left">
      <label class="text-[13px] font-medium text-[#555]">생년월일</label>
      <input
        :value="formatBirthDate(modelValue.birthDate)"
        class="bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22]"
        placeholder="YYYY-MM-DD (예: 1990-01-15)"
        type="text"
        inputmode="numeric"
        maxlength="10"
        autocomplete="bday"
        @input="onBirthDateInput"
      />
    </div>

    <!-- 주민등록번호 (HIRA에서만) -->
    <div v-if="requireRrn" class="flex flex-col gap-1.5 text-left">
      <label class="text-[13px] font-medium text-[#555]">주민등록번호</label>
      <input
        :value="formatRrn(modelValue.rrn)"
        class="bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22]"
        placeholder="000000-0000000"
        type="text"
        maxlength="14"
        autocomplete="off"
        @input="onRrnInput"
      />
      <p class="text-[11px] text-[#E74C3C] leading-relaxed">
        ※ 진료내역 조회에는 본인확인을 위해 주민등록번호가 필요합니다.<br/>
        &nbsp;&nbsp;&nbsp;서버에 저장되지 않으며 CODEF API로만 일회성 전송됩니다.
      </p>
    </div>

    <!-- 휴대폰 번호 -->
    <div class="flex flex-col gap-1.5 text-left">
      <label class="text-[13px] font-medium text-[#555]">휴대폰 번호</label>
      <input
        :value="modelValue.phoneNo"
        class="bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22]"
        placeholder="01012345678"
        type="tel"
        inputmode="numeric"
        maxlength="13"
        @input="update('phoneNo', ($event.target as HTMLInputElement).value.replace(/\D/g, ''))"
      />
    </div>

    <!-- 통신사 -->
    <div class="flex flex-col gap-1.5 text-left">
      <label class="text-[13px] font-medium text-[#555]">통신사</label>
      <select
        :value="modelValue.telecom"
        class="bg-[#F8F8F8] rounded-[12px] px-4 py-3 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22]"
        @change="update('telecom', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">통신사 선택</option>
        <option v-for="t in TELECOM_OPTIONS" :key="t.value" :value="t.value">
          {{ t.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { HealthAuthFormValue } from './healthAuthForm'
import { TELECOM_OPTIONS } from './healthAuthForm'

interface Props {
  modelValue: HealthAuthFormValue
  /** true: 주민번호 필드 표시 (HIRA API용) */
  requireRrn?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  requireRrn: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: HealthAuthFormValue]
}>()

function update(field: keyof HealthAuthFormValue, value: string) {
  emit('update:modelValue', { ...props.modelValue, [field]: value })
}

/** 생년월일: 표시는 YYYY-MM-DD, 저장은 YYYYMMDD */
function formatBirthDate(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length <= 4) return digits
  if (digits.length <= 6) return `${digits.slice(0, 4)}-${digits.slice(4)}`
  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`
}

function onBirthDateInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 8)
  update('birthDate', raw)  // 저장은 YYYYMMDD
}

/** 주민번호: 표시는 000000-0000000, 저장은 13자리 */
function formatRrn(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 13)
  if (digits.length <= 6) return digits
  return `${digits.slice(0, 6)}-${digits.slice(6)}`
}

function onRrnInput(e: Event) {
  const raw = (e.target as HTMLInputElement).value.replace(/\D/g, '').slice(0, 13)
  update('rrn', raw)
}
</script>
