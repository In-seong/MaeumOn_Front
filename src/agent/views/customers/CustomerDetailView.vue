<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader :title="customer?.customer_name ?? '고객 상세'" />

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
                {{ customer.customer_name.charAt(0) }}
              </span>
            </div>
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[17px] font-bold text-[#222]">{{ customer.customer_name }}</span>
                <StatusBadge
                  v-if="customer.customer_tag"
                  :label="customer.customer_tag"
                  :variant="tagVariant"
                />
              </div>
              <p class="text-[14px] text-[#888]">{{ customer.customer_phone }}</p>
              <p class="text-[11px] text-[#AAAAAA] mt-0.5">등록일 {{ customer.registered_at }}</p>
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
            <InfoRow label="연락처" :value="customer.customer_phone" />
            <InfoRow label="통신사" :value="customer.telecom" />
            <InfoRow label="주민등록번호" :value="customer.resident_number ?? '-'" />
            <InfoRow label="주소" :value="customer.address ?? '-'" />
            <InfoRow label="직업" :value="customer.occupation ?? '-'" />
            <InfoRow label="취득경로" :value="customer.acquisition_source ?? '-'" />
            <InfoRow label="최근연락일" :value="customer.last_contact_date ?? '-'" />
            <InfoRow label="등록일" :value="customer.registered_at" />
          </CardSection>
        </div>

        <!-- 가입보험 Tab -->
        <div v-if="activeTab === 'contracts'" class="flex flex-col gap-2.5">
          <CardSection v-for="contract in customerContracts" :key="contract.contract_id">
            <div class="flex items-start justify-between mb-2">
              <div>
                <p class="text-[14px] font-semibold text-[#333]">{{ contract.product_name }}</p>
                <p class="text-[12px] text-[#AAAAAA] mt-0.5">{{ contract.insurance_company }}</p>
              </div>
              <StatusBadge
                :label="contractStatusLabel(contract.status)"
                :variant="contractStatusVariant(contract.status)"
              />
            </div>
            <div class="border-t border-[#F5F5F5] pt-2 mt-1">
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">월 보험료</span>
                <span class="font-semibold text-[#333]">{{ formatCurrency(contract.premium) }}원</span>
              </div>
              <div class="flex items-center justify-between text-[12px] mb-1">
                <span class="text-[#AAAAAA]">체결일</span>
                <span class="text-[#666]">{{ contract.contract_date }}</span>
              </div>
              <div class="flex items-center justify-between text-[12px]">
                <span class="text-[#AAAAAA]">만기일</span>
                <span class="text-[#666]">{{ contract.expiry_date ?? '-' }}</span>
              </div>
            </div>
          </CardSection>

          <!-- Empty State -->
          <div
            v-if="customerContracts.length === 0"
            class="flex flex-col items-center py-12"
          >
            <p class="text-[14px] text-[#AAAAAA]">가입된 보험이 없습니다</p>
          </div>
        </div>

        <!-- 상담이력 Tab -->
        <div v-if="activeTab === 'consultations'" class="flex flex-col gap-0">
          <div
            v-for="(consultation, index) in customerConsultations"
            :key="consultation.consultation_id"
            class="flex gap-3"
          >
            <!-- Timeline Line -->
            <div class="flex flex-col items-center w-[20px] flex-shrink-0">
              <div
                class="w-[10px] h-[10px] rounded-full mt-1.5 flex-shrink-0"
                :class="consultationDotColor(consultation.status)"
              />
              <div
                v-if="index < customerConsultations.length - 1"
                class="w-[2px] flex-1 bg-[#E8E8E8] mt-1"
              />
            </div>

            <!-- Content -->
            <div class="flex-1 pb-5">
              <div class="flex items-center gap-2 mb-1">
                <span class="text-[13px] font-semibold text-[#333]">{{ consultation.consultation_type }}</span>
                <StatusBadge
                  :label="consultationStatusLabel(consultation.status)"
                  :variant="consultationStatusVariant(consultation.status)"
                />
              </div>
              <p class="text-[13px] text-[#666] mb-1">{{ consultation.content }}</p>
              <p v-if="consultation.response" class="text-[12px] text-[#4285F4] mb-1">
                {{ consultation.response }}
              </p>
              <p class="text-[11px] text-[#AAAAAA]">{{ consultation.requested_at }}</p>
            </div>
          </div>

          <!-- Empty State -->
          <div
            v-if="customerConsultations.length === 0"
            class="flex flex-col items-center py-12"
          >
            <p class="text-[14px] text-[#AAAAAA]">상담 이력이 없습니다</p>
          </div>
        </div>

        <!-- 메모 Tab -->
        <div v-if="activeTab === 'memos'">
          <!-- Memo List -->
          <div class="flex flex-col gap-2.5 mb-4">
            <CardSection v-for="memo in customerMemos" :key="memo.memo_id">
              <p class="text-[13px] text-[#333] leading-[1.6]">{{ memo.content }}</p>
              <p class="text-[11px] text-[#AAAAAA] mt-2">{{ memo.memo_date }}</p>
            </CardSection>

            <div
              v-if="customerMemos.length === 0"
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
        v-if="!customer"
        class="flex items-center justify-center"
        style="height: calc(100vh - 56px);"
      >
        <p class="text-[14px] text-[#AAAAAA]">고객 정보를 찾을 수 없습니다</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import type { Contract, Consultation } from '../../types'
import BackHeader from '@user/components/layout/BackHeader.vue'
import CardSection from '@user/components/ui/CardSection.vue'
import StatusBadge from '@user/components/ui/StatusBadge.vue'
import InfoRow from '@user/components/ui/InfoRow.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import { useCustomerStore } from '../../stores/customerStore'

type TabKey = 'info' | 'contracts' | 'consultations' | 'memos'

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
  { key: 'consultations', label: '상담이력' },
  { key: 'memos', label: '메모' },
]

