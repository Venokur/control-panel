import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { useToast } from '@/composable/vToast';

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
        path: 'analytics',
        name: 'analytics',
        component: () => import('@/views/Analytics.vue'),
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
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/views/Settings.vue'),
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

// Проверка meta-флагов рекурсивно по цепочке записей маршрута (включая родительские)
const hasRouteMeta = (to, flag) => to.matched.some((record) => record.meta[flag]);

// Показываем toast об ошибке авторизации после неудачной проверки токена
const notifyAuthError = () => {
  const toast = useToast();
  toast.add({
    title: 'Ошибка авторизации',
    message: 'Не удалось проверить авторизацию. Пожалуйста, войдите снова.',
    position: 'bottom-left',
    duration: 4000,
  });
};

router.beforeEach(async (to) => {
  const authStore = useAuthStore();

  const requiresAuth = hasRouteMeta(to, 'requiresAuth');
  const guestOnly = hasRouteMeta(to, 'guestOnly');

  // Если в localStorage есть токен, но он еще не проверялся на сервере
  if (authStore.token && !authStore.isInitialized) {
    try {
      await authStore.checkAuth();
    } catch (error) {
      console.error('Ошибка при проверке авторизации:', error);
      notifyAuthError();
    }
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
