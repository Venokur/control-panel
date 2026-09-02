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
    <div
      ref="containerRef"
      class="table-body-wrapper"
      :class="{ 'is-mobile-body': isMobile }"
      @scroll.passive="onScroll"
      @wheel.passive="handleUserInteraction"
      @touchmove.passive="handleUserInteraction"
      @pointerdown.passive="handleUserInteraction"
    >
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
import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from "vue";

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
});

const cardRef = ref(null);
const containerRef = ref(null);

const scrollTop = ref(0);
const containerHeight = ref(500);
const containerWidth = ref(1024);
const scrollbarWidth = ref(0);

const sortKey = ref(null);
const sortOrder = ref(null);
const isAutoScrollEnabled = ref(false);
const isLoading = ref(true);

const newRowKeys = shallowRef(new Set());
const processedData = shallowRef([]);
const activeHighlightTimers = new Set();

let isTicking = false;
let resizeObserver = null;
let rafId = null;
let currentTaskId = 0;
let previousSourceRef = null;
let previousDataLength = 0;

const stringCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

const isMobile = computed(() => containerWidth.value < props.mobileBreakpoint);
const currentRowHeight = computed(() => (isMobile.value ? props.mobileRowHeight : props.rowHeight));

const rootCardStyle = computed(() => {
  const base = {
    "--highlight-duration": `${props.highlightDuration}ms`,
  };

  if (props.height !== null && props.height !== undefined) {
    base.height = typeof props.height === "number" ? `${props.height}px` : props.height;
    base.minHeight = "0";
    base.flex = "1 1 auto";
  } else {
    base.height = "100%";
    base.minHeight = "350px";
    base.maxHeight = "calc(100dvh - 20px)";
  }

  return base;
});

const totalHeight = computed(() => processedData.value.length * currentRowHeight.value);

const virtualState = computed(() => {
  const list = processedData.value;
  const total = list.length;
  const rowH = currentRowHeight.value;
  const currentScrollTop = scrollTop.value;
  const validHeight = containerHeight.value > 0 ? containerHeight.value : 500;

  const start = Math.max(0, Math.floor(currentScrollTop / rowH) - props.buffer);
  const visibleCount = Math.ceil(validHeight / rowH);
  const end = Math.min(total, Math.floor(currentScrollTop / rowH) + visibleCount + props.buffer);

  return {
    startIndex: start,
    endIndex: end,
    visibleData: list.slice(start, end),
    offsetY: start * rowH,
  };
});

const resetSort = () => {
  sortKey.value = null;
  sortOrder.value = null;
};

const toggleAutoScroll = () => {
  isAutoScrollEnabled.value = !isAutoScrollEnabled.value;
  if (isAutoScrollEnabled.value) {
    resetSort();
    scrollToBottom(false);
  }
};

const scrollToBottom = (forceInstant = false) => {
  nextTick(() => {
    if (!containerRef.value) return;
    const el = containerRef.value;
    const targetTop = el.scrollHeight - el.clientHeight;

    if (targetTop <= 0) return;

    if (forceInstant) {
      el.scrollTop = targetTop;
      scrollTop.value = targetTop;
    } else {
      el.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    }
  });
};

const handleUserInteraction = () => {
  if (isAutoScrollEnabled.value) {
    isAutoScrollEnabled.value = false;
  }
};

const handleSort = (key) => {
  if (isAutoScrollEnabled.value || isLoading.value) return;

  if (sortKey.value !== key) {
    sortKey.value = key;
    sortOrder.value = "asc";
  } else if (sortOrder.value === "asc") {
    sortOrder.value = "desc";
  } else {
    resetSort();
  }
};

const getRawVal = (item, key) => {
  if (!item) return "";
  const val = item[key];
  if (val && typeof val === "object") {
    return val.label ?? val.name ?? val.text ?? "";
  }
  return val ?? "";
};

