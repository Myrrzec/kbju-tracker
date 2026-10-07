import logging

import anthropic

logger = logging.getLogger("kbju.ai")


def friendly_ai_error(exc: Exception) -> str:
    """Короткое сообщение для пользователя; подробности остаются только в логах."""
    logger.error("Anthropic API error: %r", exc)

    if isinstance(exc, anthropic.AuthenticationError):
        return "AI is unavailable: the Anthropic API key is invalid. Check ANTHROPIC_API_KEY in backend/.env."
    if isinstance(exc, anthropic.PermissionDeniedError):
        return "AI is unavailable: the Anthropic key has no access to this model."
    if isinstance(exc, anthropic.RateLimitError):
        return "Too many AI requests. Wait a minute and try again."
    if isinstance(exc, anthropic.APIConnectionError):
        return "Can't reach the AI service. Check the connection and try again."
    return "Couldn't get a response from the AI. Please try again."
