from pathlib import Path

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.api.routes import auth, diary, recognition, recommendations, users
from app.config import get_settings

settings = get_settings()
Path(settings.storage_dir).mkdir(parents=True, exist_ok=True)

app = FastAPI(title="KBJU Tracker API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_origin_regex=settings.cors_origin_regex or None,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount("/storage/photos", StaticFiles(directory=settings.storage_dir), name="photos")

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(diary.router)
app.include_router(recognition.router)
app.include_router(recommendations.router)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
