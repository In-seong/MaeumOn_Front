import { createRouter, createWebHistory } from 'vue-router'
import SeniorHomeView from '../views/SeniorHomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ========== 새 사용자 앱 (시니어 친화, 로그인 불필요) ==========
    {
      path: '/',
      name: 'home',
      component: SeniorHomeView,
    },
    {
      path: '/claim-request',
      name: 'claim-request',
      component: () => import('../views/ClaimRequestView.vue'),
    },
    // 병원 예약
    {
      path: '/hospitals',
      name: 'hospital-list',
      component: () => import('../views/hospital/HospitalListNewView.vue'),
    },
    {
      path: '/hospitals/:id',
      name: 'hospital-detail',
      component: () => import('../views/hospital/HospitalDetailNewView.vue'),
    },
    // 건강검진 센터
    {
      path: '/health-centers',
      name: 'health-center-list',
      component: () => import('../views/healthcenter/HealthCenterListView.vue'),
    },
    {
      path: '/health-centers/:id',
      name: 'health-center-detail',
      component: () => import('../views/healthcenter/HealthCenterDetailView.vue'),
    },

    // ========== 기존 라우트 (비활성화 — 코드 유지, 라우트에서만 제외) ==========
    // 기존 홈, 로그인, PIN, 청구, 보험, 건강, 마이페이지 등
    // 기존 views/ 파일은 삭제하지 않고 유지
  ],
})

// 배포 후 stale chunk 처리: 동적 import 실패 시 자동 새로고침 (무한루프 방지)
router.onError((err) => {
  const msg = (err as Error)?.message ?? ''
  const isChunkLoadError =
    msg.includes('Failed to fetch dynamically imported module') ||
    msg.includes('Importing a module script failed') ||
    msg.includes('Failed to load module script') ||
    msg.includes('error loading dynamically imported module')

  if (!isChunkLoadError) return

  const RELOAD_KEY = '__chunk_reload__'
  if (sessionStorage.getItem(RELOAD_KEY)) {
    sessionStorage.removeItem(RELOAD_KEY)
    return
  }
  sessionStorage.setItem(RELOAD_KEY, '1')
  window.location.reload()
})

export default router
