import { createRouter, createWebHistory } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/components/composable/vToast";

const routes = [
  // Публичные маршруты (без шапки и сайдбара)
  {
    path: "/auth",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "login",
        name: "login",
        component: () => import("@/views/Login.vue"),
      },
    ],
  },

  // Защищенные маршруты (с шапкой и сайдбаром)
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "main",
        component: () => import("@/views/Main.vue"),
      },
      {
        path: "project",
        name: "project",
        component: () => import("@/views/Project.vue"),
      },
      {
        path: "table",
        name: "table",
        component: () => import("@/views/Table.vue"),
      },
    ],
  },

  // Страница 404 (выводится в AuthLayout без панелей управления)
  {
    path: "/:pathMatch(.*)*",
    component: () => import("@/layouts/AuthLayout.vue"),
    children: [
      {
        path: "",
        name: "notFound",
        component: () => import("@/views/NotFound.vue"),
      },
    ],
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach(async (to) => {
  const authStore = useAuthStore();
  const toast = useToast();

  // Проверка рекурсивно по meta.requiresAuth (включая родительские маршруты)
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth);

  if (requiresAuth && !authStore.isAuthenticated) {
    return { name: "login" };
  }

  if (to.name === "login" && authStore.isAuthenticated) {
    return { name: "main" };
  }

  if (requiresAuth && authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.login({
        email: "admin@example.com",
        password: "123456",
      });
    } catch (error) {
      toast.add({
        title: "Ошибка",
        message: error?.message || error,
        position: "bottom-left",
        duration: 4000,
      });
      console.error("Ошибка:", error);
      authStore.logout();
      return { name: "login" };
    }
  }
});

export default router;
