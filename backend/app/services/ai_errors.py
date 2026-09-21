import logging

import anthropic

logger = logging.getLogger("kbju.ai")


def friendly_ai_error(exc: Exception) -> str:
    """Короткое сообщение для пользователя; подробности остаются только в логах."""
    logger.error("Anthropic API error: %r", exc)

    if isinstance(exc, anthropic.AuthenticationError):
        return "ИИ недоступен: ключ Anthropic недействителен. Проверьте ANTHROPIC_API_KEY в backend/.env."
    if isinstance(exc, anthropic.PermissionDeniedError):
        return "ИИ недоступен: у ключа Anthropic нет доступа к этой модели."
    if isinstance(exc, anthropic.RateLimitError):
        return "Слишком много запросов к ИИ. Подождите минуту и попробуйте снова."
    if isinstance(exc, anthropic.APIConnectionError):
        return "Нет связи с сервисом ИИ. Проверьте интернет и попробуйте снова."
    return "Не удалось получить ответ от ИИ. Попробуйте ещё раз."
