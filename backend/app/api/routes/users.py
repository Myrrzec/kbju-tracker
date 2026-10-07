from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.rate_limit import RateLimiter
from app.core.security import verify_password
from app.database import get_db
from app.models.diary import MealEntry
from app.models.recommendation import Recommendation
from app.models.user import User
from app.schemas.diary import MealEntryOut
from app.schemas.recommendation import RecommendationOut
from app.schemas.user import AccountExport, DailyTargets, DeleteAccountRequest, ProfileOut, ProfileUpdate, UserOut
from app.services.nutrition_calc import IncompleteProfileError, calculate_daily_targets
from app.services.photos import delete_unreferenced_photos

router = APIRouter(prefix="/users/me", tags=["users"])

_delete_attempts = RateLimiter(5, 900, "Too many attempts, please try again later")


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


@router.get("/export", response_model=AccountExport)
def export_data(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)) -> AccountExport:
    entries = db.execute(
        select(MealEntry).where(MealEntry.user_id == current_user.id).order_by(MealEntry.logged_at)
    ).scalars().all()
    recommendations = db.execute(
        select(Recommendation).where(Recommendation.user_id == current_user.id).order_by(Recommendation.created_at)
    ).scalars().all()
    return AccountExport(
        exported_at=datetime.now(timezone.utc),
        account=UserOut.model_validate(current_user),
        profile=ProfileOut.model_validate(current_user.profile),
        entries=[MealEntryOut.model_validate(e) for e in entries],
        recommendations=[RecommendationOut.model_validate(r) for r in recommendations],
    )


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(
    payload: DeleteAccountRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    _delete_attempts.hit(str(current_user.id))
    # 403, not 401: the web client treats 401 as an expired session and signs the user out.
    if not verify_password(payload.password, current_user.hashed_password):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Incorrect password")

    user_id = current_user.id
    photo_urls = db.execute(
        select(MealEntry.photo_url).where(MealEntry.user_id == user_id, MealEntry.photo_url.is_not(None)).distinct()
    ).scalars().all()

    db.execute(delete(MealEntry).where(MealEntry.user_id == user_id))
    db.execute(delete(Recommendation).where(Recommendation.user_id == user_id))
    db.delete(current_user)  # the profile goes with it through the ORM cascade
    db.commit()

    delete_unreferenced_photos(db, photo_urls)
