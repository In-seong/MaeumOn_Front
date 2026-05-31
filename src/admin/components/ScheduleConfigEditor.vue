<template>
  <div class="space-y-5">
    <!-- 기본 간격 -->
    <div>
      <label class="text-[13px] font-medium text-[#555] mb-1 block">기본 예약 간격</label>
      <select v-model="config.default_interval" class="px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]">
        <option :value="10">10분</option>
        <option :value="15">15분</option>
        <option :value="20">20분</option>
        <option :value="30">30분</option>
        <option :value="60">60분</option>
      </select>
    </div>

    <!-- 요일별 설정 -->
    <div>
      <p class="text-[13px] font-medium text-[#555] mb-2">요일별 예약 시간</p>
      <div class="space-y-2">
        <div v-for="day in dayList" :key="day.key" class="bg-[#FAFAFA] rounded-[10px] p-3">
          <div class="flex items-center gap-3 mb-2">
            <span class="text-[14px] font-medium text-[#333] w-8">{{ day.label }}</span>
            <label class="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" :checked="config.weekly[day.key] !== null" @change="toggleDay(day.key)" class="accent-[#FF7B22]" />
              <span class="text-[13px] text-[#555]">진료</span>
            </label>
          </div>
          <div v-if="config.weekly[day.key]" class="ml-11 space-y-2">
            <div v-for="(slot, si) in config.weekly[day.key]!.slots" :key="si" class="flex items-center gap-2">
              <input v-model="slot.start" type="time" class="px-2 py-1.5 bg-white border border-[#E0E0E0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
              <span class="text-[13px] text-[#999]">~</span>
              <input v-model="slot.end" type="time" class="px-2 py-1.5 bg-white border border-[#E0E0E0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
              <button @click="removeSlot(day.key, si)" class="text-red-400 hover:text-red-600 text-[16px]">&times;</button>
            </div>
            <button @click="addSlot(day.key)" class="text-[12px] text-[#FF7B22] hover:underline">+ 구간 추가</button>
          </div>
        </div>
      </div>
    </div>

    <!-- 차단일 -->
    <div>
      <p class="text-[13px] font-medium text-[#555] mb-2">예약 차단일</p>
      <div class="flex flex-wrap gap-2 mb-2">
        <span v-for="(d, i) in config.blocked_dates" :key="i" class="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 text-red-700 rounded-full text-[13px]">
          {{ d }}
          <button @click="config.blocked_dates.splice(i, 1)" class="text-red-400 hover:text-red-600">&times;</button>
        </span>
      </div>
      <div class="flex gap-2">
        <input v-model="newBlockedDate" type="date" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <button @click="addBlockedDate" class="px-3 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[13px] hover:bg-[#E66A1A]">추가</button>
      </div>
    </div>

    <!-- 특별 일정 -->
    <div>
      <p class="text-[13px] font-medium text-[#555] mb-2">특별 일정 (특정 날짜 시간 지정)</p>
      <div class="space-y-2 mb-2">
        <div v-for="(cd, dateKey) in config.custom_dates" :key="dateKey" class="bg-[#FFF8F0] rounded-[10px] p-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-[13px] font-medium text-[#FF7B22]">{{ dateKey }}</span>
            <button @click="removeCustomDate(dateKey)" class="text-red-400 hover:text-red-600 text-[14px]">&times;</button>
          </div>
          <div class="space-y-2">
            <div v-for="(slot, si) in cd.slots" :key="si" class="flex items-center gap-2">
              <input v-model="slot.start" type="time" class="px-2 py-1.5 bg-white border border-[#E0E0E0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
              <span class="text-[13px] text-[#999]">~</span>
              <input v-model="slot.end" type="time" class="px-2 py-1.5 bg-white border border-[#E0E0E0] rounded-[8px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
              <button @click="cd.slots.splice(si, 1)" class="text-red-400 hover:text-red-600 text-[16px]">&times;</button>
            </div>
            <button @click="cd.slots.push({ start: '09:00', end: '17:00' })" class="text-[12px] text-[#FF7B22] hover:underline">+ 구간 추가</button>
          </div>
        </div>
      </div>
      <div class="flex gap-2">
        <input v-model="newCustomDate" type="date" class="px-3 py-2 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[13px] focus:outline-none focus:border-[#FF7B22]" />
        <button @click="addCustomDate" class="px-3 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[13px] hover:bg-[#E66A1A]">추가</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch, toRaw } from 'vue'
import type { ScheduleConfig } from '../types'

const props = defineProps<{
  modelValue: ScheduleConfig | null
}>()

const emit = defineEmits<{
  'update:modelValue': [value: ScheduleConfig | null]
}>()

const dayList = [
  { key: 'mon', label: '월' },
  { key: 'tue', label: '화' },
  { key: 'wed', label: '수' },
  { key: 'thu', label: '목' },
  { key: 'fri', label: '금' },
  { key: 'sat', label: '토' },
  { key: 'sun', label: '일' },
]

function getDefault(): ScheduleConfig {
  return {
    default_interval: 30,
    weekly: {
      mon: { slots: [{ start: '09:00', end: '17:00' }] },
      tue: { slots: [{ start: '09:00', end: '17:00' }] },
      wed: { slots: [{ start: '09:00', end: '17:00' }] },
      thu: { slots: [{ start: '09:00', end: '17:00' }] },
      fri: { slots: [{ start: '09:00', end: '17:00' }] },
      sat: null,
      sun: null,
    },
    blocked_dates: [],
    custom_dates: {},
  }
}

const config = reactive<ScheduleConfig>(
  props.modelValue ? JSON.parse(JSON.stringify(props.modelValue)) : getDefault()
)

const newBlockedDate = ref('')
const newCustomDate = ref('')

watch(config, () => {
  emit('update:modelValue', JSON.parse(JSON.stringify(toRaw(config))))
}, { deep: true })

watch(() => props.modelValue, (val) => {
  if (val === null || val === undefined) return
  const incoming = JSON.stringify(val)
  const current = JSON.stringify(toRaw(config))
  if (incoming !== current) {
    Object.assign(config, JSON.parse(incoming))
  }
})

function toggleDay(dayKey: string) {
  if (config.weekly[dayKey] !== null && config.weekly[dayKey] !== undefined) {
    config.weekly[dayKey] = null
  } else {
    config.weekly[dayKey] = { slots: [{ start: '09:00', end: '17:00' }] }
  }
}

function addSlot(dayKey: string) {
  const day = config.weekly[dayKey]
  if (day) {
    day.slots.push({ start: '13:00', end: '17:00' })
  }
}

function removeSlot(dayKey: string, index: number) {
  const day = config.weekly[dayKey]
  if (day) {
    day.slots.splice(index, 1)
  }
}

function addBlockedDate() {
  if (newBlockedDate.value && !config.blocked_dates.includes(newBlockedDate.value)) {
    config.blocked_dates.push(newBlockedDate.value)
    config.blocked_dates.sort()
    newBlockedDate.value = ''
  }
}

function addCustomDate() {
  if (newCustomDate.value && !config.custom_dates[newCustomDate.value]) {
    config.custom_dates[newCustomDate.value] = { slots: [{ start: '09:00', end: '17:00' }] }
    newCustomDate.value = ''
  }
}

function removeCustomDate(dateKey: string) {
  delete config.custom_dates[dateKey]
}
</script>
