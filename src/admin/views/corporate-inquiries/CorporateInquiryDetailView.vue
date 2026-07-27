<template>
  <div class="p-4 lg:p-6">
    <!-- 헤더 -->
    <div class="flex items-center gap-3 mb-6">
      <button @click="router.push('/corporate-inquiries')" class="text-[#999] hover:text-[#333]">
        <span class="material-symbols-outlined text-[22px]">arrow_back</span>
      </button>
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">기업 문의 상세</h1>
      <span v-if="inquiry" :class="statusClass(inquiry.status)"
        class="inline-flex items-center px-2.5 py-1 text-[12px] font-medium rounded-full ml-2">
        {{ statusLabel(inquiry.status) }}
      </span>
    </div>

    <!-- 로딩 -->
    <div v-if="store.loading && !inquiry" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
    </div>

    <div v-else-if="inquiry" class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- 좌측: 문의 정보 -->
      <div class="lg:col-span-2 space-y-6">
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">문의 정보</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-y-3 gap-x-6">
            <div v-for="row in infoRows" :key="row.label" class="flex">
              <span class="text-[13px] text-[#999] w-[80px] shrink-0">{{ row.label }}</span>
              <span class="text-[14px] text-[#333]">{{ row.value }}</span>
            </div>
          </div>
        </div>

        <!-- 관리자 메모 -->
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">관리자 메모</h2>
          <textarea v-model="notes" rows="4" placeholder="메모를 입력하세요..."
            class="w-full px-4 py-3 border border-[#E5E5E5] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22] resize-none" />
          <div class="flex justify-end mt-3">
            <button @click="saveNotes" :disabled="store.loading"
              class="px-5 py-2.5 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[10px] hover:bg-[#E56B1A] disabled:opacity-50">
              메모 저장
            </button>
          </div>
        </div>
      </div>

      <!-- 우측: 상태 + 배분 정보 -->
      <div class="space-y-6">
        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">상태</h2>
          <select v-model="status" @change="saveStatus"
            class="w-full px-4 py-2.5 border border-[#E5E5E5] rounded-[10px] text-[14px] focus:outline-none focus:border-[#FF7B22]">
            <option value="NEW">신규</option>
            <option value="IN_PROGRESS">진행중</option>
            <option value="COMPLETED">완료</option>
          </select>
        </div>

        <div class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
          <h2 class="text-[16px] font-bold text-[#333] mb-4">담당 설계사</h2>
          <div v-if="inquiry.agent" class="space-y-2">
            <div class="flex"><span class="text-[13px] text-[#999] w-[60px]">이름</span><span class="text-[14px] text-[#333] font-medium">{{ inquiry.agent.name }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#999] w-[60px]">연락처</span><span class="text-[14px] text-[#333]">{{ inquiry.agent.phone }}</span></div>
            <div v-if="inquiry.agent.email" class="flex"><span class="text-[13px] text-[#999] w-[60px]">이메일</span><span class="text-[14px] text-[#333]">{{ inquiry.agent.email }}</span></div>
            <div class="flex"><span class="text-[13px] text-[#999] w-[60px]">배분일</span><span class="text-[14px] text-[#333]">{{ inquiry.assigned_at ? formatDateTime(inquiry.assigned_at) : '-' }}</span></div>
          </div>
          <p v-else class="text-[14px] text-[#999]">아직 배분되지 않았습니다.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useCorporateInquiryStore } from '../../stores/corporateInquiryStore'

const route = useRoute()
const router = useRouter()
const store = useCorporateInquiryStore()

const inquiry = computed(() => store.currentInquiry)
const notes = ref('')
const status = ref('NEW')

const infoRows = computed(() => {
  if (!inquiry.value) return []
  const i = inquiry.value
  return [
    { label: '업체명', value: i.company_name },
    { label: '대표자명', value: i.ceo_name },
    { label: '연락처', value: i.phone },
    { label: '주소', value: i.address || '-' },
    { label: '연매출', value: i.annual_revenue || '-' },
    { label: '업종', value: i.industry || '-' },
    { label: '상담분야', value: i.consultation_field || '-' },
    { label: '접수일', value: formatDateTime(i.created_at) },
  ]
})

watch(inquiry, (v) => {
  if (v) {
    notes.value = v.notes || ''
    status.value = v.status
  }
})

async function saveNotes() {
  if (!inquiry.value) return
  await store.updateInquiry(inquiry.value.id, { notes: notes.value })
}

async function saveStatus() {
  if (!inquiry.value) return
  await store.updateInquiry(inquiry.value.id, { status: status.value })
}

function statusLabel(s: string) {
  if (s === 'NEW') return '신규'
  if (s === 'IN_PROGRESS') return '진행중'
  if (s === 'COMPLETED') return '완료'
  return s
}

function statusClass(s: string) {
  if (s === 'NEW') return 'bg-blue-50 text-blue-600'
  if (s === 'IN_PROGRESS') return 'bg-[#FFF3ED] text-[#FF7B22]'
  if (s === 'COMPLETED') return 'bg-green-50 text-green-600'
  return 'bg-gray-50 text-gray-600'
}

function formatDateTime(d: string) {
  if (!d) return '-'
  return d.replace('T', ' ').slice(0, 16)
}

onMounted(() => {
  const id = Number(route.params.id)
  if (id) store.loadInquiry(id)
})
</script>
