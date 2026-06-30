# Matrix — AI Career Companion

Matrix is a full-stack **Next.js 15** application that helps technologists manage and accelerate their careers using AI-powered tools. It bundles onboarding, AI industry insights, resume and cover letter generation, interview practice, job aggregation, and a curated tech news feed into a single cohesive platform.

---

## Features

| Feature | Description |
|---|---|
| **Onboarding** | Collects `industry`, `subIndustry`, `bio`, `experience`, and `skills` to personalize the experience |
| **Dashboard** | AI-generated industry insights (salary ranges, growth rate, demand level, top skills, market outlook, recommended skills) refreshed by a weekly scheduled background job |
| **Resume Builder** | Author, save, and improve resumes with AI assistance; export to PDF via `html2pdf.js` |
| **Cover Letters** | Generate professional, markdown-formatted letters tailored to a specific role and company |
| **Interview Practice** | AI-generated multiple-choice quizzes with assessment history and AI improvement tips |
| **Job Aggregation** | Aggregate roles from **Remotive** and **JSearch** with filtering, pagination, and remote-only toggles |
| **News Feed** | Hacker News trends, Dev.to CS articles, and a CS job-market news feed powered by a **server-side NewsAPI.org proxy** |
| **Galaxy / Matrix UI** | Three.js–powered animated galaxy background (`Galaxy.jsx`) and Matrix text rain (`MatrixText.jsx`) for a premium visual experience |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 15 (App Router) + React 19 with Turbopack |
| **Styling** | Tailwind CSS v3 + Radix UI primitives + `tailwindcss-animate` |
| **Auth** | Clerk (`@clerk/nextjs` v6) with webhook support via Svix |
| **Database** | PostgreSQL (Neon) + Prisma ORM v6 |
| **AI** | Google Gemini (`@google/genai`, `@google/generative-ai`) |
| **Background Jobs** | Inngest (weekly cron for industry insights) |
| **3D / Animation** | Three.js, `@react-three/fiber`, `@react-three/drei`, Motion |
| **Forms** | React Hook Form + Zod validation |
| **Charts** | Recharts |
| **Rich Text** | `@uiw/react-md-editor` |

---

## Project Structure

```
matrix/
├── app/
│   ├── (auth)/                  # Clerk sign-in / sign-up pages
│   ├── (main)/                  # Authenticated app shell
│   │   ├── dashboard/           # Industry insights dashboard
│   │   ├── resume/              # Resume builder
│   │   ├── ai-cover-letter/     # Cover letter generator
│   │   ├── interview/           # Interview practice & assessments
│   │   ├── jobs/                # Job aggregation
│   │   └── news-feed/
│   │       └── cs-tech-news/    # NewsAPI.org proxy-powered news UI
│   ├── api/
│   │   ├── news-feed/route.js   # Server-side NewsAPI.org proxy
│   │   ├── jobs/route.js        # Jobs aggregation API
│   │   ├── inngest/             # Inngest webhook endpoint
│   │   └── webhooks/            # Clerk user sync webhook
│   ├── globals.css
│   ├── layout.js
│   └── page.jsx                 # Landing page
├── actions/                     # Next.js Server Actions
│   ├── user.js
│   ├── dashboard.js
│   ├── resume.js
│   ├── cover-letter.js
│   └── interview.js
├── components/
│   ├── Galaxy.jsx               # Three.js galaxy background
│   ├── GalaxyBackground.jsx
│   ├── MatrixText.jsx           # Matrix rain text animation
│   ├── header.jsx
│   ├── hero.jsx
│   └── ui/                      # Shared Radix UI components
├── lib/
│   ├── gemini.js                # Google Gemini client factory
│   ├── prisma.js                # Prisma client singleton
│   ├── checkUser.js             # Clerk ↔ DB user sync
│   ├── user-cache.js            # Server-side user caching
│   ├── utils.js
│   └── inngest/
│       ├── client.js            # Inngest client
│       └── function.js          # Weekly industry insights cron
├── prisma/
│   └── schema.prisma            # DB models: User, Resume, CoverLetter, Assessment, IndustryInsight
├── hooks/
├── data/
├── middleware.js                # Clerk auth middleware
├── next.config.mjs              # Image domains, performance optimisations
├── tailwind.config.js
└── package.json
```

---

## Database Schema (Prisma)

Key models defined in `prisma/schema.prisma`:

- **User** — linked to Clerk (`clerkUserId`), stores profile, industry, bio, skills, experience
- **Resume** — one per user, markdown content, ATS score and feedback
- **CoverLetter** — many per user, targets a specific company/role
- **Assessment** — interview quiz results with AI improvement tip
- **IndustryInsight** — cached AI-generated industry data refreshed weekly; includes `salaryRanges`, `growthRate`, `demandLevel`, `topSkills`, `marketOutlook`, `keyTrends`, `recommendedSkills`

