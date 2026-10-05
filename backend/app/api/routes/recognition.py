from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.api.deps import charge_ai_quota, get_current_user
from app.models.user import User
from app.schemas.recognition import PhotoRecognitionResult
from app.services.ai_recognition import RecognitionError, analyze_food_photo
from app.services.storage import get_storage

router = APIRouter(prefix="/recognition", tags=["recognition"])

MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
CHUNK_SIZE = 1024 * 1024


def detect_image_type(data: bytes) -> Optional[str]:
    """Тип картинки по её первым байтам. Имени файла от клиента не доверяем:
    иначе под видом фото можно загрузить и раздавать с нашего домена что угодно."""
    if data.startswith(b"\xff\xd8\xff"):
        return "jpg"
    if data.startswith(b"\x89PNG\r\n\x1a\n"):
        return "png"
    if data[:4] == b"RIFF" and data[8:12] == b"WEBP":
        return "webp"
    return None


async def read_limited(file: UploadFile, limit: int) -> bytes:
    chunks: list[bytes] = []
    size = 0
    while True:
        chunk = await file.read(CHUNK_SIZE)
        if not chunk:
            break
        size += len(chunk)
        if size > limit:
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Файл слишком большой (макс. 10 МБ)")
        chunks.append(chunk)
    return b"".join(chunks)


@router.post("/photo", response_model=PhotoRecognitionResult)
async def recognize_photo(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> PhotoRecognitionResult:
    content = await read_limited(file, MAX_PHOTO_SIZE_BYTES)

    extension = detect_image_type(content)
    if extension is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Поддерживаются только фото JPEG, PNG и WebP")

    # Лимит списываем только за настоящий запрос к ИИ, а не за отклонённый файл.
    charge_ai_quota(current_user)

    try:
        items, notes = analyze_food_photo(content, extension)
    except RecognitionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    photo_url = get_storage().save(content, extension)

    return PhotoRecognitionResult(items=items, notes=notes, photo_url=photo_url)
