<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">지사 관리</h1>
      <button
        @click="showCreateModal = true"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        지사 추가
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <div
        v-for="branch in branches"
        :key="branch.branch_id"
        class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5"
      >
        <div class="flex items-start justify-between mb-3">
          <div>
            <h3 class="text-[16px] font-bold text-[#333]">{{ branch.branch_name }}</h3>
            <span class="text-[12px] text-[#999]">{{ branch.branch_code }}</span>
          </div>
          <span
            :class="branch.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
            class="px-2 py-0.5 text-[11px] font-medium rounded-full"
          >{{ branch.is_active ? '활성' : '비활성' }}</span>
        </div>

        <div class="space-y-1.5 text-[13px] text-[#666] mb-4">
          <div v-if="branch.region">
            <span class="text-[#999]">지역:</span> {{ branch.region }}
          </div>
          <div v-if="branch.address">
            <span class="text-[#999]">주소:</span> {{ branch.address }}
          </div>
          <div v-if="branch.contact_phone">
            <span class="text-[#999]">연락처:</span> {{ branch.contact_phone }}
          </div>
          <div>
            <span class="text-[#999]">지사장:</span> {{ branch.manager?.name || '미지정' }}
          </div>
          <div>
            <span class="text-[#999]">소속 설계사:</span> {{ branch.agents_count ?? 0 }}명
          </div>
        </div>

        <div class="flex gap-2">
          <button
            @click="startEdit(branch)"
            class="flex-1 py-2 text-[13px] text-[#FF7B22] border border-[#FF7B22] rounded-[10px] hover:bg-[#FFF3ED] transition-colors"
          >수정</button>
          <button
            @click="handleDelete(branch)"
            class="py-2 px-3 text-[13px] text-red-500 border border-red-200 rounded-[10px] hover:bg-red-50 transition-colors"
          >삭제</button>
        </div>
      </div>

      <div v-if="branches.length === 0" class="col-span-full text-center py-10 text-[#999]">
        등록된 지사가 없습니다.
      </div>
    </div>

    <!-- 생성/수정 모달 -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingBranch" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
        <div class="relative bg-white rounded-[16px] shadow-xl w-full max-w-[480px] mx-4 p-6">
          <h2 class="text-[18px] font-bold text-[#333] mb-5">
            {{ editingBranch ? '지사 수정' : '지사 추가' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">지사명 *</label>
              <input v-model="form.branch_name" type="text" placeholder="광주" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">지사 코드 *</label>
              <input v-model="form.branch_code" type="text" placeholder="GJ" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">지역</label>
              <input v-model="form.region" type="text" placeholder="호남" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">주소</label>
              <input v-model="form.address" type="text" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">연락처</label>
              <input v-model="form.contact_phone" type="text" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
          </div>

          <div class="flex gap-3 mt-6">
            <button @click="closeModal" class="flex-1 py-2.5 text-[14px] text-[#666] border border-[#E0E0E0] rounded-[10px] hover:bg-[#F8F8F8] transition-colors">
              취소
            </button>
            <button @click="handleSave" :disabled="saving" class="flex-1 py-2.5 text-[14px] text-white bg-[#FF7B22] rounded-[10px] hover:bg-[#E56D1E] transition-colors disabled:opacity-50">
              {{ saving ? '저장 중...' : '저장' }}
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { fetchBranches as apiFetchBranches, createBranch, updateBranch, deleteBranch } from '../../services/adminApi'
import type { BranchData } from '../../services/adminApi'

const branches = ref<BranchData[]>([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const editingBranch = ref<BranchData | null>(null)

const form = ref({
  branch_name: '',
  branch_code: '',
  region: '',
  address: '',
  contact_phone: '',
})

async function loadData() {
  loading.value = true
  try {
    const res = await apiFetchBranches()
    branches.value = res.data.data
  } catch {
    branches.value = []
  } finally {
    loading.value = false
  }
}

function startEdit(branch: BranchData) {
  editingBranch.value = branch
  form.value = {
    branch_name: branch.branch_name,
    branch_code: branch.branch_code,
    region: branch.region || '',
    address: branch.address || '',
    contact_phone: branch.contact_phone || '',
  }
}

function closeModal() {
  showCreateModal.value = false
  editingBranch.value = null
  form.value = { branch_name: '', branch_code: '', region: '', address: '', contact_phone: '' }
}

async function handleSave() {
  if (!form.value.branch_name || !form.value.branch_code) {
    alert('지사명과 코드는 필수입니다.')
    return
  }

  saving.value = true
  try {
    if (editingBranch.value) {
      await updateBranch(editingBranch.value.branch_id, form.value)
    } else {
      await createBranch(form.value)
    }
    closeModal()
    await loadData()
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function handleDelete(branch: BranchData) {
  if (!confirm(`"${branch.branch_name}" 지사를 삭제하시겠습니까?`)) return

  try {
    await deleteBranch(branch.branch_id)
    await loadData()
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(loadData)
</script>
