<template>
  <div class="p-4 lg:p-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center min-w-0">
        <router-link to="/customers" class="text-[#999] hover:text-[#FF7B22] mr-3 lg:mr-4 transition-colors shrink-0">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[18px] lg:text-[22px] font-bold text-[#333] truncate">
          {{ customer?.name || '고객 상세' }}
        </h1>
        <span
          v-if="customer"
          :class="customer.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'"
          class="ml-3 px-2.5 py-1 text-[12px] font-medium rounded-full"
        >
          {{ customer.is_active ? '활성화' : '비활성화' }}
        </span>
      </div>
      <router-link
        v-if="customer"
        :to="`/customers/${customer.customer_id}/edit`"
        class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
      >
        수정
      </router-link>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 콘텐츠 -->
    <div v-else-if="customer">
      <!-- 탭 네비게이션 -->
      <div class="flex border-b border-[#E8E8E8] mb-6 overflow-x-auto -mx-4 px-4 lg:mx-0 lg:px-0">
        <button
          v-for="tab in tabs"
          :key="tab.key"
          @click="activeTab = tab.key"
          :class="[
            'px-5 py-3 text-[14px] font-medium transition-colors border-b-2 -mb-[1px]',
            activeTab === tab.key
              ? 'text-[#FF7B22] border-[#FF7B22]'
              : 'text-[#999] border-transparent hover:text-[#555]'
          ]"
        >
          {{ tab.label }}
        </button>
      </div>

      <!-- 기본정보 탭 -->
      <div v-if="activeTab === 'info'" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
          <div>
            <p class="text-[12px] text-[#999] mb-1">고객 ID</p>
            <p class="text-[14px] text-[#333]">{{ customer.customer_id }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">이름</p>
            <p class="text-[14px] text-[#333] font-medium">{{ customer.name }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">전화번호</p>
            <p class="text-[14px] text-[#333]">{{ formatPhone(customer.phone) }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">이메일</p>
            <p class="text-[14px] text-[#333]">{{ customer.email || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">주민등록번호</p>
            <p class="text-[14px] text-[#333]">{{ formatResidentNumber(customer.resident_number) }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">생년월일</p>
            <p class="text-[14px] text-[#333]">{{ customer.birth_date || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">성별</p>
            <p class="text-[14px] text-[#333]">{{ formatGender(customer.gender) }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">직업</p>
            <p class="text-[14px] text-[#333]">{{ customer.job || '-' }}</p>
          </div>
          <div class="md:col-span-2">
            <p class="text-[12px] text-[#999] mb-1">주소</p>
            <p class="text-[14px] text-[#333]">
              {{ [customer.address, customer.detailed_address].filter(Boolean).join(' ') || '-' }}
            </p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">통신사</p>
            <p class="text-[14px] text-[#333]">{{ (customer as any).telecom || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">고객 취득 경로</p>
            <p class="text-[14px] text-[#333]">{{ (customer as any).acquisition_channel || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">담당 설계사</p>
            <p class="text-[14px] text-[#333]">{{ customer.agent?.name || '-' }}</p>
          </div>
          <div>
            <p class="text-[12px] text-[#999] mb-1">등록일</p>
            <p class="text-[14px] text-[#333]">{{ formatDate(customer.created_at) }}</p>
          </div>
        </div>
      </div>

      <!-- 가입보험 탭 (SFR-036) -->
      <div v-else-if="activeTab === 'contracts'" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table v-if="contracts.length > 0" class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">보험사</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상품명</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">계약번호</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">계약금액</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">계약일</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">상태</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-[#F0F0F0]">
            <tr v-for="contract in contracts" :key="contract.contract_id" class="hover:bg-[#FAFAFA] transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">
                {{ contract.insurance_company?.company_name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] font-medium text-[#333]">
                {{ contract.insurance_product || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
                {{ contract.contract_number || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
                {{ contract.contract_amount ? Number(contract.contract_amount).toLocaleString() + '원' : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
                {{ contract.contract_date || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span
                  :class="contractStatusClass(contract.contract_status)"
                  class="px-2.5 py-1 text-[12px] font-medium rounded-full"
                >
                  {{ contractStatusLabel(contract.contract_status) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="px-6 py-10 text-center text-[#999] text-[14px]">
          등록된 보험 정보가 없습니다.
        </div>
      </div>

      <!-- 병력/치료 탭 (SFR-037) -->
      <div v-else-if="activeTab === 'medical'" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
        <table v-if="medicalRecords.length > 0" class="min-w-full divide-y divide-[#E8E8E8]">
          <thead class="bg-[#FAFAFA]">
            <tr>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">진료일</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">병원</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">진단명</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">진료유형</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">진료비</th>
              <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">중요</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-[#F0F0F0]">
            <tr v-for="record in medicalRecords" :key="record.record_id" class="hover:bg-[#FAFAFA] transition-colors">
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ record.treatment_date }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#333]">{{ record.hospital_name || '-' }}</td>
              <td class="px-6 py-4 text-[14px] text-[#333]">
                <span v-if="record.diagnosis_code" class="text-[12px] text-[#999] mr-1">[{{ record.diagnosis_code }}]</span>
                {{ record.diagnosis_name || '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">{{ record.treatment_type || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
                {{ record.medical_cost ? Number(record.medical_cost).toLocaleString() + '원' : '-' }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-center">
                <span v-if="record.is_important" class="material-symbols-outlined text-[18px] text-[#FF7B22]">star</span>
                <span v-else class="text-[#999]">-</span>
              </td>
            </tr>
          </tbody>
        </table>
        <div v-else class="px-6 py-10 text-center text-[#999] text-[14px]">
          등록된 진료 기록이 없습니다.
        </div>
      </div>

      <!-- 메모 탭 (SFR-038) -->
      <div v-else-if="activeTab === 'memos'">
        <!-- 메모 작성 폼 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6 mb-4">
          <h3 class="text-[15px] font-medium text-[#333] mb-4">메모 작성</h3>
          <form @submit.prevent="handleCreateMemo" class="space-y-3">
            <input
              v-model="memoForm.title"
              type="text"
              placeholder="제목 (선택)"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
            />
            <textarea
              v-model="memoForm.content"
              placeholder="메모 내용을 입력하세요"
              rows="3"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] resize-none"
            ></textarea>
            <div class="flex justify-end">
              <button
                type="submit"
                :disabled="memoSubmitting || !memoForm.content.trim()"
                class="px-4 py-2 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors text-[14px] font-medium"
              >
                {{ memoSubmitting ? '저장 중...' : '메모 저장' }}
              </button>
            </div>
          </form>
        </div>

        <!-- 메모 목록 -->
        <div v-if="store.memos.length > 0" class="space-y-3">
          <div
            v-for="memo in store.memos"
            :key="memo.memo_id"
            class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-5"
          >
            <!-- 메모 수정 모드 -->
            <div v-if="editingMemoId === memo.memo_id">
              <input
                v-model="editMemoForm.title"
                type="text"
                placeholder="제목 (선택)"
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] mb-3"
              />
              <textarea
                v-model="editMemoForm.content"
                rows="3"
                required
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] resize-none mb-3"
              ></textarea>
              <div class="flex justify-end gap-2">
                <button
                  @click="cancelEditMemo"
                  class="px-3 py-1.5 border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] transition-colors text-[13px]"
                >
                  취소
                </button>
                <button
                  @click="handleUpdateMemo(memo.memo_id)"
                  :disabled="memoSubmitting"
                  class="px-3 py-1.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors text-[13px]"
                >
                  저장
                </button>
              </div>
            </div>

            <!-- 메모 보기 모드 -->
            <div v-else>
              <div class="flex items-start justify-between mb-2">
                <div>
                  <h4 v-if="memo.title" class="text-[14px] font-medium text-[#333]">{{ memo.title }}</h4>
                  <div class="flex items-center gap-2 mt-1">
                    <span class="text-[12px] text-[#999]">{{ formatDate(memo.memo_date) }}</span>
                    <span class="text-[12px] text-[#CCCCCC]">|</span>
                    <span class="text-[12px] text-[#999]">{{ memo.author_type === 'ADMIN' ? '관리자' : '설계사' }}</span>
                  </div>
                </div>
                <div class="flex gap-2">
                  <button
                    @click="startEditMemo(memo)"
                    class="text-[#FF7B22] hover:text-[#E56D1E] text-[13px]"
                  >
                    수정
                  </button>
                  <button
                    @click="handleDeleteMemo(memo.memo_id)"
                    class="text-red-500 hover:text-red-600 text-[13px]"
                  >
                    삭제
                  </button>
                </div>
              </div>
              <p class="text-[14px] text-[#555] whitespace-pre-wrap">{{ memo.content }}</p>
            </div>
          </div>
        </div>
        <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] px-6 py-10 text-center text-[#999] text-[14px]">
          등록된 메모가 없습니다.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useCustomerStore } from '../../stores/customerStore'
import type { Memo } from '../../types'

const route = useRoute()
const store = useCustomerStore()

const loading = ref(false)
const activeTab = ref('info')
const memoSubmitting = ref(false)
const editingMemoId = ref<number | null>(null)

const tabs = [
  { key: 'info', label: '기본정보' },
  { key: 'contracts', label: '가입보험' },
  { key: 'medical', label: '병력/치료' },
  { key: 'memos', label: '메모' },
]

const memoForm = ref({
  title: '',
  content: '',
})

const editMemoForm = ref({
  title: '',
  content: '',
})

const customer = computed(() => store.selectedCustomer)

const contracts = computed(() => {
  const c = customer.value as any
  return c?.contracts || []
})

const medicalRecords = computed(() => {
  const c = customer.value as any
  return c?.medical_records || []
})

function formatPhone(phone?: string): string {
  if (!phone) return '-'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  }
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  }
  return phone
}

function formatResidentNumber(rn?: string): string {
  if (!rn) return '-'
  const cleaned = rn.replace(/\D/g, '')
  if (cleaned.length === 13) {
    return `${cleaned.slice(0, 6)}-${cleaned.slice(6, 7)}******`
  }
  return rn
}

function formatGender(gender?: string): string {
  if (!gender) return '-'
  const map: Record<string, string> = { M: '남성', F: '여성', OTHER: '기타' }
  return map[gender] || gender
}

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function contractStatusClass(status?: string): string {
  switch (status) {
    case 'active': return 'bg-green-100 text-green-700'
    case 'expired': return 'bg-gray-100 text-gray-600'
    case 'cancelled': return 'bg-red-100 text-red-600'
    default: return 'bg-gray-100 text-gray-600'
  }
}

function contractStatusLabel(status?: string): string {
  switch (status) {
    case 'active': return '유지'
    case 'expired': return '만기'
    case 'cancelled': return '해지'
    default: return status || '-'
  }
}

function todayString(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

async function handleCreateMemo() {
  if (!memoForm.value.content.trim()) return
  memoSubmitting.value = true
  try {
    await store.createMemo(route.params.id as string, {
      title: memoForm.value.title || undefined,
      content: memoForm.value.content,
      memo_date: todayString(),
    })
    memoForm.value = { title: '', content: '' }
  } catch (e: any) {
    alert(e.response?.data?.message || '메모 등록에 실패했습니다.')
  } finally {
    memoSubmitting.value = false
  }
}

function startEditMemo(memo: Memo) {
  editingMemoId.value = memo.memo_id
  editMemoForm.value = {
    title: memo.title || '',
    content: memo.content,
  }
}

function cancelEditMemo() {
  editingMemoId.value = null
  editMemoForm.value = { title: '', content: '' }
}

async function handleUpdateMemo(memoId: number) {
  memoSubmitting.value = true
  try {
    await store.updateMemo(memoId, {
      title: editMemoForm.value.title || undefined,
      content: editMemoForm.value.content,
    })
    editingMemoId.value = null
  } catch (e: any) {
    alert(e.response?.data?.message || '메모 수정에 실패했습니다.')
  } finally {
    memoSubmitting.value = false
  }
}

async function handleDeleteMemo(memoId: number) {
  if (!confirm('이 메모를 삭제하시겠습니까?')) return
  try {
    await store.deleteMemo(memoId)
  } catch (e: any) {
    alert(e.response?.data?.message || '메모 삭제에 실패했습니다.')
  }
}

async function loadData() {
  loading.value = true
  try {
    await store.loadCustomer(route.params.id as string)
    await store.loadMemos(route.params.id as string)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
