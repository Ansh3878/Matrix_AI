import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server';

const isProtectedRoute = createRouteMatcher([
  "/dashboard(.*)",
  "/resume(.*)",
  "/ai-cover-letter(.*)",
  "/interview(.*)",
  "/onboarding(.*)",
]);

// Webhook routes must be public (Clerk calls them without auth)
const isPublicRoute = createRouteMatcher([
  "/api/webhooks(.*)",
]);


export default clerkMiddleware(async(auth,req) =>{
  // Skip auth for public routes (e.g. Clerk webhooks)
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  const {userId} = await auth()
  if(!userId && isProtectedRoute(req)){
    const {redirectToSignIn} = await auth()
    return redirectToSignIn()
  }


  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
}