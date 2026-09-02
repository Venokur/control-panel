<template>
  <button
    :type="type"
    class="submit-btn"
    :class="`submit-btn--${variant}`"
    :disabled="disabled || isLoading"
    :aria-busy="isLoading"
  >
    <span v-if="isLoading" class="loader" aria-hidden="true"></span>
    <slot v-else>{{ text }}</slot>
  </button>
</template>

<script setup>
defineProps({
  isLoading: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  text: {
    type: String,
    default: "Кнопка",
  },
  type: {
    type: String,
    default: "submit",
  },
  variant: {
    type: String,
    default: "primary",
  },
});
</script>

<style scoped>
.submit-btn {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  margin-top: 0.5rem;
  padding: 0.875rem;
  font-size: 1rem;
  font-weight: 600;
  color: #ffffff;
  background: var(--primary);
  border: none;
  border-radius: 12px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.25);
  transition: all 0.2s ease;
}

.submit-btn--secondary {
  background: var(--bg-card);
  color: var(--text-main);
  border: 1px solid var(--border);
  box-shadow: none;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 6px 16px rgba(16, 185, 129, 0.35);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

/* Индикатор загрузки */
.loader {
  width: 20px;
  height: 20px;
  border: 2px solid #ffffff;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>
