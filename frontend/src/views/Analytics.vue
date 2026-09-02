<template>
  <div class="page-container">
    <!-- Заголовок -->
    <div class="page-head">
      <h2>Аналитика</h2>
      <div class="page-actions">
        <div class="period-switch">
          <button
            v-for="period in periods"
            :key="period.key"
            type="button"
            class="period-btn"
            :class="{ active: periodKey === period.key }"
            @click="setPeriod(period.key)"
          >
            {{ period.label }}
          </button>
        </div>
        <button type="button" class="refresh-btn" :disabled="isRefreshing" @click="refreshData">
          <span v-if="isRefreshing" class="spinner" aria-hidden="true"></span>
          <span v-else>Обновить</span>
        </button>
      </div>
    </div>

    <!-- KPI -->
    <section class="kpi-grid">
      <div v-for="kpi in kpis" :key="kpi.id" class="card kpi-card">
        <div class="kpi-top">
          <span class="kpi-title">{{ kpi.title }}</span>
          <span class="kpi-icon">
            <component :is="kpi.icon" :size="20" />
          </span>
        </div>
        <div class="kpi-value">{{ kpi.value }}</div>
        <div class="kpi-delta" :class="kpi.trend === 'up' ? 'delta-up' : 'delta-down'">
          <span class="kpi-arrow">{{ kpi.trend === 'up' ? '▲' : '▼' }}</span>
          {{ kpi.pct }}% <span class="kpi-hint">к прошлому периоду</span>
        </div>
      </div>
    </section>

    <!-- Графики -->
    <section class="chart-grid">
      <!-- Линейный график: выручка -->
      <div class="card chart-card">
        <div class="card-head">
          <h3>Выручка</h3>
          <span class="chart-total">{{ fmtMoney(lineTotal) }}</span>
        </div>
        <div class="chart" @mouseleave="lineHover = null">
          <svg
            class="chart-svg"
            viewBox="0 0 600 200"
            role="img"
            aria-label="График выручки"
          >
            <line v-for="gy in gridY" :key="'gy-' + gy" x1="0" :y1="gy" x2="600" :y2="gy" class="chart-grid-line" />
            <polyline :points="linePointsStr" class="chart-line" fill="none" />
            <circle
              v-for="(point, index) in linePoints"
              :key="'lp-' + index"
              :cx="point.x"
              :cy="point.y"
              r="4"
              class="chart-dot"
              :class="{ 'is-hover': lineHover === index }"
              @mouseenter="lineHover = index"
            />
          </svg>
          <div v-if="lineHover !== null" class="chart-tooltip" :style="tooltipStyle(lineHover, linePoints)">
            <div class="tt-label">{{ lineLabels[lineHover] }}</div>
            <div class="tt-value">{{ fmtMoney(linePoints[lineHover].value) }}</div>
          </div>
        </div>
      </div>

      <!-- Столбчатый график: заказы -->
      <div class="card chart-card">
        <div class="card-head">
          <h3>Заказы</h3>
          <span class="chart-total">{{ barTotal }}</span>
        </div>
        <div class="chart" @mouseleave="barHover = null">
          <svg
            class="chart-svg"
            viewBox="0 0 600 200"
            role="img"
            aria-label="График заказов"
          >
            <line v-for="gy in gridY" :key="'by-' + gy" x1="0" :y1="gy" x2="600" :y2="gy" class="chart-grid-line" />
            <rect
              v-for="(bar, index) in bars"
              :key="'bar-' + index"
              :x="bar.x"
              :y="bar.y"
              :width="barWidth"
              :height="bar.height"
              rx="3"
              class="chart-bar"
              :class="{ 'is-hover': barHover === index }"
              @mouseenter="barHover = index"
            />
          </svg>
          <div v-if="barHover !== null" class="chart-tooltip" :style="tooltipStyle(barHover, barAnchors)">
            <div class="tt-label">{{ barLabels[barHover] }}</div>
            <div class="tt-value">{{ barSeries[barHover] }}</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Топ источников -->
    <section class="card top-card">
      <div class="card-head">
        <h3>Топ источников трафика</h3>
        <span class="top-caption">за {{ currentPeriodLabel.toLowerCase() }}</span>
      </div>
      <div class="top-list">
        <div v-for="row in topRows" :key="row.label" class="top-row">
          <div class="top-meta">
            <span class="top-name">{{ row.label }}</span>
            <span class="top-value">{{ row.visits }}</span>
          </div>
          <div class="top-track">
            <div class="top-fill" :style="{ width: row.share + '%' }"></div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { IconUsers, IconDollar, IconCart, IconAnalytics } from "@/components/icons/icons";

// === Настройки периодов ===
const periods = [
  { key: "7d", label: "7 дней", count: 7, step: 1 },
  { key: "30d", label: "30 дней", count: 15, step: 2 },
  { key: "90d", label: "90 дней", count: 30, step: 3 },
];

const periodKey = ref("30d");
const seed = ref(1);
const isRefreshing = ref(false);

// Ховер на графиках
const lineHover = ref(null);
const barHover = ref(null);

