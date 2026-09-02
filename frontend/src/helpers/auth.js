import api from "./api";

/**
 * Извлекает человекочитаемое сообщение об ошибке из ответа сервера.
 * Обрабатывает стандартные 401 и ошибки валидации Pydantic (422).
 * @param {Error} error
 * @returns {string}
 */
function getErrorMessage(error) {
  const detail = error.response?.data?.detail;

  if (typeof detail === "string") {
    // Стандартная ошибка 401: "Неверный email или пароль"
    return detail;
  }

  if (Array.isArray(detail) && detail.length > 0) {
    // Ошибки валидации Pydantic (422 Unprocessable Entity)
    return detail.map((err) => err.msg || JSON.stringify(err)).join(", ");
  }

  return error.message || "Ошибка соединения с сервером";
}

/**
 * Функция авторизации.
 * @param {Object} credentials - { email, password }
 * @returns {Promise<Object>}
 */
export async function loginUser({ email, password }) {
  if (!email || !password) {
    throw new Error("Email и пароль обязательны для заполнения");
  }

  try {
    const response = await api.post("/api/auth/login", { email, password });
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
}

/**
 * Проверяет валидность токена на сервере и возвращает данные пользователя
 * @returns {Promise<Object>}
 */
export async function getMe() {
  const response = await api.get("/api/auth/me");
  return response.data;
}
