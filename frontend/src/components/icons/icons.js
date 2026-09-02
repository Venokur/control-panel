import { defineComponent, h } from "vue";

// Линейные иконки (viewBox 0 0 24 24), наследуют цвет и ширину штриха
const lineIconProps = {
  size: { type: Number, default: 20 },
  strokeWidth: { type: Number, default: 2 },
};

const createIcon = (name, children) =>
  defineComponent({
    name,
    props: lineIconProps,
    inheritAttrs: false,
    setup(props, { attrs }) {
      return () =>
        h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: props.size,
            height: props.size,
            viewBox: "0 0 24 24",
            fill: "none",
            stroke: "currentColor",
            "stroke-width": props.strokeWidth,
            "stroke-linecap": "round",
            "stroke-linejoin": "round",
            class: attrs.class,
            "aria-hidden": "true",
          },
          children,
        );
    },
  });

// Логотипы и другие нестандартные SVG с произвольным viewBox
const createCustomIcon = (name, viewBox, children, defaultSize) =>
  defineComponent({
    name,
    props: {
      size: { type: Number, default: defaultSize || 24 },
    },
    inheritAttrs: false,
    setup(props, { attrs }) {
      return () =>
        h(
          "svg",
          {
            xmlns: "http://www.w3.org/2000/svg",
            width: props.size,
            height: props.size,
            viewBox,
            class: attrs.class,
            "aria-hidden": "true",
          },
          children,
        );
    },
  });

// --- Иконки меню ---
export const IconHome = createIcon("IconHome", [
  h("path", { d: "m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" }),
  h("polyline", { points: "9 22 9 12 15 12 15 22" }),
]);

export const IconAnalytics = createIcon("IconAnalytics", [
  h("line", { x1: 18, y1: 20, x2: 18, y2: 10 }),
  h("line", { x1: 12, y1: 20, x2: 12, y2: 4 }),
  h("line", { x1: 6, y1: 20, x2: 6, y2: 14 }),
]);

export const IconProjects = createIcon("IconProjects", [
  h("path", {
    d: "M20 20a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.9a2 2 0 0 1-1.69-.9L9.6 3.9A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2z",
  }),
]);

export const IconSettings = createIcon("IconSettings", [
  h("circle", { cx: 12, cy: 12, r: 3 }),
  h("path", {
    d: "M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z",
  }),
]);

export const IconUsers = createIcon("IconUsers", [
  h("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
  h("circle", { cx: 9, cy: 7, r: 4 }),
  h("path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }),
  h("path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }),
]);

export const IconDollar = createIcon("IconDollar", [
  h("line", { x1: 12, y1: 1, x2: 12, y2: 23 }),
  h("path", { d: "M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" }),
]);

export const IconCart = createIcon("IconCart", [
  h("circle", { cx: 9, cy: 21, r: 1 }),
  h("circle", { cx: 20, cy: 21, r: 1 }),
  h("path", { d: "M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" }),
]);

export const IconTrend = createIcon("IconTrend", [
  h("polyline", { points: "23 6 13.5 15.5 8.5 10.5 1 18" }),
  h("polyline", { points: "17 6 23 6 23 12" }),
]);

// --- Иконки интерфейса ---
export const IconMenu = createIcon("IconMenu", [
  h("line", { x1: 4, x2: 20, y1: 12, y2: 12 }),
  h("line", { x1: 4, x2: 20, y1: 6, y2: 6 }),
  h("line", { x1: 4, x2: 20, y1: 18, y2: 18 }),
]);

export const IconLogoVue = createCustomIcon(
  "IconLogoVue",
  "0 0 128 128",
  [
    h("path", { fill: "#42b883", d: "M78.8,10L64,35.4L49.2,10H0l64,110L128,10H78.8z" }),
    h("path", { fill: "#35495e", d: "M78.8,10L64,35.4L49.2,10H25.6L64,76.7L102.4,10H78.8z" }),
  ],
  24,
);

export const IconSearch = createIcon("IconSearch", [
  h("circle", { cx: 11, cy: 11, r: 8 }),
  h("path", { d: "m21 21-4.3-4.3" }),
]);

export const IconBell = createIcon("IconBell", [
  h("path", { d: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" }),
  h("path", { d: "M10.3 21a1.94 1.94 0 0 0 3.4 0" }),
]);

export const IconPlus = createIcon("IconPlus", [
  h("path", { d: "M5 12h14" }),
  h("path", { d: "M12 5v14" }),
]);

export const IconUpload = createIcon("IconUpload", [
  h("path", { d: "M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" }),
  h("polyline", { points: "17 8 12 3 7 8" }),
  h("line", { x1: 12, x2: 12, y1: 3, y2: 15 }),
]);

export const IconUserPlus = createIcon("IconUserPlus", [
  h("path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }),
  h("circle", { cx: 9, cy: 7, r: 4 }),
  h("line", { x1: 19, x2: 19, y1: 8, y2: 14 }),
  h("line", { x1: 22, x2: 16, y1: 11, y2: 11 }),
]);

export const IconClose = createIcon("IconClose", [
  h("line", { x1: 18, y1: 6, x2: 6, y2: 18 }),
  h("line", { x1: 6, y1: 6, x2: 18, y2: 18 }),
]);

export const IconTable = createIcon("IconTable", [
  h("rect", { width: "18", height: "18", x: "3", y: "3", rx: "2", ry: "2" }),
  h("path", { d: "M3 9h18" }),
  h("path", { d: "M9 21V9" }),
]);
