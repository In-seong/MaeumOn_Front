import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/authStore'
import SeniorHomeView from '../views/SeniorHomeView.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    // ========== 인증 ==========
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/account/RegisterView.vue'),
      meta: { guest: true },
    },

    // ========== 사용자 앱 ==========
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
    {
      path: '/reservation-select',
      name: 'reservation-select',
      component: () => import('../views/ReservationSelectView.vue'),
    },
    {
      path: '/benefits',
      name: 'benefits',
      component: () => import('../views/BenefitsView.vue'),
    },
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
    {
      path: '/my-reservations',
      name: 'my-reservations',
      component: () => import('../views/MyReservationsView.vue'),
    },
    {
      path: '/claim-form',
      name: 'claim-form-standalone',
      component: () => import('../views/ClaimFormStandaloneView.vue'),
    },
  ],
})

// 인증 가드: 비로그인 시 /login으로 리다이렉트
router.beforeEach((to) => {
  const authStore = useAuthStore()

  if (to.meta.guest) {
    if (authStore.isLoggedIn) return { name: 'home' }
    return true
  }

  if (!authStore.isLoggedIn) {
    return { name: 'login' }
  }

  return true
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
