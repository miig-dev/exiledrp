import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Fonction helper pour obtenir la session via l'API HTTP (compatible Edge)
async function getSessionFromCookies(request: NextRequest) {
  const cookieHeader = request.headers.get("cookie") || "";

  // Utiliser l'URL de la requête pour construire l'URL de l'API
  const url = new URL(request.url);
  const apiUrl = `${url.origin}/api/auth/session`;

  try {
    // Appel à l'API better-auth pour obtenir la session
    const response = await fetch(apiUrl, {
      method: "GET",
      headers: {
        cookie: cookieHeader,
      },
    });

    if (response.ok) {
      const data = await response.json();
      return data?.user || null;
    }
  } catch (error) {
    // En cas d'erreur, on considère qu'il n'y a pas de session
    // Cela évite de bloquer la requête si l'API n'est pas disponible
  }

  return null;
}

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
      const user = await getSessionFromCookies(request);

      if (!user) {
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }

      // Redirection selon rôle pour les routes IOS
      const roles = (user as { roles?: string[] }).roles || [];
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
