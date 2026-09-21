from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.timezones import resolve_tz, tz_key
from app.database import get_db
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.recommendation import RecommendationOut
from app.services.ai_recommendation import RecommendationError, generate_recommendation
from app.services.nutrition_calc import IncompleteProfileError, calculate_daily_targets

router = APIRouter(prefix="/recommendations", tags=["recommendations"])


@router.get("", response_model=Optional[RecommendationOut])
def get_latest_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Optional[RecommendationOut]:
    latest = db.execute(
        select(Recommendation)
        .where(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(1)
    ).scalar_one_or_none()
    return RecommendationOut.model_validate(latest) if latest else None


@router.post("/generate", response_model=RecommendationOut, status_code=status.HTTP_201_CREATED)
def create_recommendation(
    period_days: int = Query(default=7, ge=1, le=30),
    tz: str = "UTC",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> RecommendationOut:
    try:
        targets = calculate_daily_targets(current_user.profile)
    except IncompleteProfileError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc

    try:
        content = generate_recommendation(
            db, current_user.id, current_user.profile, targets, period_days, tz_key(resolve_tz(tz))
        )
    except RecommendationError as exc:
        raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=str(exc)) from exc

    recommendation = Recommendation(user_id=current_user.id, content=content, period_days=period_days)
    db.add(recommendation)
    db.commit()
    db.refresh(recommendation)
    return RecommendationOut.model_validate(recommendation)
