<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">관리자 계정 관리</h1>
      <button
        @click="showCreateModal = true"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        관리자 추가
      </button>
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">이름</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">아이디</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">역할</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden sm:table-cell">소속 지사</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider hidden md:table-cell">연락처</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr v-for="admin in admins" :key="admin.admin_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">{{ admin.name }}</td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ admin.account?.username }}</td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="admin.admin_role === 'SUPER' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >{{ admin.admin_role === 'SUPER' ? '슈퍼' : '지사' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden sm:table-cell">
              {{ admin.branch?.branch_name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999] hidden md:table-cell">
              {{ admin.phone || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                :class="admin.is_active ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >{{ admin.is_active ? '활성' : '비활성' }}</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right">
              <button @click="startEdit(admin)" class="text-[13px] text-[#FF7B22] hover:underline mr-3">수정</button>
              <button @click="handleDelete(admin)" class="text-[13px] text-red-500 hover:underline">삭제</button>
            </td>
          </tr>
          <tr v-if="admins.length === 0">
            <td colspan="7" class="px-6 py-10 text-center text-[#999]">관리자 계정이 없습니다.</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- 생성/수정 모달 -->
    <Teleport to="body">
      <div v-if="showCreateModal || editingAdmin" class="fixed inset-0 z-50 flex items-center justify-center">
        <div class="absolute inset-0 bg-black/40" @click="closeModal"></div>
        <div class="relative bg-white rounded-[16px] shadow-xl w-full max-w-[480px] mx-4 p-6 max-h-[90vh] overflow-y-auto">
          <h2 class="text-[18px] font-bold text-[#333] mb-5">
            {{ editingAdmin ? '관리자 수정' : '관리자 추가' }}
          </h2>

          <div class="space-y-4">
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">아이디 *</label>
              <input v-model="form.username" type="text" :disabled="!!editingAdmin" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] disabled:bg-[#F5F5F5]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">
                {{ editingAdmin ? '비밀번호 (변경 시에만)' : '비밀번호 *' }}
              </label>
              <input v-model="form.password" type="password" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">이름 *</label>
              <input v-model="form.name" type="text" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">연락처</label>
              <input v-model="form.phone" type="text" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">이메일</label>
              <input v-model="form.email" type="email" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#666] mb-1">역할 *</label>
              <div class="flex gap-3">
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="form.admin_role" value="SUPER" class="accent-[#FF7B22]" />
                  <span class="text-[13px] text-[#333]">슈퍼 관리자</span>
                </label>
                <label class="flex items-center gap-1.5 cursor-pointer">
                  <input type="radio" v-model="form.admin_role" value="BRANCH" class="accent-[#FF7B22]" />
                  <span class="text-[13px] text-[#333]">지사 관리자</span>
                </label>
              </div>
            </div>
            <div v-if="form.admin_role === 'BRANCH'">
              <label class="block text-[13px] font-medium text-[#666] mb-1">소속 지사 *</label>
              <select v-model="form.branch_id" class="w-full px-3 py-2.5 border border-[#E0E0E0] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]">
                <option value="">지사 선택</option>
                <option v-for="b in branchOptions" :key="b.branch_id" :value="b.branch_id">
                  {{ b.branch_name }}
                </option>
              </select>
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
import {
  fetchAdminAccounts, createAdminAccount, updateAdminAccount, deleteAdminAccount,
  type AdminAccountData,
} from '../../services/adminApi'
import { useBranchStore } from '../../stores/branchStore'

const branchStore = useBranchStore()
const branchOptions = ref(branchStore.branches)

const admins = ref<AdminAccountData[]>([])
const loading = ref(false)
const saving = ref(false)
const showCreateModal = ref(false)
const editingAdmin = ref<AdminAccountData | null>(null)

const form = ref({
  username: '',
  password: '',
  name: '',
  phone: '',
  email: '',
  admin_role: 'BRANCH' as 'SUPER' | 'BRANCH',
  branch_id: '' as string | number,
})

async function loadData() {
  loading.value = true
  try {
    const res = await fetchAdminAccounts()
    admins.value = res.data.data
    if (branchStore.branches.length === 0) {
      await branchStore.loadBranches()
    }
    branchOptions.value = branchStore.branches
  } catch {
    admins.value = []
  } finally {
    loading.value = false
  }
}

function startEdit(admin: AdminAccountData) {
  editingAdmin.value = admin
  form.value = {
    username: admin.account?.username || '',
    password: '',
    name: admin.name,
    phone: admin.phone || '',
    email: admin.email || '',
    admin_role: admin.admin_role,
    branch_id: admin.branch_id || '',
  }
}

function closeModal() {
  showCreateModal.value = false
  editingAdmin.value = null
  form.value = { username: '', password: '', name: '', phone: '', email: '', admin_role: 'BRANCH', branch_id: '' }
}

async function handleSave() {
  if (!form.value.name) {
    alert('이름은 필수입니다.')
    return
  }
  if (!editingAdmin.value && (!form.value.username || !form.value.password)) {
    alert('아이디와 비밀번호는 필수입니다.')
    return
  }
  if (form.value.admin_role === 'BRANCH' && !form.value.branch_id) {
    alert('지사 관리자는 소속 지사를 선택해야 합니다.')
    return
  }

  saving.value = true
  try {
    const data: Record<string, unknown> = {
      name: form.value.name,
      admin_role: form.value.admin_role,
      phone: form.value.phone || null,
      email: form.value.email || null,
      branch_id: form.value.admin_role === 'BRANCH' ? Number(form.value.branch_id) : null,
    }

    if (editingAdmin.value) {
      if (form.value.password) data.password = form.value.password
      await updateAdminAccount(editingAdmin.value.admin_id, data)
    } else {
      data.username = form.value.username
      data.password = form.value.password
      await createAdminAccount(data)
    }
    closeModal()
    await loadData()
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    saving.value = false
  }
}

async function handleDelete(admin: AdminAccountData) {
  if (!confirm(`"${admin.name}" 관리자 계정을 비활성화하시겠습니까?`)) return

  try {
    await deleteAdminAccount(admin.admin_id)
    await loadData()
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(loadData)
</script>
