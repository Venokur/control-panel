import { ref, shallowRef, computed, onMounted, onUnmounted, watch, nextTick } from "vue";
import { compileFilterConfig, validateRow, sortArray, binaryInsert, hasActiveFilter } from "@/helpers/tableFilter";

const CHUNK_SIZE = 5000;
const CHUNK_THRESHOLD = 2000;
const MAX_HIGHLIGHT_BATCH = 500;
const MAX_SORTED_INSERT_BATCH = 100;

export function useVirtualTable(props, { cardRef, containerRef }) {
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

  let chunkTaskActive = false;
  let activeChunkTaskId = 0;

  let isProgrammaticScrolling = false;
  let programmaticScrollTimer = null;

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

  const compiledFilterConfig = computed(() => compileFilterConfig(props.filters));

  const hasActiveFilters = computed(() => hasActiveFilter(compiledFilterConfig.value));

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
      visibleData: list.slice(start, end),
      offsetY: start * rowH,
    };
  });

  const clearProgrammaticTimer = () => {
    if (programmaticScrollTimer) {
      clearTimeout(programmaticScrollTimer);
      programmaticScrollTimer = null;
    }
  };

  const endProgrammaticScroll = () => {
    isProgrammaticScrolling = false;
    clearProgrammaticTimer();
    if (isAutoScrollEnabled.value) {
      const el = containerRef.value;
      if (el) {
        const dist = el.scrollHeight - el.clientHeight - el.scrollTop;
        if (dist > props.followTolerance) {
          isAutoScrollEnabled.value = false;
        }
      }
    }
  };

  const scrollToBottom = (forceInstant = false) => {
    nextTick(() => {
      const el = containerRef.value;
      if (!el) return;

      const targetTop = el.scrollHeight - el.clientHeight;
      if (targetTop <= 0) return;

      if (forceInstant) {
        el.scrollTop = targetTop;
        scrollTop.value = targetTop;
        return;
      }

      isProgrammaticScrolling = true;
      const onEnd = () => endProgrammaticScroll();
      el.addEventListener("scrollend", onEnd, { once: true });
      programmaticScrollTimer = setTimeout(() => {
        el.removeEventListener("scrollend", onEnd);
        endProgrammaticScroll();
      }, 3000);
      el.scrollTo({
        top: targetTop,
        behavior: "smooth",
      });
    });
  };

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

  const scheduleChunk = (fn) => {
    if (typeof window !== "undefined" && window.requestIdleCallback) {
      window.requestIdleCallback(fn, { timeout: 30 });
    } else {
      setTimeout(fn, 0);
    }
  };

  const finishChunk = (finalArr) => {
    chunkTaskActive = false;
    activeChunkTaskId = 0;
    processedData.value = finalArr;
    isLoading.value = false;
    if (isAutoScrollEnabled.value) {
      scrollToBottom(true);
    }
  };

  const runAsyncProcessing = (isSilent = false) => {
    const taskId = ++currentTaskId;
    const source = props.data || [];
    const config = compiledFilterConfig.value;
    const cols = props.columns || [];
    const total = source.length;
    const activeSortKey = sortKey.value;
    const activeSortOrder = sortOrder.value;
    const isFiltering = hasActiveFilter(config);

    if (!isSilent) {
      isLoading.value = true;
    }

    if (total === 0) {
      chunkTaskActive = false;
      activeChunkTaskId = 0;
      processedData.value = [];
      isLoading.value = false;
      return;
    }

    if (!isFiltering && !activeSortKey) {
      chunkTaskActive = false;
      activeChunkTaskId = 0;
      processedData.value = source.slice();
      isLoading.value = false;
      return;
    }

    if (total < CHUNK_THRESHOLD) {
      let res = isFiltering ? source.filter((row) => validateRow(row, config, cols)) : source.slice();
      if (activeSortKey && activeSortOrder) {
        res = sortArray(res, activeSortKey, activeSortOrder === "asc");
      }
      chunkTaskActive = false;
      activeChunkTaskId = 0;
      processedData.value = res;
      isLoading.value = false;
      return;
    }

    chunkTaskActive = true;
    activeChunkTaskId = taskId;

    let index = 0;
    const result = [];

    const processChunk = () => {
      if (taskId !== currentTaskId) {
        if (chunkTaskActive && activeChunkTaskId === taskId) {
          chunkTaskActive = false;
          activeChunkTaskId = 0;
        }
        return;
      }

      // Данные обнулили во время фоновой задачи — состояние уже выставлено watcher'ом
      const dataNow = props.data;
      if (!dataNow || dataNow.length === 0) {
        chunkTaskActive = false;
        activeChunkTaskId = 0;
        return;
      }

      const len = dataNow.length;
      const end = Math.min(index + CHUNK_SIZE, len);
      for (; index < end; index++) {
        const row = dataNow[index];
        if (!isFiltering || validateRow(row, config, cols)) {
          result.push(row);
        }
      }

      if (index < len) {
        scheduleChunk(processChunk);
        return;
      }

      let finalArr = result;
      if (activeSortKey && activeSortOrder) {
        finalArr = sortArray(result, activeSortKey, activeSortOrder === "asc");
      }
      finishChunk(finalArr);
    };

    scheduleChunk(processChunk);
  };

  const formatValue = (val) => {
    if (typeof val === "object" && val !== null) {
      return val.label ?? val.name ?? val.text ?? JSON.stringify(val);
    }
    return val;
  };

  const onScroll = () => {
    if (isTicking) return;
    isTicking = true;
    rafId = requestAnimationFrame(() => {
      isTicking = false;
      rafId = null;

      const el = containerRef.value;
      if (!el) return;

      scrollTop.value = el.scrollTop;
      if (!isAutoScrollEnabled.value) return;

      const dist = el.scrollHeight - el.clientHeight - el.scrollTop;

      if (isProgrammaticScrolling) {
        if (dist <= props.followTolerance) {
          isProgrammaticScrolling = false;
          clearProgrammaticTimer();
        }
        return;
      }

      if (dist > props.followTolerance) {
        isAutoScrollEnabled.value = false;
      }
    });
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
    if (isAutoScrollEnabled.value) {
      runAsyncProcessing(true);
      scrollToBottom(true);
    } else {
      if (containerRef.value) {
        containerRef.value.scrollTop = 0;
        scrollTop.value = 0;
      }
      runAsyncProcessing(false);
    }
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

      if (!isAppendedOnly) {
        runAsyncProcessing(true);
        return;
      }

      const addedItems = newData.slice(prevLength);
      const config = compiledFilterConfig.value;
      const cols = props.columns || [];
      const isFiltering = hasActiveFilter(config);

      const validAppends = !isFiltering ? addedItems : addedItems.filter((item) => validateRow(item, config, cols));

      if (validAppends.length > 0 && validAppends.length <= MAX_HIGHLIGHT_BATCH) {
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

      // Фоновая чанковая задача уже сканирует «живой» массив и подхватит добавленные строки
      if (chunkTaskActive) return;

      if (validAppends.length > 0) {
        if (!sortKey.value) {
          processedData.value = processedData.value.concat(validAppends);
        } else if (validAppends.length <= MAX_SORTED_INSERT_BATCH) {
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
    clearProgrammaticTimer();
    activeHighlightTimers.forEach((timer) => clearTimeout(timer));
    activeHighlightTimers.clear();
  });

  return {
    scrollTop,
    containerHeight,
    containerWidth,
    scrollbarWidth,
    sortKey,
    sortOrder,
    isAutoScrollEnabled,
    isLoading,
    newRowKeys,
    processedData,
    isMobile,
    currentRowHeight,
    rootCardStyle,
    compiledFilterConfig,
    hasActiveFilters,
    totalHeight,
    virtualState,
    formatValue,
    toggleAutoScroll,
    handleSort,
    resetSort,
    onScroll,
  };
}
