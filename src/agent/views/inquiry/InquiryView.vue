<template>
  <div class="min-h-screen bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF] flex justify-center">
    <div class="w-full max-w-[402px] h-screen relative bg-gradient-to-b from-[#FFF3ED] to-[#FFFFFF]">
      <BackHeader title="문의하기" />

      <main class="px-5 py-3 pb-20 overflow-y-auto" style="height: calc(100dvh - 56px - 60px);">
        <!-- 새 문의 버튼 -->
        <button
          class="w-full mb-4 py-3 bg-[#FF7B22] text-white text-[14px] font-medium rounded-[12px] active:scale-[0.98] transition-transform"
          @click="showCreateModal = true"
        >
          새 문의 작성
        </button>

        <!-- 필터 탭 -->
        <div class="flex gap-2 mb-4" role="tablist">
          <button
            v-for="tab in filterTabs"
            :key="tab.value"
            role="tab"
            :aria-selected="currentFilter === tab.value"
            :class="[
              'flex-shrink-0 px-3.5 py-2 rounded-full text-[13px] font-medium transition-all',
              currentFilter === tab.value
                ? 'bg-[#FF7B22] text-white'
                : 'bg-white text-[#888] border border-[#E8E8E8]',
            ]"
            @click="currentFilter = tab.value; loadInquiries()"
          >
            {{ tab.label }}
          </button>
        </div>

        <!-- 로딩 -->
        <div v-if="loading" class="flex justify-center py-8">
          <p class="text-[13px] text-[#BBB]">불러오는 중...</p>
        </div>

        <!-- 문의 목록 -->
        <div v-else-if="inquiries.length > 0" class="flex flex-col gap-3">
          <div
            v-for="item in inquiries"
            :key="item.inquiry_id"
            class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-4 active:scale-[0.99] transition-transform"
            @click="openDetail(item)"
          >
            <div class="flex items-center gap-2 mb-2">
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="categoryColorMap[item.category]"
              >{{ categoryMap[item.category] }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="item.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >{{ item.status === 'answered' ? '답변완료' : '답변대기' }}</span>
            </div>
            <p class="text-[14px] font-medium text-[#333] mb-1 line-clamp-1">{{ item.title }}</p>
            <p class="text-[12px] text-[#999]">{{ formatDate(item.created_at) }}</p>
          </div>
        </div>

        <!-- 빈 상태 -->
        <div v-else class="flex flex-col items-center justify-center py-16">
          <div class="w-16 h-16 bg-[#FFF3ED] rounded-full flex items-center justify-center mb-4">
            <svg class="w-8 h-8 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p class="text-[15px] font-medium text-[#888]">문의 내역이 없습니다</p>
          <p class="text-[13px] text-[#BBB] mt-1">새 문의를 작성해보세요</p>
        </div>
      </main>

      <AgentBottomNav />
    </div>
  </div>

  <!-- 작성 모달 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showCreateModal" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" @click.self="showCreateModal = false">
        <div class="w-full max-w-[402px] bg-white rounded-t-[20px] p-5 pb-8 animate-slide-up max-h-[85dvh] overflow-y-auto">
          <div class="flex items-center justify-between mb-5">
            <h3 class="text-[17px] font-bold text-[#333]">새 문의 작성</h3>
            <button class="text-[#999]" @click="showCreateModal = false">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- 카테고리 -->
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">카테고리</label>
          <div class="flex gap-2 mb-4 flex-wrap">
            <button
              v-for="cat in categories"
              :key="cat.value"
              :class="[
                'px-3 py-1.5 rounded-full text-[13px] font-medium transition-all',
                form.category === cat.value
                  ? 'bg-[#FF7B22] text-white'
                  : 'bg-[#F5F5F5] text-[#888]',
              ]"
              @click="form.category = cat.value"
            >{{ cat.label }}</button>
          </div>

          <!-- 제목 -->
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">제목</label>
          <input
            v-model="form.title"
            type="text"
            placeholder="문의 제목을 입력하세요"
            class="w-full px-4 py-3 text-[14px] border border-[#E0E0E0] rounded-[12px] mb-4 focus:outline-none focus:border-[#FF7B22]"
          />

          <!-- 내용 -->
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">내용</label>
          <textarea
            v-model="form.content"
            rows="5"
            placeholder="문의 내용을 상세히 작성해주세요"
            class="w-full px-4 py-3 text-[14px] border border-[#E0E0E0] rounded-[12px] mb-4 resize-none focus:outline-none focus:border-[#FF7B22]"
          ></textarea>

          <!-- 첨부파일 -->
          <label class="block text-[13px] font-medium text-[#555] mb-1.5">첨부파일 (최대 3개)</label>
          <div class="mb-4">
            <label
              v-if="form.files.length < 3"
              class="inline-flex items-center gap-1.5 px-3 py-2 bg-[#F5F5F5] rounded-[10px] text-[13px] text-[#555] cursor-pointer hover:bg-[#EBEBEB] transition-colors"
            >
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
              </svg>
              파일 선택
              <input type="file" class="hidden" accept="image/*,.pdf,.doc,.docx" multiple @change="handleFileSelect" />
            </label>
            <div v-if="form.files.length > 0" class="mt-2 space-y-1.5">
              <div
                v-for="(file, idx) in form.files"
                :key="idx"
                class="flex items-center justify-between bg-[#F9F9F9] rounded-[8px] px-3 py-2"
              >
                <span class="text-[12px] text-[#555] truncate max-w-[200px]">{{ file.name }}</span>
                <button class="text-[#999] hover:text-[#E86A33]" @click="removeFile(idx)">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          <!-- 제출 -->
          <button
            :disabled="submitting || !form.title.trim() || !form.content.trim()"
            class="w-full py-3.5 bg-[#FF7B22] text-white text-[15px] font-medium rounded-[12px] disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] transition-transform"
            @click="submitInquiry"
          >
            {{ submitting ? '등록 중...' : '문의 등록' }}
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- 상세 모달 -->
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="showDetailModal && selectedInquiry" class="fixed inset-0 bg-black/40 z-50 flex items-end justify-center" @click.self="showDetailModal = false">
        <div class="w-full max-w-[402px] bg-white rounded-t-[20px] p-5 pb-8 animate-slide-up max-h-[85dvh] overflow-y-auto">
          <div class="flex items-center justify-between mb-4">
            <div class="flex items-center gap-2">
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="categoryColorMap[selectedInquiry.category]"
              >{{ categoryMap[selectedInquiry.category] }}</span>
              <span
                class="px-2 py-0.5 rounded-full text-[11px] font-medium"
                :class="selectedInquiry.status === 'answered' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'"
              >{{ selectedInquiry.status === 'answered' ? '답변완료' : '답변대기' }}</span>
            </div>
            <button class="text-[#999]" @click="showDetailModal = false">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <h3 class="text-[16px] font-bold text-[#333] mb-1">{{ selectedInquiry.title }}</h3>
          <p class="text-[12px] text-[#999] mb-4">{{ formatDate(selectedInquiry.created_at) }}</p>

          <div class="bg-[#F9F9F9] rounded-[12px] p-4 mb-4">
            <p class="text-[14px] text-[#333] whitespace-pre-wrap leading-relaxed">{{ selectedInquiry.content }}</p>
          </div>

          <!-- 첨부파일 -->
          <div v-if="selectedInquiry.attachment_urls && selectedInquiry.attachment_urls.length > 0" class="mb-4">
            <p class="text-[13px] font-medium text-[#555] mb-2">첨부파일</p>
            <div class="space-y-1.5">
              <a
                v-for="(att, idx) in selectedInquiry.attachment_urls"
                :key="idx"
                :href="att.url"
                target="_blank"
                class="flex items-center gap-2 bg-[#F5F5F5] rounded-[8px] px-3 py-2 text-[13px] text-[#FF7B22] hover:bg-[#FFF3ED] transition-colors"
              >
                <svg class="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                </svg>
                <span class="truncate">{{ att.name }}</span>
              </a>
            </div>
          </div>

          <!-- 답변 -->
          <div v-if="selectedInquiry.answer" class="border-t border-[#E8E8E8] pt-4">
            <div class="flex items-center gap-2 mb-2">
              <svg class="w-4 h-4 text-[#FF7B22]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
              <span class="text-[13px] font-bold text-[#FF7B22]">관리자 답변</span>
              <span v-if="selectedInquiry.answered_at" class="text-[11px] text-[#999]">{{ formatDate(selectedInquiry.answered_at) }}</span>
            </div>
            <div class="bg-[#FFF3ED] rounded-[12px] p-4">
              <p class="text-[14px] text-[#333] whitespace-pre-wrap leading-relaxed">{{ selectedInquiry.answer }}</p>
            </div>
          </div>

          <div v-else class="border-t border-[#E8E8E8] pt-4">
            <p class="text-[13px] text-[#999] text-center py-3">아직 답변이 등록되지 않았습니다</p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import BackHeader from '@user/components/layout/BackHeader.vue'
import AgentBottomNav from '../../components/layout/AgentBottomNav.vue'
import { fetchMyInquiries, createInquiry } from '../../services/agentApi'
import type { InquiryItem } from '../../types'

const loading = ref(false)
const submitting = ref(false)
const inquiries = ref<InquiryItem[]>([])
const currentFilter = ref<string>('all')
const showCreateModal = ref(false)
const showDetailModal = ref(false)
const selectedInquiry = ref<InquiryItem | null>(null)

const form = ref({
  category: 'business' as string,
  title: '',
  content: '',
  files: [] as File[],
})

const filterTabs = [
  { label: '전체', value: 'all' },
  { label: '답변대기', value: 'pending' },
  { label: '답변완료', value: 'answered' },
]

const categories = [
  { value: 'business', label: '업무 문의' },
  { value: 'system_error', label: '시스템 오류' },
  { value: 'feature_request', label: '기능 건의' },
  { value: 'other', label: '기타' },
]

const categoryMap: Record<string, string> = {
  system_error: '시스템 오류',
  feature_request: '기능 건의',
  business: '업무 문의',
  other: '기타',
}

const categoryColorMap: Record<string, string> = {
  system_error: 'bg-red-100 text-red-700',
  feature_request: 'bg-blue-100 text-blue-700',
  business: 'bg-green-100 text-green-700',
  other: 'bg-gray-100 text-gray-600',
}

function formatDate(dateStr: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

async function loadInquiries() {
  loading.value = true
  try {
    const params: Record<string, unknown> = {}
    if (currentFilter.value !== 'all') params.status = currentFilter.value
    const res = await fetchMyInquiries(params)
    inquiries.value = res.data.data ?? []
  } catch {
    inquiries.value = []
  } finally {
    loading.value = false
  }
}

function openDetail(item: InquiryItem) {
  selectedInquiry.value = item
  showDetailModal.value = true
}

function handleFileSelect(e: Event) {
  const target = e.target as HTMLInputElement
  const files = target.files
  if (!files) return
  const remaining = 3 - form.value.files.length
  for (let i = 0; i < Math.min(files.length, remaining); i++) {
    const f = files[i]
    if (f) form.value.files.push(f)
  }
  target.value = ''
}

function removeFile(idx: number) {
  form.value.files.splice(idx, 1)
}

async function submitInquiry() {
  if (!form.value.title.trim() || !form.value.content.trim()) return
  submitting.value = true
  try {
    const fd = new FormData()
    fd.append('category', form.value.category)
    fd.append('title', form.value.title.trim())
    fd.append('content', form.value.content.trim())
    for (const file of form.value.files) {
      fd.append('files[]', file)
    }
    await createInquiry(fd)
    showCreateModal.value = false
    form.value = { category: 'business', title: '', content: '', files: [] }
    await loadInquiries()
  } catch {
    alert('문의 등록에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadInquiries()
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
.animate-slide-up {
  animation: slideUp 0.25s ease-out;
}
@keyframes slideUp {
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
}
.line-clamp-1 {
  display: -webkit-box;
  -webkit-line-clamp: 1;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>
