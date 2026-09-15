from fastapi import APIRouter, Depends, HTTPException, UploadFile, status

from app.api.deps import get_current_user
from app.models.user import User
from app.schemas.recognition import PhotoRecognitionResult
from app.services.ai_recognition import RecognitionError, analyze_food_photo
from app.services.storage import get_storage

router = APIRouter(prefix="/recognition", tags=["recognition"])

MAX_PHOTO_SIZE_BYTES = 10 * 1024 * 1024  # 10 MB


@router.post("/photo", response_model=PhotoRecognitionResult)
async def recognize_photo(
    file: UploadFile,
    current_user: User = Depends(get_current_user),
) -> PhotoRecognitionResult:
    extension = (file.filename or "").rsplit(".", 1)[-1] if "." in (file.filename or "") else ""
    if not extension:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="У файла нет расширения")

    content = await file.read()
    if len(content) > MAX_PHOTO_SIZE_BYTES:
        raise HTTPException(status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE, detail="Файл слишком большой (макс. 10 МБ)")

    try:
        items, notes = analyze_food_photo(content, extension)
    except RecognitionError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    photo_url = get_storage().save(content, extension)

    return PhotoRecognitionResult(items=items, notes=notes, photo_url=photo_url)
