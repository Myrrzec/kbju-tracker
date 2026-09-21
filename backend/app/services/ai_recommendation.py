from datetime import datetime, timedelta, timezone

import anthropic
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.config import get_settings
from app.models.diary import MealEntry
from app.models.profile import UserProfile
from app.schemas.user import DailyTargets
from app.services.ai_errors import friendly_ai_error
from app.services.prompts import RECOMMENDATION_SYSTEM_PROMPT, build_recommendation_user_prompt

settings = get_settings()
_client = anthropic.Anthropic(api_key=settings.anthropic_api_key)


class RecommendationError(Exception):
    pass


def _format_profile_summary(profile: UserProfile) -> str:
    parts = []
    if profile.sex:
        parts.append(f"пол: {profile.sex.value}")
    if profile.height_cm:
        parts.append(f"рост: {profile.height_cm} см")
    if profile.weight_kg:
        parts.append(f"вес: {profile.weight_kg} кг")
    if profile.activity_level:
        parts.append(f"активность: {profile.activity_level.value}")
    if profile.goal:
        parts.append(f"цель: {profile.goal.value}")
    return ", ".join(parts) if parts else "профиль не заполнен"


def _format_targets_summary(targets: DailyTargets) -> str:
    return (
        f"калории: {targets.calories} ккал, белки: {targets.protein_g} г, "
        f"жиры: {targets.fat_g} г, углеводы: {targets.carbs_g} г"
    )


def _format_period_summary(db: Session, user_id, period_days: int, tz_name: str) -> str:
    since = datetime.now(timezone.utc) - timedelta(days=period_days)
    local_day = func.date(func.timezone(tz_name, MealEntry.logged_at))

    daily_totals = db.execute(
        select(
            local_day.label("day"),
            func.sum(MealEntry.calories).label("calories"),
            func.sum(MealEntry.protein_g).label("protein_g"),
            func.sum(MealEntry.fat_g).label("fat_g"),
            func.sum(MealEntry.carbs_g).label("carbs_g"),
        )
        .where(MealEntry.user_id == user_id, MealEntry.logged_at >= since)
        .group_by(local_day)
        .order_by(local_day)
    ).all()

    if not daily_totals:
        return f"За последние {period_days} дней нет ни одной записи в дневнике."

    lines = [
        f"{row.day}: {round(row.calories)} ккал, Б {round(row.protein_g)}г, "
        f"Ж {round(row.fat_g)}г, У {round(row.carbs_g)}г"
        for row in daily_totals
    ]
    return "\n".join(lines)


def generate_recommendation(
    db: Session, user_id, profile: UserProfile, targets: DailyTargets, period_days: int = 7, tz_name: str = "UTC"
) -> str:
    profile_summary = _format_profile_summary(profile)
    targets_summary = _format_targets_summary(targets)
    period_summary = _format_period_summary(db, user_id, period_days, tz_name)

    user_prompt = build_recommendation_user_prompt(profile_summary, targets_summary, period_summary)

    try:
        response = _client.messages.create(
            model=settings.anthropic_model,
            max_tokens=1024,
            system=RECOMMENDATION_SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_prompt}],
        )
    except anthropic.APIError as exc:
        raise RecommendationError(friendly_ai_error(exc)) from exc

    text_block = next((block for block in response.content if block.type == "text"), None)
    if text_block is None:
        raise RecommendationError("AI не вернул текстовый ответ")

    return text_block.text
