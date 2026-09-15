import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Literal

import bcrypt
from jose import JWTError, jwt

from app.config import get_settings

settings = get_settings()

TokenType = Literal["access", "refresh"]


def _prehash(password: str) -> bytes:
    # bcrypt caps input at 72 bytes; sha256-prehashing lets users have
    # arbitrarily long passwords without silent truncation.
    return hashlib.sha256(password.encode("utf-8")).hexdigest().encode("utf-8")


def hash_password(password: str) -> str:
    return bcrypt.hashpw(_prehash(password), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(_prehash(plain_password), hashed_password.encode("utf-8"))


def _create_token(subject: uuid.UUID, token_type: TokenType, expires_delta: timedelta) -> str:
    now = datetime.now(timezone.utc)
    payload = {
        "sub": str(subject),
        "type": token_type,
        "iat": now,
        "exp": now + expires_delta,
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_access_token(user_id: uuid.UUID) -> str:
    return _create_token(user_id, "access", timedelta(minutes=settings.access_token_expire_minutes))


def create_refresh_token(user_id: uuid.UUID) -> str:
    return _create_token(user_id, "refresh", timedelta(days=settings.refresh_token_expire_days))


class InvalidTokenError(Exception):
    pass


def decode_token(token: str, expected_type: TokenType) -> uuid.UUID:
    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
    except JWTError as exc:
        raise InvalidTokenError("Не удалось декодировать токен") from exc

    if payload.get("type") != expected_type:
        raise InvalidTokenError(f"Ожидался токен типа '{expected_type}'")

    try:
        return uuid.UUID(payload["sub"])
    except (KeyError, ValueError) as exc:
        raise InvalidTokenError("Некорректный субъект токена") from exc
