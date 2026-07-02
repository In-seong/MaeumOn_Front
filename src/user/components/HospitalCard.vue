<template>
  <button
    class="w-full bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.08)] p-4 text-left transition-all active:scale-[0.98]"
    @click="$emit('click')"
  >
    <div class="flex items-start gap-3">
      <div class="flex-1 min-w-0">
        <h3 class="text-[15px] font-semibold text-[#222] truncate">{{ name }}</h3>
        <p class="text-[12px] text-[#888] mt-1 truncate">{{ address }}</p>
        <p v-if="phone" class="text-[12px] text-[#888] mt-0.5">{{ phone }}</p>
        <p v-if="specialties" class="text-[12px] text-[#FF7B22] mt-1 truncate">{{ specialties }}</p>
      </div>
      <div v-if="imageUrl" class="flex-shrink-0">
        <img
          :src="imageUrl"
          :alt="name"
          class="w-[72px] h-[72px] rounded-[10px] object-cover"
        />
      </div>
      <div v-else class="ml-1 flex-shrink-0">
        <div class="w-8 h-8 rounded-full bg-[#FFF3ED] flex items-center justify-center">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M9 5L16 12L9 19" stroke="#FF7B22" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
  imageUrl?: string | null
}

defineProps<Props>()
defineEmits<{ click: [] }>()
</script>
