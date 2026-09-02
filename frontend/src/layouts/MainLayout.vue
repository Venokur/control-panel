<template>
  <div class="app-layout">
    <!-- Шапка -->
    <header class="header">
      <!-- Полноэкранный поиск для мобильных устройств -->
      <div v-if="isMobileSearchOpen" class="mobile-search-bar">
        <IconSearch :size="18" class="search-icon" />
        <input
          ref="mobileSearchInput"
          v-model="searchQuery"
          type="text"
          placeholder="Поиск по системе..."
          @focus="isSearchOpen = true"
          @blur="isSearchOpen = false"
          @keydown="handleSearchKeydown"
        />
        <button class="icon-btn" @click="closeMobileSearch" aria-label="Закрыть поиск">
          <IconClose :size="18" />
        </button>

        <div v-if="isSearchOpen && searchQuery.trim()" class="search-dropdown search-dropdown--mobile">
          <div
            v-for="(item, index) in searchResults"
            :key="item.id"
            class="search-result"
            :class="{ 'is-active': index === activeIndex }"
            @mousedown.prevent
            @mouseenter="activeIndex = index"
            @click="selectItem(item)"
          >
            <span class="search-result-icon">
              <component :is="item.icon" :size="16" />
            </span>
            <span class="search-result-text">
              <span class="search-result-title">{{ item.title }}</span>
              <span v-if="item.subtitle" class="search-result-subtitle">{{ item.subtitle }}</span>
            </span>
            <span class="search-result-type">{{ item.type }}</span>
          </div>

          <div v-if="searchResults.length === 0" class="search-empty">Ничего не найдено</div>
        </div>
      </div>

      <!-- Стандартная шапка -->
      <template v-else>
        <div class="header-left">
          <button class="icon-btn toggle-btn" @click="toggleSidebar" aria-label="Свернуть/развернуть меню">
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
          <button v-if="isMobile" class="icon-btn search-toggle-mobile" @click="openMobileSearch" aria-label="Поиск">
            <IconSearch :size="20" />
          </button>
          <div class="search-input-wrapper">
            <IconSearch :size="18" class="search-icon" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Поиск по системе..."
              @focus="isSearchOpen = true"
              @blur="isSearchOpen = false"
              @keydown="handleSearchKeydown"
            />

            <div v-if="isSearchOpen && searchQuery.trim()" class="search-dropdown">
              <div
                v-for="(item, index) in searchResults"
                :key="item.id"
                class="search-result"
                :class="{ 'is-active': index === activeIndex }"
                @mousedown.prevent
                @mouseenter="activeIndex = index"
                @click="selectItem(item)"
              >
                <span class="search-result-icon">
                  <component :is="item.icon" :size="16" />
                </span>
                <span class="search-result-text">
                  <span class="search-result-title">{{ item.title }}</span>
                  <span v-if="item.subtitle" class="search-result-subtitle">{{ item.subtitle }}</span>
                </span>
                <span class="search-result-type">{{ item.type }}</span>
              </div>

              <div v-if="searchResults.length === 0" class="search-empty">Ничего не найдено</div>
            </div>
          </div>
        </div>

        <div class="header-right">
          <div class="notifications-area">
            <button
              class="icon-btn badge-container"
              aria-label="Уведомления"
              aria-haspopup="true"
              :aria-expanded="isNotificationsOpen"
              :class="{ 'is-open': isNotificationsOpen }"
              @click="toggleNotifications"
            >
              <IconBell :size="20" />
              <span v-if="unreadCount" class="badge">{{ unreadCount > 99 ? "99+" : unreadCount }}</span>
            </button>

            <Transition name="dropdown">
              <div v-if="isNotificationsOpen" class="notifications-panel" role="menu" aria-label="Уведомления">
                <div class="notifications-head">
                  <span class="notifications-title">Уведомления</span>
                  <button v-if="unreadCount" type="button" class="notifications-link" @click="markAllRead">
                    Отметить все
                  </button>
                </div>

                <div class="notifications-list">
                  <div
                    v-for="item in notifications"
                    :key="item.id"
                    class="notification-row"
                    :class="{ 'is-unread': !item.read }"
                    role="menuitem"
                    @click="markNotificationRead(item)"
                  >
                    <span class="notification-icon" :style="{ background: NOTIFICATION_TYPES[item.type].bg }">
                      <component :is="NOTIFICATION_TYPES[item.type].icon" :size="16" />
                    </span>
                    <span class="notification-content">
                      <span class="notification-title">{{ item.title }}</span>
                      <span class="notification-time">{{ item.time }}</span>
                    </span>
                    <span v-if="!item.read" class="notification-dot"></span>
                  </div>

                  <div v-if="notifications.length === 0" class="notifications-empty">Нет уведомлений</div>
                </div>

                <div class="notifications-foot">
                  <button type="button" class="notifications-link" @click="clearNotifications">Очистить список</button>
                </div>
              </div>
            </Transition>
          </div>

          <div class="user-profile">
            <div class="avatar">{{ userInitials }}</div>
            <div class="user-info hide-on-mobile">
              <span class="user-name">{{ userName }}</span>
              <span class="user-role">Администратор</span>
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

      <!-- Сайдбар -->
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

      <!-- Область контента -->
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
import { ref, computed, watch, nextTick, onMounted, onUnmounted, markRaw } from "vue";
import { useRouter } from "vue-router";
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
  IconUsers,
  IconTrend,
} from "@/components/icons/icons";
import Toast from "@/components/Toast.vue";
import { useAuthStore } from "@/stores/auth";
import { useToast } from "@/composable/vToast";

