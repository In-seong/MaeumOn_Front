import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

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
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
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
      path: '/claims/:id',
      name: 'claim-detail',
      component: () => import('../views/claims/ClaimDetailView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 인증 가드
router.beforeEach((to, from, next) => {
  const isLoggedIn = localStorage.getItem('userIsLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
  } else if ((to.name === 'login' || to.name === 'register') && isLoggedIn) {
    next({ name: 'home' })
  } else {
    next()
  }
})

export default router
