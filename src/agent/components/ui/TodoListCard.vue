<template>
  <CardSection>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[15px] font-semibold text-[#333]">오늘의 할일</h3>
      <span class="text-[12px] text-[#999]">{{ completed }}/{{ items.length }}</span>
    </div>
    <div class="flex flex-col gap-2">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 py-2"
      >
        <button
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
          :class="item.done ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D0D0D0]'"
          @click="$emit('toggle', item.id)"
        >
          <svg v-if="item.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <span
          class="text-[14px]"
          :class="item.done ? 'text-[#BBB] line-through' : 'text-[#333]'"
        >{{ item.text }}</span>
      </div>
    </div>
  </CardSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardSection from '@user/components/ui/CardSection.vue'

interface TodoItem {
  id: number
  text: string
  done: boolean
}

interface Props {
  items?: TodoItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

defineEmits<{
  toggle: [id: number]
}>()

const completed = computed(() => props.items.filter(i => i.done).length)
</script>
