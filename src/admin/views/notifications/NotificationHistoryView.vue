<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { fetchSentNotifications } from '../../services/adminApi'
import type { AdminSentNotification } from '../../types'

interface PaginationMeta {
  current_page: number
  last_page: number
  total: number
}

const router = useRouter()
const notifications = ref<AdminSentNotification[]>([])
const loading = ref(false)
const meta = ref<PaginationMeta>({ current_page: 1, last_page: 1, total: 0 })

async function load(page = 1) {
  loading.value = true
  try {
    const res = await fetchSentNotifications({ page, per_page: 20 })
    const data = res.data?.data
    notifications.value = data?.data ?? []
    meta.value = {
      current_page: data?.current_page ?? 1,
      last_page: data?.last_page ?? 1,
      total: data?.total ?? 0,
    }
  } catch {
    // handled globally
  } finally {
    loading.value = false
  }
}

onMounted(() => load())

function formatDate(d?: string): string {
  if (!d) return '-'
  return d.replace('T', ' ').slice(0, 16)
}
</script>

<template>
  <div>
    <!-- 헤더 -->
    <div class="flex items-center justify-between mb-6">
      <div>
        <h1 class="text-[22px] font-bold text-[#222]">발송 이력</h1>
        <p class="text-[13px] text-[#999] mt-1">총 {{ meta.total }}건</p>
      </div>
      <button
        class="px-4 py-2 bg-[#FF7B22] text-white text-[13px] font-medium rounded-[8px] hover:bg-[#E86B15] transition-colors"
        @click="router.push({ name: 'notification-send' })"
      >
        새 알림 발송
      </button>
    </div>

    <!-- 테이블 -->
    <div class="bg-white rounded-[12px] border border-[#E8E8E8] overflow-hidden">
      <div v-if="loading" class="py-12 text-center text-[13px] text-[#BBB]">불러오는 중...</div>

      <table v-else-if="notifications.length > 0" class="w-full text-left">
        <thead class="bg-[#FAFAFA] border-b border-[#E8E8E8]">
          <tr>
            <th class="px-5 py-3 text-[12px] font-semibold text-[#999]">제목</th>
            <th class="px-5 py-3 text-[12px] font-semibold text-[#999]">내용</th>
            <th class="px-5 py-3 text-[12px] font-semibold text-[#999]">수신자</th>
            <th class="px-5 py-3 text-[12px] font-semibold text-[#999]">읽음</th>
            <th class="px-5 py-3 text-[12px] font-semibold text-[#999]">발송일시</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="noti in notifications"
            :key="noti.notification_id"
            class="border-b border-[#F5F5F5] hover:bg-[#FAFAFA]"
          >
            <td class="px-5 py-3 text-[14px] text-[#333] font-medium max-w-[200px] truncate">{{ noti.title }}</td>
            <td class="px-5 py-3 text-[13px] text-[#666] max-w-[300px] truncate">{{ noti.content }}</td>
            <td class="px-5 py-3 text-[13px] text-[#666]">{{ noti.receiver_id }}</td>
            <td class="px-5 py-3">
              <span
                :class="[
                  'inline-block px-2 py-0.5 rounded-full text-[11px] font-medium',
                  noti.is_read ? 'bg-[#E8F9EE] text-[#1FBD53]' : 'bg-[#FFF0E5] text-[#FF7B22]',
                ]"
              >
                {{ noti.is_read ? '읽음' : '미읽음' }}
              </span>
            </td>
            <td class="px-5 py-3 text-[13px] text-[#999]">{{ formatDate(noti.sent_at) }}</td>
          </tr>
        </tbody>
      </table>

      <div v-else class="py-12 text-center text-[13px] text-[#BBB]">발송 이력이 없습니다</div>
    </div>

    <!-- 페이지네이션 -->
    <div v-if="meta.last_page > 1" class="flex justify-center gap-2 mt-4">
      <button
        v-for="p in meta.last_page"
        :key="p"
        :class="[
          'w-8 h-8 rounded-[6px] text-[13px] font-medium transition-colors',
          p === meta.current_page
            ? 'bg-[#FF7B22] text-white'
            : 'bg-white text-[#666] border border-[#DDD] hover:border-[#FF7B22]',
        ]"
        @click="load(p)"
      >
        {{ p }}
      </button>
    </div>
  </div>
</template>