const customerId = computed(() => Number(route.params.id))

const customer = computed(() =>
  store.customers.find((c) => c.customer_id === customerId.value) ?? null
)

const tagVariant = computed(() => {
  const map: Record<string, 'primary' | 'success' | 'info' | 'warning' | 'default'> = {
    VIP: 'primary',
    '신규': 'success',
    '관심': 'info',
    '일반': 'default',
  }
  return map[customer.value?.customer_tag ?? ''] ?? 'default'
})

const customerContracts = computed(() =>
  store.getContractsByCustomer(customerId.value)
)

const customerConsultations = computed(() =>
  store.getConsultationsByCustomer(customerId.value)
)

const customerMemos = computed(() =>
  store.getMemosByCustomer(customerId.value)
)

onMounted(() => {
  store.fetchCustomer(customerId.value)
})

// ===== Helpers =====

function formatCurrency(value: number): string {
  return value.toLocaleString('ko-KR')
}

function contractStatusLabel(status: Contract['status']): string {
  const map: Record<Contract['status'], string> = {
    active: '유지중',
    expired: '만기',
    cancelled: '해지',
  }
  return map[status]
}

function contractStatusVariant(status: Contract['status']): 'success' | 'warning' | 'danger' {
  const map: Record<Contract['status'], 'success' | 'warning' | 'danger'> = {
    active: 'success',
    expired: 'warning',
    cancelled: 'danger',
  }
  return map[status]
}

function consultationStatusLabel(status: Consultation['status']): string {
  const map: Record<Consultation['status'], string> = {
    pending: '대기',
    in_progress: '진행중',
    completed: '완료',
  }
  return map[status]
}

function consultationStatusVariant(status: Consultation['status']): 'warning' | 'info' | 'success' {
  const map: Record<Consultation['status'], 'warning' | 'info' | 'success'> = {
    pending: 'warning',
    in_progress: 'info',
    completed: 'success',
  }
  return map[status]
}

function consultationDotColor(status: Consultation['status']): string {
  const map: Record<Consultation['status'], string> = {
    pending: 'bg-[#F3940E]',
    in_progress: 'bg-[#4285F4]',
    completed: 'bg-[#1FBD53]',
  }
  return map[status]
}

function handleAddMemo(): void {
  if (!newMemoContent.value.trim()) return

  store.addMemo(
    customerId.value,
    newMemoContent.value.trim(),
    newMemoDate.value
  )

  newMemoContent.value = ''
  newMemoDate.value = new Date().toISOString().slice(0, 10)
}
</script>