const evalCondition = (rawVal, rule, row) => {
  if (rule.isCustom) {
    return rule.fn(rawVal, row);
  }

  let _str = null;
  const getStr = () => (_str !== null ? _str : (_str = String(rawVal ?? "").toLowerCase()));

  let _num = null;
  let _isNum = null;
  const parseNum = () => {
    if (_isNum === null) {
      const parsed = Number(rawVal);
      _isNum = !isNaN(parsed) && String(rawVal).trim() !== "";
      _num = _isNum ? parsed : NaN;
    }
  };

  switch (rule.op) {
    case "contains":
    case "includes":
      return getStr().includes(rule.lowerStr);

    case "notContains":
    case "!contains":
      return !getStr().includes(rule.lowerStr);

    case "equals":
    case "eq":
    case "==":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num === rule.numVal;
      }
      return getStr() === rule.lowerStr;

    case "notEquals":
    case "neq":
    case "!=":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num !== rule.numVal;
      }
      return getStr() !== rule.lowerStr;

    case "startsWith":
      return getStr().startsWith(rule.lowerStr);

    case "endsWith":
      return getStr().endsWith(rule.lowerStr);

    case "gt":
    case ">":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num > rule.numVal;
      }
      return rawVal > rule.origVal;

    case "gte":
    case ">=":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num >= rule.numVal;
      }
      return rawVal >= rule.origVal;

    case "lt":
    case "<":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num < rule.numVal;
      }
      return rawVal < rule.origVal;

    case "lte":
    case "<=":
      if (rule.isNum) {
        parseNum();
        if (_isNum) return _num <= rule.numVal;
      }
      return rawVal <= rule.origVal;

    default:
      return getStr().includes(rule.lowerStr);
  }
};

const createRuleObj = (op, val, fn) => {
  const operator = op || "contains";
  const isCustom = operator === "custom" && typeof fn === "function";
  const strVal = String(val);
  const numVal = Number(val);
  const isNum = !isNaN(numVal) && strVal.trim() !== "";

  return {
    op: operator,
    origVal: val,
    lowerStr: strVal.toLowerCase(),
    numVal: isNum ? numVal : NaN,
    isNum,
    isCustom,
    fn,
  };
};

const compiledFilterConfig = computed(() => {
  if (!props.filters || !Array.isArray(props.filters) || props.filters.length === 0) {
    return { columnGroups: [], globalRules: [] };
  }

  const groupMap = new Map();
  const globalRules = [];

  const addRule = (key, op, val, fn) => {
    if (!key || val === undefined || val === null || val === "") return;

    const ruleObj = createRuleObj(op, val, fn);

    if (key === "*" || key.toLowerCase() === "global") {
      globalRules.push(ruleObj);
      return;
    }

    let group = groupMap.get(key);
    if (!group) {
      group = { key, matchRules: [], boundaryRules: [] };
      groupMap.set(key, group);
    }

    if (["contains", "includes", "equals", "eq", "==", "startsWith", "endsWith"].includes(ruleObj.op)) {
      group.matchRules.push(ruleObj);
    } else {
      group.boundaryRules.push(ruleObj);
    }
  };

  const len = props.filters.length;
  for (let i = 0; i < len; i++) {
    const item = props.filters[i];
    if (!item || !item.key) continue;

    if (Array.isArray(item.rules)) {
      const rLen = item.rules.length;
      for (let j = 0; j < rLen; j++) {
        const r = item.rules[j];
        if (r) addRule(item.key, r.operator, r.value, r.fn);
      }
    } else {
      addRule(item.key, item.operator, item.value, item.fn);
    }
  }

  return {
    columnGroups: Array.from(groupMap.values()),
    globalRules,
  };
});

const hasActiveFilters = computed(() => {
  const { columnGroups, globalRules } = compiledFilterConfig.value;
  return columnGroups.length > 0 || globalRules.length > 0;
});