---

## Environment Variables

> **Security rule**: Never prefix secret keys with `NEXT_PUBLIC_`. Never commit `.env` or `.env.local` to version control.

Create a `.env.local` file in the project root (`matrix/`) and populate the following:

```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Clerk redirect paths
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/onboarding
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/onboarding

# Database (PostgreSQL / Neon)
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Google Gemini AI
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.0-flash          # optional; defaults used in lib/gemini.js

# Jobs API (optional — enables JSearch results)
JSEARCH_API_KEY=your_jsearch_api_key

# News (server-only — NEVER expose this as NEXT_PUBLIC_*)
NEWSAPI_KEY=your_newsapi_key
```

> `NEWSAPI_KEY` is consumed exclusively inside `app/api/news-feed/route.js` (a server route).
> It is **never** sent to the browser.

---

## News Feed Proxy

`GET /api/news-feed`

The app proxies all NewsAPI.org requests server-side so the API key is never exposed to the client.

### Query Parameters

| Param | Default | Description |
|---|---|---|
| `q` | `(developer OR "software engineer") AND (layoffs OR hiring OR "job market")` | NewsAPI search query |
| `pageSize` | `20` (max `50`) | Number of articles |

### Response Shape (200 OK)

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
      "publishedAt": "2025-11-17T12:00:00Z",
      "content": "..."
    }
  ]
}
```

Error responses return a JSON `{ "error": "..." }` body with an appropriate HTTP status (e.g. `502` when NewsAPI itself returns an error, `500` when the key is not configured).

### Cache Headers

```
Cache-Control: public, s-maxage=300, stale-while-revalidate=600
```

---

## Background Jobs (Inngest)

- **Function**: `generateIndustryInsights` (`lib/inngest/function.js`)
- **Schedule**: Every Sunday at midnight UTC (`cron: "0 0 * * 0"`)
- **What it does**: Fetches all stored industries from the DB, queries Gemini for up-to-date insights, and writes the results back to `IndustryInsight` records.

---

## Running Locally

### 1. Install dependencies

```powershell
npm install
```

### 2. Set up environment variables

Copy the template above into `matrix/.env.local` and fill in your real values. Do **not** commit this file.

### 3. Set up the database

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Start the dev server

```powershell
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. (Optional) Run Inngest locally

```powershell
npx inngest-cli@latest dev
```

---

## Testing the News Proxy

```powershell
# Default compound query
curl "http://localhost:3000/api/news-feed"

# Custom query with pagination
curl "http://localhost:3000/api/news-feed?q=AI+jobs&pageSize=5"
```

If you see a `500` error about a missing key, ensure `NEWSAPI_KEY` is set in `.env.local` and restart the dev server.

---

## Performance Optimisations (next.config.mjs)

- **Turbopack** enabled for both `dev` and `build`
- **Image optimisation**: AVIF + WebP formats, 7-day cache TTL, remote patterns whitelisted for Clerk and randomuser.me
- **Tree-shaking**: `optimizePackageImports` configured for Radix UI, `lucide-react`, `recharts`, and `motion`
- **Static asset caching**: 1-year `Cache-Control` header for fonts and images
- **Compression**: gzip/brotli enabled via `compress: true`

---

## Deployment Recommendations

- Use **Vercel** for zero-config Next.js deployment (set env vars in the Vercel dashboard — never in the repo).
- Use **Neon** (or any managed PostgreSQL) for the database.
- Register an **Inngest** account and connect via the Inngest dashboard for production cron scheduling.
- Set `NEWSAPI_KEY`, `GEMINI_API_KEY`, and all Clerk secrets only as server-side environment variables — do not prefix them with `NEXT_PUBLIC_`.
- Add pagination (`page` param) and a persistent server-side cache (e.g. Redis / Upstash) to the news proxy for high-traffic deployments.

---

## Security Checklist

- [ ] `.env` / `.env.local` is listed in `.gitignore` (already configured)
- [ ] No secret keys committed to the repository
- [ ] `NEWSAPI_KEY` used only inside a server route, never in client components
- [ ] Clerk `CLERK_SECRET_KEY` and `CLERK_WEBHOOK_SECRET` are server-only
- [ ] Incoming Inngest and Clerk webhook payloads are verified (Svix signature validation)
- [ ] `q` parameter in the news proxy should be length-validated before being forwarded

---

## Contributing

Open an issue to discuss major changes. Send PRs with clear descriptions. Keep secrets out of PR diffs.

---

## License

ISC
