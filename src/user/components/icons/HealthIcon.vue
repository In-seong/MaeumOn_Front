<template>
  <img
    src="/icons/HealthIcon.svg"
    alt="건강"
    class="w-[20px] h-[18px]"
    :class="{ 'icon-active': active }"
  />
</template>

<script setup lang="ts">
interface Props {
  active?: boolean
}

withDefaults(defineProps<Props>(), {
  active: false
})
</script>

<style scoped>
.icon-active {
  filter: brightness(0) saturate(100%) invert(46%) sepia(96%) saturate(1225%) hue-rotate(360deg) brightness(101%) contrast(101%);
}
</style>
