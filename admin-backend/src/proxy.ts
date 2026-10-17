import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Admin Backend Proxy (Next.js 16 replacement for middleware.ts)
 *
 * 1. CORS: strict allowlist — never reflect arbitrary origins with credentials.
 * 2. API gate: every /api/* call requires an ADMIN session, except routes that
 *    carry their own authentication (NextAuth endpoints, cron bearer secret).
 * 3. RBAC for /admin/* pages (login redirect / unauthorized page).
 * 4. Hardened security headers on every response.
 */

const PUBLIC_ADMIN_PAGES = ["/admin/login", "/admin/register", "/admin/unauthorized"]

// Routes that perform their own authentication inside the handler.
const SELF_AUTHENTICATED_API_PREFIXES = ["/api/auth", "/api/cron"]

const LEGACY_ADMIN_ROUTES = [
  "/products", "/orders", "/customers", "/marketing", "/invoices",
  "/insights", "/settings", "/apps", "/analytics",
]

const ALLOWED_ORIGINS = new Set(
  (process.env.ALLOWED_ORIGINS ||
    "http://localhost:3000,http://localhost:3001,https://smomo.shop,https://admin.smomo.shop")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean)
)

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

function applyCors(request: NextRequest, response: NextResponse): NextResponse {
  const origin = request.headers.get("origin")
  if (origin && ALLOWED_ORIGINS.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Requested-With")
    response.headers.set("Vary", "Origin")
  }
  return response
}

function jsonError(status: number, code: string, error: string) {
  return applySecurityHeaders(NextResponse.json({ success: false, code, error }, { status }))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ---------- 1. API routes ----------
  if (pathname.startsWith("/api")) {
    if (request.method === "OPTIONS") {
      return applySecurityHeaders(applyCors(request, new NextResponse(null, { status: 204 })))
    }

    const selfAuthenticated = SELF_AUTHENTICATED_API_PREFIXES.some((p) => pathname.startsWith(p))
    if (!selfAuthenticated) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (!token) {
        return applyCors(request, jsonError(401, "UNAUTHENTICATED", "Authentication required"))
      }
      if (token.role !== "ADMIN") {
        return applyCors(request, jsonError(403, "FORBIDDEN_ADMIN_REQUIRED", "Administrator privileges required"))
      }
    }

    return applySecurityHeaders(applyCors(request, NextResponse.next()))
  }

  // ---------- 2. Root & legacy redirects ----------
  if (pathname === "/") {
    return NextResponse.redirect(new URL("/admin", request.url))
  }

  for (const route of LEGACY_ADMIN_ROUTES) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return NextResponse.redirect(new URL(`/admin${pathname}`, request.url), 307)
    }
  }

  // ---------- 3. Admin pages RBAC ----------
  if (pathname.startsWith("/admin")) {
    const isPublicPage = PUBLIC_ADMIN_PAGES.includes(pathname)
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

    if (!isPublicPage) {
      if (!token) {
        const loginUrl = new URL("/admin/login", request.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
      if (token.role !== "ADMIN") {
        return NextResponse.redirect(new URL("/admin/unauthorized", request.url))
      }
    } else if (pathname !== "/admin/unauthorized" && token?.role === "ADMIN") {
      return NextResponse.redirect(new URL("/admin", request.url))
    }
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
