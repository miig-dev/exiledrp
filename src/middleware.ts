import { auth } from "@/lib/auth";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // Headers de sécurité (CSP, HSTS, etc.)
  response.headers.set(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline'; img-src 'self' data: https://cdn.discordapp.com; connect-src 'self'; font-src 'self' https://fonts.gstatic.com; frame-ancestors 'none';"
  );
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "geolocation=(), microphone=(), camera=()"
  );
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Protection des routes IOS
  if (request.nextUrl.pathname.startsWith("/ios")) {
    try {
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      if (!session?.user) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }

      // Redirection selon rôle pour les routes IOS
      const roles = (session.user as { roles?: string[] }).roles || [];
      const pathname = request.nextUrl.pathname;

      // Route Direction - uniquement direction
      if (pathname.startsWith("/ios/direction")) {
        if (!roles.some((r) => r.toLowerCase() === "direction")) {
          return NextResponse.redirect(new URL("/ios", request.url));
        }
      }

      // Route Gestion - gestion ou direction
      if (pathname.startsWith("/ios/gestion")) {
        if (
          !roles.some((r) => ["gestion", "direction"].includes(r.toLowerCase()))
        ) {
          return NextResponse.redirect(new URL("/ios", request.url));
        }
      }

      // Routes staff - staff, gestion ou direction
      if (
        pathname.startsWith("/ios/staff-center") &&
        !roles.some((r) =>
          ["staff", "gestion", "direction"].includes(r.toLowerCase())
        )
      ) {
        return NextResponse.redirect(new URL("/ios", request.url));
      }
    } catch (error) {
      console.error("Erreur middleware auth:", error);
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return response;
}

// Configuration des routes à protéger
export const config = {
  matcher: [
    // Routes protégées
    "/dashboard/:path*",
    "/ios/:path*",
    "/profile/:path*",
    "/staff/:path*",
    // Exclure les routes d'authentification et les assets
    "/((?!api/auth|auth/callback|auth/signin|_next/static|_next/image|favicon.ico).*)",
  ],
};
