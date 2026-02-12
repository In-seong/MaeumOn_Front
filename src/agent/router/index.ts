import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'agent-login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'agent-home',
      component: () => import('../views/HomeView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers',
      name: 'customer-list',
      component: () => import('../views/customers/CustomerListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/add',
      name: 'customer-add',
      component: () => import('../views/customers/CustomerAddView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/:id',
      name: 'customer-detail',
      component: () => import('../views/customers/CustomerDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/consultations',
      name: 'consultation-list',
      component: () => import('../views/consultations/ConsultationListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims',
      name: 'agent-claim-list',
      component: () => import('../views/claims/AgentClaimListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages/send',
      name: 'message-send',
      component: () => import('../views/messages/MessageSendView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: () => import('../views/schedule/ScheduleView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: () => import('../views/statistics/StatisticsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/db-distribution',
      name: 'db-distribution',
      component: () => import('../views/db-distribution/DbDistributionView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/alert-duty',
      name: 'alert-duty',
      component: () => import('../views/obligations/AlertDutyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/satisfaction',
      name: 'satisfaction',
      component: () => import('../views/satisfaction/SatisfactionSurveyView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'agent-notifications',
      component: () => import('../views/notifications/NotificationsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/mypage',
      name: 'agent-mypage',
      component: () => import('../views/account/AgentMyPageView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// Auth guard
router.beforeEach((to) => {
  const hasToken = !!localStorage.getItem('agentToken')
  if (to.meta.requiresAuth !== false && !hasToken) {
    return { name: 'agent-login' }
  }
  if (to.name === 'agent-login' && hasToken) {
    return { name: 'agent-home' }
  }
})

export default router
