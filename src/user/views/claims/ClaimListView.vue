<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="내 청구 내역" />
      <main class="px-5 py-4 pb-24 overflow-y-auto" style="height: calc(100vh - 56px - 60px);">
        <!-- 필터 -->
        <div class="flex items-center justify-between mb-4">
          <span class="text-[12px] text-[#999]">청구 상태 필터</span>
          <select
            v-model="statusFilter"
            @change="handleFilterChange"
            class="text-[12px] text-[#FF7B22] font-medium bg-transparent outline-none cursor-pointer"
          >
            <option value="">전체</option>
            <option v-for="opt in CLAIM_STATUS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
        </div>

        <!-- 로딩 -->
        <div v-if="claimStore.loadingClaims" class="flex items-center justify-center py-20">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF7B22]"></div>
        </div>

        <!-- 청구 목록 -->
        <div v-else>
          <div class="flex flex-col gap-3 mb-5">
            <div
              v-for="claim in claimStore.myClaims"
              :key="claim.claim_id"
              @click="viewDetail(claim.claim_id)"
              class="cursor-pointer"
            >
              <CardSection>
                <div class="flex items-start justify-between mb-2">
                  <span class="text-[13px] font-medium text-[#888]">
                    {{ claim.claim_form?.insurance_company?.company_name }}
                  </span>
                  <StatusBadge
                    :label="getStatusLabel(claim.claim_status)"
                    :variant="getStatusVariant(claim.claim_status)"
                  />
                </div>
                <p class="text-[15px] font-semibold text-[#222] mb-1">
                  {{ claim.claim_form?.form_name }}
                </p>
                <div class="flex items-center gap-3 text-[12px] text-[#888]">
                  <span>{{ formatDate(claim.created_at ?? '') }}</span>
                  <span v-if="claim.fax_status === 'sent'" class="text-[#1FBD53]">팩스 발송완료</span>
                  <span v-else-if="claim.fax_status === 'failed'" class="text-[#FF0000]">팩스 발송실패</span>
                </div>
              </CardSection>
            </div>
          </div>

          <!-- 빈 상태 -->
          <div v-if="claimStore.myClaims.length === 0" class="text-center py-16">
            <svg class="mx-auto mb-3" width="48" height="48" viewBox="0 0 24 24" fill="none">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" stroke="#B0B0B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <p class="text-[15px] font-semibold text-[#222] mb-1">청구 내역이 없습니다</p>
            <p class="text-[12px] text-[#999]">새 청구서를 작성해보세요.</p>
          </div>

          <!-- 페이지네이션 -->
          <div
            v-if="claimStore.claimsPagination && claimStore.claimsPagination.last_page > 1"
            class="flex justify-center gap-1.5 mb-5"
          >
            <button
              v-for="page in claimStore.claimsPagination.last_page"
              :key="page"
              @click="handlePageChange(page)"
              class="w-8 h-8 rounded-full text-[13px] font-medium transition-colors"
              :class="
                page === claimStore.claimsPagination.current_page
                  ? 'bg-[#FF7B22] text-white'
                  : 'bg-white text-[#888] border border-[#E8E8E8]'
              "
            >
              {{ page }}
            </button>
          </div>
        </div>

        <!-- 새 청구서 작성 버튼 -->
        <button
          @click="createNewClaim"
          class="w-full bg-[#FF7B22] text-white rounded-[12px] py-3.5 text-[15px] font-semibold active:scale-[0.98] transition-transform"
        >
          새 청구서 작성
        </button>
      </main>
      <BottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useClaimStore } from '../../stores/claimStore'
import { CLAIM_STATUS_OPTIONS } from '@shared/types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import BottomNav from '../../components/layout/BottomNav.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'

const router = useRouter()
const claimStore = useClaimStore()

const statusFilter = ref('')

onMounted(async () => {
  await claimStore.fetchMyClaims()
})

async function handleFilterChange() {
  await claimStore.fetchMyClaims({ claim_status: statusFilter.value || undefined })
}

async function handlePageChange(page: number) {
  await claimStore.fetchMyClaims({
    claim_status: statusFilter.value || undefined,
    page
  })
}

function getStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'primary' | 'info' | 'default' {
  switch (status) {
    case 'pending': return 'warning'
    case 'processing': return 'info'
    case 'completed': return 'success'
    case 'rejected': return 'danger'
    default: return 'default'
  }
}

function getStatusLabel(status: string) {
  const option = CLAIM_STATUS_OPTIONS.find(o => o.value === status)
  return option?.label || status
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function viewDetail(claimId: number) {
  router.push(`/claims/${claimId}`)
}

function createNewClaim() {
  claimStore.resetClaimForm()
  router.push('/claims/new')
}
</script>
