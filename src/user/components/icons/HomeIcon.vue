<template>
  <img
    src="/icons/HomeIcon.svg"
    alt="홈"
    class="w-[18px] h-[19px]"
    :class="{ 'icon-inactive': !active }"
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
.icon-inactive {
  filter: saturate(0) brightness(1.5);
}
</style>
