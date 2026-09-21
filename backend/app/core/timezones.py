from datetime import date, datetime, time, timedelta, timezone, tzinfo
from zoneinfo import ZoneInfo

UTC_NAME = "UTC"


def resolve_tz(name: str) -> tzinfo:
    try:
        return ZoneInfo(name)
    except Exception:
        return timezone.utc


def tz_key(tz: tzinfo) -> str:
    return getattr(tz, "key", UTC_NAME)


def day_bounds(day: date, tz: tzinfo) -> tuple[datetime, datetime]:
    start = datetime.combine(day, time.min, tzinfo=tz)
    end = datetime.combine(day + timedelta(days=1), time.min, tzinfo=tz)
    return start, end
