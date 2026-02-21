<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="customer?.name ?? '고객 상세'" />

      <main
        v-if="customer"
        class="px-5 overflow-y-auto pb-20"
        style="height: calc(100vh - 56px);"
      >
        <!-- Profile Card -->
        <CardSection class="mt-3">
          <div class="flex items-center gap-3">
            <div class="w-[52px] h-[52px] rounded-full bg-[#FFF0E5] flex items-center justify-center flex-shrink-0">
              <span class="text-[20px] font-bold text-[#FF7B22]">
                {{ customer.name.charAt(0) }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[17px] font-bold text-[#222]">{{ customer.name }}</span>
              </div>
              <p class="text-[14px] text-[#888]">{{ customer.phone }}</p>
              <p class="text-[11px] text-[#AAAAAA] mt-0.5">등록일 {{ customer.created_at }}</p>
            </div>
          </div>
        </CardSection>

        <!-- Tab Bar -->
        <div class="flex mt-4 mb-3 bg-white rounded-[12px] shadow-[0_0_6px_rgba(0,0,0,0.06)] overflow-hidden">
          <button
            v-for="tab in tabs"
            :key="tab.key"
            class="flex-1 py-2.5 text-[13px] font-medium transition-all relative"
            :class="
              activeTab === tab.key
                ? 'text-[#FF7B22]'
                : 'text-[#AAAAAA]'
            "
            @click="activeTab = tab.key"
          >
            {{ tab.label }}
            <div
              v-if="activeTab === tab.key"
              class="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-[2px] bg-[#FF7B22] rounded-full"
            />
          </button>
        </div>

        <!-- Tab Content -->

        <!-- 기본정보 Tab -->
        <div v-if="activeTab === 'info'">
          <CardSection>
            <InfoRow label="연락처" :value="customer.phone" />
            <InfoRow label="주민등록번호" :value="customer.resident_number ?? '-'" />
            <InfoRow label="주소" :value="customer.address ?? '-'" />
            <InfoRow label="직업" :value="customer.job ?? '-'" />
            <InfoRow label="등록일" :value="customer.created_at" />
          </CardSection>
        </div>

        <!-- 가입보험 Tab -->
        <div v-if="activeTab === 'contracts'" class="flex flex-col gap-2.5">
          <CardSection v-for="contract in store.contracts" :key="contract.contract_id">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-[14px] font-semibold text-[#333]">{{ contract.insurance_product ?? '-' }}</p>
                <p class="text-[12px] text-[#AAAAAA] mt-0.5">{{ contract.insurance_company?.company_name ?? '-' }}</p>
              </div>
              <StatusBadge
                v-if="contract.contract_status"
                :label="contractStatusLabel(contract.contract_status)"
                :variant="contractStatusVariant(contract.contract_status)"
              />
            </div>
            <div class="border-t border-[#F5F5F5] pt-2 mt-1">
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">계약금액</span>
                <span class="font-semibold text-[#333]">{{ contract.contract_amount ? formatCurrency(contract.contract_amount) + '원' : '-' }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-[#AAAAAA]">체결일</span>
                <span class="text-[#666]">{{ contract.contract_date ?? '-' }}</span>
              </div>
            </div>
          </CardSection>

          <!-- Empty State -->
          <div
            v-if="store.contracts.length === 0"
            class="flex flex-col items-center py-12"
          >
            <p class="text-[14px] text-[#AAAAAA]">가입된 보험이 없습니다</p>
          </div>
        </div>

        <!-- 메모 Tab -->
        <div v-if="activeTab === 'memos'">
          <!-- Memo List -->
          <div class="flex flex-col gap-2.5 mb-4">
            <CardSection v-for="memo in store.memos" :key="memo.memo_id">
              <p v-if="memo.title" class="text-[14px] font-semibold text-[#333] mb-1">{{ memo.title }}</p>
              <p class="text-[13px] text-[#333] leading-[1.6]">{{ memo.content }}</p>
              <p class="text-[11px] text-[#AAAAAA] mt-2">{{ memo.memo_date }}</p>
            </CardSection>

            <div
              v-if="store.memos.length === 0"
              class="flex flex-col items-center py-8"
            >
              <p class="text-[14px] text-[#AAAAAA]">작성된 메모가 없습니다</p>
            </div>
          </div>

          <!-- Add Memo Form -->
          <CardSection>
            <h4 class="text-[13px] font-semibold text-[#333] mb-3">메모 추가</h4>
            <FormTextarea
              v-model="newMemoContent"
              placeholder="메모를 입력하세요"
              :rows="3"
            />
            <div class="flex items-center gap-3 mt-3">
              <input
                v-model="newMemoDate"
                type="date"
                class="flex-1 bg-[#F8F8F8] rounded-[10px] px-3 py-2.5 text-[13px] border border-[#E8E8E8] outline-none focus:border-[#FF7B22] transition-colors text-[#333]"
              />
              <ActionButton @click="handleAddMemo">
                저장
              </ActionButton>
            </div>
          </CardSection>
        </div>
      </main>

      <!-- Loading / Not Found -->
      <div
        v-if="!customer && !store.loading"
        class="flex items-center justify-center"
        style="height: calc(100vh - 56px);"
      >
        <p class="text-[14px] text-[#AAAAAA]">고객 정보를 찾을 수 없습니다</p>
      </div>

      <div v-if="store.loading" class="flex items-center justify-center" style="height: calc(100vh - 56px);">
        <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useCustomerStore } from '../../stores/customerStore'

type TabKey = 'info' | 'contracts' | 'memos'

interface Tab {
  key: TabKey
  label: string
}

const route = useRoute()
const store = useCustomerStore()

const activeTab = ref<TabKey>('info')
const newMemoContent = ref('')
const newMemoDate = ref(new Date().toISOString().slice(0, 10))

const tabs: Tab[] = [
  { key: 'info', label: '기본정보' },
  { key: 'contracts', label: '가입보험' },
  { key: 'memos', label: '메모' },
]

const customerId = computed(() => String(route.params.id))

const customer = computed(() => store.selectedCustomer)

onMounted(async () => {
  await store.loadCustomer(customerId.value)
})

// ===== Helpers =====

function formatCurrency(value: string): string {
  const num = Number(value)
  if (isNaN(num)) return value
  return num.toLocaleString('ko-KR')
}

function contractStatusLabel(status: string): string {
  const map: Record<string, string> = {
    active: '유지중',
    expired: '만기',
    cancelled: '해지',
  }
  return map[status] ?? status
}

function contractStatusVariant(status: string): 'success' | 'warning' | 'danger' | 'default' {
  const map: Record<string, 'success' | 'warning' | 'danger' | 'default'> = {
    active: 'success',
    expired: 'warning',
    cancelled: 'danger',
  }
  return map[status] ?? 'default'
}

async function handleAddMemo(): Promise<void> {
  if (!newMemoContent.value.trim()) return

  await store.addMemo(customerId.value, {
    content: newMemoContent.value.trim(),
    memo_date: newMemoDate.value,
  })

  newMemoContent.value = ''
  newMemoDate.value = new Date().toISOString().slice(0, 10)
}
</script>
