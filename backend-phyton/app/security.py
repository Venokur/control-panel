"""Генерация и валидация JWT-токенов."""
from datetime import datetime, timedelta, timezone
from typing import Optional

import jwt

from app.config import ALGORITHM, SECRET_KEY


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def decode_token(token: str) -> dict:
    """Декодирует токен, бросая jwt.PyJWTError при невалидности."""
    return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
