import base64
import logging
from typing import Optional

import anthropic

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kbju.recognition")
logger.setLevel(logging.INFO)

from app.config import get_settings
from app.schemas.recognition import RecognizedFoodItem
from app.services.prompts import FOOD_RECOGNITION_SYSTEM_PROMPT, FOOD_RECOGNITION_TOOL

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)

SUPPORTED_MEDIA_TYPES = {
    "jpg": "image/jpeg",
    "jpeg": "image/jpeg",
    "png": "image/png",
    "webp": "image/webp",
}


class RecognitionError(Exception):
    pass


def _media_type_for(extension: str) -> str:
    media_type = SUPPORTED_MEDIA_TYPES.get(extension.lower().lstrip("."))
    if media_type is None:
        raise RecognitionError(f"Неподдерживаемый формат изображения: {extension}")
    return media_type


def analyze_food_photo(image_bytes: bytes, extension: str) -> tuple[list[RecognizedFoodItem], Optional[str]]:
    """Отправляет фото в Claude Vision и возвращает распознанные блюда с оценкой КБЖУ.

    Используем forced tool_choice, чтобы модель гарантированно вернула
    структурированный JSON вместо свободного текста.
    """
    media_type = _media_type_for(extension)
    image_b64 = base64.standard_b64encode(image_bytes).decode("utf-8")

    try:
        response = _client.messages.create(
            model=settings.anthropic_model,
            max_tokens=2048,
            system=FOOD_RECOGNITION_SYSTEM_PROMPT,
            tools=[FOOD_RECOGNITION_TOOL],
            tool_choice={"type": "tool", "name": "return_food_analysis"},
            messages=[
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {"type": "base64", "media_type": media_type, "data": image_b64},
                        },
                        {
                            "type": "text",
                            "text": "Проанализируй еду на этом фото.",
                        },
                    ],
                }
            ],
        )
    except anthropic.APIError as exc:
        raise RecognitionError(f"Ошибка обращения к AI: {exc}") from exc

    logger.info("stop_reason=%s content_types=%s", response.stop_reason, [b.type for b in response.content])

    tool_use_block = next((block for block in response.content if block.type == "tool_use"), None)
    if tool_use_block is None:
        raise RecognitionError("AI не вернул структурированный результат")

    payload = tool_use_block.input
    logger.info("raw payload from Claude: %s", payload)
    raw_items = payload.get("items", [])
    # Claude usually returns a list of objects as specified in the tool schema, but
    # occasionally restructures it as an object keyed by item name/index instead —
    # normalize both shapes rather than crashing on the mismatch.
    if isinstance(raw_items, dict):
        raw_items = list(raw_items.values())

    items = []
    for raw_item in raw_items:
        if not isinstance(raw_item, dict):
            continue
        try:
            items.append(RecognizedFoodItem(**raw_item))
        except TypeError:
            continue

    notes = payload.get("notes")
    return items, notes
