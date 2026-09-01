import { defineStore } from 'pinia';
import { loginUser, getMe } from '@/helpers/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    user: JSON.parse(localStorage.getItem('user')) || null,
    isInitialized: false,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
  },

  actions: {
    login(credentials) {
      return loginUser(credentials).then((data) => {
        this.token = data.access_token;
        this.user = { email: data.email };
        localStorage.setItem('token', data.access_token);
        localStorage.setItem('user', JSON.stringify(this.user));
        return data;
      });
    },

    // Метод валидации токена на сервере
    async checkAuth() {
      if (!this.token) {
        this.logout();
        return false;
      }
      try {
        const userData = await getMe();
        this.user = userData;
        localStorage.setItem('user', JSON.stringify(userData));
        this.isInitialized = true;
        return true;
      } catch {
        this.logout();
        return false;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.isInitialized = false;
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
  },
});