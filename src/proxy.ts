import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// 1. Define the routes you want to PROTECT
// Notice that '/api/webhooks/clerk' is intentionally excluded from this list!
const isProtectedRoute = createRouteMatcher([
  '/dashboard(.*)',
  '/lunamatch(.*)',
  '/care-timeline(.*)',
  '/lunaroom(.*)',
  // If you build other APIs that require a logged-in user, add them here
  // e.g., '/api/appointments(.*)'
]);

export default clerkMiddleware(async (auth, req) => {
  // 2. If the incoming request matches a protected route, enforce authentication
  if (isProtectedRoute(req)) {
    await auth.protect();
  }
});

// 3. The Matcher Configuration (Tells Next.js which files the middleware should run on)
export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};