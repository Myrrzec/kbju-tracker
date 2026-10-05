from typing import Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.orm import Session

from app.config import get_settings
from app.core.rate_limit import RateLimiter
from app.core.security import InvalidTokenError, decode_token
from app.database import get_db
from app.models.user import User

bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    if credentials is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Не авторизован")

    try:
        user_id = decode_token(credentials.credentials, expected_type="access")
    except InvalidTokenError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Невалидный токен") from exc

    user = db.get(User, user_id)
    if user is None or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Пользователь не найден")

    return user


_settings = get_settings()
_ai_hourly = RateLimiter(_settings.ai_hourly_limit_per_user, 3600, "Слишком много запросов к ИИ, попробуйте через час")
_ai_daily = RateLimiter(_settings.ai_daily_limit_per_user, 86400, "Дневной лимит запросов к ИИ исчерпан, попробуйте завтра")
_ai_total = RateLimiter(_settings.ai_daily_limit_total, 86400, "ИИ-функции временно недоступны, попробуйте позже")


def charge_ai_quota(user: User) -> None:
    """Списывает один запрос к ИИ; если у пользователя или у сервиса лимит исчерпан, отвечает 429."""
    key = str(user.id)
    _ai_hourly.hit(key)
    _ai_daily.hit(key)
    _ai_total.hit("all")


def require_ai_quota(current_user: User = Depends(get_current_user)) -> User:
    charge_ai_quota(current_user)
    return current_user
