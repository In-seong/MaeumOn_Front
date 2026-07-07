<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, nextTick } from 'vue'

interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  placeholder?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const wrapperRef = ref<HTMLElement | null>(null)

const selectedLabel = computed(() => {
  const found = props.options.find(o => o.value === props.modelValue)
  return found?.label || ''
})

function select(value: string) {
  emit('update:modelValue', value)
  open.value = false
}

function toggle() {
  open.value = !open.value
  if (open.value) {
    nextTick(() => {
      const active = wrapperRef.value?.querySelector('.is-active') as HTMLElement | null
      active?.scrollIntoView({ block: 'nearest' })
    })
  }
}

function handleClickOutside(e: MouseEvent) {
  if (wrapperRef.value && !wrapperRef.value.contains(e.target as Node)) {
    open.value = false
  }
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onUnmounted(() => document.removeEventListener('click', handleClickOutside))
</script>

<template>
  <div class="relative" ref="wrapperRef">
    <button
      type="button"
      class="w-full px-4 py-3 bg-white rounded-[12px] text-[14px] outline-none border transition-colors text-left flex items-center justify-between"
      :class="open ? 'border-[#FF7B22]' : 'border-[#E8E8E8]'"
      @click="toggle"
    >
      <span :class="modelValue ? 'text-[#333]' : 'text-[#B0B0B0]'">
        {{ selectedLabel || placeholder || '선택해주세요' }}
      </span>
      <svg
        class="w-3 h-3 text-[#999] transition-transform shrink-0"
        :class="open ? 'rotate-180' : ''"
        viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      >
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <Transition name="dropdown">
      <div
        v-if="open"
        class="absolute left-0 right-0 top-[calc(100%+4px)] bg-white border border-[#E8E8E8] rounded-[12px] shadow-[0_4px_16px_rgba(0,0,0,0.12)] z-50 overflow-hidden"
      >
        <ul class="max-h-[200px] overflow-y-auto py-1">
          <li
            v-for="opt in options"
            :key="opt.value"
            class="px-4 py-2.5 text-[14px] cursor-pointer transition-colors"
            :class="[
              modelValue === opt.value
                ? 'bg-[#FFF0E5] text-[#FF7B22] font-medium is-active'
                : 'text-[#333] hover:bg-[#F8F8F8] active:bg-[#F0F0F0]'
            ]"
            @click="select(opt.value)"
          >
            {{ opt.label }}
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.dropdown-enter-active,
.dropdown-leave-active {
  transition: opacity 0.15s ease, transform 0.15s ease;
}
.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>
