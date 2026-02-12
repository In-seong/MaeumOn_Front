import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import type { Customer, Contract, Memo, Consultation } from '../types'

export const useCustomerStore = defineStore('customer', () => {
  // ===== State =====
  const customers = ref<Customer[]>([
    {
      customer_id: 1,
      agent_id: 'AGT00001',
      customer_name: '김영수',
      customer_phone: '010-1234-5678',
      telecom: 'SKT',
      resident_number: '850101-1******',
      address: '서울시 강남구 역삼동 123-45',
      occupation: '회사원',
      acquisition_source: '병원',
      customer_tag: 'VIP',
      last_contact_date: '2026-02-10',
      registered_at: '2025-03-15',
      created_at: '2025-03-15',
      updated_at: '2026-02-10',
    },
    {
      customer_id: 2,
      agent_id: 'AGT00001',
      customer_name: '박미정',
      customer_phone: '010-9876-5432',
      telecom: 'KT',
      resident_number: '900215-2******',
      address: '서울시 서초구 서초대로 200',
      occupation: '자영업',
      acquisition_source: '소개',
      customer_tag: 'VIP',
      last_contact_date: '2026-02-08',
      registered_at: '2024-11-20',
      created_at: '2024-11-20',
      updated_at: '2026-02-08',
    },
    {
      customer_id: 3,
      agent_id: 'AGT00001',
      customer_name: '이정훈',
      customer_phone: '010-5555-1234',
      telecom: 'LG U+',
      resident_number: '780520-1******',
      address: '경기도 성남시 분당구 정자동 45',
      occupation: '공무원',
      acquisition_source: '병원',
      customer_tag: '신규',
      last_contact_date: '2026-02-11',
      registered_at: '2026-01-28',
      created_at: '2026-01-28',
      updated_at: '2026-02-11',
    },
    {
      customer_id: 4,
      agent_id: 'AGT00001',
      customer_name: '최수진',
      customer_phone: '010-3333-7890',
      telecom: 'SKT',
      resident_number: '920830-2******',
      address: '서울시 마포구 상암동 78-9',
      occupation: '프리랜서',
      acquisition_source: '기타',
      customer_tag: '관심',
      last_contact_date: '2026-02-05',
      registered_at: '2025-08-10',
      created_at: '2025-08-10',
      updated_at: '2026-02-05',
    },
    {
      customer_id: 5,
      agent_id: 'AGT00001',
      customer_name: '정민우',
      customer_phone: '010-7777-4321',
      telecom: 'KT',
      resident_number: '880315-1******',
      address: '인천시 남동구 구월동 560',
      occupation: '교사',
      acquisition_source: '소개',
      customer_tag: '일반',
      last_contact_date: '2026-01-20',
      registered_at: '2025-06-05',
      created_at: '2025-06-05',
      updated_at: '2026-01-20',
    },
    {
      customer_id: 6,
      agent_id: 'AGT00001',
      customer_name: '한소희',
      customer_phone: '010-2222-8765',
      telecom: 'LG U+',
      resident_number: '950712-2******',
      address: '서울시 송파구 잠실동 230',
      occupation: '간호사',
      acquisition_source: '병원',
      customer_tag: '신규',
      last_contact_date: '2026-02-12',
      registered_at: '2026-02-01',
      created_at: '2026-02-01',
      updated_at: '2026-02-12',
    },
    {
      customer_id: 7,
      agent_id: 'AGT00001',
      customer_name: '오재현',
      customer_phone: '010-8888-3456',
      telecom: 'SKT',
      resident_number: '810925-1******',
      address: '경기도 수원시 영통구 영통동 100',
      occupation: '엔지니어',
      acquisition_source: '기타',
      customer_tag: '관심',
      last_contact_date: '2026-01-30',
      registered_at: '2025-09-18',
      created_at: '2025-09-18',
      updated_at: '2026-01-30',
    },
    {
      customer_id: 8,
      agent_id: 'AGT00001',
      customer_name: '윤서연',
      customer_phone: '010-4444-6789',
      telecom: 'KT',
      resident_number: '930408-2******',
      address: '서울시 용산구 이태원동 55',
      occupation: '디자이너',
      acquisition_source: '소개',
      customer_tag: '일반',
      last_contact_date: '2026-02-03',
      registered_at: '2025-07-22',
      created_at: '2025-07-22',
      updated_at: '2026-02-03',
    },
    {
      customer_id: 9,
      agent_id: 'AGT00001',
      customer_name: '강태호',
      customer_phone: '010-6666-2345',
      telecom: 'SKT',
      resident_number: '870610-1******',
      address: '대전시 유성구 봉명동 88',
      occupation: '약사',
      acquisition_source: '병원',
      customer_tag: 'VIP',
      last_contact_date: '2026-02-09',
      registered_at: '2024-12-10',
      created_at: '2024-12-10',
      updated_at: '2026-02-09',
    },
    {
      customer_id: 10,
      agent_id: 'AGT00001',
      customer_name: '임지은',
      customer_phone: '010-1111-9876',
      telecom: 'LG U+',
      resident_number: '960120-2******',
      address: '부산시 해운대구 우동 305',
      occupation: '학생',
      acquisition_source: '기타',
      customer_tag: '신규',
      last_contact_date: '2026-02-07',
      registered_at: '2026-01-15',
      created_at: '2026-01-15',
      updated_at: '2026-02-07',
    },
  ])

  const selectedCustomer = ref<Customer | null>(null)
  const searchQuery = ref('')
  const filterTag = ref<string>('전체')
  const sortBy = ref<'name' | 'lastContact' | 'registered'>('name')

  // ===== Mock Contracts =====
  const contracts = ref<Contract[]>([
    {
      contract_id: 1,
      customer_id: 1,
      agent_id: 'AGT00001',
      insurance_company: '삼성생명',
      product_name: '무배당 종합건강보험',
      premium: 85000,
      contract_date: '2025-04-01',
      expiry_date: '2045-04-01',
      status: 'active',
      created_at: '2025-04-01',
    },
    {
      contract_id: 2,
      customer_id: 1,
      agent_id: 'AGT00001',
      insurance_company: '한화생명',
      product_name: '운전자보험 플러스',
      premium: 32000,
      contract_date: '2025-06-15',
      expiry_date: '2035-06-15',
      status: 'active',
      created_at: '2025-06-15',
    },
    {
      contract_id: 3,
      customer_id: 2,
      agent_id: 'AGT00001',
      insurance_company: 'DB손해보험',
      product_name: '다이렉트 자동차보험',
      premium: 120000,
      contract_date: '2025-01-10',
      expiry_date: '2026-01-10',
      status: 'expired',
      created_at: '2025-01-10',
    },
    {
      contract_id: 4,
      customer_id: 2,
      agent_id: 'AGT00001',
      insurance_company: '교보생명',
      product_name: '변액유니버셜종신보험',
      premium: 200000,
      contract_date: '2024-12-01',
      expiry_date: '2054-12-01',
      status: 'active',
      created_at: '2024-12-01',
    },
    {
      contract_id: 5,
      customer_id: 3,
      agent_id: 'AGT00001',
      insurance_company: '메리츠화재',
      product_name: '실손의료보험',
      premium: 45000,
      contract_date: '2026-02-01',
      expiry_date: '2041-02-01',
      status: 'active',
      created_at: '2026-02-01',
    },
    {
      contract_id: 6,
      customer_id: 4,
      agent_id: 'AGT00001',
      insurance_company: '현대해상',
      product_name: '굿앤굿 어린이보험',
      premium: 55000,
      contract_date: '2025-09-01',
      expiry_date: '2045-09-01',
      status: 'active',
      created_at: '2025-09-01',
    },
    {
      contract_id: 7,
      customer_id: 9,
      agent_id: 'AGT00001',
      insurance_company: '삼성화재',
      product_name: '착한운전자보험',
      premium: 28000,
      contract_date: '2025-01-15',
      expiry_date: '2035-01-15',
      status: 'active',
      created_at: '2025-01-15',
    },
    {
      contract_id: 8,
      customer_id: 9,
      agent_id: 'AGT00001',
      insurance_company: '흥국생명',
      product_name: '종합건강보험',
      premium: 95000,
      contract_date: '2025-02-20',
      expiry_date: '2050-02-20',
      status: 'active',
      created_at: '2025-02-20',
    },
    {
      contract_id: 9,
      customer_id: 9,
      agent_id: 'AGT00001',
      insurance_company: '한화손해보험',
      product_name: '무배당 암보험',
      premium: 42000,
      contract_date: '2025-03-10',
      expiry_date: '2045-03-10',
      status: 'active',
      created_at: '2025-03-10',
    },
  ])

  // ===== Mock Memos =====
  const memos = ref<Memo[]>([
    {
      memo_id: 1,
      customer_id: 1,
      agent_id: 'AGT00001',
      content: '종합건강보험 가입 상담 완료. 추가 담보 검토 요청함.',
      memo_date: '2026-02-10',
      created_at: '2026-02-10',
    },
    {
      memo_id: 2,
      customer_id: 1,
      agent_id: 'AGT00001',
      content: '운전자보험 만기 안내 예정. 갱신 의향 확인 필요.',
      memo_date: '2026-01-25',
      created_at: '2026-01-25',
    },
    {
      memo_id: 3,
      customer_id: 2,
      agent_id: 'AGT00001',
      content: '자동차보험 만기. 타사 비교견적 요청.',
      memo_date: '2026-02-08',
      created_at: '2026-02-08',
    },
    {
      memo_id: 4,
      customer_id: 3,
      agent_id: 'AGT00001',
      content: '신규 고객. 실손보험 가입 완료. 추가 보장 상담 예정.',
      memo_date: '2026-02-11',
      created_at: '2026-02-11',
    },
    {
      memo_id: 5,
      customer_id: 4,
      agent_id: 'AGT00001',
      content: '어린이보험 관련 추가 문의 예정. 둘째 출산 예정.',
      memo_date: '2026-02-05',
      created_at: '2026-02-05',
    },
    {
      memo_id: 6,
      customer_id: 9,
      agent_id: 'AGT00001',
      content: 'VIP 고객. 연말 감사 선물 발송 완료.',
      memo_date: '2025-12-20',
      created_at: '2025-12-20',
    },
    {
      memo_id: 7,
      customer_id: 9,
      agent_id: 'AGT00001',
      content: '암보험 추가 가입 상담. 가족력 있어 관심 높음.',
      memo_date: '2026-02-09',
      created_at: '2026-02-09',
    },
  ])

  // ===== Mock Consultations =====
  const consultations = ref<Consultation[]>([
    {
      consultation_id: 1,
      customer_id: 1,
      agent_id: 'AGT00001',
      customer_name: '김영수',
      customer_phone: '010-1234-5678',
      consultation_type: '보험 상담',
      content: '종합건강보험 특약 추가 문의',
      status: 'completed',
      response: '3대 질병 특약 추가 안내 완료',
      requested_at: '2026-02-08',
      responded_at: '2026-02-08',
    },
    {
      consultation_id: 2,
      customer_id: 1,
      agent_id: 'AGT00001',
      customer_name: '김영수',
      customer_phone: '010-1234-5678',
      consultation_type: '보험금 청구',
      content: '입원비 청구 관련 서류 문의',
      status: 'completed',
      response: '필요 서류 목록 안내 및 접수 도움 완료',
      requested_at: '2026-01-15',
      responded_at: '2026-01-15',
    },
    {
      consultation_id: 3,
      customer_id: 2,
      agent_id: 'AGT00001',
      customer_name: '박미정',
      customer_phone: '010-9876-5432',
      consultation_type: '계약 변경',
      content: '자동차보험 갱신 및 비교견적 요청',
      status: 'in_progress',
      requested_at: '2026-02-08',
    },
    {
      consultation_id: 4,
      customer_id: 3,
      agent_id: 'AGT00001',
      customer_name: '이정훈',
      customer_phone: '010-5555-1234',
      consultation_type: '신규 가입',
      content: '실손보험 및 종합보험 가입 상담 요청',
      status: 'completed',
      response: '실손보험 가입 완료. 종합보험은 추가 상담 예정.',
      requested_at: '2026-01-28',
      responded_at: '2026-02-01',
    },
    {
      consultation_id: 5,
      customer_id: 4,
      agent_id: 'AGT00001',
      customer_name: '최수진',
      customer_phone: '010-3333-7890',
      consultation_type: '보험 상담',
      content: '태아보험 상품 비교 요청',
      status: 'pending',
      requested_at: '2026-02-05',
    },
    {
      consultation_id: 6,
      customer_id: 9,
      agent_id: 'AGT00001',
      customer_name: '강태호',
      customer_phone: '010-6666-2345',
      consultation_type: '보험 상담',
      content: '암보험 추가 가입 관련 상담',
      status: 'completed',
      response: '가족력 기반 추천 상품 3종 안내 완료. 검토 후 연락 예정.',
      requested_at: '2026-02-09',
      responded_at: '2026-02-09',
    },
  ])

  // ===== Computed =====
  const filteredCustomers = computed(() => {
    let result = [...customers.value]

    // Filter by tag
    if (filterTag.value !== '전체') {
      result = result.filter((c) => c.customer_tag === filterTag.value)
    }

    // Filter by search query (name or phone)
    if (searchQuery.value.trim()) {
      const query = searchQuery.value.trim().toLowerCase()
      result = result.filter(
        (c) =>
          c.customer_name.toLowerCase().includes(query) ||
          c.customer_phone.replace(/-/g, '').includes(query.replace(/-/g, ''))
      )
    }

    // Sort
    if (sortBy.value === 'name') {
      result.sort((a, b) => a.customer_name.localeCompare(b.customer_name, 'ko'))
    } else if (sortBy.value === 'lastContact') {
      result.sort((a, b) => {
        const dateA = a.last_contact_date ?? '0000-00-00'
        const dateB = b.last_contact_date ?? '0000-00-00'
        return dateB.localeCompare(dateA)
      })
    } else if (sortBy.value === 'registered') {
      result.sort((a, b) => b.registered_at.localeCompare(a.registered_at))
    }

    return result
  })

  // ===== Actions =====
  function fetchCustomers(): void {
    // Mock: data is already loaded in the ref
    // In production, this would call the API
  }

  function fetchCustomer(id: number): Customer | undefined {
    const customer = customers.value.find((c) => c.customer_id === id)
    if (customer) {
      selectedCustomer.value = customer
    }
    return customer
  }

  function addCustomer(data: Omit<Customer, 'customer_id' | 'created_at' | 'updated_at'>): Customer {
    const now = new Date().toISOString().slice(0, 10)
    const newId = Math.max(...customers.value.map((c) => c.customer_id), 0) + 1
    const newCustomer: Customer = {
      ...data,
      customer_id: newId,
      created_at: now,
      updated_at: now,
    }
    customers.value.unshift(newCustomer)
    return newCustomer
  }

  function updateCustomer(id: number, data: Partial<Customer>): Customer | undefined {
    const index = customers.value.findIndex((c) => c.customer_id === id)
    if (index === -1) return undefined

    const existing = customers.value[index]
    if (!existing) return undefined

    const now = new Date().toISOString().slice(0, 10)
    const updated: Customer = {
      ...existing,
      ...data,
      updated_at: now,
    }
    customers.value[index] = updated
    if (selectedCustomer.value?.customer_id === id) {
      selectedCustomer.value = updated
    }
    return updated
  }

  function getContractsByCustomer(customerId: number): Contract[] {
    return contracts.value.filter((c) => c.customer_id === customerId)
  }

  function getMemosByCustomer(customerId: number): Memo[] {
    return memos.value
      .filter((m) => m.customer_id === customerId)
      .sort((a, b) => b.memo_date.localeCompare(a.memo_date))
  }

  function addMemo(customerId: number, content: string, memoDate: string): Memo {
    const now = new Date().toISOString().slice(0, 10)
    const newId = Math.max(...memos.value.map((m) => m.memo_id), 0) + 1
    const newMemo: Memo = {
      memo_id: newId,
      customer_id: customerId,
      agent_id: 'AGT00001',
      content,
      memo_date: memoDate,
      created_at: now,
    }
    memos.value.unshift(newMemo)
    return newMemo
  }

  function getConsultationsByCustomer(customerId: number): Consultation[] {
    return consultations.value
      .filter((c) => c.customer_id === customerId)
      .sort((a, b) => b.requested_at.localeCompare(a.requested_at))
  }

  function getContractCount(customerId: number): number {
    return contracts.value.filter((c) => c.customer_id === customerId && c.status === 'active').length
  }

  return {
    // State
    customers,
    selectedCustomer,
    searchQuery,
    filterTag,
    sortBy,
    contracts,
    memos,
    consultations,

    // Computed
    filteredCustomers,

    // Actions
    fetchCustomers,
    fetchCustomer,
    addCustomer,
    updateCustomer,
    getContractsByCustomer,
    getMemosByCustomer,
    addMemo,
    getConsultationsByCustomer,
    getContractCount,
  }
})
