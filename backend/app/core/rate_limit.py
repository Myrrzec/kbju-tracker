"""Ограничение частоты запросов в памяти процесса.

Хватает для одного инстанса (бесплатный Render). Счётчики сбрасываются при перезапуске;
при нескольких инстансах их нужно перенести в общее хранилище (Redis или БД).
"""

import threading
import time
from collections import defaultdict, deque

from fastapi import HTTPException, Request, status


class RateLimiter:
    def __init__(self, limit: int, window_seconds: int, message: str):
        self.limit = limit
        self.window = window_seconds
        self.message = message
        self._hits: dict[str, deque] = defaultdict(deque)
        self._lock = threading.Lock()

    def hit(self, key: str) -> None:
        """Засчитывает запрос; если лимит исчерпан, бросает 429 и запрос не засчитывается."""
        now = time.monotonic()
        with self._lock:
            hits = self._hits[key]
            while hits and now - hits[0] >= self.window:
                hits.popleft()
            if len(hits) >= self.limit:
                retry_after = int(self.window - (now - hits[0])) + 1
                raise HTTPException(
                    status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                    detail=self.message,
                    headers={"Retry-After": str(retry_after)},
                )
            hits.append(now)
            if len(self._hits) > 10_000:
                self._prune(now)

    def _prune(self, now: float) -> None:
        for key in [k for k, v in self._hits.items() if not v or now - v[-1] >= self.window]:
            del self._hits[key]


def client_ip(request: Request) -> str:
    # За прокси Render адрес клиента приходит в X-Forwarded-For; прокси дописывает его в конец.
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[-1].strip()
    return request.client.host if request.client else "unknown"
