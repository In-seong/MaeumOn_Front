import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { Message, MessageTemplate } from '../types'

export const useMessageStore = defineStore('agentMessage', () => {
  const sendType = ref<'sms' | 'kakao' | 'push'>('sms')

  const messageHistory = ref<Message[]>([
    {
      message_id: 1,
      agent_id: 'AGT00001',
      customer_id: 101,
      customer_name: '김영수',
      send_type: 'sms',
      content: '안녕하세요, 김영수 고객님. 보험 만기일이 다가오고 있어 안내 드립니다.',
      status: 'sent',
      sent_at: '2026-02-12 09:30',
    },
    {
      message_id: 2,
      agent_id: 'AGT00001',
      customer_id: 102,
      customer_name: '박미정',
      send_type: 'kakao',
      content: '[보험만기안내] 박미정 고객님, 가입하신 보험의 만기일이 2026-03-15입니다.',
      template_id: 'TPL001',
      status: 'sent',
      sent_at: '2026-02-11 14:20',
    },
    {
      message_id: 3,
      agent_id: 'AGT00001',
      customer_id: 103,
      customer_name: '이정훈',
      send_type: 'push',
      content: '상담 예약이 확정되었습니다. 2월 13일 오후 2시에 뵙겠습니다.',
      status: 'sent',
      sent_at: '2026-02-11 11:00',
    },
    {
      message_id: 4,
      agent_id: 'AGT00001',
      customer_id: 104,
      customer_name: '최수연',
      send_type: 'sms',
      content: '최수연 고객님, 청구하신 보험금이 승인되었습니다. 확인 부탁드립니다.',
      status: 'failed',
      sent_at: '2026-02-10 16:45',
    },
    {
      message_id: 5,
      agent_id: 'AGT00001',
      customer_id: 105,
      customer_name: '정민호',
      send_type: 'kakao',
      content: '[계약체결안내] 정민호 고객님, 보험 계약이 정상적으로 체결되었습니다.',
      template_id: 'TPL003',
      status: 'sent',
      sent_at: '2026-02-10 10:15',
    },
    {
      message_id: 6,
      agent_id: 'AGT00001',
      customer_id: 101,
      customer_name: '김영수',
      send_type: 'push',
      content: '김영수 고객님, 새로운 보험 상품 안내가 있습니다.',
      status: 'pending',
      sent_at: '2026-02-09 15:30',
    },
  ])

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

  function sendMessage(data: {
    sendType: 'sms' | 'kakao' | 'push'
    customerName: string
    customerId?: number
    content: string
    templateId?: string
    imageUrl?: string
  }): void {
    const newMessage: Message = {
      message_id: Date.now(),
      agent_id: 'AGT00001',
      customer_id: data.customerId,
      customer_name: data.customerName,
      send_type: data.sendType,
      content: data.content,
      template_id: data.templateId,
      image_url: data.imageUrl,
      status: 'sent',
      sent_at: new Date().toLocaleString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    }
    messageHistory.value.unshift(newMessage)
  }

  function fetchHistory(): void {
    // Mock: data is already loaded via initial ref
  }

  return {
    sendType,
    messageHistory,
    kakaoTemplates,
    sendMessage,
    fetchHistory,
  }
})
