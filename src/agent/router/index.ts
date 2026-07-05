import { createRouter, createWebHistory } from 'vue-router'
import { isPC } from '../composables/useDeviceMode'

function adaptiveView(
  mobileImport: () => Promise<any>,
  pcImport: () => Promise<any>
) {
  return () => isPC.value ? pcImport() : mobileImport()
}

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'agent-login',
      component: adaptiveView(
        () => import('../views/LoginView.vue'),
        () => import('../views-pc/PcLoginView.vue')
      ),
      meta: { requiresAuth: false },
    },
    {
      path: '/',
      name: 'agent-home',
      component: adaptiveView(
        () => import('../views/HomeView.vue'),
        () => import('../views-pc/PcHomeView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers',
      name: 'customer-list',
      component: adaptiveView(
        () => import('../views/customers/CustomerListView.vue'),
        () => import('../views-pc/customers/PcCustomerListView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/add',
      name: 'customer-add',
      component: adaptiveView(
        () => import('../views/customers/CustomerAddView.vue'),
        () => import('../views-pc/customers/PcCustomerAddView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/:id',
      name: 'customer-detail',
      component: adaptiveView(
        () => import('../views/customers/CustomerDetailView.vue'),
        () => import('../views-pc/customers/PcCustomerDetailView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/consultations',
      name: 'consultation-list',
      component: adaptiveView(
        () => import('../views/consultations/ConsultationListView.vue'),
        () => import('../views-pc/consultations/PcConsultationListView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/new',
      name: 'agent-claim-select',
      component: adaptiveView(
        () => import('../views/claims/AgentClaimSelectView.vue'),
        () => import('../views-pc/claims/PcClaimSelectView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/new/:templateId',
      name: 'agent-claim-form',
      component: adaptiveView(
        () => import('../views/claims/AgentClaimFormView.vue'),
        () => import('../views-pc/claims/PcClaimFormView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/:claimId/edit',
      name: 'agent-claim-edit',
      component: adaptiveView(
        () => import('../views/claims/AgentClaimFormView.vue'),
        () => import('../views-pc/claims/PcClaimFormView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims/:id',
      name: 'agent-claim-detail',
      component: adaptiveView(
        () => import('../views/claims/AgentClaimDetailView.vue'),
        () => import('../views-pc/claims/PcClaimDetailView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/claims',
      name: 'agent-claim-list',
      component: adaptiveView(
        () => import('../views/claims/AgentClaimListView.vue'),
        () => import('../views-pc/claims/PcClaimListView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/batch-claims/new',
      name: 'agent-batch-claim-new',
      component: adaptiveView(
        () => import('../views/claims/AgentBatchClaimView.vue'),
        () => import('../views-pc/claims/PcBatchClaimView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/batch-claims/:batchId/edit',
      name: 'agent-batch-claim-edit',
      component: adaptiveView(
        () => import('../views/claims/AgentBatchClaimView.vue'),
        () => import('../views-pc/claims/PcBatchClaimView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/batch-claims/:id',
      name: 'agent-batch-claim-detail',
      component: adaptiveView(
        () => import('../views/claims/AgentBatchClaimDetailView.vue'),
        () => import('../views-pc/claims/PcBatchClaimDetailView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/messages/send',
      name: 'message-send',
      component: adaptiveView(
        () => import('../views/messages/MessageSendView.vue'),
        () => import('../views-pc/messages/PcMessageSendView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/schedule',
      name: 'schedule',
      component: adaptiveView(
        () => import('../views/schedule/ScheduleView.vue'),
        () => import('../views-pc/schedule/PcScheduleView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/statistics',
      name: 'statistics',
      component: adaptiveView(
        () => import('../views/statistics/StatisticsView.vue'),
        () => import('../views-pc/statistics/PcStatisticsView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/db-distribution',
      name: 'db-distribution',
      component: adaptiveView(
        () => import('../views/db-distribution/DbDistributionView.vue'),
        () => import('../views-pc/db-distribution/PcDbDistributionView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/alert-duty',
      name: 'alert-duty',
      component: adaptiveView(
        () => import('../views/obligations/AlertDutyView.vue'),
        () => import('../views-pc/obligations/PcAlertDutyView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/codef',
      name: 'codef',
      component: adaptiveView(
        () => import('../views/codef/CodefSelectView.vue'),
        () => import('../views-pc/codef/PcCodefSelectView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/codef/customers',
      name: 'codef-customers',
      component: adaptiveView(
        () => import('../views/codef/CodefCustomerListView.vue'),
        () => import('../views-pc/codef/PcCodefCustomerListView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/codef/:customerId',
      name: 'codef-dashboard',
      component: adaptiveView(
        () => import('../views/codef/CodefDashboardView.vue'),
        () => import('../views-pc/codef/PcCodefDashboardView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/notifications',
      name: 'agent-notifications',
      component: adaptiveView(
        () => import('../views/notifications/NotificationsView.vue'),
        () => import('../views-pc/notifications/PcNotificationsView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/mypage',
      name: 'agent-mypage',
      component: adaptiveView(
        () => import('../views/account/AgentMyPageView.vue'),
        () => import('../views-pc/account/PcAgentMyPageView.vue')
      ),
      meta: { requiresAuth: true },
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/',
    },
  ],
})

router.beforeEach((to) => {
  const hasToken = !!localStorage.getItem('agentToken')
  if (to.meta.requiresAuth !== false && !hasToken) {
    return { name: 'agent-login' }
  }
  if (to.name === 'agent-login' && hasToken) {
    return { name: 'agent-home' }
  }
})

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
