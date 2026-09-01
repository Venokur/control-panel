<template>
  <div class="not-found-wrapper">
    <div class="not-found-card">
      <!-- Левая часть: Контент -->
      <div class="content-side">
        <div class="error-code">404</div>
        <h1 class="title">Страница не найдена</h1>
        <p class="description">
          Кажется, мысленный маршрут увёл вас слишком далеко. Запрашиваемая страница перемещена или больше не
          существует.
        </p>

        <div class="actions">
          <button class="btn btn-primary" @click="goHome">Вернуться на главную</button>
          <button class="btn-secondary" @click="goBack">
            Вернуться назад
            <svg
              class="arrow-icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M6 12L10 8L6 4"
                stroke="currentColor"
                stroke-width="1.75"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>

      <!-- Правая часть: Фирменный градиент -->
      <div class="visual-side">
        <div class="gradient-bg"></div>
        <div class="glow-overlay"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goHome = () => {
  if (router) {
    router.push("/");
  } else {
    window.location.href = "/";
  }
};

const goBack = () => {
  if (router && window.history.length > 1) {
    router.back();
  } else {
    window.location.href = "/";
  }
};
</script>

<style scoped>
.btn-secondary {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: none;
  outline: none;
  padding: 0;
  margin: 0;

  padding-left: 0.5rem;
  padding-right: 0.5rem;

  /* Типографика */
  color: #4b5563; /* Темно-серый цвет текста */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;

  cursor: pointer;
  transition: color 0.2s ease;
}

.arrow-icon {
  width: 16px;
  height: 16px;
  transition: transform 0.2s ease;
}

/* Эффекты при наведении */
.btn-secondary:hover {
  color: #111827; /* Затемнение при ховере */
}

.btn-secondary:hover .arrow-icon {
  transform: translateX(3px); /* Легкий сдвиг стрелки вправо */
}

/* Состояние нажатия */
.btn-secondary:active {
  opacity: 0.8;
}

.not-found-wrapper {
  min-height: 100vh;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  box-sizing: border-box;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.not-found-card {
  display: flex;
  width: 100%;
  max-width: 820px;
  min-height: 440px;
  background: #ffffff;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

/* Левая половина */
.content-side {
  flex: 1;
  padding: 3.5rem 3rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  box-sizing: border-box;
}

.error-code {
  font-size: 7rem;
  font-weight: 800;
  color: #3b30d8;
  line-height: 1;
  margin-bottom: 0.75rem;
  letter-spacing: -0.02em;
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 0.75rem 0;
}

.description {
  font-size: 0.925rem;
  line-height: 1.6;
  color: #6b7280;
  margin: 0 0 2rem 0;
}

.actions {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

/* Кнопки */
.btn {
  font-size: 0.9rem;
  font-weight: 500;
  border-radius: 10px;
  padding: 0.75rem 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  outline: none;
}

.btn-primary {
  display: inline-flex;
  align-items: center;
  justify-content: center;

  /* Размеры и отступы */
  border-radius: 10px;
  border: none;
  outline: none;

  /* Цвета и градиент */
  background: linear-gradient(135deg, #3b30d8 0%, #4f46e5 100%);
  color: #ffffff;

  /* Типографика */
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  font-weight: 500;
  line-height: 1;

  /* Тень как на макете */
  box-shadow: 0 4px 14px rgba(59, 48, 216, 0.35);

  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Ховер эффект */
.btn-primary:hover {
  background: linear-gradient(135deg, #3228c5 0%, #4338ca 100%);
  box-shadow: 0 6px 18px rgba(59, 48, 216, 0.45);
  transform: translateY(-1px);
}

/* Нажатие */
.btn-primary:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(59, 48, 216, 0.3);
}

/* Правая половина с градиентом */
.visual-side {
  flex: 1;
  position: relative;
  background-image: url(/src/assets/image/image-1.avif?q=80&w=1000&auto=format&fit=crop);
  background-size: cover;
  background-position: center;
  display: flex;
  align-items: flex-end;
  padding: 3rem 2.5rem;
}

/* Плавный многослойный градиент в стиле оригинала */
.gradient-bg {
  position: absolute;
  inset: 0;
  filter: blur(10px);
  transform: scale(1.1);
}

.glow-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to top, rgba(17, 24, 39, 0.85) 0%, rgba(17, 24, 39, 0.2) 100%);
}

/* Адаптивность для мобильных устройств */
@media (max-width: 768px) {
  .not-found-card {
    flex-direction: column;
  }

  .visual-side {
    height: 160px;
    order: -1; /* Перемещает градиент наверх на мобильных */
  }

  .content-side {
    padding: 2rem 1.5rem;
  }

  .actions {
    flex-direction: column;
    align-items: stretch;
    gap: 0.75rem;
  }
}
</style>
