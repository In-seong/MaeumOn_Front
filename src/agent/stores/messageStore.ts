import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Message, MessageTemplate } from '../types'
import { sendMessage as apiSendMessage, fetchMessageHistory } from '../services/agentApi'

export const useMessageStore = defineStore('agentMessage', () => {
  const sendMethod = ref<'SMS' | 'KAKAO' | 'PUSH'>('SMS')
  const messageHistory = ref<Message[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentPage = ref(1)
  const lastPage = ref(1)
  const total = ref(0)

  // 카카오 알림톡 템플릿 (백엔드 미구현, 로컬 유지)
  const kakaoTemplates = ref<MessageTemplate[]>([
    {
      template_id: 'TPL001',
      template_name: '보험만기안내',
      content:
        '[보험만기안내]\n#{고객명} 고객님, 가입하신 #{보험상품명}의 만기일이 #{만기일}입니다.\n\n만기 전 갱신 또는 새로운 상품 상담을 원하시면 아래 버튼을 눌러주세요.\n\n감사합니다.',
      category: '안내',
    },
    {
      template_id: 'TPL002',
      template_name: '상담예약확인',
      content:
        '[상담예약확인]\n#{고객명} 고객님, 상담 예약이 확정되었습니다.\n\n- 일시: #{상담일시}\n- 장소: #{상담장소}\n- 담당: #{설계사명}\n\n변경이 필요하시면 연락 부탁드립니다.',
      category: '예약',
    },
    {
      template_id: 'TPL003',
      template_name: '계약체결안내',
      content:
        '[계약체결안내]\n#{고객명} 고객님, 보험 계약이 정상적으로 체결되었습니다.\n\n- 상품명: #{보험상품명}\n- 보험료: #{보험료}원/월\n- 보장개시일: #{보장개시일}\n\n보험증권은 별도로 발송됩니다.\n감사합니다.',
      category: '계약',
    },
  ])

  async function send(data: {
    receiver_id: string
    message_type: string
    phone_number: string
    message_content: string
    image_url?: string
    scheduled_at?: string
  }) {
    loading.value = true
    error.value = null
    try {
      const res = await apiSendMessage(data)
      messageHistory.value.unshift(res.data.data)
      return res.data.data
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메시지 발송에 실패했습니다.'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function loadHistory(params?: Record<string, unknown>) {
    loading.value = true
    error.value = null
    try {
      const queryParams: Record<string, unknown> = {
        page: currentPage.value,
        ...params,
      }
      const res = await fetchMessageHistory(queryParams)
      const paginated = res.data.data
      messageHistory.value = paginated.data
      currentPage.value = paginated.current_page
      lastPage.value = paginated.last_page
      total.value = paginated.total
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message
      error.value = msg || '메시지 내역을 불러오는데 실패했습니다.'
    } finally {
      loading.value = false
    }
  }

  return {
    sendMethod,
    messageHistory,
    kakaoTemplates,
    loading,
    error,
    currentPage,
    lastPage,
    total,
    send,
    loadHistory,
  }
})
