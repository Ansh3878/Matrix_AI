# Matrix — AI Career Companion

Matrix is a modern Next.js application that helps technologists manage and grow their careers using AI-powered tools. The project bundles onboarding, industry insights, resume and cover letter generation, interview practice, job aggregation, and a curated tech news feed into a single, developer-friendly interface.

## Summary

- Purpose: Help software and CS professionals discover jobs, practice interviews, and leverage AI to improve resumes and cover letters.
- Current focus: development and stabilization. Recent migration: NewsData.io client was replaced by a secure server-side proxy to NewsAPI.org. This keeps API keys secret and centralizes error handling and caching.

## Features

- Onboarding: collect `industry`, `subIndustry`, `bio`, `experience`, and `skills` to personalize recommendations.
- Dashboard: AI industry insights (salary ranges, growth, demand level, top skills, market outlook, recommended skills) refreshed by scheduled jobs.
- Resume Builder: author, save, and improve resumes with AI assistance.
- Cover Letters: generate professional, markdown-formatted letters tailored to role and company.
- Interview Practice: generate multiple-choice quizzes and store assessments with AI improvement tips.
- Jobs: aggregate roles from Remotive and JSearch with filtering, pagination, and remote toggles.
- News Feed: Hacker News trends, Dev.to CS articles, and CS job market analysis (via NewsAPI.org proxy).

## Notable Code Changes (recent)

- `app/api/news-feed/route.js` — implemented a NewsAPI.org proxy (server-side GET handler, error handling, response shaping, and caching headers).
- `app/(main)/news-feed/cs-tech-news/page.jsx` — updated to call internal `/api/news-feed` and render NewsAPI article fields (title, source, description, url, publishedAt, image).

## Tech Stack

- Framework: Next.js (App Router) + React
- Styling: Tailwind CSS
- Auth: Clerk (`@clerk/nextjs`)
- Database: PostgreSQL + Prisma
- AI: Google Gemini (configured in `lib/gemini.js`)
- Background jobs: Inngest (`lib/inngest/*`)

## Important Paths

- API proxy for NewsAPI: `app/api/news-feed/route.js`
- CS Job News UI: `app/(main)/news-feed/cs-tech-news/page.jsx`
- Jobs API: `app/api/jobs/route.js`
- Inngest cron: `lib/inngest/function.js`
- Prisma schema: `prisma/schema.prisma`

## Environment Variables

Create an `.env.local` file in the project root or set environment variables in your deployment environment. Keep secrets server-side; do NOT expose them as `NEXT_PUBLIC_*`.

- `DATABASE_URL` — PostgreSQL connection string
- `CLERK_PUBLISHABLE_KEY` — Clerk frontend key
- `CLERK_SECRET_KEY` — Clerk backend key
- `GEMINI_API_KEY` — Google Generative AI key
- `GEMINI_MODEL` — optional
- `JSEARCH_API_KEY` — optional; enables JSearch in jobs aggregation
- `NEWSAPI_KEY` — required; NewsAPI.org key (server-only)

Security note: `NEWSAPI_KEY` must remain server-side. The app calls NewsAPI.org from `app/api/news-feed/route.js` so the key is never exposed to the browser.

## News Proxy: API Reference

`GET /api/news-feed`

Query parameters:

- `q` — optional search query string. If omitted, the proxy uses a default compound query targeting developer/software-engineer job-market coverage:

```
(developer OR "software engineer") AND (layoffs OR hiring OR "job market")
```

- `pageSize` — optional number of results (default `20`, capped at `50`).

Response (200 OK):

```json
{
  "totalResults": 123,
  "articles": [
    {
      "source": "Source Name",
      "author": "Author",
      "title": "Article title",
      "description": "Short description",
      "url": "https://...",
      "image": "https://...",
      "publishedAt": "2025-11-17T...",
      "content": "..."
    }
  ]
}
```

Error responses include a helpful `error` field and status code (e.g. `502` when NewsAPI returns an error).

Example queries:

Browser:

```
http://localhost:3000/api/news-feed
```

Explicit compound query (encoded):

```
http://localhost:3000/api/news-feed?q=(developer%20OR%20%22software%20engineer%22)%20AND%20(layoffs%20OR%20hiring%20OR%20%22job%20market%22)&pageSize=10
```

Notes:

- The proxy sets caching headers: `Cache-Control: public, s-maxage=300, stale-while-revalidate=600`. Adjust for production.
- Consider adding `page` support and server-side persistent caching (Redis) for heavy traffic.

## Running Locally (PowerShell)

Install dependencies:

```powershell
npm install
```

Set environment variables (example):

```powershell
# $env:DATABASE_URL = "postgresql://user:pass@localhost:5432/db"
# $env:NEWSAPI_KEY = "your_newsapi_key_here"
```

Start dev server:

```powershell
npm run dev
```

Open `http://localhost:3000` and navigate to the News Feed → CS Job News tab.

## Testing the Proxy

Simple curl (PowerShell):

```powershell
curl "http://localhost:3000/api/news-feed"
```

Compound query example:

```powershell
curl "http://localhost:3000/api/news-feed?q=(developer%20OR%20%5C%22software%20engineer%5C%22)%20AND%20(layoffs%20OR%20hiring%20OR%20%5C%22job%20market%5C%22)&pageSize=5"
```

If you receive a `500` error indicating the key isn't configured, ensure `NEWSAPI_KEY` is set and restart the dev server.

## Development & Deployment Recommendations

- Keep secrets out of the client bundle. Use server routes for any request that requires a secret key.
- Implement server-side caching for rate-limited APIs (Redis, in-memory cache or file cache for short-lived projects).
- Add pagination support (`page`) in `app/api/news-feed/route.js` if you want deeper result traversal.
- Sanitize and validate incoming `q` strings for length to prevent abuse.

## Git Commands (Review & Commit)

Review changes:

```powershell
git status
git diff -- app/api/news-feed/route.js "app/(main)/news-feed/cs-tech-news/page.jsx"
```

Commit work:

```powershell
git add app/api/news-feed/route.js "app/(main)/news-feed/cs-tech-news/page.jsx" README.md
git commit -m "Use NewsAPI proxy for CS job news; update UI and README"
```

Revert a file to last committed state (if needed):

```powershell
git restore --source=HEAD -- app/api/news-feed/route.js
```

## Where to Next (suggestions)

- Add pagination support to the news proxy and UI.
- Implement server-side persistent caching to reduce API usage and improve latency.
- Add UI features: article thumbnails, source filtering, and an option to view raw JSON for debugging.

## Contributing

- Open an issue to discuss major changes. Send PRs with clear descriptions and tests where applicable.

---
_README updated to reflect migration to NewsAPI.org and provide developer guidance._


