import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Consultation } from '../types'

export const useConsultationStore = defineStore('agentConsultation', () => {
  const filterStatus = ref<'all' | 'pending' | 'in_progress' | 'completed'>('all')

  const consultations = ref<Consultation[]>([
    {
      consultation_id: 1,
      customer_id: 101,
      agent_id: 'AGT00001',
      customer_name: '김영수',
      customer_phone: '010-1234-5678',
      consultation_type: '보험상담',
      content: '현재 가입한 실손보험의 보장 범위에 대해 궁금합니다. 최근 병원 진료를 받았는데 어디까지 보장이 되는지 상세히 알고 싶습니다.',
      status: 'pending',
      requested_at: '2026-02-12 09:30',
    },
    {
      consultation_id: 2,
      customer_id: 102,
      agent_id: 'AGT00001',
      customer_name: '박미정',
      customer_phone: '010-9876-5432',
      consultation_type: '청구문의',
      content: '지난달 교통사고로 입원했는데 보험금 청구 절차가 어떻게 되는지 알려주세요. 필요한 서류도 안내 부탁드립니다.',
      status: 'pending',
      requested_at: '2026-02-11 14:20',
    },
    {
      consultation_id: 3,
      customer_id: 103,
      agent_id: 'AGT00001',
      customer_name: '이정훈',
      customer_phone: '010-5555-1234',
      consultation_type: '계약변경',
      content: '현재 보험 계약의 수익자를 변경하고 싶습니다. 배우자에서 자녀로 변경하려면 어떤 절차가 필요한가요?',
      status: 'in_progress',
      response: '수익자 변경은 계약 변경 신청서와 신분증 사본이 필요합니다. 내일 방문 상담으로 처리 예정입니다.',
      requested_at: '2026-02-10 11:00',
    },
    {
      consultation_id: 4,
      customer_id: 104,
      agent_id: 'AGT00001',
      customer_name: '최수진',
      customer_phone: '010-7777-8888',
      consultation_type: '보험상담',
      content: '자녀 보험 가입을 검토 중입니다. 0세부터 가입 가능한 어린이 보험 상품 추천 부탁드립니다.',
      status: 'in_progress',
      requested_at: '2026-02-09 16:45',
    },
    {
      consultation_id: 5,
      customer_id: 105,
      agent_id: 'AGT00001',
      customer_name: '정대한',
      customer_phone: '010-3333-4444',
      consultation_type: '청구문의',
      content: '입원비 청구 후 언제쯤 보험금이 지급되나요? 2주 전에 서류를 제출했는데 아직 연락이 없습니다.',
      status: 'completed',
      response: '확인 결과 서류 심사가 완료되어 3영업일 내 지급 예정입니다. 지급 완료 시 문자로 안내드리겠습니다.',
      requested_at: '2026-01-28 10:15',
      responded_at: '2026-01-28 15:30',
    },
    {
      consultation_id: 6,
      customer_id: 106,
      agent_id: 'AGT00001',
      customer_name: '한소영',
      customer_phone: '010-6666-9999',
      consultation_type: '계약변경',
      content: '보험료 납부 방법을 카드에서 계좌이체로 변경하고 싶습니다.',
      status: 'completed',
      response: '납부 방법 변경 완료되었습니다. 다음 달부터 등록하신 계좌에서 자동이체됩니다.',
      requested_at: '2026-01-25 13:00',
      responded_at: '2026-01-25 14:10',
    },
    {
      consultation_id: 7,
      customer_id: 107,
      agent_id: 'AGT00001',
      customer_name: '윤재호',
      customer_phone: '010-2222-3333',
      consultation_type: '보험상담',
      content: '운전자보험 가입을 고려 중인데, 현재 가입 중인 자동차보험과 중복되는 부분이 있는지 확인 부탁드립니다.',
      status: 'pending',
      requested_at: '2026-02-12 08:00',
    },
  ])

  const filteredConsultations = computed(() => {
    if (filterStatus.value === 'all') {
      return consultations.value
    }
    return consultations.value.filter((c) => c.status === filterStatus.value)
  })

  const statusCounts = computed(() => ({
    all: consultations.value.length,
    pending: consultations.value.filter((c) => c.status === 'pending').length,
    in_progress: consultations.value.filter((c) => c.status === 'in_progress').length,
    completed: consultations.value.filter((c) => c.status === 'completed').length,
  }))

  function respondToConsultation(id: number, response: string): void {
    const consultation = consultations.value.find((c) => c.consultation_id === id)
    if (!consultation) return

    consultation.response = response
    consultation.status = 'completed'
    consultation.responded_at = new Date().toISOString().slice(0, 16).replace('T', ' ')
  }

  function setFilter(status: 'all' | 'pending' | 'in_progress' | 'completed'): void {
    filterStatus.value = status
  }

  return {
    consultations,
    filterStatus,
    filteredConsultations,
    statusCounts,
    respondToConsultation,
    setFilter,
  }
})
