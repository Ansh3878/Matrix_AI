# Matrix — AI Career Companion

Matrix is a Next.js 15 app that helps you navigate your career with AI. It brings together onboarding, an industry insights dashboard, resume building with AI improvements, AI-generated cover letters, interview practice with MCQ quizzes, job aggregation, and a curated CS/Tech News Feed.

## Features
- Onboarding: capture `industry`, `subIndustry`, `bio`, `experience`, and `skills` to personalize recommendations.
- Dashboard: AI industry insights (salary ranges, growth rate, demand level, top skills, market outlook, key trends, recommended skills) with weekly refresh via cron.
- Resume Builder: author and save a resume; improve individual sections using Gemini with industry context.
- AI Cover Letters: generate professional, markdown-formatted letters tailored to company, role, and your background.
- Interview Practice: generate multiple-choice quizzes and store assessments with AI improvement tips on weak areas.
- Jobs: aggregate roles from Remotive and JSearch with filtering, pagination, and remote toggles.
- News Feed: CS/Tech news tabs for Hacker News trends, Dev.to CS articles, and CS job news from NewsData.io.

## Tech Stack
- Framework: `next@15.5`, `react@19.1`
- Auth: `@clerk/nextjs`
- Database/ORM: `PostgreSQL` + `Prisma`
- AI: Google Gemini via `@google/generative-ai`
- Jobs APIs: Remotive, JSearch (RapidAPI)
- Background jobs: `inngest` cron, served at `app/api/inngest/route.js`
- UI: Tailwind CSS + Radix UI + custom components

## Architecture
- App Router structure under `app/` with grouped layouts:
  - Public: `app/page.jsx`, `app/(auth)/sign-in`, `app/(auth)/sign-up`
  - Protected: `app/(main)/dashboard`, `resume`, `ai-cover-letter`, `interview`, `onboarding`, `jobs`, `news-feed`
- Auth protection via Clerk middleware in `middleware.js` using `createRouteMatcher`.
- Server actions in `actions/*` encapsulate DB and AI logic.
- Prisma models in `prisma/schema.prisma`; client generated to `lib/generated/prisma`.
- Inngest client at `lib/inngest/client.js` and weekly cron in `lib/inngest/function.js`.
- API routes:
  - `app/api/jobs/route.js`
  - `app/api/inngest/route.js`
  - `app/api/news-feed/route.js`

## Project Workflow
- Sign Up/In: handled by Clerk; app-wide provider set in `app/layout.js`.
- Onboarding: fill industry profile; data persists to `User` and links to `IndustryInsight`.
- Dashboard: reads `IndustryInsight` for the user; if missing or stale, generates via Gemini and stores.
- Resume: author content in a markdown editor; save via server action; improve sections via Gemini using industry context.
- Cover Letters: submit role/company/job description; generate content via Gemini; CRUD list and view.
- Interview: generate 10 MCQs based on industry and skills; after quiz, persist assessment and optional AI improvement tip.
- Jobs: call jobs API to aggregate and normalize listings; filter by source, remote, location; paginate.
- News Feed: three tabs — Hacker News trends, Dev.to CS articles, and CS job news via NewsData.io.
- Weekly Refresh: Inngest cron regenerates `IndustryInsight` for tracked industries.

## Environment Variables
Create `.env.local` in the project root and add:
- `DATABASE_URL` — PostgreSQL connection string
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `GEMINI_API_KEY` — Google Generative AI API key
- `GEMINI_MODEL` — optional, defaults to `gemini-2.5-flash`
- `JSEARCH_API_KEY` — optional, enables JSearch aggregation in jobs API
- `NEXT_PUBLIC_NEWSDATA_API_KEY` — required for CS Job News tab

## Scripts
- `npm run dev` — start local dev server (Turbopack)
- `npm run build` — build (Turbopack)
- `npm start` — run production build
- `npm run lint` — lint
- `postinstall` — `prisma generate`

## Database
- Models: `User`, `Assessment`, `Resume`, `CoverLetter`, `IndustryInsight` with enums `DemandLevel`, `MarketOutlook`.
- Initialize/migrate:
  - `npx prisma migrate dev` — create and apply dev migration
  - `npx prisma generate` — already run on postinstall

## API Endpoints
- `GET /api/jobs`
  - Query params: `q`, `page`, `perPage`, `location`, `remote`, `source`
  - Combines Remotive and JSearch, normalizes fields, paginates, and filters
- `GET|POST|PUT /api/inngest` — serves Inngest functions (weekly insights cron)
- `POST /api/news-feed` — scaffold endpoint; returns `{ ok: true }`

## Key Paths
- Auth provider: `app/layout.js:19`
- Route protection: `middleware.js:4`
- Gemini config: `lib/gemini.js:7`
- Inngest client: `lib/inngest/client.js:3`
- Inngest cron: `lib/inngest/function.js:5`
- Jobs API: `app/api/jobs/route.js:4`
- News Feed pages: `app/(main)/news-feed/cs-tech-news/page.jsx:1`, `app/(main)/news-feed/page.jsx:8`
- Prisma schema: `prisma/schema.prisma:7`

## Getting Started
1. Clone and install dependencies: `npm install`
2. Create `.env.local` with variables above
3. Set up PostgreSQL and run `npx prisma migrate dev`
4. Start dev server: `npm run dev`

## Notes
- Clerk keys are required for authentication.
- Without `JSEARCH_API_KEY`, jobs are fetched only from Remotive.
- `NEXT_PUBLIC_NEWSDATA_API_KEY` is required for the CS Job News tab to load articles.

