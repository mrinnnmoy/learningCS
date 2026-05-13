import { NextRequest, NextResponse } from "next/server";

// Note: proxy.ts cannot import from src/ directly (runs before Next.js initialises).
// Redis calls are done via the raw REDIS_URL environment variable here.
// For rate limiting in proxy.ts we use a lightweight Redis REST approach or
// handle it at the Nginx layer. For this assignment we show the pattern
// using a simple in-memory fallback that works in both modes.

// In-memory rate limiter (for demo purposes — use Upstash Redis in production)
const ipRequestCounts = new Map<string, { count: number; resetAt: number }>();

function rateLimit(ip: string, maxRequests = 100, windowMs = 60_000): boolean {
  const now = Date.now();
  const data = ipRequestCounts.get(ip);

  if (!data || now > data.resetAt) {
    ipRequestCounts.set(ip, { count: 1, resetAt: now + windowMs });
    return false; // not rate limited
  }

  data.count++;
  if (data.count > maxRequests) return true; // rate limited
  return false;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rate limit API routes only
  if (pathname.startsWith("/api/") && pathname !== "/api/health") {
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
      request.headers.get("x-real-ip") ??
      "127.0.0.1";

    if (rateLimit(ip)) {
      return new NextResponse(
        JSON.stringify({ message: "Too many requests. Please slow down." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": "60",
          },
        },
      );
    }
  }

  // Protect /admin
  if (pathname.startsWith("/admin")) {
    const session = request.cookies.get("session");
    if (!session?.value) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("from", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/:path*"],
};
