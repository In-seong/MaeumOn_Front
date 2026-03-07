<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { fetchAgents, sendNotification } from '../../services/adminApi'
import type { AdminAgent } from '../../types'

const router = useRouter()

// 설계사 목록
const agents = ref<AdminAgent[]>([])
const loadingAgents = ref(false)
const search = ref('')

// 선택
const selectedIds = ref<Set<string>>(new Set())
const targetMode = ref<'ALL' | 'SELECTED'>('SELECTED')

// 폼
const title = ref('')
const content = ref('')
const sending = ref(false)
const toast = ref<{ message: string; type: 'success' | 'error' } | null>(null)

// 검색 필터된 설계사
const filteredAgents = computed(() => {
  if (!search.value.trim()) return agents.value
  const q = search.value.trim().toLowerCase()
  return agents.value.filter(a =>
    a.name.toLowerCase().includes(q)
    || (a.phone ?? '').includes(q)
    || (a.employee_number ?? '').toLowerCase().includes(q),
  )
})

// 전체 선택 상태
const allSelected = computed(() =>
  targetMode.value === 'ALL'
  || (filteredAgents.value.length > 0 && filteredAgents.value.every(a => selectedIds.value.has(a.agent_id))),
)

const selectedCount = computed(() =>
  targetMode.value === 'ALL' ? agents.value.length : selectedIds.value.size,
)

const canSend = computed(() =>
  title.value.trim() && content.value.trim() && selectedCount.value > 0,
)

onMounted(async () => {
  loadingAgents.value = true
  try {
    const res = await fetchAgents({ per_page: 200, is_active: true })
    agents.value = (res.data?.data?.data ?? res.data?.data ?? []) as AdminAgent[]
  } catch {
    // handled globally
  } finally {
    loadingAgents.value = false
  }
})

watch(targetMode, (mode) => {
  if (mode === 'ALL') {
    selectedIds.value.clear()
  }
})

function toggleAgent(agentId: string) {
  if (targetMode.value === 'ALL') return
  const next = new Set(selectedIds.value)
  if (next.has(agentId)) {
    next.delete(agentId)
  } else {
    next.add(agentId)
  }
  selectedIds.value = next
}

function toggleAll() {
  if (targetMode.value === 'ALL') {
    targetMode.value = 'SELECTED'
    return
  }
  if (allSelected.value) {
    selectedIds.value = new Set()
  } else {
    selectedIds.value = new Set(filteredAgents.value.map(a => a.agent_id))
  }
}

function selectAll() {
  targetMode.value = 'ALL'
}

