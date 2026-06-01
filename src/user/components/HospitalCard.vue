<template>
  <button
    class="w-full bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.08)] p-4 text-left transition-all active:scale-[0.98]"
    @click="$emit('click')"
  >
    <div class="flex items-start justify-between">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-[#222] truncate">{{ name }}</h3>
        <p v-if="specialties" class="text-[12px] text-[#03C75A] mt-1">{{ specialties }}</p>
        <p class="text-[12px] text-[#888] mt-1 truncate">{{ address }}</p>
        <p v-if="phone" class="text-[12px] text-[#888] mt-0.5">{{ phone }}</p>
      </div>
      <div class="ml-3 flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-[#E5F6EB] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5L16 12L9 19" stroke="#03C75A" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
interface Props {
  name: string
  address: string
  specialties?: string
  phone?: string
}

defineProps<Props>()
defineEmits<{ click: [] }>()
</script>
