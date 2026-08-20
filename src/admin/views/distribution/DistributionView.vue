<template>
  <div class="p-4 lg:p-6">
    <h1 class="text-[18px] lg:text-[22px] font-bold text-[#333] mb-6">자동배분 관리</h1>

    <!-- 지사 선택 -->
    <div class="mb-6">
      <select
        v-model="selectedBranchId"
        class="px-4 py-2.5 border border-[#E0E0E0] rounded-[12px] text-[14px] text-[#333] bg-white focus:outline-none focus:border-[#FF7B22]"
        @change="loadConfig"
      >
        <option :value="0" disabled>지사를 선택하세요</option>
        <option v-for="b in branches" :key="b.branch_id" :value="b.branch_id">
          {{ b.branch_name }}
        </option>
      </select>
    </div>

    <template v-if="selectedBranchId > 0">
      <!-- 자동배분 on/off -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-6">
        <div class="flex items-center justify-between">
          <div>
            <h2 class="text-[15px] font-medium text-[#333]">자동배분 상태</h2>
            <p class="text-[13px] text-[#999] mt-1">
              {{ config?.is_active ? '활성화 중 — 새 고객 등록 시 자동 배분됩니다' : '비활성화 — 수동 배분만 가능합니다' }}
            </p>
            <p v-if="config?.is_active && config?.current_list" class="text-[12px] text-[#FF7B22] mt-1">
              현재 리스트: {{ config.current_list.name }} / 다음 배분 순서: {{ (config.current_position || 0) + 1 }}번
            </p>
          </div>
          <button
            class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors"
            :class="config?.is_active ? 'bg-[#FF7B22]' : 'bg-[#CCC]'"
            @click="handleToggle"
          >
            <span
              class="inline-block h-6 w-6 rounded-full bg-white shadow transition-transform"
              :class="config?.is_active ? 'translate-x-7' : 'translate-x-1'"
            />
          </button>
        </div>
      </div>

      <!-- 리스트 관리 -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <!-- 저장된 리스트 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-[15px] font-medium text-[#333]">배분 순서 리스트</h2>
            <button
              class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[8px] text-[13px] hover:bg-[#E56D1E] transition-colors"
              @click="showCreateModal = true"
            >
              새 리스트
            </button>
          </div>

          <div v-if="lists.length === 0" class="text-center py-8 text-[14px] text-[#999]">
            저장된 리스트가 없습니다
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="list in lists"
              :key="list.list_id"
              class="border rounded-[12px] p-4 transition-colors"
              :class="config?.current_list_id === list.list_id ? 'border-[#FF7B22] bg-[#FFF8F3]' : 'border-[#E8E8E8] hover:border-[#CCC]'"
            >
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-[14px] font-medium text-[#333]">
                    {{ list.name }}
                    <span v-if="config?.current_list_id === list.list_id" class="text-[11px] text-[#FF7B22] ml-2">사용 중</span>
                  </p>
                  <p class="text-[12px] text-[#999] mt-1">설계사 {{ list.items_count }}명</p>
                </div>
                <div class="flex items-center gap-2">
                  <button
                    v-if="config?.current_list_id !== list.list_id"
                    class="px-2.5 py-1 text-[12px] border border-[#FF7B22] text-[#FF7B22] rounded-[6px] hover:bg-[#FFF3ED]"
                    @click="handleActivateList(list.list_id)"
                  >
                    사용
                  </button>
                  <button
                    class="px-2.5 py-1 text-[12px] border border-[#E0E0E0] text-[#666] rounded-[6px] hover:bg-[#F5F5F5]"
                    @click="openEditModal(list)"
                  >
                    수정
                  </button>
                  <button
                    v-if="config?.current_list_id !== list.list_id"
                    class="px-2.5 py-1 text-[12px] text-red-500 border border-red-200 rounded-[6px] hover:bg-red-50"
                    @click="handleDeleteList(list.list_id)"
                  >
                    삭제
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 현재 리스트 상세 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[15px] font-medium text-[#333] mb-4">
            {{ activeListDetail ? `현재 리스트: ${activeListDetail.name}` : '리스트 상세' }}
          </h2>

          <div v-if="!activeListDetail" class="text-center py-8 text-[14px] text-[#999]">
            사용 중인 리스트가 없습니다
          </div>

          <div v-else>
            <div class="space-y-2">
              <div
                v-for="(item, idx) in activeListDetail.items"
                :key="item.item_id"
                class="flex items-center gap-3 px-3 py-2.5 rounded-[8px] transition-colors"
                :class="config && idx === config.current_position ? 'bg-[#FFF3ED] border border-[#FF7B22]' : 'bg-[#FAFAFA]'"
              >
                <span class="w-7 h-7 flex items-center justify-center rounded-full text-[12px] font-bold"
                  :class="config && idx === config.current_position ? 'bg-[#FF7B22] text-white' : 'bg-[#E8E8E8] text-[#666]'"
                >
                  {{ item.position }}
                </span>
                <div class="flex-1 min-w-0">
                  <p class="text-[14px] text-[#333] font-medium truncate">{{ item.agent?.name }}</p>
                  <p class="text-[12px] text-[#999]">{{ item.agent?.employee_number || '' }}</p>
                </div>
                <span v-if="config && idx === config.current_position" class="text-[11px] text-[#FF7B22] font-medium shrink-0">
                  다음 배분
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 대기열 현황 -->
      <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="flex items-center justify-between mb-4">
          <h2 class="text-[15px] font-medium text-[#333]">배분 대기열</h2>
          <select
            v-model="queueStatusFilter"
            class="px-3 py-1.5 border border-[#E0E0E0] rounded-[8px] text-[13px] bg-white"
            @change="loadQueue"
          >
            <option value="">전체</option>
            <option value="pending">대기 중</option>
            <option value="assigned">배분됨</option>
            <option value="completed">완료</option>
          </select>
        </div>

        <div v-if="queue.length === 0" class="text-center py-8 text-[14px] text-[#999]">
          대기열이 비어있습니다
        </div>

        <div v-else class="overflow-x-auto">
          <table class="min-w-full divide-y divide-[#E8E8E8]">
            <thead class="bg-[#FAFAFA]">
              <tr>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">고객</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">상태</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">배분 설계사</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">배분 예정</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">확인 시각</th>
                <th class="px-4 py-3 text-left text-[12px] font-medium text-[#999]">재배분</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#F0F0F0]">
              <tr v-for="item in queue" :key="item.queue_id" class="hover:bg-[#FAFAFA]">
                <td class="px-4 py-3 text-[14px] text-[#333]">{{ item.customer?.name || item.customer_id }}</td>
                <td class="px-4 py-3">
                  <span class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                    :class="{
                      'bg-yellow-100 text-yellow-700': item.status === 'pending',
                      'bg-blue-100 text-blue-700': item.status === 'assigned',
                      'bg-green-100 text-green-700': item.status === 'completed',
                      'bg-red-100 text-red-600': item.status === 'failed',
                    }"
                  >
                    {{ statusLabels[item.status] }}
                  </span>
                </td>
                <td class="px-4 py-3 text-[14px] text-[#666]">{{ item.assigned_agent?.name || '-' }}</td>
                <td class="px-4 py-3 text-[13px] text-[#999]">{{ formatDateTime(item.scheduled_at) }}</td>
                <td class="px-4 py-3 text-[13px] text-[#999]">{{ item.viewed_at ? formatDateTime(item.viewed_at) : '-' }}</td>
                <td class="px-4 py-3 text-[13px] text-[#999]">{{ item.timeout_count }}회</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>

    <!-- 리스트 생성/수정 모달 -->
    <div v-if="showCreateModal || editingList" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[16px] w-full max-w-lg max-h-[80vh] flex flex-col">
        <div class="p-6 border-b border-[#F0F0F0]">
          <div class="flex items-center justify-between">
            <h3 class="text-[16px] font-bold text-[#333]">
              {{ editingList ? '리스트 수정' : '새 배분 리스트' }}
            </h3>
            <button class="text-[#999] hover:text-[#333]" @click="closeModal">
              <span class="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        <div class="p-6 overflow-y-auto flex-1">
          <div class="mb-4">
            <label class="block text-[13px] text-[#666] mb-1">리스트 이름</label>
            <input
              v-model="modalListName"
              type="text"
              class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
              placeholder="예: 서울1팀 기본순서"
            />
          </div>

          <!-- 설계사 검색/추가 -->
          <div class="mb-4">
            <label class="block text-[13px] text-[#666] mb-1">설계사 검색</label>
            <input
              v-model="agentSearchQuery"
              type="text"
              class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[8px] text-[14px] focus:outline-none focus:border-[#FF7B22]"
              placeholder="이름 또는 사번으로 검색"
            />
            <div v-if="filteredAgents.length > 0" class="mt-2 max-h-40 overflow-y-auto border border-[#E8E8E8] rounded-[8px]">
              <button
                v-for="agent in filteredAgents"
                :key="agent.agent_id"
                class="w-full px-3 py-2 text-left text-[13px] hover:bg-[#FFF3ED] flex items-center justify-between border-b border-[#F5F5F5] last:border-0"
                @click="addAgent(agent)"
              >
                <span>{{ agent.name }} <span class="text-[#999]">{{ agent.employee_number || '' }}</span></span>
                <span class="material-symbols-outlined text-[16px] text-[#FF7B22]">add</span>
              </button>
            </div>
          </div>

          <!-- 선택된 설계사 리스트 (순서) -->
          <div>
            <label class="block text-[13px] text-[#666] mb-1">배분 순서 ({{ modalSelectedAgents.length }}명)</label>
            <div v-if="modalSelectedAgents.length === 0" class="text-center py-6 text-[13px] text-[#999] border border-dashed border-[#E0E0E0] rounded-[8px]">
              설계사를 추가하세요
            </div>
            <div v-else class="space-y-1">
              <div
                v-for="(agent, idx) in modalSelectedAgents"
                :key="agent.agent_id"
                class="flex items-center gap-2 px-3 py-2 bg-[#FAFAFA] rounded-[8px]"
              >
                <span class="w-6 h-6 flex items-center justify-center bg-[#FF7B22] text-white rounded-full text-[11px] font-bold">
                  {{ idx + 1 }}
                </span>
                <span class="flex-1 text-[13px] text-[#333]">{{ agent.name }}</span>
                <div class="flex items-center gap-1">
                  <button
                    v-if="idx > 0"
                    class="text-[#999] hover:text-[#333]"
                    @click="moveAgent(idx, idx - 1)"
                  >
                    <span class="material-symbols-outlined text-[18px]">arrow_upward</span>
                  </button>
                  <button
                    v-if="idx < modalSelectedAgents.length - 1"
                    class="text-[#999] hover:text-[#333]"
                    @click="moveAgent(idx, idx + 1)"
                  >
                    <span class="material-symbols-outlined text-[18px]">arrow_downward</span>
                  </button>
                  <button class="text-red-400 hover:text-red-600 ml-1" @click="removeAgent(idx)">
                    <span class="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="p-6 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button
            class="px-4 py-2.5 border border-[#E0E0E0] text-[#666] rounded-[12px] text-[14px] hover:bg-[#F5F5F5]"
            @click="closeModal"
          >
            취소
          </button>
          <button
            class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] hover:bg-[#E56D1E] disabled:opacity-50"
            :disabled="!modalListName || modalSelectedAgents.length === 0 || saving"
            @click="handleSaveList"
          >
            {{ saving ? '저장 중...' : (editingList ? '수정' : '저장') }}
          </button>
        </div>
      </div>
    </div>

    <!-- 재시작 확인 모달 -->
    <div v-if="resumeInfo" class="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div class="bg-white rounded-[16px] w-full max-w-sm p-6">
        <h3 class="text-[16px] font-bold text-[#333] mb-3">자동배분 재시작</h3>
        <p class="text-[14px] text-[#666] mb-6">{{ resumeInfo.message }}</p>
        <div class="flex justify-end gap-3">
          <button
            v-if="!resumeInfo.list_changed"
            class="px-4 py-2.5 border border-[#E0E0E0] text-[#666] rounded-[12px] text-[14px]"
            @click="handleResetPosition"
          >
            1번부터 시작
          </button>
          <button
            class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] hover:bg-[#E56D1E]"
            @click="resumeInfo = null"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  fetchBranches,
  fetchDistributionConfig,
  toggleDistribution,
  setDistributionPosition,
  fetchDistributionLists,
  fetchDistributionList,
  saveDistributionList,
  updateDistributionList,
  deleteDistributionList,
  activateDistributionList,
  fetchDistributionQueue,
  fetchAgents,
  type DistributionConfig,
  type DistributionList,
  type DistributionQueueItem,
  type BranchData,
} from '../../services/adminApi'

const branches = ref<BranchData[]>([])
const selectedBranchId = ref(0)
const config = ref<DistributionConfig | null>(null)
const lists = ref<DistributionList[]>([])
const activeListDetail = ref<DistributionList | null>(null)
const queue = ref<DistributionQueueItem[]>([])
const queueStatusFilter = ref('')

const showCreateModal = ref(false)
const editingList = ref<DistributionList | null>(null)
const modalListName = ref('')
const modalSelectedAgents = ref<{ agent_id: string; name: string; employee_number?: string }[]>([])
const agentSearchQuery = ref('')
const allAgents = ref<{ agent_id: string; name: string; employee_number?: string }[]>([])
const saving = ref(false)
const resumeInfo = ref<Record<string, unknown> | null>(null)

const statusLabels: Record<string, string> = {
  pending: '대기 중',
  assigned: '배분됨',
  completed: '완료',
  failed: '실패',
}

const filteredAgents = computed(() => {
  const q = agentSearchQuery.value.trim().toLowerCase()
  if (!q) return []
  const selectedIds = new Set(modalSelectedAgents.value.map(a => a.agent_id))
  return allAgents.value.filter(a =>
    !selectedIds.has(a.agent_id) &&
    (a.name.toLowerCase().includes(q) || (a.employee_number || '').toLowerCase().includes(q))
  ).slice(0, 10)
})

function formatDateTime(dt: string | null): string {
  if (!dt) return '-'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return `${d.getMonth() + 1}/${d.getDate()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadBranches() {
  try {
    const res = await fetchBranches()
    const data = res.data.data
    branches.value = Array.isArray(data) ? data : (data as unknown as { data: BranchData[] }).data || []
  } catch { /* ignore */ }
}

async function loadConfig() {
  if (!selectedBranchId.value) return
  try {
    const res = await fetchDistributionConfig({ branch_id: selectedBranchId.value })
    const data = res.data.data
    config.value = Array.isArray(data) ? data.find(c => c.branch_id === selectedBranchId.value) || null : data as DistributionConfig
  } catch {
    config.value = null
  }
  await Promise.all([loadLists(), loadQueue()])
  if (config.value?.current_list_id) {
    await loadActiveListDetail()
  } else {
    activeListDetail.value = null
  }
}

async function loadLists() {
  if (!selectedBranchId.value) return
  try {
    const res = await fetchDistributionLists(selectedBranchId.value)
    lists.value = res.data.data || []
  } catch {
    lists.value = []
  }
}

async function loadActiveListDetail() {
  if (!config.value?.current_list_id || !selectedBranchId.value) return
  try {
    const res = await fetchDistributionList(selectedBranchId.value, config.value.current_list_id)
    activeListDetail.value = res.data.data || null
  } catch {
    activeListDetail.value = null
  }
}

async function loadQueue() {
  if (!selectedBranchId.value) return
  try {
    const params: Record<string, unknown> = { branch_id: selectedBranchId.value }
    if (queueStatusFilter.value) params.status = queueStatusFilter.value
    const res = await fetchDistributionQueue(params)
    const pageData = res.data.data
    queue.value = pageData?.data || []
  } catch {
    queue.value = []
  }
}

async function loadAgents() {
  try {
    const params: Record<string, unknown> = { per_page: 100, is_active: 'true' }
    if (selectedBranchId.value) params.branch_id = selectedBranchId.value
    const res = await fetchAgents(params)
    const pageData = res.data.data
    const items = (pageData as unknown as { data: { agent_id: string; name: string; employee_number?: string }[] }).data || []
    allAgents.value = items
  } catch { /* ignore */ }
}

async function handleToggle() {
  if (!selectedBranchId.value) return
  try {
    const res = await toggleDistribution(selectedBranchId.value)
    const data = res.data.data
    if (data?.resume_info) {
      resumeInfo.value = data.resume_info as Record<string, unknown>
    }
    await loadConfig()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    alert(err.response?.data?.message || '오류가 발생했습니다')
  }
}

async function handleResetPosition() {
  if (!selectedBranchId.value) return
  await setDistributionPosition(selectedBranchId.value, 0)
  resumeInfo.value = null
  await loadConfig()
}

async function handleActivateList(listId: number) {
  if (!selectedBranchId.value) return
  await activateDistributionList(selectedBranchId.value, listId)
  await loadConfig()
}

async function handleDeleteList(listId: number) {
  if (!confirm('이 리스트를 삭제하시겠습니까?')) return
  try {
    await deleteDistributionList(selectedBranchId.value, listId)
    await loadLists()
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } } }
    alert(err.response?.data?.message || '삭제에 실패했습니다')
  }
}

function openEditModal(list: DistributionList) {
  editingList.value = list
  modalListName.value = list.name
  modalSelectedAgents.value = []
  loadListForEdit(list.list_id)
}

async function loadListForEdit(listId: number) {
  try {
    const res = await fetchDistributionList(selectedBranchId.value, listId)
    const detail = res.data.data
    if (detail?.items) {
      modalSelectedAgents.value = detail.items.map(item => ({
        agent_id: item.agent_id,
        name: item.agent?.name || item.agent_id,
        employee_number: item.agent?.employee_number,
      }))
    }
  } catch { /* ignore */ }
}

function addAgent(agent: { agent_id: string; name: string; employee_number?: string }) {
  modalSelectedAgents.value.push({ ...agent })
  agentSearchQuery.value = ''
}

function removeAgent(idx: number) {
  modalSelectedAgents.value.splice(idx, 1)
}

function moveAgent(from: number, to: number) {
  const list = modalSelectedAgents.value
  const item = list[from]
  if (!item) return
  list.splice(from, 1)
  list.splice(to, 0, item)
}

function closeModal() {
  showCreateModal.value = false
  editingList.value = null
  modalListName.value = ''
  modalSelectedAgents.value = []
  agentSearchQuery.value = ''
}

async function handleSaveList() {
  if (!modalListName.value || modalSelectedAgents.value.length === 0) return
  saving.value = true
  try {
    const agentIds = modalSelectedAgents.value.map(a => a.agent_id)
    if (editingList.value) {
      await updateDistributionList(selectedBranchId.value, editingList.value.list_id, {
        name: modalListName.value,
        agent_ids: agentIds,
      })
    } else {
      await saveDistributionList(selectedBranchId.value, {
        name: modalListName.value,
        agent_ids: agentIds,
      })
    }
    closeModal()
    await loadConfig()
  } catch {
    alert('저장에 실패했습니다')
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadBranches()
  await loadAgents()
})
</script>
