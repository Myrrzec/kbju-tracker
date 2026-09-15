import uuid
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.database import get_db
from app.models.diary import MealEntry
from app.models.user import User
from app.schemas.diary import DailySummary, MealEntryCreate, MealEntryOut, MealEntryUpdate

router = APIRouter(prefix="/diary", tags=["diary"])


@router.post("/entries", response_model=MealEntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    payload: MealEntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MealEntryOut:
    entry = MealEntry(
        user_id=current_user.id,
        logged_at=payload.logged_at or datetime.now(timezone.utc),
        **payload.model_dump(exclude={"logged_at"}),
    )
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return MealEntryOut.model_validate(entry)


def _get_owned_entry(db: Session, entry_id: uuid.UUID, user: User) -> MealEntry:
    entry = db.get(MealEntry, entry_id)
    if entry is None or entry.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Запись не найдена")
    return entry


@router.get("/entries/{entry_id}", response_model=MealEntryOut)
def get_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MealEntryOut:
    return MealEntryOut.model_validate(_get_owned_entry(db, entry_id, current_user))


@router.put("/entries/{entry_id}", response_model=MealEntryOut)
def update_entry(
    entry_id: uuid.UUID,
    payload: MealEntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> MealEntryOut:
    entry = _get_owned_entry(db, entry_id, current_user)
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return MealEntryOut.model_validate(entry)


@router.delete("/entries/{entry_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_entry(
    entry_id: uuid.UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> None:
    entry = _get_owned_entry(db, entry_id, current_user)
    db.delete(entry)
    db.commit()


@router.get("/summary", response_model=DailySummary)
def get_daily_summary(
    day: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> DailySummary:
    entries = db.execute(
        select(MealEntry)
        .where(
            MealEntry.user_id == current_user.id,
            MealEntry.logged_at >= datetime.combine(day, datetime.min.time(), tzinfo=timezone.utc),
            MealEntry.logged_at < datetime.combine(day, datetime.max.time(), tzinfo=timezone.utc),
        )
        .order_by(MealEntry.logged_at)
    ).scalars().all()

    return DailySummary(
        date=day.isoformat(),
        total_calories=sum(e.calories for e in entries),
        total_protein_g=sum(e.protein_g for e in entries),
        total_fat_g=sum(e.fat_g for e in entries),
        total_carbs_g=sum(e.carbs_g for e in entries),
        entries=[MealEntryOut.model_validate(e) for e in entries],
    )