const validateRow = (row, config, cols) => {
  const { columnGroups, globalRules } = config;

  const groupsLen = columnGroups.length;
  for (let g = 0; g < groupsLen; g++) {
    const group = columnGroups[g];
    const rawVal = getRawVal(row, group.key);

    const mRules = group.matchRules;
    const mLen = mRules.length;
    if (mLen > 0) {
      let matchPassed = false;
      for (let m = 0; m < mLen; m++) {
        if (evalCondition(rawVal, mRules[m], row)) {
          matchPassed = true;
          break;
        }
      }
      if (!matchPassed) return false;
    }

    const bRules = group.boundaryRules;
    const bLen = bRules.length;
    if (bLen > 0) {
      for (let b = 0; b < bLen; b++) {
        if (!evalCondition(rawVal, bRules[b], row)) {
          return false;
        }
      }
    }
  }

  const gLen = globalRules.length;
  if (gLen > 0) {
    const colsLen = cols.length;
    for (let r = 0; r < gLen; r++) {
      const rule = globalRules[r];
      let ruleMatchedAnyCol = false;

      for (let c = 0; c < colsLen; c++) {
        const rawVal = getRawVal(row, cols[c].key);
        if (evalCondition(rawVal, rule, row)) {
          ruleMatchedAnyCol = true;
          break;
        }
      }

      if (!ruleMatchedAnyCol) return false;
    }
  }

  return true;
};

const compareRowValues = (aVal, bVal, isAsc) => {
  let res = 0;
  if (typeof aVal === "number" && typeof bVal === "number") {
    res = aVal - bVal;
  } else if (typeof aVal === "string" && typeof bVal === "string") {
    res = stringCollator.compare(aVal, bVal);
  } else {
    if (aVal < bVal) res = -1;
    else if (aVal > bVal) res = 1;
  }
  return isAsc ? res : -res;
};

const sortArray = (arr, key, isAsc) => {
  return [...arr].sort((a, b) => {
    const aVal = getRawVal(a, key);
    const bVal = getRawVal(b, key);
    return compareRowValues(aVal, bVal, isAsc);
  });
};

const binaryInsert = (targetArr, item, key, isAsc) => {
  const itemVal = getRawVal(item, key);
  let low = 0;
  let high = targetArr.length;

  while (low < high) {
    const mid = (low + high) >>> 1;
    const midVal = getRawVal(targetArr[mid], key);
    if (compareRowValues(itemVal, midVal, isAsc) >= 0) {
      low = mid + 1;
    } else {
      high = mid;
    }
  }
  targetArr.splice(low, 0, item);
};

const runAsyncProcessing = (isSilent = false) => {
  const taskId = ++currentTaskId;
  const source = props.data || [];
  const config = compiledFilterConfig.value;
  const cols = props.columns || [];
  const total = source.length;
  const activeSortKey = sortKey.value;
  const activeSortOrder = sortOrder.value;
  const isFiltering = config.columnGroups.length > 0 || config.globalRules.length > 0;

  if (!isSilent) {
    isLoading.value = true;
  }

  if (total === 0) {
    processedData.value = [];
    isLoading.value = false;
    return;
  }

  if (!isFiltering && !activeSortKey) {
    processedData.value = source.slice();
    isLoading.value = false;
    return;
  }

  if (total < 2000) {
    let res = isFiltering ? source.filter((row) => validateRow(row, config, cols)) : source.slice();
    if (activeSortKey && activeSortOrder) {
      res = sortArray(res, activeSortKey, activeSortOrder === "asc");
    }
    processedData.value = res;
    isLoading.value = false;
    return;
  }

  const CHUNK_SIZE = 5000;
  let index = 0;
  const result = [];

  const processChunk = () => {
    if (taskId !== currentTaskId) return;

    const end = Math.min(index + CHUNK_SIZE, total);
    for (; index < end; index++) {
      const row = source[index];
      if (!isFiltering || validateRow(row, config, cols)) {
        result.push(row);
      }
    }

    if (index < total) {
      if (typeof window !== "undefined" && window.requestIdleCallback) {
        window.requestIdleCallback(processChunk, { timeout: 30 });
      } else {
        setTimeout(processChunk, 0);
      }
    } else {
      let finalArr = result;
      if (activeSortKey && activeSortOrder) {
        finalArr = sortArray(result, activeSortKey, activeSortOrder === "asc");
      }
      processedData.value = finalArr;
      isLoading.value = false;
    }
  };

  processChunk();
};

const formatValue = (val) => {
  if (typeof val === "object" && val !== null) {
    return val.label ?? val.name ?? val.text ?? JSON.stringify(val);
  }
  return val;
};

