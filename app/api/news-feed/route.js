import { NextResponse } from "next/server";

// Handle POST requests to /news-feed (avoid 404s)
export async function POST(request) {
  // If your app sends a POST to this path, respond with a simple OK.
  // You can later extend this to process the request body.
  return NextResponse.json({ ok: true }, { status: 200 });
}

// Handle CORS preflight or generic OPTIONS (in case the browser issues one)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Allow": "GET, POST, OPTIONS",
    },
  });
}