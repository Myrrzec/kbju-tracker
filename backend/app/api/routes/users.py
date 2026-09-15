from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.user import User
from app.schemas.user import DailyTargets, ProfileOut, ProfileUpdate
from app.services.nutrition_calc import IncompleteProfileError, calculate_daily_targets

router = APIRouter(prefix="/users/me", tags=["users"])


@router.get("/profile", response_model=ProfileOut)
def get_profile(current_user: User = Depends(get_current_user)) -> ProfileOut:
    return ProfileOut.model_validate(current_user.profile)


@router.put("/profile", response_model=ProfileOut)
def update_profile(
    payload: ProfileUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> ProfileOut:
    profile = current_user.profile
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(profile, field, value)

    db.commit()
    db.refresh(profile)
    return ProfileOut.model_validate(profile)


@router.get("/targets", response_model=DailyTargets)
def get_targets(current_user: User = Depends(get_current_user)) -> DailyTargets:
    try:
        return calculate_daily_targets(current_user.profile)
    except IncompleteProfileError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
