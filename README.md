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

## Деплой (бесплатный, живая демка)

Три отдельных сервиса, в отличие от статического сайта: фронтенд, бэкенд, база данных.

**Бэкенд + БД — Render**, через `render.yaml` (Blueprint) в корне репозитория —
он сам создаёт и Postgres, и веб-сервис, и прописывает между ними `DATABASE_URL`.

1. [dashboard.render.com](https://dashboard.render.com) → зарегистрироваться
2. **New** → **Blueprint** → подключить репозиторий `kbju-tracker` на GitHub
3. Render найдёт `render.yaml` и покажет план: Postgres `kbju-tracker-db` + веб-сервис `kbju-tracker-api`
4. Единственное, что попросит ввести вручную — `ANTHROPIC_API_KEY` (по соображениям
   безопасности такие секреты не должны лежать в `render.yaml`/репозитории)
5. **Apply** — через несколько минут бэкенд будет на `https://kbju-tracker-api.onrender.com`

**Фронтенд — Cloudflare Pages**, как и в pilates-проекте:

1. Workers & Pages → Create → Pages → **Connect to Git** → репозиторий `kbju-tracker`
2. **Root directory**: `frontend`
3. **Build command**: `npm run build`, **Build output directory**: `dist`
4. Save and Deploy

Адрес backend уже зашит в [`frontend/.env.production`](frontend/.env.production) — Vite подхватывает
этот файл автоматически при продакшн-сборке, отдельно ничего прописывать не нужно
(если только Render не переименовал сервис из-за занятого имени — тогда поправить URL
в этом файле и запушить).

### Известные ограничения бесплатного тарифа

- **Задержка первого запроса**: сервис на Render засыпает после 15 минут без
  запросов, следующий запрос будит его — это занимает 30–50 секунд. Не баг.
- **Бесплатная база Postgres на Render существует 90 дней**, потом Render просит
  пересоздать её — учтено как факт, не как проблема кода.
- **Хранилище фото временное**: файлы лежат на диске контейнера, который
  пересоздаётся при каждом деплое/перезапуске — загруженные фото не переживут
  передеплой. Для продакшена нужно S3-совместимое хранилище (см. `docs/ARCHITECTURE.md`).

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
продакшн-хранилище фото (S3-совместимое, сейчас временный диск на Render), наполнение
справочника продуктов.
