import api from '@shared/api'
import type { ApiResponse } from '@shared/types'

// ========== 타입 정의 ==========

export interface HospitalImage {
  image_id: number
  image_url: string | null
  sort_order: number
}

export interface PartnerHospital {
  hospital_id: number
  hospital_name: string
  business_number?: string
  address: string
  detailed_address?: string
  contact_phone?: string
  latitude?: number
  longitude?: number
  business_hours?: string
  introduction?: string
  specialties?: string
  image_url?: string | null
  thumbnail_url?: string | null
  images?: HospitalImage[]
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface HealthCenterItem {
  center_id: number
  center_name: string
  address: string
  detailed_address?: string
  latitude?: number
  longitude?: number
  contact_phone?: string
  business_hours?: string
  introduction?: string
  thumbnail_url?: string | null
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface TimeSlotItem {
  time: string
  available: boolean
}

export interface ReservationRequest {
  hospital_id?: number
  center_id?: number
  reservation_type: 'hospital' | 'health_center'
  patient_name: string
  patient_phone: string
  reservation_date: string
  reservation_time: string
  memo?: string
}

export interface HospitalReservation {
  reservation_id: number
  hospital_id?: number
  center_id?: number
  reservation_type: 'hospital' | 'health_center'
  patient_name: string
  patient_phone: string
  reservation_date: string
  reservation_time: string
  memo?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  created_at?: string
  updated_at?: string
}

export interface MyReservation extends HospitalReservation {
  hospital?: { hospital_id: number; hospital_name: string; address: string; contact_phone?: string } | null
  health_center?: { center_id: number; center_name: string; address: string; contact_phone?: string } | null
}

export interface ClaimRequestItem {
  request_id: number
  name: string
  phone: string
  memo?: string
  status: 'pending' | 'assigned' | 'completed' | 'cancelled'
  assigned_agent_id?: string
  linked_claim_id?: number
  files?: ClaimRequestFile[]
  created_at?: string
  updated_at?: string
}

export interface ClaimRequestFile {
  file_id: number
  request_id: number
  file_url: string
  file_name?: string
  file_size?: number
  file_download_url?: string
}

// ========== API 함수 ==========

const BASE = '/public'

// 간편 청구 신청
export const submitClaimRequest = (data: FormData) =>
  api.post<ApiResponse<ClaimRequestItem>>(`${BASE}/claim-requests`, data)

// 병원 목록
export const fetchHospitals = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<PartnerHospital[]>>(`${BASE}/hospitals`, { params })

// 병원 상세
export const fetchHospital = (id: number) =>
  api.get<ApiResponse<PartnerHospital>>(`${BASE}/hospitals/${id}`)

// 병원 예약 가능 시간
export const fetchHospitalSlots = (id: number, date: string) =>
  api.get<ApiResponse<TimeSlotItem[]>>(`${BASE}/hospitals/${id}/slots`, { params: { date } })

// 건강검진 센터 목록
export const fetchHealthCenters = (params?: Record<string, unknown>) =>
  api.get<ApiResponse<HealthCenterItem[]>>(`${BASE}/health-centers`, { params })

// 건강검진 센터 상세
export const fetchHealthCenter = (id: number) =>
  api.get<ApiResponse<HealthCenterItem>>(`${BASE}/health-centers/${id}`)

// 건강검진 센터 예약 가능 시간
export const fetchHealthCenterSlots = (id: number, date: string) =>
  api.get<ApiResponse<TimeSlotItem[]>>(`${BASE}/health-centers/${id}/slots`, { params: { date } })

// 예약 신청
export const submitReservation = (data: ReservationRequest) =>
  api.post<ApiResponse<HospitalReservation>>(`${BASE}/reservations`, data)

// 내 예약 조회
export const fetchMyReservations = (phone: string) =>
  api.get<ApiResponse<MyReservation[]>>(`${BASE}/my-reservations`, { params: { phone } })

// 예약 취소
export const cancelReservation = (id: number, phone: string) =>
  api.put<ApiResponse<unknown>>(`${BASE}/reservations/${id}/cancel`, { phone })

// 배너
export interface BannerData {
  banner_id: number
  title: string
  image_url: string | null
  link_url: string | null
  sort_order: number
  is_active: boolean
}

export const fetchBanners = () =>
  api.get<ApiResponse<BannerData[]>>(`${BASE}/banners`)
