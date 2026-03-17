import { ref } from 'vue'
import { defineStore } from 'pinia'
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from '../services/agentApi'
import type { AgentNotification } from '../types'

export const useNotificationStore = defineStore('agentNotification', () => {
  const unreadCount = ref(0)
  const notifications = ref<AgentNotification[]>([])
  const loading = ref(false)

  async function loadNotifications(): Promise<void> {
    loading.value = true
    try {
      const res = await fetchNotifications()
      const data = res.data?.data
      notifications.value = data?.notifications?.data ?? []
      unreadCount.value = data?.unread_count ?? 0
    } catch {
      // silent
    } finally {
      loading.value = false
    }
  }

  async function refreshUnreadCount(): Promise<void> {
    try {
      const res = await fetchNotifications({ per_page: 1 })
      unreadCount.value = res.data?.data?.unread_count ?? 0
    } catch {
      // silent
    }
  }

  async function markRead(noti: AgentNotification): Promise<void> {
    if (noti.is_read) return
    try {
      await markNotificationRead(noti.notification_id)
      noti.is_read = true
      unreadCount.value = Math.max(0, unreadCount.value - 1)
    } catch {
      // silent
    }
  }

  async function markAllRead(): Promise<void> {
    try {
      await markAllNotificationsRead()
      notifications.value.forEach(n => { n.is_read = true })
      unreadCount.value = 0
    } catch {
      // silent
    }
  }

  return {
    unreadCount,
    notifications,
    loading,
    loadNotifications,
    refreshUnreadCount,
    markRead,
    markAllRead,
  }
})