async function handleSend() {
  if (!canSend.value || sending.value) return

  sending.value = true
  try {
    const payload = {
      title: title.value.trim(),
      content: content.value.trim(),
      target: targetMode.value,
      ...(targetMode.value === 'SELECTED' ? { agent_ids: [...selectedIds.value] } : {}),
    } as const

    const res = await sendNotification(payload)
    const count = res.data?.data?.sent_count ?? 0
    toast.value = { message: `${count}명의 설계사에게 알림을 발송했습니다.`, type: 'success' }

    // 초기화
    title.value = ''
    content.value = ''
    selectedIds.value = new Set()
    targetMode.value = 'SELECTED'
  } catch {
    toast.value = { message: '알림 발송에 실패했습니다.', type: 'error' }
  } finally {
    sending.value = false
    setTimeout(() => { toast.value = null }, 3000)
  }
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-[22px] font-bold text-[#222]">알림 발송</h1>
        <p class="text-[13px] text-[#999] mt-1">설계사에게 알림 메시지를 발송합니다</p>
      </div>
      <button
        class="text-[13px] text-[#FF7B22] hover:underline"
        @click="router.push({ name: 'notification-history' })"
      >
        발송 이력 보기
      </button>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- 좌측: 수신자 선택 -->
      <div class="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#E8E8E8]">
          <div class="flex items-center justify-between mb-3">
            <h2 class="text-[15px] font-bold text-[#333]">수신자 선택</h2>
            <span class="text-[13px] text-[#FF7B22] font-medium">{{ selectedCount }}명 선택</span>
          </div>

          <!-- 전체 발송 / 선택 발송 토글 -->
          <div class="flex gap-2 mb-3">
            <button
              :class="[
                'flex-1 py-2 rounded-[8px] text-[13px] font-medium transition-colors border',
                targetMode === 'ALL'
                  ? 'bg-[#FF7B22] text-white border-[#FF7B22]'
                  : 'bg-white text-[#666] border-[#DDD] hover:border-[#FF7B22] hover:text-[#FF7B22]',
              ]"
              @click="selectAll"
            >
              전체 발송
            </button>
            <button
              :class="[
                'flex-1 py-2 rounded-[8px] text-[13px] font-medium transition-colors border',
                targetMode === 'SELECTED'
                  ? 'bg-[#FF7B22] text-white border-[#FF7B22]'
                  : 'bg-white text-[#666] border-[#DDD] hover:border-[#FF7B22] hover:text-[#FF7B22]',
              ]"
              @click="targetMode = 'SELECTED'"
            >
              선택 발송
            </button>
          </div>

          <!-- 검색 -->
          <div v-if="targetMode === 'SELECTED'" class="relative">
            <span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#BBB]">search</span>
            <input
              v-model="search"
              type="text"
              placeholder="이름, 전화번호, 사번으로 검색"
              class="w-full pl-10 pr-4 py-2.5 border border-[#DDD] rounded-[8px] text-[13px] focus:outline-none focus:border-[#FF7B22]"
            />
          </div>
        </div>

        <!-- 설계사 목록 -->
        <div class="max-h-[400px] overflow-y-auto">
          <div v-if="loadingAgents" class="py-8 text-center text-[13px] text-[#BBB]">불러오는 중...</div>

          <div v-else-if="targetMode === 'ALL'" class="py-8 text-center">
            <span class="material-symbols-outlined text-[40px] text-[#FF7B22] mb-2">group</span>
            <p class="text-[14px] text-[#666]">전체 활성 설계사 <strong class="text-[#FF7B22]">{{ agents.length }}명</strong>에게 발송됩니다</p>
          </div>

          <template v-else>
            <!-- 전체 선택 체크박스 -->
            <label
              class="flex items-center gap-3 px-5 py-3 border-b border-[#F0F0F0] cursor-pointer hover:bg-[#FAFAFA]"
            >
              <input
                type="checkbox"
                :checked="allSelected"
                class="w-4 h-4 accent-[#FF7B22]"
                @change="toggleAll"
              />
              <span class="text-[13px] font-medium text-[#555]">전체 선택 ({{ filteredAgents.length }}명)</span>
            </label>

            <label
              v-for="agent in filteredAgents"
              :key="agent.agent_id"
              class="flex items-center gap-3 px-5 py-3 border-b border-[#F5F5F5] cursor-pointer hover:bg-[#FFF8F4] transition-colors"
            >
              <input
                type="checkbox"
                :checked="selectedIds.has(agent.agent_id)"
                class="w-4 h-4 accent-[#FF7B22]"
                @change="toggleAgent(agent.agent_id)"
              />
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2">
                  <span class="text-[14px] font-medium text-[#333]">{{ agent.name }}</span>
                  <span v-if="agent.employee_number" class="text-[11px] text-[#BBB]">{{ agent.employee_number }}</span>
                </div>
                <p class="text-[12px] text-[#999]">
                  {{ agent.phone ?? '-' }}
                  <span v-if="agent.office_location"> · {{ agent.office_location }}</span>
                </p>
              </div>
            </label>

            <div v-if="filteredAgents.length === 0" class="py-8 text-center text-[13px] text-[#BBB]">
              검색 결과가 없습니다
            </div>
          </template>
        </div>
      </div>

      <!-- 우측: 메시지 작성 -->
      <div class="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
        <div class="px-5 py-4 border-b border-[#E8E8E8]">
          <h2 class="text-[15px] font-bold text-[#333]">메시지 작성</h2>
        </div>

        <div class="p-5 flex flex-col gap-4">
          <!-- 제목 -->
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1.5">제목 <span class="text-red-500">*</span></label>
            <input
              v-model="title"
              type="text"
              maxlength="200"
              placeholder="알림 제목을 입력하세요"
              class="w-full px-4 py-2.5 border border-[#DDD] rounded-[8px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
            />
            <p class="text-right text-[11px] text-[#BBB] mt-1">{{ title.length }}/200</p>
          </div>

          <!-- 내용 -->
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-1.5">내용 <span class="text-red-500">*</span></label>
            <textarea
              v-model="content"
              maxlength="2000"
              rows="8"
              placeholder="알림 내용을 입력하세요"
              class="w-full px-4 py-3 border border-[#DDD] rounded-[8px] text-[14px] focus:outline-none focus:border-[#FF7B22] resize-none"
            />
            <p class="text-right text-[11px] text-[#BBB] mt-1">{{ content.length }}/2000</p>
          </div>

          <!-- 미리보기 -->
          <div v-if="title.trim() || content.trim()" class="bg-[#FFF8F4] rounded-[10px] p-4 border border-[#FFE0C8]">
            <p class="text-[11px] text-[#FF7B22] font-medium mb-2">미리보기</p>
            <div class="flex items-start gap-3">
              <div class="w-[32px] h-[32px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
                <span class="material-symbols-outlined text-[16px] text-[#FF7B22]">campaign</span>
              </div>
              <div>
                <p class="text-[14px] font-semibold text-[#333]">{{ title || '(제목 없음)' }}</p>
                <p class="text-[13px] text-[#666] mt-0.5 whitespace-pre-line">{{ content || '(내용 없음)' }}</p>
              </div>
            </div>
          </div>

          <!-- 발송 버튼 -->
          <button
            :disabled="!canSend || sending"
            :class="[
              'w-full py-3 rounded-[10px] text-[15px] font-bold transition-colors',
              canSend && !sending
                ? 'bg-[#FF7B22] text-white hover:bg-[#E86B15]'
                : 'bg-[#E8E8E8] text-[#BBB] cursor-not-allowed',
            ]"
            @click="handleSend"
          >
            {{ sending ? '발송 중...' : `${selectedCount}명에게 알림 발송` }}
          </button>
        </div>
      </div>
    </div>

    <!-- 토스트 -->
    <Teleport to="body">
      <Transition name="toast">
        <div
          v-if="toast"
          :class="[
            'fixed top-6 left-1/2 -translate-x-1/2 z-[9999] px-6 py-3 rounded-[10px] shadow-lg text-[14px] font-medium',
            toast.type === 'success' ? 'bg-[#1FBD53] text-white' : 'bg-[#FF3B30] text-white',
          ]"
        >
          {{ toast.message }}
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translate(-50%, -20px);
}
</style>
