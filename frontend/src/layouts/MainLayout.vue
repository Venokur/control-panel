<template>
  <div class="app-layout">
    <!-- Header -->
    <header class="header">
      <!-- Полноэкранный поиск для мобильных устройств -->
      <div v-if="isMobileSearchOpen" class="mobile-search-bar">
        <IconSearch :size="18" class="search-icon" />
        <input ref="mobileSearchInput" type="text" placeholder="Поиск по системе..." />
        <button class="icon-btn" @click="isMobileSearchOpen = false" aria-label="Close search">
          <IconClose :size="18" />
        </button>
      </div>

      <!-- Стандартная шапка -->
      <template v-else>
        <div class="header-left">
          <button class="icon-btn toggle-btn" @click="toggleSidebar" aria-label="Toggle Sidebar">
            <IconMenu v-if="!isSidebarOpen" :size="20" />
            <IconClose v-else :size="20" />
          </button>
          <div class="logo">
            <IconLogoVue :size="24" />
            <span class="logo-text">VueApp</span>
          </div>
        </div>

        <!-- Поиск: на десктопе инпут, на мобильных — иконка по центру -->
        <div class="header-search">
          <button v-if="isMobile" class="icon-btn search-toggle-mobile" @click="openMobileSearch" aria-label="Search">
            <IconSearch :size="20" />
          </button>
          <div class="search-input-wrapper">
            <IconSearch :size="18" class="search-icon" />
            <input type="text" placeholder="Поиск по системе..." />
          </div>
        </div>

        <div class="header-right">
          <button class="icon-btn badge-container" aria-label="Notifications">
            <IconBell :size="20" />
            <span class="badge"></span>
          </button>
          <div class="user-profile">
            <div class="avatar">АВ</div>
            <div class="user-info hide-on-mobile">
              <span class="user-name">Алексей В.</span>
              <span class="user-role">Administrator</span>
            </div>
          </div>
        </div>
      </template>
    </header>

    <div class="main-body">
      <!-- Затемнение фона -->
      <Transition name="fade">
        <div v-if="isSidebarOpen && isMobile" class="sidebar-backdrop" @click="closeSidebarMobile"></div>
      </Transition>

      <!-- Sidebar -->
      <aside
        class="sidebar"
        :class="{
          open: isSidebarOpen,
          collapsed: !isSidebarOpen && !isMobile,
        }"
      >
        <div class="sidebar-header-mobile">
          <span class="sidebar-title">Навигация</span>
          <button class="icon-btn" @click="closeSidebarMobile">
            <IconClose :size="18" />
          </button>
        </div>

        <nav class="nav-list">
          <router-link
            v-for="item in navItems"
            :key="item.id"
            :to="item.path"
            class="nav-link"
            exact-active-class="active"
            @click="closeSidebarMobile"
          >
            <component :is="item.icon" class="nav-icon" />
            <span class="nav-text">{{ item.label }}</span>
          </router-link>
        </nav>
      </aside>

      <!-- Content Area -->
      <main class="content-area">
        <div class="content-wrapper">
          <router-view />
        </div>
      </main>
    </div>

    <!-- Глобальные уведомления -->
    <Toast />
  </div>
</template>

<script setup>
import { ref, nextTick, onMounted, onUnmounted } from "vue";
import {
  IconHome,
  IconAnalytics,
  IconProjects,
  IconSettings,
  IconMenu,
  IconClose,
  IconLogoVue,
  IconSearch,
  IconBell,
  IconTable,
} from "../components/icons/icons";
import Toast from "@/components/Toast.vue";

// Синхронная первичная проверка типа устройства
const checkIsMobile = () => typeof window !== "undefined" && window.innerWidth <= 768;

const isMobile = ref(checkIsMobile());
const isSidebarOpen = ref(!isMobile.value);

const isMobileSearchOpen = ref(false);
const mobileSearchInput = ref(null);

let resizeObserver = null;

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const closeSidebarMobile = () => {
  if (isMobile.value) {
    isSidebarOpen.value = false;
  }
};

const openMobileSearch = () => {
  isMobileSearchOpen.value = true;
  nextTick(() => {
    mobileSearchInput.value?.focus();
  });
};

onMounted(() => {
  // Инициализируем ResizeObserver для отслеживания ширины body
  resizeObserver = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const currentWidth = entry.contentRect.width;
      const mobileState = currentWidth <= 768;

      // Переключаем состояние только при реальном переходе порога 768px
      if (mobileState !== isMobile.value) {
        isMobile.value = mobileState;
        isSidebarOpen.value = !mobileState;
      }

      if (!mobileState) {
        isMobileSearchOpen.value = false;
      }
    }
  });

  // Начинаем наблюдение за контейнером body
  resizeObserver.observe(document.body);
});

onUnmounted(() => {
  // Отключаем наблюдатель для предотвращения утечек памяти
  if (resizeObserver) {
    resizeObserver.disconnect();
  }
});

