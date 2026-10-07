from typing import Iterable

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.diary import MealEntry
from app.services.storage import get_storage


def delete_unreferenced_photos(db: Session, photo_urls: Iterable[str]) -> None:
    """Removes photo files that no diary entry points to any more.
    Several entries from one photo share a file, so it goes only with the last of them."""
    storage = get_storage()
    for url in set(photo_urls):
        still_used = db.execute(select(MealEntry.id).where(MealEntry.photo_url == url).limit(1)).first()
        if still_used is None:
            storage.delete(url)
