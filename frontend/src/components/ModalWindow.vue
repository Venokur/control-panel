<template>
  <transition name="modal-fade">
    <div v-if="modelValue" class="modal-backdrop" @click="handleBackdropClick">
      <div
        class="modal-container"
        :class="{ 'modal-container--scrolling': isBodyScrolling }"
        role="dialog"
        aria-modal="true"
        :aria-label="title || undefined"
        @click.stop
      >
        <!-- Шапка -->
        <header class="modal-header">
          <slot name="header">
            <h3 class="modal-title">{{ title || "Заголовок окна" }}</h3>
          </slot>
          <button type="button" class="modal-close-btn" aria-label="Закрыть" @click="close">
            <IconClose :size="20" />
          </button>
        </header>

        <!-- Тело -->
        <div class="modal-body" ref="modalBody">
          <slot>
            <p>Контент модального окна.</p>
          </slot>
        </div>

        <!-- Подвал -->
        <footer class="modal-footer" v-if="$slots.footer">
          <slot name="footer">
            <button type="button" class="btn btn-secondary" @click="close">Отмена</button>
            <button type="button" class="btn btn-primary" @click="$emit('confirm')">Принять</button>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { ref, watch, onMounted, onUnmounted, nextTick } from "vue";
import { IconClose } from "./icons/icons";

const modelValue = defineModel({
  type: Boolean,
  required: true,
});

const props = defineProps({
  title: {
    type: String,
    default: "",
  },
  preventBackdropClick: {
    type: Boolean,
    default: false,
  },
  closeOnEscape: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(["close", "confirm"]);

const modalBody = ref(null);
const isBodyScrolling = ref(false);

const close = () => {
  modelValue.value = false;
  emit("close");
};

const handleBackdropClick = () => {
  if (!props.preventBackdropClick) {
    close();
  }
};

const lockBodyScroll = () => {
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  document.body.style.overflow = "hidden";
  document.body.style.paddingRight = `${scrollBarWidth}px`;
};

const unlockBodyScroll = () => {
  document.body.style.overflow = "";
  document.body.style.paddingRight = "";
};

const checkBodyScrolling = () => {
  if (modalBody.value) {
    isBodyScrolling.value = modalBody.value.scrollHeight > modalBody.value.clientHeight;
  }
};

const handleKeydown = (event) => {
  if (props.closeOnEscape && event.key === "Escape" && modelValue.value) {
    close();
  }
};

watch(
  () => modelValue.value,
  (newValue) => {
    if (newValue) {
      lockBodyScroll();
      nextTick(checkBodyScrolling);
    } else {
      unlockBodyScroll();
    }
  },
  { immediate: true },
);

onMounted(() => {
  window.addEventListener("keydown", handleKeydown);
  window.addEventListener("resize", checkBodyScrolling);
});

onUnmounted(() => {
  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("resize", checkBodyScrolling);
  unlockBodyScroll();
});
</script>

<style scoped>
/* Затемненный фон (Overlay) */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.45);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

/* Контейнер модального окна */
.modal-container {
  background-color: #ffffff !important;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow:
    0 20px 25px -5px rgba(0, 0, 0, 0.1),
    0 8px 10px -6px rgba(0, 0, 0, 0.1);
  width: 90%;
  max-width: 540px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  opacity: 1;
}

/* Шапка окна */
.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
  background-color: #ffffff;
  border-bottom: 1px solid #f1f5f9;
}

.modal-title {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
}

.modal-close-btn {
  background: transparent;
  border: none;
  padding: 0.25rem;
  color: #94a3b8;
  cursor: pointer;
  border-radius: 6px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modal-close-btn:hover {
  background-color: #f1f5f9;
  color: #475569;
}

/* Тело окна */
.modal-body {
  padding: 1.5rem;
  font-size: 0.9375rem;
  color: #334155;
  line-height: 1.6;
  background-color: #ffffff;
  overflow-y: auto;
}

.modal-container--scrolling .modal-header {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

/* Подвал окна */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem;
  background-color: #f8fafc;
  border-top: 1px solid #f1f5f9;
}

/* Дефолтные стили кнопок */
.btn {
  padding: 0.625rem 1.25rem;
  font-size: 0.875rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid transparent;
}

.btn-primary {
  background-color: var(--primary);
  color: #ffffff;
}

.btn-primary:hover {
  background-color: var(--primary-hover);
}

.btn-secondary {
  background-color: #ffffff;
  border-color: var(--border);
  color: #475569;
}

.btn-secondary:hover {
  background-color: #f1f5f9;
}

/* Анимация перехода */
.modal-fade-enter-active,
.modal-fade-leave-active {
  transition:
    opacity 0.25s ease,
    transform 0.25s ease;
}

.modal-fade-enter-from,
.modal-fade-leave-to {
  opacity: 0;
  transform: scale(0.96);
}
</style>