const currentPeriodLabel = computed(() => periods.find((p) => p.key === periodKey.value)?.label || "");

// === Детерминированный генератор ===
function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (v, min, max) => Math.min(max, Math.max(min, v));

function walk(rng, count, { start, min, max, step }) {
  const out = [];
  let current = start;
  for (let i = 0; i < count; i++) {
    current = clamp(current + (rng() - 0.5) * step, min, max);
    out.push(Math.round(current));
  }
  return out;
}

const genInt = (rng, min, max) => Math.floor(rng() * (max - min + 1)) + min;

function genDelta(rng, forceUp) {
  const trend = forceUp || rng() > 0.45 ? "up" : "down";
  const pct = Number((rng() * 8 + 0.5).toFixed(1));
  return { trend, pct };
}

const pad2 = (n) => String(n).padStart(2, "0");

function buildDateLabels(count, step) {
  const labels = [];
  const now = new Date();
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i * step);
    labels.push(`${pad2(d.getDate())}.${pad2(d.getMonth() + 1)}`);
  }
  return labels;
}

// === Формирование демо-датасета ===
const dataset = computed(() => {
  const cfg = periods.find((p) => p.key === periodKey.value);
  const rng = mulberry32(seed.value * 2654435761 + cfg.count);

  const revenue = walk(rng, cfg.count, { start: 1600, min: 900, max: 2800, step: 700 });
  const orders = walk(rng, cfg.count, { start: 70, min: 25, max: 175, step: 50 });

  const usersBase = 1120 + cfg.count * 6;
  const users = genInt(rng, usersBase, usersBase + 240);
  const conversion = Number((rng() * 3.2 + 2.2).toFixed(1));

  const labels = buildDateLabels(cfg.count, cfg.step);

  const topSources = [
    "Прямые переходы",
    "Органический поиск",
    "Соцсети",
    "Контекстная реклама",
    "Email-рассылки",
  ];
  const visits = topSources.map(() => genInt(rng, 180, 2400));
  const visitsTotal = visits.reduce((s, v) => s + v, 0);
  const top = topSources.map((label, i) => ({
    label,
    visits: visits[i].toLocaleString("ru-RU"),
    share: Math.round((visits[i] / visitsTotal) * 100),
  }));

  return {
    cfg,
    labels,
    revenue,
    orders,
    users,
    conversion,
    kpis: [
      {
        id: "users",
        title: "Пользователи",
        icon: IconUsers,
        value: users.toLocaleString("ru-RU"),
        ...genDelta(rng, true),
      },
      {
        id: "revenue",
        title: "Выручка",
        icon: IconDollar,
        value: fmtMoney(revenue.reduce((s, v) => s + v, 0)),
        ...genDelta(rng, true),
      },
      {
        id: "orders",
        title: "Заказы",
        icon: IconCart,
        value: orders.reduce((s, v) => s + v, 0).toLocaleString("ru-RU"),
        ...genDelta(rng),
      },
      {
        id: "conversion",
        title: "Конверсия",
        icon: IconAnalytics,
        value: `${conversion}%`,
        ...genDelta(rng, true),
      },
    ],
    top,
  };
});

const kpis = computed(() => dataset.value.kpis);
const topRows = computed(() => dataset.value.top);

// === Геометрия линейного графика ===
const CHART_W = 600;
const CHART_H = 200;
const CHART_PAD = 14;

const gridY = [45, 90, 135, 180];

const linePoints = computed(() => {
  const series = dataset.value.revenue;
  const max = Math.max(...series);
  const min = Math.min(...series);
  const range = max - min || 1;
  return series.map((value, i) => {
    const x = CHART_PAD + (i * (CHART_W - CHART_PAD * 2)) / (series.length - 1);
    const y = CHART_H - CHART_PAD - ((value - min) / range) * (CHART_H - CHART_PAD * 2);
    return { x, y, value };
  });
});

const linePointsStr = computed(() =>
  linePoints.value.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" "),
);

const lineTotal = computed(() => dataset.value.revenue.reduce((s, v) => s + v, 0));
const lineLabels = computed(() => dataset.value.labels);

// === Геометрия столбчатого графика ===
const bars = computed(() => {
  const series = dataset.value.orders;
  const max = Math.max(...series);
  const innerH = CHART_H - CHART_PAD * 2;
  const slot = (CHART_W - CHART_PAD * 2) / series.length;
  return series.map((value, i) => {
    const height = Math.max((value / max) * innerH, 3);
    return {
      x: CHART_PAD + i * slot,
      y: CHART_H - CHART_PAD - height,
      height,
    };
  });
});

const barWidth = computed(() => {
  const series = dataset.value.orders;
  const slot = (CHART_W - CHART_PAD * 2) / series.length;
  return Math.max(slot * 0.55, 4);
});

const barAnchors = computed(() => {
  const series = dataset.value.orders;
  const slot = (CHART_W - CHART_PAD * 2) / series.length;
  return series.map((_, i) => ({
    x: CHART_PAD + i * slot + slot / 2,
    y: bars.value[i].y,
  }));
});

