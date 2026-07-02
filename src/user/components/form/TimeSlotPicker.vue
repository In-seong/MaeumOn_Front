<template>
  <div class="flex flex-col gap-3">
    <div>
      <p class="text-[12px] text-[#888] mb-2">오전</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="slot in morningSlots"
          :key="slot.time"
          class="px-3 py-2 rounded-[10px] text-[13px] font-medium border transition-colors"
          :class="getSlotClass(slot)"
          :disabled="slot.disabled"
          @click="selectSlot(slot.time)"
        >
          {{ slot.time }}
        </button>
      </div>
    </div>
    <div>
      <p class="text-[12px] text-[#888] mb-2">오후</p>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="slot in afternoonSlots"
          :key="slot.time"
          class="px-3 py-2 rounded-[10px] text-[13px] font-medium border transition-colors"
          :class="getSlotClass(slot)"
          :disabled="slot.disabled"
          @click="selectSlot(slot.time)"
        >
          {{ slot.time }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'

interface TimeSlot {
  time: string
  disabled: boolean
}

const emit = defineEmits<{
  select: [time: string]
}>()

const selected = ref('10:00')

const morningSlots: TimeSlot[] = [
  { time: '09:00', disabled: false },
  { time: '09:30', disabled: false },
  { time: '10:00', disabled: false },
  { time: '10:30', disabled: false },
  { time: '11:00', disabled: false },
  { time: '11:30', disabled: true },
]

const afternoonSlots: TimeSlot[] = [
  { time: '14:00', disabled: true },
  { time: '14:30', disabled: false },
  { time: '15:00', disabled: false },
  { time: '15:30', disabled: false },
  { time: '16:00', disabled: false },
  { time: '16:30', disabled: false },
  { time: '17:00', disabled: false },
  { time: '17:30', disabled: true },
]

function getSlotClass(slot: TimeSlot): string {
  if (slot.disabled) return 'bg-[#F5F5F5] text-[#D0D0D0] border-[#F0F0F0] cursor-default'
  if (slot.time === selected.value) return 'bg-[#FF7B22] text-white border-[#FF7B22]'
  return 'bg-white text-[#555] border-[#E0E0E0] hover:border-[#FF7B22]'
}

function selectSlot(time: string): void {
  selected.value = time
  emit('select', time)
}
</script>
