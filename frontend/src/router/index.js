import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const routes = [
  // Публичные маршруты (без шапки и сайдбара)
  {
    path: '/auth',
    component: () => import('@/layouts/AuthLayout.vue'),
    meta: { guestOnly: true },
    children: [
      {
        path: 'login',
        name: 'login',
        component: () => import('@/views/Login.vue'),
      },
    ],
  },

  // Защищенные маршруты (с шапкой и сайдбаром)
  {
    path: '/',
    component: () => import('@/layouts/MainLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'main',
        component: () => import('@/views/Main.vue'),
      },
      {
        path: 'project',
        name: 'project',
        component: () => import('@/views/Project.vue'),
      },
      {
        path: 'table',
        name: 'table',
        component: () => import('@/views/Table.vue'),
      },
    ],
  },

  // Страница 404 (выводится в AuthLayout без панелей управления)
  {
    path: '/:pathMatch(.*)*',
    component: () => import('@/layouts/AuthLayout.vue'),
    children: [
      {
        path: '',
        name: 'notFound',
        component: () => import('@/views/NotFound.vue'),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  // Проверка рекурсивно по meta.requiresAuth (включая родительские маршруты)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);
  const guestOnly = to.matched.some((record) => record.meta.guestOnly);

  // Если в localStorage есть токен, но он еще не проверялся на сервере
  if (authStore.token && !authStore.isInitialized) {
    await authStore.checkAuth();
  }

  // Защищенный маршрут без валидной авторизации
  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login' };
  }

  // Публичный маршрут (например /auth/login) для уже авторизованного пользователя
  if (guestOnly && authStore.isAuthenticated) {
    return { name: 'main' };
  }
});

export default router;
