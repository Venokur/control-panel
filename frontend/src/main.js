import "./assets/main.css";

import { createApp } from "vue";
import { createPinia } from "pinia";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

app.use(createPinia());
app.use(router);

// Монтируем приложение только после готовности роутера
router.isReady().then(() => {
  app.mount("#app");
});
