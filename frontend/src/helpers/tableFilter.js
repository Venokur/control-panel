const stringCollator = new Intl.Collator(undefined, { numeric: true, sensitivity: "base" });

export function getRawVal(item, key) {
  if (!item) return "";
  const val = item[key];
  if (val && typeof val === "object") {
    return val.label ?? val.name ?? val.text ?? "";
  }
  return val ?? "";
}

function evalCondition(rawVal, rule, row) {
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
}

function createRuleObj(op, val, fn) {
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
}

const MATCH_OPS = new Set(["contains", "includes", "equals", "eq", "==", "startsWith", "endsWith"]);

export function compileFilterConfig(filters) {
  if (!filters || !Array.isArray(filters) || filters.length === 0) {
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

    if (MATCH_OPS.has(ruleObj.op)) {
      group.matchRules.push(ruleObj);
    } else {
      group.boundaryRules.push(ruleObj);
    }
  };

  const len = filters.length;
  for (let i = 0; i < len; i++) {
    const item = filters[i];
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
}

export function hasActiveFilter(config) {
  return config.columnGroups.length > 0 || config.globalRules.length > 0;
}

export function validateRow(row, config, cols) {
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
}

export function compareRowValues(aVal, bVal, isAsc) {
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
}

export function sortArray(arr, key, isAsc) {
  return [...arr].sort((a, b) => {
    const aVal = getRawVal(a, key);
    const bVal = getRawVal(b, key);
    return compareRowValues(aVal, bVal, isAsc);
  });
}

export function binaryInsert(targetArr, item, key, isAsc) {
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
}