const authStore = useAuthStore();
const router = useRouter();
const toast = useToast();

// === Имитация уведомлений ===
const NOTIFICATION_TYPES = {
  system: { icon: markRaw(IconBell), bg: "#e0f2fe" },
  project: { icon: markRaw(IconProjects), bg: "#ecfdf5" },
  report: { icon: markRaw(IconAnalytics), bg: "#fff7ed" },
  user: { icon: markRaw(IconUsers), bg: "#f3e8ff" },
};

const notifications = ref([
  { id: 1, type: "project", title: "Проект «Mobile Redesign» обновлён", time: "2 мин назад", read: false },
  { id: 2, type: "user", title: "Новый пользователь Иван Петров", time: "10 мин назад", read: false },
  { id: 3, type: "report", title: "Готов отчёт по выручке за месяц", time: "1 ч назад", read: false },
  { id: 4, type: "system", title: "Плановое обновление системы", time: "3 ч назад", read: true },
  { id: 5, type: "user", title: "Мария Соколова приглашена в команду", time: "вчера", read: true },
]);

const isNotificationsOpen = ref(false);

const unreadCount = computed(() => notifications.value.filter((n) => !n.read).length);

const toggleNotifications = () => {
  isNotificationsOpen.value = !isNotificationsOpen.value;
};

const closeNotifications = () => {
  isNotificationsOpen.value = false;
};

const markNotificationRead = (item) => {
  if (!item.read) {
    item.read = true;
    toast.add({
      title: "Уведомление",
      message: `«${item.title}» отмечено как прочитанное`,
      position: "bottom-left",
      duration: 3000,
    });
  }
};

const markAllRead = () => {
  notifications.value.forEach((n) => (n.read = true));
};

const clearNotifications = () => {
  notifications.value = [];
};

const handleNotificationsClickOutside = (event) => {
  if (isNotificationsOpen.value && !event.target.closest(".notifications-area")) {
    closeNotifications();
  }
};

const handleNotificationsKeydown = (event) => {
  if (isNotificationsOpen.value && event.key === "Escape") {
    closeNotifications();
  }
};

onMounted(() => {
  document.addEventListener("mousedown", handleNotificationsClickOutside);
  document.addEventListener("keydown", handleNotificationsKeydown);
});

onUnmounted(() => {
  document.removeEventListener("mousedown", handleNotificationsClickOutside);
  document.removeEventListener("keydown", handleNotificationsKeydown);
});

