import api from '@shared/api'
import type { ApiResponse, PaginatedResponse } from '@shared/types'

export type ConsultationStatus = 'pending' | 'in_progress' | 'completed'

export type ConsultationType =
  | '보험 상담'
  | '보험금 청구'
  | '병원 예약'
  | '기타 문의'

export interface Consultation {
  consultation_id: number
  customer_id: string
  assignee_id: string | null
  assignee_type: 'AGENT' | 'ADMIN' | null
  consultation_type: string
  consultation_date: string | null
  consultation_content: string
  consultation_answer: string | null
  consultation_status: ConsultationStatus
  customer_name: string | null
  customer_phone: string | null
  created_at: string
  updated_at: string
}

export interface CreateConsultationPayload {
  consultation_type: string
  consultation_content: string
}

const BASE = '/consultations'

export const createConsultation = (data: CreateConsultationPayload) =>
  api.post<ApiResponse<Consultation>>(BASE, data)

export const fetchMyConsultations = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<PaginatedResponse<Consultation>>>(BASE, { params })

export const fetchConsultation = (id: number) =>
  api.get<ApiResponse<Consultation>>(`${BASE}/${id}`)
