<template>
  <div class="p-6">
    <div class="max-w-2xl mx-auto">
      <div class="flex items-center mb-6">
        <router-link to="/notices" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">
          {{ isEdit ? '공지사항 수정' : '공지사항 등록' }}
        </h1>
      </div>

      <div v-if="loading" class="text-center py-10">
        <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      </div>

      <form v-else @submit.prevent="handleSubmit" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] p-6">
        <div class="space-y-5">
          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              제목 <span class="text-red-500">*</span>
            </label>
            <input
              v-model="form.title"
              type="text"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999]"
              placeholder="공지사항 제목을 입력하세요"
            />
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              내용 <span class="text-red-500">*</span>
            </label>
            <textarea
              v-model="form.content"
              rows="10"
              required
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333] placeholder-[#999] resize-none"
              placeholder="공지사항 내용을 입력하세요"
            ></textarea>
          </div>

          <div>
            <label class="block text-[13px] font-medium text-[#555] mb-2">
              공지 유형
            </label>
            <select
              v-model="form.notice_type"
              class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
            >
              <option value="">선택</option>
              <option value="일반">일반</option>
              <option value="긴급">긴급</option>
              <option value="이벤트">이벤트</option>
              <option value="시스템">시스템</option>
            </select>
          </div>

          <div class="flex items-center gap-3">
            <label class="flex items-center cursor-pointer">
              <input
                v-model="form.is_pinned"
                type="checkbox"
                class="w-4 h-4 text-[#FF7B22] bg-[#F8F8F8] border-[#E8E8E8] rounded focus:ring-[#FF7B22] focus:ring-offset-0"
              />
              <span class="ml-2 text-[13px] font-medium text-[#555]">상단 고정</span>
            </label>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-2">
                게시 시작일
              </label>
              <input
                v-model="form.display_start_date"
                type="date"
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
              />
            </div>
            <div>
              <label class="block text-[13px] font-medium text-[#555] mb-2">
                게시 종료일
              </label>
              <input
                v-model="form.display_end_date"
                type="date"
                class="w-full px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
              />
            </div>
          </div>

          <div v-if="!isEdit" class="bg-[#FFF8F3] border border-[#FFE0C2] rounded-[12px] p-4">
            <div class="flex items-start">
              <span class="material-symbols-outlined text-[18px] text-[#FF7B22] mr-2 mt-0.5">info</span>
              <p class="text-[13px] text-[#555]">
                공지사항 등록 시 모든 활성 설계사에게 알림이 자동 발송됩니다.
              </p>
            </div>
          </div>
        </div>

        <div class="mt-8 flex justify-end gap-3">
          <router-link
            to="/notices"
            class="px-4 py-2.5 border border-[#E0E0E0] text-[#555] rounded-[12px] hover:bg-[#FAFAFA] transition-colors text-[14px]"
          >
            취소
          </router-link>
          <button
            type="submit"
            :disabled="submitting"
            class="px-6 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] disabled:opacity-50 transition-colors text-[14px] font-medium"
          >
            {{ submitting ? '저장 중...' : (isEdit ? '수정' : '저장 및 발송') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useNoticeStore } from '../../stores/noticeStore'

const route = useRoute()
const router = useRouter()
const store = useNoticeStore()

const isEdit = computed(() => !!route.params.id)
const loading = ref(false)
const submitting = ref(false)

const form = ref({
  title: '',
  content: '',
  notice_type: '',
  is_pinned: false,
  display_start_date: '',
  display_end_date: '',
})

async function loadData() {
  if (!isEdit.value) return

  loading.value = true
  try {
    const notice = await store.loadNotice(Number(route.params.id))
    if (notice) {
      form.value = {
        title: notice.title || '',
        content: notice.content || '',
        notice_type: notice.notice_type || '',
        is_pinned: notice.is_pinned || false,
        display_start_date: notice.display_start_date ? String(notice.display_start_date).substring(0, 10) : '',
        display_end_date: notice.display_end_date ? String(notice.display_end_date).substring(0, 10) : '',
      }
    }
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true

  const payload: Record<string, unknown> = {
    title: form.value.title,
    content: form.value.content,
    is_pinned: form.value.is_pinned,
  }
  if (form.value.notice_type) payload.notice_type = form.value.notice_type
  if (form.value.display_start_date) payload.display_start_date = form.value.display_start_date
  if (form.value.display_end_date) payload.display_end_date = form.value.display_end_date

  try {
    if (isEdit.value) {
      await store.updateNotice(Number(route.params.id), payload)
      alert('수정되었습니다.')
      router.push(`/notices/${route.params.id}`)
    } else {
      const created = await store.createNotice(payload)
      alert('공지사항이 등록되었습니다. 설계사에게 알림이 발송됩니다.')
      router.push(`/notices/${created.notice_id}`)
    }
  } catch (e: any) {
    alert(e.response?.data?.message || '저장에 실패했습니다.')
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  loadData()
})
</script>
