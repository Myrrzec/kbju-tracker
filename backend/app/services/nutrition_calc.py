"""Расчёт суточной нормы КБЖУ по формуле Миффлина-Сан Жеора.

BMR (базовый метаболизм):
  мужчины: 10*вес(кг) + 6.25*рост(см) - 5*возраст + 5
  женщины: 10*вес(кг) + 6.25*рост(см) - 5*возраст - 161

TDEE = BMR * коэффициент активности
Целевые калории = TDEE +/- поправка под цель (изменение веса ~0.5кг/неделю)
"""

from datetime import datetime, timezone

from app.models.profile import ActivityLevel, Goal, Sex, UserProfile
from app.schemas.user import DailyTargets

ACTIVITY_MULTIPLIERS: dict[ActivityLevel, float] = {
    ActivityLevel.sedentary: 1.2,
    ActivityLevel.light: 1.375,
    ActivityLevel.moderate: 1.55,
    ActivityLevel.active: 1.725,
    ActivityLevel.very_active: 1.9,
}

GOAL_CALORIE_ADJUSTMENT: dict[Goal, float] = {
    Goal.lose_weight: -500,
    Goal.maintain: 0,
    Goal.gain_weight: 500,
}

PROTEIN_G_PER_KG = 1.8  # умеренно высокое потребление, подходит при дефиците/наборе
FAT_CALORIE_SHARE = 0.25
CALORIES_PER_G_PROTEIN = 4
CALORIES_PER_G_FAT = 9
CALORIES_PER_G_CARBS = 4


def _age_years(birth_date: datetime) -> int:
    today = datetime.now(timezone.utc).date()
    born = birth_date.date()
    return today.year - born.year - ((today.month, today.day) < (born.month, born.day))


class IncompleteProfileError(Exception):
    """Не хватает данных профиля для расчёта (рост/вес/возраст/пол/активность)."""


def calculate_daily_targets(profile: UserProfile) -> DailyTargets:
    if profile.target_calories_override is not None:
        return DailyTargets(
            calories=profile.target_calories_override,
            protein_g=profile.target_protein_g_override or 0,
            fat_g=profile.target_fat_g_override or 0,
            carbs_g=profile.target_carbs_g_override or 0,
            is_estimated=False,
        )

    missing = [
        field
        for field, value in [
            ("sex", profile.sex),
            ("birth_date", profile.birth_date),
            ("height_cm", profile.height_cm),
            ("weight_kg", profile.weight_kg),
            ("activity_level", profile.activity_level),
            ("goal", profile.goal),
        ]
        if value is None
    ]
    if missing:
        raise IncompleteProfileError(f"Не заполнены поля профиля: {', '.join(missing)}")

    age = _age_years(profile.birth_date)
    sex_offset = 5 if profile.sex == Sex.male else -161
    bmr = 10 * profile.weight_kg + 6.25 * profile.height_cm - 5 * age + sex_offset

    tdee = bmr * ACTIVITY_MULTIPLIERS[profile.activity_level]
    target_calories = max(tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal], 1200)

    protein_g = PROTEIN_G_PER_KG * profile.weight_kg
    fat_g = (target_calories * FAT_CALORIE_SHARE) / CALORIES_PER_G_FAT
    remaining_calories = target_calories - (protein_g * CALORIES_PER_G_PROTEIN) - (fat_g * CALORIES_PER_G_FAT)
    carbs_g = max(remaining_calories, 0) / CALORIES_PER_G_CARBS

    return DailyTargets(
        calories=round(target_calories),
        protein_g=round(protein_g, 1),
        fat_g=round(fat_g, 1),
        carbs_g=round(carbs_g, 1),
        is_estimated=True,
    )
