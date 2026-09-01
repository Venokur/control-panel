-- Таблица пользователей с открытым паролем
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Добавление администратора admin@example.com / 123456
INSERT INTO users (email, password) 
VALUES ('admin@example.com', '123456')
ON CONFLICT (email) DO UPDATE 
SET password = EXCLUDED.password;