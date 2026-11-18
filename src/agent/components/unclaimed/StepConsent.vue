<template>
  <div class="space-y-4">
    <h3 class="text-[16px] font-bold text-[#222]">동의서 확인</h3>
    <p class="text-[13px] text-[#888]">숨은 보험금 찾기 서비스 이용을 위해 아래 동의서를 확인하고 동의해주세요.</p>

    <!-- 전체 동의 -->
    <label class="flex items-center gap-3 bg-[#FF6B2D] rounded-[14px] p-4 cursor-pointer">
      <div
        :class="[
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
          allAgreed ? 'border-white bg-white' : 'border-white/60'
        ]"
      >
        <svg v-if="allAgreed" class="w-3 h-3 text-[#FF6B2D]" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
      </div>
      <span class="text-[14px] font-bold text-white" @click="toggleAll">전체 동의</span>
    </label>

    <!-- 로딩 -->
    <div v-if="loading" class="text-center py-8">
      <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-[#FF6B2D] mx-auto" />
    </div>

    <!-- 개별 동의서 -->
    <div v-else class="space-y-2">
      <div
        v-for="(item, idx) in consentItems"
        :key="item.consent_template_id"
        class="bg-white rounded-[14px] border border-[#E8E8E8] overflow-hidden"
      >
        <div class="flex items-center gap-3 p-4">
          <label class="flex items-center gap-3 flex-1 cursor-pointer" @click.prevent="toggleItem(idx)">
            <div
              :class="[
                'w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors',
                item.agreed ? 'border-[#FF6B2D] bg-[#FF6B2D]' : 'border-[#DDD]'
              ]"
            >
              <svg v-if="item.agreed" class="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd"/></svg>
            </div>
            <span class="text-[13px] text-[#333] font-medium">[필수] {{ item.title }}</span>
          </label>
          <button
            class="text-[12px] text-[#999] underline shrink-0"
            @click="toggleExpand(idx)"
          >
            {{ expandedIdx === idx ? '접기' : '보기' }}
          </button>
        </div>
        <div v-if="expandedIdx === idx" class="px-4 pb-4 border-t border-[#F0F0F0]">
          <div class="text-[12px] text-[#666] leading-relaxed mt-3 max-h-[300px] overflow-y-auto consent-content" v-html="item.content" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { ConsentTemplateItem } from '../../types'
import { fetchUnclaimedConsentTemplates } from '../../services/agentApi'

interface ConsentItem extends ConsentTemplateItem {
  agreed: boolean
}

const emit = defineEmits<{
  'update:templateIds': [ids: number[]]
  'update:allAgreed': [agreed: boolean]
}>()

const consentItems = ref<ConsentItem[]>([])
const loading = ref(true)
const expandedIdx = ref<number | null>(null)

const allAgreed = computed(() =>
  consentItems.value.length > 0 && consentItems.value.every(i => i.agreed)
)

onMounted(async () => {
  try {
    const res = await fetchUnclaimedConsentTemplates()
    consentItems.value = res.data.data.map(t => ({ ...t, agreed: false }))
  } catch {
    // 로딩 실패 시 빈 배열
  } finally {
    loading.value = false
  }
})

function toggleItem(idx: number) {
  const item = consentItems.value[idx]
  if (!item) return
  item.agreed = !item.agreed
  emitState()
}

function toggleAll() {
  const newVal = !allAgreed.value
  consentItems.value.forEach(i => { i.agreed = newVal })
  emitState()
}

function toggleExpand(idx: number) {
  expandedIdx.value = expandedIdx.value === idx ? null : idx
}

function emitState() {
  const ids = consentItems.value.filter(i => i.agreed).map(i => i.consent_template_id)
  emit('update:templateIds', ids)
  emit('update:allAgreed', allAgreed.value)
}
</script>

<style scoped>
.consent-content :deep(h3) { font-size: 14px; font-weight: 700; margin-bottom: 8px; }
.consent-content :deep(h4) { font-size: 13px; font-weight: 600; margin-top: 12px; margin-bottom: 4px; }
.consent-content :deep(ul) { padding-left: 16px; list-style: disc; }
.consent-content :deep(li) { margin-bottom: 2px; }
.consent-content :deep(ol) { padding-left: 16px; list-style: decimal; }
.consent-content :deep(p) { margin-bottom: 6px; }
</style>
