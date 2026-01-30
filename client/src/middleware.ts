import { getToken } from "next-auth/jwt";
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Korumalı rotalar (giriş yapmış kullanıcı gerektirir)
const protectedRoutes = ["/dashboard"];

// Auth rotaları (giriş yapmış kullanıcı erişemez)
const authRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

// Public rotalar (herkes erişebilir)
const publicRoutes = ["/", "/about", "/how-it-works", "/pricing"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // API ve static dosyaları atla
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/static") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // JWT token kontrolü
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthenticated = !!token;

  // 1. Kullanıcı giriş yapmış ve "/" rotasındaysa → /dashboard'a yönlendir
  if (isAuthenticated && pathname === "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 2. Kullanıcı giriş yapmış ve auth sayfalarına erişmeye çalışıyorsa → /dashboard'a yönlendir
  if (isAuthenticated && authRoutes.some((route) => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // 3. Kullanıcı giriş yapmamış ve korumalı sayfalara erişmeye çalışıyorsa → /login'e yönlendir
  if (!isAuthenticated && protectedRoutes.some((route) => pathname.startsWith(route))) {
    const callbackUrl = encodeURIComponent(pathname);
    return NextResponse.redirect(new URL(`/login?callbackUrl=${callbackUrl}`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!api|_next/static|_next/image|favicon.ico|public).*)",
  ],
};
