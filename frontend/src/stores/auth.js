import { defineStore } from 'pinia';
import { loginUser, getMe } from '@/helpers/auth';

const TOKEN_KEY = 'token';
const USER_KEY = 'user';

// Безопасное чтение пользователя из localStorage (невалидный JSON не роняет стор)
function loadStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(USER_KEY)) || null;
  } catch {
    return null;
  }
}

function saveSession(token, user) {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem(TOKEN_KEY) || null,
    user: loadStoredUser(),
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    async login(credentials) {
      const data = await loginUser(credentials);
      const user = { email: data.email };

      this.token = data.access_token;
      this.user = user;
      this.isInitialized = true;
      saveSession(data.access_token, user);

      return data;
    },

    // Валидация токена на сервере. true — сессия подтверждена,
    // false — токена не было, иначе выбрасывает ошибку после logout.
    async checkAuth() {
      if (!this.token) {
        this.logout();
        return false;
      }

      try {
        const userData = await getMe();
        this.user = userData;
        this.isInitialized = true;
        saveSession(this.token, userData);
        return true;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isInitialized = false;
      clearSession();
    },
  },
});
