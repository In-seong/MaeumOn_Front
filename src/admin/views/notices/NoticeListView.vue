<template>
  <div class="p-4 lg:p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-[20px] lg:text-[22px] font-bold text-[#333]">공지사항 관리</h1>
      <router-link
        to="/notices/create"
        class="px-3 lg:px-4 py-2 lg:py-2.5 bg-[#FF7B22] text-white rounded-[12px] hover:bg-[#E56D1E] transition-colors text-[13px] lg:text-[14px] font-medium"
      >
        공지사항 등록
      </router-link>
    </div>

    <!-- 필터 -->
    <div class="mb-4 flex flex-col sm:flex-row gap-3">
      <select
        v-model="noticeTypeFilter"
        class="px-4 py-2.5 bg-[#F8F8F8] border border-[#E8E8E8] rounded-[12px] focus:outline-none focus:border-[#FF7B22] text-[14px] text-[#333]"
        @change="fetchData()"
      >
        <option value="">전체 유형</option>
        <option value="일반">일반</option>
        <option value="긴급">긴급</option>
        <option value="이벤트">이벤트</option>
        <option value="시스템">시스템</option>
      </select>
      <button
        :class="[
          'px-4 py-2.5 rounded-[12px] text-[14px] font-medium transition-colors border',
          pinnedFilter
            ? 'bg-[#FF7B22] text-white border-[#FF7B22]'
            : 'bg-[#F8F8F8] text-[#333] border-[#E8E8E8] hover:border-[#FF7B22]'
        ]"
        @click="togglePinnedFilter"
      >
        <span class="material-symbols-outlined text-[16px] align-middle mr-1">push_pin</span>
        고정글만
      </button>
    </div>

    <!-- 로딩 상태 -->
    <div v-if="store.loading" class="text-center py-10">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-[#FF7B22] mx-auto"></div>
      <p class="mt-2 text-[14px] text-[#999]">로딩 중...</p>
    </div>

    <!-- 에러 상태 -->
    <div v-else-if="store.error" class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-[12px] text-[14px]">
      {{ store.error }}
    </div>

    <!-- 테이블 -->
    <div v-else class="bg-white rounded-[16px] shadow-[0_0_10px_rgba(0,0,0,0.06)] overflow-x-auto">
      <table class="min-w-full divide-y divide-[#E8E8E8]">
        <thead class="bg-[#FAFAFA]">
          <tr>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">제목</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">유형</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">작성자</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">조회수</th>
            <th class="px-6 py-3 text-left text-[12px] font-medium text-[#999] uppercase tracking-wider">등록일</th>
            <th class="px-6 py-3 text-right text-[12px] font-medium text-[#999] uppercase tracking-wider">관리</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-[#F0F0F0]">
          <tr
            v-for="notice in store.notices"
            :key="notice.notice_id"
            :class="[
              'hover:bg-[#FAFAFA] transition-colors cursor-pointer',
              notice.is_pinned ? 'bg-[#FFFAF5]' : ''
            ]"
            @click="goToDetail(notice.notice_id)"
          >
            <td class="px-6 py-4 text-[14px] font-medium text-[#333]">
              <span v-if="notice.is_pinned" class="text-[#FF7B22] font-bold mr-1">[고정]</span>
              {{ notice.title }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span
                v-if="notice.notice_type"
                :class="noticeTypeBadgeClass(notice.notice_type)"
                class="px-2.5 py-1 text-[12px] font-medium rounded-full"
              >
                {{ notice.notice_type }}
              </span>
              <span v-else class="text-[14px] text-[#999]">-</span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ notice.author?.name || '-' }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ notice.view_count }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-[14px] text-[#999]">
              {{ formatDate(notice.created_at) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-[14px] font-medium" @click.stop>
              <router-link
                :to="`/notices/${notice.notice_id}`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                상세
              </router-link>
              <router-link
                :to="`/notices/${notice.notice_id}/edit`"
                class="text-[#FF7B22] hover:text-[#E56D1E] mr-3"
              >
                수정
              </router-link>
              <button
                @click="handleDelete(notice)"
                class="text-red-500 hover:text-red-600"
              >
                삭제
              </button>
            </td>
          </tr>
          <tr v-if="store.notices.length === 0">
            <td colspan="6" class="px-6 py-10 text-center text-[#999]">
              등록된 공지사항이 없습니다.
            </td>
          </tr>
        </tbody>
      </table>

      <!-- 페이지네이션 -->
      <div v-if="store.pagination.lastPage > 1" class="px-6 py-4 border-t border-[#F0F0F0]">
        <div class="flex justify-center gap-2">
          <button
            v-for="page in store.pagination.lastPage"
            :key="page"
            @click="goToPage(page)"
            :class="[
              'px-3 py-1 rounded-[8px] text-[14px]',
              page === store.pagination.currentPage
                ? 'bg-[#FF7B22] text-white'
                : 'bg-[#F8F8F8] text-[#555] hover:bg-[#FFF3ED] hover:text-[#FF7B22]'
            ]"
          >
            {{ page }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useNoticeStore } from '../../stores/noticeStore'
import type { AdminNotice } from '../../types'

const router = useRouter()
const store = useNoticeStore()

const noticeTypeFilter = ref('')
const pinnedFilter = ref(false)

function togglePinnedFilter() {
  pinnedFilter.value = !pinnedFilter.value
  fetchData()
}

async function fetchData(page = 1) {
  await store.loadNotices({
    notice_type: noticeTypeFilter.value || undefined,
    is_pinned: pinnedFilter.value ? true : undefined,
    page,
  })
}

function goToPage(page: number) {
  fetchData(page)
}

function goToDetail(noticeId: number) {
  router.push(`/notices/${noticeId}`)
}

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

async function handleDelete(notice: AdminNotice) {
  if (!window.confirm(`"${notice.title}" 공지사항을 삭제하시겠습니까?`)) {
    return
  }

  try {
    await store.deleteNotice(notice.notice_id)
    alert('삭제되었습니다.')
  } catch (e: any) {
    alert(e.response?.data?.message || '삭제에 실패했습니다.')
  }
}

onMounted(() => {
  fetchData()
})
</script>
