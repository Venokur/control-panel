<template>
  <div class="login-wrapper">
    <div class="login-card">
      <!-- Левая секция: Форма -->
      <div class="form-section">
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              v-model.trim="form.email"
              type="email"
              placeholder="admin@example.com"
              :disabled="isLoading"
              required
            />
          </div>

          <div class="form-group">
            <label for="password">Пароль</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              :disabled="isLoading"
              required
            />
          </div>

          <div v-if="errorMessage" class="error-message">
            {{ errorMessage }}
          </div>

          <Button :is-loading="isLoading" text="Войти" />
        </form>
      </div>

      <!-- Правая секция: Изображение -->
      <div class="image-section">
        <div class="image-overlay"></div>
        <div class="image-content">
          <h3>Управляйте задачами легко и быстро</h3>
          <p>Современное решение для эффективной работы вашей команды.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useAuthStore } from "@/stores/auth";
import Button from "@/components/Button.vue";

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const form = reactive({
  email: "",
  password: "",
});

const isLoading = ref(false);
const errorMessage = ref("");

const handleLogin = () => {
  errorMessage.value = "";
  isLoading.value = true;

  // Вызов метода authStore.login, который возвращает Promise из хелпера
  authStore
    .login({
      email: form.email,
      password: form.password,
    })
    .then(() => {
      const redirectPath = route.query.redirect || "/";
      router.push(redirectPath);
    })
    .catch((error) => {
      errorMessage.value = error.message || "Произошла ошибка при входе";
    })
    .finally(() => {
      isLoading.value = false;
    });
};
</script>

<style scoped>
/* Фоновый контейнер */
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 1.5rem;
  font-family:
    system-ui,
    -apple-system,
    BlinkMacSystemFont,
    "Segoe UI",
    Roboto,
    sans-serif;
}

/* Двухколоночная карточка */
.login-card {
  display: flex;
  width: 100%;
  max-width: 900px;
  min-height: 560px;
  background: #ffffff;
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.08);
}

/* --- ЛЕВАЯ КОЛОНКА (ФОРМА) --- */
.form-section {
  flex: 1;
  padding: 3rem 2.5rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.brand {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 2rem;
}

.brand-logo {
  font-size: 1.5rem;
}

.brand-name {
  font-weight: 700;
  font-size: 1.25rem;
  color: #111827;
}

.form-header {
  margin-bottom: 2rem;
}

.form-header h2 {
  font-size: 1.75rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.form-header p {
  font-size: 0.95rem;
  color: #6b7280;
  margin: 0;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
}

.form-group input {
  width: 100%;
  padding: 0.875rem 1rem;
  font-size: 0.95rem;
  color: #111827;
  background-color: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  outline: none;
  box-sizing: border-box;
  transition: all 0.2s ease;
}

.form-group input:focus {
  background-color: #ffffff;
  border-color: #6366f1;
  box-shadow: 0 0 0 4px rgba(99, 102, 241, 0.12);
}

.error-message {
  padding: 0.75rem 1rem;
  font-size: 0.875rem;
  color: #991b1b;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 10px;
}

/* Индикатор загрузки (спиннер) */
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

/* --- ПРАВАЯ КОЛОНКА (ИЗОБРАЖЕНИЕ) --- */
.image-section {
  flex: 1;
  position: relative;
  background-image: url("@/assets/image/image-1.avif?q=80&w=1000&auto=format&fit=crop");
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 3rem 2.5rem;
}

.image-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.2) 100%);
}

.image-content {
  position: relative;
  z-index: 1;
  color: #ffffff;
}

.image-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  line-height: 1.3;
}

.image-content p {
  font-size: 0.95rem;
  color: #e5e7eb;
  margin: 0;
  line-height: 1.5;
}

/* --- АДАПТИВНОСТЬ ДЛЯ МОБИЛЬНЫХ ЭКРАНОВ --- */
@media (max-width: 768px) {
  .login-card {
    flex-direction: column;
    max-width: 450px;
  }

  .image-section {
    order: -1;
  }

  .form-section {
    padding: 2rem 1.5rem;
  }
}
</style>