<template>
  <div class="flex items-center justify-between w-full">
    <div class="flex items-center gap-2">
      <slot name="icon" />
      <h2 class="text-[16px] font-semibold text-black">{{ title }}</h2>
    </div>
    <button class="text-[12px] font-normal text-[#999999]" @click="onAction">{{ actionText }}</button>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router'

interface Props {
  title: string
  actionText?: string
  actionTo?: string
}

const props = withDefaults(defineProps<Props>(), {
  actionText: '자세히 보기',
  actionTo: ''
})

const router = useRouter()

function onAction(): void {
  if (props.actionTo) {
    router.push(props.actionTo)
  }
}
</script>
