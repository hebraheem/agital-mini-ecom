import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/components/products/product-list.vue'),
    },
    {
      path: '/products',
      name: 'products',
      component: () => import('@/components/products/all-product.vue'),
    },
    {
      path: '/products/:id',
      name: 'product-details',
      component: () => import('@/components/products/product-details.vue'),
    },
    {
      path: '/products/create',
      name: 'product-create',
      component: () => import('@/components/products/product-form.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/products/:id/edit',
      name: 'product-edit',
      component: () => import('@/components/products/product-form.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/components/auth/login.vue'),
    },
    {
      path: '/signup',
      name: 'signup',
      component: () => import('@/components/auth/sign-up.vue'),
    },
    {
      path: '/:catchAll(.*)*',
      name: 'not-found',
      component: () => import('@/components/not-found.vue'),
    },
  ],
  scrollBehavior() {
    return { top: 0 }
  },
  linkActiveClass: 'text-primary',
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else {
    next()
  }
})

export default router
