<template>
  <div class="p-6">
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div class="flex items-center">
        <router-link to="/notices" class="text-[#999] hover:text-[#FF7B22] mr-4 transition-colors">
          <span class="material-symbols-outlined text-[24px]">arrow_back</span>
        </router-link>
        <h1 class="text-[22px] font-bold text-[#333]">공지사항 상세</h1>
      </div>
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
    <div v-else-if="notice" class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-hidden">
      <!-- 제목 영역 -->
      <div class="px-6 py-5 border-b border-[#F0F0F0]">
        <div class="flex items-center gap-2 mb-2">
          <span
            v-if="notice.notice_type"
            :class="noticeTypeBadgeClass(notice.notice_type)"
            class="px-2.5 py-1 text-[12px] font-medium rounded-full"
          >
            {{ notice.notice_type }}
          </span>
          <span
            v-if="notice.is_pinned"
            class="px-2.5 py-1 text-[12px] font-medium rounded-full bg-orange-100 text-[#FF7B22]"
          >
            <span class="material-symbols-outlined text-[12px] align-middle mr-0.5">push_pin</span>
            고정
          </span>
        </div>
        <h2 class="text-[18px] font-bold text-[#333]">{{ notice.title }}</h2>
        <div class="flex items-center gap-3 mt-3">
          <span class="text-[13px] text-[#999]">
            <span class="material-symbols-outlined text-[14px] align-middle mr-1">person</span>
            {{ notice.author?.name || '-' }}
          </span>
          <span class="text-[13px] text-[#CCCCCC]">|</span>
          <span class="text-[13px] text-[#999]">
            <span class="material-symbols-outlined text-[14px] align-middle mr-1">calendar_today</span>
            {{ formatDate(notice.created_at) }}
          </span>
          <span class="text-[13px] text-[#CCCCCC]">|</span>
          <span class="text-[13px] text-[#999]">
            <span class="material-symbols-outlined text-[14px] align-middle mr-1">visibility</span>
            조회 {{ notice.view_count }}
          </span>
        </div>
      </div>

      <!-- 본문 영역 -->
      <div class="px-6 py-6">
        <div class="text-[14px] text-[#333] leading-relaxed whitespace-pre-wrap min-h-[200px]">{{ notice.content }}</div>
      </div>

      <!-- 게시 기간 (설정된 경우) -->
      <div
        v-if="notice.display_start_date || notice.display_end_date"
        class="px-6 py-4 border-t border-[#F0F0F0] bg-[#FAFAFA]"
      >
        <div class="flex items-center text-[13px] text-[#999]">
          <span class="material-symbols-outlined text-[14px] mr-1">schedule</span>
          게시 기간:
          {{ notice.display_start_date ? formatDate(notice.display_start_date) : '시작일 없음' }}
          ~
          {{ notice.display_end_date ? formatDate(notice.display_end_date) : '종료일 없음' }}
        </div>
      </div>

      <!-- 하단 버튼 -->
      <div class="px-6 py-4 border-t border-[#F0F0F0] flex justify-end gap-3">
        <router-link
          :to="`/notices/${notice.notice_id}/edit`"
          class="px-4 py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[14px] font-medium"
        >
          수정
        </router-link>
        <button
          @click="handleDelete"
          class="px-4 py-2.5 border border-red-300 text-red-500 rounded-[12px] hover:bg-red-50 transition-colors text-[14px] font-medium"
        >
          삭제
        </button>
      </div>
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

const loading = ref(false)

const notice = computed(() => store.selectedNotice)

function formatDate(dateStr?: string): string {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function noticeTypeBadgeClass(type: string): string {
  switch (type) {
    case '긴급':
      return 'bg-red-100 text-red-600'
    case '이벤트':
      return 'bg-blue-100 text-blue-600'
    case '시스템':
      return 'bg-gray-100 text-gray-600'
    default:
      return 'bg-green-100 text-green-700'
  }
}

async function handleDelete() {
  if (!notice.value) return
  if (!window.confirm(`"${notice.value.title}" 공지사항을 삭제하시겠습니까?`)) return

  try {
    await store.deleteNotice(notice.value.notice_id)
    alert('삭제되었습니다.')
    router.push('/notices')
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(async () => {
  loading.value = true
  try {
    await store.loadNotice(Number(route.params.id))
  } finally {
    loading.value = false
  }
})
</script>
