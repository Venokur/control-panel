<template>
  <div ref="cardRef" class="virtual-table-card" :style="rootCardStyle">
    <!-- 1. Десктопная шапка таблицы -->
    <div v-if="!isMobile" class="table-header-wrapper" :style="{ paddingRight: `${scrollbarWidth}px` }">
      <table class="virtual-table">
        <colgroup>
          <col v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}" />
        </colgroup>
        <thead>
          <tr>
            <th
              v-for="col in columns"
              :key="col.key"
              role="columnheader"
              :aria-sort="
                col.sortable
                  ? sortKey === col.key
                    ? sortOrder === 'asc'
                      ? 'ascending'
                      : 'descending'
                    : 'none'
                  : undefined
              "
              :tabindex="col.sortable && !isAutoScrollEnabled ? 0 : -1"
              :class="{
                'sortable-th': col.sortable && !isAutoScrollEnabled,
                'disabled-th': col.sortable && isAutoScrollEnabled,
              }"
              @click="col.sortable && handleSort(col.key)"
              @keydown.enter.prevent="col.sortable && handleSort(col.key)"
              @keydown.space.prevent="col.sortable && handleSort(col.key)"
            >
              <div class="header-cell-content">
                <span>{{ col.label }}</span>
                <span v-if="col.sortable" class="sort-icon" aria-hidden="true">
                  <template v-if="sortKey === col.key">
                    {{ sortOrder === "asc" ? "▲" : "▼" }}
                  </template>
                  <template v-else> ⇅ </template>
                </span>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>

    <!-- 2. Область скролла -->
    <div ref="containerRef" class="table-body-wrapper" :class="{ 'is-mobile-body': isMobile }" @scroll.passive="onScroll">
      <div v-if="processedData.length > 0" :style="{ height: `${totalHeight}px` }" class="virtual-spacer">
        <!-- ДЕСКТОПНЫЙ РЕЖИМ: Таблица -->
        <table
          v-if="!isMobile"
          class="virtual-table virtual-table-body"
          :style="{ transform: `translate3d(0, ${virtualState.offsetY}px, 0)` }"
        >
          <colgroup>
            <col v-for="col in columns" :key="col.key" :style="col.width ? { width: col.width } : {}" />
          </colgroup>
          <tbody>
            <tr
              v-for="(item, index) in virtualState.visibleData"
              :key="item[rowKey]"
              :class="{ 'row-highlight-new': newRowKeys.has(item[rowKey]) }"
              :style="{ height: `${currentRowHeight}px` }"
            >
              <slot
                name="row"
                :row="item"
                :index="virtualState.startIndex + index"
                :columns="columns"
                :row-height="currentRowHeight"
              >
                <td v-for="col in columns" :key="col.key">
                  <slot
                    :name="`col-${col.key}`"
                    :row="item"
                    :value="item[col.key]"
                    :index="virtualState.startIndex + index"
                  >
                    {{ formatValue(item[col.key]) }}
                  </slot>
                </td>
              </slot>
            </tr>
          </tbody>
        </table>

        <!-- МОБИЛЬНЫЙ РЕЖИМ: Список карточек -->
        <div v-else class="mobile-cards-wrapper" :style="{ transform: `translate3d(0, ${virtualState.offsetY}px, 0)` }">
          <div
            v-for="(item, index) in virtualState.visibleData"
            :key="item[rowKey]"
            class="mobile-card-item"
            :class="{ 'row-highlight-new': newRowKeys.has(item[rowKey]) }"
            :style="{ height: `${mobileRowHeight - 12}px` }"
          >
            <slot name="mobile-card" :row="item" :index="virtualState.startIndex + index" :columns="columns">
              <div v-for="col in columns" :key="col.key" class="mobile-card-row">
                <span class="mobile-card-label">{{ col.label }}:</span>
                <span class="mobile-card-value">
                  <slot
                    :name="`col-${col.key}`"
                    :row="item"
                    :value="item[col.key]"
                    :index="virtualState.startIndex + index"
                  >
                    {{ formatValue(item[col.key]) }}
                  </slot>
                </span>
              </div>
            </slot>
          </div>
        </div>
      </div>

      <!-- СООБЩЕНИЕ: Нет данных -->
      <div v-else-if="!isLoading" class="table-empty-state">
        <slot name="empty" :has-filters="hasActiveFilters" :total="data.length">
          <div class="empty-content">
            <div class="empty-icon-wrap">
              <svg
                v-if="hasActiveFilters"
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                <line x1="8" y1="11" x2="14" y2="11"></line>
              </svg>
              <svg
                v-else
                viewBox="0 0 24 24"
                width="32"
                height="32"
                fill="none"
                stroke="currentColor"
                stroke-width="1.8"
                stroke-linecap="round"
                stroke-linejoin="round"
              >
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="9" y1="15" x2="15" y2="15"></line>
              </svg>
            </div>
            <span class="empty-title">
              {{ hasActiveFilters ? "Ничего не найдено" : "Нет данных для отображения" }}
            </span>
            <span class="empty-subtitle">
              {{ hasActiveFilters ? "Попробуйте изменить параметры или сбросить фильтры" : "Список пока пуст" }}
            </span>
          </div>
        </slot>
      </div>
    </div>

    <!-- 3. Лоадер -->
    <transition name="fade-loader">
      <div v-if="isLoading" class="table-loader-overlay" :class="{ 'is-mobile-loader': isMobile }">
        <slot name="loader">
          <div class="loader-spinner-box">
            <div class="table-spinner"></div>
            <span class="loader-text">Загрузка данных...</span>
          </div>
        </slot>
      </div>
    </transition>

    <!-- 4. Подвал (Footer) таблицы -->
    <div class="table-footer-wrapper">
      <slot
        name="footer"
        :total="data.length"
        :count="processedData.length"
        :auto-scroll="isAutoScrollEnabled"
        :toggle-auto-scroll="toggleAutoScroll"
        :is-loading="isLoading"
      >
        <div class="footer-left">
          <button
            type="button"
            class="autoscroll-btn"
            :class="{ active: isAutoScrollEnabled }"
            :disabled="isLoading || processedData.length === 0"
            @click="toggleAutoScroll"
          >
            <span class="autoscroll-dot"></span>
            <span class="autoscroll-label">AUTO</span>
          </button>
        </div>

        <div class="footer-right">
          <span v-if="isLoading">Обработка данных...</span>
          <span v-else-if="hasActiveFilters">
            Найдено: <strong>{{ processedData.length }}</strong> из <strong>{{ data.length }}</strong>
          </span>
          <span v-else>
            Всего элементов: <strong>{{ data.length }}</strong>
          </span>
        </div>
      </slot>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useVirtualTable } from "@/composable/useVirtualTable";

