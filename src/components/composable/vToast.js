import { reactive } from "vue";

const state = reactive({
  toasts: [],
});

let count = 0;

export const useToast = () => {
  const add = (options) => {
    const id = ++count;
    const position = options.position || "top-right";

    const toast = {
      id,
      title: options.title || "Successfully completed",
      message: options.message || "",
      position,
      duration: options.duration ?? 5000,
    };

    state.toasts.push(toast);

    // При превышении 3-х слоев удаляем самый ранний тост
    const activeInPos = state.toasts.filter((t) => t.position === position);
    if (activeInPos.length > 3) {
      remove(activeInPos[0].id);
    }

    if (toast.duration > 0) {
      setTimeout(() => {
        remove(id);
      }, toast.duration);
    }
  };

  const remove = (id) => {
    const index = state.toasts.findIndex((t) => t.id === id);
    if (index !== -1) {
      state.toasts.splice(index, 1);
    }
  };

  return {
    add,
    remove,
    toasts: state.toasts,
  };
};
