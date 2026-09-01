<template>
  <div class="page-container">
    <!-- Banner -->
    <section class="banner">
      <div class="banner-text">
        <h1>Добро пожаловать в панель управления!</h1>
        <p>Ваша система работает стабильно. Все показатели обновлены в реальном времени.</p>
      </div>
      <button class="btn btn-light">Смотреть отчет</button>
    </section>

    <!-- Stats Grid -->
    <section class="stats-grid">
      <div v-for="stat in stats" :key="stat.id" class="card stat-card">
        <div class="stat-header">
          <span class="stat-title">{{ stat.title }}</span>
          <div class="stat-icon-wrapper">
            <component :is="stat.icon" class="stat-icon" />
          </div>
        </div>
        <div class="stat-body">
          <span class="stat-value">{{ stat.value }}</span>
          <span class="stat-change" :class="stat.isPositive ? 'positive' : 'negative'">
            {{ stat.change }}
          </span>
        </div>
      </div>
    </section>

    <!-- Two Column Content Grid -->
    <section class="grid-2col">
      <!-- Activity Feed -->
      <div class="card">
        <div class="card-header">
          <h2>Последняя активность</h2>
          <button class="btn-text">Все события</button>
        </div>

        <div class="card-body">
          <div class="activity-timeline">
            <div v-for="item in activities" :key="item.id" class="timeline-item">
              <div class="timeline-dot"></div>
              <div class="timeline-content">
                <p class="timeline-text">{{ item.text }}</p>
                <span class="timeline-time">{{ item.time }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Quick Actions -->
      <div class="card">
        <div class="card-header">
          <h2>Быстрые действия</h2>
        </div>
        <div class="action-stack">
          <button class="btn btn-primary" @click="showModal = true">
            <IconPlus :size="18" />
            Создать проект
          </button>
          <button class="btn btn-secondary">
            <IconUpload :size="18" />
            Загрузить файл
          </button>
          <button class="btn btn-secondary">
            <IconUserPlus :size="18" />
            Пригласить коллегу
          </button>
        </div>
      </div>
    </section>

    <ModalWindow
      v-model="showModal"
      title="Новый проект"
      :preventBackdropClick="true"
      @close="onModalClose"
      @confirm="createNewProject"
    >
      <template #default>
        <p>Для создания нового проекта, пожалуйста, заполните форму ниже.</p>
        <div class="form-group" style="margin-top: 1rem">
          <TextInput required :label="'Название проекта'" :maxlength="20" v-model="textInputValue" />
        </div>
      </template>

      <template #footer>
        <button type="button" class="btn btn-secondary" @click="showModal = false">Отмена</button>
        <button type="button" class="btn btn-primary" :disabled="false" @click="createNewProject">Создать</button>
      </template>
    </ModalWindow>
  </div>
</template>

<script setup>
import { ref } from "vue";
import {
  IconUsers,
  IconDollar,
  IconCart,
  IconTrend,
  IconPlus,
  IconUpload,
  IconUserPlus,
} from "@/components/icons/icons";
import ModalWindow from "@/components/ModalWindow.vue";
import { useToast } from "@/components/composable/vToast";
import TextInput from "@/components/TextInput.vue";

const toast = useToast();
const showModal = ref(false);
const textInputValue = ref("");

const createNewProject = () => {
  const newId = activities.value.length > 0 ? Math.max(...activities.value.map((a) => a.id)) + 1 : 1;

  activities.value.push({
    id: newId,
    text: `Проект "${textInputValue.value || "Без названия"}" создан!`,
    time: "Сейчас",
  });

  toast.add({
    title: "Successfully completed",
    message: "The task was completed successfully. You can now view the details.",
    position: "bottom-left",
    duration: 4000,
  });

  showModal.value = false;
};

const onModalClose = () => {
  console.log("Модальное окно закрыто");
};

const stats = ref([
  { id: 1, title: "Пользователи", value: "1,240", change: "+12.5%", isPositive: true, icon: IconUsers },
  { id: 2, title: "Выручка", value: "$12,450", change: "+8.2%", isPositive: true, icon: IconDollar },
  { id: 3, title: "Заказы", value: "384", change: "-2.1%", isPositive: false, icon: IconCart },
  { id: 4, title: "Конверсия", value: "4.8%", change: "+1.4%", isPositive: true, icon: IconTrend },
]);

const activities = ref([
  { id: 1, text: "Регистрация нового пользователя Иван П.", time: "10 мин назад" },
  { id: 2, text: "Успешная оплата подписки #4829", time: "45 мин назад" },
  { id: 3, text: "Создан новый проект «Mobile Redesign»", time: "2 часа назад" },
]);
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.banner {
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
  color: white;
  padding: 32px;
  border-radius: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.banner h1 {
  font-size: 22px;
  margin: 0 0 8px 0;
}

.banner p {
  margin: 0;
  color: #94a3b8;
  font-size: 14px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  display: flex;
  flex-direction: column;
  max-height: 380px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.stat-icon-wrapper {
  padding: 8px;
  background: #f8fafc;
  border-radius: 8px;
  color: #0f172a;
}

.stat-body {
  margin-top: 12px;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.stat-value {
  font-size: 24px;
  font-weight: 700;
}

.stat-change {
  font-size: 12px;
  font-weight: 600;
  padding: 2px 6px;
  border-radius: 4px;
}

.stat-change.positive {
  background: #dcfce7;
  color: #15803d;
}

.stat-change.negative {
  background: #fee2e2;
  color: #b91c1c;
}

.grid-2col {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 20px;
}

.card-header {
  flex-shrink: 0;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-body {
  flex: 1;
  overflow-y: auto;
  padding-right: 4px;
}

.card-header h2 {
  font-size: 16px;
  margin: 0;
}

.activity-timeline {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.timeline-item {
  display: flex;
  gap: 12px;
  align-items: flex-start;
}

.timeline-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #10b981;
  margin-top: 6px;
}

.timeline-text {
  margin: 0;
  font-size: 14px;
}

.timeline-time {
  font-size: 12px;
  color: #94a3b8;
}

.action-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  border: 1px solid transparent;
  transition: all 0.2s;
}

.btn-primary {
  background: #10b981;
  color: white;
}

.btn-primary:hover {
  background: #059669;
}

.btn-secondary {
  background: #ffffff;
  border-color: #e2e8f0;
  color: #0f172a;
}

.btn-secondary:hover {
  background: #f8fafc;
}

.btn-light {
  background: #ffffff;
  color: #0f172a;
}

.btn-text {
  background: none;
  border: none;
  color: #10b981;
  font-weight: 500;
  cursor: pointer;
}

@media (max-width: 900px) {
  .grid-2col {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
}
</style>