// === Имитация поиска по системе ===
// Каталог «всей системы»: страницы меню + демо-записи
const SEARCH_ITEMS = [
  { id: "p1", type: "Страница", title: "Главная", subtitle: "Дашборд с показателями", path: "/", icon: IconHome },
  { id: "p2", type: "Страница", title: "Аналитика", subtitle: "Статистика и отчёты", path: "/analytics", icon: IconAnalytics },
  { id: "p3", type: "Страница", title: "Таблица", subtitle: "Данные пользователей", path: "/table", icon: IconTable },
  { id: "p4", type: "Страница", title: "Проекты", subtitle: "Задачи и инициативы", path: "/project", icon: IconProjects },
  { id: "p5", type: "Страница", title: "Настройки", subtitle: "Параметры системы", path: "/settings", icon: IconSettings },

  { id: "u1", type: "Пользователь", title: "Иван Петров", subtitle: "user1@vueapp.ru", path: "/table", icon: IconUsers },
  { id: "u2", type: "Пользователь", title: "Мария Соколова", subtitle: "user2@vueapp.ru", path: "/table", icon: IconUsers },
  { id: "u3", type: "Пользователь", title: "Пётр Иванов", subtitle: "user3@vueapp.ru", path: "/table", icon: IconUsers },

  { id: "pr1", type: "Проект", title: "Mobile Redesign", subtitle: "Обновление интерфейса", path: "/project", icon: IconProjects },
  { id: "pr2", type: "Проект", title: "Сайт компании", subtitle: "Корпоративный портал", path: "/project", icon: IconProjects },

  { id: "r1", type: "Отчёт", title: "Выручка за месяц", subtitle: "Финансовый отчёт", path: "/analytics", icon: IconTrend },
  { id: "r2", type: "Отчёт", title: "Динамика заказов", subtitle: "Анализ продаж", path: "/analytics", icon: IconTrend },
];

const searchQuery = ref("");
const isSearchOpen = ref(false);
const activeIndex = ref(-1);

// Текущий запрос при вводе сбрасывает активный пункт и снова открывает список
watch(searchQuery, () => {
  activeIndex.value = -1;
  if (searchQuery.value.trim()) {
    isSearchOpen.value = true;
  }
});

// Фильтрация каталога по title и subtitle (регистронезависимо)
const searchResults = computed(() => {
  const query = searchQuery.value.trim().toLowerCase();
  if (!query) return [];
  return SEARCH_ITEMS.filter((item) =>
    `${item.title} ${item.subtitle ?? ""}`.toLowerCase().includes(query),
  );
});

const handleSearchKeydown = (event) => {
  const items = searchResults.value;
  if (items.length === 0) return;

  if (event.key === "ArrowDown") {
    event.preventDefault();
    activeIndex.value = (activeIndex.value + 1) % items.length;
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    activeIndex.value = (activeIndex.value - 1 + items.length) % items.length;
  } else if (event.key === "Enter") {
    event.preventDefault();
    const item = activeIndex.value >= 0 ? items[activeIndex.value] : items[0];
    selectItem(item);
  } else if (event.key === "Escape") {
    event.preventDefault();
    clearSearch();
  }
};

const clearSearch = () => {
  searchQuery.value = "";
  activeIndex.value = -1;
};

const selectItem = (item) => {
  if (item.path) {
    router.push(item.path);
  } else {
    toast.add({
      title: "Раздел в разработке",
      message: item.subtitle || item.title,
      position: "bottom-left",
      duration: 3000,
    });
  }
  closeSearch();
};

const closeSearch = () => {
  searchQuery.value = "";
  isSearchOpen.value = false;
  activeIndex.value = -1;
};

const closeMobileSearch = () => {
  isMobileSearchOpen.value = false;
  closeSearch();
};


// Данные пользователя для шапки (фолбэк, пока не пришли данные с сервера)
const userInitials = computed(() => {
  const email = authStore.user?.email || "User";
  return email
    .split("@")[0]
    .split(/[._-]/)
    .map((part) => part.charAt(0).toUpperCase())
    .filter(Boolean)
    .slice(0, 2)
    .join("") || "U";
});

