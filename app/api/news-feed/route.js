import { NextResponse } from "next/server";

const NEWSAPI_BASE = "https://newsapi.org/v2/everything";

export async function GET(request) {
  try {
    const key = process.env.NEWSAPI_KEY;
    if (!key) {
      return NextResponse.json(
        { error: "Server error: NEWSAPI_KEY is not configured" },
        { status: 500 }
      );
    }

    const url = new URL(request.url);
    const q = url.searchParams.get("q") || '(developer OR "software engineer") AND (layoffs OR hiring OR "job market")';
    const pageSizeParam = parseInt(url.searchParams.get("pageSize") || "20", 10);
    const pageSize = Number.isFinite(pageSizeParam) ? Math.min(pageSizeParam, 50) : 20;

    const apiUrl = `${NEWSAPI_BASE}?q=${encodeURIComponent(q)}&language=en&pageSize=${pageSize}&sortBy=publishedAt`;

    const res = await fetch(apiUrl, {
      headers: {
        "X-Api-Key": key,
      },
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: "NewsAPI request failed", status: res.status, details: text },
        { status: 502 }
      );
    }

    const data = await res.json();
    if (data.status !== "ok") {
      return NextResponse.json({ error: "NewsAPI returned an error", details: data }, { status: 502 });
    }

    const articles = (data.articles || []).map((a) => ({
      source: a.source?.name || null,
      author: a.author || null,
      title: a.title || null,
      description: a.description || null,
      url: a.url || null,
      image: a.urlToImage || null,
      publishedAt: a.publishedAt || null,
      content: a.content || null,
    }));

    return NextResponse.json(
      { totalResults: data.totalResults || 0, articles },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=300, stale-while-revalidate=600",
        },
      }
    );
  } catch (err) {
    return NextResponse.json({ error: "Internal server error", message: err?.message || String(err) }, { status: 500 });
  }
}

// Keep POST/OPTIONS as simple handlers to avoid accidental 404s from other requests
export async function POST() {
  return NextResponse.json({ ok: true }, { status: 200 });
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      Allow: "GET, POST, OPTIONS",
    },
  });
}