# KBJU Tracker

Веб-приложение для учёта КБЖУ с распознаванием еды по фото и AI-рекомендациями.
Архитектура и план — в [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), объяснение
AI-промптов — в [`docs/PROMPTS.md`](docs/PROMPTS.md).

## Запуск бэкенда локально

1. Поднять базу данных:

   ```bash
   docker compose up -d db
   ```

2. Настроить окружение:

   ```bash
   cd backend
   python3 -m venv .venv
   source .venv/bin/activate
   pip install -r requirements.txt
   cp .env.example .env
   ```

   Открыть `.env` и вписать `ANTHROPIC_API_KEY` (нужен для распознавания фото и
   рекомендаций) и сгенерировать `JWT_SECRET_KEY`, например:

   ```bash
   python3 -c "import secrets; print(secrets.token_hex(32))"
   ```

3. Применить миграции:

   ```bash
   alembic upgrade head
   ```

4. Запустить сервер:

   ```bash
   uvicorn app.main:app --reload
   ```

5. Открыть интерактивную документацию API: http://localhost:8000/docs

## Структура

```
backend/app/
  models/       # SQLAlchemy-модели (User, UserProfile, FoodItem, MealEntry, Recommendation)
  schemas/      # Pydantic-схемы запросов/ответов
  api/routes/   # FastAPI-роуты (auth, users, diary, recognition, recommendations)
  services/     # Бизнес-логика: расчёт КБЖУ, хранилище фото, вызовы Claude
  core/         # Хеширование паролей, JWT
```

## Статус

Каркас готов: auth, профиль с расчётом целевых КБЖУ, дневник питания, распознавание
фото через Claude Vision, генерация рекомендаций через Claude. Ещё не сделано —
см. раздел "Роадмап" в [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).