const onScroll = () => {
  if (!isTicking) {
    isTicking = true;
    rafId = requestAnimationFrame(() => {
      if (containerRef.value) {
        scrollTop.value = containerRef.value.scrollTop;
      }
      isTicking = false;
    });
  }
};

const updateMetrics = () => {
  if (cardRef.value) {
    containerWidth.value = cardRef.value.clientWidth;
  }
  if (containerRef.value) {
    const h = containerRef.value.clientHeight;
    if (h > 0) {
      containerHeight.value = h;
    }
    scrollbarWidth.value = containerRef.value.offsetWidth - containerRef.value.clientWidth;
  }
};

watch([compiledFilterConfig, sortKey, sortOrder], () => {
  if (containerRef.value) {
    containerRef.value.scrollTop = 0;
    scrollTop.value = 0;
  }
  runAsyncProcessing(false);
});

// Отслеживание изменений данных (и смены ссылки, и push мутаций через length)
watch(
  [() => props.data, () => props.data?.length],
  ([newData, newLen = 0]) => {
    const isSameArray = previousSourceRef === newData;
    const isAppendedOnly = isSameArray && newLen > previousDataLength && previousDataLength > 0;

    const prevLength = previousDataLength;
    previousSourceRef = newData;
    previousDataLength = newLen;

    if (!newData || newLen === 0) {
      processedData.value = [];
      isLoading.value = false;
      return;
    }

    if (isAppendedOnly) {
      const addedItems = newData.slice(prevLength);
      const config = compiledFilterConfig.value;
      const cols = props.columns || [];
      const isFiltering = config.columnGroups.length > 0 || config.globalRules.length > 0;

      const validAppends = !isFiltering
        ? addedItems
        : addedItems.filter((item) => validateRow(item, config, cols));

      if (validAppends.length > 0 && validAppends.length <= 500) {
        const addedIds = [];
        const currentHighlightSet = new Set(newRowKeys.value);
        for (let i = 0; i < validAppends.length; i++) {
          const id = validAppends[i][props.rowKey];
          if (id !== undefined && id !== null) {
            addedIds.push(id);
            currentHighlightSet.add(id);
          }
        }

        if (addedIds.length > 0) {
          newRowKeys.value = currentHighlightSet;

          const timerId = setTimeout(() => {
            const updated = new Set(newRowKeys.value);
            for (let i = 0; i < addedIds.length; i++) {
              updated.delete(addedIds[i]);
            }
            newRowKeys.value = updated;
            activeHighlightTimers.delete(timerId);
          }, props.highlightDuration);

          activeHighlightTimers.add(timerId);
        }
      }

      if (validAppends.length > 0) {
        if (!sortKey.value) {
          processedData.value = processedData.value.concat(validAppends);
        } else if (validAppends.length <= 100) {
          const nextArr = processedData.value.slice();
          const isAsc = sortOrder.value === "asc";
          for (let i = 0; i < validAppends.length; i++) {
            binaryInsert(nextArr, validAppends[i], sortKey.value, isAsc);
          }
          processedData.value = nextArr;
        } else {
          runAsyncProcessing(true);
        }
      }

      if (isAutoScrollEnabled.value) {
        scrollToBottom(true);
      }
    } else {
      runAsyncProcessing(true);
    }
  },
  { flush: "sync" }
);

onMounted(() => {
  previousSourceRef = props.data;
  previousDataLength = props.data ? props.data.length : 0;
  runAsyncProcessing(false);
  updateMetrics();
  if (cardRef.value) {
    resizeObserver = new ResizeObserver(() => {
      requestAnimationFrame(() => updateMetrics());
    });
    resizeObserver.observe(cardRef.value);
  }
});

onUnmounted(() => {
  currentTaskId++;
  if (resizeObserver) resizeObserver.disconnect();
  if (rafId) cancelAnimationFrame(rafId);
  activeHighlightTimers.forEach((timer) => clearTimeout(timer));
  activeHighlightTimers.clear();
});
</script>

<style scoped>
.virtual-table-card {
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
  height: 48px;
  z-index: 2;
}

.table-body-wrapper {
  position: absolute;
  top: 48px;
  bottom: 40px;
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
  top: 48px;
  bottom: 40px;
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
  height: 40px;
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