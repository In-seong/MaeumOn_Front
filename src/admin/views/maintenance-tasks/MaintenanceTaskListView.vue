<template>
  <div class="p-4 lg:p-6">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
      <div>
        <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">요청 관리</h1>
        <p class="text-[13px] text-[#999] mt-1">
          진행 {{ openCount }}건 · 완료 {{ doneCount }}건 · 전체 {{ store.pagination.total }}건
        </p>
      </div>
      <button
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
        @click="openModal(null)"
      >
        + 등록
      </button>
    </div>

    <!-- Filters -->
    <div class="mb-4 flex flex-wrap gap-2">
      <button
        v-for="f in statusFilters"
        :key="f.value"
        class="px-3 py-1.5 rounded-full text-[12px] font-medium border transition-colors"
        :class="statusFilter === f.value
          ? 'bg-[#FF7B22] text-white border-[#FF7B22]'
          : 'bg-[#F8F8F8] text-[#666] border-[#E8E8E8] hover:border-[#FF7B22]'"
        @click="statusFilter = f.value; fetchData()"
      >
        {{ f.label }}
        <span
          v-if="f.count > 0"
          class="ml-1 px-1.5 rounded-full text-[11px]"
          :class="statusFilter === f.value ? 'bg-white/30' : 'bg-[#E8E8E8]'"
        >{{ f.count }}</span>
      </button>
    </div>

    <!-- Loading -->
    <div v-if="store.loading && store.tasks.length === 0" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- Error -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- Table -->
    <div v-else-if="store.tasks.length > 0" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-10">No.</th>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-16">우선순위</th>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">제목</th>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-20">상태</th>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-16">경로</th>
            <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider w-24">등록일</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="(task, idx) in sortedTasks"
            :key="task.id"
            class="hover:bg-[#FAFAFA] transition-colors cursor-pointer"
            @click="openModal(task)"
          >
            <td class="px-4 py-3.5 text-[13px] text-[#999]">{{ idx + 1 }}</td>
            <td class="px-4 py-3.5">
              <span class="text-[11px] font-bold px-2 py-0.5 rounded" :class="priorityClass(task.priority)">
                {{ task.priority }}
              </span>
            </td>
            <td class="px-4 py-3.5">
              <div class="text-[14px] font-medium text-[#333]">{{ task.title }}</div>
              <div v-if="task.description" class="text-[12px] text-[#999] mt-0.5 line-clamp-1">{{ task.description }}</div>
            </td>
            <td class="px-4 py-3.5">
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded" :class="statusClass(task.status)">
                {{ task.status }}
              </span>
            </td>
            <td class="px-4 py-3.5 text-[12px] text-[#999]">{{ task.source || '-' }}</td>
            <td class="px-4 py-3.5 text-[12px] text-[#999] tabular-nums">{{ formatDate(task.created_at) }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty -->
    <div v-else class="text-center py-16">
      <span class="material-symbols-outlined text-[48px] text-[#DDD]">assignment</span>
      <p class="mt-2 text-[14px] text-[#999]">등록된 요청이 없습니다.</p>
    </div>

    <!-- Modal -->
    <Teleport to="body">
      <div v-if="showModal" class="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" @click.self="closeModal">
        <div class="bg-white rounded-[16px] w-full max-w-[480px] max-h-[90vh] overflow-y-auto p-5 shadow-xl">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">{{ editing ? '요청 수정' : '요청 등록' }}</h2>

          <div class="flex flex-col gap-3.5">
            <!-- 제목 -->
            <div>
              <label class="text-[12px] font-medium text-[#666] mb-1 block">제목 *</label>
              <input
                v-model="form.title"
                type="text"
                maxlength="200"
                placeholder="요청 제목"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-3.5 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] text-[#333]"
              />
            </div>

            <!-- 설명 -->
            <div>
              <label class="text-[12px] font-medium text-[#666] mb-1 block">설명</label>
              <textarea
                v-model="form.description"
                maxlength="2000"
                placeholder="상세 내용 (선택)"
                rows="3"
                class="w-full bg-[#F8F8F8] rounded-[10px] px-3.5 py-2.5 text-[14px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] text-[#333] resize-vertical"
              />
            </div>

            <!-- 우선순위 -->
            <div>
              <label class="text-[12px] font-medium text-[#666] mb-1 block">우선순위</label>
              <div class="flex gap-2">
                <button
                  v-for="p in priorities"
                  :key="p"
                  type="button"
                  class="flex-1 py-2 rounded-[8px] text-[12px] font-semibold border transition-all"
                  :class="form.priority === p ? priorityBtnClass(p) : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                  @click="form.priority = p"
                >{{ p }}</button>
              </div>
            </div>

            <!-- 상태 -->
            <div>
              <label class="text-[12px] font-medium text-[#666] mb-1 block">상태</label>
              <div class="flex flex-wrap gap-1.5">
                <button
                  v-for="s in statuses"
                  :key="s"
                  type="button"
                  class="px-3 py-1.5 rounded-[8px] text-[12px] font-semibold border transition-all"
                  :class="form.status === s ? statusBtnClass(s) : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                  @click="form.status = s"
                >{{ s }}</button>
              </div>
            </div>

            <!-- 요청 경로 -->
            <div>
              <label class="text-[12px] font-medium text-[#666] mb-1 block">요청 경로</label>
              <div class="flex gap-2">
                <button
                  v-for="src in sources"
                  :key="src"
                  type="button"
                  class="flex-1 py-2 rounded-[8px] text-[12px] font-medium border transition-all"
                  :class="form.source === src ? 'bg-[#FFF3ED] border-[#FF7B22] text-[#FF7B22]' : 'bg-[#F8F8F8] border-[#E8E8E8] text-[#999]'"
                  @click="form.source = src"
                >{{ src }}</button>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 mt-5">
            <button
              class="flex-1 py-2.5 rounded-[10px] text-[14px] font-medium bg-[#F8F8F8] text-[#666]"
              @click="closeModal"
            >취소</button>
            <button
              v-if="editing"
              class="py-2.5 px-4 rounded-[10px] text-[14px] font-medium bg-red-50 text-red-500 hover:bg-red-100 transition-colors"
              :disabled="saving"
              @click="handleDelete"
            >삭제</button>
            <button
              class="flex-1 py-2.5 rounded-[10px] text-[14px] font-medium bg-[#FF7B22] text-white hover:bg-[#E56D1E] transition-colors"
              :disabled="saving || !form.title.trim()"
              @click="handleSave"
            >{{ editing ? '저장' : '등록' }}</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import type { MaintenanceTask } from '../../types'
import { useMaintenanceTaskStore } from '../../stores/maintenanceTaskStore'

const store = useMaintenanceTaskStore()
const statusFilter = ref('')
const showModal = ref(false)
const saving = ref(false)
const editing = ref<MaintenanceTask | null>(null)

const priorities = ['P0', 'P1', 'P2', 'P3'] as const
const statuses = ['요청', '진행중', '완료', '테스트완료', '테스트실패', '보류'] as const
const sources = ['카톡', '회의', '직접입력', '기타'] as const

const form = ref({
  title: '',
  description: '',
  priority: 'P1' as string,
  status: '요청' as string,
  source: '카톡' as string,
})

const openCount = computed(() => store.tasks.filter(t => !['완료', '테스트완료'].includes(t.status)).length)
const doneCount = computed(() => store.tasks.filter(t => ['완료', '테스트완료'].includes(t.status)).length)

const statusFilters = computed(() => {
  const counts: Record<string, number> = {}
  for (const t of store.tasks) counts[t.status] = (counts[t.status] || 0) + 1
  return [
    { value: '', label: '전체', count: store.tasks.length },
    ...statuses.filter(s => counts[s]).map(s => ({ value: s, label: s, count: counts[s] || 0 })),
  ]
})

const sortedTasks = computed(() => {
  const filtered = statusFilter.value
    ? store.tasks.filter(t => t.status === statusFilter.value)
    : store.tasks
  return [...filtered].sort((a, b) => {
    const pi = priorities.indexOf(a.priority as typeof priorities[number]) - priorities.indexOf(b.priority as typeof priorities[number])
    if (pi !== 0) return pi
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  })
})

function priorityClass(p: string) {
  const map: Record<string, string> = {
    P0: 'bg-red-50 text-red-600',
    P1: 'bg-amber-50 text-amber-600',
    P2: 'bg-blue-50 text-blue-600',
    P3: 'bg-gray-100 text-gray-500',
  }
  return map[p] || ''
}

function statusClass(s: string) {
  const map: Record<string, string> = {
    '요청': 'bg-blue-50 text-blue-600',
    '진행중': 'bg-amber-50 text-amber-600',
    '완료': 'bg-green-50 text-green-600',
    '테스트완료': 'bg-emerald-50 text-emerald-600',
    '테스트실패': 'bg-red-50 text-red-600',
    '보류': 'bg-purple-50 text-purple-600',
  }
  return map[s] || ''
}

function priorityBtnClass(p: string) {
  const map: Record<string, string> = {
    P0: 'bg-red-50 border-red-400 text-red-600',
    P1: 'bg-amber-50 border-amber-400 text-amber-600',
    P2: 'bg-blue-50 border-blue-400 text-blue-600',
    P3: 'bg-gray-100 border-gray-400 text-gray-600',
  }
  return map[p] || ''
}

function statusBtnClass(s: string) {
  const map: Record<string, string> = {
    '요청': 'bg-blue-50 border-blue-400 text-blue-600',
    '진행중': 'bg-amber-50 border-amber-400 text-amber-600',
    '완료': 'bg-green-50 border-green-400 text-green-600',
    '테스트완료': 'bg-emerald-50 border-emerald-400 text-emerald-600',
    '테스트실패': 'bg-red-50 border-red-400 text-red-600',
    '보류': 'bg-purple-50 border-purple-400 text-purple-600',
  }
  return map[s] || ''
}

function formatDate(iso: string) {
  const d = new Date(iso)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function openModal(task: MaintenanceTask | null) {
  editing.value = task
  if (task) {
    form.value = {
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      status: task.status,
      source: task.source || '카톡',
    }
  } else {
    form.value = { title: '', description: '', priority: 'P1', status: '요청', source: '카톡' }
  }
  showModal.value = true
}

function closeModal() {
  showModal.value = false
  editing.value = null
}

async function handleSave() {
  if (!form.value.title.trim()) return
  saving.value = true
  try {
    const data = { ...form.value, title: form.value.title.trim(), description: form.value.description.trim() || null }
    if (editing.value) {
      await store.editTask(editing.value.id, data)
    } else {
      await store.addTask(data)
    }
    closeModal()
    fetchData()
  } catch {
    // error handled in store
  } finally {
    saving.value = false
  }
}

async function handleDelete() {
  if (!editing.value) return
  saving.value = true
  try {
    await store.removeTask(editing.value.id)
    closeModal()
  } catch {
    // error handled in store
  } finally {
    saving.value = false
  }
}

function fetchData() {
  const params: Record<string, unknown> = { per_page: 100 }
  if (statusFilter.value) params.status = statusFilter.value
  store.loadTasks(params)
}

onMounted(() => fetchData())
</script>

<style scoped>
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.tabular-nums {
  font-variant-numeric: tabular-nums;
}
</style>
