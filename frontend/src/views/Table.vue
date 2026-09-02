<template>
  <div class="page-container">
    <h2>Таблица данных</h2>
    <div class="card">
      <VirtualTable :filters="activeFilters" :data="items" :columns="columns" :row-height="52" row-key="id">
        <template #col-name="{ row, value }">
          <span class="clickable-name" v-tooltip="`Профиль: ${value} (${row.email})`"> 👤 {{ value }} </span>
        </template>

        <template #col-growth="{ value }">
          <span :class="['growth-tag', value >= 0 ? 'positive' : 'negative']">
            {{ value >= 0 ? `+${value}%` : `${value}%` }}
          </span>
        </template>

        <template #col-status="{ value }">
          <div class="badge-wrapper">
            <span :class="['badge-dot', value.type]"></span>
            <span :class="['badge-text', value.type]">{{ value.label }}</span>
          </div>
        </template>
      </VirtualTable>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { vTooltip } from "@/directives/vTooltip";
import VirtualTable from "@/components/VirtualTable.vue";

const activeFilters = ref([]);

const columns = [
  { key: "id", label: "ID", width: "90px", sortable: true },
  { key: "name", label: "Пользователь", width: "220px" },
  { key: "email", label: "Email" },
  { key: "growth", label: "Прибыль", width: "120px", sortable: true },
  { key: "status", label: "Статус", width: "150px" },
];

const statuses = [
  { type: "active", label: "Регистрация" },
  { type: "pending", label: "В обработке" },
  { type: "blocked", label: "Заблокирован" },
];

const items = ref(
  Array.from({ length: 2000 }, (_, index) => ({
    id: index + 1,
    name: `Иван Петров ${index + 1}`,
    email: `user${index + 1}@vueapp.ru`,
    growth: Number((((index % 15) - 5) * 1.2).toFixed(1)),
    status: statuses[index % statuses.length],
  })),
);

let timerId = null;
// Функция добавления новой записи
let nextId = items.value.length > 0 ? items.value.reduce((max, item) => (item.id > max ? item.id : max), 0) + 1 : 1;

const addNewRow = () => {
  const newId = nextId++;

  const newRecord = {
    id: newId,
    name: `Пользователь ${newId}`,
    email: `user${newId}@vueapp.ru`,
    growth: Number((((newId % 15) - 5) * 1.2).toFixed(1)),
    status: statuses[newId % statuses.length],
  };

  items.value.push(newRecord);
};

// Запуск интервала каждые 1000 мс (1 секунда)
onMounted(() => {
  timerId = setInterval(addNewRow, 1000);
});

// Очистка таймера при размонтировании компонента
onUnmounted(() => {
  if (timerId) clearInterval(timerId);
});
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 16px;
  flex: 1;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  flex: 1;
}

.growth-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
}

.growth-tag.positive {
  background-color: #e6f7f0;
  color: #00b973;
}

.growth-tag.negative {
  background-color: #fde8e8;
  color: #f87171;
}

.badge-wrapper {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.badge-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  display: inline-block;
}

.badge-text {
  font-size: 13px;
  font-weight: 500;
}

.badge-dot.active {
  background-color: #00b973;
}

.badge-text.active {
  color: #00b973;
}

.badge-dot.pending {
  background-color: #f59e0b;
}

.badge-text.pending {
  color: #f59e0b;
}

.badge-dot.blocked {
  background-color: #ef4444;
}

.badge-text.blocked {
  color: #ef4444;
}
</style>
