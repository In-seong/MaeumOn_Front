import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import { useAuthStore } from '../stores/authStore'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    {
      path: '/pin-login',
      name: 'pin-login',
      component: () => import('../views/account/PinLoginView.vue'),
      meta: { requiresOtpVerified: true },
    },
    // 청구서 관련 라우트
    {
      path: '/claims',
      name: 'claims',
      component: () => import('../views/claims/ClaimListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/new',
      name: 'claim-select-template',
      component: () => import('../views/claims/ClaimSelectTemplateView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/new/:templateId',
      name: 'claim-form',
      component: () => import('../views/claims/ClaimFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/:claimId/edit',
      name: 'claim-edit',
      component: () => import('../views/claims/ClaimFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/:id',
      name: 'claim-detail',
      component: () => import('../views/claims/ClaimDetailView.vue'),
      meta: { requiresAuth: true },
    },
    // 보험 관련 라우트
    {
      path: '/insurance',
      name: 'insurance-list',
      component: () => import('../views/insurance/InsuranceListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/insurance/:id',
      name: 'insurance-detail',
      component: () => import('../views/insurance/InsuranceDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/coverage-analysis',
      name: 'coverage-analysis',
      component: () => import('../views/insurance/CoverageAnalysisView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/unclaimed',
      name: 'unclaimed',
      component: () => import('../views/insurance/UnclaimedView.vue'),
      meta: { requiresAuth: true },
    },
    // 병원 관련 라우트
    {
      path: '/hospital',
      name: 'hospital-list',
      component: () => import('../views/hospital/HospitalListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/hospital/:id',
      name: 'hospital-detail',
      component: () => import('../views/hospital/HospitalDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/reservation',
      name: 'reservation',
      component: () => import('../views/hospital/ReservationView.vue'),
      meta: { requiresAuth: true },
    },
    // 건강 관련 라우트
    {
      path: '/health-checkup',
      name: 'health-checkup',
      component: () => import('../views/health/HealthCheckupView.vue'),
      meta: { requiresAuth: true },
    },
    // 마이페이지 관련 라우트
    {
      path: '/mypage',
      name: 'mypage',
      component: () => import('../views/account/MyPageView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'notifications',
      component: () => import('../views/account/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/consultation',
      name: 'consultation',
      component: () => import('../views/account/ConsultationView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 인증 가드
router.beforeEach(async (to, _from, next) => {
  const authStore = useAuthStore()
  const isLoggedIn = authStore.isLoggedIn

  if (to.meta.requiresAuth && !isLoggedIn) {
    // 인증 필요한 페이지 → 디바이스 체크 후 적절한 화면으로
    const result = await authStore.checkDevice()
    if (result.registered && result.hasPin) {
      next({ name: 'pin-login' })
    } else {
      next({ name: 'login' })
    }
  } else if (to.meta.requiresOtpVerified && authStore.authStep !== 'otp_verified') {
    // PIN 입력 페이지에 직접 접근 시도 → OTP 인증이 안 된 상태
    next({ name: 'login' })
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
