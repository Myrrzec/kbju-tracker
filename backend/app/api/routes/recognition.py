from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Request, UploadFile, status
from starlette.concurrency import run_in_threadpool

from app.api.deps import charge_ai_quota, get_current_user
from app.config import get_settings
from app.core.rate_limit import RateLimiter, client_ip
from app.models.user import User
from app.schemas.recognition import DemoRecognitionResult, PhotoRecognitionResult
from app.services.ai_recognition import RecognitionError, analyze_food_photo
from app.services.storage import get_storage

router = APIRouter(prefix="/recognition", tags=["recognition"])

MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB
MAX_DEMO_PHOTO_SIZE_BYTES = 6 * 1024 * 1024  # the web client shrinks photos well below this
CHUNK_SIZE = 1024 * 1024

_settings = get_settings()
_demo_by_ip = RateLimiter(
    _settings.demo_daily_limit_per_ip,
    86400,
    "You have used today's free demo tries. Create an account to keep analyzing meals.",
)
_demo_total = RateLimiter(
    _settings.demo_daily_limit_total,
    86400,
    "The free demo has reached its daily limit. Please try again tomorrow or create an account.",
)


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
            raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail=f"File is too large (max {limit // (1024 * 1024)} MB)")
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
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG and WebP photos are supported")

    # Лимит списываем только за настоящий запрос к ИИ, а не за отклонённый файл.
    charge_ai_quota(current_user)

    try:
        # the Claude call is blocking, so keep it off the event loop
        items, notes = await run_in_threadpool(analyze_food_photo, content, extension)
    except RecognitionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    photo_url = get_storage().save(content, extension)

    return PhotoRecognitionResult(items=items, notes=notes, photo_url=photo_url)


@router.post("/demo", response_model=DemoRecognitionResult)
async def recognize_demo(request: Request, file: UploadFile) -> DemoRecognitionResult:
    """Public try-out for visitors without an account. Nothing is stored: no file, no database row."""
    content = await read_limited(file, MAX_DEMO_PHOTO_SIZE_BYTES)

    extension = detect_image_type(content)
    if extension is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only JPEG, PNG and WebP photos are supported")

    _demo_by_ip.hit(client_ip(request))
    _demo_total.hit("all")

    try:
        items, notes = await run_in_threadpool(analyze_food_photo, content, extension)
    except RecognitionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    return DemoRecognitionResult(items=items, notes=notes)
