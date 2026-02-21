<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] min-h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="DB 배분" />

      <main class="px-6 py-4 overflow-y-auto pb-20" style="height: calc(100vh - 56px - 60px);">
        <!-- Summary -->
        <div class="mb-4">
          <p class="text-[13px] text-[#888]">
            총 <span class="font-semibold text-[#FF7B22]">{{ store.total }}</span>건
          </p>
        </div>

        <!-- Loading -->
        <div v-if="store.loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- Distribution List -->
        <div v-else class="flex flex-col gap-3">
          <DbDistributionItem
            v-for="item in store.distributions"
            :key="item.assignment_id"
            :distribution="item"
            @edit="openEditForm"
          />
        </div>

        <div v-if="!store.loading && store.distributions.length === 0" class="text-center py-12">
          <p class="text-[14px] text-[#BBB]">배분 내역이 없습니다</p>
        </div>

        <!-- Inline Edit Form -->
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
      </main>

      <AgentBottomNav />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useDbDistributionStore } from '../../stores/dbDistributionStore'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import DbDistributionItem from '../../components/ui/DbDistributionItem.vue'
import FormTextarea from '@user/components/form/FormTextarea.vue'
import ActionButton from '@user/components/ui/ActionButton.vue'

const store = useDbDistributionStore()

const editingId = ref<number | null>(null)
const editNotes = ref('')
const processing = ref(false)

onMounted(() => {
  store.loadDistributions()
})

function openEditForm(id: number, currentNotes?: string): void {
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
    await store.process(editingId.value, { notes: editNotes.value })
    closeEditForm()
  } catch {
    // Error handled in store
  } finally {
    processing.value = false
  }
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
