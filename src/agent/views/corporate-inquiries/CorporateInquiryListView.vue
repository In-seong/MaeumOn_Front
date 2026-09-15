<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="기업 배분" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100dvh - 56px - 60px);">
        <div class="mb-4">
          <p class="text-[13px] text-[#888]">
            총 <span class="font-semibold text-[#FF7B22]">{{ store.total }}</span>건
          </p>
        </div>

        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <div v-else-if="store.inquiries.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">기업 배분 내역이 없습니다</p>
        </div>

        <div v-else class="flex flex-col gap-3">
          <div
            v-for="item in store.inquiries"
            :key="item.id"
            class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.1)] p-4"
          >
            <div class="flex items-start justify-between mb-2">
              <div class="flex-1">
                <p class="text-[15px] font-semibold text-[#333]">{{ item.company_name }}</p>
                <p v-if="item.ceo_name" class="text-[13px] text-[#888] mt-0.5">대표: {{ item.ceo_name }}</p>
              </div>
              <span
                :class="statusClass(item.status)"
                class="px-2 py-0.5 text-[11px] font-medium rounded-full"
              >
                {{ statusLabel(item.status) }}
              </span>
            </div>

            <div v-if="item.phone" class="text-[13px] text-[#666] mt-1">{{ formatPhone(item.phone) }}</div>

            <div class="flex flex-wrap gap-2 mt-2">
              <span v-if="item.industry" class="text-[11px] text-[#888] bg-[#F5F5F5] px-2 py-0.5 rounded-full">{{ item.industry }}</span>
              <span v-if="item.consultation_field" class="text-[11px] text-[#4CAF50] bg-[#E8F5E9] px-2 py-0.5 rounded-full">{{ item.consultation_field }}</span>
            </div>

            <div class="flex items-center gap-2 text-[12px] text-[#999] mt-2">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#999" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <span>{{ formatDate(item.assigned_at ?? item.created_at) }}</span>
            </div>

            <p v-if="item.notes" class="text-[12px] text-[#666] mt-2 line-clamp-2">{{ item.notes }}</p>

            <button
              class="mt-3 w-full py-2.5 bg-[#FF7B22] text-white text-[13px] font-semibold rounded-[12px] active:scale-[0.98] transition-transform"
              @click="openEditForm(item.id, item.notes)"
            >
              메모 수정
            </button>
          </div>
        </div>
      </main>

      <AgentBottomNav />

      <!-- 메모 수정 바텀시트 -->
      <Transition name="slide-up">
        <div
          v-if="editingId !== null"
          class="fixed inset-0 z-50 flex items-end justify-center px-3 pb-[68px]"
          @click.self="closeEditForm"
        >
          <div class="absolute inset-0 bg-black/30" @click="closeEditForm" />
          <div class="relative w-full max-w-[354px] bg-white rounded-[20px] p-6 z-10">
            <h3 class="text-[16px] font-semibold text-[#333] mb-4">메모 수정</h3>
            <div class="flex flex-col gap-4">
              <FormTextarea
                v-model="editNotes"
                label="메모"
                placeholder="메모를 입력하세요"
                :rows="3"
              />
              <div class="flex gap-3 mt-2">
                <ActionButton variant="outline" full @click="closeEditForm">취소</ActionButton>
                <ActionButton full :disabled="processing" @click="confirmEdit">
                  {{ processing ? '저장 중...' : '저장' }}
                </ActionButton>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useCorporateInquiryStore } from '../../stores/corporateInquiryStore'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'

const store = useCorporateInquiryStore()

const editingId = ref<number | null>(null)
const editNotes = ref('')
const processing = ref(false)

onMounted(() => {
  store.loadInquiries()
})

function openEditForm(id: number, currentNotes?: string | null): void {
  editingId.value = id
  editNotes.value = currentNotes ?? ''
}

function closeEditForm(): void {
  editingId.value = null
  editNotes.value = ''
}

async function confirmEdit(): Promise<void> {
  if (editingId.value === null) return
  processing.value = true
  try {
    await store.updateNotes(editingId.value, editNotes.value)
    closeEditForm()
  } catch {
    // Error handled in store
  } finally {
    processing.value = false
  }
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    NEW: '신규',
    IN_PROGRESS: '진행중',
    COMPLETED: '완료',
    CANCELLED: '취소',
  }
  return map[status] ?? status
}

function statusClass(status: string): string {
  const map: Record<string, string> = {
    NEW: 'bg-blue-50 text-[#1565C0]',
    IN_PROGRESS: 'bg-[#FFF3ED] text-[#FF7B22]',
    COMPLETED: 'bg-[#E8F5E9] text-[#2E7D32]',
    CANCELLED: 'bg-gray-100 text-gray-600',
  }
  return map[status] ?? 'bg-gray-100 text-gray-600'
}

function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 11) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 7)}-${cleaned.slice(7)}`
  if (cleaned.length === 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`
  return phone
}

function formatDate(raw: string): string {
  const d = new Date(raw)
  if (isNaN(d.getTime())) return raw
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}
</script>

<style scoped>
.slide-up-enter-active { transition: opacity 0.3s ease; }
.slide-up-leave-active { transition: opacity 0.2s ease; }
.slide-up-enter-active > div:last-child { transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1); }
.slide-up-leave-active > div:last-child { transition: transform 0.25s cubic-bezier(0.4, 0, 1, 1); }
.slide-up-enter-from, .slide-up-leave-to { opacity: 0; }
.slide-up-enter-from > div:last-child, .slide-up-leave-to > div:last-child { transform: translateY(100%); }
</style>