const props = defineProps({
  data: { type: Array, required: true },
  columns: { type: Array, required: true },
  filters: { type: Array, default: () => [] },
  rowHeight: { type: Number, default: 52 },
  mobileRowHeight: { type: Number, default: 200 },
  buffer: { type: Number, default: 5 },
  rowKey: { type: String, default: "id" },
  height: { type: [String, Number], default: null },
  mobileBreakpoint: { type: Number, default: 768 },
  highlightDuration: { type: Number, default: 2500 },
  followTolerance: { type: Number, default: 24 },
});

const cardRef = ref(null);
const containerRef = ref(null);

const {
  isMobile,
  currentRowHeight,
  rootCardStyle,
  scrollbarWidth,
  sortKey,
  sortOrder,
  isAutoScrollEnabled,
  isLoading,
  newRowKeys,
  processedData,
  hasActiveFilters,
  totalHeight,
  virtualState,
  formatValue,
  toggleAutoScroll,
  handleSort,
  onScroll,
} = useVirtualTable(props, { cardRef, containerRef });
</script>

<style scoped>
.virtual-table-card {
  --vt-header-height: 48px;
  --vt-footer-height: 40px;
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #eef2f6;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.03);
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Inter, sans-serif;
  width: 100%;
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.table-header-wrapper {
  background-color: #fafbfd;
  border-bottom: 1px solid #eef2f6;
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--vt-header-height);
  z-index: 2;
}

.table-body-wrapper {
  position: absolute;
  top: var(--vt-header-height);
  bottom: var(--vt-footer-height);
  left: 0;
  right: 0;
  overflow: auto;
  will-change: transform;
}

.table-body-wrapper.is-mobile-body {
  top: 0;
  padding: 12px;
  box-sizing: border-box;
}

/* --- EMPTY STATE --- */
.table-empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100%;
  height: 100%;
  padding: 32px 16px;
  box-sizing: border-box;
}

.empty-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  max-width: 320px;
  user-select: none;
}

.empty-icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.empty-title {
  font-size: 15px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 6px;
}

.empty-subtitle {
  font-size: 13px;
  color: #94a3b8;
  line-height: 1.4;
}

/* --- ЛОАДЕР --- */
.table-loader-overlay {
  position: absolute;
  top: var(--vt-header-height);
  bottom: var(--vt-footer-height);
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.86);
  backdrop-filter: blur(2px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  pointer-events: all;
}

.table-loader-overlay.is-mobile-loader {
  top: 0;
}

.loader-spinner-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  user-select: none;
}

