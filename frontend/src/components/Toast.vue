<template>
  <Teleport to="body">
    <div v-for="pos in positions" :key="pos" :class="['toast-wrapper', pos]">
      <TransitionGroup name="toast-stack">
        <div
          v-for="(toast, index) in getToastsByPosition(pos)"
          :key="toast.id"
          :class="['toast-item', pos]"
          :style="{
            '--index': getToastsByPosition(pos).length - 1 - index,
            '--z-index': index + 1,
          }"
        >
          <div class="toast-card">
            <div class="toast-header">
              <h4 class="toast-title">{{ toast.title }}</h4>
              <button class="toast-close" aria-label="Close" @click="toastService.remove(toast.id)">
                <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <path d="M1 1L11 11M1 11L11 1" stroke="#4A5568" stroke-width="1.5" stroke-linecap="round" />
                </svg>
              </button>
            </div>
            <p class="toast-message">{{ toast.message }}</p>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { useToast } from "./composable/vToast";

const toastService = useToast();
const positions = ["top-right", "top-left", "bottom-right", "bottom-left"];

const getToastsByPosition = (pos) => {
  return toastService.toasts.filter((t) => t.position === pos).slice(-3);
};
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  z-index: 9999;
  padding: 16px;
  pointer-events: none;
  width: 320px;
  isolation: isolate;
}

/* Фиксация позиций контейнера по углам экрана */
.toast-wrapper.top-right {
  top: 10px;
  right: 20px;
}
.toast-wrapper.top-left {
  top: 10px;
  left: 20px;
}
.toast-wrapper.bottom-right {
  bottom: 20px;
  right: 20px;
}
.toast-wrapper.bottom-left {
  bottom: 20px;
  left: 20px;
}

.toast-item {
  position: absolute;
  left: 0;
  right: 0;
  pointer-events: auto;
  z-index: var(--z-index) !important;
  will-change: transform, opacity;
  backface-visibility: hidden;

  transition:
    transform 0.35s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.3s ease;
}

/* === ЛОГИКА СТОПКИ ДЛЯ ВЕРХНИХ УГЛОВ (Сдвиг вниз) === */
.toast-item.top-right,
.toast-item.top-left {
  top: 0;
  transform-origin: top center;
  transform: translate3d(0, calc(var(--index) * 10px), 0) scaleX(calc(1 - var(--index) * 0.05));
}

/* === ЛОГИКА СТОПКИ ДЛЯ НИЖНИХ УГЛОВ (Сдвиг вверх) === */
.toast-item.bottom-right,
.toast-item.bottom-left {
  bottom: 0;
  transform-origin: bottom center;
  transform: translate3d(0, calc(var(--index) * -10px), 0) scaleX(calc(1 - var(--index) * 0.05));
}

/* Скрытие содержимого у задних слоев */
.toast-item[style*="--index: 1"] .toast-message,
.toast-item[style*="--index: 2"] .toast-message,
.toast-item[style*="--index: 1"] .toast-header,
.toast-item[style*="--index: 2"] .toast-header {
  opacity: 0;
  visibility: hidden;
}

.toast-card {
  background-color: #ffffff;
  border-radius: 8px;
  padding: 16px 20px;
  min-height: 72px;
  border: 1px solid #e2e8f0;
  box-shadow:
    0 4px 12px -2px rgba(0, 0, 0, 0.12),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.toast-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.toast-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: #2d3748;
}

.toast-close {
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
}

.toast-close:hover {
  background-color: #edf2f7;
}

.toast-message {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #718096;
}

/* === АНИМАЦИИ ВЫЛЕТА / УХОДА ПО УГЛАМ === */

.toast-stack-move {
  transition: transform 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

/* Анимация появления: сверху для верхних, снизу для нижних */
.toast-item.top-right.toast-stack-enter-from,
.toast-item.top-left.toast-stack-enter-from {
  opacity: 0;
  transform: translate3d(0, -25px, 0) scaleX(1);
}

.toast-item.bottom-right.toast-stack-enter-from,
.toast-item.bottom-left.toast-stack-enter-from {
  opacity: 0;
  transform: translate3d(0, 25px, 0) scaleX(1);
}

/* Общие правила ухода элементов */
.toast-stack-leave-active {
  position: absolute;
  pointer-events: none;
  z-index: 0 !important;
  transition:
    transform 0.3s cubic-bezier(0.16, 1, 0.3, 1),
    opacity 0.25s ease;
}

.toast-item.top-right.toast-stack-leave-to,
.toast-item.top-left.toast-stack-leave-to {
  opacity: 0;
  transform: translate3d(0, -15px, 0) scaleX(0.9);
}

.toast-item.bottom-right.toast-stack-leave-to,
.toast-item.bottom-left.toast-stack-leave-to {
  opacity: 0;
  transform: translate3d(0, 15px, 0) scaleX(0.9);
}
</style>
