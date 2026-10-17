import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { getToken } from "next-auth/jwt"

/**
 * Storefront Proxy (Next.js 16 replacement for middleware.ts)
 *
 * 1. Redirect admin subdomains to the admin server.
 * 2. Customer authentication for /store/dashboard/*.
 * 3. Back-office APIs living in the storefront (abandoned carts, inventory,
 *    stats, users) are ADMIN-only — they expose customer PII and bulk actions.
 * 4. Product mutations are ADMIN-only; reads stay public.
 * 5. Security headers on every response.
 */

const ADMIN_ONLY_API_PREFIXES = ["/api/abandoned-carts", "/api/inventory", "/api/stats", "/api/users"]
const ADMIN_MUTATION_API_PREFIXES = ["/api/products"]
const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"])

function applySecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set("X-Frame-Options", "SAMEORIGIN")
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
  return response
}

function jsonError(status: number, code: string, error: string) {
  return applySecurityHeaders(NextResponse.json({ success: false, code, error }, { status }))
}

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = (request.headers.get("host") || "").split(":")[0].toLowerCase()

  // 1. Admin subdomains belong to the admin server
  if (hostname === "admin.smomo.shop" || hostname === "seller-area.smomo.shop") {
    const adminUrl = new URL(request.url)
    adminUrl.port = "3000"
    return NextResponse.redirect(adminUrl)
  }

  // 2. Back-office API protection
  if (pathname.startsWith("/api")) {
    const adminOnly =
      ADMIN_ONLY_API_PREFIXES.some((p) => pathname.startsWith(p)) ||
      (MUTATING_METHODS.has(request.method) &&
        ADMIN_MUTATION_API_PREFIXES.some((p) => pathname.startsWith(p)))

    if (adminOnly) {
      const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
      if (!token) return jsonError(401, "UNAUTHENTICATED", "Authentication required")
      if (token.role !== "ADMIN") return jsonError(403, "FORBIDDEN_ADMIN_REQUIRED", "Administrator privileges required")
    }
    return applySecurityHeaders(NextResponse.next())
  }

  // 3. Home page renders the store
  if (pathname === "/") {
    return applySecurityHeaders(NextResponse.rewrite(new URL("/store", request.url)))
  }

  // 4. Customer dashboard requires a session
  if (pathname.startsWith("/store/dashboard")) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const loginUrl = new URL("/store/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
  }

  return applySecurityHeaders(NextResponse.next())
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|uploads|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
