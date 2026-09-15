"""Хранилище фото еды. MVP: локальный диск за абстракцией,
чтобы потом безболезненно перейти на S3/облако без изменения вызывающего кода."""

import uuid
from pathlib import Path
from typing import Protocol

from app.config import get_settings

settings = get_settings()


class StorageBackend(Protocol):
    def save(self, content: bytes, extension: str) -> str:
        """Сохраняет файл и возвращает URL/путь для доступа к нему."""
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


def get_storage() -> StorageBackend:
    return LocalDiskStorage(settings.storage_dir)
