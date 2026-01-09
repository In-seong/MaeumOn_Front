// 공통 API 응답 타입
export interface ApiResponse<T> {
  success: boolean
  data: T
  message?: string
}

// 페이지네이션 타입
export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  last_page: number
  per_page: number
  total: number
}

// 사용자 타입
export interface User {
  id: number
  name: string
  email: string
  phone?: string
  created_at: string
  updated_at: string
}

// 인증 관련 타입
export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}
