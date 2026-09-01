// src/directives/vTooltip.js

const TOOLTIP_CLASS = "v-tooltip-popup";

export const vTooltip = {
  mounted(el, binding) {
    const tooltip = document.createElement("div");
    tooltip.className = TOOLTIP_CLASS;
    tooltip.textContent = binding.value || "";

    Object.assign(tooltip.style, {
      position: "fixed",
      opacity: "0",
      visibility: "hidden",
      pointerEvents: "none",
      zIndex: "9999",
      // Фиксированный сдвиг по оси X (-50%), меняется только Y
      transform: "translate(-50%, -100%) translateY(-2px)",
    });

    el._tooltip = tooltip;
    el._hideTimer = null;

    el._showTooltip = () => {
      if (!binding.value) return;

      if (el._hideTimer) {
        clearTimeout(el._hideTimer);
        el._hideTimer = null;
      }

      if (!tooltip.parentNode) {
        document.body.appendChild(tooltip);
      }

      const rect = el.getBoundingClientRect();
      tooltip.style.top = `${rect.top}px`;
      tooltip.style.left = `${rect.left + rect.width / 2}px`;

      // Плавное появление по вертикали
      tooltip.style.transition = "opacity 150ms ease-out, transform 150ms ease-out";

      requestAnimationFrame(() => {
        tooltip.style.opacity = "1";
        tooltip.style.visibility = "visible";
        tooltip.style.transform = "translate(-50%, -100%) translateY(-8px)";
      });
    };

    el._hideTooltip = () => {
      tooltip.style.transition = "opacity 150ms ease-in";
      tooltip.style.opacity = "0";
      tooltip.style.visibility = "hidden";

      if (el._hideTimer) clearTimeout(el._hideTimer);

      el._hideTimer = setTimeout(() => {
        if (tooltip.parentNode) {
          tooltip.parentNode.removeChild(tooltip);
        }
        el._hideTimer = null;
      }, 150);
    };

    el.addEventListener("mouseenter", el._showTooltip);
    el.addEventListener("mouseleave", el._hideTooltip);
    el.addEventListener("focusin", el._showTooltip);
    el.addEventListener("focusout", el._hideTooltip);
  },

  updated(el, binding) {
    if (el._tooltip) {
      el._tooltip.textContent = binding.value || "";
    }
  },

  unmounted(el) {
    if (el._tooltip) {
      if (el._hideTimer) clearTimeout(el._hideTimer);
      if (el._tooltip.parentNode) {
        el._tooltip.parentNode.removeChild(el._tooltip);
      }
      el.removeEventListener("mouseenter", el._showTooltip);
      el.removeEventListener("mouseleave", el._hideTooltip);
      el.removeEventListener("focusin", el._showTooltip);
      el.removeEventListener("focusout", el._hideTooltip);
      delete el._tooltip;
      delete el._hideTimer;
      delete el._showTooltip;
      delete el._hideTooltip;
    }
  },
};
