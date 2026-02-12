import axios from 'axios'
import type { AxiosInstance, InternalAxiosRequestConfig, AxiosResponse } from 'axios'

// API 인스턴스 생성
const api: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // withCredentials is not needed for Bearer token authentication
})

// Request Interceptor
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // 토큰이 있으면 헤더에 추가 (admin → agent → user 순서로 확인)
    const token = localStorage.getItem('adminToken') || localStorage.getItem('agentToken') || localStorage.getItem('userToken')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // FormData 전송 시 Content-Type 헤더 제거 (axios가 자동으로 boundary 포함하여 설정)
    if (config.data instanceof FormData && config.headers) {
      delete config.headers['Content-Type']
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response Interceptor
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    // 401 에러 처리 (인증 만료)
    if (error.response?.status === 401) {
      // 현재 URL에 따라 적절한 토큰 제거
      if (window.location.pathname.includes('admin')) {
        localStorage.removeItem('adminToken')
        localStorage.removeItem('adminIsLoggedIn')
      } else if (window.location.pathname.includes('agent')) {
        localStorage.removeItem('agentToken')
      } else {
        localStorage.removeItem('userToken')
        localStorage.removeItem('userIsLoggedIn')
      }
    }
    return Promise.reject(error)
  }
)

export default api
