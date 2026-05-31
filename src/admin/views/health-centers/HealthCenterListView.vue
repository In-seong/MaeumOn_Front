<template>
  <div class="p-4 lg:p-6">
    <div class="flex items-center justify-between mb-6">
      <h1 class="text-[22px] font-bold text-[#333]">건강검진 센터 관리</h1>
      <button @click="openForm()" class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] text-[14px] font-medium hover:bg-[#E66A1A] transition-colors">
        + 센터 등록
      </button>
    </div>

    <div class="mb-4">
      <input v-model="searchQuery" type="text" placeholder="센터명 또는 주소로 검색"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
        @input="debouncedSearch" />
    </div>

    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">ID</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">센터명</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden md:table-cell">주소</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase hidden sm:table-cell">전화번호</th>
            <th class="px-4 lg:px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase">상태</th>
            <th class="px-4 lg:px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase">관리</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-[#F0F0F0]">
          <tr v-for="c in centers" :key="c.center_id" class="hover:bg-[#FAFAFA] transition-colors">
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#FF7B22]">{{ c.center_id }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] font-medium text-[#333]">{{ c.center_name }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden md:table-cell max-w-[200px] truncate">{{ c.address }}</td>
            <td class="px-4 lg:px-6 py-4 text-[14px] text-[#555] hidden sm:table-cell">{{ c.contact_phone || '-' }}</td>
            <td class="px-4 lg:px-6 py-4">
              <span :class="c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'" class="px-2 py-1 text-[12px] font-medium rounded-full">
                {{ c.is_active ? '활성' : '비활성' }}
              </span>
            </td>
            <td class="px-4 lg:px-6 py-4 text-right space-x-2">
              <button @click="openForm(c)" class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[8px] text-[13px] font-medium hover:bg-[#E66A1A]">수정</button>
              <button v-if="c.is_active" @click="deactivate(c.center_id)" class="px-3 py-1.5 bg-red-500 text-white rounded-[8px] text-[13px] font-medium hover:bg-red-600">비활성</button>
            </td>
          </tr>
          <tr v-if="centers.length === 0">
            <td colspan="6" class="px-4 lg:px-6 py-10 text-center text-[#999]">등록된 센터가 없습니다.</td>
          </tr>
        </tbody>
      </table>

      <div v-if="pagination && pagination.last_page > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button v-for="page in pagination.last_page" :key="page" @click="fetchData(page)"
            :class="['px-3 py-1 rounded-[8px] text-[14px]', page === pagination.current_page ? 'bg-[#FF7B22] text-white' : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED]']">
            {{ page }}
          </button>
        </div>
      </div>
    </div>

    <!-- 등록/수정 모달 -->
    <div v-if="formOpen" class="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" @click.self="formOpen = false">
      <div class="bg-white rounded-[16px] w-full max-w-[600px] max-h-[90vh] overflow-y-auto shadow-xl">
        <div class="px-6 py-4 border-b border-[#F0F0F0] flex items-center justify-between">
          <h2 class="text-[18px] font-bold text-[#222]">{{ editingId ? '센터 수정' : '센터 등록' }}</h2>
          <button @click="formOpen = false" class="text-[#888] hover:text-[#333] text-[22px]">&times;</button>
        </div>
        <div class="px-6 py-5 space-y-4">
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">센터명 *</label>
            <input v-model="formData.center_name" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">주소 *</label>
            <input v-model="formData.address" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">전화번호</label>
              <input v-model="formData.contact_phone" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">위도</label>
              <input v-model="formData.latitude" type="number" step="any" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">경도</label>
              <input v-model="formData.longitude" type="number" step="any" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
            <div>
              <label class="text-[13px] font-medium text-[#555] mb-1 block">영업시간</label>
              <input v-model="formData.business_hours" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
          </div>
          <div>
            <label class="text-[13px] font-medium text-[#555] mb-1 block">소개</label>
            <textarea v-model="formData.introduction" rows="3" class="w-full px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] resize-none"></textarea>
          </div>
          <div v-if="!editingId" class="border-t border-[#F0F0F0] pt-4">
            <p class="text-[13px] font-medium text-[#555] mb-2">포털 계정 (선택)</p>
            <div class="grid grid-cols-2 gap-4">
              <input v-model="formData.portal_username" placeholder="아이디" class="px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
              <input v-model="formData.portal_password" type="password" placeholder="비밀번호" class="px-3 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]" />
            </div>
          </div>
        </div>
        <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-3">
          <button @click="formOpen = false" class="px-4 py-2 text-[#555] text-[14px]">취소</button>
          <button @click="submitForm" :disabled="submitting" class="px-5 py-2 bg-[#FF7B22] text-white rounded-[10px] text-[14px] font-medium disabled:opacity-50 hover:bg-[#E66A1A]">
            {{ submitting ? '처리 중...' : (editingId ? '수정' : '등록') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { fetchAdminHealthCenters, createAdminHealthCenter, updateAdminHealthCenter, deleteAdminHealthCenter } from '../../services/adminApi'
import type { AdminHealthCenter, LaravelPagination } from '../../types'

const centers = ref<AdminHealthCenter[]>([])
const pagination = ref<Omit<LaravelPagination<AdminHealthCenter>, 'data'> | null>(null)
const loading = ref(false)
const searchQuery = ref('')
let searchTimeout: ReturnType<typeof setTimeout>

const formOpen = ref(false)
const editingId = ref<number | null>(null)
const submitting = ref(false)
const formData = reactive({
  center_name: '', address: '', contact_phone: '', latitude: '' as string | number, longitude: '' as string | number, business_hours: '', introduction: '', portal_username: '', portal_password: '',
})

function debouncedSearch() { clearTimeout(searchTimeout); searchTimeout = setTimeout(() => fetchData(), 300) }

async function fetchData(page = 1) {
  loading.value = true
  try {
    const res = await fetchAdminHealthCenters({ search: searchQuery.value || undefined, page })
    const { data, ...pag } = res.data.data
    centers.value = data
    pagination.value = pag
  } finally { loading.value = false }
}

function openForm(center?: AdminHealthCenter) {
  if (center) {
    editingId.value = center.center_id
    Object.assign(formData, { center_name: center.center_name, address: center.address, contact_phone: center.contact_phone || '', latitude: center.latitude || '', longitude: center.longitude || '', business_hours: center.business_hours || '', introduction: center.introduction || '', portal_username: '', portal_password: '' })
  } else {
    editingId.value = null
    Object.assign(formData, { center_name: '', address: '', contact_phone: '', latitude: '', longitude: '', business_hours: '', introduction: '', portal_username: '', portal_password: '' })
  }
  formOpen.value = true
}

async function submitForm() {
  if (!formData.center_name || !formData.address) { alert('센터명과 주소는 필수입니다.'); return }
  submitting.value = true
  try {
    if (editingId.value) {
      await updateAdminHealthCenter(editingId.value, { ...formData })
      alert('센터 정보가 수정되었습니다.')
    } else {
      await createAdminHealthCenter({ ...formData })
      alert('센터가 등록되었습니다.')
    }
    formOpen.value = false
    fetchData()
  } catch (e: unknown) {
    const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
    alert(msg || '처리에 실패했습니다.')
  } finally { submitting.value = false }
}

async function deactivate(id: number) {
  if (!confirm('이 센터를 비활성화하시겠습니까?')) return
  try { await deleteAdminHealthCenter(id); fetchData(pagination.value?.current_page ?? 1) } catch { alert('비활성화에 실패했습니다.') }
}

onMounted(() => fetchData())
</script>
