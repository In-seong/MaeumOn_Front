import { createRouter, createWebHashHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHashHistory(),
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: DashboardView,
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
    },
    // 고객 관리 (SFR-032~038)
    {
      path: '/customers',
      name: 'customers',
      component: () => import('../views/customers/CustomerListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/create',
      name: 'customer-create',
      component: () => import('../views/customers/CustomerFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/:id',
      name: 'customer-detail',
      component: () => import('../views/customers/CustomerDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/customers/:id/edit',
      name: 'customer-edit',
      component: () => import('../views/customers/CustomerFormView.vue'),
      meta: { requiresAuth: true },
    },
    // 설계사 관리 (SFR-042)
    {
      path: '/agents',
      name: 'agents',
      component: () => import('../views/agents/AgentListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agents/create',
      name: 'agent-create',
      component: () => import('../views/agents/AgentFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agents/:id',
      name: 'agent-detail',
      component: () => import('../views/agents/AgentDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/agents/:id/edit',
      name: 'agent-edit',
      component: () => import('../views/agents/AgentFormView.vue'),
      meta: { requiresAuth: true },
    },
    // DB 배분 (SFR-039)
    {
      path: '/assignments',
      name: 'assignments',
      component: () => import('../views/assignments/AssignmentListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/assignments/create',
      name: 'assignment-create',
      component: () => import('../views/assignments/AssignmentCreateView.vue'),
      meta: { requiresAuth: true },
    },
    // 추가계약 발굴 (SFR-040, 041)
    {
      path: '/additional-contracts',
      name: 'additional-contracts',
      component: () => import('../views/additional-contracts/AdditionalContractListView.vue'),
      meta: { requiresAuth: true },
    },
    // 실적 현황 (SFR-043)
    {
      path: '/performance',
      name: 'performance',
      component: () => import('../views/performance/PerformanceDashboardView.vue'),
      meta: { requiresAuth: true },
    },
    // 공지사항 (SFR-044)
    {
      path: '/notices',
      name: 'notices',
      component: () => import('../views/notices/NoticeListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notices/create',
      name: 'notice-create',
      component: () => import('../views/notices/NoticeFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notices/:id',
      name: 'notice-detail',
      component: () => import('../views/notices/NoticeDetailView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/notices/:id/edit',
      name: 'notice-edit',
      component: () => import('../views/notices/NoticeFormView.vue'),
      meta: { requiresAuth: true },
    },
    // 보험사 관리 (기존)
    {
      path: '/insurance-companies',
      name: 'insurance-companies',
      component: () => import('../views/insurance-companies/InsuranceCompanyListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/insurance-companies/create',
      name: 'insurance-company-create',
      component: () => import('../views/insurance-companies/InsuranceCompanyFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/insurance-companies/:id/edit',
      name: 'insurance-company-edit',
      component: () => import('../views/insurance-companies/InsuranceCompanyFormView.vue'),
      meta: { requiresAuth: true },
    },
    // 양식 템플릿 관리 (기존)
    {
      path: '/templates',
      name: 'templates',
      component: () => import('../views/templates/TemplateListView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/templates/create',
      name: 'template-create',
      component: () => import('../views/templates/TemplateFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/templates/:id/edit',
      name: 'template-edit',
      component: () => import('../views/templates/TemplateFormView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/templates/:id/editor',
      name: 'template-field-editor',
      component: () => import('../views/templates/TemplateFieldEditorView.vue'),
      meta: { requiresAuth: true },
    },
    // 청구 관리 (기존)
    {
      path: '/claims',
      name: 'claims',
      component: () => import('../views/ClaimsView.vue'),
      meta: { requiresAuth: true },
    },
  ],
})

// 인증 가드
router.beforeEach((to, _from, next) => {
  const isLoggedIn = localStorage.getItem('adminIsLoggedIn') === 'true'

  if (to.meta.requiresAuth && !isLoggedIn) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isLoggedIn) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})

export default router
