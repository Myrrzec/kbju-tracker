# Macros Tracker

Track calories, protein, fat and carbs. Photograph a meal and the AI estimates what's on the plate; you correct the numbers and save them to a daily diary.

**Live demo: [macros.makeworks.dev](https://macros.makeworks.dev)**
Hosted on free tiers, so the first request after a pause can take up to a minute while the server wakes up.

## What it does

- **Public demo.** Visitors can analyze one meal photo on the home page without an account. Nothing is stored, and per-network and daily limits protect the AI budget.
- **Personal targets.** Daily calories, protein, fat and carbs are calculated from sex, age, height, weight, activity level and goal (Mifflin-St Jeor), or set by hand.
- **Photo logging.** Upload a meal photo and Claude Vision returns each dish with an estimated portion, calories and macros, plus a confidence level and a note. Everything is editable before it is saved.
- **Diary.** Entries are grouped into meals with times (Lunch 1, Lunch 2), can be edited inline, and recent dishes can be re-added in one tap.
- **Dashboard.** A calorie ring and macro bars show the day against your targets.
- **AI advice.** Short, concrete suggestions based on the last 7 days of the diary.
- **Your data.** Export everything as JSON or delete the account, photos included, from the profile page. Privacy Policy and Terms of Service pages are built in.

## Built with

| Layer | Tools |
| --- | --- |
| Frontend | React, TypeScript, Vite, Tailwind CSS v4, TanStack Query, React Router |
| Backend | Python, FastAPI, SQLAlchemy 2, Alembic, PostgreSQL |
| Auth | JWT access and refresh tokens, bcrypt |
| AI | Claude API: vision for photos, text for advice |
| Hosting | Cloudflare Pages (frontend), Render (API and database) |

## How it works

**Photo recognition.** The image is sent to Claude with a forced tool call, so the model must answer with a JSON object matching a fixed schema instead of free text. The prompt asks for a best-effort estimate marked as low confidence rather than a refusal when a photo is blurry or partly hidden, which is what makes it useful on real pictures.

**Day boundaries follow the user's time zone.** The client sends its zone with every summary request, so a meal logged at 00:30 lands on the right day.

**Nutrition is stored as a snapshot.** Each diary entry keeps the numbers it was saved with, so editing a dish later never rewrites history.

**Friendly errors.** Raw API and AI errors are mapped to short messages, and the API client refreshes expired tokens and retries once.

## Repository layout

```
backend/    FastAPI app: models, schemas, routes, services (nutrition maths, Claude calls)
frontend/   React app: pages, components, API client
docs/       Architecture notes and the reasoning behind the AI prompts (in Russian)
render.yaml Render blueprint for the API and database
```

More detail: [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) and [docs/PROMPTS.md](docs/PROMPTS.md).
