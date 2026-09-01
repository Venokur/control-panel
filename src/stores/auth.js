import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useAuthStore = defineStore("auth", () => {
  const user = ref(null);
  const token = ref(localStorage.getItem("token") || "");

  const isAuthenticated = computed(() => !!token.value);

  async function login(credentials) {
    // Симуляция выполнения запроса к API
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (credentials.email === "admin@example.com" && credentials.password === "123456") {
          const fakeToken = "jwt-token-example-123";
          const userData = { id: 1, email: credentials.email, name: "Администратор" };

          token.value = fakeToken;
          user.value = userData;
          localStorage.setItem("token", fakeToken);

          resolve(userData);
        } else {
          reject(new Error("Неверный email или пароль"));
        }
      }, 250);
    });
  }

  function logout() {
    token.value = "";
    user.value = null;
    localStorage.removeItem("token");
  }

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
  };
});