const barSeries = computed(() => dataset.value.orders);
const barTotal = computed(() => dataset.value.orders.reduce((s, v) => s + v, 0).toLocaleString("ru-RU"));
const barLabels = computed(() => dataset.value.labels);

// === Форматирование и тултипы ===
const fmtMoney = (value) =>
  new Intl.NumberFormat("ru-RU", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);

const tooltipStyle = (index, anchors) => {
  const point = anchors[index];
  if (!point) return {};
  const pctX = (point.x / CHART_W) * 100;
  const pctY = (point.y / CHART_H) * 100;
  const placeAbove = pctY > 24;
  return {
    left: `${clamp(pctX, 7, 93)}%`,
    top: `${pctY}%`,
    transform: placeAbove ? "translate(-50%, calc(-100% - 10px))" : "translate(-50%, 12px)",
  };
};

// === Действия ===
const setPeriod = (key) => {
  if (periodKey.value === key) return;
  periodKey.value = key;
  lineHover.value = null;
  barHover.value = null;
};

const refreshData = () => {
  if (isRefreshing.value) return;
  isRefreshing.value = true;
  setTimeout(() => {
    seed.value += 1;
    isRefreshing.value = false;
    lineHover.value = null;
    barHover.value = null;
  }, 600);
};
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

/* --- Заголовок и действия --- */
.page-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}

.page-head h2 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.period-switch {
  display: flex;
  gap: 4px;
  background: #f1f5f9;
  border-radius: 10px;
  padding: 4px;
}

.period-btn {
  border: none;
  background: transparent;
  padding: 6px 14px;
  border-radius: 8px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
  cursor: pointer;
  transition: all 0.2s;
}

.period-btn:hover {
  color: #0f172a;
}

.period-btn.active {
  background: #ffffff;
  color: #10b981;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}

.refresh-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid #e2e8f0;
  background: #ffffff;
  color: #0f172a;
  padding: 7px 16px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}

.refresh-btn:hover:not(:disabled) {
  background: #f8fafc;
}

.refresh-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.spinner {
  width: 14px;
  height: 14px;
  border: 2px solid #10b981;
  border-bottom-color: transparent;
  border-radius: 50%;
  animation: spin 0.7s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* --- KPI-карточки --- */
.kpi-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.kpi-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.kpi-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.kpi-title {
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.kpi-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background: #f8fafc;
  color: #0f172a;
}

.kpi-value {
  font-size: 26px;
  font-weight: 700;
  color: #0f172a;
}

.kpi-delta {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
}

.kpi-arrow {
  font-size: 10px;
}

.kpi-hint {
  font-size: 12px;
  font-weight: 400;
  color: #94a3b8;
}

.delta-up {
  color: #15803d;
}

.delta-down {
  color: #b91c1c;
}

/* --- Графики --- */
.chart-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
}

.chart-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-head h3 {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
}

.chart-total {
  font-size: 15px;
  font-weight: 600;
  color: #10b981;
}

.chart {
  position: relative;
}

.chart-svg {
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 3 / 1;
  overflow: visible;
}

.chart-grid-line {
  stroke: #f1f5f9;
  stroke-width: 1;
  vector-effect: non-scaling-stroke;
}

.chart-line {
  stroke: #10b981;
  stroke-width: 2.5;
  vector-effect: non-scaling-stroke;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.chart-dot {
  fill: #ffffff;
  stroke: #10b981;
  stroke-width: 2;
  vector-effect: non-scaling-stroke;
  cursor: pointer;
  transition: fill 0.15s ease;
}

.chart-dot.is-hover,
.chart-dot:hover {
  fill: #10b981;
}

.chart-bar {
  fill: rgba(16, 185, 129, 0.55);
  cursor: pointer;
  transition: fill 0.15s ease;
}

.chart-bar.is-hover,
.chart-bar:hover {
  fill: #10b981;
}

.chart-tooltip {
  position: absolute;
  z-index: 5;
  min-width: 90px;
  padding: 6px 10px;
  background: #0f172a;
  color: #ffffff;
  border-radius: 8px;
  font-size: 12px;
  pointer-events: none;
  text-align: center;
  white-space: nowrap;
  box-shadow: 0 6px 16px -4px rgba(15, 23, 42, 0.4);
}

.tt-label {
  color: #94a3b8;
  margin-bottom: 2px;
}

.tt-value {
  font-weight: 600;
}

/* --- Топ источников --- */
.top-card {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.top-caption {
  font-size: 12px;
  color: #94a3b8;
}

.top-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.top-row {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.top-meta {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.top-name {
  font-size: 14px;
  font-weight: 500;
  color: #0f172a;
}

.top-value {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.top-track {
  height: 8px;
  background: #f1f5f9;
  border-radius: 999px;
  overflow: hidden;
}

.top-fill {
  height: 100%;
  background: linear-gradient(90deg, #10b981, #34d399);
  border-radius: 999px;
  transition: width 0.4s ease;
}

/* --- Адаптивность --- */
@media (max-width: 900px) {
  .chart-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .page-actions {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