const userName = computed(() => {
  const email = authStore.user?.email || "";
  return email ? email.split("@")[0] : "Пользователь";
});

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
  { id: 1, label: "Главная", icon: markRaw(IconHome), path: "/" },
  { id: 2, label: "Аналитика", icon: markRaw(IconAnalytics), path: "/analytics" },
  { id: 3, label: "Таблица", icon: markRaw(IconTable), path: "/table" },
  { id: 4, label: "Проекты", icon: markRaw(IconProjects), path: "/project" },
  { id: 5, label: "Настройки", icon: markRaw(IconSettings), path: "/settings" },
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

/* Выпадающие результаты поиска */
.search-dropdown {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 60;
  max-height: 320px;
  overflow-y: auto;
  padding: 6px;
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  box-shadow: 0 12px 30px -6px rgba(15, 23, 42, 0.18);
}

.search-dropdown--mobile {
  top: calc(100% + 8px);
}

.search-result {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 10px;
  border-radius: 8px;
  cursor: pointer;
}

.search-result:hover,
.search-result.is-active {
  background: #f1f5f9;
}

.search-result-icon {
  display: flex;
  align-items: center;
  flex-shrink: 0;
  color: #64748b;
}

.search-result.is-active .search-result-icon {
  color: #10b981;
}

.search-result-text {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.search-result-title {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-subtitle {
  font-size: 12px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.search-result-type {
  flex-shrink: 0;
  padding: 2px 6px;
  font-size: 11px;
  color: #64748b;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
}

.search-empty {
  padding: 12px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
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

.badge-container.is-open {
  background: #f1f5f9;
  color: #0f172a;
}

.badge {
  position: absolute;
  top: -2px;
  right: -2px;
  min-width: 16px;
  height: 16px;
  padding: 0 4px;
  background: #ef4444;
  color: #ffffff;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  border-radius: 999px;
  border: 2px solid #ffffff;
}

/* Область уведомлений */
.notifications-area {
  position: relative;
}

.notifications-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 70;
  width: 340px;
  max-width: calc(100vw - 24px);
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 16px 40px -12px rgba(15, 23, 42, 0.25);
  overflow: hidden;
}

.notifications-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  border-bottom: 1px solid #f1f5f9;
}

.notifications-title {
  font-size: 14px;
  font-weight: 600;
  color: #0f172a;
}

.notifications-link {
  border: none;
  background: none;
  padding: 0;
  font-size: 12px;
  font-weight: 500;
  color: #10b981;
  cursor: pointer;
}

.notifications-link:hover {
  color: #059669;
  text-decoration: underline;
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  cursor: pointer;
  transition: background 0.15s ease;
}

.notification-row:hover {
  background: #f8fafc;
}

.notification-row + .notification-row {
  border-top: 1px solid #f8fafc;
}

.notification-row.is-unread {
  background: #f0fdfa;
}

.notification-row.is-unread:hover {
  background: #e6f9f3;
}

.notification-icon {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 10px;
  color: #0f172a;
}

.notification-content {
  display: flex;
  flex-direction: column;
  min-width: 0;
  flex: 1;
}

.notification-title {
  font-size: 13px;
  font-weight: 500;
  color: #0f172a;
  line-height: 1.4;
}

.notification-row.is-unread .notification-title {
  font-weight: 600;
}

.notification-time {
  font-size: 12px;
  color: #94a3b8;
  margin-top: 2px;
}

.notification-dot {
  flex-shrink: 0;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
}

.notifications-empty {
  padding: 24px 16px;
  text-align: center;
  font-size: 13px;
  color: #94a3b8;
}

.notifications-foot {
  padding: 10px 16px;
  border-top: 1px solid #f1f5f9;
  text-align: right;
}

/* Анимация панели */
.dropdown-enter-active,
.dropdown-leave-active {
  transition:
    opacity 0.15s ease,
    transform 0.15s ease;
  transform-origin: top right;
}

.dropdown-enter-from,
.dropdown-leave-to {
  opacity: 0;
  transform: translateY(-6px) scale(0.98);
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