const navItems = ref([
  { id: 1, label: "Главная", icon: IconHome, path: "/" },
  { id: 2, label: "Аналитика", icon: IconAnalytics, path: "/analytics" },
  { id: 3, label: "Таблица", icon: IconTable, path: "/table" },
  { id: 4, label: "Проекты", icon: IconProjects, path: "/project" },
  { id: 5, label: "Настройки", icon: IconSettings, path: "/settings" },
]);
</script>

<style scoped>
.app-layout {
  height: 100dvh;
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  color: #0f172a;
  overflow: hidden; /* Запрещаем скролл для всего окна */
}

.header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  position: sticky;
  top: 0;
  z-index: 40;
  gap: 12px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 18px;
}

.header-search {
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 1;
  max-width: 320px;
  margin: 0 12px;
}

.search-input-wrapper {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
}

.search-icon {
  position: absolute;
  left: 12px;
  color: #94a3b8;
  pointer-events: none;
}

.search-input-wrapper input {
  width: 100%;
  padding: 8px 16px 8px 38px;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.2s;
}

.search-input-wrapper input:focus {
  outline: none;
  background: #ffffff;
  border-color: #10b981;
}

.search-toggle-mobile {
  display: none;
}

.mobile-search-bar {
  display: flex;
  align-items: center;
  width: 100%;
  gap: 10px;
  position: relative;
}

.mobile-search-bar input {
  flex: 1;
  padding: 8px 12px 8px 36px;
  background-color: #f1f5f9;
  border: 1px solid transparent;
  border-radius: 8px;
  font-size: 14px;
}

.mobile-search-bar input:focus {
  outline: none;
  background: #ffffff;
  border-color: #10b981;
}

.mobile-search-bar .search-icon {
  left: 10px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: #10b981;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
}

.user-info {
  display: flex;
  flex-direction: column;
}

.user-name {
  font-size: 14px;
  font-weight: 600;
}

.user-role {
  font-size: 12px;
  color: #64748b;
}

.main-body {
  display: flex;
  flex: 1;
  position: relative;
  overflow: hidden; /* Фиксирует высоту под шапкой */
}

.sidebar {
  width: 240px;
  background: #ffffff;
  border-right: 1px solid #e2e8f0;
  padding: 20px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-y: auto; /* Добавляем внутренний скролл, если меню станет длинным */
  white-space: nowrap;
  flex-shrink: 0;
  height: 100%; /* Занимает всю доступную высоту main-body */
}

.sidebar.collapsed {
  width: 72px;
}

.sidebar-header-mobile {
  display: none;
}

.nav-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.nav-link {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  color: #64748b;
  text-decoration: none;
  font-size: 14px;
  font-weight: 500;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.nav-icon {
  min-width: 20px;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.nav-text {
  opacity: 1;
  transition: opacity 0.2s ease-in-out;
}

.sidebar.collapsed .nav-text {
  opacity: 0;
  pointer-events: none;
}

.nav-link:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.nav-link.active {
  background-color: #ecfdf5;
  color: #10b981;
}

.content-area {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow-y: auto; /* Скролл здесь, у правого края окна */
}

.content-wrapper {
  max-width: 1400px;
  margin: 0 auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  width: 100%;
  flex: 1;
}

.icon-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-btn:hover {
  background: #f1f5f9;
  color: #0f172a;
}

.badge-container {
  position: relative;
}

.badge {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 8px;
  height: 8px;
  background: #ef4444;
  border-radius: 50%;
}

.sidebar-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.4);
  backdrop-filter: blur(4px);
  z-index: 25;
}

/* МОБИЛЬНАЯ АДАПТИВНОСТЬ (экраны <= 768px) */
@media (max-width: 768px) {
  .content-wrapper {
    padding: 16px;
  }

  .header {
    padding: 0 16px;
  }

  .logo-text,
  .hide-on-mobile {
    display: none;
  }

  .header-left {
    gap: 12px;
  }

  .header-search {
    max-width: none;
    margin: 0;
  }

  .search-input-wrapper {
    display: none;
  }

  .search-toggle-mobile {
    display: flex;
  }

  .content-area {
    padding: 16px;
  }

  .sidebar {
    position: fixed;
    top: 64px;
    left: 0;
    bottom: 0;
    width: 280px !important;
    z-index: 30;
    transform: translateX(-100%);
    box-shadow: none; /* Убираем тень в закрытом состоянии */
    transition:
      transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
      box-shadow 0.3s ease;
    border-right: 1px solid #e2e8f0;
    border-top: 1px solid #f1f5f9;
  }

  .sidebar.open {
    transform: translateX(0);
    box-shadow: 10px 0 30px rgba(0, 0, 0, 0.1); /* Включаем тень только при открытии */
  }

  .sidebar-header-mobile {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding-bottom: 12px;
    margin-bottom: 12px;
    border-bottom: 1px solid #f1f5f9;
  }

  .sidebar-title {
    font-size: 12px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    color: #94a3b8;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
