# KBJU Tracker

Веб-приложение для учёта КБЖУ с распознаванием еды по фото и AI-рекомендациями.
Архитектура и план — в [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md), объяснение
AI-промптов — в [`docs/PROMPTS.md`](docs/PROMPTS.md).

## Запуск бэкенда локально

1. Поднять базу данных — через [Postgres.app](https://postgresapp.com) (см. `createuser`/`createdb`
   в документации приложения) или через Docker:

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

## Запуск фронтенда локально

Бэкенд должен быть уже запущен (см. выше) — фронтенд обращается к нему по `http://localhost:8000`.

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

Открыть http://localhost:3000 — первый экран попросит зарегистрироваться, затем
заполнить профиль (для расчёта целевых КБЖУ), после чего откроется дашборд.

## Структура

```
backend/app/
  models/       # SQLAlchemy-модели (User, UserProfile, FoodItem, MealEntry, Recommendation)
  schemas/      # Pydantic-схемы запросов/ответов
  api/routes/   # FastAPI-роуты (auth, users, diary, recognition, recommendations)
  services/     # Бизнес-логика: расчёт КБЖУ, хранилище фото, вызовы Claude
  core/         # Хеширование паролей, JWT

frontend/src/
  types/        # TypeScript-типы, зеркалящие backend-схемы
  lib/          # API-клиент (fetch + refresh токена), типизированные вызовы эндпоинтов
  context/      # AuthContext — токены, login/register/logout
  components/   # Переиспользуемые UI-блоки (формы, списки, прогресс-бары)
  pages/        # Страницы: Login, Register, Onboarding, Dashboard, Diary, Recognize, Recommendations, Profile
```

## Статус

MVP полностью работает end-to-end: auth, профиль с расчётом целевых КБЖУ, дневник
питания, распознавание фото через Claude Vision, генерация рекомендаций через Claude —
и фронтенд на React, покрывающий весь этот путь. Проверено вживую в браузере
(регистрация → онбординг → дашборд → дневник → профиль → рекомендации).

Ещё не сделано — см. раздел "Роадмап" в [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md):
продакшн-хранилище фото (сейчас локальный диск), деплой, наполнение справочника продуктов.
