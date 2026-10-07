"""Хранилище фото еды. MVP: локальный диск за абстракцией,
чтобы потом безболезненно перейти на S3/облако без изменения вызывающего кода."""

import re
import uuid
from pathlib import Path
from typing import Optional, Protocol

from app.config import get_settings

settings = get_settings()

# The only URL shape this app ever hands out. Anything else is rejected, so a client
# can never point a diary entry (or a delete) at some other file on the server.
PHOTO_URL_RE = re.compile(r"^/storage/photos/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\.(jpg|png|webp)$")


def is_valid_photo_url(url: Optional[str]) -> bool:
    return url is not None and PHOTO_URL_RE.match(url) is not None


class StorageBackend(Protocol):
    def save(self, content: bytes, extension: str) -> str:
        """Сохраняет файл и возвращает URL/путь для доступа к нему."""
        ...

    def delete(self, photo_url: str) -> None:
        """Удаляет файл по URL, который вернул save(). Чужие и битые URL игнорируются."""
        ...


class LocalDiskStorage:
    def __init__(self, base_dir: str):
        self.base_dir = Path(base_dir)
        self.base_dir.mkdir(parents=True, exist_ok=True)

    def save(self, content: bytes, extension: str) -> str:
        filename = f"{uuid.uuid4()}.{extension.lstrip('.')}"
        path = self.base_dir / filename
        path.write_bytes(content)
        return f"/storage/photos/{filename}"

    def delete(self, photo_url: str) -> None:
        if not is_valid_photo_url(photo_url):
            return
        (self.base_dir / Path(photo_url).name).unlink(missing_ok=True)


def get_storage() -> StorageBackend:
    return LocalDiskStorage(settings.storage_dir)
