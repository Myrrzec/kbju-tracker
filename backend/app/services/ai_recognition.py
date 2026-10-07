import base64
import json
import logging
from typing import Optional

import anthropic
from pydantic import ValidationError

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("kbju.recognition")
logger.setLevel(logging.INFO)

from app.config import get_settings
from app.schemas.recognition import RecognizedFoodItem
from app.services.ai_errors import friendly_ai_error
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
        raise RecognitionError(f"Unsupported image format: {extension}")
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
        raise RecognitionError(friendly_ai_error(exc)) from exc

    logger.info("stop_reason=%s content_types=%s", response.stop_reason, [b.type for b in response.content])

    tool_use_block = next((block for block in response.content if block.type == "tool_use"), None)
    if tool_use_block is None:
        raise RecognitionError("The AI returned no structured result")

    payload = tool_use_block.input
    logger.debug("raw payload from Claude: %s", payload)

    raw_items, notes = _unpack_payload(payload)

    items = []
    for raw_item in raw_items:
        if not isinstance(raw_item, dict):
            continue
        try:
            items.append(RecognizedFoodItem(**raw_item))
        except (TypeError, ValidationError):
            logger.warning("dropped a malformed item from the AI response")
            continue

    return items, notes


def _unpack_payload(payload: dict) -> tuple[list, Optional[str]]:
    """Claude usually follows the tool schema, but sometimes sends `items` as an object keyed by
    dish, as a JSON string, or wraps everything in another {"items": ...}. Accept all of those
    instead of silently reporting "no food found"."""
    raw_items = payload.get("items", [])
    notes = payload.get("notes")

    if isinstance(raw_items, str):
        try:
            raw_items = json.loads(raw_items)
        except ValueError:
            logger.warning("items came back as text that is not JSON")
            raw_items = []

    if isinstance(raw_items, dict):
        if isinstance(raw_items.get("items"), (list, dict, str)):
            inner_notes = raw_items.get("notes")
            notes = notes or inner_notes
            return _unpack_payload({"items": raw_items["items"], "notes": notes})
        raw_items = list(raw_items.values())

    if not isinstance(raw_items, list):
        raw_items = []
    return raw_items, notes if isinstance(notes, str) else None
