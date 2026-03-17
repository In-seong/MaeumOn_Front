<template>
  <CardSection>
    <div class="flex items-center justify-between mb-3">
      <h3 class="text-[15px] font-semibold text-[#333]">오늘의 할일</h3>
      <span v-if="items.length > 0" class="text-[12px] text-[#999]">{{ completed }}/{{ items.length }}</span>
    </div>

    <!-- 빈 상태 -->
    <div v-if="items.length === 0" class="flex flex-col items-center py-6">
      <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="28" fill="#FFF3ED" stroke="#FFD4B8" stroke-width="1.5"/>
        <path d="M22 32L28 38L42 24" stroke="#FF7B22" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <p class="mt-3 text-[14px] font-medium text-[#999]">오늘 할일을 모두 완료했어요!</p>
      <p class="text-[12px] text-[#BBB] mt-1">새로운 할일이 생기면 여기에 표시됩니다</p>
    </div>

    <!-- 할일 목록 -->
    <div v-else class="flex flex-col gap-1">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 py-2 rounded-[8px] px-1 -mx-1 transition-colors"
        :class="item.route ? 'cursor-pointer active:bg-[#F5F5F5]' : ''"
        @click="item.route && !item.canToggle ? $emit('navigate', item.route) : undefined"
      >
        <!-- 토글 가능 체크버튼 -->
        <button
          v-if="item.canToggle"
          class="w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-colors"
          :class="item.done ? 'bg-[#FF7B22] border-[#FF7B22]' : 'border-[#D0D0D0]'"
          @click.stop="$emit('toggle', item.id)"
        >
          <svg v-if="item.done" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>
        </button>
        <!-- 토글 불가 타입 아이콘 -->
        <span v-else class="w-5 h-5 flex items-center justify-center flex-shrink-0 text-[14px]">
          {{ typeIcon[item.type] ?? '📌' }}
        </span>

        <div class="flex-1 min-w-0">
          <span
            class="text-[14px] block truncate"
            :class="item.done ? 'text-[#BBB] line-through' : 'text-[#333]'"
          >{{ item.text }}</span>
          <span v-if="item.subtitle" class="text-[11px] text-[#999] block truncate">{{ item.subtitle }}</span>
        </div>

        <!-- 상세 이동 화살표 (토글 불가 항목) -->
        <svg v-if="item.route && !item.canToggle" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#CCC" stroke-width="2" stroke-linecap="round" class="flex-shrink-0">
          <polyline points="9 18 15 12 9 6"/>
        </svg>
      </div>
    </div>
  </CardSection>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import CardSection from '@user/components/ui/CardSection.vue'

interface TodoItem {
  id: string
  text: string
  done: boolean
  type: string
  subtitle?: string
  canToggle: boolean
  route?: string
}

interface Props {
  items?: TodoItem[]
}

const props = withDefaults(defineProps<Props>(), {
  items: () => []
})

defineEmits<{
  toggle: [id: string]
  navigate: [route: string]
}>()

const completed = computed(() => props.items.filter(i => i.done).length)

const typeIcon: Record<string, string> = {
  consultation: '💬',
  assignment: '📋',
  claim: '📄',
  obligation: '⚠️',
  calendar: '📌',
}
</script>
