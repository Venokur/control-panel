import api from "./api";

/**
 * Функция авторизации через Promise
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>}
 */
export function loginUser({ email, password }) {
  return new Promise((resolve, reject) => {
    if (!email || !password) {
      return reject(new Error("Email и пароль обязательны для заполнения"));
    }

    setTimeout(() => {
      api
        .post("/api/auth/login", { email, password })
        .then((response) => {
          resolve(response.data);
        })
        .catch((error) => {
          let message = "Ошибка соединения с сервером";

          const detail = error.response?.data?.detail;

          if (typeof detail === "string") {
            // Стандартная ошибка 401: "Неверный email или пароль"
            message = detail;
          } else if (Array.isArray(detail) && detail.length > 0) {
            // Ошибки валидации Pydantic (422 Unprocessable Entity)
            message = detail.map((err) => err.msg || JSON.stringify(err)).join(", ");
          } else if (error.message) {
            message = error.message;
          }

          reject(new Error(message));
        });
    }, 250);
  });
}

/**
 * Проверяет валидность токена на сервере и возвращает данные пользователя
 * @returns {Promise<Object>}
 */
export function getMe() {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
    api
      .get("/api/auth/me")
      .then((response) => resolve(response.data))
      .catch((error) => {
        reject(error);
      });
    }, 250);
  });
}