.table-spinner {
  width: 32px;
  height: 32px;
  border: 3px solid rgba(66, 184, 131, 0.2);
  border-top-color: #42b883;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

.loader-text {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  letter-spacing: 0.02em;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.fade-loader-enter-active,
.fade-loader-leave-active {
  transition: opacity 0.2s ease;
}

.fade-loader-enter-from,
.fade-loader-leave-to {
  opacity: 0;
}

.table-footer-wrapper {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--vt-footer-height);
  background-color: #fafbfd;
  border-top: 1px solid #eef2f6;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  z-index: 2;
  box-sizing: border-box;
}

.footer-left {
  display: flex;
  align-items: center;
}

.footer-right {
  font-size: 13px;
  color: #64748b;
}

.footer-right strong {
  color: #1e293b;
  font-weight: 600;
}

.autoscroll-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 5px 12px;
  background: transparent;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  cursor: pointer;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  user-select: none;
}

.autoscroll-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.autoscroll-btn:not(:disabled):hover {
  border-color: #cbd5e1;
  background-color: #f8fafc;
}

.autoscroll-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #94a3b8;
  transition: all 0.2s ease;
}

.autoscroll-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  color: #64748b;
  transition: all 0.2s ease;
}

.autoscroll-btn.active {
  border-color: rgba(66, 184, 131, 0.4);
  background: rgba(66, 184, 131, 0.08);
}

.autoscroll-btn.active .autoscroll-dot {
  background-color: #42b883;
  box-shadow: 0 0 8px rgba(66, 184, 131, 0.6);
}

.autoscroll-btn.active .autoscroll-label {
  color: #10b981;
}

.table-body-wrapper::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
.table-body-wrapper::-webkit-scrollbar-track {
  background: transparent;
}
.table-body-wrapper::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 3px;
}
.table-body-wrapper::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
.table-body-wrapper::-webkit-scrollbar-corner {
  background: transparent;
}

.virtual-spacer {
  width: 100%;
  position: relative;
}

.virtual-table {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.table-header-wrapper th {
  padding: 14px 18px;
  text-align: left;
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
  box-sizing: border-box;
}

.table-header-wrapper th:focus-visible {
  outline: 2px solid #42b883;
  outline-offset: -2px;
}

.sortable-th {
  cursor: pointer;
  user-select: none;
}

.disabled-th {
  cursor: not-allowed;
  user-select: none;
  opacity: 0.6;
}

.header-cell-content {
  display: flex;
  align-items: center;
  gap: 6px;
}

.sort-icon {
  font-size: 11px;
  opacity: 0.5;
}

.virtual-table-body {
  position: absolute;
  top: 0;
  left: 0;
  will-change: transform;
}

.virtual-table-body :deep(td) {
  padding: 0 18px;
  font-size: 14px;
  color: #1e293b;
  border-bottom: 1px solid #f8fafc;
  box-sizing: border-box;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.virtual-table-body :deep(tr) {
  transition: background-color 0.15s ease;
}

.virtual-table-body :deep(tr:hover) {
  background-color: #f8fafc !important;
}

/* Изумрудная анимация добавления (десктоп) */
.virtual-table-body :deep(tr.row-highlight-new) {
  animation: pulseVueEmeraldRow var(--highlight-duration, 2500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.virtual-table-body :deep(tr.row-highlight-new:hover) {
  background-color: #f1f5f9 !important;
  box-shadow: inset 4px 0 0 #42b883;
}

@keyframes pulseVueEmeraldRow {
  0% {
    background-color: rgba(66, 184, 131, 0.28);
    box-shadow: inset 4px 0 0 #42b883;
  }
  35% {
    background-color: rgba(66, 184, 131, 0.14);
    box-shadow: inset 4px 0 0 #42b883;
  }
  100% {
    background-color: transparent;
    box-shadow: inset 0 0 0 transparent;
  }
}

.mobile-cards-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  will-change: transform;
}

.mobile-card-item {
  background: #ffffff;
  border: 1px solid #eef2f6;
  border-radius: 8px;
  padding: 12px 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
  transition:
    border-color 0.15s ease,
    background-color 0.15s ease;
}

.mobile-card-item:hover {
  background-color: #f8fafc !important;
}

.mobile-card-item.row-highlight-new {
  animation: pulseVueEmeraldCard var(--highlight-duration, 2500ms) cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.mobile-card-item.row-highlight-new:hover {
  background-color: #f1f5f9 !important;
  border-color: #42b883 !important;
}

@keyframes pulseVueEmeraldCard {
  0% {
    border-color: #42b883;
    background-color: rgba(66, 184, 131, 0.12);
    box-shadow: 0 0 12px rgba(66, 184, 131, 0.2);
  }
  100% {
    border-color: #eef2f6;
    background-color: #ffffff;
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.02);
  }
}

.mobile-card-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 13px;
}

.mobile-card-label {
  font-weight: 600;
  color: #64748b;
}

.mobile-card-value {
  color: #1e293b;
  text-align: right;
}
</style>
