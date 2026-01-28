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
    // 보험사 관리
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
    // 양식 템플릿 관리
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
    // 청구 관리
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
