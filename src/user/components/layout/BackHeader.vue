<template>
  <header class="sticky top-0 z-40">
    <div class="relative flex items-center h-[56px] px-4">
      <button @click="goBack" class="relative z-10 w-10 h-10 flex items-center justify-center -ml-2">
        <BackArrowIcon />
      </button>
      <h1 class="absolute inset-0 flex items-center justify-center text-[17px] font-semibold text-[#222] pointer-events-none">{{ title }}</h1>
    </div>
  </header>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'
import BackArrowIcon from '@user/components/icons/BackArrowIcon.vue'

interface Props {
  title: string
  customBack?: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{ back: [] }>()
const router = useRouter()

function goBack(): void {
  if (props.customBack) {
    emit('back')
  } else {
    router.back()
  }
}
</script>
